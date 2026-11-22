<template>
  <UApp :locale="uiLocale">
    <div class="svitlo-page flex min-h-screen flex-col">
      <SvitloHeader />
      <NuxtPage class="flex-1" />
      <SvitloFooter />
    </div>
  </UApp>
</template>

<script setup lang="ts">
// Own header, footer and theme for the outage schedule pages (/svitlo-cherga/**).
import * as uiLocales from '@nuxt/ui/locale';

const { locale } = useI18n();

const uiLocale = computed(() => (locale.value === 'en' ? uiLocales.en : uiLocales.uk));

useHead({
  htmlAttrs: { lang: () => locale.value || 'uk' },
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/svitlo/mark.svg' },
    { rel: 'apple-touch-icon', href: '/svitlo/apple-touch-icon.png' },
  ],
});
</script>
