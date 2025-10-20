<template>
  <div>
    <MetaTags
      v-if="store.title"
      :url="`https://localhub.ua/business/${store.slug}`"
      :title="store.title"
      :description="store.description"
      :image="store.image"
      :keywords="store.keywords"
      business-type="AutoRepair"
      :business-name="store.title"
      :business-description="store.description"
      :business-phone="store.phone"
      :business-email="store.email"
      :business-url="`https://localhub.ua/business/${store.slug}`"
      :business-logo="store.logo"
      :business-address="{
        streetAddress: store.address,
        addressLocality: 'Старокостянтинів',
        addressRegion: 'Хмельницька область',
        postalCode: store.postalCode,
        addressCountry: 'UA',
      }"
      :business-geo="{
        latitude: store.latitude,
        longitude: store.longitude,
      }"
      :business-opening-hours="store.openingHours"
      :faq="[
        {
          question: 'Які послуги надає ваше СТО?',
          answer: 'Ми ремонтуємо ходову, двигун, проводимо діагностику та ТО.',
        },
        { question: 'Чи можна записатися онлайн?', answer: 'Так, ви можете записатися через сайт або подзвонити нам.' },
        { question: 'Які години роботи?', answer: 'Пн–Пт: 09:00–18:00, Сб: 10:00–15:00.' },
      ]"
    />

    <!-- Ледаче завантаження панорами -->
    <component
      :is="loadPanorama"
      v-if="store && store.latitude && store.longitude"
      :latitude="store.latitude"
      :longitude="store.longitude"
      :heading="store.heading"
      :tilt="store.tilt"
    />

    <!-- Повідомлення про помилку -->
    <div v-if="errorMessage" class="error-message text-red-500 text-left mt-4 dark:text-white">
      {{ errorMessage }}
    </div>

    <!-- Інформація про магазин -->
    <div v-if="store" class="store-container max-w-[800px] mx-auto px-2">
      <h1 class="text-3xl font-bold text-gray-900 text-left my-2 dark:text-white">
        {{ store.title }} {{ $t('Stores.platform') }}
      </h1>

      <div v-if="store.address" class="text-left mb-2 dark:text-white">
        <strong>{{ $t('Stores.address') }}</strong> {{ store.address }}
      </div>
      <div v-if="store.description" class="text-left mb-2 dark:text-white">
        <strong>{{ $t('Stores.description') }}</strong> {{ store.description }}
      </div>
      <div v-if="store.contacts" class="text-left mb-2 dark:text-white">
        <strong>{{ $t('Stores.contacts') }}</strong> {{ store.contacts }}
      </div>
      <div v-if="store.working_hours" class="text-left mb-2 dark:text-white">
        <strong>{{ $t('Stores.workingHours') }}</strong> {{ store.working_hours }}
      </div>
      <div v-if="store.type" class="text-left mb-2 dark:text-white">
        <strong>{{ $t('Stores.type') }}</strong>
        <span
          v-if="store.type"
          :class="typeStyles[store.type] || typeStyles.default"
          class="text-white text-xs px-2 py-1 rounded-full uppercase"
        >
          {{ typeLabels[store.type] || store.type }}
        </span>
      </div>
      <div v-if="store.rating" class="text-left mb-4 dark:text-white flex items-center gap-2">
        <strong>{{ $t('Stores.rating') }}</strong>
        <span class="flex items-center mt-2 text-yellow-400">
          <template v-for="n in 5" :key="n">
            <template v-if="n <= Math.floor(store.rating)">
              <UIcon name="line-md:star-pulsating-filled-loop" class="w-5 h-5" />
            </template>
            <template v-else-if="n - 0.5 === store.rating">
              <UIcon name="material-symbols:star-half" class="w-5 h-5" />
            </template>
            <template v-else>
              <UIcon name="line-md:star" class="w-5 h-5 text-gray-400" />
            </template>
          </template>
        </span>
        <span class="ml-2 text-sm text-gray-500 dark:text-gray-300">({{ store.rating.toFixed(1) }})</span>
      </div>

      <div v-if="store.created_at && store.updated_at" class="text-left mb-2 text-sm italic dark:text-gray-300">
        {{ $t('Stores.createdAt') }} {{ formatDate(store.created_at) }}<br >
        {{ $t('Stores.updatedAt') }} {{ formatDate(store.updated_at) }}
      </div>

      <!-- Товари та акції -->
      <LoadGoods v-if="store.slug && store.price" :price="store.price" />
      <ShareButtons
        v-if="store.title"
        :page-object="{
          title: store.title,
          description: store.description,
          image: store.thumbnail_url,
        }"
      />
      <div class="flex gap-3 my-4 justify-center">
        <UButton icon="i-lucide-map" aria-label="Back to map" @click="goToView(false)">
          {{ $t('Stores.backToMap') }}
        </UButton>
        <UButton icon="i-lucide-list" variant="outline" aria-label="Back to list" @click="goToView(true)">
          {{ $t('Stores.backToList') }}
        </UButton>
      </div>
    </div>

    <div v-else class="loading py-10 text-center text-gray-500 dark:text-gray-300">Завантаження магазину...</div>
  </div>
</template>

<script setup>
import { ref, defineAsyncComponent } from 'vue';
import { useAppStore, useStoresStore } from '@/stores/app.store';
import { useRoute } from 'vue-router';

const loadPanorama = defineAsyncComponent(() => import('~/components/load/panorama.vue'));

const appStore = useAppStore();
const storesStore = useStoresStore();
const UButton = resolveComponent('UButton');
const UIcon = resolveComponent('UIcon');
const store = ref({});

const route = useRoute();
const errorMessage = ref('');
const { $customApi } = useNuxtApp();

onMounted(async () => {
  const s = await storesStore.fetchStoreBySlug($customApi, route.params.slug);
  if (!s) {
    errorMessage.value = 'Магазин не знайдено';
  } else {
    store.value = s;
  }
});

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

const goToView = (listView = false) => {
  appStore.isListView = listView;
  navigateTo('/');
};

const formatDate = (dateString) => {
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  };
  return new Date(dateString).toLocaleString('uk-UA', options);
};
</script>

<style scoped>
.store-container {
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

h2 {
  border-bottom: 2px solid var(--color-border, #e5e7eb);
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.panorama-container {
  display: flex;
  flex-direction: column;
}

.street-view {
  width: 100%;
  height: 500px;
}

.loading {
  text-align: center;
  font-size: 1.5em;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
