<template>
  <section
    class="svitlo-hairline flex flex-col gap-5 bg-[var(--svitlo-surface)] p-5 sm:p-7"
    aria-labelledby="svitlo-hero-title"
  >
    <div class="flex items-center justify-between gap-3">
      <div class="flex min-w-0 flex-col">
        <span class="svitlo-eyebrow">{{ regionName }}</span>
        <span class="svitlo-display text-2xl leading-tight">{{ t('Svitlo.queue', { queue }) }}</span>
      </div>
      <slot name="aside" />
    </div>

    <div class="flex items-center gap-4">
      <div class="svitlo-cut flex size-16 shrink-0 items-center justify-center sm:size-20" :class="tileClass">
        <UIcon :name="icon" class="size-9 sm:size-10" aria-hidden="true" />
      </div>
      <h1 id="svitlo-hero-title" class="min-w-0" aria-live="polite">
        <span class="block text-[15px] text-[var(--svitlo-muted)]">{{ t('Svitlo.nowLead') }}</span>
        <span class="svitlo-display block text-[2.5rem] sm:text-6xl" :class="headClass">
          {{ t(`Svitlo.nowShort.${state.status}`) }}
        </span>
      </h1>
    </div>

    <div v-if="timer" class="flex flex-col gap-2.5 border-t border-[var(--svitlo-line)] pt-4">
      <span class="text-[15px] text-[var(--svitlo-muted)]">{{ timer.label }}</span>
      <p class="flex flex-wrap items-baseline gap-x-3 gap-y-1" aria-live="polite" aria-atomic="true">
        <span class="svitlo-display text-5xl tabular-nums sm:text-6xl">{{ timer.value }}</span>
        <span class="text-lg font-bold tabular-nums">{{ timer.at }}</span>
      </p>
      <div
        v-if="timer.pct !== null"
        role="progressbar"
        :aria-label="timer.label"
        :aria-valuenow="timer.pct"
        aria-valuemin="0"
        aria-valuemax="100"
        class="h-1 overflow-hidden rounded-full bg-[var(--svitlo-line)]"
      >
        <div class="h-1 bg-[var(--svitlo-accent)]" :style="{ width: `${timer.pct}%` }" />
      </div>
      <div v-if="timer.pct !== null" class="flex justify-between text-[13px] text-[var(--svitlo-muted)] tabular-nums">
        <span>{{ timer.from }}</span
        ><span>{{ timer.to }}</span>
      </div>
    </div>
    <p v-else-if="unknownText" class="border-t border-[var(--svitlo-line)] pt-4 font-semibold" aria-live="polite">
      {{ unknownText }}
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

const dayStart = computed(() => kyivLocalToDate(props.today.date, 0).getTime());

const intervals = computed(() => {
  const tomorrowKnown = props.tomorrow.publishedState !== 'not_published';
  return tomorrowKnown ? [...props.today.intervals, ...props.tomorrow.intervals] : props.today.intervals;
});

const state = computed(() => {
  if (props.today.publishedState === 'not_published') {
    return { status: 'unknown' as const, current: null, next: null };
  }
  const tomorrowKnown = props.tomorrow.publishedState !== 'not_published';
  const until = kyivLocalToDate(tomorrowKnown ? props.tomorrow.date : props.today.date, 1440).getTime();
  return nowState(intervals.value, props.now, dayStart.value, until);
});

const icon = computed(
  () =>
    ({
      on: 'i-lucide-lightbulb',
      off: 'i-lucide-zap-off',
      maybe: 'i-lucide-triangle-alert',
      unknown: 'i-lucide-circle-help',
    })[state.value.status],
);

const tileClass = computed(
  () =>
    ({
      on: 'bg-[var(--svitlo-on)] text-[var(--svitlo-on-fg)]',
      off: 'bg-[#3a3a3a] text-white',
      maybe: 'svitlo-slot-maybe text-[var(--svitlo-maybe-fg)]',
      unknown: 'svitlo-slot-unknown text-[var(--svitlo-unknown-fg)]',
    })[state.value.status],
);

const headClass = computed(() =>
  state.value.status === 'on' || state.value.status === 'maybe' ? 'text-[var(--svitlo-accent-ink)]' : '',
);

// When the current state began: start of the ongoing outage, else end of the last one.
const since = computed(() => {
  const s = state.value;
  if (s.current) return s.current.start;
  const ended = intervals.value.map((i) => Date.parse(i.end)).filter((e) => e <= props.now);
  return ended.length ? Math.max(...ended) : dayStart.value;
});

// Minute precision: the text (and the live region) changes at most once a minute.
const timer = computed(() => {
  const next = state.value.next;
  if (!next || next.status === 'unknown') return null;
  const minutes = Math.max(1, Math.ceil((next.at - props.now) / 60000));
  const span = next.at - since.value;
  const pct = span > 0 ? Math.min(100, Math.max(0, Math.round(((props.now - since.value) / span) * 100))) : null;
  return {
    label: t(`Svitlo.nextLabel.${next.status}`),
    value: duration(minutes),
    at: t('Svitlo.next.at', { time: hm(next.at, true) }),
    pct,
    from: hm(since.value),
    to: hm(next.at, true),
  };
});

const unknownText = computed(() => {
  const next = state.value.next;
  return next?.status === 'unknown' ? t('Svitlo.next.unknown', { time: hm(next.at, true) }) : '';
});
</script>
