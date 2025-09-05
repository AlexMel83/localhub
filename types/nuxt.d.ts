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

interface Window {
  gtag?: (...args: unknown[]) => void;
}
