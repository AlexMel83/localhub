<template>
  <div>
    <MetaTags
      :title="'LocalHub - Старокостянтинів'"
      :description="$t('HowToHelp.intro')"
      :image="'/panoimg/Mototehnika.jpg'"
    />
    <MapContainer v-if="!appStore.isListView" :stores="filteredStores || []" />
    <div v-else class="p-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="store in filteredStores"
          :key="store.slug"
          class="relative rounded-lg overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-300 h-64"
          @click="$router.push(`/starkon/${store.slug}`)"
        >
          <!-- Зображення на всю карточку -->
          <div class="w-full h-full relative overflow-hidden group">
            <NuxtImg
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
              <!-- Рейтинг зірок -->
              <div class="flex items-center mt-2 text-yellow-400">
                <template v-for="n in 5" :key="n">
                  <template v-if="n <= Math.floor(store.rating)">
                    <!-- Повні зірочки -->
                    <UIcon name="line-md:star-pulsating-filled-loop" class="w-5 h-5" />
                  </template>
                  <template v-else-if="n - 0.5 === store.rating">
                    <!-- Напівзірочка (використовуємо material-symbols:star-half) -->
                    <UIcon name="material-symbols:star-half" class="w-5 h-5" />
                  </template>
                  <template v-else>
                    <!-- Пусті зірочки -->
                    <UIcon name="line-md:star" class="w-5 h-5 text-gray-400" />
                  </template>
                </template>
              </div>
            </div>
          </div>
          <!-- Іконка серця -->
          <div
            class="absolute top-2 right-2 text-gray-400 hover:text-red-500 cursor-pointer transition-colors duration-300"
            @click.stop="toggleLike(store.slug)"
          >
            <UIcon
              name="material-symbols:favorite"
              :class="{ 'text-red-500 fill-current': isLiked(store.slug) }"
              class="w-6 h-6"
            />
          </div>
          <!-- Динамічна позначка типу об'єкта -->
          <div
            v-if="store.type"
            :class="typeStyles[store.type] || typeStyles.default"
            class="absolute top-2 left-2 text-white text-xs px-2 py-1 rounded-full uppercase"
          >
            {{ typeLabels[store.type] || store.type }}
          </div>
        </div>
        <!-- Повідомлення про відсутність магазинів поза циклом -->
        <div v-if="filteredStores.length === 0" class="text-center text-gray-500 mt-4 col-span-full">
          Stores не знайдені
        </div>
      </div>
      <ShareButtons
        class="max-w-[800px]"
        :url="'https://localhub.store'"
        :page-object="{ title: 'LocalHub - Starkon' }"
      />
    </div>
  </div>
</template>

<script setup>
import { useAppStore, useStoresStore } from '~/stores/app.store';
const appStore = useAppStore();
const storesStore = useStoresStore();

const { $customApi } = useNuxtApp();
const searchTerm = computed(() => appStore.searchTerm);

const likedStores = ref(new Set());

const typeStyles = {
  culture: 'bg-purple-600',
  store: 'bg-green-600',
  hotel: 'bg-red-600',
  service: 'bg-blue-600',
  market: 'bg-orange-600',
  default: 'bg-gray-500',
};

const typeLabels = {
  culture: 'Культура',
  store: 'Магазин',
  hotel: 'Готель',
  service: 'Сервіс',
  market: 'Ринок',
};

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
  await storesStore.fetchStores($customApi);
});

const filteredStores = computed(() => {
  const search = searchTerm.value?.toLowerCase() || '';
  return storesStore.stores.filter((p) => p.title.toLowerCase().includes(search));
});
</script>
