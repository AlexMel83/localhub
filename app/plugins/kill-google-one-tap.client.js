export default defineNuxtPlugin((nuxtApp) => {
  if (!import.meta.client) return;

  const killOverlays = () => {
    const selectors = [
      'iframe[name^="__gsi"]',
      '#credential_picker_container',
      '#credential_picker_iframe',
      'div[jstcache]', // <--- додаємо сюди
    ];

    selectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        // Логування, щоб бачити що саме чіпляється
        console.debug('[kill-one-tap] removed:', sel, el);

        // Ховаємо і блокуємо курсор
        el.style.display = 'none';
        el.style.pointerEvents = 'none';
        el.setAttribute('data-disabled-by', 'nuxt-kill-one-tap');
      });
    });
  };

  // одразу після старту
  setTimeout(killOverlays, 0);

  // кілька повторів після завантаження
  let i = 0;
  const early = setInterval(() => {
    killOverlays();
    if (++i > 10) clearInterval(early);
  }, 500);

  // після зміни сторінки / локалі
  nuxtApp.hook('page:finish', () => {
    setTimeout(killOverlays, 0);
    let n = 0;
    const t = setInterval(() => {
      killOverlays();
      if (++n > 8) clearInterval(t);
    }, 400);
  });

  // слухаємо мутації DOM
  const mo = new MutationObserver(() => killOverlays());
  mo.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('beforeunload', () => mo.disconnect());
});
