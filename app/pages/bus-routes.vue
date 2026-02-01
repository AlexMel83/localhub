<template>
  <div class="min-h-screen">
    <MetaTags :title="pageTitle" :description="pageDescription" :image="pageImage" />
    <!-- Карта -->
    <!-- <BusMapContainer v-if="appStore.isListView && isBusRoutesPage" class="h-[calc(100vh-80px)]" /> -->
    <div v-if="appStore.isListView && isBusRoutesPage" class="h-[calc(100vh-80px)]">
      <ClientOnly>
        <BusMap :selected-stop="selectedStop" :selected-routes="selectedRoutes" @select-stop="handleSelectStop" />
        <template #placeholder>
          <div class="loading-map">Loading City Map...</div>
        </template>
      </ClientOnly>
      <BusStopInfo
        :stop="selectedStop"
        :is-open="isPanelOpen"
        @close="handleClosePanel"
        @update:selected-routes="handleRoutesUpdate"
      />
    </div>
    <!-- Список зупинок -->
    <div v-else class="p-4 max-w-7xl mx-auto">another page</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAppStore } from '../stores/app.store';
import { useRoute } from 'vue-router';
import type { Stop } from '../data/bus-routes/mockData';

const selectedStop = ref<Stop | null>(null);
const isPanelOpen = ref(false);
const selectedRoutes = ref<string[]>([]);

const handleSelectStop = (stop: Stop) => {
  selectedStop.value = stop;
  isPanelOpen.value = true;
};

const handleRoutesUpdate = (routes: string[]) => {
  selectedRoutes.value = routes;
};

const handleClosePanel = () => {
  isPanelOpen.value = false;
  setTimeout(() => {
    selectedStop.value = null;
  }, 300); // Clear after animation
};

const pageTitle = 'Графік міських транспортних маршрутів Старокостянтинова';
const pageDescription = 'Інтерактивна мапа графіку міських транспортних маршрутів Старокостянтинова.';
const pageImage = '/bus-routes.png';

const route = useRoute();
const appStore = useAppStore();
//@ts-expect-error need types
definePageMeta({
  layout: 'bus-routes',
  title: pageTitle,
  description: pageDescription,
  image: pageImage,
});

const isBusRoutesPage = computed(() => {
  return route.path === '/bus-routes' || /^\/[a-z]{2}\/bus-routes$/.test(route.path);
});
console.log('isBusRoutesPage:', isBusRoutesPage.value);
console.log('appStore.isListView:', appStore.isListView);
</script>

<style scoped>
.loading-map {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  color: var(--text-secondary);
  background: #f3f4f6;
}
</style>
