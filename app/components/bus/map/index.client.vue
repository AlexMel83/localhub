<script setup lang="ts">
import { ref, computed } from 'vue';
import 'leaflet/dist/leaflet.css';
import { LMap, LTileLayer, LMarker, LPolyline, LTooltip } from '@vue-leaflet/vue-leaflet';
import L from 'leaflet';
import { useBusStops, type Stop } from '../../../composables/useBusStops';

const props = defineProps<{
  selectedStop: Stop | null;
  selectedRoutes: string[];
}>();

const zoom = ref(13);
const center = ref<[number, number]>([49.755593, 27.193796]); // Starokostiantyniv Center
const mapOptions = {
  zoomControl: false,
  attributionControl: false,
};

const { STOPS, ROUTES, getRoutesForStop, pending } = useBusStops();


// Fix default icon issues by creating a custom one or just resetting
// For a premium look, let's create a custom DivIcon factory
const createIcon = (color = '#4f46e5') => {
  return L.divIcon({
    className: 'custom-pin',
    html: `<div style="background-color: ${color}; width: 100%; height: 100%; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const emit = defineEmits(['select-stop']);

const onStopClick = (stop: Stop) => {
  emit('select-stop', stop);
};

const visibleRoutes = computed(() => {
  if (!props.selectedStop) return [];
  const activeRouteIds = getRoutesForStop(props.selectedStop.name);
  // Filter by both: routes passing through the stop AND routes selected in filter
  return ROUTES.filter((r) => activeRouteIds.includes(r.id) && props.selectedRoutes.includes(r.id));
});
</script>

<template>
  <div class="map-container">
    <div v-if="pending" class="loader-overlay">
      <div class="spinner"></div>
      <div>Завантаження маршрутів...</div>
    </div>
    <LMap ref="map" v-model:zoom="zoom" v-model:center="center" :use-global-leaflet="false" :options="mapOptions">
      <!-- Dark mode map style or Standard implementation -->
      <!-- Using CartoDB Voyager for a clean look -->
      <LTileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        layer-type="base"
        name="CartoDB Voyager"
      />

      <!-- Routes (Polylines) - Show only routes passing through selected stop -->
      <LPolyline
        v-for="route in visibleRoutes"
        :key="route.id"
        :lat-lngs="route.path"
        :color="route.color"
        :weight="6"
        :opacity="0.9"
      >
        <LTooltip :sticky="true">Маршрут №{{ route.id }}</LTooltip>
      </LPolyline>

      <!-- Stops (Markers) -->
      <LMarker
        v-for="stop in STOPS"
        :key="stop.id"
        :lat-lng="[stop.lat, stop.lng]"
        :icon="createIcon() as any"
        @click="onStopClick(stop)"
      >
        <LTooltip>{{ stop.name }}</LTooltip>
      </LMarker>
    </LMap>

    <!-- Zoom Controls overlay if needed (custom UI preference) -->
    <div class="map-controls glass-panel">
      <button class="control-btn" @click="zoom++">+</button>
      <button class="control-btn" @click="zoom--">-</button>
    </div>
  </div>
</template>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
}

.loader-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  z-index: 2000;
  font-size: 1.2rem;
  color: #333;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.map-controls {
  position: absolute;
  bottom: 120px; /* Above the bottom sheet roughly */
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  padding: 5px;
  gap: 5px;
}

.control-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: var(--text-main);
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 12px;
  transition: background 0.2s;
}

.control-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}
</style>
