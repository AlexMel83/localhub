// @ts-expect-error need types
import { defineNuxtPlugin } from '#app';
import 'vanilla-cookieconsent/dist/cookieconsent.css';
import * as CookieConsent from 'vanilla-cookieconsent';

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default defineNuxtPlugin((nuxtApp: any) => {
  if (import.meta.client) {
    CookieConsent.run({
      guiOptions: {
        consentModal: {
          layout: 'box',
          position: 'bottom center',
        },
      },
      categories: {
        necessary: {
          enabled: true,
          readOnly: true,
        },
        analytics: {
          enabled: false,
        },
        i18n: {
          enabled: false,
        },
        theme: {
          enabled: false,
        },
      },
      language: {
        default: nuxtApp.$i18n.locale.value || 'uk',
        translations: {
          uk: {
            consentModal: {
              title: 'Ми використовуємо файли cookie',
              description: 'Ми використовуємо файли cookie для аналітики, вибору мови та теми сайту.',
              acceptAllBtn: 'Прийняти всі',
              acceptNecessaryBtn: 'Прийняти необхідні',
              showPreferencesBtn: 'Налаштувати',
            },
            preferencesModal: {
              title: 'Налаштування файлів cookie',
              savePreferencesBtn: 'Зберегти налаштування',
              acceptAllBtn: 'Прийняти всі',
              acceptNecessaryBtn: 'Прийняти необхідні',
              sections: [
                { title: 'Необхідні', description: 'Потрібні для роботи сайту.', linkedCategory: 'necessary' },
                { title: 'Аналітика', description: 'Google Analytics.', linkedCategory: 'analytics' },
                { title: 'Мова', description: 'Зберігає вибір мови.', linkedCategory: 'i18n' },
                { title: 'Тема', description: 'Зберігає вибір теми.', linkedCategory: 'theme' },
              ],
            },
          },
          en: {
            consentModal: {
              title: 'We use cookies',
              description: 'We use cookies for analytics, language selection, and theme preferences.',
              acceptAllBtn: 'Accept all',
              acceptNecessaryBtn: 'Accept necessary',
              showPreferencesBtn: 'Customize',
            },
            preferencesModal: {
              title: 'Cookie settings',
              savePreferencesBtn: 'Save settings',
              acceptAllBtn: 'Accept all',
              acceptNecessaryBtn: 'Accept necessary',
              sections: [
                { title: 'Necessary', description: 'Required for site to work.', linkedCategory: 'necessary' },
                { title: 'Analytics', description: 'Google Analytics.', linkedCategory: 'analytics' },
                { title: 'Language', description: 'Saves language preference.', linkedCategory: 'i18n' },
                { title: 'Theme', description: 'Saves theme preference.', linkedCategory: 'theme' },
              ],
            },
          },
        },
      },

      // Глобальні події
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onConsent: (cookie: any) => {
        console.log('Consent given:', cookie);

        // Analytics
        if (cookie.categories.includes('analytics')) {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({ gtagConsent: 'granted' });
          console.log('Google Analytics enabled ✅');
        } else {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({ gtagConsent: 'denied' });
          console.log('Google Analytics disabled ❌');
        }

        // i18n
        if (cookie.categories.includes('i18n')) {
          document.cookie = 'i18n_redirected=1; path=/';
          console.log('i18n enabled ✅');
        } else {
          document.cookie = 'i18n_redirected=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
          console.log('i18n disabled ❌');
        }

        // Theme
        if (cookie.categories.includes('theme')) {
          localStorage.setItem('theme', 'light');
          document.documentElement.setAttribute('data-theme', 'light');
          console.log('Theme enabled ✅');
        } else {
          localStorage.removeItem('theme');
          document.documentElement.removeAttribute('data-theme');
          console.log('Theme disabled ❌');
        }
      },

      onChange: (cookie) => {
        console.log('Consent changed:', cookie);
      },
    });

    console.log('CookieConsent initialized ✅');
  }
});
