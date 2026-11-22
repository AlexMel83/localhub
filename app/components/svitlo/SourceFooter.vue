<template>
  <footer class="space-y-2 border-t border-[var(--svitlo-line)] pt-4 text-sm text-[var(--svitlo-muted)]">
    <p>
      {{ t('Svitlo.source.label') }}:
      <a
        :href="source.url"
        target="_blank"
        rel="noopener"
        class="font-medium text-primary underline-offset-2 hover:underline"
        >{{ source.name }}</a
      >
      <template v-if="updatedAt"> · {{ t('Svitlo.source.updated', { time: dateTime(updatedAt) }) }}</template>
      <template v-if="checkedAt"> · {{ t('Svitlo.source.checked', { time: dateTime(checkedAt) }) }}</template>
    </p>
    <p class="flex items-start gap-2">
      <UIcon name="i-lucide-info" class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{{ t('Svitlo.source.disclaimer') }}</span>
    </p>
    <p class="flex flex-wrap gap-x-4 gap-y-1">
      <a
        v-if="officialUrl"
        :href="officialUrl"
        target="_blank"
        rel="noopener"
        class="inline-flex min-h-11 items-center gap-1 text-primary hover:underline"
      >
        <UIcon name="i-lucide-external-link" class="size-4" aria-hidden="true" />{{ t('Svitlo.source.official') }}
      </a>
      <a
        :href="alertsUrl"
        target="_blank"
        rel="noopener"
        class="inline-flex min-h-11 items-center gap-1 text-primary hover:underline"
      >
        <UIcon name="i-lucide-external-link" class="size-4" aria-hidden="true" />{{ t('Svitlo.source.compare') }}
      </a>
    </p>
  </footer>
</template>

<script setup lang="ts">
import type { SourceInfo } from '#shared/types/svitlo';

const props = withDefaults(
  defineProps<{
    source: SourceInfo;
    officialUrl?: string | null;
    region: string;
    updatedAt?: string | null;
    checkedAt?: string | null;
  }>(),
  { officialUrl: null, updatedAt: null, checkedAt: null },
);

const { t, dateTime } = useSvitloFormat();
// Region slugs match alerts.energy public page paths (linking only, no data use).
const alertsUrl = computed(() => `https://alerts.energy/${props.region}`);
</script>
