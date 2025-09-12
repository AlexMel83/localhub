declare global {
  interface Window {
    dataLayer: unknown[];
    openPreferences: () => void;
    CookieConsent: typeof CookieConsent;
  }
  interface CookieConsent {
    showSettings: () => void;
  }
}
