<template>
  <div class="min-h-screen">
    <MetaTags :title="pageTitle" :description="pageDescription" :image="pageImage" />

    <!-- Карта -->
    <ThankMapContainer
      v-if="appStore.isListView && isThankFulPage"
      :stores="filteredMapFeatures"
      class="h-[calc(100vh-80px)]"
      @marker-click="openDetails"
    />

    <!-- Список -->
    <!-- Список з пагінацією -->
    <div v-else class="p-4 max-w-7xl mx-auto">
      <!-- Кількість знайдених -->
      <div class="mb-4 text-sm">
        Знайдено: <strong>{{ filteredFeatures.length }}</strong> закладів
      </div>

      <!-- Сітка -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="f in paginatedFeatures"
          :key="f.properties.id"
          class="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col h-full"
          @click="openDetails(f)"
        >
          <!-- Зображення-заглушка -->
          <div
            class="relative h-40 bg-gradient-to-br from-green-400 to-green-800 flex items-center justify-center overflow-hidden"
          >
            <UIcon name="material-symbols:volunteer-activism" class="w-20 h-20 text-white opacity-90" />
            <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
          </div>

          <!-- Контент -->
          <div class="p-5 flex-1 flex flex-col">
            <h3
              class="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-blue-600 cursor-pointer transition-colors"
            >
              {{ f.properties.label_column || 'Без назви' }}
            </h3>
            <p class="text-sm text-gray-600 mt-2 line-clamp-2 flex-1">
              {{ f.properties.dd_institution_name || 'Адреса не вказана' }}
            </p>
            <div v-if="f.properties.discount" class="mt-3 inline-flex items-center">
              <UIcon name="material-symbols:local-offer" class="w-4 h-4 text-green-600 mr-1" />
              <span class="text-xs font-medium text-green-600">{{ f.properties.discount }}</span>
            </div>
            <button
              @click.stop="openDetails(f)"
              class="mt-4 w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm"
            >
              Детальніше
            </button>
          </div>
        </div>
      </div>

      <!-- Повідомлення "нічого не знайдено" -->
      <div v-if="filteredFeatures.length === 0" class="text-center py-12 text-gray-500">
        <UIcon name="material-symbols:search-off" class="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>За вашим запитом нічого не знайдено</p>
      </div>

      <!-- Пагінація (тільки якщо є що пагінувати) -->
      <div v-else-if="totalPages > 1" class="mt-8 flex justify-center">
        <UPagination
          v-model="currentPage"
          :total="filteredFeatures.length"
          active-color="neutral"
          :sibling-count="perPage"
        >
          <template #prev>
            <UTooltip text="Previous page">
              <UButton aria-label="Previous page" :disabled="isFirstPage" @click="goToPrevPage">
                <Icon name="material-symbols:chevron-left" />
              </UButton>
            </UTooltip>
          </template>
          <template #next>
            <UTooltip text="Next page">
              <UButton aria-label="Next page" :disabled="isLastPage" @click="goToNextPage">
                <Icon name="material-symbols:chevron-right" />
              </UButton>
            </UTooltip>
          </template>
        </UPagination>
      </div>
    </div>

    <!-- UModal -->
    <UModal v-model:open="detailsOpen" title="Деталі закладу">
      <template #body>
        <div v-if="loading" class="text-center py-8">
          <UIcon name="line-md:loading-twotone-loop" class="w-8 h-8 mx-auto text-blue-600" />
        </div>

        <div v-else-if="detailsData?.html" class="prose prose-sm max-w-none p-4" v-html="detailsData.html" />

        <div v-else class="text-center py-8 text-gray-500">Не вдалося завантажити деталі</div>
      </template>

      <template #footer="{ close }">
        <div class="flex gap-2 justify-between w-full">
          <a
            v-if="selectedFeature"
            :href="`https://gis.khm.gov.ua/discount_defenders_card/${selectedFeature.properties.id}`"
            target="_blank"
            class="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Перейти на картку
          </a>
          <UButton label="Закрити" color="neutral" variant="outline" @click="close" />
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
import { useAppStore } from '~/stores/app.store';
import { useRoute } from 'vue-router';

const pageTitle = 'Вдячна Хмельниччина';
const pageDescription =
  'Проект присвячений підтримці захисників та захисниць зі сторони свідомого, соціально-орієнтованого бізнесу Хмельниччини.';
const pageImage = '/ThankfulLogo.png';

const detailsOpen = ref(false);
const selectedFeature = ref(null);
const detailsData = ref(null);
const loading = ref(false);
const route = useRoute();
const appStore = useAppStore();
const searchTerm = computed(() => appStore.searchTerm?.trim().toLowerCase() || '');

const currentPage = ref(1);
const perPage = ref(8);

const features = computed(() => geojson.value?.features || []);

// ФІЛЬТРАЦІЯ: за назвою (label_column) + адресою (dd_institution_name)
const filteredFeatures = computed(() => {
  if (!searchTerm.value) return features.value;

  return features.value.filter((f) => {
    const name = (f.properties.label_column || '').toLowerCase();
    const address = (f.properties.dd_institution_name || '').toLowerCase();
    return name.includes(searchTerm.value) || address.includes(searchTerm.value);
  });
});

const filteredMapFeatures = computed(() => {
  return filteredFeatures.value
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

const paginatedFeatures = computed(() => {
  const startIndex = (currentPage.value - 1) * perPage.value;
  const endIndex = startIndex + perPage.value;
  return filteredFeatures.value.slice(startIndex, endIndex);
});
const totalPages = computed(() => Math.ceil(filteredFeatures.value.length / perPage.value));

const isFirstPage = computed(() => currentPage.value === 1);
const isLastPage = computed(() => currentPage.value === totalPages.value);

// Методы для навигации
const goToPrevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    console.log('Going to prev page:', currentPage.value);
  }
};

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

// Сброс страницы при изменении данных (например, после фильтрации)
watch(
  () => filteredFeatures.length,
  () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = 1;
    }
  },
);
watch(searchTerm, () => {
  currentPage.value = 1;
});

definePageMeta({
  layout: 'thank',
  title: pageTitle,
  description: pageDescription,
  image: pageImage,
});

const isThankFulPage = computed(() => {
  return route.path === '/thankful' || /^\/[a-z]{2}\/thankful$/.test(route.path);
});

const apiBase = 'https://gis.khm.gov.ua';
const layerId = '3419035732197508496';
const jsonUrl = `${apiBase}/api-user/json_layer/${layerId}/2024-08-09%2006:03:38_2024-08-09%2006:03:38%202025-09-24%2011:37:22.431%2094`;
const infoUrl = `${apiBase}/api-user/map-info?layer=${layerId}`;

const { data: geojson } = await useAsyncData('thankful', () => $fetch(jsonUrl), {
  server: true,
  lazy: false,
});

const fetchDetails = async (id) => {
  try {
    const data = await $fetch(`${infoUrl}&id=${id}`);
    console.log('API response:', data);
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
  background-color: #f9fafb;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
