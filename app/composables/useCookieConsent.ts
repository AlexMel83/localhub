type ConsentData = { categories: string[] } | { cookie: { categories: string[] } };

export const useCookieConsent = () => {
  const getCookieConsentData = (): ConsentData | null => {
    if (typeof window === 'undefined') return null;

    const cookieValue = document.cookie.split('; ').find((row) => row.startsWith('cc_cookie='));

    if (cookieValue) {
      try {
        const consent = JSON.parse(decodeURIComponent(cookieValue.split('=')[1] ?? ''));
        return consent as ConsentData;
      } catch (e) {
        console.warn('Failed to parse cookie consent:', e);
        return null;
      }
    }
    return null;
  };

  const hasConsent = (category: string): boolean => {
    const consent = getCookieConsentData();
    if (!consent) return false;
    if ('categories' in consent) {
      return consent.categories.includes(category);
    } else if ('cookie' in consent && 'categories' in consent.cookie) {
      return consent.cookie.categories.includes(category);
    }
    return false;
  };

  const hasAnalyticsConsent = (): boolean => {
    return hasConsent('analytics');
  };

  const hasI18nConsent = (): boolean => {
    return hasConsent('i18n');
  };

  const hasThemeConsent = (): boolean => {
    return hasConsent('theme');
  };

  const showPreferences = (): void => {
    if (typeof window !== 'undefined' && window.CC) {
      window.CC.showPreferences();
    }
  };

  const acceptCategory = (category: string): void => {
    if (typeof window !== 'undefined' && window.CC) {
      window.CC.acceptCategory(category);
    }
  };

  const isConsentRequired = (): boolean => {
    return getCookieConsentData() === null;
  };

  const getAllCategories = (): string[] => {
    const consent = getCookieConsentData();
    if (!consent) return [];
    if ('categories' in consent) {
      return consent.categories;
    } else if ('cookie' in consent && 'categories' in consent.cookie) {
      return consent.cookie.categories;
    }
    return [];
  };

  return {
    getCookieConsentData,
    hasConsent,
    hasAnalyticsConsent,
    hasI18nConsent,
    hasThemeConsent,
    showPreferences,
    acceptCategory,
    isConsentRequired,
    getAllCategories,
  };
};

// Додаємо типи для window.CC
declare global {
  interface Window {
    CC?: {
      showPreferences(): void;
      acceptCategory(category: string): void;
      run(config: unknown): void;
    };
  }
}
