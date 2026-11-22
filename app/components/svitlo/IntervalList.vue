<template>
  <section :aria-label="t('Svitlo.intervals.title')" class="flex flex-col gap-4">
    <dl class="grid grid-cols-2 gap-2 sm:grid-cols-3">
      <div class="svitlo-card px-4 py-3">
        <dt class="svitlo-eyebrow !text-[var(--svitlo-muted)]">{{ t('Svitlo.totals.off') }}</dt>
        <dd class="svitlo-display mt-1 text-4xl tabular-nums">{{ duration(day.totalOffMinutes) }}</dd>
      </div>
      <div class="svitlo-card px-4 py-3">
        <dt class="svitlo-eyebrow !text-[var(--svitlo-muted)]">{{ t('Svitlo.totals.on') }}</dt>
        <dd class="svitlo-display mt-1 text-4xl text-[var(--svitlo-accent-ink)] tabular-nums">
          {{ duration(onMinutes) }}
        </dd>
      </div>
      <div v-if="day.totalMaybeMinutes" class="svitlo-card px-4 py-3">
        <dt class="svitlo-eyebrow !text-[var(--svitlo-muted)]">{{ t('Svitlo.totals.maybe') }}</dt>
        <dd class="svitlo-display mt-1 text-4xl tabular-nums">{{ duration(day.totalMaybeMinutes) }}</dd>
      </div>
    </dl>

    <div v-if="day.intervals.length" class="flex flex-col gap-2">
      <h3 class="svitlo-eyebrow">{{ t('Svitlo.intervals.title') }}</h3>
      <ul class="flex flex-col gap-2">
        <li
          v-for="item in items"
          :key="item.start"
          class="flex min-h-16 flex-wrap items-center justify-between gap-x-3 gap-y-2 border p-4"
          :class="
            item.finished
              ? 'border-[var(--svitlo-line)]'
              : 'border-[var(--svitlo-line-strong)] bg-[var(--svitlo-surface)]'
          "
        >
          <div class="flex min-w-0 items-center gap-3">
            <UIcon
              :name="item.status === 'maybe' ? 'i-lucide-triangle-alert' : 'i-lucide-zap-off'"
              class="size-5 shrink-0"
              :class="item.finished ? 'text-[var(--svitlo-muted)]' : ''"
              aria-hidden="true"
            />
            <div class="flex min-w-0 flex-col">
              <span
                class="svitlo-display text-[1.75rem] whitespace-nowrap tabular-nums sm:text-3xl"
                :class="item.finished && 'text-[var(--svitlo-muted)] line-through decoration-1'"
                >{{ range(item) }}</span
              >
              <span class="text-sm text-[var(--svitlo-muted)]"
                >{{ duration(item.minutes) }} ·
                {{ item.status === 'maybe' ? t('Svitlo.intervals.maybe') : t('Svitlo.intervals.off') }}</span
              >
            </div>
          </div>
          <span
            v-if="item.ongoing || item.next"
            class="svitlo-cut-sm shrink-0 bg-[var(--svitlo-accent)] px-3 py-1.5 text-xs font-bold tracking-wide text-black uppercase"
          >
            {{ item.ongoing ? t('Svitlo.intervals.ongoing') : t('Svitlo.intervals.next') }}
          </span>
          <span
            v-else-if="item.finished"
            class="inline-flex shrink-0 items-center gap-1.5 text-[13px] text-[var(--svitlo-muted)]"
          >
            <UIcon name="i-lucide-check" class="size-4" aria-hidden="true" />{{ t('Svitlo.intervals.finished') }}
          </span>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { QueueDayView } from '#shared/types/svitlo';
import { kyivLocalToDate } from '#shared/utils/svitloSlots';

const props = withDefaults(defineProps<{ day: QueueDayView; now?: number | null }>(), { now: null });
const { t, range, duration } = useSvitloFormat();

const items = computed(() => {
  const now = props.now;
  const list = props.day.intervals.map((i) => {
    const start = Date.parse(i.start);
    const end = Date.parse(i.end);
    return {
      ...i,
      startMs: start,
      finished: now !== null && end <= now,
      ongoing: now !== null && start <= now && now < end,
      next: false,
    };
  });
  // Mark the first upcoming outage, unless one is already in progress.
  if (now !== null && !list.some((i) => i.ongoing)) {
    const upcoming = list.find((i) => i.startMs > now);
    if (upcoming) upcoming.next = true;
  }
  return list;
});

const onMinutes = computed(() => {
  const dayMinutes =
    (kyivLocalToDate(props.day.date, 1440).getTime() - kyivLocalToDate(props.day.date, 0).getTime()) / 60000;
  const unknown = props.day.slots.filter((s) => s === 'unknown').length * 30;
  return Math.max(0, dayMinutes - props.day.totalOffMinutes - props.day.totalMaybeMinutes - unknown);
});
</script>
