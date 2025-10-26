<template>
  <div>
    <MetaTags
      v-if="store?.title"
      :url="`https://localhub.ua/business/${business.slug}`"
      :title="business.title"
      :description="business.description"
      :image="business.image"
      :keywords="business.keywords"
      business-type="AutoRepair"
      :business-name="business.title"
      :business-description="business.description"
      :business-phone="business.phone"
      :business-email="business.email"
      :business-url="`https://localhub.ua/business/${business.slug}`"
      :business-logo="business.logo"
      :business-address="{
        streetAddress: business.address,
        addressLocality: 'Старокостянтинів',
        addressRegion: 'Хмельницька область',
        postalCode: business.postalCode,
        addressCountry: 'UA',
      }"
      :business-geo="{
        latitude: business.latitude,
        longitude: business.longitude,
      }"
      :business-opening-hours="business.openingHours"
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
      v-if="store && business.latitude && business.longitude"
      :latitude="business.latitude"
      :longitude="business.longitude"
      :heading="business.heading"
      :tilt="business.tilt"
    />

    <!-- Повідомлення про помилку -->
    <div v-if="errorMessage" class="error-message text-red-500 text-left mt-4 dark:text-white">
      {{ errorMessage }}
    </div>

    <!-- Інформація про магазин -->
    <div v-if="store" class="store-container max-w-[800px] mx-auto px-2">
      <h1 class="text-3xl font-bold text-gray-900 text-left my-2 dark:text-white">
        {{ business.title }} {{ $t('Stores.platform') }}
      </h1>

      <div v-if="business.address" class="text-left mb-2 dark:text-white">
        <strong>{{ $t('Stores.address') }}</strong> {{ business.address }}
      </div>
      <div v-if="business.description" class="text-left mb-2 dark:text-white">
        <strong>{{ $t('Stores.description') }}</strong> {{ business.description }}
      </div>
      <div v-if="business.contacts" class="text-left mb-2 dark:text-white">
        <strong>{{ $t('Stores.contacts') }}</strong> {{ business.contacts }}
      </div>
      <div v-if="business.working_hours" class="text-left mb-2 dark:text-white">
        <strong>{{ $t('Stores.workingHours') }}</strong> {{ business.working_hours }}
      </div>
      <div v-if="business.type" class="text-left mb-2 dark:text-white">
        <strong>{{ $t('Stores.type') }}</strong>
        <span
          v-if="business.type"
          :class="typeStyles[business.type] || typeStyles.default"
          class="text-white text-xs px-2 py-1 rounded-full uppercase"
        >
          {{ typeLabels[business.type] || business.type }}
        </span>
      </div>
      <div v-if="business.rating" class="text-left mb-4 dark:text-white flex items-center gap-2">
        <strong>{{ $t('Stores.rating') }}</strong>
        <span class="flex items-center mt-2 text-yellow-400">
          <template v-for="n in 5" :key="n">
            <template v-if="n <= Math.floor(business.rating)">
              <UIcon name="line-md:star-pulsating-filled-loop" class="w-5 h-5" />
            </template>
            <template v-else-if="n - 0.5 === business.rating">
              <UIcon name="material-symbols:star-half" class="w-5 h-5" />
            </template>
            <template v-else>
              <UIcon name="line-md:star" class="w-5 h-5 text-gray-400" />
            </template>
          </template>
        </span>
        <span class="ml-2 text-sm text-gray-500 dark:text-gray-300">({{ business.rating.toFixed(1) }})</span>
      </div>

      <div v-if="business.created_at && business.updated_at" class="text-left mb-2 text-sm italic dark:text-gray-300">
        {{ $t('Stores.createdAt') }} {{ formatDate(business.created_at) }}<br />
        {{ $t('Stores.updatedAt') }} {{ formatDate(business.updated_at) }}
      </div>

      <!-- Товари та акції -->
      <LoadGoods v-if="business.slug && business.price" :price="business.price" />
      <ShareButtons
        v-if="business.title"
        :page-object="{
          title: business.title,
          description: business.description,
          image: business.thumbnail_url,
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

const { getBusinessBySlug } = useBusiness();
const { slug } = useRoute().params;

const loadPanorama = defineAsyncComponent(() => import('~/components/load/panorama.vue'));

const UButton = resolveComponent('UButton');
const UIcon = resolveComponent('UIcon');
const store = ref({});

const errorMessage = ref('');

const business = await getBusinessBySlug(slug);

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
