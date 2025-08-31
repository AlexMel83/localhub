<template>
  <div
    class="w-auto absolute top-[15px] left-[30px] md:left-[60px] z-[2] flex gap-4 px-6 pb-8 md:px-0 md:py-0 bg-transparent"
  >
    <!--Search-->
    <div class="relative flex-1 max-w-[225px] sm:min-w-[350px]">
      <UInput
        v-model="searchQuery"
        :ui="{ icon: { trailing: { pointer: '' } } }"
        type="text"
        :placeholder="$t('Map.searchPlaceholder')"
        autocomplete="off"
        @input="search"
        @focus="$emit('toggleSearchResults')"
      >
        <template #leading>
          <span>
            <magnifying-glass-icon class="text-black dark:text-white" />
          </span>
        </template>

        <template #trailing>
          <button
            v-show="searchQuery !== ''"
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            @click="searchQuery = ''"
          >
            <icons-close-icon class="icon-class" />
          </button>
        </template>
      </UInput>
      <!--Search result-->
      <div class="absolute mt-2 w-full">
        <!--Results-->
        <div
          v-if="searchQuery && searchResults"
          class="max-h-[150px] overflow-y-auto overflow-x-hidden bg-white rounded-md"
        >
          <!--Loading-->
          <LoadingSpinner v-if="!searchData" />
          <div v-else>
            <div
              v-for="(result, index) in searchData"
              :key="index"
              class="px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-slate-600 hover:text-white"
              @click="selectResult(result)"
            >
              <IconsGeoPin class="size-6" />
              <p class="text-xs">
                {{ result.place_name_uk }}
              </p>
            </div>
          </div>
        </div>
        <!--Selected Search Result-->
        <div
          v-if="selectedResult"
          class="mt-2 px-3 py-3 bg-white rounded-md relative"
        >
          <IconsCloseIcon
            class="size-5 absolute top-2 right-2 cursor-pointer"
            @click="removeResult"
          />
          <h1 class="text-lg">
            {{ selectedResult.text }}
          </h1>
          <p class="text-xs mb-1">{{ selectedResult.place_name }},</p>
          <p class="text-xs">
            {{ selectedResult.properties.category }}
          </p>
        </div>
      </div>
    </div>
    <!--Geolocation-->
    <div
      class="py-1 px-1 flex items-center shadow-md rounded-md min-h-[32px] bg-primary cursor-pointer hover:bg-primary-600 dark:hover:bg-primary-500"
      :class="{ 'bg-primary-300': coords, 'bg-white': !coords }"
      @click="$emit('getGeoLocation')"
    >
      <IconsGeoPin
        class="size-6 text-slate-600 hover:scale-110 text-[25px]"
        :class="{
          'text-black': coords,
          'animate-pulse': fetchCoords,
        }"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from "vue";
import axios from "axios";
import { useRuntimeConfig } from "#app";
import MagnifyingGlassIcon from "~/components/icons/MagnifyingGlassIcon.vue";

const props = defineProps({
  coords: {
    type: Object,
    default: null,
  },
  fetchCoords: {
    type: Boolean,
    default: false,
  },
  searchResults: {
    type: Boolean,
    default: false,
  },
  map: {
    type: Object,
    default: null,
  },
  resultMarker: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits([
  "toggleSearchResults",
  "getGeoLocation",
  "selectedResult",
  "plotResult",
  "removeResult",
]);

const searchQuery = ref(null);
const searchData = ref(null);
const queryTimeout = ref(null);
const selectedResult = ref(null);
const config = useRuntimeConfig();

const apiBase = config.public.apiBase;

const search = () => {
  clearTimeout(queryTimeout.value);

  searchData.value = null;
  queryTimeout.value = setTimeout(async () => {
    if (searchQuery.value !== "") {
      const params = new URLSearchParams({
        fuzzyMatch: true,
        language: "uk",
        limit: 10,
        proximity: props.coords
          ? `${props.coords.lng},${props.coords.lat}`
          : "0,0",
      });
      console.log(apiBase);
      try {
        const { data } = await axios.get(
          `${apiBase}/geosearch/${searchQuery.value}?${params}`
        );

        searchData.value = data.features;
      } catch (error) {
        console.error("Error fetching search data:", error);
      }
    }
  }, 750);
};

const selectResult = (result) => {
  selectedResult.value = result;
  emit("plotResult", result.geometry);
  emit("selectedResult", result);
};

const removeResult = () => {
  selectedResult.value = null;
  emit("removeResult");
};

// Clean up timeout on component unmount
onUnmounted(() => {
  clearTimeout(queryTimeout.value);
});

watch(searchQuery, () => {
  search();
});
</script>
