<template>
  <UModal
    v-model="isModalOpen"
    :ui="{ width: 'max-w-md' }"
    title="Вхід / Реєстрація"
    description="Увійдіть або зареєструйтесь для продовження"
    :close="{
      color: 'primary',
      variant: 'outline',
      class: 'rounded-full',
    }"
  >
    <template #default="{ open }">
      <button ref="modalTrigger" class="hidden" @click="open" />
    </template>

    <template #content>
      <div class="flex flex-col items-center justify-center gap-4 p-4">
        <UPageCard class="w-full max-w-md">
          <UAuthForm
            :schema="schema"
            :fields="fields"
            :providers="providers"
            title="Welcome back!"
            icon="i-lucide-lock"
            @submit="onSubmit"
          >
            <template #description>
              Don't have an account? <ULink to="#" class="text-primary font-medium">Sign up</ULink>.
            </template>
            <template #password-hint>
              <ULink to="#" class="text-primary font-medium" tabindex="-1">Forgot password?</ULink>
            </template>
            <template #validation>
              <UAlert color="error" icon="i-lucide-info" title="Error signing in" />
            </template>
            <template #footer>
              By signing in, you agree to our <ULink to="#" class="text-primary font-medium">Terms of Service</ULink>.
            </template>
          </UAuthForm>
        </UPageCard>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { useModalStore } from '../../stores/modal.store';
import * as z from 'zod';
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui';

const modalStore = useModalStore();
const modalTrigger = ref<HTMLElement | null>(null);
const isModalOpen = ref(false);

defineExpose({ openModal: () => modalStore.openLoginModal() });

watch(
  () => modalStore.isLoginModalOpen,
  (newValue) => {
    if (newValue && !isModalOpen.value) {
      // Відкриваємо модалку
      nextTick(() => {
        modalTrigger.value?.click();
      });
    } else if (!newValue && isModalOpen.value) {
      // Закриваємо модалку
      isModalOpen.value = false;
    }
  },
);

const toast = useToast();

const fields: AuthFormField[] = [
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'Enter your email',
    required: true,
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
    required: true,
  },
  {
    name: 'remember',
    label: 'Remember me',
    type: 'checkbox',
  },
];

const providers = [
  {
    label: 'Google',
    icon: 'i-simple-icons-google',
    onClick: () => {
      toast.add({ title: 'Google', description: 'Login with Google' });
    },
  },
  {
    label: 'GitHub',
    icon: 'i-simple-icons-github',
    onClick: () => {
      toast.add({ title: 'GitHub', description: 'Login with GitHub' });
    },
  },
];

const schema = z.object({
  email: z.email('Invalid email'),
  password: z.string('Password is required').min(8, 'Must be at least 8 characters'),
});

type Schema = z.output<typeof schema>;

function onSubmit(payload: FormSubmitEvent<Schema>) {
  console.log('Submitted', payload);
}
</script>
