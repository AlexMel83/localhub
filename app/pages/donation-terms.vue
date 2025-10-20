<template>
  <main class="bg-gray-50 dark:bg-gray-900 min-h-screen">
    <div class="shadow bg-white dark:bg-gray-800">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-center text-gray-900 dark:text-white">
          {{ $t('DonationServiceTerms.title') }}
        </h1>
      </div>
    </div>

    <div class="max-w-5xl mx-auto py-8 sm:px-6 lg:px-8">
      <div class="p-6 bg-white dark:bg-gray-800 shadow rounded-2xl">
        <h2 class="text-2xl font-semibold mb-4 dark:text-gray-100">
          {{ $t('DonationServiceTerms.contractTitle') }}
        </h2>

        <p class="mb-4 text-lg">
          {{ $t('DonationServiceTerms.description') }}
        </p>

        <h3 class="text-xl font-semibold mt-6 mb-2 dark:text-gray-100">
          {{ $t('DonationServiceTerms.definitionTitle') }}
        </h3>
        <ul class="list-disc pl-5 mb-4 space-y-2">
          <li v-for="i in 4" :key="i">
            <p class="text-lg">
              <strong>{{ $t(`DonationServiceTerms.definition${i}[0]`) }}</strong>
              {{ $t(`DonationServiceTerms.definition${i}[1]`) }}
            </p>
          </li>
        </ul>

        <h3 class="text-xl font-semibold mt-6 mb-2 dark:text-gray-100">
          {{ $t('DonationServiceTerms.subjectTitle') }}
        </h3>
        <p class="mb-4 text-lg">
          {{ $t('DonationServiceTerms.subjectDescription1') }}
        </p>
        <p class="mb-4 text-lg">
          {{ $t('DonationServiceTerms.subjectDescription2') }}
        </p>
        <p class="mb-4 text-lg">
          {{ $t('DonationServiceTerms.subjectDescription3') }}
        </p>

        <h3 class="text-xl font-semibold mt-6 mb-2 dark:text-gray-100">
          {{ $t('DonationServiceTerms.contactsTitle') }}
        </h3>
        <p class="mb-2 text-lg">
          {{ $t('DonationServiceTerms.fondName') }}<br >
          {{ $t('DonationServiceTerms.edrpou') }}<br >
          {{ $t('DonationServiceTerms.address') }}<br >
          <a
            href="https://cfhope.in.ua"
            target="_blank"
            class="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-800 hover:dark:text-blue-300"
            >https://cfhope.in.ua</a
          ><br >
          <a
            href="mailto:boss@cfhope.in.ua"
            class="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-800 hover:dark:text-blue-300"
            >boss@cfhope.in.ua</a
          >
        </p>
        <p class="mb-4 text-lg">
          {{ $t('DonationServiceTerms.bankName') }}<br >
          {{ $t('DonationServiceTerms.bankAccount') }}
        </p>
        <p class="font-semibold text-lg dark:text-gray-100">
          {{ $t('DonationServiceTerms.director') }}
        </p>
      </div>
    </div>
  </main>
</template>
