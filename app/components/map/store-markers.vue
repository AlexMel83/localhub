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
    thumbnail_url: store.thumbnail_url,
  })),
);

const createStorePopupContent = (store) => {
  const photoURL = store.thumbnail_url ? store.thumbnail_url : './default-store.png';
  const address = store.address
    ? `<p><a href="https://www.google.com/maps?q=${encodeURIComponent(
        store.address,
      )}" target="_blank">${store.address}</a></p>`
    : '';

  return `
    <div class="popup-content" style="text-align: center;">
      <a href="/stores/${store.id}">
        <b style="display: block; font-weight: bold; font-size: 130%;">${store.title}</b>
      </a>
      ${address}
      <a href="/stores/${store.id}">
        <img src="${photoURL}" alt="${store.title}" style="max-width: 100%; display: block;" loading="lazy" />
      </a>
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
