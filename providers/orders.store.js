/**
 * Хранилище заказов CRM — ключ localStorage: malsu-orders
 * SUPABASE: заменить реализацию, интерфейс OrdersStore сохранить.
 */
window.OrdersStore = {
  KEY: "malsu-orders",

  _migrated: false,

  _readRaw() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  _write(orders) {
    localStorage.setItem(this.KEY, JSON.stringify(orders));
    this._syncAdminData(orders);
    return orders;
  },

  _syncAdminData(orders) {
    if (!window.AdminDataStore) return;
    try {
      const data = AdminDataStore._readRaw?.() || AdminDataStore.get?.();
      if (!data) return;
      data.orders = orders;
      if (AdminDataStore._write) AdminDataStore._write(data);
    } catch {
      /* admin-data необязателен на главной */
    }
  },

  _migrateLegacy() {
    if (this._migrated) return;
    this._migrated = true;

    let orders = this._readRaw();
    if (orders.length) return;

    const sources = [
      () => {
        try {
          const admin = JSON.parse(localStorage.getItem("malsu-admin-data") || "null");
          return admin?.orders || [];
        } catch {
          return [];
        }
      },
      () => {
        try {
          return JSON.parse(localStorage.getItem("malsu_orders") || "[]");
        } catch {
          return [];
        }
      },
    ];

    for (const load of sources) {
      const legacy = load();
      if (legacy.length) {
        orders = legacy;
        break;
      }
    }

    if (orders.length) {
      this._write(orders.map((o) => window.enrichOrder?.(o) || o));
    }
  },

  getAll() {
    this._migrateLegacy();
    return this._readRaw().map((o) => window.enrichOrder?.(o) || o);
  },

  append(order) {
    const enriched = window.enrichOrder?.(order) || order;
    const orders = this.getAll();
    orders.push(enriched);
    this._write(orders);
    return enriched;
  },

  replaceAll(orders) {
    const list = (orders || []).map((o) => window.enrichOrder?.(o) || o);
    return this._write(list);
  },

  updateById(id, patch) {
    const orders = this.getAll();
    const idx = orders.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    const merged = window.mergeOrderPatch
      ? window.mergeOrderPatch(orders[idx], patch)
      : { ...orders[idx], ...patch, updatedAt: new Date().toISOString() };
    orders[idx] = window.enrichOrder(merged);
    this._write(orders);
    return orders[idx];
  },

  deleteById(id) {
    const orders = this.getAll();
    const next = orders.filter((o) => o.id !== id);
    if (next.length === orders.length) return false;
    this._write(next);
    return true;
  },

  findById(id) {
    return this.getAll().find((o) => o.id === id) || null;
  },

  findByNumber(orderNumber) {
    return this.getAll().find((o) => o.orderNumber === orderNumber) || null;
  },
};
