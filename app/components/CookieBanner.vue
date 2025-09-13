<template>
  <div class="cookie-banner-wrapper">
    <!-- Кнопка для відкриття налаштувань -->
    <button
      v-if="!isConsentRequired()"
      class="cookie-settings-btn"
      :title="$t('cookieSettings')"
      @click="showPreferences"
    >
      <Icon name="lucide:cookie" size="20" />
    </button>

    <!-- Індикатор статусу cookies -->
    <div v-if="!isConsentRequired()" class="cookie-status">
      <div class="cookie-status-item">
        <Icon
          :name="hasAnalyticsConsent() ? 'lucide:check-circle' : 'lucide:x-circle'"
          :class="hasAnalyticsConsent() ? 'text-green-500' : 'text-red-500'"
          size="16"
        />
        <span class="text-sm">{{ $t('analytics') }}</span>
      </div>

      <div class="cookie-status-item">
        <Icon
          :name="hasI18nConsent() ? 'lucide:check-circle' : 'lucide:x-circle'"
          :class="hasI18nConsent() ? 'text-green-500' : 'text-red-500'"
          size="16"
        />
        <span class="text-sm">{{ $t('language') }}</span>
      </div>

      <div class="cookie-status-item">
        <Icon
          :name="hasThemeConsent() ? 'lucide:check-circle' : 'lucide:x-circle'"
          :class="hasThemeConsent() ? 'text-green-500' : 'text-red-500'"
          size="16"
        />
        <span class="text-sm">{{ $t('theme') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNuxtApp } from 'nuxt/app';
import { useCookieConsent } from '../composables/useCookieConsent';

const { hasAnalyticsConsent, hasI18nConsent, hasThemeConsent, showPreferences, isConsentRequired } = useCookieConsent();

const { $t } = useNuxtApp();
</script>

<style scoped>
.cookie-banner-wrapper {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cookie-settings-btn {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.cookie-settings-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.05);
}

.cookie-status {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 140px;
}

.cookie-status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .cookie-banner-wrapper {
    bottom: 10px;
    right: 10px;
  }

  .cookie-settings-btn {
    width: 40px;
    height: 40px;
  }

  .cookie-status {
    padding: 8px;
    min-width: 120px;
  }
}
</style>
