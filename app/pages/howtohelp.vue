<template>
  <section class="max-w-7xl mx-auto px-4 py-12">
    <h1 class="text-4xl font-bold text-center mb-6 dark:text-white">
      {{ $t('HowToHelp.title') }}
    </h1>

    <!-- Інтро -->
    <p class="text-lg text-center mb-10 text-gray-700 dark:text-gray-300">
      {{ $t('HowToHelp.intro') }}
    </p>

    <!-- Волонтери -->
    <div class="p-6 rounded-2xl shadow mb-6 bg-gray-100 dark:bg-gray-800">
      <h2 class="text-2xl font-semibold mb-2 dark:text-white">
        {{ $t('HowToHelp.volonters') }}
      </h2>
      <p class="text-lg text-gray-700 dark:text-gray-300">
        {{ $t('HowToHelp.volontersDescription') }}
      </p>
      <ul class="list-disc list-inside mt-4 space-y-2 text-lg text-gray-700 dark:text-gray-300">
        <li>
          <strong class="dark:text-white">{{ $t('HowToHelp.designers[0]') }}</strong>
          <span>{{ $t('HowToHelp.designers[1]') }}</span>
        </li>
        <li>
          <strong class="dark:text-white">{{ $t('HowToHelp.QA[0]') }}</strong>
          <span>{{ $t('HowToHelp.QA[1]') }}</span>
        </li>
        <li>
          <strong class="dark:text-white">{{ $t('HowToHelp.lawyers[0]') }}</strong>
          <span>{{ $t('HowToHelp.lawyers[1]') }}</span>
        </li>
        <li>
          <strong class="dark:text-white">{{ $t('HowToHelp.ngos[0]') }}</strong>
          <span>{{ $t('HowToHelp.ngos[1]') }}</span>
        </li>
      </ul>
      <p class="mt-4 text-lg text-gray-700 dark:text-gray-300">
        {{ $t('HowToHelp.ifYouStarterText') }}
        <a
          href="mailto:it@starkon.pp.ua"
          target="_blank"
          class="text-blue-600 font-medium hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          it@starkon.pp.ua
        </a>
        {{ $t('HowToHelp.ifYouStarterAfterLink') }}
      </p>
    </div>

    <!-- Фінансова підтримка -->
    <div class="p-6 rounded-2xl shadow mb-6 bg-gray-100 dark:bg-gray-800">
      <h2 class="text-2xl font-semibold mb-2 dark:text-white">
        {{ $t('HowToHelp.supportTitle') }}
      </h2>
      <p class="text-lg text-gray-700 dark:text-gray-300">
        {{ $t('HowToHelp.supportDescription') }}
      </p>
    </div>

    <!-- Приєднатись -->
    <div class="p-6 rounded-2xl shadow mb-6 bg-gray-100 dark:bg-gray-800">
      <h3 class="text-2xl font-semibold mb-2 dark:text-white">
        {{ $t('HowToHelp.joinTitle') }}
      </h3>
      <p class="text-lg text-gray-700 dark:text-gray-300">
        {{ $t('HowToHelp.joinDescriptionText') }}
        <a
          href="mailto:it@starkon.pp.ua"
          target="_blank"
          class="text-blue-600 font-medium hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          it@starkon.pp.ua
        </a>
        {{ $t('HowToHelp.joinDescriptionAfterLink') }}
      </p>

      <p class="mt-4 text-lg text-gray-700 dark:text-gray-300">
        {{ $t('HowToHelp.aboutCompany[0]') }}
        <a
          href="https://cfhope.in.ua"
          target="_blank"
          class="text-blue-500 underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {{ $t('HowToHelp.aboutCompany[1]') }}
        </a>
      </p>
    </div>
  </section>
</template>
