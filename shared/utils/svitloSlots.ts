// Slot -> interval math (port of localhub_back outages/time.js + schedule.js)
// used by the Nitro fallback path when the backend is unavailable.
import type { OutageInterval, PublishedState, QueueDay, SlotStatus } from '../types/svitlo';
import { KYIV_TZ } from './svitloTime';

export const SLOTS_PER_DAY = 48;
const SLOT_MINUTES = 30;

const partsFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: KYIV_TZ,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

function kyivOffsetMinutes(date: Date): number {
  const p = Object.fromEntries(partsFormatter.formatToParts(date).map((x) => [x.type, Number(x.value)]));
  const asUtc = Date.UTC(p.year!, p.month! - 1, p.day!, p.hour!, p.minute!, p.second!);
  return Math.round((asUtc - Math.floor(date.getTime() / 1000) * 1000) / 60000);
}

export function kyivLocalToDate(date: string, minutes: number): Date {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  const wall = Date.UTC(y, m - 1, d, 0, minutes);
  let guess = wall - kyivOffsetMinutes(new Date(wall)) * 60000;
  guess = wall - kyivOffsetMinutes(new Date(guess)) * 60000;
  return new Date(guess);
}

export function toKyivIso(date: Date): string {
  const off = kyivOffsetMinutes(date);
  const local = new Date(date.getTime() + off * 60000);
  const abs = Math.abs(off);
  const sign = off >= 0 ? '+' : '-';
  return `${local.toISOString().slice(0, 19)}${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
}

export function slotLabel(index: number): string {
  const min = index * SLOT_MINUTES;
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
}

export function intervalsFromSlots(date: string, slots: SlotStatus[]): OutageInterval[] {
  const out: OutageInterval[] = [];
  let i = 0;
  while (i < slots.length) {
    const status = slots[i];
    if (status !== 'off' && status !== 'maybe') {
      i++;
      continue;
    }
    let j = i;
    while (j < slots.length && slots[j] === status) j++;
    const start = kyivLocalToDate(date, i * SLOT_MINUTES);
    const end = kyivLocalToDate(date, j * SLOT_MINUTES);
    out.push({
      start: toKyivIso(start),
      end: toKyivIso(end),
      status,
      minutes: Math.round((end.getTime() - start.getTime()) / 60000),
    });
    i = j;
  }
  return out;
}

export function queueStateFromSlots(slots: SlotStatus[]): PublishedState {
  if (!slots.length || slots.every((s) => s === 'unknown')) return 'not_published';
  if (!slots.some((s) => s === 'off' || s === 'maybe')) return 'empty';
  return 'published';
}

export function buildQueueDay(date: string, queue: string, slots: SlotStatus[]): QueueDay {
  const intervals = intervalsFromSlots(date, slots);
  const sum = (st: string) => intervals.filter((x) => x.status === st).reduce((a, x) => a + x.minutes, 0);
  return {
    queue,
    slots,
    intervals,
    totalOffMinutes: sum('off'),
    totalMaybeMinutes: sum('maybe'),
    publishedState: queueStateFromSlots(slots),
  };
}

export function regionStateOf(queues: QueueDay[], emergency: boolean): PublishedState {
  if (emergency) return 'emergency';
  if (!queues.length || queues.every((q) => q.publishedState === 'not_published')) return 'not_published';
  if (queues.some((q) => q.publishedState === 'published')) return 'published';
  return 'empty';
}

export function compareQueues(a: string, b: string): number {
  const [a1 = 0, a2 = 0] = a.split('.').map(Number);
  const [b1 = 0, b2 = 0] = b.split('.').map(Number);
  return a1 - b1 || a2 - b2;
}
