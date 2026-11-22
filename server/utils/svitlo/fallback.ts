// Last-resort path when localhub_back is down and no snapshot is cached:
// read the public svitlo.live worker directly and normalize it here.
import type { QueueDay, RegionDay, SlotStatus } from '../../../shared/types/svitlo';
import { findRegion } from '../../../shared/utils/svitloRegions';
import {
  SLOTS_PER_DAY,
  buildQueueDay,
  compareQueues,
  regionStateOf,
  slotLabel,
} from '../../../shared/utils/svitloSlots';

const LEGACY_URL = 'https://svitlo-proxy.svitlo-proxy.workers.dev/';
const VALUES: Record<number, SlotStatus> = { 1: 'on', 2: 'off', 3: 'maybe', 0: 'unknown' };

interface SvitloPayload {
  regions?: Array<{
    cpu: string;
    emergency?: boolean;
    schedule?: Record<string, Record<string, Record<string, number>>> | null;
  }>;
}

export function normalizeSvitlo(payload: SvitloPayload, regionSlug: string, date: string): RegionDay | null {
  const def = findRegion(regionSlug);
  const raw = payload.regions?.find((x) => x.cpu === def?.legacyCpu || x.cpu === def?.dtekCpu);
  if (!def || !raw) return null;
  const queues: QueueDay[] = Object.entries(raw.schedule ?? {})
    .map(([queue, byDate]) => {
      const day = byDate?.[date];
      const slots: SlotStatus[] = Array.from({ length: SLOTS_PER_DAY }, (_, i) =>
        day ? (VALUES[day[slotLabel(i)] ?? 0] ?? 'unknown') : 'unknown',
      );
      return buildQueueDay(date, queue, slots);
    })
    .sort((a, b) => compareQueues(a.queue, b.queue));
  const emergency = raw.emergency === true;
  return {
    region: regionSlug,
    date,
    publishedState: regionStateOf(queues, emergency),
    emergency,
    provider: 'svitlo-direct',
    stale: true,
    sourcesAgree: null,
    source: { name: 'svitlo.live', url: 'https://svitlo.live' },
    sourceUpdatedAt: null,
    fetchedAt: new Date().toISOString(),
    queues,
  };
}

export async function directSvitlo(regionSlug: string, date: string): Promise<RegionDay | null> {
  const payload = await $fetch<SvitloPayload>(LEGACY_URL, {
    timeout: 10_000,
    headers: { 'User-Agent': 'LocalHubBot/1.0 (+https://json63.pp.ua/svitlo-cherga)' },
  });
  return normalizeSvitlo(payload, regionSlug, date);
}
