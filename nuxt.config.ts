
import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  modules: [
    "@nuxt/eslint",
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "@nuxt/image",
    "@nuxt/ui",
    "@nuxt/icon",
    "@nuxtjs/i18n",
    "@nuxtjs/leaflet",
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
  ], 
  robots: {
    allow: '/',
    disallow: ['/admin'],
    // /sitemap.xml is added by @nuxtjs/sitemap itself; there is no sitemap_index.xml
    // (single sitemap mode), so it must not be listed.
    sitemap: [`${process.env.NUXT_PUBLIC_SITE_URL || 'https://json63.pp.ua'}/svitlo-cherga/sitemap.xml`],
  },
  sitemap: {
    siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://json63.pp.ua',
    autoI18n: false,
    sources: ['/api/urls', '/api/__sitemap__/svitlo'],
    exclude: ['/test-gtm', '/en/test-gtm', '/starkon/create', '/en/starkon/create'],
    gzip: true,
    debug: process.env.NODE_ENV === 'development',
    defaults: {
      changefreq: 'daily',
      priority: 0.8
    },
    cacheMaxAgeSeconds: process.env.NODE_ENV === 'production' ? 3600 : 0
  },
  css: [
    "~/assets/css/main.css", 
    'vanilla-cookieconsent/dist/cookieconsent.css'
  ],
  leaflet: {
    markerCluster: true,
  },
  i18n: {
    locales: [
      {
        code: "uk",
        name: "UA", 
        file: "uk.json",
        iso: 'uk-UA'
      },
      {
        code: "en",
        name: "EN",
        file: "en.json", 
        iso: 'en-US'
      },
    ],
    vueI18n: 'i18n.config.ts',
    strategy: "prefix_except_default",
    detectBrowserLanguage: false,
  defaultLocale: "uk",
  langDir: "locales",
  baseUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://json63.pp.ua',
  customRoutes: 'config',
  differentDomains: false,
  skipSettingLocaleOnNavigate: false,
  defaultLocaleRouteNameSuffix: 'default'
  },
  runtimeConfig: {
    apiSecret: process.env.API_SECRET,
    // Server-only base URL of localhub_back for /outages/* (NUXT_OUTAGES_API_BASE)
    outagesApiBase: '',
    public: {
      apiKeyMapbox: process.env.APIKEY_MAPBOX,
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      gtagId: process.env.NUXT_PUBLIC_GTAG_ID || "G-C4177GTQXR",
      apiBase: process.env.API_BASE_URL || "http://localhost:4040",
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://json63.pp.ua',
      googleTagManagerId: process.env.GOOGLE_TAG_MANAGER_ID, 
      googleTagManagerEnabled: process.env.GOOGLE_TAG_MANAGER_ENABLED === 'true',
      googleTagManagerDebug: process.env.GOOGLE_TAG_MANAGER_DEBUG === 'true',
      // Telegram bot username without @ (NUXT_PUBLIC_TELEGRAM_BOT); empty hides the button
      telegramBot: '',
    },
  },
  plugins: [
    "~/plugins/axios.ts",
    { src: '~/plugins/cookie-consent.client.ts', mode: 'client' },
    { src: '~/plugins/vue-gtm.client.js', mode: 'client' },
    { src: '~/plugins/toastify.client.ts', mode: 'client' },
    { src: "~/plugins/leaflet.js", mode: 'client' },
    { src: "~/plugins/google-maps.client.js", mode: 'client' },
  ],
  nitro: {
    compressPublicAssets: true,
    storage: {
      // Last good outage schedules; survives restarts.
      svitlo: { driver: 'fs', base: './.data/svitlo' },
    },
    routeRules: {
      '/': { prerender: true },
      '/en': { prerender: true },
      '/svitlo-cherga-vchart': { redirect: { to: '/svitlo-cherga', statusCode: 301 } },
      // Service pages: keep them out of search results and the sitemap.
      '/test-gtm': { robots: false },
      '/en/test-gtm': { robots: false },
      '/starkon/create': { robots: false },
      '/en/starkon/create': { robots: false },
      '/api/**': { cors: true, headers: { 'cache-control': 's-maxage=60' } },
      '/api/svitlo/**': {
        cors: true,
        headers: { 'cache-control': 'public, max-age=60, s-maxage=120, stale-while-revalidate=600' },
      },
    }
  },
  build: {
    transpile: []
  },
  image: {
    provider: 'ipx',
    quality: 80,
    format: ['webp'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536
    }
  },
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'LocalHub Старокостянтинів',
      meta: [
        { name: 'description', content: "LocalHub Старокостянтинів — платформа для підтримки місцевої економіки, об'єднання громади та нових можливостей для бізнесу" },
      ]
    }
  }
});