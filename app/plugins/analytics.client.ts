export default defineNuxtPlugin(() => {
  const { cookiesEnabledIds } = useCookieControl();

  watch(
    () => cookiesEnabledIds.value,
    (enabled) => {
      if (enabled?.includes('google-analytics')) {
        initGoogleAnalytics();
      }
    },
    { immediate: true },
  );

  function initGoogleAnalytics() {
    if (window.dataLayer) return; // захист від дублювання

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', useRuntimeConfig().public.gtagId, {
      anonymize_ip: true,
    });
  }
});
