// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/leaflet",
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    "@nuxt/eslint",
     "@pinia/nuxt",
    "@nuxt/image",
    "@nuxt/ui",
    "@nuxtjs/i18n",
    'nuxt-gtag',
  ],
  gtag: {
    id: 'G-C4177GTQXR',
    loadingStrategy: 'defer',
  },
  robots: {
    allow: '/',
    sitemap: `${process.env.SITE_URL || 'https:/localhub.store'}/sitemap_index.xml`,
  },
  sitemap: {
    // @ts-expect-error -- types are not up to date
    siteUrl: process.env.SITE_URL || 'https://localhub.store',
    autoI18n: false,
    sources: ['/api/urls'],
    gzip: true,
    debug: false,
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
      { code: "uk", name: "UA", file: "uk.json" },
      { code: "en", name: "EN", file: "en.json" },
    ],
    vueI18n: 'i18n.config.ts',
    strategy: "prefix_except_default",
    detectBrowserLanguage: false,
    defaultLocale: "uk",
    langDir: "locales",
  },
  runtimeConfig: {
    public: {
      apiKeyMapbox: process.env.APIKEY_MAPBOX,
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      gtagId: process.env.NUXT_PUBLIC_GTAG_ID || "G-C4177GTQXR",
      apiBase: process.env.API_BASE_URL || "http://localhost:4040",
      isDocker: process.env.NUXT_PUBLIC_IS_DOCKER || "false",
      API_URL: process.env.API_URL,
      API_KEY: process.env.API_KEY,
    },
  },
  plugins: ["~/plugins/axios.js", "~/plugins/google-maps.js"],
});
