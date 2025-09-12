import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app';
import 'vanilla-cookieconsent/dist/cookieconsent.css';
import * as CookieConsentLib from 'vanilla-cookieconsent';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: ((command: string, ...args: unknown[]) => void) | undefined;
  }
}

interface CookieConsentLib {
  default: typeof CookieConsentLib;
}

// === Утиліти (відкладений запуск сервісів) ===
function loadGoogleAnalytics(gtagId: string) {
  if (!gtagId) return;
  if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${gtagId}"]`)) {
    console.log('GTAG script already present');
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = function (...args: unknown[]) {
    window.dataLayer?.push(args);
    console.log('dataLayer pushed:', args);
  };

  window.gtag('consent', 'update', {
    analytics_storage: 'granted',
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gtagId}`;
  script.onload = () => {
    console.log('GTAG script loaded');
    setTimeout(() => {
      window.gtag?.('js', new Date());
      window.gtag?.('config', gtagId, {
        anonymize_ip: true,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        disable_google_one_tap: true,
      });
      console.log('gtag config applied');
    }, 300); // Збільшено до 300мс
  };
  document.head.appendChild(script);

  console.log('Google Analytics loading initiated');
}

function setupI18nDetection() {
  try {
    const browserLang = navigator.language?.split('-')[0] || 'uk';
    const supportedLangs = ['uk', 'en'];
    const detectedLang = supportedLangs.includes(browserLang) ? browserLang : 'uk';
    document.cookie = `i18n_redirected=${detectedLang}; path=/; max-age=31536000`;
    console.log(
      'i18n detection enabled ✅, set i18n_redirected to:',
      detectedLang,
      'current cookies:',
      document.cookie,
    );
  } catch (e) {
    console.warn('i18n detection failed', e);
  }
}

function setupTheme() {
  try {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = prefersDark ? 'dark' : 'light';
    document.cookie = `theme=${theme}; path=/; max-age=31536000`;
    document.documentElement.setAttribute('data-theme', theme);
    console.log('Theme detection enabled ✅', theme);
  } catch (e) {
    console.warn('Theme setup failed', e);
  }
}

function clearThemeIfNoConsent() {
  try {
    const ccCookie = document.cookie.split('; ').find((r) => r.startsWith('cc_cookie='));
    if (!ccCookie) {
      document.cookie = 'theme=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      document.documentElement.removeAttribute('data-theme');
      console.log('No cookie-consent yet — theme cleared to prevent pre-consent application');
    }
  } catch (e) {
    console.warn('Theme setup failed', e);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default defineNuxtPlugin((nuxtApp: any) => {
  if (!import.meta.client) return;

  clearThemeIfNoConsent();

  window.dataLayer = window.dataLayer || [];
  window.gtag = function (...args: unknown[]) {
    window.dataLayer?.push(args);
    console.log('dataLayer initial push:', args);
  };
  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });

  const CookieConsent: typeof CookieConsentLib = CookieConsentLib as typeof CookieConsentLib;

  const runtimeConfig = useRuntimeConfig();
  const gtagId = runtimeConfig.public.gtagId;
  CookieConsent.run({
    guiOptions: {
      consentModal: {
        layout: 'box',
        position: 'bottom center',
      },
      preferencesModal: {
        layout: 'box',
        position: 'right',
      },
    },
    categories: {
      necessary: { enabled: true, readOnly: true },
      analytics: { enabled: false },
      i18n: { enabled: false },
      theme: { enabled: false },
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
                      desc: 'Зберігає налаштування теми',
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
                      desc: 'Stores theme preferences',
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    },

    // Використай правильну сигнатуру callbacks згідно з документацією:
    onConsent: ({ cookie }: { cookie: unknown & { categories?: string[] } }) => {
      console.log('onConsent fired', cookie);
      const categories: string[] = cookie?.categories || [];

      if (categories.includes('analytics')) {
        loadGoogleAnalytics(gtagId as string);
      } else {
        window.gtag?.('consent', 'update', {
          analytics_storage: 'denied',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
        });
        ['_ga', '_gid', '_gat'].forEach((name) => {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        });
        console.log('Analytics denied or removed');
      }

      if (categories.includes('i18n')) {
        setupI18nDetection();
      } else {
        document.cookie = 'i18n_redirected=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        console.log('i18n not allowed');
      }

      if (categories.includes('theme')) {
        setupTheme();
      } else {
        document.cookie = 'theme=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        document.documentElement.removeAttribute('data-theme');
        console.log('theme not allowed');
      }
    },

    onChange: ({ cookie, changedCategories }: { cookie: unknown; changedCategories: string[] }) => {
      console.log('onChange', changedCategories, cookie);

      const changes = changedCategories || [];

      if (changes.includes('analytics')) {
        if (CookieConsent.acceptedCategory('analytics')) {
          loadGoogleAnalytics(gtagId as string);
        } else {
          window.dataLayer?.push([
            'consent',
            'update',
            {
              analytics_storage: 'denied',
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
            },
          ]);
          ['_ga', '_gid', '_gat'].forEach((name) => {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
          });
          console.log('Analytics denied or removed');
        }
      }

      if (changes.includes('i18n')) {
        if (CookieConsent.acceptedCategory('i18n')) setupI18nDetection();
        else document.cookie = 'i18n_redirected=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      }

      if (changes.includes('theme')) {
        if (CookieConsent.acceptedCategory('theme')) setupTheme();
        else {
          // Зміна: очищуємо кукі
          document.cookie = 'theme=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
          document.documentElement.removeAttribute('data-theme');
        }
      }

      // Якщо зміни критичні — reload (залишено, але тільки для i18n якщо потрібно редірект)
      if (changes.some((c) => ['i18n'].includes(c))) {
        setTimeout(() => window.location.reload(), 400);
      }
    },
  });

  console.log('CookieConsent initialized (patched) ✅');
});
