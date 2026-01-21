<template>
  <div class="min-h-screen">
    <MetaTags :title="pageTitle" :description="pageDescription" :image="pageImage" />

    <!-- Карта -->
    <BusMapContainer
      v-if="appStore.isListView && isBusRoutesPage"
      class="h-[calc(100vh-80px)]"
      @marker-click="openDetails"
    />

    <!-- Список -->
    <!-- Список з пагінацією -->
    <div v-else class="p-4 max-w-7xl mx-auto">another page</div>
  </div>
</template>

<script setup>
import { useAppStore } from '~/stores/app.store';
import { useRoute } from 'vue-router';

const pageTitle = 'Транспортні маршрути Старокостянтинова';
const pageDescription = 'Інтерактивна мапа транспортних маршрутів Старокостянтинова.';
const pageImage = '/bus-routes.png';

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
</script>
