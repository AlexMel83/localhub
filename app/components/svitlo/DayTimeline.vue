<template>
  <figure class="w-full">
    <div class="relative" role="img" :aria-label="ariaLabel">
      <div
        class="grid h-11 overflow-hidden rounded-lg ring-1 ring-default"
        :style="{ gridTemplateColumns: 'repeat(48, minmax(0, 1fr))' }"
      >
        <div
          v-for="(status, i) in day.slots"
          :key="i"
          :class="[
            'h-full',
            status === 'maybe' && 'svitlo-maybe-pattern',
            i % 2 === 1 && i < 47 && 'border-r border-white/40 dark:border-black/30',
          ]"
          :style="status === 'maybe' ? undefined : { background: `var(--svitlo-${status})` }"
          :title="`${slotLabel(i)} — ${t(`Svitlo.legend.${status}`)}`"
        />
      </div>
      <div
        v-if="nowFraction !== null"
        class="pointer-events-none absolute -top-1.5 -bottom-1.5 w-0.5 rounded bg-[var(--svitlo-now)] shadow"
        :style="{ left: `calc(${(nowFraction * 100).toFixed(2)}% - 1px)` }"
        aria-hidden="true"
      >
        <span
          class="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-[var(--svitlo-now)] px-1 text-[10px] font-semibold leading-4 text-white dark:text-slate-900"
        >
          {{ hm(now!) }}
        </span>
      </div>
    </div>
    <div class="relative mt-1 h-4 text-[11px] text-muted tabular-nums" aria-hidden="true">
      <span
        v-for="h in [0, 3, 6, 9, 12, 15, 18, 21, 24]"
        :key="h"
        class="absolute -translate-x-1/2"
        :class="{ 'translate-x-0': h === 0, '-translate-x-full': h === 24 }"
        :style="{ left: `${(h / 24) * 100}%` }"
        >{{ String(h).padStart(2, '0') }}</span
      >
    </div>
    <figcaption v-if="legend" class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
      <span v-for="s in legendItems" :key="s" class="inline-flex items-center gap-1.5">
        <span
          class="inline-block size-3 rounded-sm ring-1 ring-default"
          :class="s === 'maybe' && 'svitlo-maybe-pattern'"
          :style="s === 'maybe' ? undefined : { background: `var(--svitlo-${s})` }"
        />
        {{ t(`Svitlo.legend.${s}`) }}
      </span>
    </figcaption>
  </figure>
</template>

<script setup lang="ts">
import type { SlotStatus } from '#shared/types/svitlo';
import { kyivLocalToDate, slotLabel } from '#shared/utils/svitloSlots';

const props = withDefaults(
  defineProps<{
    day: { date: string; slots: SlotStatus[]; intervals: { start: string; end: string }[] };
    now?: number | null;
    legend?: boolean;
  }>(),
  { now: null, legend: true },
);

const { t, hm, range } = useSvitloFormat();

const nowFraction = computed(() => {
  if (props.now === null) return null;
  const start = kyivLocalToDate(props.day.date, 0).getTime();
  const end = kyivLocalToDate(props.day.date, 1440).getTime();
  if (props.now < start || props.now >= end) return null;
  return (props.now - start) / (end - start);
});

const legendItems = computed(() => {
  const present = new Set(props.day.slots);
  return (['on', 'off', 'maybe', 'unknown'] as const).filter((s) => present.has(s));
});

const ariaLabel = computed(() => {
  const summary = props.day.intervals.length
    ? props.day.intervals.map((i) => range(i)).join(', ')
    : t('Svitlo.summaryNone');
  return t('Svitlo.timelineLabel', { date: props.day.date, summary });
});
</script>
