<template>
  <section class="min-h-screen py-12">
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
    <div class="container mx-auto px-4 max-w-4xl">
      <!-- Заголовок -->
      <header class="text-center mb-12">
        <h1 class="text-3xl md:text-4xl font-bold">{{ $t('HowToAddInfo.title') }}</h1>
        <p class="mt-4 text-lg">
          {{ $t('HowToAddInfo.paragraph5[0]') }} <b>{{ $t('HowToAddInfo.paragraph5[1]') }}</b
          >, <b>{{ $t('HowToAddInfo.paragraph5[2]') }}</b> {{ $t('HowToAddInfo.paragraph5[3]') }}
          <b>{{ $t('HowToAddInfo.paragraph5[4]') }}</b
          >.
        </p>
      </header>

      <!-- Що таке LocalHub -->
      <div class="rounded-2xl shadow-md p-6 mb-8">
        <h2 class="text-2xl font-semibold mb-4">{{ $t('HowToAddInfo.subTitle1') }}</h2>
        <p class="leading-relaxed"><strong>LocalHub.store</strong>{{ $t('HowToAddInfo.paragraph6') }}</p>
        <p class="leading-relaxed mt-3">
          {{ $t('HowToAddInfo.paragraph1') }}
        </p>
      </div>

      <!-- Переваги для бізнесу -->
      <div class="grid md:grid-cols-2 gap-6 mb-8">
        <div class="rounded-2xl shadow-md p-6">
          <h2 class="text-xl font-semibold mb-3">{{ $t('HowToAddInfo.subTitle2') }}</h2>
          <p class="leading-relaxed">
            {{ $t('HowToAddInfo.paragraph2') }}
          </p>
        </div>

        <div class="rounded-2xl shadow-md p-6">
          <h2 class="text-xl font-semibold mb-3">{{ $t('HowToAddInfo.subTitle3') }}</h2>
          <p class="leading-relaxed">
            {{ $t('HowToAddInfo.paragraph3') }}
          </p>
        </div>
      </div>

      <!-- Ціна -->
      <div class="rounded-2xl shadow-md p-6 mb-8">
        <h2 class="text-2xl font-semibold mb-4">{{ $t('HowToAddInfo.subTitle4') }}</h2>
        <p class="leading-relaxed">
          {{ $t('HowToAddInfo.paragraph7[0]') }} <b>{{ $t('HowToAddInfo.paragraph7[1]') }}</b
          >. {{ $t('HowToAddInfo.paragraph7[2]') }}
        </p>
        <p class="leading-relaxed mt-3">
          {{ $t('HowToAddInfo.paragraph4') }}
        </p>
      </div>

      <!-- Ефективність -->
      <div class="rounded-2xl shadow-md p-6 mb-8">
        <h2 class="text-2xl font-semibold mb-4">{{ $t('HowToAddInfo.subTitle5') }}</h2>
        <p class="leading-relaxed">
          {{ $t('HowToAddInfo.paragraph8[0]') }} <b>{{ $t('HowToAddInfo.paragraph8[1]') }}</b
          >{{ $t('HowToAddInfo.paragraph8[2]') }}
        </p>
      </div>

      <!-- Call To Action -->
      <div class="text-center mt-10">
        <NuxtLink
          to="/register"
          class="inline-block px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300"
        >
          {{ $t('HowToAddInfo.callToAction') }}
        </NuxtLink>
      </div>

      <!-- Контакти -->
      <footer class="text-center mt-16">
        <p>
          {{ $t('HowToAddInfo.contactUs[0]') }} <br />
          {{ $t('HowToAddInfo.contactUs[1]') }}
        </p>
      </footer>
    </div>
  </section>
</template>
