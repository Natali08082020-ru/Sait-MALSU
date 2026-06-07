/**
 * Аналитика — логирование событий (без внешних сервисов).
 * SUPABASE / GA: подключить отправку в track().
 */
window.AnalyticsEvents = {
  HERO_LISTEN: "hero-listen",
  HERO_STORY: "hero-story",
  ALBUM_OPEN: "album-open",
  ORDER_SUBMIT: "order-submit",
  FAQ_OPEN: "faq-open",
  CONTACT_CLICK: "contact-click",
};

window.Analytics = {
  track(eventName, payload) {
    if (!eventName) return;
    const entry = {
      event: eventName,
      payload: payload || {},
      ts: new Date().toISOString(),
      path: window.location.pathname,
    };
    console.info("[MalSu Analytics]", entry);

    try {
      const log = JSON.parse(sessionStorage.getItem("malsu_analytics") || "[]");
      log.push(entry);
      if (log.length > 100) log.shift();
      sessionStorage.setItem("malsu_analytics", JSON.stringify(log));
    } catch {
      /* sessionStorage недоступен */
    }
  },

  init() {
    document.addEventListener("click", (e) => {
      const el = e.target.closest("[data-event]");
      if (!el) return;
      const eventName = el.dataset.event;
      const payload = { ...el.dataset };
      delete payload.event;
      this.track(eventName, payload);
    });

    document.addEventListener("toggle", (e) => {
      if (e.target.matches(".faq-item") && e.target.open) {
        this.track(window.AnalyticsEvents.FAQ_OPEN, {
          faqId: e.target.dataset.faqId || "",
        });
      }
    }, true);
  },
};
