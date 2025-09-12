import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app';
import 'vanilla-cookieconsent/dist/cookieconsent.css';
import * as CookieConsent from 'vanilla-cookieconsent';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: ((command: string, ...args: unknown[]) => void) | undefined;
  }
}

// Функція для завантаження Google Analytics
function loadGoogleAnalytics(gtagId: string) {
  // Завантажуємо скрипт Google Analytics
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

  console.log('Google Analytics loaded ✅');
}

// Функція для налаштування i18n
function setupI18nDetection() {
  // Тут можна додати логіку для детекції мови браузера
  const browserLang = navigator.language.split('-')[0];
  const supportedLangs = ['uk', 'en'];
  const detectedLang = supportedLangs.includes(browserLang) ? browserLang : 'uk';

  // Встановлюємо куку для i18n
  document.cookie = `i18n_redirected=${detectedLang}; path=/; max-age=31536000`; // 1 рік
  console.log('i18n detection enabled ✅, detected language:', detectedLang);
}

// Функція для налаштування теми
function setupTheme() {
  // Детектуємо системні налаштування теми
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = prefersDark ? 'dark' : 'light';

  localStorage.setItem('theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
  console.log('Theme detection enabled ✅, detected theme:', theme);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default defineNuxtPlugin((nuxtApp: any) => {
  if (import.meta.client) {
    const runtimeConfig = useRuntimeConfig();
    const gtagId = runtimeConfig.public.gtagId;

    CookieConsent.run({
      guiOptions: {
        consentModal: {
          layout: 'box',
          position: 'bottom center',
          equalWeightButtons: true,
          flipButtons: false,
        },
        preferencesModal: {
          layout: 'box',
          position: 'right',
          equalWeightButtons: true,
          flipButtons: false,
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
        default: nuxtApp.$i18n?.locale?.value || 'uk',
        translations: {
          uk: {
            consentModal: {
              title: 'Ми використовуємо файли cookie',
              description:
                'Ми використовуємо файли cookie для аналітики, вибору мови та теми сайту. Ваша приватність важлива для нас.',
              acceptAllBtn: 'Прийняти всі',
              acceptNecessaryBtn: 'Тільки необхідні',
              showPreferencesBtn: 'Налаштувати',
              footer: `
                <a href="/privacy-policy">Політика конфіденційності</a>
              `,
            },
            preferencesModal: {
              title: 'Налаштування файлів cookie',
              acceptAllBtn: 'Прийняти всі',
              acceptNecessaryBtn: 'Тільки необхідні',
              savePreferencesBtn: 'Зберегти налаштування',
              closeIconLabel: 'Закрити',
              sections: [
                {
                  title: 'Використання файлів cookie',
                  description:
                    'Ми використовуємо файли cookie для покращення функціональності сайту. Ви можете налаштувати свої вподобання нижче.',
                },
                {
                  title: 'Необхідні файли cookie',
                  description: 'Ці файли cookie необхідні для правильної роботи сайту і не можуть бути відключені.',
                  linkedCategory: 'necessary',
                  cookieTable: {
                    headers: {
                      name: 'Назва',
                      domain: 'Домен',
                      desc: 'Опис',
                    },
                    body: [
                      {
                        name: 'cc_cookie',
                        domain: location.hostname,
                        desc: 'Зберігає налаштування cookie consent',
                      },
                    ],
                  },
                },
                {
                  title: 'Аналітика',
                  description: 'Ці файли cookie допомагають нам зрозуміти, як відвідувачі взаємодіють з сайтом.',
                  linkedCategory: 'analytics',
                  cookieTable: {
                    headers: {
                      name: 'Назва',
                      domain: 'Домен',
                      desc: 'Опис',
                    },
                    body: [
                      {
                        name: '_ga, _ga_*',
                        domain: '.google.com',
                        desc: 'Google Analytics для збору статистики відвідувань',
                      },
                    ],
                  },
                },
                {
                  title: 'Мова',
                  description: 'Зберігає ваш вибір мови інтерфейсу.',
                  linkedCategory: 'i18n',
                  cookieTable: {
                    headers: {
                      name: 'Назва',
                      domain: 'Домен',
                      desc: 'Опис',
                    },
                    body: [
                      {
                        name: 'i18n_redirected',
                        domain: location.hostname,
                        desc: 'Зберігає вибір мови користувача',
                      },
                    ],
                  },
                },
                {
                  title: 'Тема',
                  description: 'Зберігає ваш вибір теми оформлення сайту.',
                  linkedCategory: 'theme',
                  cookieTable: {
                    headers: {
                      name: 'Назва',
                      domain: 'Домен',
                      desc: 'Опис',
                    },
                    body: [
                      {
                        name: 'theme',
                        domain: location.hostname,
                        desc: 'Зберігає налаштування теми (localStorage)',
                      },
                    ],
                  },
                },
              ],
            },
          },
          en: {
            consentModal: {
              title: 'We use cookies',
              description:
                'We use cookies for analytics, language selection, and theme preferences. Your privacy matters to us.',
              acceptAllBtn: 'Accept all',
              acceptNecessaryBtn: 'Necessary only',
              showPreferencesBtn: 'Customize',
              footer: `
                <a href="/en/privacy-policy">Privacy Policy</a>
              `,
            },
            preferencesModal: {
              title: 'Cookie preferences',
              acceptAllBtn: 'Accept all',
              acceptNecessaryBtn: 'Necessary only',
              savePreferencesBtn: 'Save preferences',
              closeIconLabel: 'Close',
              sections: [
                {
                  title: 'Cookie usage',
                  description:
                    'We use cookies to enhance website functionality. You can customize your preferences below.',
                },
                {
                  title: 'Necessary cookies',
                  description: 'These cookies are essential for proper website functioning and cannot be disabled.',
                  linkedCategory: 'necessary',
                  cookieTable: {
                    headers: {
                      name: 'Name',
                      domain: 'Domain',
                      desc: 'Description',
                    },
                    body: [
                      {
                        name: 'cc_cookie',
                        domain: location.hostname,
                        desc: 'Stores cookie consent preferences',
                      },
                    ],
                  },
                },
                {
                  title: 'Analytics',
                  description: 'These cookies help us understand how visitors interact with our website.',
                  linkedCategory: 'analytics',
                  cookieTable: {
                    headers: {
                      name: 'Name',
                      domain: 'Domain',
                      desc: 'Description',
                    },
                    body: [
                      {
                        name: '_ga, _ga_*',
                        domain: '.google.com',
                        desc: 'Google Analytics for collecting visit statistics',
                      },
                    ],
                  },
                },
                {
                  title: 'Language',
                  description: 'Stores your interface language preference.',
                  linkedCategory: 'i18n',
                  cookieTable: {
                    headers: {
                      name: 'Name',
                      domain: 'Domain',
                      desc: 'Description',
                    },
                    body: [
                      {
                        name: 'i18n_redirected',
                        domain: location.hostname,
                        desc: 'Stores user language preference',
                      },
                    ],
                  },
                },
                {
                  title: 'Theme',
                  description: 'Stores your website theme preference.',
                  linkedCategory: 'theme',
                  cookieTable: {
                    headers: {
                      name: 'Name',
                      domain: 'Domain',
                      desc: 'Description',
                    },
                    body: [
                      {
                        name: 'theme',
                        domain: location.hostname,
                        desc: 'Stores theme preferences (localStorage)',
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      },

      // Обробка згоди
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onConsent: (cookie: any) => {
        console.log('Consent given:', cookie);

        // Отримуємо категорії з правильної структури
        const categories = cookie?.categories || [];
        console.log('Categories:', categories);

        // Analytics - тільки якщо дозволено
        if (categories.includes('analytics')) {
          loadGoogleAnalytics(gtagId as string);
        } else {
          // Відключаємо аналітику якщо була завантажена
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push([
            'consent',
            'update',
            {
              analytics_storage: 'denied',
            },
          ]);
          console.log('Google Analytics disabled ❌');
        }

        // i18n - тільки якщо дозволено
        if (categories.includes('i18n')) {
          setupI18nDetection();
        } else {
          // Видаляємо куку i18n
          document.cookie = 'i18n_redirected=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
          console.log('i18n detection disabled ❌');
        }

        // Theme - тільки якщо дозволено
        if (categories.includes('theme')) {
          setupTheme();
        } else {
          // Видаляємо налаштування теми
          localStorage.removeItem('theme');
          document.documentElement.removeAttribute('data-theme');
          console.log('Theme detection disabled ❌');
        }
      },

      // Обробка зміни налаштувань
      // @ts-expect-error error type
      onChange: (cookie: unknown, changedCategories: string[]) => {
        console.log('Consent changed:', cookie, 'Changed categories:', changedCategories);

        // Безпечна перевірка changedCategories
        const changes = changedCategories || [];
        console.log('Processed changed categories:', changes);

        // Перезавантажуємо сторінку якщо змінилися критичні налаштування
        if (Array.isArray(changes) && changes.some((cat) => ['analytics', 'i18n'].includes(cat))) {
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
      },
    });

    console.log('CookieConsent initialized ✅');
  }
});
