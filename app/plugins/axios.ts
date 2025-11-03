import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';
import { useAuthStore } from '~/stores/auth.store';
import apiModule from '~/api/index';
import { defineNuxtPlugin, useRuntimeConfig, navigateTo, useNuxtApp } from '#app';

interface TokenData {
  accessToken: string;
  refreshToken?: string;
}

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();
  const baseURL = config.public.apiBase || 'http://localhost:5050';

  const axiosInstance: AxiosInstance = axios.create({
    baseURL,
    timeout: 15000,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  const api = apiModule(axiosInstance);

  // === Додаємо токен при кожному запиті ===
  const getAccessToken = () => authStore.userData?.tokens?.accessToken || null;

  const setAuthHeader = (token: string | null = null) => {
    const accessToken = token || getAccessToken();
    if (accessToken) axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    else delete axiosInstance.defaults.headers.common['Authorization'];
  };

  // === Рефреш токенів ===
  let isRefreshing = false;
  let refreshSubscribers: Array<(token: string) => void> = [];

  const subscribeTokenRefresh = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb);
  };
  const onRefreshed = (token: string) => {
    refreshSubscribers.forEach((cb) => cb(token));
    refreshSubscribers = [];
  };

  const refreshToken = async (): Promise<boolean> => {
    const refreshTokenValue = authStore.userData?.tokens?.refreshToken;
    if (!refreshTokenValue) {
      console.warn('Refresh token відсутній, виконується вихід');
      await authStore.logout();
      return false;
    }

    if (isRefreshing) {
      return new Promise((resolve) => subscribeTokenRefresh((token) => resolve(!!token)));
    }

    isRefreshing = true;

    try {
      delete axiosInstance.defaults.headers.common['Authorization'];
      const response = await api.auth.refresh(refreshTokenValue);

      const newAccess = response.data?.tokens?.accessToken;
      if (!newAccess) throw new Error('Не вдалося оновити access token');

      const updatedData = {
        ...authStore.userData,
        tokens: {
          ...authStore.userData!.tokens,
          accessToken: newAccess,
          refreshToken: response.data?.tokens?.refreshToken || authStore.userData!.tokens.refreshToken,
        },
      };

      authStore.saveUserData(updatedData);
      setAuthHeader(newAccess);
      onRefreshed(newAccess);

      return true;
    } catch (error) {
      console.error('Помилка оновлення токену:', error);
      await authStore.logout();
      onRefreshed('');
      if (import.meta.client) await navigateTo('/login');
      return false;
    } finally {
      isRefreshing = false;
    }
  };

  // === Interceptors ===
  axiosInstance.interceptors.request.use(
    (config) => {
      const accessToken = getAccessToken();
      if (accessToken && config.headers) config.headers.Authorization = `Bearer ${accessToken}`;
      return config;
    },
    (error) => Promise.reject(error),
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as ExtendedAxiosRequestConfig;

      if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
        originalRequest._retry = true;
        const success = await refreshToken();

        if (success) {
          const newToken = getAccessToken();
          if (newToken && originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        }
      }

      // Показ помилок
      if (import.meta.client && error.response) {
        const { $toast, $t } = useNuxtApp();
        const code = error.response.status;
        const messages: Record<number, string> = {
          400: $t('errors.badRequest'),
          404: $t('errors.notFound'),
          500: $t('errors.serverError'),
          503: $t('errors.serviceUnavailable'),
        };
        if (messages[code]) $toast.error(messages[code]);
      }

      return Promise.reject(error);
    },
  );

  if (import.meta.client) setAuthHeader();

  return {
    provide: {
      axios: axiosInstance,
      customApi: api,
    },
  };
});
