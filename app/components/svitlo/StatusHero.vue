<template>
  <section
    class="rounded-2xl p-5 shadow-sm ring-1 ring-black/5 sm:p-6"
    :class="state.status === 'maybe' && 'svitlo-maybe-pattern'"
    :style="
      state.status === 'maybe'
        ? { color: 'var(--svitlo-maybe-fg)' }
        : { background: `var(--svitlo-${state.status})`, color: `var(--svitlo-${state.status}-fg)` }
    "
    aria-labelledby="svitlo-hero-title"
  >
    <p class="text-sm font-medium opacity-90">{{ t('Svitlo.queue', { queue }) }} · {{ regionName }}</p>
    <div class="mt-2 flex items-start gap-3">
      <UIcon :name="icon" class="mt-0.5 size-9 shrink-0 sm:size-10" aria-hidden="true" />
      <h1 id="svitlo-hero-title" class="text-2xl leading-tight font-bold sm:text-3xl" aria-live="polite">
        {{ t(`Svitlo.now.${state.status}`) }}
      </h1>
    </div>
    <p v-if="nextText" class="mt-3 text-lg font-semibold tabular-nums sm:text-xl" aria-live="polite" aria-atomic="true">
      {{ nextText }}
    </p>
    <slot />
  </section>
</template>

<script setup lang="ts">
import type { QueueDayView } from '#shared/types/svitlo';
import { kyivLocalToDate } from '#shared/utils/svitloSlots';
import { nowState } from '#shared/utils/svitloTime';

const props = defineProps<{
  queue: string;
  regionName: string;
  today: QueueDayView;
  tomorrow: QueueDayView;
  now: number;
}>();

const { t, hm, duration } = useSvitloFormat();

const state = computed(() => {
  const start = kyivLocalToDate(props.today.date, 0).getTime();
  if (props.today.publishedState === 'not_published') {
    return { status: 'unknown' as const, current: null, next: null };
  }
  const tomorrowKnown = props.tomorrow.publishedState !== 'not_published';
  const until = kyivLocalToDate(tomorrowKnown ? props.tomorrow.date : props.today.date, 1440).getTime();
  const intervals = tomorrowKnown ? [...props.today.intervals, ...props.tomorrow.intervals] : props.today.intervals;
  return nowState(intervals, props.now, start, until);
});

const icon = computed(
  () =>
    ({
      on: 'i-lucide-lightbulb',
      off: 'i-lucide-lightbulb-off',
      maybe: 'i-lucide-triangle-alert',
      unknown: 'i-lucide-circle-help',
    })[state.value.status],
);

// Minute precision: the text (and the live region) changes at most once a minute.
const nextText = computed(() => {
  const next = state.value.next;
  if (!next) return '';
  const time = hm(next.at, true);
  if (next.status === 'unknown') return t('Svitlo.next.unknown', { time });
  const minutes = Math.max(1, Math.ceil((next.at - props.now) / 60000));
  return `${t(`Svitlo.next.${next.status}`, { in: duration(minutes) })} (${t('Svitlo.next.at', { time })})`;
});
</script>
