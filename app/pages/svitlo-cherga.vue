<template>
  <div class="p-4 max-w-6xl mx-auto">
    <header class="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">Світло-черга — перегляд графіків</h1>
        <p class="text-sm text-slate-500">Джерело: svitlo.live</p>
      </div>

      <div class="flex items-center gap-2">
        <!-- Простий HTML select замість USelect -->
        <select v-model="selectedRegionCpu" class="min-w-[220px] border rounded px-2 py-1">
          <option value="" disabled selected>Виберіть область</option>
          <option v-for="r in regionsOptions" :key="r.value" :value="r.value">{{ r.label }}</option>
        </select>

        <select v-model="selectedQueue" class="min-w-[160px] border rounded px-2 py-1">
          <option value="" disabled selected>Виберіть чергу</option>
          <option v-for="q in queuesOptions" :key="q.value" :value="q.value">{{ q.label }}</option>
        </select>

        <button
          :disabled="loading"
          @click="fetchData"
          class="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Оновити
        </button>
      </div>
    </header>

    <section class="mb-4">
      <div class="flex items-center gap-4 flex-wrap">
        <div class="text-sm">
          Дата: <strong>{{ data?.date_today }}</strong>
        </div>
        <div class="text-sm">
          Наступна: <strong>{{ data?.date_tomorrow }}</strong>
        </div>
        <div class="ml-2 flex items-center gap-2">
          <span class="w-4 h-4 rounded-sm" :class="colorClass(2)"></span><span class="text-sm">2</span>
          <span class="w-4 h-4 rounded-sm" :class="colorClass(1)"></span><span class="text-sm">1</span>
          <span class="w-4 h-4 rounded-sm" :class="colorClass(0)"></span><span class="text-sm">0 / відсутній</span>
        </div>
      </div>
    </section>

    <main>
      <div v-if="loading" class="py-8 text-center">Завантаження...</div>
      <div v-else-if="error" class="py-8 text-center text-red-600">Помилка: {{ error }}</div>
      <div v-else>
        <div v-if="!selectedRegion">Оберіть область для відображення графіку.</div>

        <div v-else>
          <div class="p-4 mb-4 border rounded">
            <div class="flex items-center justify-between mb-3">
              <div>
                <h2 class="text-lg font-semibold">{{ selectedRegion.name_ua }}</h2>
                <div class="text-sm text-slate-500">
                  Обрана черга: <strong>{{ selectedQueue || '—' }}</strong>
                </div>
              </div>

              <div class="text-sm text-slate-600">
                Показано: <strong>{{ displayedDates.join(' / ') }}</strong>
              </div>
            </div>

            <div v-if="!hasScheduleForSelected" class="p-6 text-center text-slate-600">
              Графік відсутній для обраної черги.
            </div>

            <div v-else class="space-y-6">
              <div v-for="date in displayedDates" :key="date">
                <h3 class="text-sm font-medium mb-2">{{ date }} — {{ dayLabel(date) }}</h3>

                <div class="overflow-x-auto border rounded">
                  <div class="grid grid-cols-48-auto min-w-[900px]">
                    <template v-for="(t, idx) in times" :key="t">
                      <div
                        class="p-1 min-w-[18px] text-center text-xs border-r last:border-r-0"
                        :title="t + ' — ' + cellValue(selectedRegion, selectedQueue, date, t)"
                      >
                        <div
                          class="h-8 rounded-sm flex items-center justify-center"
                          :class="valueCellClass(cellValue(selectedRegion, selectedQueue, date, t))"
                        >
                          {{ shortLabel(t, idx) }}
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 p-4 border rounded">
            <h4 class="font-medium mb-2">Налаштування відображення</h4>
            <div class="flex flex-wrap gap-3">
              <label class="flex items-center gap-2">
                <input type="checkbox" v-model="showHalfHourLabels" /> Показывать подписи півгодини
              </label>
              <label class="flex items-center gap-2">
                <input type="checkbox" v-model="compactView" /> Компактний вигляд
              </label>
              <button @click="copyCSV" class="px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700">
                Копіювати CSV для обраної черги
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const API = 'https://svitlo-proxy.svitlo-proxy.workers.dev/';

const data = ref(null as any);
const loading = ref(false);
const error = ref('');

async function fetchData() {
  loading.value = true;
  error.value = '';
  try {
    const res = await $fetch(API, { method: 'GET' });
    data.value = res;
  } catch (e: any) {
    error.value = (e && e.message) || String(e);
  } finally {
    loading.value = false;
  }
}

fetchData();

const selectedRegionCpu = ref('');
const selectedQueue = ref('');

const regions = computed(() => data.value?.regions || []);
const regionsOptions = computed(() => regions.value.map((r: any) => ({ label: r.name_ua, value: r.cpu })));
const selectedRegion = computed(() => regions.value.find((r: any) => r.cpu === selectedRegionCpu.value) || null);

watch(selectedRegionCpu, () => {
  selectedQueue.value = '';
});

const queuesOptions = computed(() => {
  if (!selectedRegion.value || !selectedRegion.value.schedule) return [];
  return Object.keys(selectedRegion.value.schedule).map((k) => ({ label: k, value: k }));
});

const displayedDates = computed(() => {
  if (!data.value) return [];
  return [data.value.date_today, data.value.date_tomorrow].filter(Boolean);
});

const times = Array.from({ length: 48 }).map((_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

function cellValue(region: any, queue: string, date: string, time: string) {
  try {
    if (!region || !queue || !region.schedule) return null;
    const q = region.schedule[queue];
    if (!q) return null;
    const day = q[date];
    if (!day) return null;
    const v = day[time];
    return typeof v === 'number' ? v : null;
  } catch (e) {
    return null;
  }
}

const hasScheduleForSelected = computed(() => {
  if (!selectedRegion.value || !selectedQueue.value) return false;
  const q = selectedRegion.value.schedule?.[selectedQueue.value];
  return !!q;
});

function colorClass(value: number | null) {
  if (value === 2) return 'bg-emerald-500';
  if (value === 1) return 'bg-amber-500';
  if (value === 0) return 'bg-slate-300';
  return 'bg-slate-100';
}

function valueCellClass(v: number | null) {
  if (v === 2) return 'bg-emerald-500/90 text-white';
  if (v === 1) return 'bg-amber-500/90 text-white';
  if (v === 0) return 'bg-slate-300 text-slate-700';
  return 'bg-slate-100 text-slate-400';
}

function shortLabel(t: string, idx: number) {
  if (showHalfHourLabels.value) return t;
  if (t.endsWith(':00')) return t.slice(0, 2);
  return '';
}

function dayLabel(date: string) {
  if (!data.value) return '';
  if (date === data.value.date_today) return 'Сьогодні';
  if (date === data.value.date_tomorrow) return 'Завтра';
  return date;
}

const showHalfHourLabels = ref(false);
const compactView = ref(false);

async function copyCSV() {
  if (!selectedRegion.value || !selectedQueue.value) return;
  const rows: string[] = [];
  rows.push(['date', 'time', 'value'].join(','));
  for (const date of displayedDates.value) {
    for (const t of times) {
      rows.push([date, t, cellValue(selectedRegion.value, selectedQueue.value, date, t) ?? ''].join(','));
    }
  }
  const csv = rows.join('\n');
  try {
    await navigator.clipboard.writeText(csv);
    alert('CSV скопійовано в буфер обміну');
  } catch (e) {
    alert('Не вдалося скопіювати CSV');
  }
}
</script>

<style scoped>
.grid-cols-48-auto {
  display: grid;
  grid-template-columns: repeat(48, minmax(18px, 1fr));
}
</style>
