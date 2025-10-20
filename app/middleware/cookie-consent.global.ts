import { defineNuxtRouteMiddleware } from 'nuxt/app';

export default defineNuxtRouteMiddleware(() => {
  if (import.meta.client) {
    // Функція для отримання cookie consent
    const getCookieConsent = () => {
      const cookieValue = document.cookie.split('; ').find((row) => row.startsWith('cc_cookie='));

      if (cookieValue) {
        try {
          return JSON.parse(decodeURIComponent(cookieValue.split('=')[1]));
        } catch (e) {
          console.warn('Failed to parse cookie consent:', e);
          return null;
        }
      }
      return null;
    };

    const consent = getCookieConsent();
    const categories = consent?.categories || [];

    // Логуємо поточний стан згоди для діагностики
    if (process.env.NODE_ENV !== 'production') {
      // console.log('🔍 Route middleware - current consent categories:', categories);

      if (!categories.includes('i18n')) {
        console.log('ℹ️ i18n auto-detection blocked - no user consent');
      }

      if (!categories.includes('analytics')) {
        console.log('ℹ️ Analytics blocked - no user consent');
      }
    }
  }
});
