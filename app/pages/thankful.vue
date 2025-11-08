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
    <div v-else class="p-4 max-w-7xl mx-auto">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="f in features"
          :key="f.properties.id"
          class="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
          @click="openDetails(f)"
        >
          <!-- Зображення-заглушка -->
          <div
            class="relative h-40 bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center overflow-hidden"
          >
            <UIcon name="material-symbols:discount" class="w-20 h-20 text-white opacity-90" />
            <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
          </div>

          <!-- Контент -->
          <div class="p-5 flex-1 flex flex-col">
            <!-- Назва -->
            <h3 class="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {{ f.properties.label_column || 'Без назви' }}
            </h3>

            <!-- Адреса -->
            <p class="text-sm text-gray-600 mt-2 line-clamp-2 flex-1">
              {{ f.properties.dd_institution_name || 'Адреса не вказана' }}
            </p>

            <!-- Знижка (якщо є) -->
            <div v-if="f.properties.discount" class="mt-3 inline-flex items-center">
              <UIcon name="material-symbols:local-offer" class="w-4 h-4 text-green-600 mr-1" />
              <span class="text-xs font-medium text-green-600">{{ f.properties.discount }}</span>
            </div>

            <!-- Кнопка -->
            <button
              class="mt-4 w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm"
              @click.stop="openDetails(f)"
            >
              Детальніше
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- UModal з v-model:open -->
    <UModal v-model:open="detailsOpen" title="Деталі закладу">
      <template #body>
        <div v-if="loading" class="text-center py-8">
          <UIcon name="line-md:loading-twotone-loop" class="w-8 h-8 mx-auto text-blue-600" />
        </div>

        <!-- v-html тільки після отримання html -->
        <div v-else-if="detailsData?.html" class="prose prose-sm max-w-none p-4" v-html="detailsData.html" />

        <div v-else class="text-center py-8 text-gray-500">Не вдалося завантажити деталі</div>
      </template>

      <template #footer="{ close }">
        <a
          v-if="selectedFeature"
          :href="`https://gis.khm.gov.ua/discount_defenders_card/${selectedFeature.properties.id}`"
          target="_blank"
          class="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Перейти на картку
        </a>
        <UButton label="Закрити" color="neutral" variant="outline" @click="close" />
      </template>
    </UModal>
  </div>
</template>

<script setup>
const detailsOpen = ref(false);
const selectedFeature = ref(null);
const detailsData = ref(null);
const loading = ref(false);

const apiBase = 'https://gis.khm.gov.ua';
const layerId = '3419035732197508496';
const jsonUrl = `${apiBase}/api-user/json_layer/${layerId}/2024-08-09%2006:03:38_2024-08-09%2006:03:38%202025-09-24%2011:37:22.431%2094`;
const infoUrl = `${apiBase}/api-user/map-info?layer=${layerId}`;

const { data: geojson } = await useAsyncData('thankful', () => $fetch(jsonUrl));

const isListView = ref(false);

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

const fetchDetails = async (id) => {
  try {
    const data = await $fetch(`${infoUrl}&id=${id}`);
    console.log('API response:', data); // ← Перевір, чи є html
    return data;
  } catch (err) {
    console.error('API error:', err);
    return null;
  }
};

const openDetails = async (storeOrFeature) => {
  const id = storeOrFeature.id || storeOrFeature.properties?.id;
  const feature = features.value.find((f) => f.properties.id === id);
  if (!feature) return;

  selectedFeature.value = feature;
  detailsData.value = null;
  loading.value = true;
  detailsOpen.value = false;

  try {
    const data = await fetchDetails(id);

    if (data?.html) {
      // Видаляємо кнопку з HTML
      const cleanHtml = data.html.replace(/<a[^>]*class="btn[^>]*>Перейти на картку<\/a>/, '').trim();

      detailsData.value = { ...data, html: cleanHtml };
      detailsOpen.value = true;
    }
  } catch (err) {
    console.error('Failed to fetch:', err);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
:deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  font-size: 0.875rem;
}

:deep(th),
:deep(td) {
  border: 1px solid #d1d5db;
  padding: 0.5rem;
  text-align: left;
}

:deep(th) {
  font-weight: 600;
}

:deep(a.btn) {
  display: inline-block;
  padding: 0.5rem 1rem;
  margin-top: 1rem;
  background-color: #3b82f6;
  color: white;
  text-decoration: none;
  border-radius: 0.375rem;
  text-align: center;
  width: 100%;
}

:deep(a.btn:hover) {
  background-color: #2563eb;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
