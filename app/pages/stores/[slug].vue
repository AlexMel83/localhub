<template>
  <div>
    <!-- <MetaTags
      :title="store.title || 'Store'"
      :description="store.description || 'Опис бізнесу'"
      :image="store.thumbnail_url"
      :url="`https://localhub.store/sores/${store.slug}`"
      :structured-data="structuredData"
    /> -->
    <!-- Панорама -->
    <div ref="streetViewContainer" class="street-view mb-4 rounded-xl shadow-md overflow-hidden" />

    <!-- Повідомлення про помилку -->
    <div v-if="errorMessage" class="error-message text-red-500 text-left mt-4 dark:text-white">
      {{ errorMessage }}
    </div>

    <!-- Інформація про магазин -->
    <div v-if="store" class="store-container max-w-[800px] mx-auto px-2">
      <h1 class="text-3xl font-bold text-gray-900 text-left my-2 dark:text-white">
        {{ store.title }}
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
        <!-- Рейтинг зірок -->
        <strong>{{ $t('Stores.rating') }}</strong>
        <span class="flex items-center mt-2 text-yellow-400">
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
        </span>
        <span class="ml-2 text-sm text-gray-500 dark:text-gray-300">({{ store.rating.toFixed(1) }})</span>
      </div>

      <div class="text-left mb-2 text-sm italic dark:text-gray-300">
        {{ $t('Stores.createdAt') }} {{ formatDate(store.created_at) }}<br />
        {{ $t('Stores.updatedAt') }} {{ formatDate(store.updated_at) }}
      </div>

      <!-- Товари та акції -->
      <div class="mt-8">
        <h2 class="text-2xl font-semibold my-4 dark:text-white">Наші товари та акції</h2>
        <div class="flex flex-col flex-1 w-full">
          <div class="flex px-4 py-3.5 border-b border-accented">
            <UInput
              v-model="searchTerm"
              color="neutral"
              class="max-w-sm"
              placeholder="Пошук по назві"
              :ui="{ icon: { trailing: { pointer: '' } } }"
              aria-label="Search"
            >
              <template #leading>
                <Icon name="mdi-light:magnify" />
              </template>
              <template #trailing>
                <UButton
                  v-if="searchTerm"
                  color="gray"
                  variant="link"
                  :padded="false"
                  aria-label="Clear search"
                  @click="clearSearch"
                >
                  <Icon name="material-symbols:close-small" />
                </UButton>
              </template>
            </UInput>
          </div>
          <UTable
            ref="table"
            v-model:column-filters="columnFilters"
            sticky
            class="flex-1 max-h-[400px] rounded-xl overflow-auto"
            :data="goods"
            :columns="columns"
            aria-label="Stores"
          />
        </div>
      </div>
      <ShareButtons
        v-if="store.title"
        :page-object="{
          title: store.title,
          description: store.description,
          image: store.thumbnail_url,
        }"
      />
      <!-- кнопки назад -->
      <div class="flex gap-3 my-4 justify-center">
        <UButton icon="i-lucide-map" aria-label="Back to map" @click="goToView(false)">
          {{ $t('Stores.backToMap') }}
        </UButton>
        <UButton icon="i-lucide-list" variant="outline" aria-label="Back to list" @click="goToView(true)">
          {{ $t('Stores.backToList') }}
        </UButton>
      </div>
    </div>

    <!-- Лоадер -->
    <div v-else class="loading py-10 text-center text-gray-500 dark:text-gray-300">Завантаження магазину...</div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, h, resolveComponent } from 'vue';
import { useAppStore } from '@/stores/app.store';
import { useRoute } from 'vue-router';
import axios from 'axios';

const appStore = useAppStore();
const goods = ref([]);
const UBadge = resolveComponent('UBadge');
const UButton = resolveComponent('UButton');
const UIcon = resolveComponent('UIcon');

const route = useRoute();
const streetViewContainer = ref(null);
const currentSlug = ref(route.params.slug); // Змінено з parseInt, оскільки slug може бути рядком
const errorMessage = ref('');
const { $api, $loadGoogleMaps } = useNuxtApp();
const searchTerm = ref('');
const store = ref(null); // Ініціалізація як null

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

const clearSearch = () => {
  searchTerm.value = '';
};

const goToView = (listView = false) => {
  appStore.isListView = listView;
  navigateTo('/');
};

const loadGoodsData = async (url = '') => {
  url = store.value?.price || url;
  if (!url) return;
  try {
    const { data } = await axios.get(url);
    goods.value = data;
  } catch (err) {
    console.error('Помилка завантаження прайсу:', err);
  }
};

const columns = [
  {
    accessorKey: 'id',
    header: '#',
    cell: ({ row }) => `#${row.getValue('id')}`,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Назва товару',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      });
    },
  },
  {
    accessorKey: 'basic_price',
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Ціна',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5 text-right whitespace-normal break-words min-w-[80px] w-full',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      });
    },
    cell: ({ row }) => {
      const value = row.getValue('basic_price');
      if (!value) return '';

      const amount = Number.parseFloat(value);
      if (isNaN(amount)) return '';

      const formatted = new Intl.NumberFormat('uk-UA', {
        style: 'currency',
        currency: 'UAH',
      }).format(amount);

      return h('div', { class: 'text-right font-medium' }, formatted);
    },
  },
  {
    accessorKey: 'action_status',
    header: 'Статус',
    cell: ({ row }) => {
      const status = (row.getValue('action_status') || '').toString().toLowerCase();

      let label = '';
      let color = 'success';

      switch (status) {
        case 'акція':
          label = 'Акція';
          color = 'primary';
          break;
        case 'закінчилась':
          label = 'Закінчилась';
          color = 'error';
          break;
        case 'не почалась':
          label = 'Не почалась';
          color = 'neutral';
          break;
        default:
          return '';
      }

      return h(UBadge, { variant: 'subtle', color }, () => label);
    },
  },
  {
    accessorKey: 'action_price',
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(
        'button',
        {
          class: 'w-full flex items-center justify-end',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        [
          h('span', { class: 'text-center whitespace-normal break-words min-w-[80px]' }, 'Акційна ціна'),
          h(UIcon, {
            name: isSorted
              ? isSorted === 'asc'
                ? 'i-lucide-arrow-up-narrow-wide'
                : 'i-lucide-arrow-down-wide-narrow'
              : 'i-lucide-arrow-up-down',
          }),
        ],
      );
    },
    cell: ({ row }) => {
      const value = row.getValue('action_price');
      if (!value) return '';

      const amount = Number.parseFloat(value);
      if (isNaN(amount)) return '';

      const formatted = new Intl.NumberFormat('uk-UA', {
        style: 'currency',
        currency: 'UAH',
      }).format(amount);

      return h('div', { class: 'text-center font-medium' }, formatted);
    },
  },
  {
    accessorKey: 'action_start',
    header: 'Початок акції',
    cell: ({ row }) => {
      const value = row.getValue('action_start');
      if (!value) return '';

      const date = new Date(value);
      return isNaN(date.getTime()) ? '' : date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
    },
    meta: {
      class: 'text-center',
    },
  },
  {
    accessorKey: 'action_over',
    header: 'Закінчення акції',
    cell: ({ row }) => {
      const value = row.getValue('action_over');
      if (!value) return '';

      const date = new Date(value);
      return isNaN(date.getTime()) ? '' : date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
    },
    meta: {
      class: 'text-center',
    },
  },
  {
    accessorKey: 'photo',
    header: 'Фото товару',
  },
];

const table = useTemplateRef('table');

const columnFilters = ref([
  {
    id: 'name',
    value: '',
  },
]);

const { data: initialStore, error } = useAsyncData('store', async () => {
  try {
    const storeData = await $api.stores.getStoreBySlug(currentSlug.value);
    if (!storeData.data || storeData.data.length === 0) {
      throw new Error('Магазин не знайдено');
    }
    return storeData.data[0];
  } catch (err) {
    errorMessage.value = 'Помилка завантаження магазину: ' + (err.message || 'Невідома помилка');
    return null; // Повертаємо null у випадку помилки
  }
});

const formatDate = (dateString) => {
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  };
  return new Date(dateString).toLocaleString('ru-RU', options);
};

const initStreetView = async () => {
  await $loadGoogleMaps();
  if (initialStore.value && streetViewContainer.value) {
    const location = {
      lat: parseFloat(initialStore.value.latitude),
      lng: parseFloat(initialStore.value.longitude),
    };

    const streetView = new google.maps.StreetViewPanorama(streetViewContainer.value, {
      position: location,
      pov: {
        heading: parseFloat(initialStore.value.heading) || 0,
        pitch: parseFloat(initialStore.value.tilt) - 90 || 0,
      },
      zoom: 0,
    });

    streetView.addListener('zoom_changed', () => {
      const currentZoom = streetView.getZoom();
      console.log('Current zoom:', currentZoom);
      if (document.fullscreenElement && currentZoom !== 0) {
        streetView.setZoom(0);
      }
    });

    document.addEventListener('fullscreenchange', () => {
      if (document.fullscreenElement) {
        streetView.setZoom(0);
      }
    });
  } else {
    console.warn('Контейнер для панорамы не готов або дані панорамы відсутні.');
  }
};

const loadStore = async () => {
  try {
    if (error.value) {
      errorMessage.value = 'Помилка завантаження магазину: ' + (error.value.message || 'Невідома помилка');
      return;
    }
    store.value = initialStore.value;
    await nextTick();
    await initStreetView();
    await loadGoodsData();
  } catch (err) {
    console.error('Помилка ініціалізації store:', err);
    errorMessage.value = 'Помилка ініціалізації: ' + (err.message || 'Невідома помилка');
  }
};

onMounted(async () => {
  await loadStore();
});

watch(searchTerm, (val) => {
  table.value?.tableApi?.getColumn('name')?.setFilterValue(val);
});

const structuredData = computed(() => {
  if (!store.value) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: store.value.title || 'Магазин',
    description: store.value.description || 'Опис магазину',
    url: `https://radavpo.starkon.pp.ua/blogs/${store.value.slug}`,
    image: store.value.thumbnail_url,
    datePublished: store.value.created_at ? new Date(store.value.created_at).toISOString() : undefined,
    dateModified: store.value.updated_at ? new Date(store.value.updated_at).toISOString() : undefined,
    author: {
      '@type': 'Organization',
      name: 'Рада з питань ВПО при Старокостянтинівській міській раді',
      url: 'https://radavpo.starkon.pp.ua',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Рада з питань ВПО при Старокостянтинівській міській раді',
      logo: {
        '@type': 'ImageObject',
        url: 'https://radavpo.starkon.pp.ua/cfhope-logo-transparent.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://localhub.store/stores/${store.value.slug}`,
    },
    keywords: post.value.tags?.join(', ') || 'Рада ВПО, Старокостянтинів, блог, допомога ВПО',
  };
});
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
