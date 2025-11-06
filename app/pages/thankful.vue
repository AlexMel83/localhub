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
          @click="isListView = false"
          :class="[!isListView ? 'bg-blue-600 text-white' : 'bg-gray-200', 'px-4 py-2 rounded-lg font-medium']"
        >
          <UIcon name="material-symbols:map" class="w-5 h-5 inline mr-1" /> Карта
        </button>
        <button
          @click="isListView = true"
          :class="[isListView ? 'bg-blue-600 text-white' : 'bg-gray-200', 'px-4 py-2 rounded-lg font-medium']"
        >
          <UIcon name="material-symbols:list" class="w-5 h-5 inline mr-1" /> Список
        </button>
      </div>
    </div>

    <!-- Карта -->
    <MapThankContainer
      v-if="!isListView"
      :stores="mapFeatures"
      @marker-click="openDetails"
      class="h-[calc(100vh-80px)]"
    />

    <!-- Список -->
    <div v-else class="p-4 max-w-6xl mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="f in features"
          :key="f.properties.id"
          @click="openDetails(f)"
          class="bg-white rounded-xl shadow hover:shadow-xl cursor-pointer transition"
        >
          <div class="h-48 bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
            <UIcon name="material-symbols:discount" class="w-16 h-16 text-white" />
          </div>
          <div class="p-4">
            <h3 class="font-semibold text-lg truncate">{{ f.properties.label_column }}</h3>
            <p class="text-sm text-gray-600 mt-1 line-clamp-2">{{ f.properties.dd_institution_name }}</p>
            <button @click.stop="openDetails(f)" class="mt-3 w-full bg-blue-600 text-white py-2 rounded text-sm">
              Детальніше
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модалка -->
    <UModal v-model="showModal">
      <div class="p-6 max-w-2xl mx-auto" v-if="selectedDetails">
        <div class="prose prose-sm" v-html="selectedDetails.html"></div>
        <div class="mt-4 text-right">
          <a
            :href="`https://gis.khm.gov.ua/discount_defenders_card/${selectedFeature?.properties.id}`"
            target="_blank"
            class="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Перейти на картку
          </a>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup>
const isListView = ref(false);
const showModal = ref(false);
const selectedFeature = ref(null);
const selectedDetails = ref(null);

const apiBase = 'https://gis.khm.gov.ua';
const layerId = '3419035732197508496';
const jsonUrl = `${apiBase}/api-user/json_layer/${layerId}/2024-08-09%2006:03:38_2024-08-09%2006:03:38%202025-09-24%2011:37:22.431%2094`;
const infoUrl = `${apiBase}/api-user/map-info?layer=${layerId}`;

const { data: geojson, pending } = await useAsyncData('thankful', () => $fetch(jsonUrl));

const features = computed(() => geojson.value?.features || []);
const mapFeatures = computed(() => {
  return features.value
    .map((f) => {
      const c = f.geometry?.coordinates;
      if (!c || c.length < 2 || typeof c[0] !== 'number') return null;
      return {
        id: f.properties.id,
        title: f.properties.label_column,
        lat: c[1],
        lng: c[0],
        address: f.properties.dd_institution_name,
      };
    })
    .filter(Boolean);
});

const fetchDetails = async (id) => {
  const { data } = await useFetch(`${infoUrl}&id=${id}`);
  return data.value;
};

const openDetails = async (feature) => {
  selectedFeature.value = feature;
  selectedDetails.value = await fetchDetails(feature.properties?.id || feature.id);
  showModal.value = true;
};

// Глобальний обробник для кнопки в popup
onMounted(() => {
  window.addEventListener('open-thankful-details', (e) => {
    const id = e.detail;
    const f = features.value.find((f) => f.properties.id === id);
    if (f) openDetails(f);
  });
});
</script>
