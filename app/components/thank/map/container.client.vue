<!-- app/components/map/ThankContainer.client.vue -->
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
      <ThankMapMarkers
        :stores="stores"
        :show-store-markers="showStoreMarkers"
        layer-name="Знижки для військових"
        @marker-click="$emit('marker-click', $event)"
      />
      <LControlScale position="bottomright" :imperial="false" :metric="true" />
    </LMap>
  </section>
</template>

<script setup>
import { TILE_PROVIDERS } from '@/constants/map-config';
import { LControlLayers, LControlScale, LMap, LTileLayer } from '@vue-leaflet/vue-leaflet';

defineProps({
  stores: { type: Array, default: () => [] },
});

defineEmits(['marker-click']);

const center = ref([49.42, 26.98]); // Хмельницький
const zoom = ref(13);
const showStoreMarkers = ref(true);
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
