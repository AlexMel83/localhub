<template>
  <AuthResult
    :state="state"
    :title="t('Auth.activate.title')"
    :loading-text="t('Auth.activate.loading')"
    :success-text="t('Auth.activate.success')"
    :fail-text="t('Auth.activate.fail')"
    :detail="detail"
  />
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth.store';

// Link from the registration e-mail: <CLIENT_URL>/activate/<uuid>.
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const localePath = useLocalePath();
const auth = useAuthStore();

useHead({ title: () => t('Auth.activate.title') });
useRobotsRule('noindex, nofollow');

const state = ref<'loading' | 'success' | 'fail'>('loading');
const detail = ref('');

onMounted(async () => {
  const link = String(route.params.link || '');
  if (await auth.activate(link)) {
    state.value = 'success';
    setTimeout(() => router.replace(localePath('/')), 2500);
  } else {
    state.value = 'fail';
    detail.value = auth.error?.message ?? '';
  }
});
</script>
