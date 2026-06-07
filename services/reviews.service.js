window.ReviewsService = {
  get provider() {
    return window.MalsuProvider || window.LocalProvider;
  },

  getAll(includeHidden) {
    return this.provider.getReviews(includeHidden);
  },

  getPlaceholder() {
    return window.MalsuProvider.getSettingsRaw?.()?.reviewsPlaceholder
      || window.MalsuData?.reviewsPlaceholder
      || "";
  },

  getById(id) {
    return this.getAll(true).find((r) => r.id === id) || null;
  },

  save(review) {
    const list = this.getAll(true);
    const idx = list.findIndex((r) => r.id === review.id);
    if (idx === -1) list.push(review);
    else list[idx] = { ...list[idx], ...review };
    this.provider.saveReviews(list);
    return review;
  },

  create(data) {
    const review = {
      id: data.id || crypto.randomUUID?.() || `review-${Date.now()}`,
      clientName: data.clientName || "",
      songTitle: data.songTitle || "",
      text: data.text || "",
      clientPhoto: data.clientPhoto || "",
      reviewImage: data.reviewImage || "",
      published: data.published === true,
    };
    return this.save(review);
  },

  delete(id) {
    this.provider.saveReviews(this.getAll(true).filter((r) => r.id !== id));
    return true;
  },
};
