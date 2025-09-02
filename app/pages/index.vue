<template>
  <div>
    <MapContainer v-if="!appStore.isListView" :stores="filteredStores || []" />
    <div v-else class="p-4">
      <ul>
        <li v-for="store in filteredStores" :key="store.id" class="border-b py-2 cursor-pointer hover:bg-gray-100">
          {{ store.title }}
        </li>
      </ul>
      <div v-if="filteredStores.length === 0" class="text-center text-gray-500 mt-4">Stores не знайдені</div>
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
