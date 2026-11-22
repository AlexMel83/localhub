<template>
  <AuthResult
    :state="state"
    :title="t('Auth.callback.title')"
    :loading-text="t('Auth.callback.loading')"
    :success-text="t('Auth.callback.success')"
    :fail-text="t('Auth.callback.fail')"
    :detail="detail"
  />
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth.store';

// Return from Google / Facebook: the API redirects to /callback/<link>,
// or to .../callback/<link>?error=... when the provider step failed.
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const localePath = useLocalePath();
const auth = useAuthStore();

useHead({ title: () => t('Auth.callback.title') });
useRobotsRule('noindex, nofollow');

const state = ref<'loading' | 'success' | 'fail'>('loading');
const detail = ref('');

onMounted(async () => {
  // Tokens arrive in the query string: drop them from the address bar and history at once.
  const providerError = typeof route.query.error === 'string' ? route.query.error : '';
  window.history.replaceState(window.history.state, '', window.location.pathname);

  if (providerError) {
    state.value = 'fail';
    detail.value = providerError;
    return;
  }
  if (await auth.finishSocial(String(route.params.link || ''))) {
    state.value = 'success';
    setTimeout(() => router.replace(localePath('/')), 1500);
  } else {
    state.value = 'fail';
    detail.value = auth.error?.message ?? '';
  }
});
</script>
