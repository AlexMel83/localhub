declare global {
  interface Window {
    dataLayer: unknown[];
    openPreferences: () => void;
  }
  interface CookieConsent {
    showSettings: () => void;
  }
}
