/**
 * Telegram-интеграция (клиентская отправка через буфер обмена).
 * SUPABASE: sendOrder может вызывать Edge Function.
 */
window.TelegramIntegration = {
  getTelegramUrl() {
    const site = window.siteConfig || window.SettingsService?.getSite();
    return site?.contacts?.telegram || site?.telegram || "";
  },

  formatOrderMessage(order) {
    const lines = [
      "🎵 Новая заявка MalSu",
      "",
      "Номер:",
      order.orderNumber || "—",
      "",
      "Имя:",
      order.name || "—",
      "",
      "Контакт:",
      order.contact || "—",
    ];

    if (order.category) {
      lines.push("", "Категория:", order.category);
    }
    if (order.budget) {
      lines.push("", "Бюджет:", order.budget);
    }
    if (order.deadline) {
      lines.push("", "Срок:", order.deadline);
    }

    lines.push("", "История:", order.story || "—");

    return lines.join("\n");
  },

  async copyText(text) {
    if (navigator.clipboard?.writeText) {
      return navigator.clipboard.writeText(text);
    }
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok ? Promise.resolve() : Promise.reject();
  },

  async sendOrder(order) {
    const text = this.formatOrderMessage(order);
    try {
      await this.copyText(text);
    } catch {
      /* копирование не обязательно */
    }
    const url = this.getTelegramUrl();
    if (url) window.open(url, "_blank");
    return { ok: true, text };
  },
};
