import { defineStore } from 'pinia';
import { useNuxtApp } from 'nuxt/app';
import type { AuthApi } from '../api/auth';
// @ts-expect-error need types
import { useCookie } from '#app';
import axios from 'axios';

interface User {
  id: number;
  email: string;
  facebook_id: string | null;
  google_id: string;
  name: string;
  surname: string;
  phone: string;
  picture: string;
  role: string;
  social_login: boolean;
  isactivated: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken?: string;
    expAcToken?: string;
    expRfToken?: string;
  };
}

interface Store {
  id: number;
  slug: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  address?: string;
  contacts?: string;
  working_hours?: string;
  type?: string;
  rating?: number;
  price?: string;
  latitude?: number;
  longitude?: number;
  heading?: number;
  tilt?: number;
  created_at?: string;
  updated_at?: string;
}

interface StoresApi {
  getStores: () => Promise<{ data: Store[] }>;
  getStoreBySlug: (slug: string) => Promise<{ data: Store[] }>;
}

interface CustomApi {
  stores: StoresApi;
}

interface Error {
  message: string;
}

export const useAppStore = defineStore('app', {
  state: () => {
    const themeCookie = useCookie('theme', { default: () => 'light' }); // Кукі за замовчуванням 'light'
    const isDark = themeCookie.value === 'dark';

    return {
      isMenuOpen: false,
      isLoading: false,
      menuOpen: false,
      searchTerm: '',
      isDark,
      isListView: false,
    };
  },
  actions: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
    setSearchTerm(term: string) {
      this.searchTerm = term;
    },
    toggleDarkMode() {
      this.isDark = !this.isDark;
      const themeCookie = useCookie('theme');
      themeCookie.value = this.isDark ? 'dark' : 'light'; // Оновлюємо кукі
      if (import.meta.client) {
        if (this.isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
    toggleListView() {
      this.isListView = !this.isListView;
    },
  },
});

export const useAuthStore = defineStore('auth', {
  state: () => ({
    userData: null as AuthResponse | null,
    isAuthed: false,
  }),
  actions: {
    saveUserData(data: Partial<AuthResponse>) {
      if (!this.userData) {
        this.userData = {
          user: {
            id: 0,
            email: '',
            name: '',
            surname: '',
            phone: '',
            role: '',
            isactivated: false,
            social_login: false,
            facebook_id: null,
            google_id: '',
            picture: '',
            created_at: '',
            updated_at: '',
          },
          tokens: {
            accessToken: '',
            refreshToken: undefined,
            expAcToken: undefined,
          },
        };
      }
      if (data.user) {
        this.userData.user = { ...this.userData.user, ...data.user };
      }
      if (data.tokens) {
        this.userData.tokens = { ...this.userData.tokens, ...data.tokens };
      }
      this.isAuthed = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('userData', JSON.stringify(this.userData));
      }
    },
    loadUserData() {
      if (typeof window !== 'undefined') {
        const data = localStorage.getItem('userData');
        if (data) {
          this.userData = JSON.parse(data);
          this.isAuthed = !!this.userData?.tokens?.accessToken;
          return this.userData;
        }
      }
      return null;
    },
    async logOut() {
      const nuxtApp = useNuxtApp();
      const $api = nuxtApp.$api as { auth: AuthApi };
      try {
        await $api.auth.logout();
        this.$reset();
        if (typeof window !== 'undefined') {
          localStorage.clear();
        }
      } catch (error) {
        console.error('Error during logOut:', error);
      }
    },
  },
});

export const useStoresStore = defineStore('stores', {
  state: () => ({
    stores: [] as unknown[],
    storeCache: {} as Record<string, unknown>,
    goodsCache: {} as Record<string, unknown[]>, // ключ — url прайсу
    isLoading: false,
    isLoaded: false,
    goodsLoading: {} as Record<string, boolean>,
    goodsError: {} as Record<string, string>,
  }),

  actions: {
    async fetchStores($customApi: CustomApi) {
      if (this.isLoaded) return;
      this.isLoading = true;
      try {
        const response = await $customApi.stores.getStores();
        this.stores = response.data.map((store: Store) => ({
          ...store,
          rating: store.rating || Math.floor(Math.random() * 5 * 2) / 2 + 0.5,
        }));
        this.isLoaded = true;
      } catch (error) {
        console.error('Error fetching stores:', error);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchStoreBySlug($customApi: CustomApi, slug: string) {
      if (this.storeCache[slug]) {
        return this.storeCache[slug];
      }
      try {
        const response = await $customApi.stores.getStoreBySlug(slug);
        const store = response.data?.[0] || null;
        if (store) {
          this.storeCache[slug] = store;
        }
        return store;
      } catch (err) {
        console.error('Error fetching store by slug:', err);
        return null;
      }
    },

    async fetchGoods(priceUrl: string) {
      if (!priceUrl) return [];

      // якщо вже є в кеші → віддаємо
      if (this.goodsCache[priceUrl]) {
        return this.goodsCache[priceUrl];
      }

      this.goodsLoading[priceUrl] = true;
      this.goodsError[priceUrl] = '';
      try {
        const { data } = await axios.get(priceUrl);
        this.goodsCache[priceUrl] = data;
        return data;
      } catch (err: unknown) {
        console.error('Помилка завантаження прайсу:', err);
        this.goodsError[priceUrl] = 'Помилка завантаження прайсу: ' + (err || 'Невідома помилка');
        return [];
      } finally {
        this.goodsLoading[priceUrl] = false;
      }
    },
  },
});

export const useIsLoadingStore = defineStore('isLoading', {
  state: () => ({
    isLoading: true,
  }),
  actions: {
    set(data: boolean) {
      this.$patch({ isLoading: data });
    },
  },
});
