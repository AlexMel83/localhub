<template>
  <div class="p-2 sm:p-4 max-w-[1600px] mx-auto">
    <MetaTags
      :title="$t('SvitloCherga.title')"
      :description="$t('SvitloCherga.description')"
      :image="'/svitlo-cherga.jpg'"
    />
    <div class="flex w-full flex-col sm:flex-row gap-1">
      <!-- Заголовок -->
      <UCard class="mb-4 flex-shrink">
        <template #header>
          <div class="flex flex-col gap-3">
            <div>
              <h1 class="text-xl sm:text-2xl font-bold">{{ $t('SvitloCherga.title') }}</h1>
              <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {{ $t('SvitloCherga.sourceData') }}
                <a href="https://svitlo.live" target="_blank" class="text-blue-500 hover:underline"> svitlo.live </a>
              </p>
            </div>

            <div class="flex flex-col gap-2">
              <!-- Селект області -->
              <select
                v-model="selectedRegionCpu"
                class="flex-1 max-w-50 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-sm"
              >
                <option value="" disabled>{{ $t('SvitloCherga.selectRegion') }}</option>
                <option v-for="r in regionsOptions" :key="r.value" :value="r.value">
                  {{ r.label }}
                </option>
              </select>

              <!-- Селект черги -->
              <select
                v-if="selectedRegion"
                v-model="selectedQueue"
                class="flex-1 max-w-30 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-sm"
              >
                <option value="all">{{ $t('SvitloCherga.allQueues') }}</option>
                <option v-for="q in sortedQueues" :key="q" :value="q">{{ q }}</option>
              </select>

              <client-only>
                <UButton :loading="loading" color="primary" class="max-w-30 text-center" @click="fetchData">
                  {{ $t('SvitloCherga.update') }}
                </UButton>
              </client-only>
            </div>
          </div>
        </template>
      </UCard>
      <!-- Легенда -->
      <UCard v-if="selectedRegion" class="mb-4 flex-1">
        <div class="flex flex-col gap-4">
          <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ $t('SvitloCherga.legend') }}
          </div>

          <!-- Є світло -->
          <div class="flex flex-col gap-3">
            <div class="flex items-start gap-3">
              <div class="w-5 h-5 bg-gray-100 border border-black flex-shrink-0 mt-0.5" />
              <div>
                <div class="text-sm font-medium">{{ $t('SvitloCherga.electricityUp') }}</div>
                <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  <template v-if="upPeriods.length > 0 && selectedQueue !== 'all'">
                    <span v-for="(period, i) in upPeriods" :key="i">
                      {{ period }}
                      <span v-if="i < upPeriods.length - 1">, </span>
                    </span>
                  </template>
                  <span v-else-if="selectedQueue !== 'all'" class="text-gray-500">{{
                    $t('SvitloCherga.noPeriods')
                  }}</span>
                </div>
              </div>
            </div>

            <!-- Немає світла -->
            <div class="flex items-start gap-3">
              <div class="w-5 h-5 bg-blue-300 border border-black flex-shrink-0 mt-0.5" />
              <div>
                <div class="text-sm font-medium">{{ $t('SvitloCherga.electricityDown') }}</div>
                <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  <template v-if="downPeriods.length > 0 && selectedQueue !== 'all'">
                    <span v-for="(period, i) in downPeriods" :key="i">
                      {{ period }}
                      <span v-if="i < downPeriods.length - 1">, </span>
                    </span>
                  </template>
                  <span v-else-if="selectedQueue !== 'all'" class="text-gray-500">{{
                    $t('SvitloCherga.noPeriods')
                  }}</span>
                </div>
              </div>
            </div>

            <!-- Невідомо -->
            <div class="flex items-center gap-3">
              <div class="w-5 h-5 bg-gray-500 border border-black flex-shrink-0" />
              <span class="text-sm">{{ $t('SvitloCherga.electricityUnknown') }}</span>
            </div>
          </div>
        </div>
      </UCard>
    </div>
    <client-only>
      <!-- Завантаження / Помилки -->
      <UCard v-if="loading">
        <div class="py-8 text-center">
          <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
        </div>
      </UCard>

      <UCard v-else-if="error">
        <UAlert color="red" variant="soft" :title="'Помилка: ' + error" />
      </UCard>

      <!-- Коли немає обраної області -->
      <UCard v-if="!selectedRegion">
        <div class="py-8 text-center text-sm text-gray-500">
          {{ $t('SvitloCherga.selectRegionChart') }}
        </div>
      </UCard>

      <!-- Таблиця -->
      <UCard v-if="isMounted && selectedRegion">
        <div v-if="!hasAnySchedule" class="py-8 text-center text-sm text-gray-500">
          {{ $t('SvitloCherga.noSchedule') }}
        </div>

        <div v-else class="space-y-6">
          <!-- Для кожної дати -->
          <div v-for="dateInfo in displayedDatesInfo" :key="dateInfo.date">
            <h3 class="text-base sm:text-lg font-medium mb-3">{{ dateInfo.date }} — {{ dateInfo.label }}</h3>

            <div class="border rounded-lg dark:border-gray-700 overflow-hidden">
              <div class="overflow-x-auto">
                <div class="max-h-[500px] overflow-y-auto">
                  <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead class="bg-gray-50 dark:bg-gray-800 sticky top-0 z-20">
                      <tr>
                        <th
                          class="px-1 py-2 text-center text-xs font-medium sticky left-0 bg-gray-50 dark:bg-gray-800 z-30"
                        >
                          {{ $t('SvitloCherga.queue') }}
                        </th>
                        <th
                          v-for="hour in times"
                          :key="hour"
                          class="p-2 py-5 text-center text-xs font-medium text-gray-500 dark:text-gray-400 relative border border-black"
                        >
                          <div
                            class="absolute inset-0 flex items-center justify-center rotate-180 [writing-mode:vertical-rl] sm:rotate-0 sm:[writing-mode:horizontal-tb]"
                          >
                            <span class="inline-block whitespace-nowrap">
                              {{ hour }}
                            </span>
                          </div>
                        </th>
                      </tr>
                    </thead>

                    <tbody class="bg-white dark:bg-gray-900">
                      <tr v-for="queue in filteredQueues" :key="queue">
                        <td
                          class="px-1 py-1 text-center text-xs font-medium sticky left-0 bg-white dark:bg-gray-900 z-10 border-b"
                        >
                          {{ queue }}
                        </td>
                        <td v-for="hour in times" :key="hour" class="p-0 border-b">
                          <div
                            class="w-full h-6"
                            :class="getCellClass(queue, dateInfo.date, hour)"
                            :title="`${hour} | ${queue}`"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
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

import { useRoute, useRouter } from 'vue-router';

const API = 'https://svitlo-proxy.svitlo-proxy.workers.dev/';
const { t: $t } = useI18n();
const route = useRoute();
const router = useRouter();

interface Region {
  cpu: string;
  name_ua: string;
  schedule: Record<string, Record<string, Record<string, number>>> | null;
}

interface Data {
  date_today: string;
  date_tomorrow: string;
  regions: Region[];
}

const {
  data: dataFetch,
  pending: loading,
  error,
  refresh: fetchData,
} = useFetch<Data>(API, {
  server: false,
  default: () => ({ regions: [], date_today: '', date_tomorrow: '' }) as Data,
});

const selectedRegionCpu = ref('');
const selectedQueue = ref('all');

// 1. Пріоритет URL-параметра
if (route.query.region) {
  selectedRegionCpu.value = String(route.query.region);
}
if (route.query.queue) {
  selectedQueue.value = String(route.query.queue);
}
watch(selectedQueue, (val) => {
  if (!val) return;
  router.replace({ query: { ...route.query, queue: val } });
});

// 2. Якщо не задано — ставимо Хмельницьку
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

// 3. Оновлюємо URL при зміні
watch(selectedRegionCpu, (val) => {
  if (!val) return;
  router.replace({ query: { ...route.query, region: val } });
});

// Генерація погодинно
const times = Array.from({ length: 24 }, (_, h) => `${h.toString().padStart(2, '0')}:00`);

const regionsOptions = computed(() => {
  return (dataFetch.value?.regions || [])
    .filter((r: Region) => r.schedule !== null)
    .map((r: Region) => ({ label: r.name_ua, value: r.cpu }));
});

const selectedRegion = computed(() => {
  if (!selectedRegionCpu.value || !dataFetch.value?.regions) return null;
  return dataFetch.value.regions.find((r) => r.cpu === selectedRegionCpu.value) || null;
});
const filteredQueues = computed(() => {
  if (!selectedRegion.value?.schedule) return [];
  if (selectedQueue.value === 'all') return sortedQueues.value;
  return sortedQueues.value.includes(selectedQueue.value) ? [selectedQueue.value] : [];
});

const hasAnySchedule = computed(() => selectedRegion.value?.schedule !== null);

const sortedQueues = computed(() => {
  if (!selectedRegion.value?.schedule) return [];
  return Object.keys(selectedRegion.value.schedule).sort((a, b) => {
    const [a1, a2] = a.split('.').map(Number);
    const [b1, b2] = b.split('.').map(Number);
    return a1 - b1 || a2 - b2;
  });
});

const hasValidTomorrowData = computed(() => {
  if (!selectedRegion.value?.schedule || !dataFetch.value?.date_tomorrow) return false;
  return Object.values(selectedRegion.value.schedule).some((queue) =>
    Object.values(queue?.[dataFetch.value.date_tomorrow] || {}).some((v) => v !== 0),
  );
});

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

// Старі дані API → беремо 30-хв інтервали
function getCellValue(queue: string, date: string, time: string): number | null {
  return selectedRegion.value?.schedule?.[queue]?.[date]?.[time] ?? null;
}

// Варіант A: якщо 2 — година = 2
function getHourlyValue(queue: string, date: string, hour: string): number | null {
  const t1 = `${hour}`;
  const t2 = `${hour.replace(':00', ':30')}`;

  const v1 = getCellValue(queue, date, t1);
  const v2 = getCellValue(queue, date, t2);

  if (v1 === 2 || v2 === 2) return 2;
  if (v1 === 1 && v2 === 1) return 1;
  return 0; // unknown
}

function getCellClass(queue: string, date: string, hour: string): string {
  const v = getHourlyValue(queue, date, hour);

  if (v === 2) return 'bg-blue-300 border border-black';
  if (v === 1) return 'bg-gray-100 border border-black';
  return 'bg-gray-500 border border-black';
}

function formatPeriods(hours: number[]): string[] {
  if (hours.length === 0) return [];
  const sorted = [...hours].sort((a, b) => a - b);
  const result: string[] = [];
  let start = sorted[0];
  let prev = sorted[0];

  for (let i = 1; i <= sorted.length; i++) {
    const curr = sorted[i] ?? prev + 1;
    if (curr !== prev + 1 || i === sorted.length) {
      const startStr = `${start.toString().padStart(2, '0')}:00`;
      const endStr =
        prev === start
          ? startStr
          : `${prev.toString().padStart(2, '0')}:00–${(prev + 1).toString().padStart(2, '0')}:00`;
      result.push(prev === start ? startStr : `${startStr}–${(prev + 1).toString().padStart(2, '0')}:00`);
      start = curr;
    }
    prev = curr;
  }
  return result;
}

// Періоди зі світлом (1) та без (2)
const upPeriods = computed(() => {
  const hours: number[] = [];
  if (!selectedRegion.value?.schedule) return [];

  const queues = selectedQueue.value === 'all' ? sortedQueues.value : filteredQueues.value;
  const dates = displayedDatesInfo.value.map((d) => d.date);

  for (const queue of queues) {
    for (const date of dates) {
      for (let h = 0; h < 24; h++) {
        const hourStr = `${h.toString().padStart(2, '0')}:00`;
        const val = getHourlyValue(queue, date, hourStr);
        if (val === 1) {
          // є світло
          if (!hours.includes(h)) hours.push(h);
        }
      }
    }
  }

  return formatPeriods(hours);
});

const downPeriods = computed(() => {
  const hours: number[] = [];
  if (!selectedRegion.value?.schedule) return [];

  const queues = selectedQueue.value === 'all' ? sortedQueues.value : filteredQueues.value;
  const dates = displayedDatesInfo.value.map((d) => d.date);

  for (const queue of queues) {
    for (const date of dates) {
      for (let h = 0; h < 24; h++) {
        const hourStr = `${h.toString().padStart(2, '0')}:00`;
        const val = getHourlyValue(queue, date, hourStr);
        if (val === 2) {
          // немає світла
          if (!hours.includes(h)) hours.push(h);
        }
      }
    }
  }

  return formatPeriods(hours);
});

const isMounted = ref(false);
onMounted(() => {
  isMounted.value = true;
});
</script>

<style scoped>
thead th:first-child,
tbody td:first-child {
  position: sticky;
  left: 0;
  z-index: 10;
}

thead th {
  position: sticky;
  top: 0;
  z-index: 20;
}

thead th:not(:first-child),
tbody td:not(:first-child) {
  min-width: 15px;
}

@media (min-width: 640px) {
  thead th:not(:first-child),
  tbody td:not(:first-child) {
    min-width: 40px;
    width: 40px;
  }
}
</style>
