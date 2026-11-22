<template>
  <UApp v-if="locale" :locale="uiLocale">
    <div class="flex flex-col min-h-screen">
      <Header class="flex-0" />
      <NuxtPage class="flex-1" />
      <Footer />
      <!-- <CookieDebug /> -->
    </div>
    <ModalAuthForm />
  </UApp>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import * as uiLocales from '@nuxt/ui/locale';

const { locale } = useI18n();

// Nuxt UI needs a full locale (with messages) for its own labels:
// "Закрити", "Показати пароль" and so on.
const uiLocale = computed(() => (locale.value === 'en' ? uiLocales.en : uiLocales.uk));

useHead({
  htmlAttrs: { lang: () => locale.value || 'uk', dir: 'ltr' },
});
</script>
