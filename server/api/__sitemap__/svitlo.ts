import { DEFAULT_REGION, SVITLO_REGIONS } from '../../../shared/utils/svitloRegions';
import { queueToParam } from '../../../shared/utils/svitloTime';

// Outage pages: overview, every region and every subqueue (today + tomorrow), uk and en.
export default defineEventHandler(() => {
  const paths = ['/svitlo-cherga'];
  for (const region of SVITLO_REGIONS) {
    if (region.slug !== DEFAULT_REGION) paths.push(`/svitlo-cherga/${region.slug}`);
    for (const queue of region.queues) {
      const base = `/svitlo-cherga/${region.slug}/${queueToParam(queue)}`;
      paths.push(base, `${base}/zavtra`);
    }
  }
  return paths.flatMap((path) =>
    ['', '/en'].map((prefix) => ({
      loc: `${prefix}${path}`,
      changefreq: 'hourly' as const,
      priority: path === '/svitlo-cherga' ? 0.9 : region(path) === DEFAULT_REGION ? 0.8 : 0.5,
    })),
  );
});

const region = (path: string) => path.split('/')[2];
