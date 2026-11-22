// Pure helpers for "what is the status now / what happens next".
// Inputs are absolute intervals (ISO with offset), so no tz math is needed
// except formatting, which always uses Europe/Kyiv.
import type { OutageInterval, OutageStatus } from '../types/svitlo';

export const KYIV_TZ = 'Europe/Kyiv';

export type NowStatus = 'on' | OutageStatus | 'unknown';

export interface Span {
  start: number;
  end: number;
  status: OutageStatus;
}

export interface NowState {
  status: NowStatus;
  /** current outage span (merged across midnight), if any */
  current: Span | null;
  /** next status change within the known horizon */
  next: { at: number; status: NowStatus } | null;
}

/** Sorts and merges touching intervals of the same status. */
export function mergeIntervals(intervals: OutageInterval[]): Span[] {
  const spans = intervals
    .map((i) => ({ start: Date.parse(i.start), end: Date.parse(i.end), status: i.status }))
    .filter((s) => Number.isFinite(s.start) && Number.isFinite(s.end) && s.end > s.start)
    .sort((a, b) => a.start - b.start);
  const out: Span[] = [];
  for (const s of spans) {
    const last = out.at(-1);
    if (last && last.status === s.status && s.start <= last.end) {
      last.end = Math.max(last.end, s.end);
    } else {
      out.push({ ...s });
    }
  }
  return out;
}

/**
 * Status at `now`.
 * @param knownFrom  start of the first published day (ms)
 * @param knownUntil end of the last published day (ms); beyond it nothing is known
 */
export function nowState(intervals: OutageInterval[], now: number, knownFrom: number, knownUntil: number): NowState {
  if (now < knownFrom || now >= knownUntil) {
    return { status: 'unknown', current: null, next: null };
  }
  const spans = mergeIntervals(intervals);
  const current = spans.find((s) => s.start <= now && now < s.end) ?? null;
  if (current) {
    const after = spans.find((s) => s.start === current.end);
    const at = current.end;
    const status: NowStatus = at >= knownUntil ? 'unknown' : (after?.status ?? 'on');
    return { status: current.status, current, next: { at, status } };
  }
  const upcoming = spans.find((s) => s.start > now);
  if (upcoming && upcoming.start < knownUntil) {
    return { status: 'on', current: null, next: { at: upcoming.start, status: upcoming.status } };
  }
  return { status: 'on', current: null, next: { at: knownUntil, status: 'unknown' } };
}

const hmFormatter = new Intl.DateTimeFormat('uk-UA', {
  timeZone: KYIV_TZ,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/** "17:00" in Kyiv; an interval end at next midnight is shown as "24:00" when asked. */
export function kyivHm(value: string | number, endOfDay = false): string {
  const text = hmFormatter.format(new Date(value));
  return endOfDay && text === '00:00' ? '24:00' : text;
}

const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: KYIV_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** YYYY-MM-DD in Kyiv. */
export function kyivDate(value: number | Date = Date.now()): string {
  return dateFormatter.format(new Date(value));
}

export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Splits minutes into hours and minutes for i18n formatting. */
export function splitMinutes(total: number): { h: number; m: number } {
  const safe = Math.max(0, Math.round(total));
  return { h: Math.floor(safe / 60), m: safe % 60 };
}

/** "3.1" <-> "3-1" for URLs. */
export const queueToParam = (q: string) => q.replace('.', '-');
export const paramToQueue = (p: string) => {
  const m = /^(\d{1,2})[-.](\d{1,2})$/.exec(p);
  return m ? `${Number(m[1])}.${Number(m[2])}` : null;
};
