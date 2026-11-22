<template>
  <figure class="w-full">
    <div class="svitlo-card flex flex-col gap-5 px-3 pt-8 pb-4 sm:px-6" role="img" :aria-label="ariaLabel">
      <div v-for="row in rows" :key="row.key" :class="row.cls" aria-hidden="true">
        <div class="relative">
          <div
            class="grid h-11 gap-0.5 sm:h-16"
            :style="{ gridTemplateColumns: `repeat(${row.slots.length}, minmax(0, 1fr))` }"
          >
            <div
              v-for="s in row.slots"
              :key="s.i"
              :class="`svitlo-slot-${s.status}`"
              :style="s.past ? { opacity: 0.4 } : undefined"
              :title="`${slotLabel(s.i)} – ${t(`Svitlo.legend.${s.status}`)}`"
            />
          </div>
          <template v-if="row.now !== null">
            <div
              class="pointer-events-none absolute -top-2.5 -bottom-1.5 w-0.5 bg-[var(--svitlo-now)]"
              :style="{ left: `calc(${row.now}% - 1px)` }"
            />
            <span
              class="pointer-events-none absolute -top-8 -translate-x-1/2 bg-[var(--svitlo-now)] px-1.5 text-[11px] leading-5 font-bold whitespace-nowrap text-[var(--svitlo-now-fg)] tabular-nums"
              :style="{ left: `${row.now}%` }"
            >
              {{ hm(now!) }}
            </span>
          </template>
        </div>
        <div class="mt-1.5 flex justify-between text-xs text-[var(--svitlo-muted)] tabular-nums">
          <span v-for="h in row.hours" :key="h">{{ String(h).padStart(2, '0') }}</span>
        </div>
      </div>
    </div>
    <figcaption v-if="legend" class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-[var(--svitlo-muted)]">
      <span v-for="s in legendItems" :key="s" class="inline-flex items-center gap-2">
        <span class="inline-block size-4" :class="`svitlo-slot-${s}`" aria-hidden="true" />
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

// Phones get two 12-hour rows (bigger segments), wider screens one 24-hour row.
const rows = computed(() => {
  const f = nowFraction.value;
  const slots = props.day.slots.map((status, i) => ({ i, status, past: f !== null && (i + 1) / 48 <= f }));
  const make = (key: string, from: number, to: number, hours: number[], cls: string) => {
    const a = from / 48;
    const b = to / 48;
    const now = f !== null && f >= a && f < b ? Number((((f - a) / (b - a)) * 100).toFixed(2)) : null;
    return { key, slots: slots.slice(from, to), hours, cls, now };
  };
  return [
    make('am', 0, 24, [0, 3, 6, 9, 12], 'sm:hidden'),
    make('pm', 24, 48, [12, 15, 18, 21, 24], 'sm:hidden'),
    make('day', 0, 48, [0, 3, 6, 9, 12, 15, 18, 21, 24], 'hidden sm:block'),
  ];
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
