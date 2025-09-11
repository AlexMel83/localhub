import { useNuxtApp, defineNuxtRouteMiddleware } from 'nuxt/app';

declare global {
  interface Window {
    gtag: (command: string, ...args: unknown[]) => void;
  }
}

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

    // Якщо згода на i18n не надана, відключаємо автоматичне перенаправлення
    if (!categories.includes('i18n')) {
      // Логіка для відключення автоматичної локалізації
      const nuxtApp = useNuxtApp();
      if (nuxtApp.$i18n) {
        // Блокуємо автоматичне визначення мови якщо немає згоди
        console.log('i18n auto-detection blocked - no user consent');
      }
    }

    // Якщо згода на analytics не надана, блокуємо gtag
    if (!categories.includes('analytics')) {
      // Видаляємо всі cookies Google Analytics
      const analyticsCookies = ['_ga', '_ga_', '_gid', '_gat'];
      analyticsCookies.forEach((cookieName) => {
        // Видаляємо cookies на поточному домені
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
      });

      // Відключаємо gtag якщо він існує
      if (window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'denied',
        });
      }
    }

    // Якщо згода на theme не надана, очищуємо localStorage
    if (!categories.includes('theme')) {
      localStorage.removeItem('theme');
      document.documentElement.removeAttribute('data-theme');
    }
  }
});
