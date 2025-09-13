import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app';
import 'vanilla-cookieconsent/dist/cookieconsent.css';
import * as CookieConsentLib from 'vanilla-cookieconsent';
import { useGtm } from '@gtm-support/vue-gtm';

declare module '@gtm-support/vue-gtm' {
  interface GtmSupport {
    disable(enabled?: boolean): void;
  }
}
interface CookieConsentLib {
  default: typeof CookieConsentLib;
}

// === Утиліти ===
function clearCookie(name: string, domain: string = window.location.hostname): void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${domain}`;
}

function setupI18nDetection(): void {
  try {
    const browserLang = navigator.language?.split('-')[0] || 'uk';
    const supportedLangs = ['uk', 'en'];
    const detectedLang = supportedLangs.includes(browserLang) ? browserLang : 'uk';
    document.cookie = `i18n_redirected=${detectedLang}; path=/; max-age=31536000`;
    if (process.env.NODE_ENV !== 'production') {
      console.log('i18n detection enabled ✅, set i18n_redirected to:', detectedLang);
    }
  } catch (e) {
    console.warn('i18n detection failed', e);
  }
}

function setupTheme(): void {
  try {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = prefersDark ? 'dark' : 'light';
    document.cookie = `theme=${theme}; path=/; max-age=31536000`;
    document.documentElement.setAttribute('data-theme', theme);
    if (process.env.NODE_ENV !== 'production') {
      console.log('Theme detection enabled ✅', theme);
    }
  } catch (e) {
    console.warn('Theme setup failed', e);
  }
}

function setupGtm(allowed: boolean): void {
  const gtm = useGtm();
  if (!gtm) return;

  const gtmId = useRuntimeConfig().public.googleTagManagerId;
  if (process.env.NODE_ENV !== 'production') {
    console.log('GTM ID:', gtmId);
  }

  if (window.gtag) {
    window.gtag('consent', 'update', {
      ad_storage: allowed ? 'granted' : 'denied',
      analytics_storage: allowed ? 'granted' : 'denied',
      ad_user_data: allowed ? 'granted' : 'denied',
      ad_personalization: allowed ? 'granted' : 'denied',
    });
  }

  if (allowed) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ GTM enabled by consent');
    }

    if (!document.getElementById('gtm-script')) {
      const script = document.createElement('script');
      script.onload = () => {
        gtm.enable(true);
        if (process.env.NODE_ENV !== 'production') {
          console.log('GTM script loaded and enabled');
        }
      };
      script.id = 'gtm-script';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
      document.head.appendChild(script);
    }

    gtm.enable(true);
  } else {
    if (process.env.NODE_ENV !== 'production') {
      console.log('❌ GTM disabled by consent');
    }

    gtm.disable(true);

    const script = document.getElementById('gtm-script');
    if (script) {
      script.remove();
    }
  }
}

function clearThemeIfNoConsent(): void {
  try {
    const ccCookie = document.cookie.split('; ').find((r) => r.startsWith('cc_cookie='));
    if (!ccCookie) {
      clearCookie('theme');
      document.documentElement.removeAttribute('data-theme');
      if (process.env.NODE_ENV !== 'production') {
        console.log('No cookie-consent yet — theme cleared to prevent pre-consent application');
      }
    }
  } catch (e) {
    console.warn('Theme setup failed', e);
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  if (!import.meta.client) return;

  clearThemeIfNoConsent();

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push = window.dataLayer.push || [];

  const CookieConsent: typeof CookieConsentLib = CookieConsentLib as typeof CookieConsentLib;

  CookieConsent.run({
    revision: 1,
    guiOptions: {
      consentModal: {
        layout: 'box',
        position: 'bottom center',
        flipButtons: false,
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      default: (nuxtApp.$i18n as any)?.locale?.value || 'uk',
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

    onConsent: ({ cookie }: { cookie: { categories?: string[] } }) => {
      const categories: string[] = cookie?.categories || [];

      const analyticsAllowed = categories.includes('analytics');
      setupGtm(analyticsAllowed);

      if (categories.includes('i18n')) {
        setupI18nDetection();
      } else {
        clearCookie('i18n_redirected');
      }

      if (categories.includes('theme')) {
        setupTheme();
      } else {
        clearCookie('theme');
        document.documentElement.removeAttribute('data-theme');
      }
    },

    onChange: ({ changedCategories }: { changedCategories: string[] }) => {
      const analyticsAllowed = CookieConsent.acceptedCategory('analytics');
      setupGtm(analyticsAllowed);

      if (changedCategories.includes('i18n')) {
        if (CookieConsent.acceptedCategory('i18n')) {
          setupI18nDetection();
        } else {
          clearCookie('i18n_redirected');
        }
      }

      if (changedCategories.includes('theme')) {
        if (CookieConsent.acceptedCategory('theme')) {
          setupTheme();
        } else {
          clearCookie('theme');
          document.documentElement.removeAttribute('data-theme');
        }
      }

      if (changedCategories.some((c) => ['i18n'].includes(c))) {
        setTimeout(() => window.location.reload(), 400);
      }
    },
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log('CookieConsent initialized (patched) ✅');
  }
});
