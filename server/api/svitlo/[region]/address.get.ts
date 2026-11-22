import { assertRegion, backendGet } from '../../../utils/svitlo/backend';
import { addressSchema } from '../../../utils/svitlo/schema';

export default defineEventHandler(async (event) => {
  const region = assertRegion(getRouterParam(event, 'region'));
  const { q, settlement } = getQuery(event);
  const text = typeof q === 'string' ? q.trim().slice(0, 120) : '';
  if (text.length < 2) return { query: { street: '', house: null }, matches: [] };
  try {
    const { data } = await backendGet(`/outages/${region.slug}/address`, addressSchema, {
      event,
      query: { q: text, settlement: typeof settlement === 'string' ? settlement.slice(0, 80) : undefined },
    });
    setHeader(event, 'cache-control', 'public, max-age=3600');
    return data;
  } catch {
    throw createError({ statusCode: 503, statusMessage: 'Address search unavailable' });
  }
});
