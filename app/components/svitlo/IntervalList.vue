<template>
  <section :aria-label="t('Svitlo.intervals.title')">
    <ul v-if="day.intervals.length" class="divide-y divide-default">
      <li
        v-for="item in items"
        :key="item.start"
        class="flex min-h-11 items-center gap-3 py-2"
        :class="item.finished && 'opacity-60'"
      >
        <UIcon
          :name="item.status === 'maybe' ? 'i-lucide-triangle-alert' : 'i-lucide-lightbulb-off'"
          class="size-5 shrink-0"
          :class="item.status === 'maybe' ? 'text-warning' : 'text-highlighted'"
          aria-hidden="true"
        />
        <span class="text-base font-semibold tabular-nums">{{ range(item) }}</span>
        <span class="text-sm text-muted">{{ duration(item.minutes) }}</span>
        <UBadge
          v-if="item.ongoing || item.finished || item.status === 'maybe'"
          class="ms-auto"
          size="sm"
          variant="subtle"
          :color="item.ongoing ? 'error' : item.status === 'maybe' ? 'warning' : 'neutral'"
        >
          {{
            item.ongoing
              ? t('Svitlo.intervals.ongoing')
              : item.finished
                ? t('Svitlo.intervals.finished')
                : t('Svitlo.intervals.maybe')
          }}
        </UBadge>
      </li>
    </ul>
    <dl class="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
      <div class="rounded-lg bg-elevated px-3 py-2">
        <dt class="text-muted">{{ t('Svitlo.totals.off') }}</dt>
        <dd class="text-lg font-bold tabular-nums">{{ duration(day.totalOffMinutes) }}</dd>
      </div>
      <div class="rounded-lg bg-elevated px-3 py-2">
        <dt class="text-muted">{{ t('Svitlo.totals.on') }}</dt>
        <dd class="text-lg font-bold tabular-nums">{{ duration(onMinutes) }}</dd>
      </div>
      <div v-if="day.totalMaybeMinutes" class="rounded-lg bg-elevated px-3 py-2">
        <dt class="text-muted">{{ t('Svitlo.totals.maybe') }}</dt>
        <dd class="text-lg font-bold tabular-nums">{{ duration(day.totalMaybeMinutes) }}</dd>
      </div>
    </dl>
  </section>
</template>

<script setup lang="ts">
import type { QueueDayView } from '#shared/types/svitlo';
import { kyivLocalToDate } from '#shared/utils/svitloSlots';

const props = withDefaults(defineProps<{ day: QueueDayView; now?: number | null }>(), { now: null });
const { t, range, duration } = useSvitloFormat();

const items = computed(() =>
  props.day.intervals.map((i) => {
    const start = Date.parse(i.start);
    const end = Date.parse(i.end);
    const now = props.now;
    return {
      ...i,
      finished: now !== null && end <= now,
      ongoing: now !== null && start <= now && now < end,
    };
  }),
);

const onMinutes = computed(() => {
  const dayMinutes =
    (kyivLocalToDate(props.day.date, 1440).getTime() - kyivLocalToDate(props.day.date, 0).getTime()) / 60000;
  const unknown = props.day.slots.filter((s) => s === 'unknown').length * 30;
  return Math.max(0, dayMinutes - props.day.totalOffMinutes - props.day.totalMaybeMinutes - unknown);
});
</script>
