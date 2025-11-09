import { defineStore } from 'pinia';

export const useModalStore = defineStore('modal', {
  state: () => ({
    isLoginModalOpen: false,
    activeModal: null as string | null,
    selectedFeature: null as unknown,
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
