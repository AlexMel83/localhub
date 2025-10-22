<template>
  <div class="max-w-4xl mx-auto p-6 space-y-8">
    <h1 class="text-3xl font-bold mb-4">Створити магазин / бізнес</h1>

    <!-- Форма -->
    <UForm :state="formState" class="space-y-4" @submit="handleSubmit">
      <!-- Крок 1 — Адреса та координати -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Локація</h2>

        <div class="flex gap-2">
          <UInput
            v-model="form.address"
            label="Адреса"
            class="flex-1"
            placeholder="Введіть адресу (наприклад, Старокостянтинів, Есенська 2)"
          />
          <UButton color="primary" variant="solid" @click.prevent="geocodeAddress"> Знайти </UButton>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <UInput v-model="form.latitude" label="Широта" type="number" step="0.000001" />
          <UInput v-model="form.longitude" label="Довгота" type="number" step="0.000001" />
        </div>

        <!-- Карта -->
        <ClientOnly>
          <div id="map" class="w-full h-[400px] rounded-lg overflow-hidden shadow-md" />
        </ClientOnly>

        <!-- Крок 2 — Основні поля -->
        <div class="pt-6 flex flex-col gap-1 border-t border-gray-200 space-y-4">
          <h2 class="text-xl font-semibold">Назва та Опис</h2>
          <UInput
            v-model="form.title"
            label="Назва магазину"
            placeholder="Введіть назву"
            required
            @input="updateSlug"
          />

          <UTextarea v-model="form.description" label="Опис" placeholder="Короткий опис магазину" :rows="3" />

          <USelect v-model="form.type" :options="typeOptions" label="Тип магазину" required />
        </div>
      </div>

      <!-- Крок 3 — Додаткові поля -->
      <div
        v-if="form.title && form.description && form.type"
        class="pt-6 flex flex-col gap-1 border-t border-gray-200 space-y-4"
      >
        <h2 class="text-xl font-semibold">Додатково</h2>
        <label class="block text-sm font-medium mb-1">Телефон</label>
        <UInput v-model="form.contacts" label="Контакти" placeholder="+380..." />
        <div>
          <label class="block text-sm font-medium mb-1">Години роботи</label>
          <div class="flex items-center gap-2">
            <UInput v-model="form.working_hours_start" type="time" placeholder="09:00" class="w-32" />
            <span class="text-gray-500">—</span>
            <UInput v-model="form.working_hours_end" type="time" placeholder="18:00" class="w-32" />
          </div>
        </div>
        <label class="block text-sm font-medium mb-1">Посилання на прайс</label>
        <UInput v-model="form.price" label="Посилання на прайс" placeholder="https://..." />
        <label class="block text-sm font-medium mb-1">Мініатюра</label>
        <UInput v-model="form.thumbnail_url" label="Мініатюра" placeholder="/panoimg/shop.jpg" />
      </div>

      <div class="flex justify-end gap-4 mt-6">
        <UButton type="submit" color="primary">Зберегти</UButton>
        <UButton type="button" variant="outline" @click="resetForm">Очистити</UButton>
      </div>
    </UForm>

    <!-- Повідомлення -->
    <div v-if="successMessage" class="text-green-600 font-medium">{{ successMessage }}</div>
    <div v-if="errorMessage" class="text-red-600 font-medium">{{ errorMessage }}</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';

interface Form {
  [key: string]: string | number | null;
  // other properties...
}

// ---- СТАН ----
const route = useRoute();

const form: Form = reactive({
  title: '',
  slug: '',
  type: 'store',
  description: '',
  address: 'Старокостянтинів, ',
  contacts: '',
  working_hours_start: '09:00',
  working_hours_end: '18:00',
  price: '',
  latitude: Number(route.query.lat) || 49.7550101,
  longitude: Number(route.query.lng) || 27.1874278,
  thumbnail_url: '',
});

const formState = reactive({ ...form });
const successMessage = ref('');
const errorMessage = ref('');

// ---- ВИБІР ТИПУ ----
const typeOptions = [
  { label: 'Магазин', value: 'store' },
  { label: 'Сервіс', value: 'service' },
  { label: 'Культура / місце', value: 'place' },
  { label: 'Подія', value: 'event' },
];

// ---- SLUG ----
const updateSlug = () => {
  if (typeof form.title === 'string' && form.title) {
    form.slug = form.title
      .toLowerCase()
      .trim()
      .replace(/[^a-zа-яіїєґ0-9\s-]/gi, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 200);
  }
};

// ---- КАРТА ----
let map: L.Map | null = null;
let marker: L.Marker | null = null;

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

// ---- ВІДСТЕЖЕННЯ ЗМІН LAT/LNG ----
watch(
  () => [form.latitude, form.longitude],
  (newVal) => {
    if (marker && map) {
      marker.setLatLng([Number(newVal[0]), Number(newVal[1])]);
      map.setView([Number(newVal[0]), Number(newVal[1])], map.getZoom());
    }
  },
);

// ---- ГЕОКОДИНГ ----
const geocodeAddress = async () => {
  if (!form.address) return;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.address)}`,
    );
    const data = await res.json();
    if (data?.length > 0) {
      const { lat, lon, display_name } = data[0];
      form.latitude = Number(lat);
      form.longitude = Number(lon);
      form.address = display_name;
    } else {
      errorMessage.value = 'Адресу не знайдено';
    }
  } catch (err) {
    console.error(err);
    errorMessage.value = 'Помилка при геокодуванні';
  }
};

// ---- RESET ----
const resetForm = () => {
  Object.keys(form).forEach((key) => (form[key] = ''));
  form.type = 'store';
  form.latitude = 49.7550101;
  form.longitude = 27.1874278;
  if (map && marker) {
    map.setView([form.latitude, form.longitude], 14);
    marker.setLatLng([form.latitude, form.longitude]);
  }
};

// ---- SUBMIT ----
const handleSubmit = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  form.working_hours = `${form.working_hours_start} - ${form.working_hours_end}`;
  try {
    await $fetch('/api/business/create', {
      method: 'POST',
      body: form,
    });
    successMessage.value = 'Магазин успішно створено!';
    resetForm();
  } catch (err: unknown) {
    console.error(err);
    errorMessage.value = (err as Error)?.message || 'Помилка при створенні магазину';
  }
};
</script>
