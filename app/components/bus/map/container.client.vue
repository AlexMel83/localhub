<template>
  <section class="mapsection relative h-screen">
    <LMap
      ref="map"
      class="z-[1]"
      :marker-zoom-animation="false"
      :use-global-leaflet="true"
      :scroll-wheel-zoom="false"
      :fade-animation="false"
      :center="center"
      :zoom="zoom"
      :prefer-canvas="true"
      @ready="onMapReady"
    >
      <l-control-layers position="bottomleft" :collapsed="true" />
      <LTileLayer
        v-for="tileProvider in TILE_PROVIDERS"
        :key="tileProvider.name"
        :attribution="tileProvider.attribution"
        :max-zoom="tileProvider.maxZoom || 20"
        :min-zoom="tileProvider.minZoom || 3"
        :visible="tileProvider.visible || false"
        :name="tileProvider.name"
        :url="tileProvider.url"
        layer-type="base"
      />
      <BusMapMarkers
        :bus-stops="busStops"
        :show-bus-stop-markers="true"
        layer-name="Маршрут № 4 с.Пашківці - Лікарня - Новики"
        @marker-click="$emit('marker-click', $event)"
      />
      <LMarker v-if="busPosition" :lat-lng="busPosition" :icon="busIcon" />
      <LMarker v-if="busPosition2" :lat-lng="busPosition2" :icon="busIcon2" />
      <LPolyline :lat-lngs="routeLine" :color="routeColor" :weight="5" />
      <LControlScale position="bottomright" :imperial="false" :metric="true" />
    </LMap>
  </section>
</template>

<script setup>
import { TILE_PROVIDERS } from '@/constants/map-config';
import { LControlLayers, LControlScale, LMap, LTileLayer, LMarker, LPolyline } from '@vue-leaflet/vue-leaflet';
import { route4 } from '@/data/bus-routes/route-4';

defineEmits(['marker-click']);

const center = ref([49.7548762, 27.1951962]);
const zoom = ref(13);
const map = ref(null);

const onMapReady = () => {
  if (!map.value?.leafletObject) return;
  const attribution = map.value.leafletObject.attributionControl?.getContainer();
  if (attribution) {
    attribution.classList.add('collapsed');
    attribution.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      attribution.classList.toggle('collapsed');
    });
  }
};

const busStops = computed(() => route4.stops.map((s) => ({ ...s })));

const routeLine = computed(() => route4.geometry.coordinates.map(([lng, lat]) => [lat, lng]));

const routeColor = route4.color;

// Функция для создания иконки автобуса с определенным цветом
function createBusIcon(color = '#00db0f') {
  return L.divIcon({
    className: 'bus-marker',
    html: `
     <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
       <path fill="${color}" d="M3 6c-1.11 0-2 .89-2 2v7h2a3 3 0 0 0 3 3a3 3 0 0 0 3-3h6a3 3 0 0 0 3 3a3 3 0 0 0 3-3h2V8c0-1.11-.89-2-2-2zm-.5 1.5h4V10h-4zm5.5 0h4V10H8zm5.5 0h4V10h-4zm5.5 0h2.5V13L19 11zm-13 6A1.5 1.5 0 0 1 7.5 15A1.5 1.5 0 0 1 6 16.5A1.5 1.5 0 0 1 4.5 15A1.5 1.5 0 0 1 6 13.5m12 0a1.5 1.5 0 0 1 1.5 1.5a1.5 1.5 0 0 1-1.5 1.5a1.5 1.5 0 0 1-1.5-1.5a1.5 1.5 0 0 1 1.5-1.5"/>
     </svg>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

const busIcon = createBusIcon('#00db0f'); // Зеленый
const busIcon2 = createBusIcon('#ff8c00'); // Оранжевый

const busPosition = ref([route4.stops[0].lat, route4.stops[0].lng]);
const busPosition2 = ref([route4.stops[3].lat, route4.stops[3].lng]);
</script>

<style scoped>
:deep(.leaflet-control-zoom) {
  margin-top: 80px !important;
}

:deep(.leaflet-control-layers) {
  margin-bottom: 80px !important;
}

:deep(.leaflet-control-attribution) {
  margin-bottom: 5px !important;
}

.bus-marker svg path {
  fill: #00db0f;
}

.custom-div-icon {
  background: none;
  border: none;
}

.custom-map-pin {
  width: 35px;
  height: 35px;
}

.btn {
  color: var(--white-color);
  background-color: var(--header-bg);
  cursor: pointer;
  margin-right: 20px;
}

:deep(.leaflet-popup-content p) {
  margin: 0 !important;
  min-width: 200px !important;
}

:deep(.leaflet-popup-content) {
  margin: 0 0 10px 0 !important;
  min-width: 200px !important;
}

:deep(.leaflet-popup-content-wrapper) {
  border-radius: 0 !important;
  min-width: 200px !important;
  max-width: 300px;
}

:deep(.leaflet-control-attribution) {
  max-width: 65px;
  overflow: hidden;
  white-space: nowrap;
  cursor: pointer;
  transition: max-width 0.3s ease;
}

:deep(.leaflet-control-attribution:not(.collapsed)) {
  max-width: 400px; /* розгорнутий стан */
  padding-right: 8px;
}

.btn:hover {
  background-color: var(--btn-border);
}

@media (min-width: 480px) {
  :deep(.leaflet-control-layers) {
    margin-bottom: 35px !important;
  }
  :deep(.leaflet-control-attribution) {
    margin-bottom: 35px !important;
  }
}
</style>
