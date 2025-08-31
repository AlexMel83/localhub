<template>
  <l-layer-group ref="memoriesGroup" :visible="showMemoryMarkers" layer-type="overlay" :name="layerName" />
</template>

<script setup>
import L from 'leaflet';
import { LLayerGroup } from '@vue-leaflet/vue-leaflet';
import { useAppStore } from '~/stores/app.store';
const memoriesGroup = ref(null);
const markerClusterGroupMemories = ref(null);
const store = useAppStore();

const props = defineProps({
  memories: {
    type: Array,
    default: () => [],
  },
  showMemoryMarkers: {
    type: Boolean,
    default: true,
  },
  layerName: { type: String, default: null },
});

const createMemoryIcon = () => {
  return L.divIcon({
    html: createSvgIcon('#00ff00'),
    className: 'custom-div-icon',
    iconAnchor: [16, 32],
    iconSize: [32, 32],
  });
};

const createSvgIcon = (color = '#0000ff') => `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" class="custom-map-pin">
    <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
  </svg>
`;

const getCoordinatesFromLocation = (location) => {
  const regex = /POINT\(([^ ]+) ([^ ]+)\)/;
  const match = location ? location.match(regex) : null;
  return {
    longitude: match ? parseFloat(match[1]) : 0,
    latitude: match ? parseFloat(match[2]) : 0,
  };
};

const markerMemoryData = computed(() =>
  props.memories.map((memory) => ({
    id: memory.id,
    ...getCoordinatesFromLocation(memory.location),
    popupContent: createMemoryPopupContent(memory),
  })),
);

const baseURL = store.baseURL === 'https://apidev.memory.pp.ua' ? 'https://dev.memory.pp.ua' : 'https://memory.pp.ua';
const createMemoryPopupContent = (memory) => {
  // Определение URL фото
  const photoURL = memory.memory_photos?.[0]?.url
    ? `${memory.memory_photos[0].url.includes('http') ? '' : baseURL}${memory.memory_photos[0].url}`
    : './default-image.jpg';

  // Определение превью изображения или видео
  let previewImage = '';
  if (memory.source_type === 'youtube' && memory.source_url) {
    previewImage = `<img src="${getYoutubeThumbnailUrl(memory.source_url)}" alt="${memory.title}" style="max-width: 100%; display: block;" loading="lazy" />`;
  } else if (memory.source_type === 'facebook' && memory.source_url) {
    previewImage = `<iframe width="100%" src="https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(memory.source_url)}&show_text=0" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  } else {
    previewImage = `<img src="${photoURL}" alt="${memory.title}" style="max-width: 100%; display: block;" loading="lazy" />`;
  }

  return `
    <div class="popup-content" style="text-align: center;">
      <a href="/memories/${memory.id}">
        <b style="display: block; font-weight: bold; font-size: 130%;">${memory.title}</b>
      </a>
      <p>
        <a href="https://www.google.com/maps?q=${encodeURIComponent(memory.address)}" target="_blank">${memory.address}</a>
      </p>
      <a href="/memories/${memory.id}">
        ${previewImage}
      </a>
    </div>`;
};

const getYoutubeThumbnailUrl = (url) => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      // Короткие ссылки, например: https://youtu.be/<video_id>
      return `https://img.youtube.com/vi/${urlObj.pathname.slice(1)}/hqdefault.jpg`;
    } else if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
      if (urlObj.pathname === '/watch') {
        // Стандартные ссылки, например: https://www.youtube.com/watch?v=<video_id>
        return `https://img.youtube.com/vi/${urlObj.searchParams.get('v')}/hqdefault.jpg`;
      } else if (urlObj.pathname.startsWith('/shorts/')) {
        // Ссылки на шорты, например: https://www.youtube.com/shorts/<video_id>
        return `https://img.youtube.com/vi/${urlObj.pathname.split('/')[2]}/hqdefault.jpg`;
      }
    }
    return ''; // Возвращаем пустую строку, если URL не подходит под шаблоны YouTube
  } catch (error) {
    console.error('Invalid YouTube URL:', error);
    return ''; // На случай некорректной ссылки
  }
};

const updateMarkers = () => {
  if (!markerClusterGroupMemories.value) return;
  markerClusterGroupMemories.value.clearLayers();

  if (props.showMemoryMarkers) {
    const memoryMarkers = markerMemoryData.value.map((memory) => {
      const marker = L.marker(
        [memory.latitude, memory.longitude], // Используем latitude и longitude напрямую
        { icon: createMemoryIcon() },
      );
      marker.bindPopup(memory.popupContent);
      return marker;
    });
    markerClusterGroupMemories.value.addLayers(memoryMarkers);
  }
};

onMounted(() => {
  if (memoriesGroup.value?.leafletObject) {
    markerClusterGroupMemories.value = L.markerClusterGroup();
    updateMarkers();
    memoriesGroup.value.leafletObject.addLayer(markerClusterGroupMemories.value);
  }
});

watch(
  () => [props.showMemoryMarkers, props.memories],
  () => {
    updateMarkers();
  },
  { deep: true },
);
</script>

<style scoped>
.custom-div-icon {
  background: none;
  border: none;
}

.custom-map-pin {
  width: 32px;
  height: 32px;
}
</style>
