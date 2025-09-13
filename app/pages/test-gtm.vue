<template>
  <div class="container mx-auto p-8">
    <h1 class="text-3xl font-bold mb-8">GTM Test Page</h1>

    <div class="grid gap-4">
      <div class="p-4 bg-blue-100 rounded">
        <h2 class="font-bold">GTM Status</h2>
        <p>GTM ID: {{ config.googleTagManagerId }}</p>
        <p>GTAG ID: {{ config.gtagId }}</p>
        <p>dataLayer exists: {{ !!dataLayer }}</p>
        <p>gtag exists: {{ !!gtag }}</p>
        <p>Analytics consent: {{ analyticsConsent }}</p>
      </div>

      <div class="p-4 bg-green-100 rounded">
        <h2 class="font-bold mb-2">Test Events</h2>
        <div class="space-x-4">
          <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" @click="sendTestEvent">
            Send Test Event
          </button>
          <button class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600" @click="sendPageView">
            Send Page View
          </button>
          <button class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600" @click="checkGTM">
            Check GTM Status
          </button>
        </div>
      </div>

      <div class="p-4 bg-yellow-100 rounded">
        <h2 class="font-bold mb-2">Cookie Consent</h2>
        <div class="space-x-4">
          <button class="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600" @click="showPreferences">
            Show Cookie Preferences
          </button>
          <button class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600" @click="checkConsent">
            Check Current Consent
          </button>
        </div>
      </div>

      <div class="p-4 bg-gray-100 rounded">
        <h2 class="font-bold mb-2">Debug Info</h2>
        <pre class="text-xs overflow-auto">{{ debugInfo }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useCookieConsent } from '~/composables/useCookieConsent';

const config = useRuntimeConfig().public;
const cookieConsent = useCookieConsent();

const dataLayer = ref(null);
const gtag = ref(null);
const analyticsConsent = ref(false);
const debugInfo = ref({});

onMounted(() => {
  updateStatus();
});

function updateStatus() {
  if (import.meta.client) {
    dataLayer.value = window.dataLayer;
    gtag.value = window.gtag;
    analyticsConsent.value = cookieConsent.hasAnalyticsConsent();

    debugInfo.value = {
      dataLayer: window.dataLayer?.length || 0,
      gtag: !!window.gtag,
      cookieConsent: cookieConsent.getAllCategories(),
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };
  }
}

function sendTestEvent() {
  if (window.gtag) {
    window.gtag('event', 'test_event', {
      event_category: 'test',
      event_label: 'manual_test',
      value: 1,
    });
    console.log('🧪 Test event sent');
  } else {
    console.warn('❌ gtag not available');
  }
}

function sendPageView() {
  if (window.gtag) {
    // Відправляємо до GTM
    window.gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
      send_to: config.googleTagManagerId,
    });

    // Відправляємо до GTAG якщо є
    if (config.gtagId) {
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        send_to: config.gtagId,
      });
    }

    console.log('📄 Page view sent to GTM:', config.googleTagManagerId, 'and GTAG:', config.gtagId);
  } else {
    console.warn('❌ gtag not available');
  }
}

function checkGTM() {
  console.log('=== GTM Status Check ===');
  console.log('GTM ID:', config.googleTagManagerId);
  console.log('dataLayer:', window.dataLayer);
  console.log('gtag:', window.gtag);
  console.log('dataLayer length:', window.dataLayer?.length);
  console.log('Analytics consent:', cookieConsent.hasAnalyticsConsent());
  console.log('All categories:', cookieConsent.getAllCategories());
  updateStatus();
}

function showPreferences() {
  if (window.CC) {
    window.CC.showPreferences();
  } else {
    console.warn('❌ Cookie Consent not available');
  }
}

function checkConsent() {
  const consent = cookieConsent.getCookieConsentData();
  console.log('Current consent:', consent);
  updateStatus();
}
</script>
