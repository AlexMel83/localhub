<script setup lang="ts">
import { useAppStore } from '~/stores/app.store';
import { useRoute } from 'vue-router';

const appStore = useAppStore();
const route = useRoute();

const isHomePage = computed(() => route.path === '/');
</script>

<template>
  <footer
    v-if="isHomePage && !appStore.isListView"
    class="flex transition-all duration-300 ease-in-out px-4 py-2 border-t fixed bottom-0 left-0 w-full z-50 bg-transparent text-white pointer-events-auto"
  >
    <div class="text-start text-xs">
      <NuxtLink
        class="hover:underline text-blue-600 dark:text-blue-400 hover:dark:text-blue-300"
        to="https://it.starkon.pp.ua"
        target="_blank"
      >
        {{ $t('Footer.developer') }} {{ $t('Footer.copyright') }}
      </NuxtLink>
    </div>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center gap-6 text-xs text-center">
      <NuxtLink to="/terms" class="hover:underline text-blue-600 dark:text-blue-400 hover:dark:text-blue-300">
        {{ $t('Footer.terms') }}
      </NuxtLink>
      <NuxtLink to="/privacy-policy" class="hover:underline text-blue-600 dark:text-blue-400 hover:dark:text-blue-300">
        {{ $t('Footer.policy') }}
      </NuxtLink>
      <NuxtLink to="/howtohelp" class="hover:underline text-blue-600 dark:text-blue-400 hover:dark:text-blue-300">
        {{ $t('Footer.howToHelp') }}
      </NuxtLink>
    </div>
  </footer>

  <!-- Повний футер для інших сторінок -->
  <footer v-else class="flex relative px-4 py-2 border-t">
    <div class="text-start text-sm">
      <NuxtLink
        class="hover:underline text-blue-600 dark:text-blue-400 hover:dark:text-blue-300"
        to="https://it.starkon.pp.ua"
        target="_blank"
      >
        {{ $t('Footer.developer') }} {{ $t('Footer.copyright') }}
      </NuxtLink>
    </div>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center gap-6 text-sm text-center">
      <NuxtLink to="/terms" class="hover:underline text-blue-600 dark:text-blue-400 hover:dark:text-blue-300">
        {{ $t('Footer.terms') }}
      </NuxtLink>
      <NuxtLink to="/privacy-policy" class="hover:underline text-blue-600 dark:text-blue-400 hover:dark:text-blue-300">
        {{ $t('Footer.policy') }}
      </NuxtLink>
      <NuxtLink to="/howtohelp" class="hover:underline text-blue-600 dark:text-blue-400 hover:dark:text-blue-300">
        {{ $t('Footer.howToHelp') }}
      </NuxtLink>
    </div>
  </footer>
</template>
