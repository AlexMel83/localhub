import type { QueueDayView, QueuePageData, RegionDay } from '../../../../shared/types/svitlo';
import { findRegion, publicRegion } from '../../../../shared/utils/svitloRegions';
import { SLOTS_PER_DAY, buildQueueDay } from '../../../../shared/utils/svitloSlots';
import { addDays, kyivDate, paramToQueue } from '../../../../shared/utils/svitloTime';
import { assertRegion, getRegionDay } from '../../../utils/svitlo/backend';

function dayView(day: RegionDay, queue: string): QueueDayView {
  const found = day.queues.find((q) => q.queue === queue);
  const base = found ?? buildQueueDay(day.date, queue, Array(SLOTS_PER_DAY).fill('unknown'));
  return { ...base, date: day.date, dayState: day.publishedState };
}

function newest(a: string | null, b: string | null) {
  if (!a) return b;
  if (!b) return a;
  return Date.parse(a) > Date.parse(b) ? a : b;
}

export default defineCachedEventHandler(
  async (event): Promise<QueuePageData> => {
    const def = assertRegion(getRouterParam(event, 'region'));
    const queue = paramToQueue(getRouterParam(event, 'queue') ?? '');
    const today = kyivDate();
    const [d0, d1] = await Promise.all([
      getRegionDay(def.slug, today, event),
      getRegionDay(def.slug, addDays(today, 1), event),
    ]);
    const known = new Set([...def.queues, ...d0.queues.map((q) => q.queue)]);
    if (!queue || !known.has(queue)) {
      throw createError({ statusCode: 404, statusMessage: 'Unknown queue' });
    }
    return {
      region: publicRegion(findRegion(def.slug)!),
      queue,
      today: dayView(d0, queue),
      tomorrow: dayView(d1, queue),
      emergency: d0.emergency || d1.emergency,
      stale: d0.stale,
      sourcesAgree: d0.sourcesAgree,
      source: d0.source,
      sourceUpdatedAt: newest(d0.sourceUpdatedAt, d1.sourceUpdatedAt),
      fetchedAt: newest(d0.fetchedAt, d1.fetchedAt),
    };
  },
  {
    name: 'svitlo-queue',
    maxAge: 60,
    swr: true,
    getKey: (event) => `${getRouterParam(event, 'region')}:${getRouterParam(event, 'queue')}:${kyivDate()}`,
  },
);
