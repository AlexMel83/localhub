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

defineProps({
  stores: { type: Array, default: () => [] },
});

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
const busPosition2 = ref([route4.stops[2].lat, route4.stops[2].lng]);
let timer = null;

// Парсер часу "HH:MM" в хвилини від початку дня
function parseTimeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Обчислюємо дистанцію між двома точками (гаверсинус формула)
function distanceBetweenCoords(lat1, lng1, lat2, lng2) {
  const R = 6371; // Радіус землі в км
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Знаходимо найближчу точку на маршруті до зупинки
function findNearestRoutePoint(stopLat, stopLng) {
  let minDist = Infinity;
  let nearestIndex = 0;

  for (let i = 0; i < route4.geometry.coordinates.length; i++) {
    const [lng, lat] = route4.geometry.coordinates[i];
    const dist = distanceBetweenCoords(stopLat, stopLng, lat, lng);
    if (dist < minDist) {
      minDist = dist;
      nearestIndex = i;
    }
  }

  return nearestIndex;
}

// Отримуємо послідовність зупинок для напрямку
function getStopsSequenceForDirection(direction) {
  if (direction === 'to_city') {
    return [
      route4.stops.find((s) => s.id === 'pashkivtsi'),
      route4.stops.find((s) => s.id === 'bolgarske'),
      route4.stops.find((s) => s.id === 'center'),
    ];
  } else {
    return [
      route4.stops.find((s) => s.id === 'novyky'),
      route4.stops.find((s) => s.id === 'center'),
      route4.stops.find((s) => s.id === 'bolgarske'),
      route4.stops.find((s) => s.id === 'pashkivtsi'),
    ];
  }
}

// РЕЖИМ ДЕМОНСТРАЦІЇ
const DEMO_MODE = false;
const DEMO_TIME = '09:15';

// Інтерполяція позиції на маршруті за часом
function interpolatePosition(tripIndex, stopsSequence, tripTimes, currentMinutes) {
  // Знаходимо, між якими зупинками знаходиться автобус
  let currentStopIdx = 0;
  for (let i = 0; i < stopsSequence.length - 1; i++) {
    const timeAtStop = tripTimes[i];
    const timeAtNextStop = tripTimes[i + 1];
    const minStopTime = Math.min(timeAtStop, timeAtNextStop);
    const maxStopTime = Math.max(timeAtStop, timeAtNextStop);

    if (currentMinutes >= minStopTime && currentMinutes <= maxStopTime) {
      currentStopIdx = i;
      break;
    }
  }

  const stopA = stopsSequence[currentStopIdx];
  const stopB = stopsSequence[currentStopIdx + 1];
  const timeAtStop = tripTimes[currentStopIdx];
  const timeAtNextStop = tripTimes[currentStopIdx + 1];

  // Знаходимо індекси точок маршруту для цих зупинок
  const startRouteIdx = findNearestRoutePoint(stopA.lat, stopA.lng);
  const endRouteIdx = findNearestRoutePoint(stopB.lat, stopB.lng);

  // Визначаємо напрямок руху на маршруті
  const step = startRouteIdx <= endRouteIdx ? 1 : -1;
  const routeSegmentIndices = [];

  if (step === 1) {
    for (let i = startRouteIdx; i <= endRouteIdx; i++) {
      routeSegmentIndices.push(i);
    }
  } else {
    for (let i = startRouteIdx; i >= endRouteIdx; i--) {
      routeSegmentIndices.push(i);
    }
  }

  // Обчислюємо загальну дистанцію на маршруті
  let totalDistance = 0;
  for (let i = 0; i < routeSegmentIndices.length - 1; i++) {
    const [lng1, lat1] = route4.geometry.coordinates[routeSegmentIndices[i]];
    const [lng2, lat2] = route4.geometry.coordinates[routeSegmentIndices[i + 1]];
    totalDistance += distanceBetweenCoords(lat1, lng1, lat2, lng2);
  }

  // Обчислюємо час в дорозі
  const totalTime = Math.abs(timeAtNextStop - timeAtStop);
  const elapsedTime = Math.abs(currentMinutes - timeAtStop);
  const timeRatio = totalTime > 0 ? elapsedTime / totalTime : 0;

  // Знаходимо поточну дистанцію на маршруті
  let currentDistance = 0;
  let segmentIdx = 0;

  for (let i = 0; i < routeSegmentIndices.length - 1; i++) {
    const [lng1, lat1] = route4.geometry.coordinates[routeSegmentIndices[i]];
    const [lng2, lat2] = route4.geometry.coordinates[routeSegmentIndices[i + 1]];
    const segmentDist = distanceBetweenCoords(lat1, lng1, lat2, lng2);

    if (currentDistance + segmentDist <= totalDistance * timeRatio) {
      currentDistance += segmentDist;
      segmentIdx = i;
    } else {
      break;
    }
  }

  // Інтерполюємо позицію в поточному сегменті
  const [lng1, lat1] = route4.geometry.coordinates[routeSegmentIndices[segmentIdx]];
  const [lng2, lat2] = route4.geometry.coordinates[routeSegmentIndices[segmentIdx + 1]];

  const segmentDist = distanceBetweenCoords(lat1, lng1, lat2, lng2);
  const remainingDist = totalDistance * timeRatio - currentDistance;
  const segmentRatio = segmentDist > 0 ? remainingDist / segmentDist : 0;

  const lat = lat1 + (lat2 - lat1) * segmentRatio;
  const lng = lng1 + (lng2 - lng1) * segmentRatio;

  if (DEMO_MODE) {
    console.log(
      `   Рейс ${tripIndex}: ${(timeRatio * 100).toFixed(1)}% дороги. Координати: [${lat.toFixed(5)}, ${lng.toFixed(5)}]`,
    );
  }

  return [lat, lng];
}

// Функція для оновлення позиції автобуса
function updateBusPosition() {
  const now = new Date();
  let currentMinutes;

  if (DEMO_MODE) {
    currentMinutes = parseTimeToMinutes(DEMO_TIME);
    console.log(`🚀 ДЕМО-РЕЖИМ: ${DEMO_TIME} (${currentMinutes} хв)`);
  } else {
    currentMinutes = now.getHours() * 60 + now.getMinutes();
  }

  let found = false;
  const direction = 'to_city';
  const stopsSequence = getStopsSequenceForDirection(direction);

  for (let tripIndex = 0; tripIndex < route4.stops[0].schedule.length; tripIndex++) {
    const tripTimes = stopsSequence.map((stop) => {
      const time = stop.schedule[tripIndex];
      return time ? parseTimeToMinutes(time) : null;
    });

    if (tripTimes.some((t) => t === null)) continue;

    const minTime = Math.min(...tripTimes);
    const maxTime = Math.max(...tripTimes);

    if (currentMinutes >= minTime && currentMinutes <= maxTime) {
      const position = interpolatePosition(tripIndex, stopsSequence, tripTimes, currentMinutes, direction);
      busPosition.value = position;
      found = true;
      break;
    }
  }

  if (!found) {
    busPosition.value = [route4.stops[0].lat, route4.stops[0].lng];
  }
}

// Функція для другого автобуса
function updateBusPosition2() {
  const now = new Date();
  let currentMinutes;

  if (DEMO_MODE) {
    currentMinutes = parseTimeToMinutes(DEMO_TIME);
  } else {
    currentMinutes = now.getHours() * 60 + now.getMinutes();
  }

  let found = false;
  const direction = 'from_city';
  const stopsSequence = getStopsSequenceForDirection(direction);

  for (let tripIndex = 0; tripIndex < route4.stops[0].schedule.length; tripIndex++) {
    const tripTimes = stopsSequence.map((stop) => {
      const time = stop.schedule[tripIndex];
      return time ? parseTimeToMinutes(time) : null;
    });

    if (tripTimes.some((t) => t === null)) continue;

    const minTime = Math.min(...tripTimes);
    const maxTime = Math.max(...tripTimes);

    if (currentMinutes >= minTime && currentMinutes <= maxTime) {
      const position = interpolatePosition(tripIndex, stopsSequence, tripTimes, currentMinutes, direction);
      busPosition2.value = position;
      found = true;
      break;
    }
  }

  if (!found) {
    busPosition2.value = [route4.stops[0].lat, route4.stops[0].lng];
  }
}

// Запускаємо оновлення позиції
onMounted(() => {
  updateBusPosition();
  updateBusPosition2();
  timer = window.setInterval(() => {
    updateBusPosition();
    updateBusPosition2();
  }, 5000);
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});
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
