export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const googleMapsApiKey = config.public.googleMapsApiKey;
  let isLoaded = false;
  let loadPromise = null;

  if (!googleMapsApiKey) {
    console.error('Google Maps API Key не налаштовано в runtimeConfig.');
    return;
  }

  const loadGoogleMaps = () => {
    if (isLoaded) {
      console.log('Google Maps API вже завантажено.');
      return Promise.resolve();
    }
    if (loadPromise) {
      console.log('Google Maps API вже завантажується...');
      return loadPromise;
    }

    loadPromise = new Promise((resolve, reject) => {
      window.initGoogleMaps = () => {
        isLoaded = true;
        console.log('Google Maps API ініціалізовано.');
        resolve();
      };

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&callback=initGoogleMaps&libraries=places&v=weekly&loading=async&render=lazy`;
      script.async = true;
      script.defer = true;
      script.onerror = (err) => {
        console.error('Помилка завантаження Google Maps API:', err);
        reject(new Error('Не вдалося завантажити Google Maps API.'));
      };

      document.head.appendChild(script);
    });

    return loadPromise;
  };

  nuxtApp.provide('loadGoogleMaps', loadGoogleMaps);
});
