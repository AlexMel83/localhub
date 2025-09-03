<template>
  <a
    :href="url"
    target="_blank"
    rel="noopener noreferrer"
    class="btn-share inline-flex items-center gap-2 px-3 py-2 rounded-md transition-colors font-semibold"
    :class="{
      'bg-blue-600 text-white hover:bg-blue-700': type === 'facebook',
      'bg-purple-500 text-white hover:bg-purple-600': type === 'viber',
      'bg-green-600 text-white hover:bg-green-700': type === 'whatsapp',
      'bg-blue-500 text-white hover:bg-blue-600': type === 'telegram',
    }"
  >
    <Icon
      :name="getIconName(type)"
      class="w-5 h-5"
      :class="{
        'text-white': true, // Колір іконки синхронізовано з текстом
      }"
    />
    <span class="hidden sm:inline">{{ label }}</span>
  </a>
</template>

<script setup>
defineProps({
  url: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: false, // Більше не потрібен, оскільки використовуємо @nuxt/icon
    default: '',
  },
  label: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    validator: (value) => ['facebook', 'viber', 'telegram', 'whatsapp'].includes(value),
  },
});

// Функція для отримання назви іконки з @nuxt/icon
function getIconName(type) {
  const icons = {
    facebook: 'fa-brands:facebook-f',
    viber: 'fa-brands:viber',
    telegram: 'fa-brands:telegram',
    whatsapp: 'fa-brands:whatsapp',
  };
  return icons[type] || 'fa-solid:link';
}
</script>

<style scoped>
/* Додаткові стилі для темної теми */
.dark .btn-share {
  filter: brightness(0.9); /* Злегка затемняємо в темній темі */
}
</style>
