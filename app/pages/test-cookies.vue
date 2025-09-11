<template>
  <div class="max-w-2xl mx-auto p-8">
    <h1 class="text-3xl font-bold mb-8">Cookie Consent Test</h1>

    <div class="space-y-6">
      <!-- Статус згоди -->
      <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h2 class="text-xl font-semibold mb-4">Consent Status</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex items-center space-x-2">
            <div :class="hasValidConsent ? 'bg-green-500' : 'bg-red-500'" class="w-3 h-3 rounded-full" />
            <span>Valid Consent: {{ hasValidConsent ? 'Yes' : 'No' }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <div :class="isAnalyticsAccepted ? 'bg-green-500' : 'bg-red-500'" class="w-3 h-3 rounded-full" />
            <span>Analytics: {{ isAnalyticsAccepted ? 'Enabled' : 'Disabled' }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <div :class="isFunctionalityAccepted ? 'bg-green-500' : 'bg-red-500'" class="w-3 h-3 rounded-full" />
            <span>Functionality: {{ isFunctionalityAccepted ? 'Enabled' : 'Disabled' }}</span>
          </div>
        </div>
      </div>

      <!-- Дії -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Actions</h2>
        <div class="flex flex-wrap gap-3">
          <UButton variant="outline" @click="showCookieConsent"> Show Consent Modal </UButton>
          <UButton variant="outline" @click="showCookieSettings"> Show Settings </UButton>
          <UButton variant="outline" color="red" @click="resetConsent"> Reset Consent </UButton>
          <UButton variant="outline" @click="logCookieData"> Log Cookie Data </UButton>
        </div>
      </div>

      <!-- Cookie information -->
      <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h3 class="font-semibold mb-2">Cookie Information:</h3>
        <pre class="text-sm overflow-x-auto">{{ JSON.stringify(cookieData, null, 2) }}</pre>
      </div>

      <!-- Test buttons -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Test Functions</h2>
        <div class="flex flex-wrap gap-3">
          <UButton :disabled="!isAnalyticsAccepted" @click="testAnalytics"> Test Analytics </UButton>
          <UButton :disabled="!isFunctionalityAccepted" @click="testFunctionality"> Test Functionality </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { show, showSettings, getCookie, isAnalyticsAccepted, isFunctionalityAccepted, hasValidConsent } =
  useCookieConsent();

const cookieData = ref({});

const showCookieConsent = () => {
  show();
};

const showCookieSettings = () => {
  showSettings();
};

const resetConsent = () => {
  // Видаляємо cookie згоди
  if (import.meta.client) {
    document.cookie = 'cc_cookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    location.reload();
  }
};

const logCookieData = () => {
  const data = getCookie();
  cookieData.value = data;
  console.log('Cookie consent data:', data);
};

const testAnalytics = () => {
  if (isAnalyticsAccepted.value) {
    console.log('Analytics is enabled - tracking event');
    // Тестуємо gtag
    if (window.gtag) {
      gtag('event', 'test_event', {
        event_category: 'test',
        event_label: 'cookie_consent_test',
      });
    }
  }
};

const testFunctionality = () => {
  if (isFunctionalityAccepted.value) {
    console.log('Functionality is enabled - saving preferences');
    localStorage.setItem('test_preference', 'test_value');
  }
};

// Автоматично завантажуємо дані при монтуванні
onMounted(() => {
  logCookieData();
});

// Мета теги
useHead({
  title: 'Cookie Consent Test',
});
</script>
