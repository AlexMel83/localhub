<template>
  <l-layer-group ref="storesGroup" :visible="showStoreMarkers" layer-type="overlay" :name="layerName" />
</template>

<script setup>
import L from 'leaflet';
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

const createStoreIcon = () => {
  return L.divIcon({
    html: createSvgIcon('#0000ff'),
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
    latitude: store.latitude_fact ? store.latitude_fact : store.latitude,
    longitude: store.longitude_fact ? store.longitude_fact : store.longitude,
    address: store.address,
    title: store.title,
    description: store.description,
    working_hours: store.working_hours,
    thumbnail_url: store.thumbnail_url,
  })),
);

// Зберігання стану "лайків" для кожного магазину
const likedStores = ref(new Set());

// Перемикання стану "лайка" для конкретного магазину
const toggleLike = (storeId) => {
  if (likedStores.value.has(storeId)) {
    likedStores.value.delete(storeId);
  } else {
    likedStores.value.add(storeId);
  }
  // Оновлюємо попапи для відображення змін
  updateMarkers();
};

// Перевірка, чи магазин "лайкнутий"
const isLiked = (storeId) => {
  return likedStores.value.has(storeId);
};

const createStorePopupContent = (store) => {
  const photoURL = store.thumbnail_url ? store.thumbnail_url : './default-store.png';

  // Додаємо іконку серця з логікою
  const heartIcon = `
    <div class="absolute top-1 right-5 text-gray-400 hover:text-red-500 cursor-pointer transition-colors duration-300" onclick="window.vueApp.toggleLike(${store.id}); event.stopPropagation();">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 ${isLiked(store.id) ? 'text-red-500 fill-current' : ''}" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </div>
  `;

  // Імітація рейтингу 4,5 зірки
  const ratingStars = `
    <div class="absolute bottom-4 right-4 flex items-center text-yellow-400">
      ${'<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.431 8.332 1.151-6.001 5.852 1.416 8.247L12 18.897l-7.415 3.869 1.416-8.247-6.001-5.852 8.332-1.151z"/></svg>'.repeat(4)}
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <defs>
          <linearGradient id="half-star-${store.id}" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="50%" style="stop-color: #facc15;" />
            <stop offset="50%" style="stop-color: #d1d5db;" />
          </linearGradient>
        </defs>
        <path d="M12 .587l3.668 7.431 8.332 1.151-6.001 5.852 1.416 8.247L12 18.897l-7.415 3.869 1.416-8.247-6.001-5.852 8.332-1.151z" fill="url(#half-star-${store.id})" />
      </svg>
    </div>
  `;

  return `
    <div class="relative w-64 h-54 overflow-hidden" style="position: relative;">
      <img src="${photoURL}" alt="${store.title}" class="w-full h-full object-cover absolute top-0 left-0" />
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-80"></div>
      <a href="/stores/${store.id}">
      <div class="absolute bottom-0 left-0 p-3 text-white w-full">
          <h3 class="text-lg font-semibold truncate">${store.title}</h3>

        <p class="text-sm text-gray-300 line-clamp-2">${store.description}</p>
        <p class="text-sm text-gray-300 line-clamp-2">${store.address}</p>
        <p class="text-sm mt-2">${store.working_hours}</p>
      </div>
       </a>
      ${heartIcon}
      ${ratingStars}
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
        { icon: createStoreIcon() },
      );
      marker.bindPopup(createStorePopupContent(store));
      return marker;
    });
    markerClusterGroupStores.value.addLayers(storeMarkers);
  }
};

onMounted(() => {
  // Додаємо доступ до vueApp для виклику методів із попапу
  window.vueApp = { toggleLike };
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
</style>
