<template>
  <div class="cookie-consent-controls">
    <!-- Кнопка для відкриття налаштувань куків -->
    <UButton
      v-if="process.client"
      @click="showCookieSettings"
      variant="outline"
      size="sm"
      icon="i-heroicons-cog-6-tooth"
      :title="$t('cookieSettings')"
      aria-label="Cookie settings"
    />

    <!-- Індикатор статусу згоди -->
    <div class="flex items-center gap-2 text-sm text-gray-600">
      <div class="flex items-center gap-1">
        <Icon
          :name="isAnalyticsAccepted ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
          :class="isAnalyticsAccepted ? 'text-green-500' : 'text-red-500'"
        />
        <span>Analytics: {{ isAnalyticsAccepted ? 'Enabled' : 'Disabled' }}</span>
      </div>

      <div class="flex items-center gap-1">
        <Icon
          :name="isFunctionalityAccepted ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
          :class="isFunctionalityAccepted ? 'text-green-500' : 'text-red-500'"
        />
        <span>Functionality: {{ isFunctionalityAccepted ? 'Enabled' : 'Disabled' }}</span>
      </div>
    </div>

    <!-- Попередження якщо згода не була надана -->
    <UAlert
      v-if="!hasValidConsent"
      color="orange"
      variant="soft"
      title="Cookie Consent Required"
      description="Please configure your cookie preferences to use all features."
      :actions="[
        {
          label: 'Configure',
          click: showCookieSettings,
        },
      ]"
    />
  </div>
</template>

<script setup lang="ts">
const { showSettings, isAnalyticsAccepted, isFunctionalityAccepted, hasValidConsent } = useCookieConsent();

const showCookieSettings = () => {
  showSettings();
};

// Приклад реактивного відстеження змін згоди
watch(isAnalyticsAccepted, (newValue) => {
  console.log('Analytics consent changed:', newValue);
  // Тут можна додати логіку, яка виконується при зміні згоди на аналітику
});

watch(isFunctionalityAccepted, (newValue) => {
  console.log('Functionality consent changed:', newValue);
  // Тут можна додати логіку для функціональних куків (тема, мова тощо)
});
</script>

<style scoped>
.cookie-consent-controls {
  @apply space-y-3 p-4 border rounded-lg bg-gray-50;
}
</style>
