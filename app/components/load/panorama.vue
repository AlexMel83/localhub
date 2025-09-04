<template>
  <div ref="streetViewContainer" class="street-view mb-4 rounded-xl shadow-md overflow-hidden">
    <div v-if="errorMessage" class="text-red-500 text-center p-4 dark:text-white">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { useNuxtApp } from '#app';
import { useIntersectionObserver } from '@vueuse/core'; // Додаємо для ледачого завантаження

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

// Використовуємо IntersectionObserver для ледачого завантаження
useIntersectionObserver(
  streetViewContainer,
  ([{ isIntersecting }]) => {
    isVisible.value = isIntersecting;
  },
  { threshold: 0 },
);

const initStreetView = async () => {
  if (!isVisible.value || !streetViewContainer.value) {
    return; // Ініціалізація лише коли елемент видимий
  }

  errorMessage.value = '';
  await nextTick();

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
  } catch (err) {
    errorMessage.value = 'Не вдалося завантажити панораму: ' + (err.message || 'Невідома помилка');
    console.error('Помилка ініціалізації Street View:', err);
  }
};

watch(
  () => [props.latitude, props.longitude, props.heading, props.tilt, isVisible.value],
  async () => {
    await initStreetView();
  },
  { immediate: true },
);
</script>

<style scoped>
.street-view {
  width: 100%;
  height: 500px;
}
</style>
