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
      const { data } = await useFetch(`${apiBase}/business?slug=${slug}`);
      this.business = Array.isArray(data.value) ? data.value[0] : data.value;
    },

    async createBusiness(payload, apiBase) {
      await $fetch(apiBase + '/business/create', {
        method: 'POST',
        body: payload,
      });
    },

    async updateBusiness(apiBase) {
      return await $fetch(apiBase + '/business/', {
        method: 'PUT',
        body: this.business,
      });
    },

    async deleteBusiness(apiBase) {
      try {
        const res = await fetch(apiBase + '/business?id=' + this.business.id, {
          method: 'DELETE',
        });

        if (res.ok) {
          this.businesses = this.businesses.filter((item) => item.id !== this.business.id);
        } else {
          console.error('Помилка видалення:', res.status);
        }
      } catch (err) {
        console.error('Помилка:', err);
      }
    },
  },
});
