/**
 * Единое локальное хранилище админки: malsu-admin-data
 * SUPABASE: заменить на SupabaseProvider без изменения сервисов.
 */
window.AdminDataStore = {
  KEY: "malsu-admin-data",
  LEGACY_ORDERS_KEY: "malsu_orders",

  _readRaw() {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  _write(data) {
    data.updatedAt = new Date().toISOString();
    localStorage.setItem(this.KEY, JSON.stringify(data));
    return data;
  },

  _migrateLegacyOrders(existingOrders) {
    if (window.OrdersStore) {
      const fromStore = OrdersStore._readRaw?.() || [];
      if (fromStore.length) {
        return fromStore.map((o) => window.enrichOrder?.(o) || o);
      }
    }
    try {
      const legacy = JSON.parse(localStorage.getItem(this.LEGACY_ORDERS_KEY) || "[]");
      if (!legacy.length) return existingOrders;
      const ids = new Set(existingOrders.map((o) => o.id));
      const merged = [...existingOrders];
      legacy.forEach((o) => {
        if (!ids.has(o.id)) merged.push(window.enrichOrder?.(o) || o);
      });
      localStorage.removeItem(this.LEGACY_ORDERS_KEY);
      if (window.OrdersStore) OrdersStore.replaceAll(merged);
      return merged;
    } catch {
      return existingOrders;
    }
  },

  _seedFromStatic() {
    const md = window.MalsuData || {};
    const albums = (md.albums || []).map((a) => ({
      ...a,
      description: a.description || "",
      releaseDate: a.releaseDate || "",
      published: a.published !== false,
    }));
    const tracks = (md.tracks || []).map((t, i) => ({
      ...t,
      category: t.category || "",
      sortOrder: t.sortOrder ?? i + 1,
      published: t.published !== false,
    }));
    return {
      _version: 1,
      orders: this._migrateLegacyOrders([]),
      albums,
      tracks,
      reviews: [...(md.reviews || [])],
      faq: [...(md.faq || [])],
      pricing: { ...(md.pricing || {}) },
      settings: {
        site: { ...(md.site || {}) },
        contacts: { ...(md.contacts || {}) },
        team: [...(md.team || [])],
        whyChoose: [...(md.whyChoose || [])],
        reviewsPlaceholder: md.reviewsPlaceholder || "",
        adminAuth: {
          login: "admin",
          password: "admin123",
        },
      },
    };
  },

  _migrateWhyChooseIcons(existing) {
    const staticItems = window.MalsuDataPart?.whyChoose || window.MalsuData?.whyChoose || [];
    if (!existing.length || !staticItems.length) return existing.length ? existing : staticItems;
    return existing.map((item) => {
      const ref = staticItems.find((s) => s.id === item.id);
      return ref?.iconSrc ? { ...item, iconSrc: ref.iconSrc } : item;
    });
  },

  ensure() {
    let data = this._readRaw();
    if (!data || !data._version) {
      data = this._seedFromStatic();
      data = this._write(data);
    } else {
      data.orders = this._migrateLegacyOrders(data.orders || []);
      if (!data.settings?.adminAuth) {
        data.settings = {
          ...data.settings,
          adminAuth: { login: "admin", password: "admin123" },
        };
      }
      data.settings.whyChoose = this._migrateWhyChooseIcons(data.settings?.whyChoose || []);
      this._write(data);
    }
    if (window.OrdersStore) {
      const orders = OrdersStore.getAll();
      if (orders.length && (!data.orders || !data.orders.length)) {
        data.orders = orders;
        this._write(data);
      }
    }
    return data;
  },

  get() {
    return this.ensure();
  },

  getSection(key) {
    return this.get()[key];
  },

  setSection(key, value) {
    const data = this.get();
    data[key] = value;
    return this._write(data);
  },

  replaceAll(payload) {
    const next = {
      _version: payload._version || 1,
      orders: (payload.orders || []).map((o) => window.enrichOrder?.(o) || o),
      albums: payload.albums || [],
      tracks: payload.tracks || [],
      reviews: payload.reviews || [],
      faq: payload.faq || [],
      pricing: payload.pricing || {},
      settings: payload.settings || {},
    };
    if (window.OrdersStore) OrdersStore.replaceAll(next.orders);
    return this._write(next);
  },
};
