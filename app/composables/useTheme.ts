// app/composables/useThemeConsent.ts
import { onMounted, watch, useState } from '#imports';
import { useCookieConsent } from '~/composables/useCookieConsent';

type Theme = 'light' | 'dark' | 'system';
const THEME_COOKIE = 'theme';
const MAX_AGE = 60 * 60 * 24 * 365;

export function useThemeConsent() {
  const { isFunctionalityAccepted } = useCookieConsent();
  const theme = useState<Theme>('ui-theme', () => 'system');

  const applyTheme = (t: Theme) => {
    const final = t === 'system' ? (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : t;
    document.documentElement.classList.toggle('dark', final === 'dark');
  };

  const saveCookie = (t: Theme) => {
    if (!isFunctionalityAccepted.value) return;
    document.cookie = `${THEME_COOKIE}=${encodeURIComponent(t)}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax; Secure`;
  };

  const removeCookie = () => {
    document.cookie = `${THEME_COOKIE}=; Max-Age=0; Path=/`;
  };

  const setTheme = (t: Theme) => {
    theme.value = t;
    applyTheme(t);
    if (isFunctionalityAccepted.value) saveCookie(t);
    else removeCookie();
  };

  onMounted(() => {
    if (isFunctionalityAccepted.value) {
      const cookie = document.cookie
        .split('; ')
        .find((c) => c.startsWith(`${THEME_COOKIE}=`))
        ?.split('=')[1];
      if (cookie) {
        const un = decodeURIComponent(cookie);
        if (un === 'light' || un === 'dark' || un === 'system') theme.value = un;
      }
    }
    applyTheme(theme.value);
  });

  watch(isFunctionalityAccepted, (ok) => {
    if (!ok) removeCookie();
    else saveCookie(theme.value);
  });

  return { theme, setTheme };
}
