<template>
  <section class="space-y-4">
    <UFormField :label="t('Svitlo.picker.region')" name="svitlo-region">
      <USelectMenu
        :model-value="regionItem"
        :items="regionItems"
        class="w-full sm:w-80"
        size="lg"
        :search-input="{ placeholder: t('Svitlo.picker.region') }"
        @update:model-value="onRegion"
      />
    </UFormField>

    <div v-if="queues.length">
      <h2 class="mb-2 text-base font-semibold">{{ t('Svitlo.picker.queue') }}</h2>
      <ul class="grid grid-cols-4 gap-2 sm:grid-cols-6">
        <li v-for="q in queues" :key="q">
          <UButton
            :to="localePath(`/svitlo-cherga/${region}/${queueToParam(q)}`)"
            block
            size="lg"
            class="min-h-11 justify-center tabular-nums"
            :color="q === current ? 'primary' : 'neutral'"
            :variant="q === current ? 'solid' : 'outline'"
            :aria-current="q === current ? 'page' : undefined"
          >
            {{ q }}
          </UButton>
        </li>
      </ul>
    </div>
    <p v-else class="text-sm text-muted">{{ t('Svitlo.picker.noQueues') }}</p>
  </section>
</template>

<script setup lang="ts">
import type { RegionInfo } from '#shared/types/svitlo';
import { queueToParam } from '#shared/utils/svitloTime';

const props = withDefaults(defineProps<{ regions: RegionInfo[]; region: string; current?: string | null }>(), {
  current: null,
});

const { t, regionName } = useSvitloFormat();
const localePath = useLocalePath();

const regionItems = computed(() => props.regions.map((r) => ({ label: regionName(r), value: r.slug })));
const regionItem = computed(() => regionItems.value.find((i) => i.value === props.region));
const queues = computed(() => props.regions.find((r) => r.slug === props.region)?.queues ?? []);

function onRegion(item: { value: string } | undefined) {
  if (item && item.value !== props.region) navigateTo(localePath(`/svitlo-cherga/${item.value}`));
}
</script>
