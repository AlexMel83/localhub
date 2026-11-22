import { assertRegion, backendGet, resolveDateParam } from '../../../utils/svitlo/backend';
import { changesSchema } from '../../../utils/svitlo/schema';

export default defineCachedEventHandler(
  async (event) => {
    const region = assertRegion(getRouterParam(event, 'region'));
    const date = resolveDateParam(getQuery(event).date);
    if (!date) throw createError({ statusCode: 400, statusMessage: 'Invalid date' });
    try {
      const { data } = await backendGet(`/outages/${region.slug}/changes`, changesSchema, {
        event,
        query: { date },
        storeKey: `changes:${region.slug}:${date}`,
      });
      return data;
    } catch {
      // The change feed is optional: an empty list keeps the page usable.
      return [];
    }
  },
  {
    name: 'svitlo-changes',
    maxAge: 60,
    swr: true,
    getKey: (event) => `${getRouterParam(event, 'region')}:${resolveDateParam(getQuery(event).date)}`,
  },
);
