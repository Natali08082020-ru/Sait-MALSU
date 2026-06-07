window.TracksService = {
  get provider() {
    return window.MalsuProvider || window.LocalProvider;
  },

  getAll(includeHidden) {
    return this.provider.getTracks(includeHidden);
  },

  getById(id) {
    return this.getAll(true).find((t) => t.id === id) || null;
  },

  save(track) {
    const list = this.getAll(true);
    const idx = list.findIndex((t) => t.id === track.id);
    if (idx === -1) list.push(track);
    else list[idx] = { ...list[idx], ...track };
    this.provider.saveTracks(list);
    return track;
  },

  create(data) {
    const track = {
      id: data.id || crypto.randomUUID?.() || `track-${Date.now()}`,
      title: data.title || "",
      description: data.description || "",
      category: data.category || "",
      sortOrder: Number(data.sortOrder) || this.getAll(true).length + 1,
      file: data.file || "",
      published: data.published !== false,
    };
    return this.save(track);
  },

  delete(id) {
    const list = this.getAll(true).filter((t) => t.id !== id);
    this.provider.saveTracks(list);
    return true;
  },
};
