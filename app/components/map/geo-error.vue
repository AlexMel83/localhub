<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div class="bg-white p-6 rounded-lg max-w-md w-full mx-4">
      <h3 class="text-lg font-medium mb-4">
        {{ $t('Map.geoErrorTitle') }}
      </h3>
      <p class="mb-4">
        {{ errorMessage }}
      </p>
      <div class="flex justify-end">
        <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" @click="$emit('close')">
          {{ $t('Map.geoErrorClose') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  errorMessage: {
    type: String,
    required: true,
  },
});

defineEmits(['close']);
</script>
