// Shared handler for the address autocomplete proxies (/settlements, /streets, /house).
import type { H3Event } from 'h3';
import type { z } from 'zod';
import { assertRegion, backendGet } from './backend';

const text = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

export async function proxyAddress<S extends z.ZodTypeAny>(
  event: H3Event,
  path: 'settlements' | 'streets' | 'house',
  schema: S,
  fields: Record<string, number>,
): Promise<z.infer<S>> {
  const region = assertRegion(getRouterParam(event, 'region'));
  const raw = getQuery(event);
  const query: Record<string, string | undefined> = {};
  for (const [key, max] of Object.entries(fields)) query[key] = text(raw[key], max) || undefined;
  try {
    const { data } = await backendGet(`/outages/${region.slug}/${path}`, schema, { event, query });
    setHeader(event, 'cache-control', 'public, max-age=3600');
    return data;
  } catch (error) {
    console.warn(`[svitlo] address ${path} failed:`, (error as Error).message);
    throw createError({ statusCode: 503, statusMessage: 'Address directory unavailable' });
  }
}
