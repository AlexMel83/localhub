<template>
  <main class="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
    <h1 class="text-2xl font-semibold">{{ title }}</h1>
    <div v-if="state === 'loading'" class="flex items-center gap-3 text-muted" role="status">
      <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin" aria-hidden="true" />
      {{ loadingText }}
    </div>
    <template v-else-if="state === 'success'">
      <UIcon name="i-lucide-circle-check" class="size-12 text-success" aria-hidden="true" />
      <p role="status">{{ successText }}</p>
      <UButton :to="localePath('/')" icon="i-lucide-house">{{ t('Auth.activate.home') }}</UButton>
    </template>
    <template v-else>
      <UIcon name="i-lucide-circle-x" class="size-12 text-error" aria-hidden="true" />
      <p class="font-medium" role="alert">{{ failText }}</p>
      <p v-if="detail" class="text-sm text-muted">{{ detail }}</p>
      <div class="flex flex-wrap justify-center gap-2">
        <UButton icon="i-lucide-log-in" @click="modalStore.openLoginModal('login')">{{ t('Auth.toLogin') }}</UButton>
        <UButton :to="localePath('/')" color="neutral" variant="soft" icon="i-lucide-house">
          {{ t('Auth.activate.home') }}
        </UButton>
      </div>
    </template>
  </main>
</template>

<script setup lang="ts">
import { useModalStore } from '~/stores/modal.store';

// Shared screen for e-mail activation and the social sign-in return.
defineProps<{
  state: 'loading' | 'success' | 'fail';
  title: string;
  loadingText: string;
  successText: string;
  failText: string;
  detail?: string;
}>();

const { t } = useI18n();
const localePath = useLocalePath();
const modalStore = useModalStore();
</script>
