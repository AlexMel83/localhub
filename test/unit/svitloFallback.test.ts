import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { normalizeSvitlo } from '../../server/utils/svitlo/fallback';
import { intervalsFromSlots, kyivLocalToDate, toKyivIso } from '../../shared/utils/svitloSlots';
import { paramToQueue } from '../../shared/utils/svitloTime';
import { findRegion } from '../../shared/utils/svitloRegions';

const payload = JSON.parse(readFileSync(new URL('../fixtures/svitlo-legacy-2026-11-22.json', import.meta.url), 'utf8'));

describe('direct svitlo fallback', () => {
  it('normalizes Khmelnytska for today and marks it stale', () => {
    const day = normalizeSvitlo(payload, 'khmelnytska-oblast', '2026-11-22')!;
    expect(day.stale).toBe(true);
    expect(day.queues).toHaveLength(12);
    const q11 = day.queues.find((q) => q.queue === '1.1')!;
    expect(q11.intervals.map((i) => [i.start, i.end])).toEqual([
      ['2026-11-22T14:00:00+02:00', '2026-11-22T17:00:00+02:00'],
    ]);
    expect(day.publishedState).toBe('published');
  });

  it('tomorrow full of zeros is not published', () => {
    const day = normalizeSvitlo(payload, 'khmelnytska-oblast', '2026-11-23')!;
    expect(day.publishedState).toBe('not_published');
  });

  it('unknown region yields null', () => {
    expect(normalizeSvitlo(payload, 'atlantis', '2026-11-22')).toBeNull();
    expect(findRegion('kyiv')?.queues).toEqual([]);
    expect(paramToQueue('6-2')).toBe('6.2');
  });

  it('slot math matches the backend on DST days', () => {
    expect(toKyivIso(kyivLocalToDate('2026-10-25', 1440))).toBe('2026-10-26T00:00:00+02:00');
    const slots = Array(48).fill('on');
    for (let i = 0; i < 12; i++) slots[i] = 'off';
    expect(intervalsFromSlots('2026-10-25', slots)[0]!.minutes).toBe(420);
  });
});
