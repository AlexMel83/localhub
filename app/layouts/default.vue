<template>
  <UApp v-if="locale" :locale="currentLocale">
    <div class="flex flex-col min-h-screen">
      <Header class="flex-0" />
      <NuxtPage class="flex-1" />
      <Footer />
      <!-- <CookieDebug /> -->
    </div>
    <ModalLoginRegistration @modal-closed="onModalClosed" />
  </UApp>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { useHead } from 'nuxt/app';

interface Locale {
  lang: string;
  dir: 'rtl' | 'ltr' | 'auto' | undefined;
  name?: string;
}

// Отримання поточної локалі через useI18n
const { locale } = useI18n();

const onModalClosed = () => {
  console.log('Модалка закрита глобально');
};

const currentLocale = computed<Locale>(() => {
  const code = locale.value || 'uk';
  const dir = code === 'ar' || code === 'he' ? 'rtl' : 'ltr';
  return { lang: code, dir, name: code.toUpperCase() };
});

useHead({
  htmlAttrs: computed(() => ({
    lang: currentLocale.value.lang,
    dir: currentLocale.value.dir,
  })),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any);
</script>
