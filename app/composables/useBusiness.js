import { useRuntimeConfig } from 'nuxt/app';
import { useRoute } from 'vue-router';

export const useBusiness = () => {
  const route = useRoute();
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase || 'https://api.localhub.store';

  useState('business', () => ({}));
  const getBusiness = async () => {
    return await useFetch(apiBase + '/business', { key: 'businesses' });
  };

  const getBusinessBySlug = async (slug) => {
    return await useFetch(apiBase + '/business?slug=' + route.params.slug);
  };

  const createBusiness = async (payload) => {
    return await $fetch(apiBase + '/business/create', {
      method: 'POST',
      body: payload,
    });
  };

  const updateBusiness = async (payload) => {
    return await $fetch(apiBase + '/business/', {
      method: 'PUT',
      body: payload,
    });
  };

  return {
    business: useState('business'),
    getBusiness,
    getBusinessBySlug,
    createBusiness,
    updateBusiness,
  };
};
