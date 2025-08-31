<template>
  <div>
    <div ref="streetViewContainer" class="street-view mb-2" />

    <div v-if="errorMessage" class="error-message text-red-500 text-left mt-4 dark:text-white">
      {{ errorMessage }}
    </div>
    <div v-if="panorama" class="panorama-container max-w-[800px] mx-auto px-2">
      <h1 class="text-3xl font-bold text-gray-900 text-left my-2 dark:text-white">
        {{ panorama.title }}
      </h1>
      <div v-if="panorama.address" class="text-left mb-3 dark:text-white">
        {{ $t('Panoramas.address') }}
        {{ panorama.address || $t('Panoramas.addressNotAvailable') }}
      </div>

      <div v-if="panorama.description" class="text-left mb-3 dark:text-white">
        {{ $t('Panoramas.description') }} {{ panorama.description }}
      </div>

      <div v-if="panorama.shooting_date" class="text-left mb-3 dark:text-white">
        {{ $t('Panoramas.shootingDate') }}
        {{ formatDate(panorama.shooting_date) }}
      </div>
    </div>
    <div v-else class="loading">
      {{ $t('Panoramas.back') }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const streetViewContainer = ref(null);
const currentId = ref(parseInt(route.params.id));
const errorMessage = ref('');
const { $api, $loadGoogleMaps } = useNuxtApp();

const { data: panorama } = useAsyncData('panorama', async () => {
  const panoramaData = await $api.panoramas.getPanoramaById(currentId.value);
  return panoramaData.data[0];
});

const formatDate = (dateString) => {
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  };
  return new Date(dateString).toLocaleString('ru-RU', options);
};

const initStreetView = async () => {
  await $loadGoogleMaps();
  if (panorama.value && streetViewContainer.value) {
    const location = {
      lat: parseFloat(panorama.value.latitude),
      lng: parseFloat(panorama.value.longitude),
    };

    const streetView = new google.maps.StreetViewPanorama(streetViewContainer.value, {
      position: location,
      pov: {
        heading: parseFloat(panorama.value.heading) || 0,
        pitch: parseFloat(panorama.value.tilt) - 90 || 0,
      },
      zoom: 0,
    });

    streetView.addListener('zoom_changed', () => {
      const currentZoom = streetView.getZoom();
      console.log('Current zoom:', currentZoom);
      if (document.fullscreenElement && currentZoom !== 0) {
        streetView.setZoom(0);
      }
    });

    document.addEventListener('fullscreenchange', () => {
      if (document.fullscreenElement) {
        streetView.setZoom(0);
      }
    });
  } else {
    console.warn('Контейнер для панорамы не готов или данные панорамы отсутствуют.');
  }
};

const loadPanorama = async () => {
  try {
    const response = await $api.panoramas.getPanoramaById(currentId.value);
    panorama.value = response.data[0];
    await nextTick();
    initStreetView();
  } catch (error) {
    console.error('Ошибка загрузки панорамы:', error);
  }
};

onMounted(async () => {
  await loadPanorama();
});
</script>

<style scoped>
.panorama-container {
  display: flex;
  flex-direction: column;
}

.street-view {
  width: 100%;
  height: 500px;
}

.loading {
  text-align: center;
  font-size: 1.5em;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
