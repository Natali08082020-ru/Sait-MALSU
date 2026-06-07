/** Общие утилиты и навигация админ-панели MalSu */
window.AdminShell = {
  navItems: [
    { href: "index.html", label: "Обзор" },
    { href: "orders.html", label: "Заказы" },
    { href: "albums.html", label: "Альбомы" },
    { href: "tracks.html", label: "Треки" },
    { href: "reviews.html", label: "Отзывы" },
    { href: "faq.html", label: "FAQ" },
    { href: "pricing.html", label: "Стоимость" },
    { href: "settings.html", label: "Настройки" },
  ],

  renderNav(activePage) {
    return this.navItems
      .map(
        (item) =>
          `<a href="${item.href}" class="${item.href === activePage ? "is-active" : ""}">${item.label}</a>`
      )
      .join("");
  },

  init(activePage) {
    const nav = document.getElementById("admin-nav");
    if (nav) nav.innerHTML = this.renderNav(activePage);
    const logout = document.getElementById("admin-logout");
    if (logout) {
      logout.addEventListener("click", () => AdminAuth.logout());
    }
  },
};

window.AdminUI = {
  escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  },

  formatDate(iso) {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  },

  formatDateTime(iso) {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString("ru-RU", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  },

  statusBadge(status) {
    const label = window.getOrderStatusLabel?.(status) || status;
    const cls = `admin-badge admin-badge--${String(status).toLowerCase()}`;
    return `<span class="${cls}">${this.escapeHtml(label)}</span>`;
  },

  paymentBadge(status) {
    const label = window.getPaymentStatusLabel?.(status) || status;
    const cls = `admin-badge admin-badge--pay-${String(status).toLowerCase()}`;
    return `<span class="${cls}">${this.escapeHtml(label)}</span>`;
  },

  formatFileSize(bytes) {
    const n = Number(bytes) || 0;
    if (n < 1024) return `${n} Б`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} КБ`;
    return `${(n / (1024 * 1024)).toFixed(1)} МБ`;
  },

  toast(message, type) {
    let el = document.getElementById("admin-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "admin-toast";
      el.className = "admin-toast";
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.className = `admin-toast admin-toast--${type || "ok"} is-visible`;
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove("is-visible"), 2800);
  },

  confirmAction(message) {
    return window.confirm(message);
  },

  readForm(form) {
    const data = {};
    if (!form) return data;
    new FormData(form).forEach((val, key) => {
      data[key] = val.toString();
    });
    form.querySelectorAll("input, textarea, select").forEach((el) => {
      if (!el.name) return;
      if (el.type === "checkbox") {
        data[el.name] = el.checked;
      } else if (el.type === "radio") {
        if (el.checked) data[el.name] = el.value;
      } else if (el.tagName === "SELECT" || el.type !== "checkbox") {
        data[el.name] = el.value;
      }
    });
    return data;
  },

  isPublishedChecked(val, defaultChecked) {
    if (val == null) return !!defaultChecked;
    return val.published === true;
  },

  scrollToForm(formEl) {
    if (formEl) formEl.scrollIntoView({ behavior: "smooth", block: "start" });
  },

  emptyTable(colspan, text) {
    return `<tr><td colspan="${colspan}" class="admin-table-empty">${this.escapeHtml(text)}</td></tr>`;
  },
};
