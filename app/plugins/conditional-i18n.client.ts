// @ts-expect-error need types
import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    // Функція перевірки згоди на i18n
    const checkI18nConsent = () => {
      const cookieValue = document.cookie.split('; ').find((row) => row.startsWith('cc_cookie='));

      if (cookieValue) {
        try {
          const consent = JSON.parse(decodeURIComponent(cookieValue.split('=')[1]));
          return consent.categories?.includes('i18n');
        } catch (e) {
          console.warn('Failed to parse cookie consent:', e);
          return false;
        }
      }
      return false;
    };

    // Функція автоматичного визначення мови
    const setupLanguageDetection = () => {
      const browserLang = navigator.language.split('-')[0];
      const supportedLangs = ['uk', 'en'];
      const detectedLang = supportedLangs.includes(browserLang) ? browserLang : 'uk';

      // Перевіряємо, чи не встановлена вже мова
      const currentLang = document.cookie
        .split('; ')
        .find((row) => row.startsWith('i18n_redirected='))
        ?.split('=')[1];

      if (!currentLang && detectedLang !== 'uk') {
        // Встановлюємо куку для i18n
        document.cookie = `i18n_redirected=${detectedLang}; path=/; max-age=31536000`; // 1 рік

        // Перенаправляємо на правильну мову якщо потрібно
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith(`/${detectedLang}`)) {
          window.location.href = `/${detectedLang}${currentPath}`;
        }

        console.log('Language auto-detection enabled ✅, detected:', detectedLang);
      }
    };

    // Перевіряємо згоду при завантаженні
    const hasI18nConsent = checkI18nConsent();

    if (hasI18nConsent) {
      setupLanguageDetection();
    }

    // Слухаємо зміни в localStorage (якщо cookie consent оновлюється)
    window.addEventListener('storage', (e) => {
      if (e.key === 'cc_cookie') {
        const hasConsent = checkI18nConsent();
        if (hasConsent) {
          setupLanguageDetection();
        }
      }
    });
  }
});
