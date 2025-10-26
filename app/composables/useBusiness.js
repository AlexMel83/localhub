import { useRuntimeConfig } from 'nuxt/app';

export const useBusiness = () => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase || 'https://api.localhub.store';

  useState('business', () => ({}));
  const getBusiness = async () => {
    return await useFetch(apiBase + '/business', { key: 'businesses' });
  };

  const getBusinessBySlug = async (slug) => {
    return await useFetch(apiBase + '/business?slug=' + slug);
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
