<template>
  <div>
    <div v-if="loading" class="text-center py-8">
      <UIcon name="line-md:loading-twotone-loop" class="w-8 h-8 mx-auto text-blue-600" />
    </div>

    <div v-else-if="details" class="prose prose-sm max-w-none" v-html="details.html"></div>

    <div v-else class="text-center py-8 text-gray-500">Не вдалося завантажити деталі</div>

    <template v-if="feature">
      <div class="mt-6 text-right">
        <a
          :href="`https://gis.khm.gov.ua/discount_defenders_card/${feature.properties.id}`"
          target="_blank"
          class="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Перейти на картку
        </a>
      </div>
    </template>
  </div>
</template>

<script setup>
import { useModalStore } from '~/stores/modal.store';
import { useAsyncData } from '#app';

const modalStore = useModalStore();
const feature = computed(() => modalStore.payload?.feature);
const infoUrl = `https://gis.khm.gov.ua/api-user/map-info?layer=3419035732197508496`;

const { data: details, pending: loading } = useAsyncData(
  () => feature.value?.properties?.id || 'none',
  async (id) => {
    if (!id || id === 'none') return null;
    const { data } = await $fetch(`${infoUrl}&id=${id}`);
    return data;
  },
  { immediate: false },
);

watch(
  feature,
  () => {
    if (feature.value) {
      // Примусово перезапускаємо запит
      details.value = null;
    }
  },
  { immediate: true },
);
</script>
