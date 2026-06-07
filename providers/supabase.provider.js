/**
 * Каркас Supabase-провайдера.
 * SUPABASE: реализовать методы после подключения базы.
 */
window.SupabaseProvider = {
  name: "supabase",
  _client: null,

  init(/* supabaseUrl, supabaseKey */) {
    throw new Error("SupabaseProvider: подключение не настроено");
  },

  getAlbums() {
    return this._notImplemented("getAlbums");
  },

  getTracks() {
    return this._notImplemented("getTracks");
  },

  getFaq() {
    return this._notImplemented("getFaq");
  },

  getReviews() {
    return this._notImplemented("getReviews");
  },

  getNews() {
    return this._notImplemented("getNews");
  },

  getSettings() {
    return this._notImplemented("getSettings");
  },

  getOrders() {
    return this._notImplemented("getOrders");
  },

  saveOrder(/* order */) {
    return this._notImplemented("saveOrder");
  },

  getOrderByNumber(/* orderNumber */) {
    return this._notImplemented("getOrderByNumber");
  },

  getOrderById(/* id */) {
    return this._notImplemented("getOrderById");
  },

  updateOrder(/* id, patch */) {
    return this._notImplemented("updateOrder");
  },

  deleteOrder(/* id */) {
    return this._notImplemented("deleteOrder");
  },

  _notImplemented(method) {
    console.warn(`SupabaseProvider.${method} — не реализовано`);
    return method.startsWith("get") ? [] : null;
  },
};

/** Активный провайдер — переключить на SupabaseProvider после интеграции */
window.MalsuProvider = window.LocalProvider;
