import { SVITLO_SITE, svitloSitemapEntries } from '../../utils/svitlo/sitemap';

// Standalone sitemap inside /svitlo-cherga/ for the Search Console
// URL-prefix property https://json63.pp.ua/svitlo-cherga/ (a property only
// accepts sitemaps located within its own path).
export default defineEventHandler((event) => {
  const urls = svitloSitemapEntries()
    // Only URLs inside the property prefix: "/svitlo-cherga" itself (no slash)
    // is outside it and lives in the site-wide sitemap.
    .filter((e) => e.loc.startsWith('/svitlo-cherga/'))
    .map((e) =>
      [
        '  <url>',
        `    <loc>${SVITLO_SITE}${e.loc}</loc>`,
        `    <changefreq>${e.changefreq}</changefreq>`,
        `    <priority>${e.priority.toFixed(1)}</priority>`,
        ...e.alternatives.map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}"/>`),
        '  </url>',
      ].join('\n'),
    )
    .join('\n');
  setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8');
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600');
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    urls,
    '</urlset>',
    '',
  ].join('\n');
});
