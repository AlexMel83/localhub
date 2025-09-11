<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">{{ $t('privacyPolicy') }}</h1>

    <div class="prose prose-gray max-w-none dark:prose-invert">
      <section class="mb-8">
        <h2 class="text-2xl font-semibold mb-4">{{ $t('cookieUsage') }}</h2>
        <p class="mb-4">{{ $t('cookieUsageDescription') }}</p>

        <div class="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-6">
          <h3 class="text-lg font-semibold mb-3">{{ $t('cookieCategories') }}</h3>

          <div class="space-y-4">
            <div>
              <h4 class="font-semibold text-green-600 dark:text-green-400">
                {{ $t('necessaryCookies') }}
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                {{ $t('necessaryCookiesDesc') }}
              </p>
            </div>

            <div>
              <h4 class="font-semibold text-blue-600 dark:text-blue-400">
                {{ $t('functionalCookies') }}
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                {{ $t('functionalCookiesDesc') }}
              </p>
              <ul class="text-sm text-gray-600 dark:text-gray-300 mt-2 list-disc list-inside">
                <li>i18n_redirected - {{ $t('languageCookie') }}</li>
                <li>theme - {{ $t('themeCookie') }}</li>
              </ul>
            </div>

            <div>
              <h4 class="font-semibold text-purple-600 dark:text-purple-400">
                {{ $t('analyticsCookies') }}
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                {{ $t('analyticsCookiesDesc') }}
              </p>
              <ul class="text-sm text-gray-600 dark:text-gray-300 mt-2 list-disc list-inside">
                <li>_ga - {{ $t('googleAnalyticsCookie') }}</li>
                <li>_ga_* - {{ $t('googleAnalyticsAdditional') }}</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="flex justify-center">
          <UButton variant="outline" size="lg" icon="i-heroicons-cog-6-tooth" @click="showCookieSettings">
            {{ $t('manageCookieSettings') }}
          </UButton>
        </div>
      </section>

      <section class="mb-8">
        <h2 class="text-2xl font-semibold mb-4">{{ $t('dataCollection') }}</h2>
        <p>{{ $t('dataCollectionDescription') }}</p>
      </section>

      <section class="mb-8">
        <h2 class="text-2xl font-semibold mb-4">{{ $t('contactInformation') }}</h2>
        <p>{{ $t('contactDescription') }}</p>
        <div class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p class="font-semibold">LocalHub Старокостянтинів</p>
          <p>Email: info@localhub.store</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
const { $t } = useNuxtApp();
const { showSettings } = useCookieConsent();

// Мета-теги для SEO
useHead({
  title: 'Політика конфіденційності - LocalHub',
  meta: [
    {
      name: 'description',
      content: 'Політика конфіденційності та використання файлів cookie на платформі LocalHub Старокостянтинів',
    },
  ],
});

const showCookieSettings = () => {
  showSettings();
};
</script>
