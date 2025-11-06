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
      <MapThankMarkers
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
const zoom = ref(12);
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
