import axios from 'axios';
import { useAuthStore } from '~/stores/app.store';
import apiModule from '../api/index';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();
  let baseURL;
  if (process.client) {
    if (window.location.hostname === 'tour.starkon.pp.ua') {
      // baseURL = 'https://tourapi.' + window.location.hostname;
      baseURL = config.public.apiBase || 'http://localhost:5050';
    } else {
      baseURL = config.public.apiBase || 'http://localhost:5050';
    }
  } else {
    baseURL = config.public.apiBase || 'http://localhost:5050';
  }

  const axiosInstance = axios.create({
    baseURL,
    headers: {
      Authorization: '',
    },
    withCredentials: true,
  });

  const api = apiModule(axiosInstance);

  const initialDataToken = () => {
    axiosInstance.defaults.headers.Authorization = `Bearer ${authStore?.userData?.tokens?.accessToken}`;
  };

  const refreshToken = async () => {
    if (!authStore.userData?.tokens?.refreshToken) {
      return authStore.logOut();
    }
    try {
      const response = await api.auth.refresh();
      if (!response.data.accessToken) {
        throw new Error('Failed to get new access token');
      }
      const updatedUserData = {
        ...authStore.userData,
        tokens: {
          ...authStore.userData.tokens,
          accessToken: response.data.accessToken,
        },
      };
      authStore.saveUserData(updatedUserData);
      axiosInstance.defaults.headers.Authorization = `Bearer ${response.data.accessToken}`;
    } catch (error) {
      console.error('Error refreshing token:', error);
      authStore.logOut();
      if (axios.isCancel(error)) {
        throw error;
      }
    }
  };

  axiosInstance.interceptors.request.use(async (config) => {
    initialDataToken();
    if (authStore?.userData?.tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${authStore?.userData?.tokens?.accessToken}`;
    } else {
      config.headers.Authorization = '';
    }
    return config;
  });

  axiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        await refreshToken();
        initialDataToken();
        const originalRequest = error.config;
        originalRequest.headers.Authorization = `Bearer ${authStore?.userData?.tokens?.accessToken}`;
        return axiosInstance(originalRequest);
      }
      return Promise.reject(error);
    },
  );

  nuxtApp.provide('api', api);
});
