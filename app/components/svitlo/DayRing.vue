<template>
  <figure class="mx-auto w-full max-w-[280px]">
    <svg viewBox="0 0 200 200" class="h-auto w-full" role="img" :aria-label="ariaLabel">
      <path
        v-for="seg in segments"
        :key="seg.i"
        :d="seg.d"
        :fill="seg.status === 'unknown' ? 'transparent' : `var(--svitlo-${seg.status})`"
        :fill-opacity="(seg.status === 'maybe' ? 0.6 : 1) * (seg.past ? 0.4 : 1)"
        stroke="var(--svitlo-bg)"
        stroke-width="0.6"
      >
        <title>{{ slotLabel(seg.i) }} — {{ t(`Svitlo.legend.${seg.status}`) }}</title>
      </path>
      <g
        class="fill-current text-muted"
        font-size="9"
        text-anchor="middle"
        dominant-baseline="middle"
        aria-hidden="true"
      >
        <text v-for="h in [0, 3, 6, 9, 12, 15, 18, 21]" :key="h" :x="label(h).x" :y="label(h).y">
          {{ String(h).padStart(2, '0') }}
        </text>
      </g>
      <g v-if="hand" aria-hidden="true">
        <line
          x1="100"
          y1="100"
          :x2="hand.x"
          :y2="hand.y"
          stroke="var(--svitlo-now)"
          stroke-width="2.5"
          stroke-linecap="round"
        />
        <circle cx="100" cy="100" r="4" fill="var(--svitlo-now)" />
      </g>
      <text
        x="100"
        y="128"
        text-anchor="middle"
        class="fill-current text-highlighted"
        font-size="11"
        font-weight="600"
        aria-hidden="true"
      >
        {{ centerText }}
      </text>
    </svg>
  </figure>
</template>

<script setup lang="ts">
import type { SlotStatus } from '#shared/types/svitlo';
import { kyivLocalToDate, slotLabel } from '#shared/utils/svitloSlots';

const props = withDefaults(
  defineProps<{
    day: { date: string; slots: SlotStatus[]; intervals: { start: string; end: string }[]; totalOffMinutes: number };
    now?: number | null;
  }>(),
  { now: null },
);

const { t, range, duration } = useSvitloFormat();

const R_OUT = 92;
const R_IN = 62;
const point = (angle: number, r: number) => ({
  x: 100 + r * Math.sin(angle),
  y: 100 - r * Math.cos(angle),
});

const segments = computed(() =>
  props.day.slots.map((status, i) => {
    const a0 = (i / 48) * 2 * Math.PI;
    const a1 = ((i + 1) / 48) * 2 * Math.PI;
    const p0 = point(a0, R_OUT);
    const p1 = point(a1, R_OUT);
    const q1 = point(a1, R_IN);
    const q0 = point(a0, R_IN);
    const f = (n: number) => n.toFixed(2);
    const d = `M${f(p0.x)},${f(p0.y)} A${R_OUT},${R_OUT} 0 0 1 ${f(p1.x)},${f(p1.y)} L${f(q1.x)},${f(q1.y)} A${R_IN},${R_IN} 0 0 0 ${f(q0.x)},${f(q0.y)} Z`;
    const end = kyivLocalToDate(props.day.date, (i + 1) * 30).getTime();
    return { i, status, d, past: props.now !== null && end <= props.now };
  }),
);

const label = (h: number) => point((h / 24) * 2 * Math.PI, 52);

const hand = computed(() => {
  if (props.now === null) return null;
  const start = kyivLocalToDate(props.day.date, 0).getTime();
  const end = kyivLocalToDate(props.day.date, 1440).getTime();
  if (props.now < start || props.now >= end) return null;
  return point(((props.now - start) / (end - start)) * 2 * Math.PI, R_IN - 6);
});

const centerText = computed(() => (props.day.totalOffMinutes ? `−${duration(props.day.totalOffMinutes)}` : ''));

const ariaLabel = computed(() =>
  t('Svitlo.timelineLabel', {
    date: props.day.date,
    summary: props.day.intervals.length ? props.day.intervals.map((i) => range(i)).join(', ') : t('Svitlo.summaryNone'),
  }),
);
</script>
