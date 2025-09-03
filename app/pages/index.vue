<template>
  <div>
    <MapContainer v-if="!appStore.isListView" :stores="filteredStores || []" />
    <div v-else class="p-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="store in filteredStores"
          :key="store.id"
          class="relative rounded-lg overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-300 h-64"
          @click="$router.push(`/stores/${store.id}`)"
        >
          <!-- Зображення на всю карточку -->
          <div class="w-full h-full relative overflow-hidden group">
            <img
              :src="store.thumbnail_url"
              alt="Store thumbnail"
              class="w-full h-full object-cover absolute top-0 left-0 transition-transform duration-500 group-hover:scale-110"
              @mousemove="onParallax($event, $event.currentTarget)"
              @mouseleave="resetParallax($event.currentTarget)"
            />
            <!-- Градієнт для затемнення нижньої частини -->
            <div
              class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-80 transition-opacity duration-300"
            />
          </div>
          <!-- Контент карточки поверх зображення -->
          <div class="absolute bottom-0 left-0 p-4 text-white w-full">
            <h3 class="text-lg font-semibold truncate">{{ store.title }}</h3>
            <p class="text-sm text-gray-300 line-clamp-2">{{ store.description }}</p>
            <p class="text-xs text-gray-300 line-clamp-2">{{ store.address }}</p>
            <div class="flex items-center justify-between">
              <p class="text-sm mt-2">{{ store.working_hours }}</p>
              <!-- Рейтинг 4,5 зірки -->
              <div class="flex items-center mt-2 text-yellow-400">
                <!-- Чотири повні зірочки -->
                <UIcon v-for="i in 4" :key="i" name="line-md:star-pulsating-filled-loop" class="w-5 h-5" />
                <!-- Напівзірочка -->
                <UIcon name="line-md:star-pulsating-filled-loop" class="w-5 h-5">
                  <template #default="{ attrs }">
                    <svg v-bind="attrs" class="w-5 h-5" viewBox="0 0 24 24">
                      <defs>
                        <linearGradient id="half-star-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="50%" style="stop-color: #facc15" />
                          <stop offset="50%" style="stop-color: #d1d5db" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M12 .587l3.668 7.431 8.332 1.151-6.001 5.852 1.416 8.247L12 18.897l-7.415 3.869 1.416-8.247-6.001-5.852 8.332-1.151z"
                        fill="url(#half-star-gradient)"
                      />
                    </svg>
                  </template>
                </UIcon>
              </div>
            </div>
          </div>
          <!-- Іконка серця -->
          <div
            class="absolute top-2 right-2 text-gray-400 hover:text-red-500 cursor-pointer transition-colors duration-300"
            @click.stop="toggleLike(store.id)"
          >
            <UIcon
              name="material-symbols:favorite"
              :class="{ 'text-red-500 fill-current': isLiked(store.id) }"
              class="w-6 h-6"
            />
          </div>
          <!-- Позначка "М" -->
          <div class="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">М</div>
        </div>
        <!-- Повідомлення про відсутність магазинів поза циклом -->
        <div v-if="filteredStores.length === 0" class="text-center text-gray-500 mt-4 col-span-full">
          Stores не знайдені
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAppStore } from '~/stores/app.store';
const appStore = useAppStore();

const { $api } = useNuxtApp();
const storesDataApi = ref([]);
const searchTerm = computed(() => appStore.searchTerm);
const isLoading = ref(false);

const likedStores = ref(new Set());

function onParallax(event, el) {
  const { offsetX, offsetY, currentTarget } = event;
  const { clientWidth, clientHeight } = currentTarget;
  const moveX = (offsetX / clientWidth - 0.5) * 20; // макс 20px
  const moveY = (offsetY / clientHeight - 0.5) * 20;
  el.style.transform = `scale(1.1) translate(${moveX}px, ${moveY}px)`;
}

function resetParallax(el) {
  el.style.transform = 'scale(1)';
}

// Перемикання стану "лайка" для конкретного магазину
const toggleLike = (storeId) => {
  if (likedStores.value.has(storeId)) {
    likedStores.value.delete(storeId);
  } else {
    likedStores.value.add(storeId);
  }
};

// Перевірка, чи магазин "лайкнутий"
const isLiked = (storeId) => {
  return likedStores.value.has(storeId);
};

onMounted(async () => {
  if (!searchTerm.value) {
    await fetchStores();
  }
});

const fetchStores = async () => {
  isLoading.value = true;
  try {
    const response = await $api.stores.getStores();
    storesDataApi.value = response.data;
  } catch (error) {
    console.error('Error fetching stores:', error);
  } finally {
    isLoading.value = false;
  }
};

const filteredStores = computed(() => {
  const search = searchTerm.value?.toLowerCase() || '';
  return storesDataApi.value.filter((p) => p.title.toLowerCase().includes(search));
});
</script>
