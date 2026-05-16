<template>
  <div class="min-h-screen">
    <MetaTags :title="pageTitle" :description="pageDescription" :image="pageImage" />
    <!-- Карта -->
    <!-- <BusMapContainer v-if="appStore.isListView && isBusRoutesPage" class="h-[calc(100vh-80px)]" /> -->
    <div v-if="appStore.isListView && isBusRoutesPage" class="h-[calc(100vh)]">
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
    <BusStopList v-else />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, provide } from 'vue';
import { useAppStore } from '../stores/app.store';
import { useRoute } from 'vue-router';
import type { Stop } from '../composables/useBusStops';
import { useBusStops } from '../composables/useBusStops';
import { BUS_STOPS_KEY } from '../composables/useBusStopsContext';

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
const pageImage = '/bus-routes.jpg';

const route = useRoute();
const appStore = useAppStore();

definePageMeta({
  layout: 'bus-routes',
  title: pageTitle,
  description: pageDescription,
  image: pageImage,
});

const isBusRoutesPage = computed(() => {
  return route.path === '/bus-routes' || /^\/[a-z]{2}\/bus-routes$/.test(route.path);
});

// ── Single fetch for the entire page ──────────────────────────────────────────
// All child components (BusMap, BusStopList, BusStopInfo) share this one instance
// via provide/inject — no duplicate requests when switching between map and list view.
const busStops = useBusStops();
provide(BUS_STOPS_KEY, busStops);
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
