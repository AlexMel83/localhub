<template>
  <section class="space-y-3" aria-labelledby="svitlo-address-title">
    <h2 id="svitlo-address-title" class="flex items-center gap-2 text-base font-semibold">
      <UIcon name="i-lucide-map-pin" class="size-5" aria-hidden="true" />
      {{ t('Svitlo.address.title') }}
    </h2>
    <form class="grid gap-2 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_auto] sm:items-end" @submit.prevent="search">
      <UFormField :label="t('Svitlo.address.settlement')" name="svitlo-settlement">
        <UInput
          v-model="settlement"
          size="lg"
          class="w-full"
          :placeholder="t('Svitlo.address.settlementPlaceholder')"
          autocomplete="address-level2"
        />
      </UFormField>
      <UFormField :label="t('Svitlo.address.street')" name="svitlo-street">
        <UInput
          v-model="query"
          size="lg"
          class="w-full"
          :placeholder="t('Svitlo.address.placeholder')"
          autocomplete="street-address"
          required
          minlength="2"
        />
      </UFormField>
      <UButton type="submit" size="lg" class="min-h-11 justify-center" icon="i-lucide-search" :loading="pending">
        {{ t('Svitlo.address.search') }}
      </UButton>
    </form>

    <div aria-live="polite">
      <UAlert
        v-if="failed"
        color="warning"
        variant="subtle"
        icon="i-lucide-cloud-off"
        :title="t('Svitlo.address.unavailable')"
      >
        <template #description>
          <a href="https://hoe.com.ua/shutdown/queue" target="_blank" rel="noopener" class="underline">{{
            t('Svitlo.address.official')
          }}</a>
        </template>
      </UAlert>
      <template v-else-if="result">
        <p v-if="!result.matches.length" class="text-sm text-muted">
          {{ t('Svitlo.address.none') }}
          <a href="https://hoe.com.ua/shutdown/queue" target="_blank" rel="noopener" class="text-primary underline">{{
            t('Svitlo.address.official')
          }}</a>
        </p>
        <p v-else-if="!result.query.house" class="text-sm text-muted">{{ t('Svitlo.address.hint') }}</p>
        <ul class="mt-2 space-y-2">
          <li
            v-for="m in result.matches"
            :key="`${m.settlement}|${m.street}`"
            class="rounded-xl p-3 ring-1 ring-default"
          >
            <p class="font-medium">
              {{ m.settlement }}, {{ m.street }}<template v-if="m.house">, {{ m.house }}</template>
            </p>
            <div class="mt-2 flex flex-wrap gap-2">
              <UButton
                v-for="q in m.queues"
                :key="q"
                :to="localePath(`/svitlo-cherga/${region}/${queueToParam(q)}`)"
                size="lg"
                class="min-h-11 tabular-nums"
                @click="onPick(m.house, m.queues, q)"
              >
                {{ t('Svitlo.queue', { queue: q }) }}
              </UButton>
            </div>
            <p v-if="m.house && m.queues.length > 1" class="mt-2 text-xs text-warning">
              {{ t('Svitlo.address.multiple') }}
            </p>
            <p v-if="m.fileDate" class="mt-1 text-xs text-muted">
              {{ t('Svitlo.address.fileDate', { date: m.fileDate }) }}
            </p>
          </li>
        </ul>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { AddressSearchResult } from '#shared/types/svitlo';
import { queueToParam } from '#shared/utils/svitloTime';

const props = defineProps<{ region: string; defaultSettlement?: string }>();

const { t } = useSvitloFormat();
const localePath = useLocalePath();
const { save } = useSvitloSavedQueue();

const settlement = ref(props.defaultSettlement ?? '');
const query = ref('');
const pending = ref(false);
const failed = ref(false);
const result = ref<AddressSearchResult | null>(null);

function onPick(house: string | null, queues: string[], queue: string) {
  // Remember the queue only when the address points to exactly one.
  if (house && queues.length === 1) save(props.region, queue);
}

async function search() {
  if (query.value.trim().length < 2) return;
  pending.value = true;
  failed.value = false;
  try {
    result.value = await $fetch<AddressSearchResult>(`/api/svitlo/${props.region}/address`, {
      query: { q: query.value.trim(), settlement: settlement.value.trim() || undefined },
    });
  } catch {
    failed.value = true;
    result.value = null;
  } finally {
    pending.value = false;
  }
}
</script>
