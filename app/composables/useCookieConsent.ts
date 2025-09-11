export const useCookieConsent = () => {
  const getCookieConsentData = (): any | null => {
    if (typeof window === 'undefined') return null;

    const cookieValue: unknown = document.cookie.split('; ').find((row) => row.startsWith('cc_cookie='));

    if (typeof cookieValue === 'string') {
      try {
        const consent = JSON.parse(decodeURIComponent(cookieValue?.split('=')[1] ?? ''));
        return consent;
      } catch (e) {
        console.warn('Failed to parse cookie consent:', e);
        return null;
      }
    }
    return null;
  };

  const hasConsent = (category: string): boolean => {
    const consent = getCookieConsentData();
    // Перевіряємо обидві можливі структури
    const categories = consent?.cookie?.categories || consent?.categories || [];
    return categories.includes(category);
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
    return consent?.cookie?.categories || consent?.categories || [];
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
      run(config: any): void;
    };
  }
}
