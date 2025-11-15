<template>
  <div class="p-4 max-w-[1600px] mx-auto">
    <!-- Заголовок -->
    <UCard class="mb-4">
      <template #header>
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 class="text-2xl font-bold">Графік погодинних відключень</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">Джерело: svitlo.live</p>
          </div>

          <div class="flex items-center gap-2">
            <USelectMenu
              v-model="selectedRegionCpu"
              :options="regionsOptions"
              placeholder="Виберіть область"
              value-attribute="value"
              option-attribute="label"
              class="min-w-[220px]"
            />

            <UButton :loading="loading" color="primary" @click="fetchData"> Оновити </UButton>
          </div>
        </div>
      </template>
    </UCard>

    <!-- Легенда та дати -->
    <UCard v-if="selectedRegion" class="mb-4">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div class="flex items-center gap-4 flex-wrap">
          <div class="text-sm">
            Дата: <strong>{{ data?.date_today }}</strong>
          </div>
          <div v-if="hasValidTomorrowData" class="text-sm">
            Наступна: <strong>{{ data?.date_tomorrow }}</strong>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded bg-emerald-500" />
            <span class="text-sm">Електроенергія відсутня</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded bg-amber-500" />
            <span class="text-sm">Електроенергія може бути відсутня</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded bg-gray-300 dark:bg-gray-600" />
            <span class="text-sm">Електроенергія розподіляється</span>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Завантаження та помилки -->
    <UCard v-if="loading">
      <div class="py-8 text-center">
        <div class="flex items-center justify-center gap-2">
          <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
          <span>Завантаження...</span>
        </div>
      </div>
    </UCard>

    <UCard v-else-if="error">
      <UAlert color="red" variant="soft" :title="'Помилка: ' + error" />
    </UCard>

    <!-- Вибір області -->
    <UCard v-else-if="!selectedRegion">
      <div class="py-8 text-center text-gray-500">Оберіть область для відображення графіку</div>
    </UCard>

    <!-- Графік у шаховому порядку -->
    <UCard v-else-if="selectedRegion">
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold">{{ selectedRegion.name_ua }}</h2>
            <p class="text-sm text-gray-500">Графік відключень по чергах</p>
          </div>
          <UButton color="gray" variant="soft" icon="i-heroicons-arrow-down-tray" @click="downloadCSV">
            Завантажити CSV
          </UButton>
        </div>
      </template>

      <div v-if="!hasAnySchedule" class="py-8 text-center text-gray-500">Графік відсутній для обраної області</div>

      <div v-else class="space-y-6">
        <!-- Таблиця для кожної дати -->
        <div v-for="dateInfo in displayedDatesInfo" :key="dateInfo.date">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="text-lg font-medium">{{ dateInfo.date }} — {{ dateInfo.label }}</h3>
            <span v-if="!dateInfo.hasData" class="text-sm text-gray-500"> (графік не опубліковано) </span>
          </div>

          <div v-if="dateInfo.hasData" class="overflow-x-auto border rounded-lg dark:border-gray-700">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-gray-800 z-10"
                  >
                    Черга
                  </th>
                  <th
                    v-for="time in times"
                    :key="time"
                    class="px-1 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400"
                    :class="{ 'border-l-2 border-gray-300 dark:border-gray-600': time.endsWith(':00') }"
                  >
                    <div class="writing-mode-vertical transform rotate-180">
                      {{ time }}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="queue in sortedQueues" :key="queue">
                  <td
                    class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 sticky left-0 bg-white dark:bg-gray-900 z-10"
                  >
                    {{ queue }}
                  </td>
                  <td
                    v-for="time in times"
                    :key="time"
                    class="px-1 py-2"
                    :class="{ 'border-l-2 border-gray-300 dark:border-gray-600': time.endsWith(':00') }"
                  >
                    <div
                      class="w-full h-8 rounded"
                      :class="getCellClass(queue, dateInfo.date, time)"
                      :title="`${queue} | ${time} | ${getCellValue(queue, dateInfo.date, time)}`"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Статистика -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Статистика відключень</h3>
          </template>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="queue in sortedQueues" :key="queue" class="p-3 border rounded-lg dark:border-gray-700">
              <div class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{{ queue }}</div>
              <div class="space-y-1">
                <div class="flex items-center justify-between text-xs">
                  <span>Прогнозована тривалість відключень за добу:</span>
                  <strong>{{ getQueueStats(queue, data.date_today).hours }} год</strong>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span>Частка відключених годин у черзі:</span>
                  <strong>{{ getQueueStats(queue, data.date_today).percentage }}%</strong>
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

const API = 'https://svitlo-proxy.svitlo-proxy.workers.dev/';

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

const data = ref<Data | null>(null);
const loading = ref(false);
const error = ref('');
const selectedRegionCpu = ref('');

// Генерація часових міток (00:00 до 23:30)
const times = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

// Завантаження даних
async function fetchData() {
  loading.value = true;
  error.value = '';
  try {
    const res = await $fetch<Data>(API, { method: 'GET' });
    data.value = res;

    // Автоматичний вибір Хмельницької області
    if (!selectedRegionCpu.value && res.regions) {
      const khmelnytskaRegion = res.regions.find((r) => r.name_ua === 'Хмельницька');
      if (khmelnytskaRegion) {
        selectedRegionCpu.value = khmelnytskaRegion.cpu;
      }
    }
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message || String(e);
  } finally {
    loading.value = false;
  }
}

// Опції для регіонів
const regionsOptions = computed(() => {
  if (!data.value?.regions) return [];
  return data.value.regions.filter((r) => r.schedule !== null).map((r) => ({ label: r.name_ua, value: r.cpu }));
});

// Обраний регіон
const selectedRegion = computed(() => {
  if (!data.value?.regions || !selectedRegionCpu.value) return null;
  return data.value.regions.find((r) => r.cpu === selectedRegionCpu.value) || null;
});

// Перевірка наявності розкладу
const hasAnySchedule = computed(() => {
  return selectedRegion.value?.schedule !== null;
});

// Відсортовані черги (1.1, 1.2, 2.1, 2.2, ...)
const sortedQueues = computed(() => {
  if (!selectedRegion.value?.schedule) return [];
  const queues = Object.keys(selectedRegion.value.schedule);
  return queues.sort((a, b) => {
    const [aMajor, aMinor] = a.split('.').map(Number);
    const [bMajor, bMinor] = b.split('.').map(Number);
    if (aMajor !== bMajor) return aMajor - bMajor;
    return aMinor - bMinor;
  });
});

// Перевірка чи є дані на завтра (не всі нулі)
const hasValidTomorrowData = computed(() => {
  if (!selectedRegion.value?.schedule || !data.value?.date_tomorrow) return false;

  for (const queue of Object.keys(selectedRegion.value.schedule)) {
    const dayData = selectedRegion.value.schedule[queue]?.[data.value.date_tomorrow];
    if (!dayData) continue;

    const hasNonZero = Object.values(dayData).some((v) => v !== 0);
    if (hasNonZero) return true;
  }

  return false;
});

// Інформація про дати для відображення
const displayedDatesInfo = computed(() => {
  const dates = [];

  if (data.value?.date_today) {
    dates.push({
      date: data.value.date_today,
      label: 'Сьогодні',
      hasData: true,
    });
  }

  if (data.value?.date_tomorrow && hasValidTomorrowData.value) {
    dates.push({
      date: data.value.date_tomorrow,
      label: 'Завтра',
      hasData: true,
    });
  }

  return dates;
});

// Отримання значення комірки
function getCellValue(queue: string, date: string, time: string): number | null {
  if (!selectedRegion.value?.schedule) return null;
  return selectedRegion.value.schedule[queue]?.[date]?.[time] ?? null;
}

// Класи для комірок
function getCellClass(queue: string, date: string, time: string): string {
  const value = getCellValue(queue, date, time);

  if (value === 2) return 'bg-emerald-500';
  if (value === 1) return 'bg-amber-500';
  if (value === 0) return 'bg-gray-300 dark:bg-gray-600';
  return 'bg-gray-100 dark:bg-gray-700';
}

// Статистика по черзі
function getQueueStats(queue: string, date: string) {
  if (!selectedRegion.value?.schedule) {
    return { hours: 0, percentage: 0 };
  }

  const dayData = selectedRegion.value.schedule[queue]?.[date];
  if (!dayData) {
    return { hours: 0, percentage: 0 };
  }

  const values = Object.values(dayData);
  const offCount = values.filter((v) => v === 2).length;
  const hours = offCount * 0.5;
  const percentage = ((offCount / values.length) * 100).toFixed(1);

  return { hours, percentage };
}

// Завантаження CSV
function downloadCSV() {
  if (!selectedRegion.value || !data.value) return;

  const rows: string[] = [['Черга', 'Дата', 'Час', 'Статус'].join(',')];

  for (const dateInfo of displayedDatesInfo.value) {
    if (!dateInfo.hasData) continue;

    for (const queue of sortedQueues.value) {
      for (const time of times) {
        const value = getCellValue(queue, dateInfo.date, time);
        const status = value === 2 ? 'Відсутня' : value === 1 ? 'Може бути відсутня' : 'Розподіляється';
        rows.push([queue, dateInfo.date, time, status].join(','));
      }
    }
  }

  const csv = rows.join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `svitlo-${selectedRegion.value.name_ua}-${data.value.date_today}.csv`;
  link.click();
}

// Ініціалізація
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.writing-mode-vertical {
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

/* Фіксована ширина для колонки черги */
tbody td:first-child,
thead th:first-child {
  min-width: 80px;
}
</style>
