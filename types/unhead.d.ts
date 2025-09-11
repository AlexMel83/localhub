import type { Ref } from 'vue';

declare module 'unhead' {
  export interface Head {
    htmlAttrs?: {
      lang?: Ref<string> | string;
      dir?: Ref<string> | string;
      [key: string]: unknown;
    };
  }
}
