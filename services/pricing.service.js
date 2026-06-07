window.PricingService = {
  get provider() {
    return window.MalsuProvider || window.LocalProvider;
  },

  getAll() {
    return this.provider.getPricing();
  },

  save(pricing) {
    return this.provider.savePricing({ ...this.getAll(), ...pricing });
  },
};
