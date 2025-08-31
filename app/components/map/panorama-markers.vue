<template>
  <l-layer-group ref="panoramasGroup" :visible="showPanoramaMarkers" layer-type="overlay" :name="layerName" />
</template>

<script setup>
import L from 'leaflet';
import { LLayerGroup } from '@vue-leaflet/vue-leaflet';
const panoramasGroup = ref(null);
const markerClusterGroupPanoramas = ref(null);

const props = defineProps({
  panoramas: {
    type: Array,
    default: () => [],
  },
  showPanoramaMarkers: {
    type: Boolean,
    default: true,
  },
  layerName: { type: String, default: null },
});

const createPanoramaIcon = () => {
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

const markerPanoramaData = computed(() =>
  props.panoramas.map((panorama) => ({
    id: panorama.id,
    latitude: panorama.latitude_fact ? panorama.latitude_fact : panorama.latitude,
    longitude: panorama.longitude_fact ? panorama.longitude_fact : panorama.longitude,
    address: panorama.address,
    title: panorama.title,
    thumbnail_url: panorama.thumbnail_url,
  })),
);

const createPanoramaPopupContent = (panorama) => {
  const photoURL = panorama.thumbnail_url ? panorama.thumbnail_url : './default-memory.png';
  const address = panorama.address
    ? `<p><a href="https://www.google.com/maps?q=${encodeURIComponent(
        panorama.address,
      )}" target="_blank">${panorama.address}</a></p>`
    : '';

  return `
    <div class="popup-content" style="text-align: center;">
      <a href="/panoramas/${panorama.id}">
        <b style="display: block; font-weight: bold; font-size: 130%;">${panorama.title}</b>
      </a>
      ${address}
      <a href="/panoramas/${panorama.id}">
        <img src="${photoURL}" alt="${panorama.title}" style="max-width: 100%; display: block;" loading="lazy" />
      </a>
    </div>`;
};

const updateMarkers = () => {
  if (!markerClusterGroupPanoramas.value) return;
  markerClusterGroupPanoramas.value.clearLayers();

  if (props.showPanoramaMarkers) {
    const panoramaMarkers = markerPanoramaData.value.map((panorama) => {
      const marker = L.marker(
        [
          panorama.latitude_fact ? panorama.latitude_fact : panorama.latitude,
          panorama.longitude_fact ? panorama.longitude_fact : panorama.longitude,
        ],
        { icon: createPanoramaIcon() },
      );
      marker.bindPopup(createPanoramaPopupContent(panorama));
      return marker;
    });
    markerClusterGroupPanoramas.value.addLayers(panoramaMarkers);
  }
};

onMounted(() => {
  if (panoramasGroup.value?.leafletObject) {
    markerClusterGroupPanoramas.value = L.markerClusterGroup();
    updateMarkers();
    panoramasGroup.value.leafletObject.addLayer(markerClusterGroupPanoramas.value);
  }
});

watch(
  () => [props.showPanoramaMarkers, props.panoramas],
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
