<template>
  <div class="max-w-3xl mx-auto p-4 space-y-6">
    <h1 class="text-3xl font-bold">Створити магазин / бізнес</h1>

    <UForm :state="formState" @submit="handleSubmit" class="space-y-4">
      <!-- Назва -->
      <UInput v-model="form.title" label="Назва магазину" placeholder="Введіть назву" required @input="updateSlug" />

      <!-- Slug (можна редагувати) -->
      <UInput v-model="form.slug" label="Slug" placeholder="Автоматично згенерується з назви" required />

      <!-- Тип -->
      <USelect v-model="form.type" :options="typeOptions" label="Тип магазину" required />

      <!-- Опис -->
      <UTextarea v-model="form.description" label="Опис" placeholder="Короткий опис магазину" :rows="4" />

      <!-- Адреса -->
      <UInput v-model="form.address" label="Адреса" placeholder="Вулиця, номер, місто" />

      <!-- Контакти -->
      <UInput v-model="form.contacts" label="Контакти" placeholder="+380 ..." />

      <!-- Години роботи -->
      <UInput v-model="form.working_hours" label="Години роботи" placeholder="Наприклад: 9:00 - 18:00" />

      <!-- Посилання на прайс / Google Sheet -->
      <UInput v-model="form.price" label="Посилання на прайс" placeholder="https://..." />

      <!-- Широта -->
      <UInput v-model="form.latitude" label="Широта" type="number" step="0.000001" required />

      <!-- Довгота -->
      <UInput v-model="form.longitude" label="Довгота" type="number" step="0.000001" required />

      <!-- Зображення / мініатюра -->
      <UInput v-model="form.thumbnail_url" label="Мініатюра" placeholder="/panoimg/назва.jpg" />

      <div class="flex justify-end gap-4 mt-4">
        <UButton type="submit">Створити</UButton>
        <UButton type="button" variant="outline" @click="resetForm">Очистити</UButton>
      </div>
    </UForm>

    <!-- Повідомлення -->
    <div v-if="successMessage" class="text-green-600 font-medium">{{ successMessage }}</div>
    <div v-if="errorMessage" class="text-red-600 font-medium">{{ errorMessage }}</div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';

interface Form {
  [key: string]: string;
}

// Основні дані форми
const form: Form = reactive({
  title: '',
  slug: '',
  type: 'store',
  description: '',
  address: '',
  contacts: '',
  working_hours: '',
  price: '',
  latitude: '',
  longitude: '',
  thumbnail_url: '',
});

// Стейт для UForm
const formState = reactive({ ...form });

// Повідомлення
const successMessage = ref('');
const errorMessage = ref('');

// Типи магазинів
const typeOptions = [
  { label: 'Магазин', value: 'store' },
  { label: 'Сервіс', value: 'service' },
  { label: 'Культура / місце', value: 'place' },
  { label: 'Подія', value: 'event' },
];

// Автогенерація slug
const updateSlug = () => {
  if (!form.slug) {
    form.slug = form.title
      .toLowerCase()
      .trim()
      .replace(/[^a-zа-яіїєґ0-9\s-]/gi, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 200);
  }
};

// Очистка форми
const resetForm = () => {
  Object.keys(form).forEach((key) => {
    form[key] = '';
    formState[key] = '';
  });
  form.type = 'store';
  formState.type = 'store';
};

// Сабміт форми
const handleSubmit = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  try {
    // TODO: підключити yup валідацію
    // await businessSchema.validate(form)

    // Відправка на API
    const res = await $fetch('/api/business/create', {
      method: 'POST',
      body: form,
    });

    successMessage.value = 'Магазин успішно створено!';
    resetForm();
  } catch (err: any) {
    console.error(err);
    errorMessage.value = err?.message || 'Помилка при створенні магазину';
  }
};
</script>

<style scoped>
/* Кастомні стилі при потребі */
</style>
