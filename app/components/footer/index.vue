<script setup lang="ts">
import { computed } from 'vue';
import { useAppStore } from '../../stores/app.store';
import { useRoute } from 'vue-router';

const appStore = useAppStore();
const route = useRoute();

// Визначаємо, чи є поточна сторінка "головною" з урахуванням локалі
const isHomePage = computed(() => {
  const path = route.path;
  // Для дефолтної локалі шлях '/', для інших — '/en', '/fr', тощо
  return path === '/' || '/en';
});
</script>

<template>
  <footer
    v-if="isHomePage && !appStore.isListView"
    class="flex transition-all duration-300 ease-in-out px-4 py-2 fixed bottom-0 left-0 w-full z-50 bg-transparent pointer-events-auto"
  >
    <div class="text-start text-xs md:text-sm">
      <NuxtLink class="hover:underline text-black" to="https://it.starkon.pp.ua" target="_blank">
        {{ $t('Footer.developer') }} {{ $t('Footer.copyright') }}
      </NuxtLink>
    </div>
    <div
      class="text-black max-w-7xl ml-auto px-4 sm:px-6 lg:px-8 flex justify-center gap-6 text-xs md:text-sm text-center"
    >
      <NuxtLink to="/donation-terms" class="hover:underline">
        {{ $t('Footer.terms') }}
      </NuxtLink>
      <NuxtLink to="/privacy-policy" class="hover:underline">
        {{ $t('Footer.policy') }}
      </NuxtLink>
      <NuxtLink to="/howtohelp" class="hover:underline">
        {{ $t('Footer.howToHelp') }}
      </NuxtLink>
    </div>
  </footer>

  <!-- Повний футер для інших сторінок -->
  <footer v-else class="flex w-full relative px-2 sm:px-4 py-2 border-t">
    <div class="text-start text-xs md:text-sm">
      <NuxtLink class="hover:underline" to="https://it.starkon.pp.ua" target="_blank">
        {{ $t('Footer.developer') }} {{ $t('Footer.copyright') }}
      </NuxtLink>
    </div>
    <div
      class="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 flex justify-center gap-1 sm:gap-4 text-xs md:text-sm text-center"
    >
      <NuxtLink to="/donation-terms" class="hover:underline">
        {{ $t('Footer.terms') }}
      </NuxtLink>
      <NuxtLink to="/privacy-policy" class="hover:underline">
        {{ $t('Footer.policy') }}
      </NuxtLink>
      <NuxtLink to="/howtohelp" class="hover:underline">
        {{ $t('Footer.howToHelp') }}
      </NuxtLink>
    </div>
  </footer>
</template>
