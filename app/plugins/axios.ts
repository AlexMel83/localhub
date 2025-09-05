// app/plugins/axios.ts
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';
import { useAuthStore } from '../stores/app.store';
import apiModule from '../api/index';
// @ts-ignore
import { defineNuxtPlugin, useRuntimeConfig, navigateTo, useNuxtApp, type NuxtApp } from '#app';

// Типи для API відповідей
interface TokenData {
  accessToken: string;
  refreshToken?: string;
}

interface UserData {
  tokens: TokenData;
  [key: string]: any;
}

interface RefreshTokenResponse {
  tokens: TokenData;
}

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export default defineNuxtPlugin((nuxtApp: NuxtApp) => {
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

  const getAccessToken = (): string | null => authStore?.userData?.tokens?.accessToken || null;

  const setAuthHeader = (token: string | null = null): void => {
    const accessToken = token || getAccessToken();
    if (accessToken) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } else {
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
  };

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
      await authStore.logOut();
      return false;
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((token) => resolve(!!token));
      });
    }

    isRefreshing = true;

    try {
      const originalAuthHeader = axiosInstance.defaults.headers.common['Authorization'];
      delete axiosInstance.defaults.headers.common['Authorization'];

      const response = await api.auth.refresh(refreshTokenValue);

      if (!response.data?.tokens?.accessToken) {
        throw new Error('Не вдалося отримати новий access token');
      }

      const updatedUserData: UserData = {
        ...authStore.userData,
        tokens: {
          ...authStore.userData!.tokens,
          accessToken: response.data.tokens.accessToken,
          refreshToken: response.data.tokens?.refreshToken || authStore.userData!.tokens.refreshToken,
        },
      };

      await authStore.saveUserData(updatedUserData);
      setAuthHeader(response.data.tokens.accessToken);
      onRefreshed(response.data.tokens.accessToken);

      return true;
    } catch (error: any) {
      console.error('Помилка при оновленні токену:', error.message);
      await authStore.logOut();
      onRefreshed('');
      if (process.client) {
        await navigateTo('/login');
      }
      return false;
    } finally {
      isRefreshing = false;
    }
  };

  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const accessToken = getAccessToken();
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error: AxiosError) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    },
  );

  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as ExtendedAxiosRequestConfig;

      if (
        (error.response?.status === 401 || error.response?.status === 403) &&
        originalRequest &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        const refreshSuccess = await refreshToken();

        if (refreshSuccess) {
          const newAccessToken = getAccessToken();
          if (newAccessToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          try {
            return await axiosInstance(originalRequest);
          } catch (retryError) {
            console.error('Помилка при повторному запиті:', retryError);
            return Promise.reject(retryError);
          }
        }
      }

      if (process.dev) {
        console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.message);
      }

      if (process.client && error.response) {
        const { $toast, $t } = useNuxtApp();
        switch (error.response.status) {
          case 400:
            $toast.error($t('errors.badRequest'));
            break;
          case 404:
            $toast.error($t('errors.notFound'));
            break;
          case 500:
            $toast.error($t('errors.serverError'));
            break;
          case 503:
            $toast.error($t('errors.serviceUnavailable'));
            break;
        }
      }

      return Promise.reject(error);
    },
  );

  if (process.client) {
    setAuthHeader();
  }

  return {
    provide: {
      customApi: api,
      axios: axiosInstance,
    },
  };
});
