import type { OutageInterval } from '#shared/types/svitlo';
import { KYIV_TZ, kyivHm, splitMinutes } from '#shared/utils/svitloTime';

/**
 * Shared "now" for outage widgets. SSR renders with the server time, which is
 * transferred to the client via useState, so hydration matches; afterwards a
 * single interval refreshes it (and immediately when the tab becomes visible).
 */
export function useSvitloNow(intervalMs = 30_000) {
  const now = useState<number>('svitlo-now', () => Date.now());
  if (import.meta.client) {
    let timer: ReturnType<typeof setInterval> | undefined;
    const tick = () => {
      now.value = Date.now();
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick();
    };
    onMounted(() => {
      tick();
      timer = setInterval(tick, intervalMs);
      document.addEventListener('visibilitychange', onVisible);
    });
    onBeforeUnmount(() => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    });
  }
  return now;
}

/** Locale-aware formatting helpers bound to vue-i18n. */
export function useSvitloFormat() {
  const { t, locale } = useI18n();

  const duration = (minutes: number) => {
    const { h, m } = splitMinutes(minutes);
    if (h && m) return t('Svitlo.duration.hm', { h, m });
    if (h) return t('Svitlo.duration.h', { h });
    return t('Svitlo.duration.m', { m });
  };

  const range = (i: Pick<OutageInterval, 'start' | 'end'>) => `${kyivHm(i.start)}–${kyivHm(i.end, true)}`;

  const dayLabel = (date: string) =>
    new Intl.DateTimeFormat(locale.value === 'en' ? 'en-GB' : 'uk-UA', {
      timeZone: KYIV_TZ,
      day: 'numeric',
      month: 'long',
      weekday: 'short',
    }).format(new Date(`${date}T12:00:00Z`));

  const dateTime = (iso: string | null) => {
    if (!iso) return '';
    return new Intl.DateTimeFormat(locale.value === 'en' ? 'en-GB' : 'uk-UA', {
      timeZone: KYIV_TZ,
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(new Date(iso));
  };

  const regionName = (r: { nameUk: string; nameEn: string } | null | undefined) =>
    r ? (locale.value === 'en' ? r.nameEn : r.nameUk) : '';

  return { t, locale, duration, range, dayLabel, dateTime, regionName, hm: kyivHm };
}

/** The visitor's saved queue (cookie, so SSR can show it immediately). */
export function useSvitloSavedQueue() {
  const cookie = useCookie<string | null>('svitlo_queue', {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    default: () => null,
  });
  const saved = computed(() => {
    const [region, queue] = (cookie.value ?? '').split('/');
    return region && queue ? { region, queue } : null;
  });
  const save = (region: string, queue: string) => {
    cookie.value = `${region}/${queue}`;
  };
  const clear = () => {
    cookie.value = null;
  };
  return { saved, save, clear };
}

/** Link to the outage alerts bot (NUXT_PUBLIC_TELEGRAM_BOT), or null when not configured. */
export function useSvitloBotUrl() {
  const bot = String(useRuntimeConfig().public.telegramBot || '').replace(/^@/, '');
  return bot ? `https://t.me/${bot}` : null;
}
