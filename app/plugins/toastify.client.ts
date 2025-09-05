// @ts-expect-error need types
import { defineNuxtPlugin } from '#app';
import Vue3Toasity, { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Vue3Toasity, {
    autoClose: 3000,
    position: toast.POSITION.TOP_RIGHT,
  });

  console.log('Toastify plugin loaded:', toast);

  return {
    provide: {
      toast,
    },
  };
});
