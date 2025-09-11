// @ts-expect-error need types
import { defineNuxtPlugin, useRuntimeConfig } from '#app';

export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    // Чекаємо наявність згоди на аналітику через cookie consent
    const checkAnalyticsConsent = () => {
      const cookieValue = document.cookie.split('; ').find((row) => row.startsWith('cc_cookie='));

      if (cookieValue) {
        try {
          const consent = JSON.parse(decodeURIComponent(cookieValue.split('=')[1]));
          return consent.categories?.includes('analytics');
        } catch (e) {
          console.warn('Failed to parse cookie consent:', e);
          return false;
        }
      }
      return false;
    };

    // Перевіряємо згоду при завантаженні
    const hasAnalyticsConsent = checkAnalyticsConsent();

    if (hasAnalyticsConsent) {
      // Якщо згода є, завантажуємо gtag
      const runtimeConfig = useRuntimeConfig();
      const gtagId = runtimeConfig.public.gtagId;

      // Завантажуємо Google Analytics скрипт
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gtagId}`;
      document.head.appendChild(script);

      // Ініціалізуємо gtag
      window.dataLayer = window.dataLayer || [];
      window.gtag = function (...args: unknown[]) {
        window.dataLayer.push(args);
      };

      window.gtag('js', new Date());
      window.gtag('config', gtagId, {
        page_title: 'LocalHub',
        anonymize_ip: true,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        disable_google_one_tap: true,
      });

      console.log('GTAG loaded with user consent ✅');
    }
  }
});
