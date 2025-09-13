import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app';
import 'vanilla-cookieconsent/dist/cookieconsent.css';
import * as CookieConsentLib from 'vanilla-cookieconsent';

// Типи для глобальних об'єктів
declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void;
    // @ts-expect-error types error
    dataLayer?: unknown[];
    CC?: unknown;
  }
}

// === Утиліти ===
function clearCookie(name: string, domain: string = window.location.hostname): void {
  const domains = ['', `; domain=${domain}`, `; domain=.${domain}`];

  domains.forEach((domainSuffix) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainSuffix}`;
  });
}

function clearAllGoogleAnalyticsCookies(): void {
  const gaCookies = document.cookie
    .split(';')
    .map((c) => c.trim())
    .filter((c) => c.startsWith('_ga') || c.startsWith('_gid') || c.startsWith('_gat'))
    .map((c) => c.split('=')[0]);

  gaCookies.forEach((cookieName) => clearCookie(cookieName));
}

function setupI18nDetection(): void {
  try {
    const browserLang = navigator.language?.split('-')[0] || 'uk';
    const supportedLangs = ['uk', 'en'];
    const detectedLang = supportedLangs.includes(browserLang) ? browserLang : 'uk';
    document.cookie = `i18n_redirected=${detectedLang}; path=/; max-age=31536000; SameSite=Lax`;

    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ i18n detection enabled, set to:', detectedLang);
    }
  } catch (e) {
    console.warn('❌ i18n detection failed', e);
  }
}

function setupTheme(): void {
  try {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = prefersDark ? 'dark' : 'light';
    document.cookie = `theme=${theme}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.setAttribute('data-theme', theme);

    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Theme detection enabled:', theme);
    }
  } catch (e) {
    console.warn('❌ Theme setup failed', e);
  }
}

function initializeGTM(gtmId: string, gtagId?: string): void {
  // Ініціалізуємо dataLayer якщо його немає
  window.dataLayer = window.dataLayer || [];

  // Ініціалізуємо gtag функцію ПЕРЕД всім іншим
  window.gtag =
    window.gtag ||
    function (..._args: unknown[]) {
      window.dataLayer!.push(arguments);
    };

  // Встановлюємо початковий consent на denied
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    analytics_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500,
  });

  // Додаємо початкову конфігурацію GTM
  window.gtag('js', new Date());

  if (process.env.NODE_ENV !== 'production') {
    console.log('🔧 GTM dataLayer and gtag initialized');
  }

  // Завантажуємо GTM скрипт
  const gtmScript = document.createElement('script');
  gtmScript.async = true;
  gtmScript.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
  gtmScript.onload = () => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ GTM script loaded');
    }
  };
  document.head.appendChild(gtmScript);

  // Якщо є gtagId, завантажуємо також Google Analytics
  if (gtagId) {
    const gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${gtagId}`;
    gtagScript.onload = () => {
      // Конфігуруємо Google Analytics
      window.gtag!('config', gtagId, {
        send_page_view: false, // Відключаємо автоматичний page view
        anonymize_ip: true,
        allow_google_signals: false,
      });

      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ Google Analytics script loaded and configured');
      }
    };
    document.head.appendChild(gtagScript);
  }

  // Також конфігуруємо GTM
  window.gtag('config', gtmId, {
    send_page_view: false, // Відключаємо автоматичний page view
  });

  // Додаємо noscript fallback
  const noscript = document.createElement('noscript');
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
  iframe.height = '0';
  iframe.width = '0';
  iframe.style.display = 'none';
  iframe.style.visibility = 'hidden';
  noscript.appendChild(iframe);

  // Додаємо noscript після завантаження DOM
  if (document.body) {
    document.body.insertBefore(noscript, document.body.firstChild);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      document.body.insertBefore(noscript, document.body.firstChild);
    });
  }
}

function clearThemeIfNoConsent(): void {
  try {
    const ccCookie = document.cookie.split('; ').find((r) => r.startsWith('cc_cookie='));
    if (!ccCookie) {
      clearCookie('theme');
      document.documentElement.removeAttribute('data-theme');
      if (process.env.NODE_ENV !== 'production') {
        console.log('🧹 Theme cleared - no consent yet');
      }
    }
  } catch (e) {
    console.warn('❌ Theme clearing failed', e);
  }
}

export default defineNuxtPlugin(() => {
  if (!import.meta.client) return;

  const config = useRuntimeConfig().public;
  const gtmId = config.googleTagManagerId as string;
  const gtagId = config.gtagId as string;

  if (!gtmId) {
    console.warn('❌ GTM ID not found in runtime config');
    return;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log('🚀 Initializing analytics with GTM:', gtmId, 'and GTAG:', gtagId);
  }

  // Ініціалізуємо GTM і Google Analytics
  initializeGTM(gtmId, gtagId);

  // Очищуємо тему якщо немає згоди
  clearThemeIfNoConsent();

  const CookieConsent = CookieConsentLib;

  // Функція для оновлення GTM consent з доступом до config
  const updateGTMConsentWithConfig = (allowed: boolean) => {
    if (!window.gtag) {
      console.warn('❌ gtag not available for consent update');
      return;
    }

    const consentState = allowed ? 'granted' : 'denied';

    window.gtag('consent', 'update', {
      ad_storage: consentState,
      analytics_storage: consentState,
      ad_user_data: consentState,
      ad_personalization: consentState,
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ GTM consent updated: ${consentState}`);
    }

    // Якщо згода надана, відправляємо page_view подію
    if (allowed) {
      setTimeout(() => {
        if (window.gtag) {
          // Відправляємо до GTM
          window.gtag('event', 'page_view', {
            page_title: document.title,
            page_location: window.location.href,
            send_to: gtmId,
          });

          // Якщо є gtagId, відправляємо також до Google Analytics
          if (config.gtagId) {
            window.gtag('event', 'page_view', {
              page_title: document.title,
              page_location: window.location.href,
              send_to: config.gtagId,
            });
          }

          if (process.env.NODE_ENV !== 'production') {
            console.log('📊 GTM page_view event sent to:', gtmId, config.gtagId ? `and ${config.gtagId}` : '');
          }
        }
      }, 100);
    }

    // Якщо згода відкликана, очищуємо cookies
    if (!allowed) {
      setTimeout(() => clearAllGoogleAnalyticsCookies(), 100);
    }
  };

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
      default: 'uk',
      translations: {
        uk: {
          consentModal: {
            title: 'Ми використовуємо файли cookie',
            description:
              'Ми використовуємо файли cookie для аналітики, вибору мови та теми сайту. Ваша приватність важлива для нас.',
            acceptAllBtn: 'Прийняти всі',
            acceptNecessaryBtn: 'Тільки необхідні',
            showPreferencesBtn: 'Налаштувати',
            footer: '<a href="/privacy-policy">Політика конфіденційності</a>',
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
                  headers: { name: 'Назва', domain: 'Домен', desc: 'Опис' },
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
                  headers: { name: 'Назва', domain: 'Домен', desc: 'Опис' },
                  body: [
                    {
                      name: '_ga, _ga_*, _gid',
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
                  headers: { name: 'Назва', domain: 'Домен', desc: 'Опис' },
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
                  headers: { name: 'Назва', domain: 'Домен', desc: 'Опис' },
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
            footer: '<a href="/en/privacy-policy">Privacy Policy</a>',
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
                  headers: { name: 'Name', domain: 'Domain', desc: 'Description' },
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
                  headers: { name: 'Name', domain: 'Domain', desc: 'Description' },
                  body: [
                    {
                      name: '_ga, _ga_*, _gid',
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
                  headers: { name: 'Name', domain: 'Domain', desc: 'Description' },
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
                  headers: { name: 'Name', domain: 'Domain', desc: 'Description' },
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

      if (process.env.NODE_ENV !== 'production') {
        console.log('🔐 Consent given for categories:', categories);
      }

      // Керування аналітикою
      const analyticsAllowed = categories.includes('analytics');
      updateGTMConsentWithConfig(analyticsAllowed);

      // Керування i18n
      if (categories.includes('i18n')) {
        setupI18nDetection();
      } else {
        clearCookie('i18n_redirected');
      }

      // Керування темою
      if (categories.includes('theme')) {
        setupTheme();
      } else {
        clearCookie('theme');
        document.documentElement.removeAttribute('data-theme');
      }
    },

    onChange: ({ changedCategories, cookie }: { changedCategories: string[]; cookie: { categories?: string[] } }) => {
      const categories: string[] = cookie?.categories || [];

      if (process.env.NODE_ENV !== 'production') {
        console.log('🔄 Consent changed for categories:', changedCategories);
        console.log('📝 Current categories:', categories);
      }

      // Оновлюємо аналітику якщо змінилась згода
      if (changedCategories.includes('analytics')) {
        const analyticsAllowed = categories.includes('analytics');
        updateGTMConsentWithConfig(analyticsAllowed);
      }

      // Керування i18n
      if (changedCategories.includes('i18n')) {
        if (categories.includes('i18n')) {
          setupI18nDetection();
        } else {
          clearCookie('i18n_redirected');
        }
      }

      // Керування темою
      if (changedCategories.includes('theme')) {
        if (categories.includes('theme')) {
          setupTheme();
        } else {
          clearCookie('theme');
          document.documentElement.removeAttribute('data-theme');
        }
      }

      // Перезавантажуємо сторінку якщо змінилась мова
      if (changedCategories.includes('i18n')) {
        setTimeout(() => window.location.reload(), 400);
      }
    },
  });

  // Експортуємо CookieConsent для глобального доступу
  window.CC = CookieConsent;

  if (process.env.NODE_ENV !== 'production') {
    console.log('✅ CookieConsent initialized with GTM integration');
  }
});
