<template>
  <UModal
    v-model:open="open"
    :title="
      registeredEmail ? t('Auth.registered.title') : mode === 'login' ? t('Auth.loginTitle') : t('Auth.registerTitle')
    "
    :description="
      registeredEmail ? undefined : mode === 'login' ? t('Auth.loginDescription') : t('Auth.registerDescription')
    "
    :ui="{ content: 'sm:max-w-md', body: 'p-4 sm:p-6' }"
  >
    <template #body>
      <!-- After sign-up: the account waits for the e-mail confirmation. -->
      <div v-if="registeredEmail" class="flex flex-col items-center gap-4 py-2 text-center" role="status">
        <UIcon name="i-lucide-mail-check" class="size-12 text-primary" aria-hidden="true" />
        <p class="text-muted">{{ t('Auth.registered.text', { email: registeredEmail }) }}</p>
        <UButton color="neutral" variant="soft" icon="i-lucide-arrow-left" @click="backToLogin">
          {{ t('Auth.registered.back') }}
        </UButton>
      </div>

      <div v-else class="flex flex-col gap-5">
        <UTabs v-model="mode" :items="tabs" :content="false" class="w-full" />

        <UAuthForm
          :key="mode"
          :fields="fields"
          :schema="schema"
          :providers="providers"
          :separator="t('Auth.or')"
          :submit="{
            label: mode === 'login' ? t('Auth.submitLogin') : t('Auth.submitRegister'),
            block: true,
            size: 'lg',
          }"
          :loading="auth.loading"
          :disabled="auth.loading"
          @submit="onSubmit"
        >
          <template #validation>
            <UAlert
              v-if="errorText"
              color="error"
              variant="subtle"
              icon="i-lucide-circle-alert"
              :title="errorText"
              aria-live="assertive"
            />
          </template>

          <template #footer>
            <div class="flex flex-col items-center gap-2 text-center text-sm text-muted">
              <p>
                {{ mode === 'login' ? t('Auth.noAccount') : t('Auth.haveAccount') }}
                <UButton variant="link" class="p-0 align-baseline font-medium" @click="toggleMode">
                  {{ mode === 'login' ? t('Auth.toRegister') : t('Auth.toLogin') }}
                </UButton>
              </p>
              <i18n-t keypath="Auth.terms" tag="p" scope="global">
                <template #link>
                  <ULink :to="localePath('/privacy-policy')" class="text-primary underline" @click="open = false">
                    {{ t('Auth.termsLink') }}
                  </ULink>
                </template>
              </i18n-t>
            </div>
          </template>
        </UAuthForm>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import * as z from 'zod';
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui';
import { useAuthStore } from '~/stores/auth.store';
import { useModalStore } from '~/stores/modal.store';

const emit = defineEmits<{ (e: 'modal-closed'): void }>();

const { t } = useI18n();
const localePath = useLocalePath();
const toast = useToast();
const auth = useAuthStore();
const modalStore = useModalStore();

// The backend accepts passwords of 4–32 characters; new ones need at least 8.
const PASSWORD_MAX = 32;
const NEW_PASSWORD_MIN = 8;

const open = computed({
  get: () => modalStore.isLoginModalOpen,
  set: (value: boolean) => {
    if (value) modalStore.openLoginModal(mode.value);
    else {
      modalStore.closeLoginModal();
      emit('modal-closed');
    }
  },
});

const mode = ref<'login' | 'register'>(modalStore.loginModalMode);
const registeredEmail = ref('');

// Every opening starts clean, on the requested tab.
watch(
  () => modalStore.isLoginModalOpen,
  (isOpen) => {
    if (!isOpen) return;
    mode.value = modalStore.loginModalMode;
    registeredEmail.value = '';
    auth.error = null;
  },
);
watch(mode, () => {
  auth.error = null;
});

const tabs = computed(() => [
  { label: t('Auth.tabs.login'), value: 'login', icon: 'i-lucide-log-in' },
  { label: t('Auth.tabs.register'), value: 'register', icon: 'i-lucide-user-plus' },
]);

const fields = computed<AuthFormField[]>(() => {
  const email: AuthFormField = {
    name: 'email',
    type: 'email',
    label: t('Auth.email'),
    placeholder: t('Auth.emailPlaceholder'),
    autocomplete: 'email',
    required: true,
  };
  if (mode.value === 'login') {
    return [
      email,
      {
        name: 'password',
        type: 'password',
        label: t('Auth.password'),
        placeholder: t('Auth.passwordPlaceholder'),
        autocomplete: 'current-password',
        required: true,
      },
      { name: 'remember', type: 'checkbox', label: t('Auth.remember') },
    ];
  }
  return [
    email,
    {
      name: 'password',
      type: 'password',
      label: t('Auth.password'),
      placeholder: t('Auth.newPasswordPlaceholder'),
      autocomplete: 'new-password',
      required: true,
    },
    {
      name: 'passwordRepeat',
      type: 'password',
      label: t('Auth.passwordRepeat'),
      autocomplete: 'new-password',
      required: true,
    },
  ];
});

const loginSchema = computed(() =>
  z.object({
    email: z.email(t('Auth.validation.email')),
    password: z
      .string(t('Auth.validation.passwordRequired'))
      .min(1, t('Auth.validation.passwordRequired'))
      .max(PASSWORD_MAX, t('Auth.validation.passwordMax', { n: PASSWORD_MAX })),
    remember: z.boolean().optional(),
  }),
);

const registerSchema = computed(() =>
  z
    .object({
      email: z.email(t('Auth.validation.email')),
      password: z
        .string(t('Auth.validation.passwordRequired'))
        .min(NEW_PASSWORD_MIN, t('Auth.validation.passwordMin', { n: NEW_PASSWORD_MIN }))
        .max(PASSWORD_MAX, t('Auth.validation.passwordMax', { n: PASSWORD_MAX })),
      passwordRepeat: z.string(t('Auth.validation.passwordRequired')),
    })
    .refine((d) => d.password === d.passwordRepeat, {
      message: t('Auth.validation.passwordMatch'),
      path: ['passwordRepeat'],
    }),
);

const schema = computed(() => (mode.value === 'login' ? loginSchema.value : registerSchema.value));

const providers = computed(() => [
  {
    label: t('Auth.withGoogle'),
    icon: 'i-simple-icons-google',
    color: 'neutral' as const,
    variant: 'subtle' as const,
    block: true,
    loading: auth.loading,
    onClick: () => auth.startSocial('google'),
  },
  {
    label: t('Auth.withFacebook'),
    icon: 'i-simple-icons-facebook',
    color: 'neutral' as const,
    variant: 'subtle' as const,
    block: true,
    loading: auth.loading,
    onClick: () => auth.startSocial('facebook'),
  },
]);

const errorText = computed(() => (auth.error ? t(`Auth.errors.${auth.error.code}`) : ''));

interface FormData {
  email: string;
  password: string;
  passwordRepeat?: string;
  remember?: boolean;
}

async function onSubmit(event: FormSubmitEvent<FormData>) {
  const { email, password, remember } = event.data;
  if (mode.value === 'login') {
    if (await auth.login(email.trim(), password, remember === true)) {
      open.value = false;
      toast.add({
        title: t('Auth.menu.welcome', { name: auth.userName }),
        icon: 'i-lucide-circle-check',
        color: 'success',
      });
    }
    return;
  }
  if (await auth.register(email.trim(), password)) registeredEmail.value = email.trim();
}

function toggleMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login';
}

function backToLogin() {
  registeredEmail.value = '';
  mode.value = 'login';
}
</script>
