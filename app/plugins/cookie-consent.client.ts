// app/plugins/cookie-consent.client.ts
import { defineNuxtPlugin } from '#app';
import 'vanilla-cookieconsent/dist/cookieconsent.css';
import * as CookieConsent from 'vanilla-cookieconsent';

export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    CookieConsent.run({
      guiOptions: {
        consentModal: {
          layout: 'box',
          position: 'bottom center',
          equalWeightButtons: true,
        },
      },
      categories: {
        necessary: {
          enabled: true,
          readOnly: true,
        },
        analytics: {
          enabled: false,
          autoRun: false,
          services: {
            gtag: {
              label: 'Google Analytics',
              onAccept: () => {
                // Активуємо gtag
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({ gtagConsent: 'granted' });
                console.log('Google Analytics enabled');
              },
              onReject: () => {
                // Деактивуємо gtag
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({ gtagConsent: 'denied' });
                console.log('Google Analytics disabled');
              },
            },
          },
        },
        i18n: {
          enabled: false,
          autoRun: false,
          onAccept: () => {
            // Дозволяємо i18n зберігати мову
            document.cookie = 'i18n_redirected=1; path=/';
            console.log('i18n language tracking enabled');
          },
          onReject: () => {
            // Деактивуємо i18n
            document.cookie = 'i18n_redirected=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
            console.log('i18n language tracking disabled');
          },
        },
        theme: {
          enabled: false,
          autoRun: false,
          onAccept: () => {
            // Активуємо тему (наприклад, зберігаємо вибір світлої/темної теми)
            localStorage.setItem('theme', 'light'); // або 'dark'
            document.documentElement.setAttribute('data-theme', 'light');
            console.log('Theme tracking enabled');
          },
          onReject: () => {
            // Деактивуємо тему
            localStorage.removeItem('theme');
            document.documentElement.removeAttribute('data-theme');
            console.log('Theme tracking disabled');
          },
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
            settingsModal: {
              title: 'Налаштування файлів cookie',
              saveBtn: 'Зберегти',
              acceptAllBtn: 'Прийняти всі',
              acceptNecessaryBtn: 'Прийняти необхідні',
              sections: [
                {
                  title: 'Необхідні файли cookie',
                  description: 'Ці файли cookie необхідні для роботи сайту.',
                  linkedCategory: 'necessary',
                },
                {
                  title: 'Аналітика',
                  description: 'Дозволяє збирати дані для Google Analytics.',
                  linkedCategory: 'analytics',
                },
                {
                  title: 'Мова',
                  description: 'Дозволяє зберігати обрану мову.',
                  linkedCategory: 'i18n',
                },
                {
                  title: 'Тема',
                  description: 'Дозволяє зберігати обрану тему сайту.',
                  linkedCategory: 'theme',
                },
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
            settingsModal: {
              title: 'Cookie settings',
              saveBtn: 'Save',
              acceptAllBtn: 'Accept all',
              acceptNecessaryBtn: 'Accept necessary',
              sections: [
                {
                  title: 'Necessary cookies',
                  description: 'These cookies are essential for the site to work.',
                  linkedCategory: 'necessary',
                },
                {
                  title: 'Analytics',
                  description: 'Allows data collection for Google Analytics.',
                  linkedCategory: 'analytics',
                },
                {
                  title: 'Language',
                  description: 'Allows saving the selected language.',
                  linkedCategory: 'i18n',
                },
                {
                  title: 'Theme',
                  description: 'Allows saving the selected site theme.',
                  linkedCategory: 'theme',
                },
              ],
            },
          },
        },
      },
      onAccept: (cookie) => {
        console.log('All cookies accepted:', cookie);
      },
      onChange: (cookie) => {
        console.log('Cookie preferences changed:', cookie);
      },
    });

    console.log('CookieConsent initialized ✅');
  }
});
