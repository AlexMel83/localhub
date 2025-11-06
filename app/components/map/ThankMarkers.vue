<template>
  <l-layer-group ref="storesGroup" :visible="showStoreMarkers" layer-type="overlay" :name="layerName" />
</template>

<script setup>
import L from 'leaflet';
import 'leaflet.markercluster/dist/leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { LLayerGroup } from '@vue-leaflet/vue-leaflet';

const props = defineProps({
  stores: { type: Array, default: () => [] },
  showStoreMarkers: { type: Boolean, default: true },
  layerName: { type: String, default: 'Маркери' },
});

const emit = defineEmits(['marker-click']);

const storesGroup = ref(null);
const markerClusterGroup = ref(null);

const createIcon = () => {
  return L.divIcon({
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#aa0000" class="w-8 h-8">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    `,
    className: 'custom-div-icon',
    iconAnchor: [12, 36],
    iconSize: [24, 36],
  });
};

const createPopupContent = (store) => {
  return `
    <div class="p-3 max-w-xs">
      <h3 class="font-bold text-lg">${store.title}</h3>
      <p class="text-sm text-gray-600 mt-1">${store.address || 'Адреса не вказана'}</p>
      <button 
        class="mt-3 w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 transition"
        onclick="window.dispatchEvent(new CustomEvent('open-thankful-details', { detail: ${store.id} }))"
      >
        Детальніше
      </button>
    </div>
  `;
};

const updateMarkers = () => {
  if (!markerClusterGroup.value) return;
  markerClusterGroup.value.clearLayers();

  if (props.showStoreMarkers && props.stores.length) {
    const markers = props.stores.map((store) => {
      const marker = L.marker([store.lat, store.lng], { icon: createIcon() });
      marker.bindPopup(createPopupContent(store), { offset: [0, -30] });
      marker.on('click', () => emit('marker-click', store));
      return marker;
    });
    markerClusterGroup.value.addLayers(markers);
  }
};

onMounted(() => {
  if (storesGroup.value?.leafletObject) {
    markerClusterGroup.value = L.markerClusterGroup();
    updateMarkers();
    storesGroup.value.leafletObject.addLayer(markerClusterGroup.value);
  }
});

watch(
  () => [props.showStoreMarkers, props.stores],
  () => updateMarkers(),
  { deep: true },
);
</script>

<style scoped>
.custom-div-icon {
  background: none;
  border: none;
}
</style>
