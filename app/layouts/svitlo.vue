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

// hreflang alternates (uk / en / x-default) so Google pairs the localized
// versions instead of treating them as duplicates. Pages keep their own
// canonical, so only the i18n alternate links are taken here.
const i18nHead = useLocaleHead({ seo: true });
const altLinks = computed(() => (i18nHead.value.link ?? []).filter((l: { rel?: string }) => l.rel === 'alternate'));

useHead(() => ({
  htmlAttrs: { lang: locale.value || 'uk' },
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/svitlo/mark.svg' },
    { rel: 'apple-touch-icon', href: '/svitlo/apple-touch-icon.png' },
    ...altLinks.value,
  ],
}));
</script>
