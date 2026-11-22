import { DEFAULT_REGION, SVITLO_REGIONS } from '../../../shared/utils/svitloRegions';
import { queueToParam } from '../../../shared/utils/svitloTime';

const SITE = (process.env.NUXT_PUBLIC_SITE_URL || 'https://json63.pp.ua').replace(/\/$/, '');
const region = (path: string) => path.split('/')[2];

// Outage pages: overview, every region and every subqueue (today + tomorrow).
// One entry per page with uk / en / x-default alternates, so search engines
// pair the localized versions instead of competing as duplicates.
export default defineEventHandler(() => {
  const paths = ['/svitlo-cherga'];
  for (const r of SVITLO_REGIONS) {
    if (r.slug !== DEFAULT_REGION) paths.push(`/svitlo-cherga/${r.slug}`);
    for (const queue of r.queues) {
      const base = `/svitlo-cherga/${r.slug}/${queueToParam(queue)}`;
      paths.push(base, `${base}/zavtra`);
    }
  }
  return paths.map((path) => ({
    loc: path,
    changefreq: 'hourly' as const,
    priority: path === '/svitlo-cherga' ? 0.9 : region(path) === DEFAULT_REGION ? 0.8 : 0.5,
    alternatives: [
      { hreflang: 'uk-UA', href: `${SITE}${path}` },
      { hreflang: 'en-US', href: `${SITE}/en${path}` },
      { hreflang: 'x-default', href: `${SITE}${path}` },
    ],
  }));
});
