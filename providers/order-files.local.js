/**
 * Локальное хранилище файлов заказов — ключ malsu-order-files.
 * SUPABASE: заменить на SupabaseOrderFilesProvider (тот же интерфейс).
 */
window.LocalOrderFilesProvider = {
  KEY: "malsu-order-files",
  ALLOWED_EXT: ["mp3", "wav", "pdf", "doc", "docx", "txt", "jpg", "jpeg", "png"],

  _readAll() {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  _writeAll(data) {
    localStorage.setItem(this.KEY, JSON.stringify(data));
    return data;
  },

  getExtension(fileName) {
    const parts = String(fileName || "").split(".");
    return parts.length > 1 ? parts.pop().toLowerCase() : "";
  },

  isAllowed(fileName) {
    return this.ALLOWED_EXT.includes(this.getExtension(fileName));
  },

  getMimeType(fileName) {
    const ext = this.getExtension(fileName);
    const map = {
      mp3: "audio/mpeg",
      wav: "audio/wav",
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      txt: "text/plain",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
    };
    return map[ext] || "application/octet-stream";
  },

  getForOrder(orderId) {
    const all = this._readAll();
    return Object.values(all).filter((f) => f.orderId === orderId);
  },

  getById(fileId) {
    return this._readAll()[fileId] || null;
  },

  async upload(orderId, file) {
    if (!file || !this.isAllowed(file.name)) {
      throw new Error("Недопустимый тип файла");
    }
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Не удалось прочитать файл"));
      reader.readAsDataURL(file);
    });
    const id = crypto.randomUUID?.() || `file-${Date.now()}`;
    const meta = {
      id,
      orderId,
      fileName: file.name,
      fileSize: file.size,
      uploadDate: new Date().toISOString(),
      type: this.getMimeType(file.name),
      dataUrl,
    };
    const all = this._readAll();
    all[id] = meta;
    this._writeAll(all);
    const { dataUrl: _d, ...publicMeta } = meta;
    return publicMeta;
  },

  delete(fileId) {
    const all = this._readAll();
    const item = all[fileId];
    if (!item) return false;
    delete all[fileId];
    this._writeAll(all);
    return true;
  },

  deleteForOrder(orderId) {
    const all = this._readAll();
    let changed = false;
    Object.keys(all).forEach((id) => {
      if (all[id].orderId === orderId) {
        delete all[id];
        changed = true;
      }
    });
    if (changed) this._writeAll(all);
    return changed;
  },

  getDownloadUrl(fileId) {
    return this.getById(fileId)?.dataUrl || null;
  },
};

/** Активный провайдер файлов — SUPABASE: подменить здесь */
window.OrderFilesProvider = window.LocalOrderFilesProvider;
