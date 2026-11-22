import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import { useAuthStore } from '~/stores/auth.store';
import { useModalStore } from '~/stores/modal.store';
import apiModule from '~/api/index';
import { defineNuxtPlugin, useRuntimeConfig, useNuxtApp } from '#app';

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Auth endpoints report their own errors in the sign-in window: no global
// toast and no refresh-and-retry for them.
const AUTH_ENDPOINT = /\/(login|registration|logout|refresh|activate|auth-user|social-login)(\/|$|\?)/;

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();
  const baseURL = config.public.apiBase || 'http://localhost:4040';

  const axiosInstance: AxiosInstance = axios.create({
    baseURL,
    timeout: 15000,
    // The refresh token lives in an httpOnly cookie of the API domain.
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  const api = apiModule(axiosInstance);

  // One refresh at a time; parallel 401s wait for it.
  let refreshing: Promise<boolean> | null = null;
  const refreshSession = () => {
    refreshing ??= authStore.refresh().finally(() => {
      refreshing = null;
    });
    return refreshing;
  };

  axiosInstance.interceptors.request.use(
    (req) => {
      if (authStore.accessToken && req.headers) req.headers.Authorization = `Bearer ${authStore.accessToken}`;
      return req;
    },
    (error) => Promise.reject(error),
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const req = error.config as ExtendedAxiosRequestConfig | undefined;
      const isAuthCall = AUTH_ENDPOINT.test(req?.url ?? '');
      const status = error.response?.status;

      if (req && !isAuthCall && (status === 401 || status === 403) && !req._retry && authStore.isAuthed) {
        req._retry = true;
        if (await refreshSession()) {
          if (req.headers) req.headers.Authorization = `Bearer ${authStore.accessToken}`;
          return axiosInstance(req);
        }
        // Session is over: ask to sign in again.
        if (import.meta.client) useModalStore().openLoginModal();
      }

      if (import.meta.client && error.response && !isAuthCall) {
        const { $toast, $t } = useNuxtApp() as unknown as {
          $toast: { error: (m: string) => void };
          $t: (key: string) => string;
        };
        const messages: Record<number, string> = {
          400: $t('errors.badRequest'),
          404: $t('errors.notFound'),
          500: $t('errors.serverError'),
          503: $t('errors.serviceUnavailable'),
        };
        const text = status ? messages[status] : undefined;
        if (text) $toast.error(text);
      }

      return Promise.reject(error);
    },
  );

  // Session saved in this browser (localStorage / sessionStorage).
  if (import.meta.client) authStore.restore();

  return {
    provide: {
      axios: axiosInstance,
      customApi: api,
    },
  };
});
