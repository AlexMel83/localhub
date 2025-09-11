// app/plugins/auto-show-consent.client.ts
export default defineNuxtPlugin((nuxtApp) => {
  if (!process.client) return;

  const waitForCookieConsent = (timeout = 5000) =>
    new Promise<void>((resolve) => {
      const start = Date.now();
      const tick = () => {
        const CC = (window as any).CookieConsent;
        if (CC && (typeof CC.show === 'function' || typeof CC.showSettings === 'function')) return resolve();
        if (Date.now() - start > timeout) return resolve();
        setTimeout(tick, 100);
      };
      tick();
    });

  nuxtApp.hook('app:mounted', async () => {
    await waitForCookieConsent(5000);
    const CC = (window as any).CookieConsent;
    try {
      if (!CC) return;
      const hasValid = typeof CC.validConsent === 'function' ? CC.validConsent() : false;
      if (!hasValid) {
        // Покажемо з невеликою затримкою, щоб сторінка відмалювалася
        setTimeout(() => {
          try {
            if (typeof CC.show === 'function') CC.show();
            else if (typeof CC.showSettings === 'function') CC.showSettings();
          } catch (e) {
            console.error('[auto-show] show error', e);
          }
        }, 300);
      }
    } catch (e) {
      console.error('[auto-show] error', e);
    }
  });
});
