export default defineSitemapEventHandler(async () => {
  const siteUrl = process.env.SITE_URL || 'https://localhub.store';
  const apiBase = process.env.API_BASE_URL || 'https://api.localhub.store';
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
    const storesEndpoint = `${apiBase.replace(/\/+$/, '')}/stores`;
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
      images: item.thumbnail_url
        ? [{ loc: `${siteUrl}${item.thumbnail_url.startsWith('/') ? '' : '/'}${item.thumbnail_url}` }]
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
