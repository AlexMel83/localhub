// app/plugins/i18n-consent.client.ts
import { watch } from 'vue';

export default defineNuxtPlugin((nuxtApp) => {
  if (!import.meta.client) return;

  const waitForCookieConsent = (timeout = 5000) =>
    new Promise<void>((resolve) => {
      const start = Date.now();
      const tick = () => {
        const CC = (window as unknown).CookieConsent;
        if (CC && typeof CC.acceptedCategory === 'function') return resolve();
        if (Date.now() - start > timeout) return resolve();
        setTimeout(tick, 100);
      };
      tick();
    });

  nuxtApp.hook('app:mounted', async () => {
    await waitForCookieConsent(5000);

    const nuxt = useNuxtApp();
    const i18n = (nuxt as unknown).$i18n || nuxt.vueApp?.config?.globalProperties?.$i18n;
    if (!i18n) return;

    const CC = (window as unknown).CookieConsent;
    const COOKIE_NAME = 'i18n_redirected';
    const MAX_AGE = 60 * 60 * 24 * 365; // 1 year

    const isFunctionalityAccepted = () =>
      !!(CC && typeof CC.acceptedCategory === 'function' && CC.acceptedCategory('functionality'));

    const writeI18nCookie = (val: string) => {
      if (!isFunctionalityAccepted()) return;
      document.cookie = `${COOKIE_NAME}=${encodeURIComponent(val)}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax; Secure`;
    };

    const removeI18nCookie = () => {
      try {
        if (CC && typeof CC.eraseCookies === 'function') {
          CC.eraseCookies([COOKIE_NAME], '/');
        } else {
          document.cookie = `${COOKIE_NAME}=; Max-Age=0; Path=/`;
        }
      } catch {
        document.cookie = `${COOKIE_NAME}=; Max-Age=0; Path=/`;
      }
    };

    // initial sync
    if (isFunctionalityAccepted()) {
      writeI18nCookie(i18n.locale.value);
    } else {
      removeI18nCookie();
    }

    // when locale changes
    watch(
      () => i18n.locale.value,
      (newLocale) => {
        if (!newLocale) return;
        if (isFunctionalityAccepted()) writeI18nCookie(newLocale);
        else removeI18nCookie();
      },
    );

    // observe consent changes (polling fallback)
    if (CC && typeof CC.on === 'function') {
      // some versions expose hooks; not reliable — we still add polling below
    }

    // simple polling to detect when user toggles functionality category
    let prev = isFunctionalityAccepted();
    setInterval(() => {
      const cur = isFunctionalityAccepted();
      if (cur !== prev) {
        prev = cur;
        if (cur) writeI18nCookie(i18n.locale.value);
        else removeI18nCookie();
      }
    }, 800);
  });
});
