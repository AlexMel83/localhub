import { useRouter } from 'vue-router';
import { nextTick } from 'vue';

export const useAnalytics = () => {
  const { trackEvent, trackPageView, trackConversion, setUserProperties, hasAnalyticsConsent } = {
    trackEvent: async (eventName: string, parameters?: unknown) => {
      if (import.meta.client) {
        const { trackEvent } = await import('~/utils/gtag');
        trackEvent(eventName, parameters);
      }
    },

    trackPageView: async (pageTitle?: string, pagePath?: string) => {
      if (import.meta.client) {
        const { trackPageView } = await import('~/utils/gtag');
        trackPageView(pageTitle, pagePath);
      }
    },

    trackConversion: async (conversionId: string, value?: number, currency?: string) => {
      if (import.meta.client) {
        const { trackConversion } = await import('~/utils/gtag');
        trackConversion(conversionId, value, currency);
      }
    },

    setUserProperties: async (properties: Record<string, unknown>) => {
      if (import.meta.client) {
        const { setUserProperties } = await import('~/utils/gtag');
        setUserProperties(properties);
      }
    },

    hasAnalyticsConsent: async () => {
      if (import.meta.client) {
        const { hasAnalyticsConsent } = await import('~/utils/gtag');
        return hasAnalyticsConsent();
      }
      return false;
    },
  };

  // Автоматичний трекінг переходів між сторінками
  const router = useRouter();

  router.afterEach((to, from) => {
    if (import.meta.client && to.path !== from.path) {
      // Трекаємо перегляд сторінки тільки якщо є згода
      nextTick(() => {
        trackPageView((to.meta.title as string) || document.title, to.fullPath);
      });
    }
  });

  // Типові події для трекінгу
  const events = {
    // Клік по кнопці
    clickButton: (buttonName: string, location?: string) => {
      trackEvent('click_button', {
        button_name: buttonName,
        button_location: location,
      });
    },

    // Пошук
    search: (searchTerm: string, category?: string) => {
      trackEvent('search', {
        search_term: searchTerm,
        search_category: category,
      });
    },

    // Перегляд контенту
    viewContent: (contentType: string, contentId?: string) => {
      trackEvent('view_content', {
        content_type: contentType,
        content_id: contentId,
      });
    },

    // Контакт/зв'язок
    contact: (method: string) => {
      trackEvent('contact', {
        contact_method: method,
      });
    },

    // Помилка
    error: (errorMessage: string, errorLocation?: string) => {
      trackEvent('exception', {
        description: errorMessage,
        fatal: false,
        error_location: errorLocation,
      });
    },

    // Завантаження файлу
    download: (fileName: string, fileType?: string) => {
      trackEvent('file_download', {
        file_name: fileName,
        file_type: fileType,
      });
    },

    // Відправка форми
    formSubmit: (formName: string, success: boolean = true) => {
      trackEvent('form_submit', {
        form_name: formName,
        form_success: success,
      });
    },
  };

  return {
    trackEvent,
    trackPageView,
    trackConversion,
    setUserProperties,
    hasAnalyticsConsent,
    events,
  };
};
