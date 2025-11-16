<template>
  <div class="p-2 sm:p-4 max-w-[1600px] mx-auto">
    <MetaTags
      :title="$t('SvitloCherga.title')"
      :description="$t('SvitloCherga.description')"
      :image="'/panoimg/svitlo-cherga.jpg'"
    />
    <!-- Заголовок -->
    <UCard class="mb-4">
      <template #header>
        <div class="flex flex-col gap-3">
          <div>
            <h1 class="text-xl sm:text-2xl font-bold">{{ $t('SvitloCherga.title') }}</h1>
            <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {{ $t('SvitloCherga.sourceData') }}
              <a
                href="https://svitlo.live"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-500 hover:underline"
                >svitlo.live</a
              >
            </p>
          </div>

          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <select
              v-model="selectedRegionCpu"
              class="flex-1 sm:min-w-[220px] px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-sm"
            >
              <option value="" disabled>{{ $t('SvitloCherga.selectRegion') }}</option>
              <option v-for="r in regionsOptions" :key="r.value" :value="r.value">
                {{ r.label }}
              </option>
            </select>

            <client-only>
              <UButton :loading="loading" color="primary" class="w-full sm:w-auto" @click="fetchData">
                {{ $t('SvitloCherga.update') }}
              </UButton>
              <template #fallback>
                <UButton color="primary" class="w-full sm:w-auto" @click="fetchData">
                  {{ $t('SvitloCherga.update') }}
                </UButton>
              </template>
            </client-only>
          </div>
        </div>
      </template>
    </UCard>

    <!-- Легенда та дати -->
    <client-only>
      <UCard v-if="selectedRegion" class="mb-4">
        <div class="flex flex-col gap-3">
          <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div class="text-xs sm:text-sm">
              {{ $t('SvitloCherga.date') }} <strong>{{ dataFetch?.date_today }}</strong>
            </div>
            <div v-if="hasValidTomorrowData" class="text-xs sm:text-sm">
              {{ $t('SvitloCherga.next') }} <strong>{{ dataFetch?.date_tomorrow }}</strong>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 bg-gray-100 border border-black flex-shrink-0" />
              <span class="text-xs sm:text-sm">{{ $t('SvitloCherga.electricityDown') }}</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 bg-green-500 border border-black flex-shrink-0" />
              <span class="text-xs sm:text-sm">{{ $t('SvitloCherga.electricityUp') }}</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 bg-white border border-black flex-shrink-0" />
              <span class="text-xs sm:text-sm">{{ $t('SvitloCherga.electricityUnknown') }}</span>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Завантаження та помилки -->
      <UCard v-if="loading">
        <div class="py-8 text-center">
          <div class="flex items-center justify-center gap-2">
            <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
            <span class="text-sm">{{ $t('SvitloCherga.loading') }}</span>
          </div>
        </div>
      </UCard>

      <UCard v-else-if="error">
        <UAlert color="red" variant="soft" :title="'Помилка: ' + error" />
      </UCard>

      <!-- Вибір області -->
      <UCard v-if="!selectedRegion">
        <div class="py-8 text-center text-sm text-gray-500">{{ $t('SvitloCherga.selectRegionChart') }}</div>
      </UCard>

      <!-- Графік у шаховому порядку (транспонований) -->
      <UCard v-if="isMounted && selectedRegion">
        <template #header>
          <div class="flex flex-col gap-2">
            <h2 class="text-lg sm:text-xl font-semibold">{{ selectedRegion.name_ua }}</h2>
            <p class="text-xs sm:text-sm text-gray-500">{{ $t('SvitloCherga.chartTitle') }}</p>
          </div>
        </template>

        <div v-if="!hasAnySchedule" class="py-8 text-center text-sm text-gray-500">
          {{ $t('SvitloCherga.noSchedule') }}
        </div>

        <div v-else class="space-y-6">
          <!-- Таблиця для кожної дати -->
          <div v-for="dateInfo in displayedDatesInfo" :key="dateInfo.date">
            <div class="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h3 class="text-base sm:text-lg font-medium">{{ dateInfo.date }} — {{ dateInfo.label }}</h3>
              <span v-if="!dateInfo.hasData" class="text-xs sm:text-sm text-gray-500">
                {{ $t('SvitloCherga.noData') }}
              </span>
            </div>

            <div v-if="dateInfo.hasData" class="border rounded-lg dark:border-gray-700 overflow-hidden">
              <div class="max-h-[500px] overflow-y-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead class="bg-gray-50 dark:bg-gray-800 sticky top-0 z-20">
                    <tr>
                      <th
                        class="px-2 sm:px-3 py-2 text-center text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-gray-800 z-30"
                      >
                        {{ $t('SvitloCherga.queue') }}
                      </th>
                      <th
                        v-for="(queue, index) in sortedQueues"
                        :key="queue"
                        class="px-2 py-2 text-center text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800"
                        :class="{ 'border-l-2 border-gray-400 dark:border-gray-500': index > 0 }"
                      >
                        {{ queue }}
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-gray-900">
                    <tr v-for="time in times" :key="time">
                      <td
                        class="px-2 sm:px-3 py-1 text-center whitespace-nowrap text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 sticky left-0 bg-white dark:bg-gray-900 z-10 border-b border-gray-200 dark:border-gray-700"
                      >
                        {{ time }}
                      </td>
                      <td
                        v-for="(queue, index) in sortedQueues"
                        :key="queue"
                        class="p-0 border-b border-gray-200 dark:border-gray-700"
                        :class="{ 'border-l-2 border-gray-400 dark:border-gray-500': index > 0 }"
                      >
                        <div
                          class="w-full h-8 sm:h-10"
                          :class="getCellClass(queue, dateInfo.date, time)"
                          :title="`${time} | ${queue} | ${getCellValue(queue, dateInfo.date, time)}`"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Статистика -->
          <UCard>
            <template #header>
              <h3 class="text-base sm:text-lg font-semibold">{{ $t('SvitloCherga.statistics') }}</h3>
            </template>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div v-for="queue in sortedQueues" :key="queue" class="p-3 border rounded-lg dark:border-gray-700">
                <div class="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{{ queue }}</div>
                <div class="space-y-1">
                  <div class="flex items-center justify-between text-xs">
                    <span>{{ $t('SvitloCherga.hours') }}</span>
                    <strong
                      >{{ getQueueStats(queue, dataFetch.date_today).hours }}
                      {{ $t('SvitloCherga.hoursShort') }}</strong
                    >
                  </div>
                  <div class="flex items-center justify-between text-xs">
                    <span>{{ $t('SvitloCherga.percentage') }}</span>
                    <strong>{{ getQueueStats(queue, dataFetch.date_today).percentage }}%</strong>
                  </div>
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </UCard>
    </client-only>
    <ShareButtons
      class="max-w-[800px]"
      :url="'https://localhub.store/svitlo-cherga'"
      :page-object="{ title: $t('SvitloCherga.title') }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useFetch } from 'nuxt/app';

const API = 'https://svitlo-proxy.svitlo-proxy.workers.dev/';
const { t: $t } = useI18n();

interface Region {
  cpu: string;
  name_ua: string;
  name_ru: string;
  name_en: string;
  schedule: Record<string, Record<string, Record<string, number>>> | null;
}

interface Data {
  date_today: string;
  date_tomorrow: string;
  regions: Region[];
}

// Використовуємо useFetch як composable
const {
  data: dataFetch,
  pending: loading,
  error,
  refresh: fetchData,
} = useFetch<Data>(API, {
  server: false,
  default: () => ({ regions: [], date_today: '', date_tomorrow: '' }) as Data,
});

// Автоматичний вибір Хмельницької
const selectedRegionCpu = ref('');

watch(
  dataFetch,
  (newData) => {
    if (!selectedRegionCpu.value && newData?.regions) {
      const khmel = newData.regions.find((r: Region) => r.name_ua === 'Хмельницька');
      if (khmel) selectedRegionCpu.value = khmel.cpu;
    }
  },
  { immediate: true },
);

// Генерація часу
const times = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2)
    .toString()
    .padStart(2, '0');
  const m = i % 2 === 0 ? '00' : '30';
  return `${h}:${m}`;
});

// Опції регіонів
const regionsOptions = computed(() => {
  return (dataFetch.value?.regions || [])
    .filter((r: Region) => r.schedule !== null)
    .map((r: Region) => ({ label: r.name_ua, value: r.cpu }));
});

// Обраний регіон
const selectedRegion = computed(() => {
  if (!selectedRegionCpu.value || !dataFetch.value?.regions) return null;
  return dataFetch.value.regions.find((r) => r.cpu === selectedRegionCpu.value) || null;
});

const hasAnySchedule = computed(() => selectedRegion.value?.schedule !== null);

// Сортування черг
const sortedQueues = computed(() => {
  if (!selectedRegion.value?.schedule) return [];
  return Object.keys(selectedRegion.value.schedule).sort((a, b) => {
    const [a1, a2] = a.split('.').map(Number);
    const [b1, b2] = b.split('.').map(Number);
    return a1 - b1 || a2 - b2;
  });
});

// Чи є дані на завтра
const hasValidTomorrowData = computed(() => {
  if (!selectedRegion.value?.schedule || !dataFetch.value?.date_tomorrow) return false;
  return Object.values(selectedRegion.value.schedule).some((queue: unknown) =>
    Object.values((queue as Record<string, unknown>)[dataFetch.value.date_tomorrow] || {}).some((v) => v !== 0),
  );
});

// Дати для відображення
const displayedDatesInfo = computed(() => {
  const dates = [];
  if (dataFetch.value?.date_today) {
    dates.push({ date: dataFetch.value.date_today, label: $t('SvitloCherga.today'), hasData: true });
  }
  if (dataFetch.value?.date_tomorrow && hasValidTomorrowData.value) {
    dates.push({ date: dataFetch.value.date_tomorrow, label: $t('SvitloCherga.tomorrow'), hasData: true });
  }
  return dates;
});

// Функції
function getCellValue(queue: string, date: string, time: string): number | null {
  return selectedRegion.value?.schedule?.[queue]?.[date]?.[time] ?? null;
}

function getCellClass(queue: string, date: string, time: string): string {
  const v = getCellValue(queue, date, time);
  if (v === 2) return 'bg-gray-100 border border-black';
  if (v === 1) return 'bg-green-500';
  if (v === 0) return 'bg-white border border-black';
  return 'bg-gray-100 dark:bg-gray-700';
}

function getQueueStats(queue: string, date: string) {
  const day = selectedRegion.value?.schedule?.[queue]?.[date];
  if (!day) return { hours: 0, percentage: 0 };
  const values = Object.values(day);
  const off = values.filter((v) => v === 2).length;
  return {
    hours: off * 0.5,
    percentage: ((off / values.length) * 100).toFixed(1),
  };
}

const isMounted = ref(false);
onMounted(() => {
  isMounted.value = true;
});
</script>

<style scoped>
/* Фіксована ширина для колонки часу */
tbody td:first-child,
thead th:first-child {
  min-width: 60px;
}

@media (min-width: 640px) {
  tbody td:first-child,
  thead th:first-child {
    min-width: 80px;
  }
}
</style>
