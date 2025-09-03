import uk from './locales/uk.json';
import en from './locales/en.json';

export default defineI18nConfig(() => ({
  fallbackLocale: 'uk',
  legacy: false,
  messages: {
    uk,
    en,
  },
}));
