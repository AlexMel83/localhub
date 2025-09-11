import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  typescript: {
    strict: true,
    typeCheck: true,
    shim: false
  },
  compatibilityDate: "2025-07-15",
  modules: [
    "@nuxt/eslint",
    "@pinia/nuxt", 
    "@nuxt/image",
    "@nuxt/ui",
    "@nuxt/icon",
    "@nuxtjs/i18n",
    "@nuxtjs/leaflet",
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    'nuxt-gtag',
  ],
  // @ts-expect-error need types
  gtag: {
    id: process.env.NUXT_PUBLIC_GTAG_ID || 'G-C4177GTQXR',
    loadingStrategy: 'defer',
    // Вимикаємо автозавантаження - будемо керувати через cookie consent
    enabled: false,
    config: {
      page_title: 'LocalHub',
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      disable_google_one_tap: true
    }
  },
  robots: {
    allow: '/',
    disallow: ['/admin',],
    sitemap: `${process.env.NUXT_PUBLIC_SITE_URL || 'https://localhub.store'}/sitemap_index.xml`,
  },
  sitemap: {
    siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://localhub.store',
    autoI18n: false,
    sources: ['/api/urls'],
    gzip: true,
    debug: process.env.NODE_ENV === 'development',
    defaults: {
      changefreq: 'daily',
      priority: 0.8
    },
    cacheMaxAgeSeconds: process.env.NODE_ENV === 'production' ? 3600 : 0
  },
  css: ["~/assets/css/main.css"],
  leaflet: {
    markerCluster: true,
  },
  ui: {
    theme: {
      colors: ["primary", "error"],
    },
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
    detectBrowserLanguage: {
      useCookie: false,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    },
    defaultLocale: "uk",
    langDir: "locales",
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://localhub.store'
  },
  runtimeConfig: {
    // Приватні ключі (доступні тільки на сервері)
    apiSecret: process.env.API_SECRET,
    // Публічні ключі
    public: {
      apiKeyMapbox: process.env.APIKEY_MAPBOX,
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      bingMapsApiKey: process.env.BING_MAPS_APIKEY,
      gtagId: process.env.NUXT_PUBLIC_GTAG_ID || "G-C4177GTQXR",
      apiBase: process.env.API_BASE_URL || "http://localhost:4040",
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://localhub.store'
    },
  },
  plugins: [
    "~/plugins/axios.ts", 
    {src: '~/plugins/toastify.client.ts', mode: 'client'},
    { src: "~/plugins/leaflet.js", mode: 'client' },
    { src: "~/plugins/google-maps.js", mode: 'client' },
    { src: "~/plugins/cookie-consent.client.ts", mode: 'client' },
    { src: "~/plugins/auto-show-consent.client.ts", mode: 'client' },
  ],
  nitro: {
    compressPublicAssets: true,
    routeRules: {
      '/': { prerender: true },
      '/en': { prerender: true },
      '/api/**': { cors: true, headers: { 'cache-control': 's-maxage=60' } },
    }
  },
  experimental: {
    payloadExtraction: false,
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