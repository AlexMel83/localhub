<template>
  <div>
    <div ref="streetViewContainer" class="street-view mb-2" />

    <div v-if="errorMessage" class="error-message text-red-500 text-left mt-4 dark:text-white">
      {{ errorMessage }}
    </div>
    <div v-if="panorama" class="panorama-container max-w-[800px] mx-auto px-2">
      <h1 class="text-3xl font-bold text-gray-900 text-left my-2 dark:text-white">
        {{ panorama.title }}
      </h1>
      <div v-if="panorama.address" class="text-left mb-3 dark:text-white">
        {{ $t('Panoramas.address') }}
        {{ panorama.address || $t('Panoramas.addressNotAvailable') }}
      </div>

      <div v-if="panorama.description" class="text-left mb-3 dark:text-white">
        {{ $t('Panoramas.description') }} {{ panorama.description }}
      </div>

      <div v-if="panorama.shooting_date" class="text-left mb-3 dark:text-white">
        {{ $t('Panoramas.shootingDate') }}
        {{ formatDate(panorama.shooting_date) }}
      </div>
      <div>
        <h2>Наші товари та акції</h2>
        <div class="flex flex-col flex-1 w-full">
          <div class="flex px-4 py-3.5 border-b border-accented">
            <UInput
              :model-value="table?.tableApi?.getColumn('name')?.getFilterValue()"
              class="max-w-sm"
              placeholder="Пошук по назві"
              @update:model-value="table?.tableApi?.getColumn('name')?.setFilterValue($event)"
            />
          </div>

          <UTable
            ref="table"
            v-model:column-filters="columnFilters"
            sticky
            class="flex-1 max-h-[312px]"
            :data="goods"
            :columns="columns"
          />
        </div>
      </div>
    </div>
    <div v-else class="loading">
      {{ $t('Panoramas.back') }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, h, resolveComponent } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const goods = ref([]);
const UBadge = resolveComponent('UBadge');
const UButton = resolveComponent('UButton');
const UIcon = resolveComponent('UIcon');

const route = useRoute();
const streetViewContainer = ref(null);
const currentId = ref(parseInt(route.params.id));
const errorMessage = ref('');
const { $api, $loadGoogleMaps } = useNuxtApp();

const loadGoodsData = async (url = '') => {
  url =
    'https://script.google.com/macros/s/AKfycbzfUqCk_D9bM1tmHgTeA_v8wmRzSMqYFI1qSPW0Ln8TpI5LNqxKHZs8lr0ffu8Vy4tM/exec';
  axios.get(url).then((data) => {
    goods.value = data.data;
    console.log(goods.value);
  });
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

const { data: panorama } = useAsyncData('panorama', async () => {
  const panoramaData = await $api.panoramas.getPanoramaById(currentId.value);
  return panoramaData.data[0];
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
  if (panorama.value && streetViewContainer.value) {
    const location = {
      lat: parseFloat(panorama.value.latitude),
      lng: parseFloat(panorama.value.longitude),
    };

    const streetView = new google.maps.StreetViewPanorama(streetViewContainer.value, {
      position: location,
      pov: {
        heading: parseFloat(panorama.value.heading) || 0,
        pitch: parseFloat(panorama.value.tilt) - 90 || 0,
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

const loadPanorama = async () => {
  try {
    const response = await $api.panoramas.getPanoramaById(currentId.value);
    panorama.value = response.data[0];
    await nextTick();
    initStreetView();
  } catch (error) {
    console.error('Ошибка загрузки панорамы:', error);
  }
};

onMounted(async () => {
  await loadPanorama();
  await loadGoodsData();
});
</script>

<style scoped>
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
