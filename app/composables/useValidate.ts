// composables/useValidate.js
import { ref, unref, readonly } from 'vue';

/**
 * Валідація телефону
 * @returns {Object} { validatePhone, phoneError, normalizePhone }
 */
export const useValidate = () => {
  const phoneError = ref('');

  const validatePhone = (phoneValue: string, setValue: unknown) => {
    phoneError.value = '';

    let phone = String(unref(phoneValue) || '').trim();

    if (!phone) {
      return true;
    }

    // Прибираємо все, крім цифр, пробілів, дужок, дефісів
    phone = phone.replace(/[()\s-]/g, '');

    // Нормалізуємо
    if (/^0\d{9}$/.test(phone)) {
      phone = '+38' + phone;
    } else if (/^380\d{9}$/.test(phone)) {
      phone = '+' + phone;
    } else if (!/^\+380\d{9}$/.test(phone)) {
      phoneError.value = 'Невірний формат номера. Використовуйте, наприклад: +380987654321';
      return false;
    }

    // Оновлюємо значення
    if (typeof setValue === 'function') {
      setValue(phone);
    }

    return true;
  };

  const normalizePhone = (phone: string) => {
    if (!phone) return '';

    let digits = phone.replace(/\D/g, '');

    if (digits.startsWith('0')) digits = '38' + digits;
    if (!digits.startsWith('380')) digits = '380' + digits;

    return '+' + digits;
  };

  return {
    phoneError: readonly(phoneError),
    validatePhone,
    normalizePhone,
  };
};
