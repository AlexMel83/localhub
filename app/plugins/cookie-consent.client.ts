// app/plugins/cookie-consent.client.ts
import { defineNuxtPlugin } from '#imports';
import * as CookieConsent from 'vanilla-cookieconsent';

export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    CookieConsent.run({
      guiOptions: {
        consentModal: {
          layout: 'box',
          position: 'bottom center',
          // Видаліть 'transition', оскільки вона не підтримується
        },
        settingsModal: {
          layout: 'box',
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
      },
      language: {
        default: nuxtApp.$i18n.locale.value || 'uk', // Синхронізація з i18n
        translations: {
          uk: {
            consentModal: {
              title: 'Ми використовуємо файли cookie',
              description: 'Ми використовуємо файли cookie, щоб забезпечити найкращий досвід на нашому сайті.',
              acceptAllBtn: 'Прийняти всі', // Замініть 'acceptAll' на 'acceptAllBtn'
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
                  description: 'Ці файли cookie необхідні для роботи сайту і не можуть бути відключені.',
                  linkedCategory: 'necessary',
                },
                {
                  title: 'Аналітичні файли cookie',
                  description: 'Ці файли cookie дозволяють нам аналізувати, як ви використовуєте наш сайт.',
                  linkedCategory: 'analytics',
                },
              ],
            },
          },
          en: {
            consentModal: {
              title: 'We use cookies',
              description: 'We use cookies to ensure the best experience on our website.',
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
                  description: 'These cookies are essential for the website to function and cannot be disabled.',
                  linkedCategory: 'necessary',
                },
                {
                  title: 'Analytics cookies',
                  description: 'These cookies allow us to analyze how you use our website.',
                  linkedCategory: 'analytics',
                },
              ],
            },
          },
        },
      },
      onAccept: (cookie) => {
        console.log('Cookies accepted:', cookie);
      },
      onChange: (cookie) => {
        console.log('Cookie preferences changed:', cookie);
      },
    });

    console.log('CookieConsent initialized ✅');
  }
});
