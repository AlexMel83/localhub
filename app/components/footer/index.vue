<script setup lang="ts">
import { computed } from 'vue';
import { useAppStore } from '../../stores/app.store';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

const appStore = useAppStore();
const route = useRoute();
const { t } = useI18n();

// Визначаємо, чи є поточна сторінка "головною"
const isHomePage = computed(() => {
  const path = route.path;
  // головна сторінка для дефолтної локалі
  if (path === '/') return true;
  // головна сторінка для інших локалей, напр. /en, /fr тощо
  return /^\/[a-z]{2}$/.test(path);
});

// Логіка показу fixed футера тільки на мапі
const showFixedFooter = computed(() => {
  return isHomePage.value && !appStore.isListView;
});
</script>

<template>
  <!-- Фіксований футер тільки на головній сторінці в режимі мапи -->
  <footer
    v-if="showFixedFooter"
    class="flex transition-all duration-300 ease-in-out px-4 py-2 fixed bottom-0 left-0 w-full z-50 bg-transparent pointer-events-auto"
  >
    <div class="text-start text-xs md:text-sm">
      <NuxtLink class="hover:underline text-black" to="https://it.starkon.pp.ua" target="_blank">
        {{ t('Footer.developer') }} {{ t('Footer.copyright') }}
      </NuxtLink>
    </div>
    <div
      class="text-black max-w-7xl ml-auto px-4 sm:px-6 lg:px-8 flex justify-center gap-6 text-xs md:text-sm text-center"
    >
      <NuxtLink to="/donation-terms" class="hover:underline">
        {{ t('Footer.terms') }}
      </NuxtLink>
      <NuxtLink to="/privacy-policy" class="hover:underline">
        {{ t('Footer.policy') }}
      </NuxtLink>
      <NuxtLink to="/howtohelp" class="hover:underline">
        {{ t('Footer.howToHelp') }}
      </NuxtLink>
    </div>
  </footer>

  <!-- Звичайний футер для інших випадків -->
  <footer v-else class="flex w-full relative px-2 sm:px-4 py-2 border-t">
    <div class="text-start text-xs md:text-sm">
      <NuxtLink class="hover:underline" to="https://it.starkon.pp.ua" target="_blank">
        {{ t('Footer.developer') }} {{ t('Footer.copyright') }}
      </NuxtLink>
    </div>
    <div
      class="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 flex justify-center gap-1 sm:gap-4 text-xs md:text-sm text-center"
    >
      <NuxtLink to="/donation-terms" class="hover:underline">
        {{ t('Footer.terms') }}
      </NuxtLink>
      <NuxtLink to="/privacy-policy" class="hover:underline">
        {{ t('Footer.policy') }}
      </NuxtLink>
      <NuxtLink to="/howtohelp" class="hover:underline">
        {{ t('Footer.howToHelp') }}
      </NuxtLink>
    </div>
  </footer>
</template>
