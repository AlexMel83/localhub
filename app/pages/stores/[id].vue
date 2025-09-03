<template>
  <div>
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
                  @click="clearSearch"
                  aria-label="Clear search"
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
            class="flex-1 max-h-[400px] rounded-xl overflow-hidden"
            :data="goods"
            :columns="columns"
            aria-label="Stores"
          />
        </div>
      </div>
      <!-- кнопки -->
      <div class="flex gap-3 my-4 justify-center">
        <UButton icon="i-lucide-map" @click="goToView(false)" aria-label="Back to map">
          {{ $t('Stores.backToMap') }}
        </UButton>
        <UButton icon="i-lucide-list" variant="outline" @click="goToView(true)" aria-label="Back to list">
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
const currentId = ref(parseInt(route.params.id));
const errorMessage = ref('');
const { $api, $loadGoogleMaps } = useNuxtApp();
const searchTerm = ref('');

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
        class: '-mx-2.5 text-right whitespace-normal break-words min-w-[80px] w-full', // щоб вирівняти вправо
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

const { data: store } = useAsyncData('store', async () => {
  const storeData = await $api.stores.getStoreById(currentId.value);
  return storeData.data[0];
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
  if (store.value && streetViewContainer.value) {
    const location = {
      lat: parseFloat(store.value.latitude),
      lng: parseFloat(store.value.longitude),
    };

    const streetView = new google.maps.StreetViewPanorama(streetViewContainer.value, {
      position: location,
      pov: {
        heading: parseFloat(store.value.heading) || 0,
        pitch: parseFloat(store.value.tilt) - 90 || 0,
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
    console.warn('Контейнер для панорамы не готов или данные панорамы отсутствуют.');
  }
};

const loadStore = async () => {
  try {
    const response = await $api.stores.getStoreById(currentId.value);
    store.value = response.data[0];
    await nextTick();
    initStreetView();
  } catch (error) {
    console.error('Ошибка загрузки store:', error);
  }
};

onMounted(async () => {
  await loadStore();
  await loadGoodsData();
});

watch(searchTerm, (val) => {
  table?.value?.tableApi?.getColumn('name')?.setFilterValue(val);
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
