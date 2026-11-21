<template>
  <div class="max-w-4xl mx-auto p-6 space-y-8">
    <h1 class="text-3xl font-bold mb-4">Редагування магазину</h1>

    <ClientOnly>
      <UForm :state="form" class="space-y-4" @submit="handleUpdate">
        <!-- Назва, опис, тип -->
        <div class="flex flex-col space-y-4 border-b pb-4">
          <h2 class="text-xl font-semibold">Назва та Опис</h2>
          <UInput
            v-model="form.title"
            label="Назва магазину"
            placeholder="Введіть назву"
            required
            @input="updateSlug"
          />
          <UTextarea v-model="form.description" label="Опис" placeholder="Опис магазину" :rows="3" />

          <USelect v-model="value" value-key="id" :items="items" class="w-48" />
        </div>

        <!-- Локація -->
        <div class="space-y-4 border-b pb-4">
          <h2 class="text-xl font-semibold">Локація</h2>
          <div class="grid grid-cols-3 gap-4">
            <UButton
              color="primary"
              variant="outline"
              size="sm"
              :disabled="!form.latitude || !form.longitude"
              @click.prevent="reverseGeoCode(form, errorMessage)"
            >
              Заповнити </UButton
            ><UInput v-model="form.address" label="Адреса" placeholder="Адреса" />
            <UButton
              color="primary"
              variant="outline"
              size="sm"
              :disabled="!form.address"
              @click.prevent="geoCodeAddress(form)"
            >
              Знайти
            </UButton>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <UInput v-model="form.latitude" label="Широта" type="number" step="0.000001" />
            <UInput v-model="form.longitude" label="Довгота" type="number" step="0.000001" />
          </div>
          <!-- Карта -->
          <ClientOnly>
            <div id="map" class="w-full h-[400px] rounded-lg overflow-hidden shadow-md" />
          </ClientOnly>
        </div>

        <!-- Контакти -->
        <div class="space-y-4 border-b pb-4">
          <UInput
            v-model="form.contacts"
            label="Контакти"
            placeholder="+380..."
            @blur="validatePhone(form.contacts, (v: string) => (form.contacts = v))"
          />
          <p v-if="phoneError" class="text-red-500 text-sm">{{ phoneError }}</p>
        </div>

        <!-- Години роботи -->
        <div class="space-y-2 border-b pb-4">
          <label class="block text-sm font-medium mb-1">Години роботи</label>
          <div class="flex items-center gap-2">
            <UInput v-model="form.working_hours_start" type="time" class="w-32" />
            <span class="text-gray-500">—</span>
            <UInput v-model="form.working_hours_end" type="time" class="w-32" />
          </div>
        </div>

        <!-- Додатково -->
        <div class="space-y-4 border-b pb-4">
          <UInput v-model="form.price" label="Посилання на прайс" placeholder="https://..." />
          <UInput v-model="form.thumbnail_url" label="Мініатюра" placeholder="/panoimg/shop.jpg" />
          <div v-if="form.thumbnail_url" class="mt-2">
            <img :src="form.thumbnail_url" alt="Preview" class="w-48 h-32 object-cover rounded-md border shadow-sm" />
          </div>
        </div>

        <!-- Кнопки -->
        <div class="flex justify-end gap-4 mt-6">
          <UButton type="submit" color="primary">Оновити</UButton>
          <UButton variant="outline" color="gray" @click="$router.back()">Назад</UButton>
        </div>
      </UForm>
    </ClientOnly>

    <div v-if="successMessage" class="text-green-600 font-medium mt-4">{{ successMessage }}</div>
    <div v-if="errorMessage" class="text-red-600 font-medium mt-4">{{ errorMessage }}</div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { navigateTo } from 'nuxt/app';
import type { SelectItem } from '@nuxt/ui';
import { useRuntimeConfig } from '#imports';

import { useValidate } from '~/composables/useValidate';
import { useGeoCode } from '~/composables/useGeoCode';
const apiBase = useRuntimeConfig().public.apiBase || 'https://api.json63.pp.ua';

const { phoneError, validatePhone, normalizePhone } = useValidate();
const { reverseGeoCode, geoCodeAddress } = useGeoCode();
const businessStore = useBusinessStore();

interface Form {
  working_hours_start?: string;
  working_hours_end?: string;
  working_hours?: string;
  title: string;
  slug: string;
  type: string;
  description: string;
  address: string;
  contacts: string;
  price: string;
  thumbnail_url: string;
  latitude: number | null;
  longitude: number | null;
}

// 🔹 ROUTE + API
const route = useRoute();

// ---- КАРТА ----
let map: L.Map | null = null;
let marker: L.Marker | null = null;

// ---- СТАН ----
const form: Form = reactive({
  id: null,
  title: '',
  slug: '',
  type: 'store',
  description: '',
  address: '',
  contacts: '',
  working_hours_start: '',
  working_hours_end: '',
  price: '',
  thumbnail_url: '',
  latitude: null,
  longitude: null,
});

const successMessage = ref('');
const errorMessage = ref('');

// ---- ВИБІР ТИПУ ----
const items = ref<SelectItem[]>([
  {
    label: 'Магазин',
    id: 'store',
  },
  {
    label: 'Сервіс',
    id: 'service',
  },
  {
    label: 'Культура / місце',
    id: 'place',
  },
  {
    label: 'Подія',
    id: 'event',
  },
]);
const value = ref('Магазин');

// ---- Отримання даних магазину ----
try {
  await businessStore.getBusinessBySlug(route.params.slug as string, apiBase);
  const shop = businessStore.business; // ← Бери з Pinia!
  if (!shop) throw new Error('Магазин не знайдено');

  // Заповнюємо форму
  Object.assign(form, shop);

  // Розбиваємо години роботи
  if (shop.working_hours) {
    // Додаємо ведучий нуль для години, якщо потрібно
    const padTime = (t: string) => {
      if (!t) return '09:00';
      const [h, m] = t.split(':');
      return `${h.padStart(2, '0')}:${m}`;
    };
    if (shop?.working_hours) {
      const [start, end] = shop.working_hours.split(' - ');
      form.working_hours_start = padTime(start);
      form.working_hours_end = padTime(end);
    }
  }
} catch (err: unknown) {
  console.error(err);
  errorMessage.value = (err as Error).message || 'Не вдалося завантажити магазин';
}
// ---- Оновлення ----
const handleUpdate = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  const isValid = validatePhone(form.contacts, (value: string) => (form.contacts = value));
  if (!isValid) {
    errorMessage.value = phoneError.value;
    return;
  }

  form.contacts = normalizePhone(form.contacts);

  const payload = {
    ...form,
    working_hours: `${form.working_hours_start} - ${form.working_hours_end}`,
  };
  delete payload.working_hours_start;
  delete payload.working_hours_end;
  businessStore.business = payload;

  try {
    await businessStore.updateBusiness(apiBase);
    successMessage.value = 'Оновлено!';

    // 🔹 Якщо slug змінився — оновлюємо URL
    if (route.params.slug !== form.slug) {
      const newPath = `/starkon/${form.slug}/edit`;
      await navigateTo(newPath, { replace: true });
    }
  } catch (err: unknown) {
    console.error(err);
    errorMessage.value = (err as Error).message || 'Помилка при оновленні';
  }
};

// ---- Генерація слагу ----
const updateSlug = () => {
  if (!form.title) {
    form.slug = '';
    return;
  }
  form.slug = form.title
    .trim()
    .replace(/[^a-zA-Zа-яА-Яіїєґ0-9\s-]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
};

onMounted(async () => {
  // Імпортуємо Leaflet тільки на клієнті (SSR-safe)
  if (!import.meta.client) return;
  const L = await import('leaflet');
  await nextTick();

  const { latitude, longitude } = form;
  map = L.map('map').setView([latitude as number, longitude as number], 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap',
  }).addTo(map);

  marker = L.marker([latitude as number, longitude as number], { draggable: true }).addTo(map);

  marker.on('dragend', (e: unknown) => {
    const pos = (e as L.DragEndEvent).target.getLatLng();
    form.latitude = Number(pos.lat.toFixed(6));
    form.longitude = Number(pos.lng.toFixed(6));
  });
});

watch(
  () => form.title,
  () => {
    updateSlug();
  },
);

watch(
  () => [form.latitude, form.longitude],
  ([lat, lng]) => {
    if (marker && map && lat !== null && lng !== null) {
      marker.setLatLng([lat, lng]);
      map.setView([lat, lng], map.getZoom());
    }
  },
  { immediate: true },
);
</script>
