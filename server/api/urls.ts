import { defineSitemapEventHandler } from '#imports';

export default defineSitemapEventHandler(async () => {
  // Same site URL as the rest of the app (NUXT_PUBLIC_SITE_URL), no stray env names.
  const siteUrl = String(useRuntimeConfig().public.siteUrl || 'https://json63.pp.ua').replace(/\/$/, '');
  const apiBase = process.env.API_BASE_URL || 'https://api.json63.pp.ua';
  const defaultLocale = 'uk';
  const locales = ['uk', 'en'];

  // Інтерфейс для елементів API
  interface ApiItem {
    slug: string;
    updated_at?: string; // Для lastmod
    thumbnail_url?: string; // Додано для зображень
  }

  // Інтерфейс для маршрутів
  interface RouteItem {
    route: string;
    lastmod: string;
    thumbnail_url?: string; // Опціональне поле
  }

  const staticRoutes = [
    // '',
    // '/terms',
    // '/privacy-policy',
    // '/donation-service-terms',
    // '/howtohelp',
  ] as string[];

  const generateRoutes = (items: ApiItem[], basePath: string): RouteItem[] =>
    items.flatMap((item) =>
      locales.map((locale) => ({
        route: `${locale === defaultLocale ? '' : `/${locale}`}/${basePath}/${item.slug}`,
        lastmod: item.updated_at ? new Date(item.updated_at).toISOString() : new Date().toISOString(),
        thumbnail_url: item.thumbnail_url,
      })),
    );

  try {
    // Усуваємо подвійний слеш і логуємо URL
    const storesEndpoint = `${apiBase.replace(/\/+$/, '')}/business`;
    console.log('Fetching stores from:', storesEndpoint);

    const storesRes = await fetch(storesEndpoint, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!storesRes.ok) {
      console.error(`Failed to fetch stores: ${storesRes.status} ${storesRes.statusText}`);
      const errorText = await storesRes.text();
      console.error('Response body:', errorText);
      throw new Error(`Stores fetch failed: ${storesRes.status} - ${errorText}`);
    }

    const storesData = await storesRes.json();
    console.log('API response:', storesData); // Логування відповіді API
    if (!Array.isArray(storesData)) {
      console.error('API returned invalid data format: expected an array, got:', storesData);
      throw new Error('Invalid API response format');
    }

    const stores = storesData as ApiItem[];

    // Generate dynamic routes with /starkon/ suffix
    const dynamicRoutes = generateRoutes(stores, 'starkon');

    // Combine all routes
    const allRoutes: RouteItem[] = [
      ...staticRoutes.map((route) => ({ route, lastmod: new Date().toISOString() })),
      ...dynamicRoutes,
    ];

    return allRoutes.map((item) => ({
      loc: `${siteUrl}${item.route}`,
      lastmod: item.lastmod,
      changefreq: 'weekly',
      priority: item.route === '' ? 1.0 : 0.8,
      // Absolute thumbnails (e.g. Google Photos) stay as they are; only local paths get the site URL.
      images: item.thumbnail_url
        ? [
            {
              loc: /^https?:\/\//i.test(item.thumbnail_url)
                ? item.thumbnail_url
                : encodeURI(`${siteUrl}${item.thumbnail_url.startsWith('/') ? '' : '/'}${item.thumbnail_url}`),
            },
          ]
        : undefined,
    }));
  } catch (error) {
    console.error('Error generating sitemap:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    return staticRoutes.map((route) => ({
      loc: `${siteUrl}${route}`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: route === '' ? 1.0 : 0.8,
    }));
  }
});
