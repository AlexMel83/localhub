<template>
  <div ref="streetViewContainer" class="street-view mb-4 rounded-xl shadow-md overflow-hidden">
    <div v-if="errorMessage" class="text-red-500 text-center p-4 dark:text-white">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useNuxtApp } from '#app';
import { useIntersectionObserver } from '@vueuse/core';

const props = defineProps({
  latitude: { type: [String, Number], default: 0 },
  longitude: { type: [String, Number], default: 0 },
  heading: { type: [String, Number], default: 0 },
  tilt: { type: [String, Number], default: 0 },
});

const streetViewContainer = ref(null);
const errorMessage = ref('');
const { $loadGoogleMaps } = useNuxtApp();
const isVisible = ref(false);
const isInitialized = ref(false);

let streetView = null;
let handleFullscreenChange = null;

// IntersectionObserver для ледачого завантаження
const { stop: stopIntersectionObserver } = useIntersectionObserver(
  streetViewContainer,
  ([{ isIntersecting }]) => {
    if (isIntersecting) isVisible.value = true;
  },
  { threshold: 0.1 },
);

const initStreetView = async () => {
  if (!isVisible.value || !streetViewContainer.value || isInitialized.value) return;

  errorMessage.value = '';
  const location = {
    lat: parseFloat(props.latitude),
    lng: parseFloat(props.longitude),
  };

  if (isNaN(location.lat) || isNaN(location.lng)) {
    errorMessage.value = 'Некоректні координати для панорами.';
    return;
  }

  try {
    await $loadGoogleMaps();
    if (!window.google?.maps) {
      throw new Error('Google Maps API не ініціалізовано.');
    }

    streetView = new window.google.maps.StreetViewPanorama(streetViewContainer.value, {
      position: location,
      pov: {
        heading: parseFloat(props.heading) || 0,
        pitch: parseFloat(props.tilt) - 90 || 0,
      },
      zoom: 0,
    });

    const handleZoomChange = () => {
      const currentZoom = streetView.getZoom();
      if (document.fullscreenElement && currentZoom !== 0) {
        streetView.setZoom(0);
      }
    };

    handleFullscreenChange = () => {
      if (document.fullscreenElement) {
        streetView.setZoom(0);
      }
    };

    streetView.addListener('zoom_changed', handleZoomChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    isInitialized.value = true;
  } catch (err) {
    errorMessage.value = 'Не вдалося завантажити панораму: ' + (err.message || 'Невідома помилка');
    console.error('Помилка ініціалізації Street View:', err);
  }
};

// Викликаємо при монтуванні
onMounted(() => {
  if (isVisible.value) initStreetView();
});

// Відстежуємо зміни props + видимість
watch(
  () => [props.latitude, props.longitude, props.heading, props.tilt, isVisible.value],
  () => initStreetView(),
  { immediate: true },
);

// Правильне очищення тут (у setup, а не в initStreetView)
onUnmounted(() => {
  stopIntersectionObserver();
  if (handleFullscreenChange) {
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }
});
</script>

<style scoped>
.street-view {
  width: 100%;
  height: 500px;
}
</style>
