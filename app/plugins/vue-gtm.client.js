import { defineNuxtPlugin } from 'nuxt/app';
import { createGtm } from '@gtm-support/vue-gtm';
import { useRouter } from 'vue-router';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig().public;
  const router = useRouter();

  nuxtApp.vueApp.use(
    createGtm({
      id: config.googleTagManagerId,
      defer: false,
      compatibility: false,
      loadScript: false, // скрипт завантажимо вручну по згоді
      vueRouter: router, // Hook у Vue Router
      enabled: false, // завжди false на старті
      debug: config.googleTagManagerDebug,
      trackOnNextTick: false,
      defaultEventName: 'page-load',
    }),
  );
});
