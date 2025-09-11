// app/composables/useCookieConsent.ts
import { computed } from 'vue';

export const useCookieConsent = () => {
  const getCC = () => (import.meta.client ? (window as unknown).CookieConsent : undefined);

  const acceptedCategory = (category: string): boolean => {
    const CC = getCC();
    try {
      return !!(CC && typeof CC.acceptedCategory === 'function' && CC.acceptedCategory(category));
    } catch {
      return false;
    }
  };

  const rejectedCategory = (category: string): boolean => {
    try {
      return !acceptedCategory(category);
    } catch {
      return true;
    }
  };

  const getCookie = () => {
    try {
      const CC = getCC();
      return CC && typeof CC.getCookie === 'function' ? CC.getCookie() : null;
    } catch {
      return null;
    }
  };

  const showSettings = () => {
    const CC = getCC();
    if (!CC) {
      console.error('CookieConsent is not ready yet');
      return;
    }
    if (typeof CC.showSettings === 'function') return CC.showSettings();
    if (typeof CC.show === 'function') return CC.show();
    console.error('CookieConsent API missing show/showSettings');
  };

  const show = () => {
    const CC = getCC();
    if (!CC) {
      console.error('CookieConsent is not ready yet');
      return;
    }
    if (typeof CC.show === 'function') return CC.show();
    if (typeof CC.showSettings === 'function') return CC.showSettings();
  };

  const hide = () => {
    const CC = getCC();
    try {
      if (CC && typeof CC.hide === 'function') CC.hide();
    } catch (e) {
      console.error('Error hiding consent', e);
    }
  };

  const acceptCategory = (categories: string | string[]) => {
    const CC = getCC();
    try {
      if (CC && typeof CC.acceptCategory === 'function') CC.acceptCategory(categories);
    } catch (e) {
      console.error('Error accepting category', e);
    }
  };

  const rejectCategory = (categories: string | string[]) => {
    const CC = getCC();
    try {
      if (CC && typeof CC.rejectCategory === 'function') CC.rejectCategory(categories);
    } catch (e) {
      console.error('Error rejecting category', e);
    }
  };

  const validConsent = (): boolean => {
    const CC = getCC();
    try {
      return !!(CC && typeof CC.validConsent === 'function' && CC.validConsent());
    } catch {
      return false;
    }
  };

  const eraseCookies = (cookieNames: string[], path = '/', domain?: string) => {
    const CC = getCC();
    try {
      if (CC && typeof CC.eraseCookies === 'function') {
        if (domain) CC.eraseCookies(cookieNames, path, domain);
        else CC.eraseCookies(cookieNames, path);
      } else {
        // fallback: manual erase
        cookieNames.forEach((n) => {
          document.cookie = `${n}=; Max-Age=0; Path=${path}`;
          if (domain) document.cookie = `${n}=; Max-Age=0; Path=${path}; Domain=${domain}`;
        });
      }
    } catch (e) {
      console.error('Error erasing cookies', e);
    }
  };

  const isAnalyticsAccepted = computed(() => acceptedCategory('analytics'));
  const isFunctionalityAccepted = computed(() => acceptedCategory('functionality'));
  const hasValidConsent = computed(() => validConsent());

  return {
    // methods
    acceptedCategory,
    rejectedCategory,
    getCookie,
    showSettings,
    show,
    hide,
    acceptCategory,
    rejectCategory,
    validConsent,
    eraseCookies,

    // reactive states
    isAnalyticsAccepted,
    isFunctionalityAccepted,
    hasValidConsent,
  };
};
