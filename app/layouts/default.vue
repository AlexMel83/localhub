<template>
  <UApp v-if="locale" :locale="currentLocale">
    <div class="flex flex-col min-h-screen">
      <Header class="flex-0" />
      <NuxtPage class="flex-1" />
      <Footer />
    </div>
  </UApp>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { computed, onMounted } from 'vue';
import { useHead } from '@unhead/vue';
import type { HtmlAttributes } from '@unhead/vue';

interface Locale {
  lang: string;
  dir: 'rtl' | 'ltr' | 'auto' | undefined;
  name?: string;
}

// Отримання поточної локалі через useI18n
const { locale } = useI18n();

const currentLocale = computed<Locale>(() => {
  const code = locale.value || 'uk';
  const dir = code === 'ar' || code === 'he' ? 'rtl' : 'ltr';
  return { lang: code, dir, name: code.toUpperCase() };
});

useHead({
  htmlAttrs: computed<HtmlAttributes>(() => ({
    lang: currentLocale.value.lang,
    dir: currentLocale.value.dir,
  })),
} as any);
</script>
