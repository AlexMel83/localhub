<script setup lang="ts">
import { useAppStore } from '~/stores/app.store';
const appStore = useAppStore();
</script>

<template>
  <footer
    :class="[
      'transition-all duration-300 ease-in-out px-4 py-2 border-t',
      appStore.isListView
        ? 'relative bg-white text-black'
        : 'fixed bottom-0 left-0 w-full z-50 bg-transparent text-white pointer-events-auto', // карта — фіксований прозорий футер внизу попереду
    ]"
  >
    <!-- Вміст футера -->
    Footer content here
  </footer>
</template>
