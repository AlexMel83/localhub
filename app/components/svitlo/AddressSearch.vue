<template>
  <section class="space-y-3" aria-labelledby="svitlo-address-title">
    <h2 id="svitlo-address-title" class="flex items-center gap-2 text-base font-semibold">
      <UIcon name="i-lucide-map-pin" class="size-5" aria-hidden="true" />
      {{ t('Svitlo.address.title') }}
    </h2>

    <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,0.7fr)] sm:items-end">
      <UFormField :label="t('Svitlo.address.settlement')" name="svitlo-settlement">
        <UInputMenu
          v-model="settlement"
          v-model:search-term="settlementTerm"
          :items="settlementItems"
          :loading="settlementLoading"
          ignore-filter
          open-on-focus
          size="lg"
          class="w-full"
          icon="i-lucide-building-2"
          :placeholder="t('Svitlo.address.settlementPlaceholder')"
        >
          <template #empty>{{ emptyText(settlementTerm, settlementLoading) }}</template>
        </UInputMenu>
      </UFormField>

      <UFormField :label="t('Svitlo.address.streetLabel')" name="svitlo-street">
        <UInputMenu
          v-model="street"
          v-model:search-term="streetTerm"
          :items="streetItems"
          :loading="streetLoading"
          :disabled="!settlement"
          ignore-filter
          open-on-focus
          size="lg"
          class="w-full"
          icon="i-lucide-signpost"
          :placeholder="settlement ? t('Svitlo.address.streetPlaceholder') : t('Svitlo.address.pickSettlementFirst')"
        >
          <template #empty>{{ emptyText(streetTerm, streetLoading, 1) }}</template>
        </UInputMenu>
      </UFormField>

      <UFormField :label="t('Svitlo.address.house')" name="svitlo-house">
        <UInputMenu
          v-model="house"
          :items="houseItems"
          :loading="houseLoading"
          :disabled="!street"
          open-on-focus
          size="lg"
          class="w-full"
          icon="i-lucide-house"
          :placeholder="street ? t('Svitlo.address.housePlaceholder') : '—'"
        >
          <template #empty>{{ t('Svitlo.address.noHouse') }}</template>
        </UInputMenu>
      </UFormField>
    </div>

    <div aria-live="polite">
      <UAlert
        v-if="failed"
        color="warning"
        variant="subtle"
        icon="i-lucide-cloud-off"
        :title="t('Svitlo.address.unavailable')"
      >
        <template #description>
          <a :href="officialUrl" target="_blank" rel="noopener" class="underline">{{ t('Svitlo.address.official') }}</a>
        </template>
      </UAlert>

      <div v-else-if="lookup && street" class="rounded-xl p-3 ring-1 ring-default">
        <p class="font-medium">
          {{ lookup.settlement }}, {{ lookup.street }}<template v-if="lookup.house">, {{ lookup.house }}</template>
        </p>
        <p v-if="!lookup.house" class="mt-1 text-sm text-muted">
          {{ t('Svitlo.address.streetQueues', { queues: lookup.queues.join(', ') }) }}
          {{ lookup.queues.length > 1 ? t('Svitlo.address.hint') : '' }}
        </p>
        <div v-if="lookup.house || lookup.queues.length === 1" class="mt-2 flex flex-wrap gap-2">
          <UButton
            v-for="q in lookup.queues"
            :key="q"
            :to="localePath(`/svitlo-cherga/${region}/${queueToParam(q)}`)"
            size="lg"
            class="min-h-11 tabular-nums"
            trailing-icon="i-lucide-arrow-right"
            @click="onPick(q)"
          >
            {{ t('Svitlo.queue', { queue: q }) }}
          </UButton>
        </div>
        <p v-if="lookup.house && lookup.queues.length > 1" class="mt-2 text-xs text-warning">
          {{ t('Svitlo.address.multiple') }}
        </p>
        <p v-if="lookup.fileDate" class="mt-1 text-xs text-muted">
          {{ t('Svitlo.address.fileDate', { date: lookup.fileDate }) }}
        </p>
      </div>

      <p class="mt-2 text-xs text-muted">
        {{ t('Svitlo.address.notListed') }}
        <a :href="officialUrl" target="_blank" rel="noopener" class="text-primary underline">{{
          t('Svitlo.address.official')
        }}</a>
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { HouseLookup, SettlementOption } from '#shared/types/svitlo';
import { queueToParam } from '#shared/utils/svitloTime';

interface Item {
  label: string;
  description?: string;
  value: string;
}

const props = defineProps<{ region: string; defaultSettlement?: string; officialUrl: string }>();

const { t } = useSvitloFormat();
const localePath = useLocalePath();
const { save } = useSvitloSavedQueue();
const api = (path: string) => `/api/svitlo/${props.region}/${path}`;

const failed = ref(false);

// Settlement: server-side search as the user types.
const settlement = ref<Item | undefined>();
const settlementTerm = ref('');
const settlementItems = ref<Item[]>([]);
const settlementLoading = ref(false);

async function loadSettlements(q: string) {
  if (q.trim().length < 2) {
    settlementItems.value = settlement.value ? [settlement.value] : [];
    return;
  }
  settlementLoading.value = true;
  try {
    const rows = await $fetch<SettlementOption[]>(api('settlements'), { query: { q } });
    settlementItems.value = rows.map((r) => ({
      label: r.settlement,
      description: r.rem,
      value: `${r.settlement}|${r.rem}`,
    }));
    failed.value = false;
  } catch {
    failed.value = true;
  } finally {
    settlementLoading.value = false;
  }
}
watchDebounced(
  settlementTerm,
  (q) => {
    if (q !== settlement.value?.label) loadSettlements(q);
  },
  { debounce: 250 },
);

// Street: server-side search within the chosen settlement.
const street = ref<Item | undefined>();
const streetTerm = ref('');
const streetItems = ref<Item[]>([]);
const streetLoading = ref(false);

function settlementParts() {
  const [name, rem] = (settlement.value?.value ?? '').split('|');
  return { settlement: name, rem };
}

async function loadStreets(q: string) {
  if (!settlement.value) return;
  streetLoading.value = true;
  try {
    const rows = await $fetch<string[]>(api('streets'), { query: { ...settlementParts(), q } });
    streetItems.value = rows.map((s) => ({ label: s, value: s }));
    failed.value = false;
  } catch {
    failed.value = true;
  } finally {
    streetLoading.value = false;
  }
}
watchDebounced(
  streetTerm,
  (q) => {
    if (q !== street.value?.label) loadStreets(q);
  },
  { debounce: 250 },
);

// House: the street's full list is small, so it is filtered on the client.
const house = ref<Item | undefined>();
const houseItems = ref<Item[]>([]);
const houseLoading = ref(false);
const lookup = ref<HouseLookup | null>(null);

async function loadHouse(houseValue?: string) {
  if (!settlement.value || !street.value) return;
  houseLoading.value = true;
  try {
    const res = await $fetch<HouseLookup>(api('house'), {
      query: { ...settlementParts(), street: street.value.value, house: houseValue },
    });
    if (!houseValue) houseItems.value = res.houses.map((h) => ({ label: h, value: h }));
    lookup.value = res;
    failed.value = false;
  } catch {
    failed.value = true;
  } finally {
    houseLoading.value = false;
  }
}

watch(settlement, () => {
  street.value = undefined;
  streetTerm.value = '';
  streetItems.value = [];
  if (settlement.value) loadStreets('');
});
watch(street, () => {
  house.value = undefined;
  houseItems.value = [];
  lookup.value = null;
  if (street.value) loadHouse();
});
watch(house, () => {
  if (house.value) loadHouse(house.value.value);
});

function onPick(queue: string) {
  // Remember the queue only when the address points to exactly one.
  if (lookup.value?.house && lookup.value.queues.length === 1) save(props.region, queue);
}

function emptyText(term: string, loading: boolean, min = 2) {
  if (loading) return t('Svitlo.address.loading');
  return term.trim().length < min ? t('Svitlo.address.typeMore', { n: min }) : t('Svitlo.address.none');
}

// Preselect the default settlement (e.g. Старокостянтинів) on the client.
onMounted(async () => {
  if (!props.defaultSettlement) return;
  await loadSettlements(props.defaultSettlement);
  const exact = settlementItems.value.find((i) => i.label === props.defaultSettlement);
  if (exact) settlement.value = exact;
});
</script>
