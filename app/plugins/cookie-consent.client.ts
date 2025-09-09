import 'vanilla-cookieconsent';

export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    // бібліотека виносить API сюди
    const cc = (window as unknown).CookieConsent?.initCookieConsent();

    if (!cc) {
      console.error('CookieConsent не ініціалізувався');
      return;
    }

    cc.run({
      categories: {
        necessary: {
          enabled: true,
          readOnly: true,
        },
        analytics: {},
      },
      language: {
        default: 'uk',
        translations: {
          uk: {
            consentModal: {
              title: 'Ми використовуємо файли cookie',
              description:
                'Ми застосовуємо cookie для забезпечення стабільної роботи сайту та покращення вашого досвіду. Ви можете змінити налаштування у будь-який момент.',
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
                  description: 'Дозволяє нам розуміти, як ви користуєтесь сайтом, щоб робити його зручнішим.',
                },
              ],
            },
          },
        },
      },
    });
  }
});
