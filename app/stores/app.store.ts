import { defineStore } from 'pinia';
import { useNuxtApp, navigateTo } from 'nuxt/app';
import type { AuthApi } from '../api/auth';
import { useCookie } from '#app';
import axios from 'axios';
import { useCookieConsent } from '~/composables/useCookieConsent';

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

interface ConsentData {
  categories?: string[];
}

export const useAppStore = defineStore('app', {
  state: () => {
    const themeCookie = useCookie<string | null>('theme', {
      default: () => {
        const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? 'dark' : 'light';
      },
    });
    const isDark = themeCookie.value === 'dark';

    return {
      isMenuOpen: false,
      isLoading: false,
      menuOpen: false,
      searchTerm: '',
      isDark,
      isListView: true,
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

      const { getCookieConsentData } = useCookieConsent();
      const consentData = getCookieConsentData() as ConsentData | null; // Приведення типу
      const allowed = consentData && 'categories' in consentData && consentData.categories?.includes('theme');

      if (allowed) {
        const themeCookie = useCookie('theme');
        themeCookie.value = this.isDark ? 'dark' : 'light';
      }
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', this.isDark ? 'dark' : 'light');
      }
    },
    setLanguage(lang: string) {
      const { getCookieConsentData } = useCookieConsent();
      const consentData = getCookieConsentData() as ConsentData | null;
      console.log('setLanguage consentData:', consentData); // Дебаг
      const allowed = consentData && 'categories' in consentData && consentData.categories?.includes('i18n');
      console.log('setLanguage allowed:', allowed); // Дебаг allowed

      if (allowed) {
        const langCookie = useCookie('i18n_redirected');
        langCookie.value = lang;
        console.log('setLanguage updated i18n_redirected to:', lang); // Дебаг
        const { $i18n } = useNuxtApp();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ($i18n && typeof ($i18n as any).setLocale === 'function') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ($i18n as any).setLocale(lang);
          console.log('setLocale called with:', lang); // Дебаг
        }
        // Редірект на правильний шлях
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith(`/${lang}`) && lang !== 'uk') {
          navigateTo(`/${lang}${currentPath}`, { replace: true });
          console.log('Navigated to:', `/${lang}${currentPath}`); // Дебаг
        }
      } else {
        console.log('setLanguage not allowed, consentData:', consentData); // Дебаг
      }
    },
    toggleListView() {
      this.isListView = !this.isListView;
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
