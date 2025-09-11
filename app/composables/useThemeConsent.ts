import { useCookieConsent } from '~/composables/useCookieConsent';

type Theme = 'light' | 'dark' | 'system';

const THEME_COOKIE = 'theme';
const MAX_AGE = 60 * 60 * 24 * 365;

export function useThemeConsent() {
  const { acceptedCategory, eraseCookies } = useCookieConsent();
  const theme = useState<Theme>('ui-theme', () => 'system');

  const readSystem = () => (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  const applyTheme = (t: Theme) => {
    const final = t === 'system' ? readSystem() : t;
    document.documentElement.classList.toggle('dark', final === 'dark');
  };

  const saveCookie = (t: Theme) => {
    if (!acceptedCategory('functionality')) return;
    document.cookie = `${THEME_COOKIE}=${encodeURIComponent(t)}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax; Secure`;
  };

  const removeCookie = () => {
    eraseCookies([THEME_COOKIE], '/');
  };

  const setTheme = (t: Theme) => {
    theme.value = t;
    applyTheme(t);
    if (acceptedCategory('functionality')) saveCookie(t);
    else removeCookie();
  };

  onMounted(() => {
    // Читаємо cookie тільки якщо є згода
    if (acceptedCategory('functionality')) {
      const fromCookie = document.cookie
        .split('; ')
        .find((c) => c.startsWith(`${THEME_COOKIE}=`))
        ?.split('=')[1];
      if (fromCookie === 'light' || fromCookie === 'dark' || fromCookie === 'system') {
        theme.value = fromCookie;
      }
    }
    applyTheme(theme.value);
  });

  // Коли міняється згода
  watch(
    () => acceptedCategory('functionality'),
    (ok) => {
      if (!ok) removeCookie();
      else saveCookie(theme.value);
    },
  );

  return { theme, setTheme };
}
