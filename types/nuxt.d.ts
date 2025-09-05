import { ToastContainerOptions } from 'vue3-toastify';
import type { NuxtApp as NuxtAppType } from '#app';
import type { AxiosInstance } from 'axios';

declare module '#app' {
  interface NuxtApp extends NuxtAppType {
    $customApi: any; // Замініть на конкретний тип, якщо apiModule має визначений тип
    $axios: AxiosInstance;
    $toast: {
      success(message: string, options?: ToastContainerOptions): number;
      error(message: string, options?: ToastContainerOptions): number;
      info(message: string, options?: ToastContainerOptions): number;
      warn(message: string, options?: ToastContainerOptions): number;
      clear(): void;
    };
    $t(key: string, values?: Record<string, any>): string;
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $customApi: any; // Замініть на конкретний тип, якщо apiModule має визначений тип
    $axios: AxiosInstance;
    $toast: {
      success(message: string, options?: ToastContainerOptions): number;
      error(message: string, options?: ToastContainerOptions): number;
      info(message: string, options?: ToastContainerOptions): number;
      warn(message: string, options?: ToastContainerOptions): number;
      clear(): void;
    };
    $t(key: string, values?: Record<string, any>): string;
  }
}
