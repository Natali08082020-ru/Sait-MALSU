/**
 * Локальный провайдер данных через AdminDataStore (malsu-admin-data).
 * SUPABASE: заменить на SupabaseProvider.
 */
window.LocalProvider = {
  name: "local",

  _store() {
    if (!window.AdminDataStore) return null;
    AdminDataStore.ensure();
    return AdminDataStore;
  },

  _saveSection(key, value) {
    const store = this._store();
    if (!store) {
      console.error("[MalSu] AdminDataStore недоступен — изменения не сохранены");
      return null;
    }
    return store.setSection(key, value);
  },

  getAlbums(includeHidden) {
    const list = this._store()?.getSection("albums") || window.MalsuData?.albums || [];
    if (includeHidden) return list;
    return list.filter((a) => a.published !== false);
  },

  saveAlbums(albums) {
    return this._saveSection("albums", albums);
  },

  getTracks(includeHidden) {
    const list = this._store()?.getSection("tracks") || window.MalsuData?.tracks || [];
    const sorted = [...list].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    if (includeHidden) return sorted;
    return sorted.filter((t) => t.published !== false);
  },

  saveTracks(tracks) {
    return this._saveSection("tracks", tracks);
  },

  getFaq() {
    return this._store()?.getSection("faq") || window.MalsuData?.faq || [];
  },

  saveFaq(faq) {
    return this._saveSection("faq", faq);
  },

  getReviews(includeHidden) {
    const list = this._store()?.getSection("reviews") || window.MalsuData?.reviews || [];
    if (includeHidden) return list;
    return list.filter((r) => r.published !== false);
  },

  saveReviews(reviews) {
    return this._saveSection("reviews", reviews);
  },

  getNews() {
    return (window.MalsuData?.news || []).filter((n) => n.published);
  },

  getPricing() {
    return this._store()?.getSection("pricing") || window.MalsuData?.pricing || {};
  },

  savePricing(pricing) {
    return this._saveSection("pricing", pricing);
  },

  getSettingsRaw() {
    const stored = this._store()?.getSection("settings");
    if (stored) return stored;
    return {
      site: window.MalsuData?.site || {},
      contacts: window.MalsuData?.contacts || {},
      team: window.MalsuData?.team || [],
      whyChoose: window.MalsuData?.whyChoose || [],
      reviewsPlaceholder: window.MalsuData?.reviewsPlaceholder || "",
    };
  },

  saveSettings(settings) {
    const store = this._store();
    if (!store) return null;
    const data = store.get();
    data.settings = { ...data.settings, ...settings };
    return store._write(data);
  },

  getSettings() {
    const s = this.getSettingsRaw();
    const pricing = this.getPricing();
    const site = s.site || {};
    return {
      site,
      pricing,
      contacts: s.contacts || {},
      team: s.team || [],
      whyChoose: s.whyChoose || [],
      orderCategories: pricing.orderCategories || [],
      budgetOptions: pricing.budgetOptions || [],
      ctaFollowup: site.ctaFollowup || "",
      thankYou: site.thankYou || {},
      reviewsPlaceholder: s.reviewsPlaceholder || "",
    };
  },

  getOrders() {
    if (window.OrdersStore) return OrdersStore.getAll();
    return (this._store()?.getSection("orders") || []).map((o) => window.enrichOrder(o));
  },

  saveOrder(order) {
    if (window.OrdersStore) return OrdersStore.append(order);
    const enriched = window.enrichOrder(order);
    const orders = this.getOrders();
    orders.push(enriched);
    this._saveOrders(orders);
    return enriched;
  },

  getOrderByNumber(orderNumber) {
    if (window.OrdersStore) return OrdersStore.findByNumber(orderNumber);
    const found = this.getOrders().find((o) => o.orderNumber === orderNumber);
    return found || null;
  },

  getOrderById(id) {
    if (window.OrdersStore) return OrdersStore.findById(id);
    const found = this.getOrders().find((o) => o.id === id);
    return found || null;
  },

  updateOrder(id, patch) {
    if (window.OrdersStore) return OrdersStore.updateById(id, patch);
    const orders = this.getOrders();
    const idx = orders.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    const merged = window.mergeOrderPatch
      ? window.mergeOrderPatch(orders[idx], patch)
      : { ...orders[idx], ...patch };
    orders[idx] = window.enrichOrder(merged);
    this._saveOrders(orders);
    return orders[idx];
  },

  deleteOrder(id) {
    if (window.OrdersStore) return OrdersStore.deleteById(id);
    const orders = this.getOrders();
    const next = orders.filter((o) => o.id !== id);
    if (next.length === orders.length) return false;
    this._saveOrders(next);
    return true;
  },

  _saveOrders(orders) {
    if (window.OrdersStore) {
      OrdersStore.replaceAll(orders);
      return orders;
    }
    return this._store().setSection("orders", orders);
  },

  exportAll() {
    const data = this._store()?.get() || {};
    const exportPayload = {
      orders: this.getOrders(),
      albums: data.albums || this.getAlbums(true),
      tracks: data.tracks || this.getTracks(true),
      reviews: data.reviews || this.getReviews(true),
      faq: data.faq || this.getFaq(),
      pricing: data.pricing || this.getPricing(),
      settings: data.settings || this.getSettingsRaw(),
    };
    if (window.LocalOrderFilesProvider) {
      exportPayload.orderFiles = LocalOrderFilesProvider._readAll?.() || {};
    }
    return exportPayload;
  },

  importAll(payload) {
    if (payload.orders) this._saveOrders(payload.orders);
    if (payload.orderFiles && window.LocalOrderFilesProvider?._writeAll) {
      LocalOrderFilesProvider._writeAll(payload.orderFiles);
    }
    const store = this._store();
    if (!store) return payload;
    return store.replaceAll({
      ...payload,
      orders: payload.orders || [],
    });
  },
};

/** Активный провайдер для сервисного слоя */
window.MalsuProvider = window.LocalProvider;
