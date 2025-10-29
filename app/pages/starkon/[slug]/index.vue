<template>
  <div>
    <MetaTags
      v-if="businessStore.business?.title"
      :url="`https://localhub.ua/business/${businessStore.business.slug}`"
      :title="businessStore.business.title"
      :description="businessStore.business.description"
      :image="businessStore.business.image"
      :keywords="businessStore.business.keywords"
      business-type="AutoRepair"
      :business-name="businessStore.business.title"
      :business-description="businessStore.business.description"
      :business-phone="businessStore.business.phone"
      :business-email="businessStore.business.email"
      :business-url="`https://localhub.ua/business/${businessStore.business.slug}`"
      :business-logo="businessStore.business.logo"
      :business-address="{
        streetAddress: businessStore.business.address,
        addressLocality: 'Старокостянтинів',
        addressRegion: 'Хмельницька область',
        postalCode: businessStore.business.postalCode,
        addressCountry: 'UA',
      }"
      :business-geo="{
        latitude: businessStore.business.latitude,
        longitude: businessStore.business.longitude,
      }"
      :business-opening-hours="businessStore.business.openingHours"
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
      v-if="businessStore.business && businessStore.business.latitude && businessStore.business.longitude"
      :latitude="businessStore.business.latitude"
      :longitude="businessStore.business.longitude"
      :heading="businessStore.business.heading"
      :tilt="businessStore.business.tilt"
    />

    <!-- Повідомлення про помилку -->
    <div v-if="errorMessage" class="error-message text-red-500 text-left mt-4 dark:text-white">
      {{ errorMessage }}
    </div>

    <!-- Інформація про магазин -->
    <div v-if="businessStore.business" class="store-container max-w-[800px] mx-auto px-2">
      <h1 class="text-3xl font-bold text-gray-900 text-left my-2 dark:text-white">
        {{ businessStore.business.title }} {{ $t('Stores.platform') }}
      </h1>

      <div v-if="businessStore.business.address" class="text-left mb-2 dark:text-white">
        <strong>{{ $t('Stores.address') }}</strong> {{ businessStore.business.address }}
      </div>
      <div v-if="businessStore.business.description" class="text-left mb-2 dark:text-white">
        <strong>{{ $t('Stores.description') }}</strong> {{ businessStore.business.description }}
      </div>
      <div v-if="businessStore.business.contacts" class="text-left mb-2 dark:text-white">
        <strong>{{ $t('Stores.contacts') }}</strong> {{ businessStore.business.contacts }}
      </div>
      <div v-if="businessStore.business.working_hours" class="text-left mb-2 dark:text-white">
        <strong>{{ $t('Stores.workingHours') }}</strong> {{ businessStore.business.working_hours }}
      </div>
      <div v-if="businessStore.business?.type" class="text-left mb-2 dark:text-white">
        <strong>{{ $t('Stores.type') }}</strong>
        <span
          v-if="businessStore.business.type"
          :class="typeStyles[businessStore.business.type] || typeStyles.default"
          class="text-white text-xs px-2 py-1 rounded-full uppercase"
        >
          {{ typeLabels[businessStore.business.type] || businessStore.business.type }}
        </span>
      </div>
      <div v-if="businessStore.business.rating" class="text-left mb-4 dark:text-white flex items-center gap-2">
        <strong>{{ $t('Stores.rating') }}</strong>
        <span class="flex items-center mt-2 text-yellow-400">
          <template v-for="n in 5" :key="n">
            <template v-if="n <= Math.floor(businessStore.business.rating)">
              <UIcon name="line-md:star-pulsating-filled-loop" class="w-5 h-5" />
            </template>
            <template v-else-if="n - 0.5 === businessStore.business.rating">
              <UIcon name="material-symbols:star-half" class="w-5 h-5" />
            </template>
            <template v-else>
              <UIcon name="line-md:star" class="w-5 h-5 text-gray-400" />
            </template>
          </template>
        </span>
        <span class="ml-2 text-sm text-gray-500 dark:text-gray-300"
          >({{ businessStore.business.rating.toFixed(1) }})</span
        >
      </div>

      <div
        v-if="businessStore.business.created_at && businessStore.business.updated_at"
        class="text-left mb-2 text-sm italic dark:text-gray-300"
      >
        {{ $t('Stores.createdAt') }} {{ formatDate(businessStore.business.created_at) }}<br />
        {{ $t('Stores.updatedAt') }} {{ formatDate(businessStore.business.updated_at) }}
      </div>

      <!-- Товари та акції -->
      <LoadGoods
        v-if="businessStore.business.slug && businessStore.business.price"
        :price="businessStore.business.price"
      />
      <ShareButtons
        v-if="businessStore.business.title"
        :page-object="{
          title: businessStore.business.title,
          description: businessStore.business.description,
          image: businessStore.business.thumbnail_url,
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
import { useRoute } from 'vue-router';
import { useRuntimeConfig } from '#imports';
const apiBase = useRuntimeConfig().public.apiBase || 'https://api.localhub.store';
const route = useRoute();

const businessStore = useBusinessStore();

// const { getBusinessBySlug } = useBusiness();
watchEffect(async () => {
  if (route.params.slug) {
    await businessStore.getBusinessBySlug(route.params.slug, apiBase);
  }
});
const loadPanorama = defineAsyncComponent(() => import('~/components/load/panorama.vue'));

const UButton = resolveComponent('UButton');
const UIcon = resolveComponent('UIcon');

const errorMessage = ref('');

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
  appbusiness.isListView = listView;
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
