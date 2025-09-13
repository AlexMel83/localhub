import { defineNuxtPlugin } from 'nuxt/app';
import { createGtm } from '@gtm-support/vue-gtm';
import { useRouter } from 'vue-router';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig().public;
  const router = useRouter();

  if (!config.googleTagManagerId) {
    console.warn('❌ GTM ID not found, skipping GTM plugin initialization');
    return;
  }

  const gtmInstance = createGtm({
    id: config.googleTagManagerId,
    defer: false,
    compatibility: false,
    loadScript: false,
    vueRouter: router,
    enabled: false,
    debug: config.googleTagManagerDebug === 'true',
    trackOnNextTick: false,
    defaultEventName: 'page-load',
  });

  nuxtApp.vueApp.use(gtmInstance);

  if (process.env.NODE_ENV !== 'production') {
    console.log('✅ GTM Vue plugin initialized (script managed by cookie-consent)');
  }
});
