export const useBusinessStore = defineStore('businessStore', {
  state: () => ({
    business: {},
    businesses: [],
  }),
  actions: {
    async getBusiness(apiBase) {
      const { data } = await useFetch(apiBase + '/business', { key: 'businesses' });
      this.businesses = data.value;
    },

    async getBusinessBySlug(slug, apiBase) {
      const res = await useFetch(apiBase + '/business?slug=' + slug);
      this.business = res.data.value[0];
    },

    async createBusiness(payload, apiBase) {
      await $fetch(apiBase + '/business/create', {
        method: 'POST',
        body: payload,
      });
    },
  },
});
