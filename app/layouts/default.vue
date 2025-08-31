<template>
  <UApp :locale="locales[locale]">
    <div class="flex flex-col min-h-screen">
      <Header class="flex-0" />
      <NuxtPage class="flex-1" />
      <Footer class="flex-0" />
    </div>
  </UApp>
</template>

<script setup lang="ts">
import * as locales from '@nuxt/ui/locale';

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
