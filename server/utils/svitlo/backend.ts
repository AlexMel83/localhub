// Server-to-server access to localhub_back /outages/*, validated with zod.
// Every successful response is stored in Nitro storage ("svitlo", fs driver)
// and served back with stale=true when the backend is unreachable.
import type { H3Event } from 'h3';
import type { StorageValue } from 'unstorage';
import type { z } from 'zod';
import type { RegionDay } from '../../../shared/types/svitlo';
import { addDays, kyivDate } from '../../../shared/utils/svitloTime';
import { findRegion } from '../../../shared/utils/svitloRegions';
import { regionDaySchema } from './schema';
import { directSvitlo } from './fallback';

const storage = () => useStorage('svitlo');

function baseUrl(event?: H3Event): string {
  const config = useRuntimeConfig(event);
  return String(config.outagesApiBase || config.public.apiBase).replace(/\/$/, '');
}

export async function backendGet<S extends z.ZodTypeAny>(
  path: string,
  schema: S,
  opts: { event?: H3Event; query?: Record<string, string | undefined>; storeKey?: string } = {},
): Promise<{ data: z.infer<S>; fromStore: boolean }> {
  try {
    const raw = await $fetch(`${baseUrl(opts.event)}${path}`, {
      query: opts.query,
      timeout: 8000,
      retry: 1,
    });
    const data = schema.parse(raw);
    if (opts.storeKey) await storage().setItem(opts.storeKey, data as StorageValue);
    return { data, fromStore: false };
  } catch (error) {
    if (opts.storeKey) {
      const last = await storage().getItem(opts.storeKey);
      const parsed = schema.safeParse(last);
      if (parsed.success) {
        console.warn(`[svitlo] backend ${path} failed, serving stored copy:`, (error as Error).message);
        return { data: parsed.data, fromStore: true };
      }
    }
    throw error;
  }
}

/** "today" | "tomorrow" | YYYY-MM-DD -> YYYY-MM-DD (Kyiv), or null. */
export function resolveDateParam(value: unknown, now = Date.now()): string | null {
  const today = kyivDate(now);
  if (value === undefined || value === '' || value === 'today') return today;
  if (value === 'tomorrow') return addDays(today, 1);
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return value >= addDays(today, -31) && value <= addDays(today, 2) ? value : null;
}

export function assertRegion(slug: string | undefined) {
  const region = slug ? findRegion(slug) : undefined;
  if (!region) throw createError({ statusCode: 404, statusMessage: 'Unknown region' });
  return region;
}

/** Region schedule with the full fallback chain. */
export async function getRegionDay(region: string, date: string, event?: H3Event): Promise<RegionDay> {
  try {
    const { data, fromStore } = await backendGet(`/outages/${region}/schedule`, regionDaySchema, {
      event,
      query: { date },
      storeKey: `schedule:${region}:${date}`,
    });
    return fromStore ? { ...data, stale: true } : data;
  } catch (error) {
    console.warn(`[svitlo] backend and store unavailable for ${region}/${date}:`, (error as Error).message);
    const direct = await directSvitlo(region, date).catch(() => null);
    if (direct) return direct;
    throw createError({ statusCode: 503, statusMessage: 'Outage schedule source unavailable' });
  }
}
