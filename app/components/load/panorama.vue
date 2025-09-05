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
  latitude: {
    type: [String, Number],
    required: true,
  },
  longitude: {
    type: [String, Number],
    required: true,
  },
  heading: {
    type: [String, Number],
    default: 0,
  },
  tilt: {
    type: [String, Number],
    default: 0,
  },
});

const streetViewContainer = ref(null);
const errorMessage = ref('');
const { $loadGoogleMaps } = useNuxtApp();
const isVisible = ref(false);
const isInitialized = ref(false);

// Використовуємо IntersectionObserver для ледачого завантаження
const { stop: stopIntersectionObserver } = useIntersectionObserver(
  streetViewContainer,
  ([{ isIntersecting }]) => {
    if (isIntersecting) {
      isVisible.value = true;
    }
  },
  { threshold: 0.1 }, // Змінено threshold для надійнішого спрацьовування
);

const initStreetView = async () => {
  if (!isVisible.value || !streetViewContainer.value || isInitialized.value) {
    return;
  }

  errorMessage.value = '';
  const location = {
    lat: parseFloat(props.latitude),
    lng: parseFloat(props.longitude),
  };

  if (isNaN(location.lat) || isNaN(location.lng)) {
    errorMessage.value = 'Некоректні координати для панорами.';
    console.error('Invalid coordinates:', { latitude: props.latitude, longitude: props.longitude });
    return;
  }

  try {
    await $loadGoogleMaps();
    if (!window.google || !window.google.maps) {
      throw new Error('Google Maps API не ініціалізовано.');
    }

    const streetView = new window.google.maps.StreetViewPanorama(streetViewContainer.value, {
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

    const handleFullscreenChange = () => {
      if (document.fullscreenElement) {
        streetView.setZoom(0);
      }
    };

    streetView.addListener('zoom_changed', handleZoomChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Очищення слухачів при знищенні компонента
    onUnmounted(() => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      // Google Maps API не потребує явного очищення слухача 'zoom_changed'
    });

    isInitialized.value = true;
  } catch (err) {
    errorMessage.value = 'Не вдалося завантажити панораму: ' + (err.message || 'Невідома помилка');
    console.error('Помилка ініціалізації Street View:', err);
  }
};

// Викликаємо initStreetView при першому монтуванні, якщо елемент видимий
onMounted(() => {
  if (isVisible.value) {
    initStreetView();
  }
});

// Відстежуємо зміни props та isVisible
watch(
  () => [props.latitude, props.longitude, props.heading, props.tilt, isVisible.value],
  async () => {
    await initStreetView();
  },
  { immediate: true },
);

// Очищення IntersectionObserver при знищенні компонента
onUnmounted(() => {
  stopIntersectionObserver();
});
</script>

<style scoped>
.street-view {
  width: 100%;
  height: 500px;
}
</style>
