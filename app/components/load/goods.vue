<template>
  <div class="mt-8">
    <h2 class="text-2xl font-semibold my-4">{{ $t('Stores.goods') }}</h2>
    <div v-if="errorMessage" class="text-red-500 text-center p-4 dark:text-white">
      {{ errorMessage }}
    </div>
    <div v-else class="flex flex-col w-full">
      <div class="flex px-4 py-3.5 border-b border-accented">
        <UInput
          v-model="searchTerm"
          color="neutral"
          class="max-w-sm"
          :placeholder="$t('Stores.goodsSearch')"
          :ui="{ icon: { trailing: { pointer: '' } } }"
          aria-label="Search"
          @update:model-value="$emit('update:searchTerm', $event)"
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
        class="max-h-[400px] rounded-xl overflow-auto"
        :data="goods"
        :columns="columns"
        aria-label="Stores"
        @update:column-filters="$emit('update:columnFilters', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, h, resolveComponent, onMounted, watch } from 'vue';
import { useStoresStore } from '~/stores/app.store';

const props = defineProps({
  price: {
    type: String,
    required: true,
  },
  searchTerm: {
    type: String,
    default: '',
  },
  columnFilters: {
    type: Array,
    default: () => [{ id: 'name', value: '' }],
  },
});

const storesStore = useStoresStore();
const emit = defineEmits(['update:searchTerm', 'update:columnFilters']);

const goods = ref([]);
const errorMessage = computed(() => storesStore.goodsError[props.price] || '');

const UButton = resolveComponent('UButton');
const UBadge = resolveComponent('UBadge');
const UIcon = resolveComponent('UIcon');
const searchTerm = ref(props.searchTerm);
const table = useTemplateRef('table');
const columnFilters = ref([...props.columnFilters]);

const clearSearch = () => {
  searchTerm.value = '';
  emit('update:searchTerm', '');
};

onMounted(async () => {
  goods.value = await storesStore.fetchGoods(props.price);
});

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
        label: $t('Stores.goodsName'),
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
        label: $t('Stores.price'),
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
    header: $t('Stores.status'),
    cell: ({ row }) => {
      const status = (row.getValue('action_status') || '').toString().toLowerCase();

      let label = '';
      let color = 'success';

      switch (status) {
        case 'акція':
          label = $t('Stores.promo');
          color = 'primary';
          break;
        case 'закінчилась':
          label = $t('Stores.ended');
          color = 'error';
          break;
        case 'не почалась':
          label = $t('Stores.notStarted');
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
          h('span', { class: 'text-center whitespace-normal break-words min-w-[80px]' }, $t('Stores.promoPrice')),
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
    header: $t('Stores.startPromo'),
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
    header: $t('Stores.endPromo'),
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
    header: $t('Stores.goodsPhoto'),
  },
];

watch(searchTerm, (val) => {
  table.value?.tableApi?.getColumn('name')?.setFilterValue(val);
  emit('update:searchTerm', val);
});

watch(
  () => props.columnFilters,
  (newFilters) => {
    columnFilters.value = [...newFilters];
  },
  { deep: true },
);
</script>
