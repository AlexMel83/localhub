<template>
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
</template>

<script setup>
import { ref, onMounted, watch, h, resolveComponent } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import axios from 'axios';

const UButton = resolveComponent('UButton');
const UBadge = resolveComponent('UBadge');

defineProps({
  store: {
    type: Object,
    required: true,
  },
});

const searchTerm = ref('');
const columnFilters = ref([
  {
    id: 'name',
    value: '',
  },
]);

const table = useTemplateRef('table');

const clearSearch = () => {
  searchTerm.value = '';
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

const debouncedClearSearch = useDebounceFn(clearSearch, { wait: 1000 });
watch(searchTerm, debouncedClearSearch);

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

onMounted(async () => {
  await loadGoodsData();
});

watch(searchTerm, (val) => {
  table.value?.tableApi?.getColumn('name')?.setFilterValue(val);
});
</script>
