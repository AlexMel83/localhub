<template>
  <div>
    <MapContainer v-if="!appStore.isListView" :stores="filteredStores || []" />
    <div v-else class="p-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="store in filteredStores"
          :key="store.id"
          class="relative rounded-lg overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-300 h-64"
          @click="$router.push(`/stores/${store.id}`)"
        >
          <!-- Зображення на всю карточку -->
          <div class="w-full h-full">
            <img
              :src="store.thumbnail_url"
              alt="Store thumbnail"
              class="w-full h-full object-cover absolute top-0 left-0"
            />
            <!-- Градієнт для затемнення нижньої частини -->
            <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-80"></div>
          </div>
          <!-- Контент карточки поверх зображення -->
          <div class="absolute bottom-0 left-0 p-4 text-white w-full">
            <h3 class="text-lg font-semibold truncate">{{ store.title }}</h3>
            <p class="text-sm text-gray-300 line-clamp-2">{{ store.description }}</p>
            <p class="text-sm mt-2">{{ store.working_hours }}</p>
          </div>
          <!-- Іконка серця -->
          <div
            class="absolute top-2 right-2 text-gray-400 hover:text-red-500 cursor-pointer transition-colors duration-300"
            @click.stop="toggleLike(store.id)"
          >
            <UIcon name="lucide-heart" :class="{ 'text-red-500 fill-current': isLiked(store.id) }" class="w-6 h-6" />
          </div>
          <!-- Позначка "М" -->
          <div class="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">М</div>
        </div>
        <div v-if="filteredStores.length === 0" class="text-center text-gray-500 mt-4">Stores не знайдені</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAppStore } from '~/stores/app.store';
const appStore = useAppStore();

const { $api } = useNuxtApp();
const storesDataApi = ref([]);
const searchTerm = computed(() => appStore.searchTerm);
const isLoading = ref(false);

const likedStores = ref(new Set());

// Перемикання стану "лайка" для конкретного магазину
const toggleLike = (storeId) => {
  if (likedStores.value.has(storeId)) {
    likedStores.value.delete(storeId);
  } else {
    likedStores.value.add(storeId);
  }
};

// Перевірка, чи магазин "лайкнутий"
const isLiked = (storeId) => {
  return likedStores.value.has(storeId);
};

onMounted(async () => {
  if (!searchTerm.value) {
    await fetchStores();
  }
});

const fetchStores = async () => {
  isLoading.value = true;
  try {
    const response = await $api.stores.getStores();
    storesDataApi.value = response.data;
  } catch (error) {
    console.error('Error fetching stores:', error);
  } finally {
    isLoading.value = false;
  }
};

const filteredStores = computed(() => {
  const search = searchTerm.value?.toLowerCase() || '';
  return storesDataApi.value.filter((p) => p.title.toLowerCase().includes(search));
});
</script>
