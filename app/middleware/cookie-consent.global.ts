import { useNuxtApp, defineNuxtRouteMiddleware } from 'nuxt/app';

declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void;
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
      const nuxtApp = useNuxtApp();
      if (nuxtApp.$i18n) {
        console.log('i18n auto-detection blocked - no user consent');
      }
    }

    // Керування analytics consent
    const analyticsAllowed = categories.includes('analytics');
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: analyticsAllowed ? 'granted' : 'denied',
        ad_storage: analyticsAllowed ? 'granted' : 'denied',
        ad_user_data: analyticsAllowed ? 'granted' : 'denied',
        ad_personalization: analyticsAllowed ? 'granted' : 'denied',
      });
      if (process.env.NODE_ENV !== 'production') {
        console.log('Middleware consent update:', analyticsAllowed ? 'granted' : 'denied');
      }
    } else if (process.env.NODE_ENV !== 'production') {
      console.warn('gtag not available in middleware');
    }

    if (!analyticsAllowed) {
      // Видаляємо всі cookies Google Analytics
      const analyticsCookies = ['_ga', '_ga_', '_gid', '_gat'];
      analyticsCookies.forEach((cookieName) => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
      });
    }

    // Якщо згода на theme не надана, очищуємо cookie
    if (!categories.includes('theme')) {
      document.cookie = 'theme=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      document.documentElement.removeAttribute('data-theme');
    }
  }
});
