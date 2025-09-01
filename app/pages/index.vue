<template>
  <div>
    <MapContainer v-if="!appStore.isListView" :panoramas="filteredPanoramas || []" />
    <div v-else class="p-4">
      <ul>
        <li
          v-for="panorama in filteredPanoramas"
          :key="panorama.id"
          class="border-b py-2 cursor-pointer hover:bg-gray-100"
        >
          {{ panorama.title }}
        </li>
      </ul>
      <div v-if="filteredPanoramas.length === 0" class="text-center text-gray-500 mt-4">Панорами не знайдені</div>
    </div>
  </div>
</template>

<script setup>
import { useAppStore } from '~/stores/app.store';
const appStore = useAppStore();

const { $api } = useNuxtApp();
const panoramasDataApi = ref([]);
const searchTerm = computed(() => appStore.searchTerm);
const isLoading = ref(false);

onMounted(async () => {
  if (!searchTerm.value) {
    await fetchPanoramas();
  }
});

const fetchPanoramas = async () => {
  isLoading.value = true;
  try {
    const response = await $api.panoramas.getPanoramas();
    panoramasDataApi.value = response.data;
  } catch (error) {
    console.error('Error fetching panoramas:', error);
  } finally {
    isLoading.value = false;
  }
};

const filteredPanoramas = computed(() => {
  const search = searchTerm.value?.toLowerCase() || '';
  return panoramasDataApi.value.filter((p) => p.title.toLowerCase().includes(search));
});
</script>
