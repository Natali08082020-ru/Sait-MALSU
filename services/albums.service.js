window.AlbumsService = {
  get provider() {
    return window.MalsuProvider || window.LocalProvider;
  },

  getAll(includeHidden) {
    return this.provider.getAlbums(includeHidden);
  },

  getById(id) {
    return this.getAll(true).find((a) => a.id === id) || null;
  },

  save(album) {
    const list = this.getAll(true);
    const idx = list.findIndex((a) => a.id === album.id);
    if (idx === -1) list.push(album);
    else list[idx] = { ...list[idx], ...album };
    this.provider.saveAlbums(list);
    return album;
  },

  create(data) {
    const album = {
      id: data.id || crypto.randomUUID?.() || `album-${Date.now()}`,
      title: data.title || "",
      description: data.description || "",
      cover: data.cover || "",
      bandLink: data.bandLink || data.link || "",
      releaseDate: data.releaseDate || "",
      status: data.status || "draft",
      side: data.side || "",
      tags: data.tags || [],
      published: data.published !== false,
    };
    return this.save(album);
  },

  delete(id) {
    const list = this.getAll(true).filter((a) => a.id !== id);
    this.provider.saveAlbums(list);
    return true;
  },
};
