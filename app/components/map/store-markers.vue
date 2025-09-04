<template>
  <l-layer-group ref="storesGroup" :visible="showStoreMarkers" layer-type="overlay" :name="layerName" />
</template>

<script setup>
import L from 'leaflet';
import 'leaflet.markercluster/dist/leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import { LLayerGroup } from '@vue-leaflet/vue-leaflet';

const storesGroup = ref(null);
const markerClusterGroupStores = ref(null);

const props = defineProps({
  stores: {
    type: Array,
    default: () => [],
  },
  showStoreMarkers: {
    type: Boolean,
    default: true,
  },
  layerName: { type: String, default: null },
});

const typeColors = {
  culture: '#8B5CF6',
  store: '#10B981',
  hotel: '#EF4444',
  service: '#3B82F6',
  market: '#F97316',
  default: '#6B7280',
};

const typeLabels = {
  culture: 'Культура',
  store: 'Магазин',
  hotel: 'Готель',
  service: 'Сервіс',
  market: 'Ринок',
};

const createStoreIcon = (type) => {
  const color = typeColors[type] || typeColors.default;
  return L.divIcon({
    html: createSvgIcon(color),
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

const markerStoreData = computed(() =>
  props.stores.map((store) => ({
    id: store.id,
    slug: store.slug,
    latitude: store.latitude_fact ? store.latitude_fact : store.latitude,
    longitude: store.longitude_fact ? store.longitude_fact : store.longitude,
    address: store.address,
    title: store.title,
    description: store.description,
    working_hours: store.working_hours,
    thumbnail_url: store.thumbnail_url,
    rating: store.rating || 0,
    type: store.type || 'default',
  })),
);

const likedStores = ref(new Set());

const toggleLike = (storeSlug) => {
  if (likedStores.value.has(storeSlug)) {
    likedStores.value.delete(storeSlug);
  } else {
    likedStores.value.add(storeSlug);
  }
  updateMarkers(); // Оновлюємо маркери після зміни стану "лайка"
};

const isLiked = (storeSlug) => {
  return likedStores.value.has(storeSlug);
};

const generateRatingStarsHtml = (rating) => {
  let starsHtml = '';
  for (let n = 1; n <= 5; n++) {
    if (n <= Math.floor(rating)) {
      starsHtml += `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.431 8.332 1.151-6.001 5.852 1.416 8.247L12 18.897l-7.415 3.869 1.416-8.247-6.001-5.852 8.332-1.151z"/></svg>`;
    } else if (n - 0.5 === rating) {
      starsHtml += `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24zM12 15.4V6.1l1.71 4.04 4.38.38-3.32 2.88 1 3.91L12 15.4z"/></svg>`;
    } else {
      starsHtml += `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 fill-current text-gray-400" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21zM12 15.4V6.1l1.71 4.04 4.38.38-3.32 2.88 1 3.91L12 15.4z"/></svg>`;
    }
  }
  return starsHtml;
};

const createStorePopupContent = (store) => {
  const photoURL = store.thumbnail_url ? store.thumbnail_url : '/default-store.png';
  const typeLabel = typeLabels[store.type] || store.type;

  return `
    <div class="relative w-64 h-54 overflow-hidden" style="position: relative;">
      <img src="${photoURL}" alt="${store.title}" class="w-full h-full object-cover absolute top-0 left-0" />
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-80"></div>
      
      <div class="absolute top-2 left-2 text-white text-xs px-2 py-1 rounded-full uppercase" style="background-color: ${typeColors[store.type] || typeColors.default};">
        ${typeLabel}
      </div>

      <a href="/starkon/${store.slug}">
        <div class="absolute bottom-0 left-0 p-3 text-white w-full">
          <h3 class="text-lg font-semibold truncate">${store.title}</h3>
          <p class="text-sm text-gray-300 line-clamp-2">${store.description}</p>
          <p class="text-sm text-gray-300 line-clamp-2">${store.address}</p>
          <p class="text-sm mt-2">${store.working_hours}</p>
        </div>
      </a>
      
      <!-- Іконка серця з обробкою кліку через атрибут data -->
      <div class="absolute top-1 right-3 text-gray-400 hover:text-red-500 cursor-pointer transition-colors duration-300" data-store-slug="${store.slug}">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 ${isLiked(store.slug) ? 'text-red-500 fill-current' : ''}" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>

      <!-- Рейтинг зірок (динамічний) -->
      <div class="absolute bottom-4 right-4 flex items-center text-yellow-400">
        ${generateRatingStarsHtml(store.rating)}
      </div>
    </div>`;
};

const updateMarkers = () => {
  if (!markerClusterGroupStores.value) return;
  markerClusterGroupStores.value.clearLayers();

  if (props.showStoreMarkers) {
    const storeMarkers = markerStoreData.value.map((store) => {
      const marker = L.marker(
        [
          store.latitude_fact ? store.latitude_fact : store.latitude,
          store.longitude_fact ? store.longitude_fact : store.longitude,
        ],
        { icon: createStoreIcon(store.type) },
      );
      marker.bindPopup(createStorePopupContent(store));
      // Додаємо обробник кліку для серця через Leaflet
      marker.on('popupopen', () => {
        const heartElement = document.querySelector(`[data-store-slug="${store.slug}"]`);
        if (heartElement) {
          heartElement.addEventListener(
            'click',
            (e) => {
              e.stopPropagation();
              toggleLike(store.slug);
            },
            { once: true },
          ); // Використовуємо { once: true }, щоб уникнути дублювання слухачів
        }
      });
      return marker;
    });
    markerClusterGroupStores.value.addLayers(storeMarkers);
  }
};

onMounted(() => {
  if (storesGroup.value?.leafletObject) {
    markerClusterGroupStores.value = L.markerClusterGroup();
    updateMarkers();
    storesGroup.value.leafletObject.addLayer(markerClusterGroupStores.value);
  }
});

watch(
  () => [props.showStoreMarkers, props.stores],
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

.leaflet-popup-content svg.fill-current {
  fill: currentColor;
}

.leaflet-popup-content .text-yellow-400 svg {
  color: #fbbf24;
}

.leaflet-popup-content .text-gray-400 svg {
  color: #9ca3af;
}

.leaflet-popup-content .text-red-500 svg {
  color: #ef4444;
}
</style>
