import CookieConsent from 'vanilla-cookieconsent';

export default defineNuxtPlugin(() => {
  if (!import.meta.client) return;

  const cc = CookieConsent();

  if (!cc) {
    console.error('CookieConsent не ініціалізувався');
    return;
  }

  cc.run({
    guiOptions: {
      consentModal: {
        layout: 'cloud',
        position: 'bottom center',
        equalWeightButtons: true,
      },
      preferencesModal: {
        layout: 'box',
      },
    },
    categories: {
      necessary: {
        enabled: true,
        readOnly: true,
      },
      analytics: {
        autoClear: {
          cookies: [
            {
              name: /^_ga/, // видаляє всі GA cookies при відмові
            },
          ],
        },
        services: {
          ga: {
            label: 'Google Analytics',
            onAccept: () => {
              console.log('GA accepted → тут ініціалізуємо gtag');
            },
            onReject: () => {
              console.log('GA rejected');
            },
          },
        },
      },
    },
    language: {
      default: 'uk',
      translations: {
        uk: {
          consentModal: {
            title: 'Ми використовуємо файли cookie',
            description:
              'Цей сайт застосовує cookie для роботи та збору аналітики. Ви можете змінити налаштування у будь-який момент.',
            acceptAllBtn: 'Прийняти всі',
            acceptNecessaryBtn: 'Лише необхідні',
            showPreferencesBtn: 'Налаштувати',
          },
          preferencesModal: {
            title: 'Налаштування cookie',
            savePreferencesBtn: 'Зберегти',
            acceptAllBtn: 'Прийняти всі',
            rejectAllBtn: 'Відхилити всі',
            closeIconLabel: 'Закрити',
            sections: [
              {
                title: 'Необхідні файли cookie',
                description: 'Ці файли потрібні для роботи сайту і не можуть бути вимкнені.',
              },
              {
                title: 'Аналітика',
                description: 'Допомагає зрозуміти, як користувачі взаємодіють із сайтом.',
              },
            ],
          },
        },
      },
    },
  });
});
