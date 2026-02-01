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

const createIcon = (color = '#f93706') =>
  L.divIcon({
    className: 'custom-bus-stop-marker',
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <path fill="${color}" d="M22 7v9c0 .71-.38 1.36-1 1.72v1.53c0 .41-.34.75-.75.75h-.5c-.41 0-.75-.34-.75-.75V18h-7v1.25c0 .41-.34.75-.75.75h-.5c-.41 0-.75-.34-.75-.75v-1.53c-.61-.36-1-1.01-1-1.72V7c0-3 3-3 6.5-3S22 4 22 7m-9 8c0-.55-.45-1-1-1s-1 .45-1 1s.45 1 1 1s1-.45 1-1m7 0c0-.55-.45-1-1-1s-1 .45-1 1s.45 1 1 1s1-.45 1-1m0-8h-9v4h9zM7 9.5C6.97 8.12 5.83 7 4.45 7.05A2.5 2.5 0 0 0 2 9.6A2.51 2.51 0 0 0 4 12v8h1v-8c1.18-.24 2-1.29 2-2.5"/>
    </svg>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -28],
  });

// const createPopupContent = (store) => {
//   return `
//     <div class="p-1 max-w-xs">
//       <h3 class="font-bold text-lg text-center mb-2">${store.title}</h3>
//       <button
//         class="bus-stop-detail-btn bg-blue-600 text-white py-1 px-3 mx-auto block rounded text-sm font-medium hover:bg-blue-700 transition cursor-pointer"
//       >
//         Детальніше
//       </button>
//     </div>
//   `;
// };

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

.leaflet-bus-stop-icon {
  color: #2563eb; /* blue-600 */
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.35));
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
