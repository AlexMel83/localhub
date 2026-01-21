<template>
  <l-layer-group ref="busStopsGroup" :visible="showBusStopsMarkers" layer-type="overlay" :name="layerName" />
</template>

<script setup>
import L from 'leaflet';
import 'leaflet.markercluster/dist/leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { LLayerGroup } from '@vue-leaflet/vue-leaflet';

const props = defineProps({
  busStops: { type: Array, default: () => [] },
  showBusStopsMarkers: { type: Boolean, default: true },
  layerName: { type: String, default: 'Маркери' },
});

const emit = defineEmits(['marker-click']);

const busStopsGroup = ref(null);
const markerClusterGroup = ref(null);

const createIcon = () => {
  return markRaw(
    L.divIcon({
      className: 'custom-bus-stop-marker text-red-500',
      html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
        <!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE -->
        <path fill="currentColor" d="M7 2h10v7.85q0 .575-.25 1.025t-.7.725l-3.55 2.1l.7 2.3H17l-3.1 2.2l1.2 3.8l-3.1-2.35L8.9 22l1.2-3.8L7 16h3.8l.7-2.3l-3.55-2.1q-.45-.275-.7-.725T7 9.85zm4 2v7.05l1 .6l1-.6V4z"/></svg>
    `,
      iconSize: [48, 48],
      iconAnchor: [24, 48],
      popupAnchor: [0, -48],
    }),
  );
};

const createPopupContent = (store) => {
  return `
    <div class="p-1 max-w-xs">
      <h3 class="font-bold text-lg text-center mb-2">${store.title}</h3>
      <button 
        class="bus-stop-detail-btn bg-blue-600 text-white py-1 px-3 mx-auto block rounded text-sm font-medium hover:bg-blue-700 transition cursor-pointer"
      >
        Детальніше
      </button>
    </div>
  `;
};

const updateMarkers = () => {
  markerClusterGroup.value.clearLayers();

  props.busStops.forEach((stop) => {
    const marker = L.marker([stop.lat, stop.lng], {
      icon: createIcon(),
    });

    marker.bindPopup(`
      <div class="p-2">
        <h3 class="font-bold mb-1">${stop.title}</h3>
        <p class="text-sm text-gray-600">
          ${stop.schedule.slice(0, 5).join(', ')}...
        </p>
        <button class="detail-btn mt-2">Детальніше</button>
      </div>
    `);

    marker.on('popupopen', (e) => {
      const btn = e.popup.getElement()?.querySelector('.detail-btn');
      btn?.addEventListener('click', () => emit('marker-click', stop));
    });

    markerClusterGroup.value.addLayer(marker);
  });
};

onMounted(() => {
  if (busStopsGroup.value?.leafletObject) {
    markerClusterGroup.value = L.markerClusterGroup();
    updateMarkers();
    busStopsGroup.value.leafletObject.addLayer(markerClusterGroup.value);
  }
});

watch(
  () => [props.showBusStopsMarkers, props.busStops],
  () => updateMarkers(),
  { deep: true },
);
</script>

<style scoped>
.custom-div-icon {
  background: none;
  border: none;
}

:deep(.leaflet-popup-content) {
  margin: 0;
  padding: 0;
}
:deep(.leaflet-popup-content-wrapper) {
  padding: 0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.custom-bus-stop-marker {
  background: transparent;
  border: none;
}

.custom-bus-stop-marker > div {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
</style>
