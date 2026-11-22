import { DEFAULT_REGION, SVITLO_REGIONS } from '../../../shared/utils/svitloRegions';
import { queueToParam } from '../../../shared/utils/svitloTime';

export const SVITLO_SITE = (process.env.NUXT_PUBLIC_SITE_URL || 'https://json63.pp.ua').replace(/\/$/, '');

export interface SvitloSitemapEntry {
  loc: string;
  changefreq: 'hourly';
  priority: number;
  alternatives: { hreflang: string; href: string }[];
}

/**
 * Outage pages: overview, every region and every subqueue (today + tomorrow).
 * One entry per page (uk path) with uk / en / x-default alternates.
 */
export function svitloSitemapEntries(): SvitloSitemapEntry[] {
  const paths = ['/svitlo-cherga'];
  for (const r of SVITLO_REGIONS) {
    if (r.slug !== DEFAULT_REGION) paths.push(`/svitlo-cherga/${r.slug}`);
    for (const queue of r.queues) {
      const base = `/svitlo-cherga/${r.slug}/${queueToParam(queue)}`;
      paths.push(base, `${base}/zavtra`);
    }
  }
  const regionOf = (path: string) => path.split('/')[2];
  return paths.map((path) => ({
    loc: path,
    changefreq: 'hourly' as const,
    priority: path === '/svitlo-cherga' ? 0.9 : regionOf(path) === DEFAULT_REGION ? 0.8 : 0.5,
    alternatives: [
      { hreflang: 'uk-UA', href: `${SVITLO_SITE}${path}` },
      { hreflang: 'en-US', href: `${SVITLO_SITE}/en${path}` },
      { hreflang: 'x-default', href: `${SVITLO_SITE}${path}` },
    ],
  }));
}
