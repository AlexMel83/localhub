<template>
  <UApp :locale="locales[locale]">
    <div class="flex flex-col min-h-screen">
      <Header class="flex-0" />
      <NuxtPage class="flex-1" />
      <Footer />
      <!-- Cookie Settings Button -->
      <UButton
        variant="ghost"
        size="sm"
        icon="i-heroicons-cog-6-tooth"
        class="hidden sm:flex"
        :title="$t('cookieSettings')"
        @click="showCookieSettings"
      />
      <button
        class="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm text-left"
        @click="showCookieSettings"
      >
        {{ $t('cookieSettings') }}
      </button>
    </div>
  </UApp>
</template>

<script setup lang="ts">
import * as locales from '@nuxt/ui/locale';

const { showSettings } = useCookieConsent();

const showCookieSettings = () => {
  showSettings();
};

const { locale } = useI18n();

const lang = computed(() => locales[locale.value].code);
const dir = computed(() => locales[locale.value].dir);

useHead({
  htmlAttrs: {
    lang,
    dir,
  },
});
</script>
