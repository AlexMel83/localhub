export const useGeoCode = () => {
  const lastReverseTime = ref(0);
  const REVERSE_DELAY = 1000;

  const reverseGeoCode = async (form, errorMessage, successMessage) => {
    const now = Date.now();
    if (now - lastReverseTime.value < REVERSE_DELAY) {
      errorMessage = 'Зачекайте 1 секунду між запитами';
      return;
    }
    lastReverseTime.value = now;

    if (!form.latitude || !form.longitude) {
      errorMessage = 'Введіть координати';
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${form.latitude}&lon=${form.longitude}`,
      );
      const data = await res.json();

      if (data?.display_name) {
        form.address = data.display_name;
        setTimeout(() => (successMessage = ''), 2000);
        console.log(successMessage);
      } else {
        errorMessage = 'Адресу не знайдено';
      }
    } catch (err) {
      console.error(err);
      errorMessage = 'Помилка запиту до Nominatim';
    }
  };

  const geoCodeAddress = async (form) => {
    if (!form.address) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.address)}`,
      );
      const data = await res.json();
      if (data?.length > 0) {
        const { lat, lon, display_name } = data[0];
        form.latitude = Number(lat);
        form.longitude = Number(lon);
        form.address = display_name;
      }
    } catch (err) {
      console.error(err);
    }
  };

  return { reverseGeoCode, geoCodeAddress };
};
