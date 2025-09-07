<template>
  <div class="prose dark:prose-invert max-w-3xl mx-auto py-8 px-4">
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

    <MetaTags
      :title="'Джерела інформації про бізнес у LocalHub'"
      :description="'LocalHub збирає дані про місцевий бізнес із відкритих джерел, матеріалів користувачів та власників компаній. Якщо певна інформація некоректна — ви можете надіслати запит на її зміну або видалення.'"
      :image="'/panoimg/Localhub-logo-320.jpg'"
      :url="'https://localhub.store/info-source'"
      :keywords="'LocalHub, джерела інформації, місцевий бізнес, відкриті дані, Старокостянтинів, підприємці'"
      :structured-data="{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Джерела інформації про бізнес у LocalHub',
        description:
          'LocalHub отримує інформацію про місцеві компанії з відкритих джерел, матеріалів користувачів та власників бізнесу.',
        url: 'https://localhub.store/info-source',
        publisher: {
          '@type': 'Organization',
          name: 'LocalHub',
          url: 'https://localhub.store',
          logo: {
            '@type': 'ImageObject',
            url: 'https://localhub.store/Localhub-logo-320.jpg',
          },
        },
      }"
    />
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
    <h1 class="text-2xl text-center font-bold mb-6">{{ $t('InfoSource.title') }}</h1>

    <p>
      {{ $t('InfoSource.paragraph1') }}
    </p>

    <h2 class="text-xl font-semibold mt-6 mb-3">{{ $t('InfoSource.subTitle1') }}</h2>
    <p>
      {{ $t('InfoSource.paragraph2') }}
    </p>

    <h2 class="text-xl font-semibold mt-6 mb-3">{{ $t('InfoSource.subTitle2') }}</h2>
    <p>
      {{ $t('InfoSource.paragraph3') }}
    </p>

    <ul class="list-disc pl-10 mt-4">
      <li>{{ $t('InfoSource.listItem1') }}</li>
      <li>{{ $t('InfoSource.listItem2') }}</li>
      <li>{{ $t('InfoSource.listItem3') }}</li>
    </ul>

    <h2 class="text-xl font-semibold mt-6 mb-3">{{ $t('InfoSource.subTitle3') }}</h2>
    <p>
      {{ $t('InfoSource.paragraph4') }}
    </p>

    <p class="mt-6">
      {{ $t('InfoSource.paragraph5') }}
      <NuxtLink to="/privacy-policy" class="text-blue-600 hover:underline"> {{ $t('Footer.policy') }} </NuxtLink>.
    </p>
  </div>
</template>
