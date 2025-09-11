import { useRuntimeConfig } from 'nuxt/app';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer: any[];
  }
}

/**
 * Перевіряє чи є згода на використання analytics
 */
export const hasAnalyticsConsent = (): boolean => {
  if (typeof window === 'undefined') return false;

  const cookieValue = document.cookie.split('; ').find((row) => row.startsWith('cc_cookie='));

  if (cookieValue as unknown) {
    try {
      const consent = JSON.parse(decodeURIComponent(cookieValue?.split('=')[1] ?? ''));
      // Перевіряємо обидві можливі структури
      const categories = consent?.cookie?.categories || consent?.categories || [];
      return categories.includes('analytics');
    } catch (e) {
      console.warn('Failed to parse cookie consent:', e);
      return false;
    }
  }
  return false;
};

/**
 * Безпечний виклик gtag тільки якщо є згода
 */
export const safeGtag = (...args: any[]): void => {
  if (typeof window === 'undefined') return;

  if (hasAnalyticsConsent() && window.gtag) {
    window.gtag(...args);
  } else {
    console.log('gtag blocked - no analytics consent');
  }
};

/**
 * Трекінг події тільки з згодою
 */
export const trackEvent = (eventName: string, parameters?: any): void => {
  safeGtag('event', eventName, parameters);
};

/**
 * Трекінг перегляду сторінки
 */
export const trackPageView = (pageTitle?: string, pagePath?: string): void => {
  safeGtag('config', useRuntimeConfig().public.gtagId, {
    page_title: pageTitle,
    page_location: pagePath || window.location.href,
    page_path: pagePath || window.location.pathname,
  });
};

/**
 * Трекінг конверсії
 */
export const trackConversion = (conversionId: string, value?: number, currency?: string): void => {
  safeGtag('event', 'conversion', {
    send_to: conversionId,
    value: value,
    currency: currency || 'UAH',
  });
};

/**
 * Встановлення користувацьких параметрів
 */
export const setUserProperties = (properties: Record<string, any>): void => {
  safeGtag('config', useRuntimeConfig().public.gtagId, {
    custom_map: properties,
  });
};

/**
 * Відключення analytics (викликається при відзиві згоди)
 */
export const disableAnalytics = (): void => {
  if (typeof window === 'undefined') return;

  // Відключаємо gtag
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push([
    'consent',
    'update',
    {
      analytics_storage: 'denied',
      ad_storage: 'denied',
    },
  ]);

  // Видаляємо analytics cookies
  const analyticsCookies = ['_ga', '_ga_', '_gid', '_gat', '_gat_gtag_'];

  analyticsCookies.forEach((cookieName) => {
    // Видаляємо на поточному домені
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    // Видаляємо на батьківському домені
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
  });

  console.log('Analytics disabled and cookies cleared');
};

/**
 * Увімкнення analytics (викликається при наданні згоди)
 */
export const enableAnalytics = (): void => {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push([
    'consent',
    'update',
    {
      analytics_storage: 'granted',
    },
  ]);

  console.log('Analytics enabled');
};
