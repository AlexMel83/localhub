import { defineStore } from 'pinia';

export const useModalStore = defineStore('modal', {
  state: () => ({
    isLoginModalOpen: false,
    /** Which tab the sign-in window opens on. */
    loginModalMode: 'login' as 'login' | 'register',
    activeModal: null as string | null,
    selectedFeature: null as unknown,
  }),
  actions: {
    openLoginModal(mode: 'login' | 'register' = 'login') {
      this.loginModalMode = mode;
      this.isLoginModalOpen = true;
    },
    closeLoginModal() {
      this.isLoginModalOpen = false;
    },
    openThankfulDetails(feature: unknown) {
      this.selectedFeature = feature;
      this.activeModal = 'thankful-details';
    },
    closeModal() {
      this.activeModal = null;
      this.selectedFeature = null;
    },
  },
});
