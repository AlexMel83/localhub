<template>
  <div class="max-w-4xl mx-auto p-6 space-y-8">
    <h1 class="text-3xl font-bold mb-4">Редагування магазину</h1>

    <ClientOnly>
      <UForm :state="form" class="space-y-4" @submit="handleUpdate">
        <!-- Назва, опис, тип -->
        <div class="space-y-4 border-b pb-4">
          <UInput v-model="form.title" label="Назва магазину" placeholder="Введіть назву" @input="updateSlug" />
          <UTextarea v-model="form.description" label="Опис" placeholder="Опис магазину" :rows="3" />

          <USelect v-model="value" value-key="id" :items="items" class="w-48" />
        </div>

        <!-- Локація -->
        <div class="space-y-4 border-b pb-4">
          <UInput v-model="form.address" label="Адреса" placeholder="Адреса" />
          <div class="grid grid-cols-2 gap-4">
            <UInput v-model="form.latitude" label="Широта" type="number" step="0.000001" />
            <UInput v-model="form.longitude" label="Довгота" type="number" step="0.000001" />
          </div>
        </div>

        <!-- Контакти -->
        <div class="space-y-4 border-b pb-4">
          <UInput v-model="form.contacts" label="Телефон" placeholder="+380..." @blur="validatePhone" />
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
import { reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useRuntimeConfig, useFetch, navigateTo } from 'nuxt/app';
import type { SelectItem } from '@nuxt/ui';

interface Form {
  working_hours_start?: string;
  working_hours_end?: string;
  working_hours?: string;
  // інші поля…
}

// 🔹 ROUTE + API
const route = useRoute();
const config = useRuntimeConfig();
const apiBase = config.public.apiBase || 'https://api.localhub.store';

// ---- СТАН ----
const form = reactive({
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
const phoneError = ref('');

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

// ---- Валідація телефону ----
const validatePhone = () => {
  phoneError.value = '';
  let phone = String(form.contacts || '')
    .trim()
    .replace(/[()\s-]/g, '');
  if (!phone) return;
  if (/^0\d{9}$/.test(phone)) phone = '+38' + phone;
  else if (/^380\d{9}$/.test(phone)) phone = '+' + phone;
  if (!/^\+380\d{9}$/.test(phone)) {
    phoneError.value = 'Невірний формат номера. Використовуйте, наприклад: +380987654321';
  } else form.contacts = phone;
};

// ---- Отримання даних магазину ----
try {
  const { data: res } = await useFetch(apiBase + '/business?slug=' + route.params.slug);
  const shop = Array.isArray(res.value) ? res.value[0] : res.value;
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

  validatePhone();
  if (phoneError.value) {
    errorMessage.value = phoneError.value;
    return;
  }

  const payload: Form = {
    ...form,
    working_hours: `${form.working_hours_start} - ${form.working_hours_end}`,
  };
  delete payload.working_hours_start;
  delete payload.working_hours_end;

  try {
    const updatedStore = await $fetch(apiBase + '/business/', {
      method: 'PUT',
      body: payload,
    });

    console.log(updatedStore);
    successMessage.value = 'Магазин успішно оновлено!';

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

watch(() => form.title, updateSlug);
</script>
