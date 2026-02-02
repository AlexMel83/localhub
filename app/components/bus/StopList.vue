<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useAppStore } from '../../stores/app.store';
import { type Stop, STOPS, getRoutesForStop, getArrivalsForStop, ROUTE_COLORS } from '../../data/bus-routes/mockData';

const appStore = useAppStore();
const searchQuery = ref('');
const selectedRoutes = ref<string[]>([]);
const selectedStop = ref<Stop | null>(null);
const isStopPanelOpen = ref(false);

// Reactive theme from store
const isDarkMode = computed(() => appStore.isDark);

// Get all unique routes across all stops
const allRoutes = computed(() => {
  const routeSet = new Set<string>();
  STOPS.forEach((stop) => {
    const routes = getRoutesForStop(stop.name);
    routes.forEach((r) => routeSet.add(r));
  });
  return Array.from(routeSet).sort((a, b) => Number(a) - Number(b));
});

// Initialize filters with all routes by default
onMounted(() => {
  if (selectedRoutes.value.length === 0 && allRoutes.value.length > 0) {
    selectedRoutes.value = [...allRoutes.value];
  }
});

// Filter stops by search query and selected routes
const filteredStops = computed(() => {
  let result = STOPS;

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter((stop) => stop.name.toLowerCase().includes(query));
  }

  // Filter by selected routes
  if (selectedRoutes.value.length > 0) {
    result = result.filter((stop) => {
      const stopRoutes = getRoutesForStop(stop.name);
      return selectedRoutes.value.some((r) => stopRoutes.includes(r));
    });
  }

  return result;
});

const getRouteColor = (routeId: string) => {
  return ROUTE_COLORS[routeId] || ROUTE_COLORS['default'];
};

const openStopPanel = (stop: Stop) => {
  selectedStop.value = stop;
  isStopPanelOpen.value = true;
};

const closeStopPanel = () => {
  isStopPanelOpen.value = false;
  setTimeout(() => {
    selectedStop.value = null;
  }, 400);
};

const toggleRoute = (routeId: string) => {
  const index = selectedRoutes.value.indexOf(routeId);
  if (index > -1) {
    selectedRoutes.value.splice(index, 1);
  } else {
    selectedRoutes.value.push(routeId);
  }
};

const clearFilters = () => {
  searchQuery.value = '';
  selectedRoutes.value = [...allRoutes.value];
};

// Calculate next arrival for a specific stop
const getNextArrival = (stop: Stop) => {
  const arrivals = getArrivalsForStop(stop.name, new Date());
  if (arrivals.length === 0) return null;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return arrivals.find((a) => a.minutes >= currentMinutes);
};

// Get all arrivals for a stop (for display)
const getAllArrivals = (stop: Stop) => {
  return getArrivalsForStop(stop.name, new Date());
};
</script>

<template>
  <div class="bus-stops-list" :class="{ 'light-mode': !isDarkMode }">
    <div class="list-container">
      <!-- Header -->
      <div class="header-section">
        <h1 class="page-title">Розклад автобусів</h1>
      </div>

      <!-- Search and Filter Section -->
      <div class="search-filter-section">
        <div class="search-box">
          <input v-model="searchQuery" type="text" placeholder="Пошук остановки..." class="search-input" />
          <span v-if="searchQuery" class="clear-search" @click="searchQuery = ''">×</span>
        </div>

        <!-- Route Filter -->
        <div v-if="allRoutes.length > 0" class="route-filter">
          <div class="filter-label">Маршрути:</div>
          <div class="route-pills">
            <button
              v-for="routeId in allRoutes"
              :key="routeId"
              class="route-pill"
              :class="{ active: selectedRoutes.includes(routeId) }"
              :style="{
                backgroundColor: selectedRoutes.includes(routeId)
                  ? getRouteColor(routeId)
                  : 'rgba(255, 255, 255, 0.07)',
                borderColor: selectedRoutes.includes(routeId) ? getRouteColor(routeId) : 'rgba(255, 255, 255, 0.15)',
              }"
              @click="toggleRoute(routeId)"
            >
              {{ routeId }}
            </button>
          </div>
        </div>

        <!-- Clear Filters Button -->
        <button v-if="searchQuery || selectedRoutes.length > 0" class="clear-filters-btn" @click="clearFilters">
          Очистити фільтри
        </button>

        <!-- Results Counter -->
        <div class="results-counter">{{ filteredStops.length }} з {{ STOPS.length }} остановок</div>
      </div>

      <!-- Stops List -->
      <div class="stops-list">
        <div v-if="filteredStops.length === 0" class="empty-state">
          <p>Остановок не знайдено</p>
          <button class="retry-btn" @click="clearFilters">Скинути фільтри</button>
        </div>

        <div v-for="stop in filteredStops" :key="stop.id" class="stop-card" @click="openStopPanel(stop)">
          <div class="stop-header">
            <h3 class="stop-name">{{ stop.name }}</h3>
            <span class="routes-badge"> {{ getRoutesForStop(stop.name).length }} маршрут(і) </span>
          </div>

          <div class="stop-routes">
            <span
              v-for="routeId in getRoutesForStop(stop.name)"
              :key="routeId"
              class="route-tag"
              :style="{ backgroundColor: getRouteColor(routeId) }"
            >
              № {{ routeId }}
            </span>
          </div>

          <div class="next-arrival">
            <div class="arrivals-preview">
              <span v-if="getAllArrivals(stop).length > 0" class="arrival-label">Рейси:</span>
              <div v-if="getAllArrivals(stop).length > 0" class="times-list">
                <span
                  v-for="(arrival, idx) in getAllArrivals(stop)"
                  :key="idx"
                  class="time-badge"
                  :style="{ backgroundColor: arrival.color }"
                  :class="{ 'white-text': ['4', '7'].includes(arrival.routeId) }"
                >
                  {{ arrival.time }}
                </span>
              </div>
              <span v-else class="no-arrivals">Немає рейсів сьогодні</span>
            </div>
          </div>

          <div class="click-hint">Натисніть для деталей →</div>
        </div>
      </div>
    </div>

    <!-- Stop Details Panel (using existing StopInfo component) -->
    <ClientOnly>
      <Teleport to="body">
        <div v-if="isStopPanelOpen" class="stop-panel-overlay" @click="closeStopPanel" />
      </Teleport>
    </ClientOnly>
    <bus-stop-info :stop="selectedStop" :is-open="isStopPanelOpen" @close="closeStopPanel" />
  </div>
</template>

<style scoped>
.bus-stops-list {
  min-height: 100vh;
  /* background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); */
  padding-bottom: 80px;
  transition: all 0.3s ease;
  /* color: #ffffff; */
}

.bus-stops-list.light-mode {
  /* background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); */
  /* color: #1a202c; */
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 0;
}

.page-title {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.light-mode .page-title {
  /* color: #1a202c; */
}

.list-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 16px;
}

.search-filter-section {
  /* background: rgba(30, 41, 59, 0.5); */
  /* border: 1px solid rgba(255, 255, 255, 0.1); */
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.light-mode .search-filter-section {
  /* background: rgba(255, 255, 255, 0.7); */
  /* border-color: rgba(0, 0, 0, 0.1); */
}

.search-box {
  position: relative;
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  /* background: rgba(0, 0, 0, 0.4); */
  /* border: 1px solid rgba(255, 255, 255, 0.2); */
  border-radius: 8px;
  /* color: #ffffff; */
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;
}

.search-input::placeholder {
  /* color: rgba(255, 255, 255, 0.4); */
}

.search-input:focus {
  border-color: rgba(59, 130, 246, 0.5);
  /* background: rgba(0, 0, 0, 0.6); */
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.2);
}

.light-mode .search-input {
  /* background: rgba(255, 255, 255, 0.9); */
  /* border-color: rgba(0, 0, 0, 0.15); */
  /* color: #1a202c; */
}

.light-mode .search-input::placeholder {
  /* color: rgba(0, 0, 0, 0.4); */
}

.light-mode .search-input:focus {
  border-color: rgba(59, 130, 246, 0.8);
  /* background: rgba(255, 255, 255, 1); */
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.3);
}

.clear-search {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  /* color: rgba(255, 255, 255, 0.5); */
  font-size: 24px;
  line-height: 1;
  transition: color 0.2s;
}

.clear-search:hover {
  /* color: rgba(255, 255, 255, 0.8); */
}

.route-filter {
  margin-bottom: 16px;
}

.filter-label {
  font-size: 0.85rem;
  font-weight: 700;
  /* color: rgba(255, 255, 255, 0.6); */
  text-transform: uppercase;
  margin-bottom: 8px;
  display: block;
}

.light-mode .filter-label {
  /* color: rgba(0, 0, 0, 0.6); */
}

.route-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.route-pill {
  padding: 6px 14px;
  /* background: rgba(255, 255, 255, 0.07); */
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  /* color: rgba(255, 255, 255, 0.8); */
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.route-pill:hover {
  border-color: rgba(255, 255, 255, 0.3);
}

.route-pill.active {
  /* color: #ffffff; */
}

.clear-filters-btn {
  display: block;
  width: 100%;
  padding: 10px;
  /* background: rgba(255, 255, 255, 0.1); */
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  /* color: rgba(255, 255, 255, 0.8); */
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 12px;
}

.clear-filters-btn:hover {
  /* background: rgba(255, 255, 255, 0.15); */
  border-color: rgba(255, 255, 255, 0.3);
}

.results-counter {
  font-size: 0.85rem;
  /* color: rgba(255, 255, 255, 0.5); */
  text-align: center;
}

.stops-list {
  display: grid;
  gap: 12px;
}

.stop-card {
  /* background: rgba(30, 41, 59, 0.8); */
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  backdrop-filter: blur(10px);
}

.stop-card:hover {
  /* background: rgba(30, 41, 59, 1); */
  border-color: rgba(59, 130, 246, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.light-mode .stop-card {
  /* background: rgba(255, 255, 255, 0.9); */
  border-color: rgba(0, 0, 0, 0.1);
}

.light-mode .stop-card:hover {
  /* background: rgba(255, 255, 255, 1); */
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.stop-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.stop-name {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  /* color: #ffffff; */
  flex: 1;
}

.light-mode .stop-name {
  /* color: #1a202c; */
}

.routes-badge {
  /* background: rgba(59, 130, 246, 0.2); */
  color: rgba(59, 130, 246, 1);
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  margin-left: 8px;
}

.stop-routes {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.route-tag {
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 700;
  /* color: #ffffff; */
}

.next-arrival {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.arrivals-preview {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.arrival-label {
  font-size: 0.85rem;
  /* color: rgba(255, 255, 255, 0.6); */
  font-weight: 600;
  white-space: nowrap;
}

.times-list {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.time-badge {
  font-size: 0.8rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  padding: 2px 6px;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
}

.time-badge.white-text {
  color: #ffffff;
}

.click-hint {
  font-size: 0.75rem;
  /* color: rgba(255, 255, 255, 0.3); */
  text-align: right;
}

.no-arrivals {
  font-size: 0.85rem;
  /* color: rgba(255, 255, 255, 0.4); */
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 20px;
}

.empty-state p {
  font-size: 1.1rem;
  /* color: rgba(255, 255, 255, 0.5); */
  margin-bottom: 16px;
}

.retry-btn {
  padding: 10px 20px;
  /* background: rgba(59, 130, 246, 0.2); */
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 6px;
  color: rgba(59, 130, 246, 1);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn:hover {
  /* background: rgba(59, 130, 246, 0.3); */
  border-color: rgba(59, 130, 246, 0.6);
}

.stop-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* background: rgba(0, 0, 0, 0.2); */
  z-index: 1999;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 640px) {
  .list-container {
    padding: 12px;
  }

  .search-filter-section {
    padding: 12px;
  }

  .stop-card {
    padding: 12px;
  }

  .stop-name {
    font-size: 1rem;
  }

  .route-pills {
    gap: 6px;
  }

  .route-pill {
    padding: 5px 10px;
    font-size: 0.8rem;
  }
}
</style>
