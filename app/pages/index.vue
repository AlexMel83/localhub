<template>
  <div><MapContainer :panoramas="filteredPanoramas || []" /></div>
</template>

<script setup>
import { useAppStore } from '~/stores/app.store';

const isLoading = ref(false);
const { $api } = useNuxtApp();
const panoramasDataApi = ref([]);
const appStore = useAppStore();
const searchTerm = computed(() => appStore.searchTerm);
const page = ref(1);

onMounted(async () => {
  try {
    if (!searchTerm.value) {
      await fetchPanoramas();
    }
  } catch (error) {
    console.error('Error in onMounted:', error);
  }
});

const fetchPanoramas = async (searchQuery = null) => {
  isLoading.value = true;
  try {
    const response = await $api.panoramas.getPanoramas(searchQuery);

    panoramasDataApi.value = response.data;
  } catch (error) {
    console.error('Error fetching panoramas data:', error);
  } finally {
    isLoading.value = false;
  }
};

const filteredPanoramas = computed(() => {
  const lowerCaseSearchTerm = searchTerm.value?.toLowerCase() || '';
  // const startIndex = (page.value - 1) * perPage;
  // const endIndex = startIndex + perPage;
  return panoramasDataApi.value.filter((panorama) => panorama.title.toLowerCase().includes(lowerCaseSearchTerm));
  // .slice(startIndex, endIndex);
});

watch(page, () => {
  window.scrollTo(0, 0);
});
</script>
