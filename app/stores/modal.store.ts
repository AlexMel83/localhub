import { defineStore } from 'pinia';

export const useModalStore = defineStore('modal', {
  state: () => ({
    isLoginModalOpen: false,
  }),
  actions: {
    openLoginModal() {
      console.log('Opening modal');
      this.isLoginModalOpen = true;
    },
    closeLoginModal() {
      console.log('Closing modal');
      this.isLoginModalOpen = false;
    },
  },
});
