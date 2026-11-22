<template>
  <div v-if="alerts.length" class="space-y-2">
    <UAlert
      v-for="a in alerts"
      :key="a.key"
      :color="a.color"
      variant="subtle"
      :icon="a.icon"
      :title="t(`Svitlo.states.${a.key}.title`)"
      :description="t(`Svitlo.states.${a.key}.text`)"
    />
  </div>
</template>

<script setup lang="ts">
import type { PublishedState } from '#shared/types/svitlo';

type AlertKey = 'emergency' | 'not_published' | 'empty' | 'stale' | 'disagree' | 'error';
type AlertColor = 'error' | 'warning' | 'info' | 'success' | 'neutral';

const props = withDefaults(
  defineProps<{
    state?: PublishedState | null;
    emergency?: boolean;
    stale?: boolean;
    sourcesAgree?: boolean | null;
    error?: boolean;
  }>(),
  { state: null, emergency: false, stale: false, sourcesAgree: null, error: false },
);

const { t } = useSvitloFormat();

const META: Record<AlertKey, { color: AlertColor; icon: string }> = {
  emergency: { color: 'error', icon: 'i-lucide-siren' },
  not_published: { color: 'info', icon: 'i-lucide-clock' },
  empty: { color: 'success', icon: 'i-lucide-lightbulb' },
  stale: { color: 'warning', icon: 'i-lucide-history' },
  disagree: { color: 'warning', icon: 'i-lucide-git-compare' },
  error: { color: 'error', icon: 'i-lucide-cloud-off' },
};

const alerts = computed(() => {
  const keys: AlertKey[] = [];
  if (props.error) keys.push('error');
  if (props.emergency || props.state === 'emergency') keys.push('emergency');
  if (props.state === 'not_published') keys.push('not_published');
  if (props.state === 'empty') keys.push('empty');
  if (props.stale) keys.push('stale');
  if (props.sourcesAgree === false) keys.push('disagree');
  return keys.map((key) => ({ key, ...META[key] }));
});
</script>
