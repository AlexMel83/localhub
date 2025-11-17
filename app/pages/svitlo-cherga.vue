<template>
  <div class="p-2 sm:p-4 max-w-[1600px] mx-auto">
    <MetaTags
      :title="$t('SvitloCherga.title')"
      :description="$t('SvitloCherga.description')"
      :image="'/svitlo-cherga.jpg'"
    />

    <!-- Заголовок -->
    <UCard class="mb-4">
      <template #header>
        <div class="flex flex-col gap-3">
          <div>
            <h1 class="text-xl sm:text-2xl font-bold">{{ $t('SvitloCherga.title') }}</h1>
            <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {{ $t('SvitloCherga.sourceData') }}
              <a href="https://svitlo.live" target="_blank" class="text-blue-500 hover:underline"> svitlo.live </a>
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
            </client-only>
          </div>
        </div>
      </template>
    </UCard>

    <!-- Легенда -->
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
              <span class="text-xs sm:text-sm">{{ $t('SvitloCherga.electricityUp') }}</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 bg-blue-300 border border-black flex-shrink-0" />
              <span class="text-xs sm:text-sm">{{ $t('SvitloCherga.electricityDown') }}</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 bg-gray-500 border border-black flex-shrink-0" />
              <span class="text-xs sm:text-sm">{{ $t('SvitloCherga.electricityUnknown') }}</span>
            </div>
          </div>
        </div>
      </UCard>

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
        <template #header>
          <h2 class="text-lg sm:text-xl font-semibold">{{ selectedRegion.name_ua }}</h2>
        </template>

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
                          class="px-3 py-2 text-center text-xs font-medium sticky left-0 bg-gray-50 dark:bg-gray-800 z-30"
                        >
                          {{ $t('SvitloCherga.queue') }}
                        </th>

                        <th
                          v-for="hour in times"
                          :key="hour"
                          class="px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap"
                        >
                          {{ hour }}
                        </th>
                      </tr>
                    </thead>

                    <tbody class="bg-white dark:bg-gray-900">
                      <tr v-for="queue in sortedQueues" :key="queue">
                        <td
                          class="px-3 py-1 text-center text-xs font-medium sticky left-0 bg-white dark:bg-gray-900 z-10 border-b"
                        >
                          {{ queue }}
                        </td>

                        <td v-for="hour in times" :key="hour" class="p-0 border-b">
                          <div
                            class="w-full h-8 sm:h-10"
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

const API = 'https://svitlo-proxy.svitlo-proxy.workers.dev/';
const { t: $t } = useI18n();

import { useRoute, useRouter } from 'vue-router';
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

// 1. Пріоритет URL-параметра
if (route.query.region) {
  selectedRegionCpu.value = String(route.query.region);
}

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
  return Object.values(selectedRegion.value.schedule).some((queue: any) =>
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
  if (v === 1) return 'bg-grey-100 border border-black';
  return 'bg-gray-500 border border-black';
}

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
  min-width: 50px;
  width: 50px;
}

@media (min-width: 640px) {
  thead th:not(:first-child),
  tbody td:not(:first-child) {
    min-width: 60px;
    width: 60px;
  }
}
</style>
