window.FaqService = {
  get provider() {
    return window.MalsuProvider || window.LocalProvider;
  },

  getAll() {
    return [...this.provider.getFaq()].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  },

  getById(id) {
    return this.getAll().find((f) => f.id === id) || null;
  },

  save(item) {
    const list = this.getAll();
    const idx = list.findIndex((f) => f.id === item.id);
    if (idx === -1) list.push(item);
    else list[idx] = { ...list[idx], ...item };
    this.provider.saveFaq(list);
    return item;
  },

  create(data) {
    const item = {
      id: data.id || crypto.randomUUID?.() || `faq-${Date.now()}`,
      question: data.question || "",
      answer: data.answer || "",
      sortOrder: Number(data.sortOrder) || this.getAll().length + 1,
    };
    return this.save(item);
  },

  delete(id) {
    this.provider.saveFaq(this.getAll().filter((f) => f.id !== id));
    return true;
  },

  reorder(ids) {
    const map = new Map(this.getAll().map((f) => [f.id, f]));
    const list = ids.map((id, i) => ({ ...map.get(id), sortOrder: i + 1 })).filter(Boolean);
    this.provider.saveFaq(list);
    return list;
  },
};
