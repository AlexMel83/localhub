<template>
  <main class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Google Tag Manager (noscript) -->
    <noscript
      ><iframe
        src="https://www.googletagmanager.com/ns.html?id=GTM-T7KGQV76"
        height="0"
        width="0"
        style="display: none; visibility: hidden"
      ></iframe
    ></noscript>
    <!-- End Google Tag Manager (noscript) -->
    <!-- Google Tag Manager -->
    <script>
      (function (w, d, s, l, i) {
        w[l] = w[l] || [];
        w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
        var f = d.getElementsByTagName(s)[0],
          j = d.createElement(s),
          dl = l != 'dataLayer' ? '&l=' + l : '';
        j.async = true;
        j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
        f.parentNode.insertBefore(j, f);
      })(window, document, 'script', 'dataLayer', 'GTM-T7KGQV76');
    </script>
    <!-- End Google Tag Manager -->

    <!-- Заголовок -->
    <div class="shadow bg-white dark:bg-gray-800">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-center text-gray-900 dark:text-white">
          {{ $t('PrivacyPolicy.title') }}
        </h1>
      </div>
    </div>

    <!-- Контент -->
    <div class="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="overflow-hidden shadow sm:rounded-lg bg-white dark:bg-gray-800">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-2xl font-semibold text-center mb-4 text-gray-800 dark:text-gray-100">
            {{ $t('PrivacyPolicy.subTitle') }}
          </h2>
          <h3 class="text-xl font-medium text-center mb-6 text-gray-700 dark:text-gray-300">
            {{ $t('PrivacyPolicy.fundName') }}
          </h3>

          <p class="mb-4 text-gray-700 dark:text-gray-300">
            {{ $t('PrivacyPolicy.ourSite') }}
            <a
              href="https://localhub.pp.ua"
              target="_blank"
              class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              https://localhub.pp.ua
            </a>
          </p>

          <!-- Розділи -->
          <section v-for="(section, index) in sections" :key="index" class="mt-8">
            <h2 class="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
              {{ $t(section.title) }}
            </h2>
            <p class="text-gray-700 dark:text-gray-300">
              {{ $t(section.description) }}
            </p>
          </section>

          <!-- Контакти -->
          <section class="mt-8">
            <h2 class="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
              {{ $t('PrivacyPolicy.contactsTitle') }}
            </h2>
            <p class="text-gray-700 dark:text-gray-300">
              {{ $t('PrivacyPolicy.contactsDescription') }}
              <a
                href="mailto:it@starkon.pp.ua"
                class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                it@starkon.pp.ua
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
const sections = [
  { title: 'PrivacyPolicy.collectInfoTitle', description: 'PrivacyPolicy.collectInfoDescription' },
  { title: 'PrivacyPolicy.cookieTitle', description: 'PrivacyPolicy.cookieDescription' },
  { title: 'PrivacyPolicy.anotherTitle', description: 'PrivacyPolicy.anotherDescription' },
  { title: 'PrivacyPolicy.dataTitle', description: 'PrivacyPolicy.dataDescription' },
  { title: 'PrivacyPolicy.rightsTitle', description: 'PrivacyPolicy.rightsDescription' },
  { title: 'PrivacyPolicy.changeTitle', description: 'PrivacyPolicy.changeDescription' },
];

useHead({
  title: 'Політика конфіденційності — LocalHub',
});
</script>
