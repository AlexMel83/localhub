<template>
  <UApp :locale="locales[locale]">
    <div class="flex flex-col min-h-screen">
      <Header class="flex-0" />
      <NuxtPage class="flex-1" />
      <Footer />
      <CookieControl ref="cookieControl">
        <template #cookie="{ config }">
          Cookies Used: <br />
          <span v-for="(c, idx) in config.cookies" :key="c.id">
            {{ c }}
            <span v-if="idx < config.cookies.length - 1">, </span>
          </span>
        </template>
      </CookieControl>
    </div>
  </UApp>
</template>

<script setup lang="ts">
import * as locales from '@nuxt/ui/locale';
import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();

const lang = computed(() => locales[locale.value].code);
const dir = computed(() => locales[locale.value].dir);

useHead({
  htmlAttrs: {
    lang,
    dir,
  },
});

const { cookiesEnabledIds } = useCookieControl();

// example: react to a cookie being accepted
watch(
  () => cookiesEnabledIds.value,
  (current, previous) => {
    if (!previous?.includes('google-analytics') && current?.includes('google-analytics')) {
      // користувач тільки що прийняв GA
      window.location.reload();
    }
  },
  { deep: true },
);
</script>
