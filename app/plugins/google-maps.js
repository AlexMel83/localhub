export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const googleMapsApiKey = config.public.googleMapsApiKey;
  let isLoaded = false;
  let loadPromise = null;

  const loadGoogleMaps = () => {
    if (isLoaded) return Promise.resolve();
    if (loadPromise) return loadPromise;

    loadPromise = new Promise((resolve, reject) => {
      window.initGoogleMaps = () => {
        isLoaded = true;
        resolve();
      };

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&callback=initGoogleMaps&libraries=places&v=beta&loading=async&render=lazy`;
      script.async = true;
      script.defer = true;
      script.onerror = reject;

      document.head.appendChild(script);
    });

    return loadPromise;
  };

  nuxtApp.provide('loadGoogleMaps', loadGoogleMaps);
});
