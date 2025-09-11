<template>
  <div class="cookie-debug" v-if="showDebug">
    <h3>🍪 Cookie Consent Debug</h3>

    <div class="debug-section">
      <h4>Raw Data:</h4>
      <pre>{{ JSON.stringify(consentData, null, 2) }}</pre>
    </div>

    <div class="debug-section">
      <h4>Categories:</h4>
      <ul>
        <li :class="{ active: hasAnalyticsConsent() }">Analytics: {{ hasAnalyticsConsent() ? '✅' : '❌' }}</li>
        <li :class="{ active: hasI18nConsent() }">i18n: {{ hasI18nConsent() ? '✅' : '❌' }}</li>
        <li :class="{ active: hasThemeConsent() }">Theme: {{ hasThemeConsent() ? '✅' : '❌' }}</li>
        <li class="active">Necessary: ✅ (завжди активна)</li>
      </ul>
    </div>

    <div class="debug-section">
      <h4>All Categories:</h4>
      <code>{{ getAllCategories() }}</code>
    </div>

    <div class="debug-actions">
      <button @click="openPreferences" class="debug-btn">Відкрити налаштування</button>
      <button @click="refreshData" class="debug-btn">Оновити дані</button>
      <button @click="showDebug = false" class="debug-btn danger">Закрити debug</button>
    </div>
  </div>

  <!-- Кнопка для показу debug панелі -->
  <button v-if="!showDebug" @click="showDebug = true" class="debug-toggle" title="Показати cookie debug">
    🍪 Debug
  </button>
</template>

<script setup lang="ts">
import { useCookieConsent } from '../composables/useCookieConsent';
import { ref, onMounted, watch } from 'vue';

const showDebug = ref(false);

const { getCookieConsentData, hasAnalyticsConsent, hasI18nConsent, hasThemeConsent, getAllCategories } =
  useCookieConsent();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const consentData: any = ref(null);

const refreshData = () => {
  consentData.value = getCookieConsentData();
};

const openPreferences = () => {
  // Декілька способів відкрити налаштування
  const methods = [
    // Метод 1: Через глобальний об'єкт
    () => {
      if ((window as any).CC?.openPreferences) {
        (window as any).CC.openPreferences();
        return true;
      }
      return false;
    },

    // Метод 2: Через CookieConsent
    () => {
      if ((window as any).CookieConsent?.openPreferences) {
        (window as any).CookieConsent.openPreferences();
        return true;
      }
      return false;
    },

    // Метод 3: Через подію
    () => {
      try {
        const event = new CustomEvent('cc:show-preferencesModal');
        window.dispatchEvent(event);
        return true;
      } catch (e) {
        return false;
      }
    },

    // Метод 4: Через пошук кнопки
    () => {
      const button = document.querySelector('[data-cc="show-preferencesModal"]') as HTMLElement;
      if (button) {
        button.click();
        return true;
      }
      return false;
    },
  ];

  let success = false;
  for (const method of methods) {
    if (method()) {
      success = true;
      break;
    }
  }

  if (!success) {
    console.warn('Could not open cookie preferences modal');
    alert('Неможливо відкрити налаштування cookies. Спробуйте перезавантажити сторінку.');
  }
};

const clearAllCookies = () => {
  // Очищуємо cookie consent
  document.cookie = 'cc_cookie=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';

  // Очищуємо theme
  localStorage.removeItem('theme');
  document.documentElement.removeAttribute('data-theme');

  // Очищуємо i18n
  document.cookie = 'i18n_redirected=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';

  // Очищуємо analytics cookies
  const analyticsCookies = ['_ga', '_ga_', '_gid', '_gat'];
  analyticsCookies.forEach((cookieName) => {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });

  refreshData();

  setTimeout(() => {
    window.location.reload();
  }, 1000);
};

// Оновлюємо дані при монтуванні
onMounted(() => {
  refreshData();
});

// Слухаємо зміни в cookies
watch(
  () => process.client && document.cookie,
  () => {
    if (process.client) {
      refreshData();
    }
  },
  { immediate: true },
);
</script>

<style scoped>
.cookie-debug {
  position: fixed;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 400px;
  max-height: 80vh;
  overflow: auto;
  z-index: 10000;
  font-family: monospace;
  font-size: 12px;
}

.debug-toggle {
  position: fixed;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  z-index: 9999;
  font-size: 12px;
}

.debug-section {
  margin: 15px 0;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.debug-section h4 {
  margin: 0 0 10px 0;
  color: #ffeb3b;
}

.debug-section pre {
  background: rgba(0, 0, 0, 0.5);
  padding: 10px;
  border-radius: 4px;
  overflow: auto;
  max-height: 200px;
}

.debug-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.debug-section li {
  padding: 4px 0;
  color: #f44336;
}

.debug-section li.active {
  color: #4caf50;
}

.debug-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 15px;
}

.debug-btn {
  background: #2196f3;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
}

.debug-btn:hover {
  background: #1976d2;
}

.debug-btn.danger {
  background: #f44336;
}

.debug-btn.danger:hover {
  background: #d32f2f;
}

code {
  background: rgba(0, 0, 0, 0.5);
  padding: 4px 8px;
  border-radius: 2px;
  color: #4caf50;
}
</style>
