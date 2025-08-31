// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@nuxt/eslint", "@nuxt/image", "@nuxt/ui", "@nuxtjs/i18n"],
  css: ["~/assets/css/main.css"],
  ui: {
    theme: {
      colors: ["primary", "error"],
    },
  },
  i18n: {
    locales: [
      { code: "uk", name: "UA" },
      { code: "en", name: "EN" },
    ],
  },
});
