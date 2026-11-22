<template>
  <details class="group border-y border-[var(--svitlo-line)]" :open="open">
    <summary class="flex min-h-14 cursor-pointer list-none items-center justify-between gap-2 py-2 font-bold">
      <span class="inline-flex items-center gap-2">
        <UIcon name="i-lucide-history" class="size-5" aria-hidden="true" />
        {{ t('Svitlo.changes.title') }}
        <UBadge v-if="items.length" size="sm" variant="subtle" color="neutral">{{ items.length }}</UBadge>
      </span>
      <UIcon
        name="i-lucide-chevron-down"
        class="size-5 transition-transform group-open:rotate-180"
        aria-hidden="true"
      />
    </summary>
    <div class="pb-4">
      <p v-if="!items.length" class="text-sm text-muted">{{ t('Svitlo.changes.empty') }}</p>
      <ol v-else class="space-y-2.5 text-[15px]">
        <li v-for="(c, idx) in items" :key="idx" class="flex flex-wrap items-baseline gap-x-2">
          <time class="font-semibold tabular-nums" :datetime="c.changedAt ?? undefined">{{
            c.changedAt ? hm(c.changedAt) : ''
          }}</time>
          <span v-if="showQueue" class="font-medium">{{ t('Svitlo.queue', { queue: c.queue }) }}:</span>
          <span v-if="c.kind === 'published'" class="text-muted">{{ t('Svitlo.changes.published') }}</span>
          <span v-for="a in c.added" :key="`a${a.start}`" class="text-error"
            >+ {{ t('Svitlo.changes.added', { range: range(a) }) }}</span
          >
          <span v-for="r in c.removed" :key="`r${r.start}`" class="text-success"
            >− {{ t('Svitlo.changes.removed', { range: range(r) }) }}</span
          >
        </li>
      </ol>
    </div>
  </details>
</template>

<script setup lang="ts">
import type { ScheduleChange } from '#shared/types/svitlo';

const props = withDefaults(defineProps<{ changes: ScheduleChange[]; queue?: string | null; open?: boolean }>(), {
  queue: null,
  open: false,
});
const { t, hm, range } = useSvitloFormat();

const showQueue = computed(() => !props.queue);
const items = computed(() =>
  (props.queue ? props.changes.filter((c) => c.queue === props.queue) : props.changes).filter(
    (c) => c.kind === 'updated' || props.queue,
  ),
);
</script>
