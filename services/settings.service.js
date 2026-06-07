window.SettingsService = {
  get provider() {
    return window.MalsuProvider || window.LocalProvider;
  },

  getAll() {
    return this.provider.getSettings();
  },

  getRaw() {
    return this.provider.getSettingsRaw?.() || {};
  },

  save(partial) {
    return this.provider.saveSettings(partial);
  },

  getSite() {
    return this.getAll().site;
  },

  saveSite(sitePatch) {
    const raw = this.getRaw();
    return this.save({ site: { ...raw.site, ...sitePatch } });
  },

  getPricing() {
    return this.getAll().pricing;
  },

  getContacts() {
    return this.getAll().contacts;
  },

  getWhyChoose() {
    return this.getAll().whyChoose;
  },

  getOrderCategories() {
    return this.getAll().orderCategories;
  },

  getBudgetOptions() {
    return this.getAll().budgetOptions;
  },

  getThankYou() {
    return this.getAll().thankYou;
  },

  getCtaFollowup() {
    return this.getAll().ctaFollowup;
  },

  getSocialLinks() {
    return this.getSite().socialLinks || [];
  },

  getAdminAuth() {
    const raw = this.getRaw();
    const auth = raw.adminAuth || {};
    return {
      login: auth.login || AdminAuth?.DEFAULT_CREDENTIALS?.login || "admin",
      password: auth.password || AdminAuth?.DEFAULT_CREDENTIALS?.password || "admin123",
    };
  },

  saveAdminAuth(authPatch) {
    const raw = this.getRaw();
    return this.save({
      adminAuth: { ...(raw.adminAuth || {}), ...authPatch },
    });
  },
};
