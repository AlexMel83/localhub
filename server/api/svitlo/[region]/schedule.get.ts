import { assertRegion, getRegionDay, resolveDateParam } from '../../../utils/svitlo/backend';

function params(event: Parameters<typeof getQuery>[0]) {
  const region = assertRegion(getRouterParam(event, 'region'));
  const date = resolveDateParam(getQuery(event).date);
  if (!date) throw createError({ statusCode: 400, statusMessage: 'Invalid date' });
  return { region: region.slug, date };
}

export default defineCachedEventHandler(
  async (event) => {
    const { region, date } = params(event);
    return getRegionDay(region, date, event);
  },
  {
    name: 'svitlo-schedule',
    maxAge: 60,
    swr: true,
    getKey: (event) => {
      const { region, date } = params(event);
      return `${region}:${date}`;
    },
  },
);
