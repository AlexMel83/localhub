<template>
  <div class="min-h-screen bg-gray-50">
    <MetaTags
      :title="'Хмельницький Вдячний — Знижки для військових'"
      :description="'Карта та список закладів, які надають знижки військовим.'"
    />

    <!-- Перемикач -->
    <div class="sticky top-0 z-20 bg-white shadow-md p-4 flex justify-between items-center">
      <h1 class="text-xl font-bold">Хмельницький Вдячний</h1>
      <div class="flex gap-2">
        <button
          :class="[!isListView ? 'bg-blue-600 text-white' : 'bg-gray-200', 'px-4 py-2 rounded-lg font-medium']"
          @click="isListView = false"
        >
          <UIcon name="material-symbols:map" class="w-5 h-5 inline mr-1" /> Карта
        </button>
        <button
          :class="[isListView ? 'bg-blue-600 text-white' : 'bg-gray-200', 'px-4 py-2 rounded-lg font-medium']"
          @click="isListView = true"
        >
          <UIcon name="material-symbols:list" class="w-5 h-5 inline mr-1" /> Список
        </button>
      </div>
    </div>

    <!-- Карта -->
    <ThankMapContainer
      v-if="!isListView"
      :stores="mapFeatures"
      class="h-[calc(100vh-80px)]"
      @marker-click="openDetails"
    />

    <!-- Список -->
    <div v-else class="p-4 max-w-6xl mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="f in features"
          :key="f.properties.id"
          class="bg-white rounded-xl shadow hover:shadow-xl cursor-pointer transition"
          @click="openDetails(f)"
        >
          <div class="h-48 bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
            <UIcon name="material-symbols:discount" class="w-16 h-16 text-white" />
          </div>
          <div class="p-4">
            <h3 class="font-semibold text-lg truncate">{{ f.properties.label_column }}</h3>
            <p class="text-sm text-gray-600 mt-1 line-clamp-2">{{ f.properties.dd_institution_name }}</p>
            <button class="mt-3 w-full bg-blue-600 text-white py-2 rounded text-sm" @click.stop="openDetails(f)">
              Детальніше
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- UModal з ref -->
    <UModal v-model="isDetailsOpen" title="Деталі закладу">
      <template #default="{ open }">
        <button ref="detailsModalTrigger" class="hidden" @click="open" />
      </template>

      <template #content>
        <div v-if="modalStore.selectedFeature" class="p-6">
          <h2 class="text-xl font-bold mb-4">
            {{ modalStore.selectedFeature.properties.label_column }}
          </h2>
          <p class="text-gray-600">
            {{ modalStore.selectedFeature.properties.dd_institution_name }}
          </p>
          <pre class="mt-4 text-xs bg-gray-100 p-4 rounded overflow-auto">{{
            modalStore.selectedFeature.properties
          }}</pre>
        </div>
        <div v-else class="p-6">Немає даних</div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
import { useModalStore } from '~/stores/modal.store';

const modalStore = useModalStore();
const isListView = ref(false);

const apiBase = 'https://gis.khm.gov.ua';
const layerId = '3419035732197508496';
const jsonUrl = `${apiBase}/api-user/json_layer/${layerId}/2024-08-09%2006:03:38_2024-08-09%2006:03:38%202025-09-24%2011:37:22.431%2094`;
// const infoUrl = `${apiBase}/api-user/map-info?layer=${layerId}`;

const { data: geojson } = await useAsyncData('thankful', () => $fetch(jsonUrl));

const isDetailsOpen = computed({
  get: () => modalStore.activeModal === 'thankful-details',
  set: (val) => {
    if (!val) modalStore.closeModal();
  },
});

const detailsModalTrigger = ref(null);

const features = computed(() => geojson.value?.features || []);
const mapFeatures = computed(() => {
  return features.value
    .map((f) => {
      const c = f.geometry?.coordinates;
      const p = f.properties;
      if (!c || c.length < 2 || typeof c[0] !== 'number') return null;
      return {
        id: p.id,
        title: p.label_column || 'Без назви',
        lat: Number(c[1]),
        lng: Number(c[0]),
        address: p.dd_institution_name,
      };
    })
    .filter(Boolean);
});

const openDetails = (storeOrFeature) => {
  console.log('openDetails called with:', storeOrFeature);

  const id = storeOrFeature.id || storeOrFeature.properties?.id;
  console.log('Extracted id:', id);

  const feature = features.value.find((f) => f.properties.id === id);
  console.log('Found feature:', feature);

  if (feature) {
    console.log('Opening modal with feature:', feature);
    modalStore.openThankfulDetails(feature);
    console.log('Modal state after open:', modalStore.activeModal);
  } else {
    console.log('Feature not found!');
  }
};

watch(
  () => modalStore.activeModal,
  (newValue) => {
    if (newValue === 'thankful-details' && detailsModalTrigger.value) {
      nextTick(() => {
        detailsModalTrigger.value?.click();
      });
    }
  },
);
</script>
