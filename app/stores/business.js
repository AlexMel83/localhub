// import { useRuntimeConfig } from 'nuxt/app';

// const config = useRuntimeConfig();
const apiBase = 'https://api.localhub.store';

export const useBusinessStore = defineStore('businessStore', {
  state: () => ({
    business: {},
    businesses: [],
  }),
  actions: {
    async getBusiness() {
      const { data } = await useFetch(apiBase + '/business', { key: 'businesses' });
      this.businesses = data.value;
    },

    async getBusinessBySlug(slug) {
      const res = await useFetch(apiBase + '/business?slug=' + slug);
      this.business = res.data.value[0];
    },
  },
});
