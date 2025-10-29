import { useRuntimeConfig } from 'nuxt/app';

export const useBusiness = () => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase || 'https://api.localhub.store';

  const business = useState('business', () => {});
  const businesses = useState('businesses', () => []);

  const getBusiness = async () => {
    const { data } = await useFetch(apiBase + '/business', { key: 'businesses' });
    businesses.value = data.value;
    return businesses;
  };

  const getBusinessBySlug = async (slug) => {
    const res = await useFetch(apiBase + '/business?slug=' + slug);
    console.log(slug);
    business.value = res.data.value[0];
    return business;
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

  const deleteBusiness = async (business) => {
    try {
      const res = await fetch(apiBase + '/business?id=' + business.id, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Видаляємо з реактивного стану
        businesses.value = businesses.value.filter((item) => item.id !== business.id);
      } else {
        console.error('Помилка видалення:', res.status);
      }
    } catch (err) {
      console.error('Помилка:', err);
    }
  };

  return {
    business,
    businesses,
    getBusiness,
    getBusinessBySlug,
    createBusiness,
    updateBusiness,
    deleteBusiness,
  };
};
