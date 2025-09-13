import type { ToastContainerOptions } from 'vue3-toastify';
import type { NuxtApp as NuxtAppType } from '#app';
import type { AxiosInstance } from 'axios';
import type { ApiModule } from '../api/index';

declare module '#app' {
  interface NuxtApp extends NuxtAppType {
    $customApi: ApiModule;
    $axios: AxiosInstance;
    $toast: {
      success(message: string, options?: ToastContainerOptions): number;
      error(message: string, options?: ToastContainerOptions): number;
      info(message: string, options?: ToastContainerOptions): number;
      warn(message: string, options?: ToastContainerOptions): number;
      clear(): void;
    };
    $t(key: string, values?: Record<string, unknown>): string;
    $gtag?: (...args: unknown[]) => void;
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $customApi: ApiModule;
    $axios: AxiosInstance;
    $toast: {
      success(message: string, options?: ToastContainerOptions): number;
      error(message: string, options?: ToastContainerOptions): number;
      info(message: string, options?: ToastContainerOptions): number;
      warn(message: string, options?: ToastContainerOptions): number;
      clear(): void;
    };
    $t(key: string, values?: Record<string, unknown>): string;
    $gtag?: (...args: unknown[]) => void;
  }
}

declare module 'nuxt/schema' {
  interface NuxtConfig {
    robots?: {
      allow?: string | string[];
      disallow?: string | string[];
      sitemap?: string;
    };
    sitemap?: {
      siteUrl?: string;
      autoI18n?: boolean;
      sources?: string[];
      gzip?: boolean;
      debug?: boolean;
      defaults?: {
        changefreq?: string;
        priority?: number;
      };
      cacheMaxAgeSeconds?: number;
    };
    leaflet?: {
      markerCluster?: boolean;
    };
    i18n?: {
      locales?: {
        code?: string;
        name?: string;
        file?: string;
        iso?: string;
      }[];
      vueI18n?: string;
      strategy?: string;
      detectBrowserLanguage?: boolean;
      defaultLocale?: string;
      langDir?: string;
      baseUrl?: string;
      customRoutes?: string;
      differentDomains?: boolean;
      skipSettingLocaleOnNavigate?: boolean;
      defaultLocaleRouteNameSuffix?: string;
    };
    image?: {
      provider?: string;
      quality?: number;
      format?: string[];
      screens?: {
        xs?: number;
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
        xxl?: number;
      };
    };
  }
  interface PublicRuntimeConfig {
    [key: string]: any; // Гнучкість для runtime config
  }
}

interface Window {
  gtag?: (...args: unknown[]) => void;
}
