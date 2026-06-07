/**
 * Сервис файлов заказа — абстракция над провайдером.
 * SUPABASE: OrderFilesProvider → SupabaseOrderFilesProvider.
 */
window.OrderFilesService = {
  get provider() {
    return window.OrderFilesProvider || window.LocalOrderFilesProvider;
  },

  getAllowedExtensions() {
    return this.provider.ALLOWED_EXT || [];
  },

  list(orderId) {
    return this.provider.getForOrder(orderId).map(({ dataUrl, ...meta }) => meta);
  },

  async upload(orderId, file) {
    const meta = await this.provider.upload(orderId, file);
    if (window.OrdersService?.logActivity) {
      OrdersService.logActivity(orderId, OrderActivityTypes.FILE_ADDED, meta.fileName);
    }
    return meta;
  },

  delete(orderId, fileId) {
    const item = this.provider.getById(fileId);
    if (!item || item.orderId !== orderId) return false;
    const ok = this.provider.delete(fileId);
    if (ok && window.OrdersService?.logActivity) {
      OrdersService.logActivity(orderId, OrderActivityTypes.FILE_REMOVED, item.fileName);
    }
    return ok;
  },

  download(fileId) {
    const item = this.provider.getById(fileId);
    if (!item?.dataUrl) return false;
    const a = document.createElement("a");
    a.href = item.dataUrl;
    a.download = item.fileName;
    a.click();
    return true;
  },
};
