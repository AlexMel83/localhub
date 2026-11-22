import { describe, expect, it } from 'vitest';
import {
  addDays,
  kyivDate,
  kyivHm,
  mergeIntervals,
  nowState,
  paramToQueue,
  queueToParam,
  splitMinutes,
} from '../../shared/utils/svitloTime';
import type { OutageInterval } from '../../shared/types/svitlo';

const iv = (start: string, end: string, status: 'off' | 'maybe' = 'off'): OutageInterval => ({
  start,
  end,
  status,
  minutes: (Date.parse(end) - Date.parse(start)) / 60000,
});

const T = (iso: string) => Date.parse(iso);
const dayStart = T('2026-11-22T00:00:00+02:00');
const twoDaysEnd = T('2026-11-24T00:00:00+02:00');
const oneDayEnd = T('2026-11-23T00:00:00+02:00');

const today = [
  iv('2026-11-22T06:00:00+02:00', '2026-11-22T10:00:00+02:00'),
  iv('2026-11-22T20:00:00+02:00', '2026-11-23T00:00:00+02:00'),
];
const tomorrow = [iv('2026-11-23T00:00:00+02:00', '2026-11-23T02:00:00+02:00')];

describe('nowState', () => {
  it('reports power on and the next outage', () => {
    const s = nowState(today, T('2026-11-22T12:00:00+02:00'), dayStart, oneDayEnd);
    expect(s.status).toBe('on');
    expect(s.next).toEqual({ at: T('2026-11-22T20:00:00+02:00'), status: 'off' });
  });

  it('reports an outage and when power returns', () => {
    const s = nowState(today, T('2026-11-22T07:00:00+02:00'), dayStart, oneDayEnd);
    expect(s.status).toBe('off');
    expect(s.next).toEqual({ at: T('2026-11-22T10:00:00+02:00'), status: 'on' });
  });

  it('merges an outage across midnight when tomorrow is known', () => {
    const s = nowState([...today, ...tomorrow], T('2026-11-22T23:00:00+02:00'), dayStart, twoDaysEnd);
    expect(s.status).toBe('off');
    expect(s.next?.at).toBe(T('2026-11-23T02:00:00+02:00'));
  });

  it('marks the end as unknown when tomorrow is not published', () => {
    const s = nowState(today, T('2026-11-22T23:00:00+02:00'), dayStart, oneDayEnd);
    expect(s.status).toBe('off');
    expect(s.next).toEqual({ at: oneDayEnd, status: 'unknown' });
  });

  it('with no more outages, next change is the end of the known horizon', () => {
    const s = nowState(today.slice(0, 1), T('2026-11-22T12:00:00+02:00'), dayStart, oneDayEnd);
    expect(s).toEqual({ status: 'on', current: null, next: { at: oneDayEnd, status: 'unknown' } });
  });

  it('empty schedule means on for the whole known day', () => {
    const s = nowState([], T('2026-11-22T12:00:00+02:00'), dayStart, oneDayEnd);
    expect(s.status).toBe('on');
  });

  it('outside the known horizon the status is unknown', () => {
    expect(nowState(today, T('2026-11-23T01:00:00+02:00'), dayStart, oneDayEnd).status).toBe('unknown');
  });

  it('handles maybe after off as a status change', () => {
    const list = [
      iv('2026-11-22T10:00:00+02:00', '2026-11-22T11:00:00+02:00'),
      iv('2026-11-22T11:00:00+02:00', '2026-11-22T12:00:00+02:00', 'maybe'),
    ];
    const s = nowState(list, T('2026-11-22T10:30:00+02:00'), dayStart, oneDayEnd);
    expect(s.next).toEqual({ at: T('2026-11-22T11:00:00+02:00'), status: 'maybe' });
  });
});

describe('helpers', () => {
  it('mergeIntervals joins touching spans of the same status', () => {
    expect(mergeIntervals([...tomorrow, ...today])).toHaveLength(2);
  });

  it('formats Kyiv time regardless of host timezone', () => {
    expect(kyivHm('2026-11-22T15:00:00Z')).toBe('17:00');
    expect(kyivHm('2026-11-23T00:00:00+02:00', true)).toBe('24:00');
    expect(kyivDate(T('2026-11-22T22:30:00Z'))).toBe('2026-11-23');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('queue params and durations', () => {
    expect(queueToParam('3.1')).toBe('3-1');
    expect(paramToQueue('3-1')).toBe('3.1');
    expect(paramToQueue('x')).toBeNull();
    expect(splitMinutes(510)).toEqual({ h: 8, m: 30 });
  });
});
