/**

 * Сервис заказов — CRM-модель MalSu.

 */

window.OrdersService = {

  get provider() {

    return window.MalsuProvider || window.LocalProvider;

  },



  buildFromForm(formData) {

    return {

      name: (formData.get("name") || "").toString().trim(),

      contact: (formData.get("contact") || "").toString().trim(),

      category: (formData.get("category") || "").toString().trim(),

      budget: (formData.get("budget") || "").toString().trim(),

      story: (formData.get("story") || "").toString().trim(),

      deadline: (formData.get("deadline") || "").toString().trim(),

    };

  },



  create(formData) {

    const raw = this.buildFromForm(formData);

    const order = window.createOrderFromForm(raw);

    return this.provider.saveOrder(order);

  },



  getAll() {

    return this.provider.getOrders();

  },



  getById(id) {

    return this.provider.getOrderById(id);

  },



  getByNumber(orderNumber) {

    return this.provider.getOrderByNumber(orderNumber);

  },



  save(order) {

    const existing = this.getById(order.id);

    if (existing) return this.update(order.id, order);

    return this.provider.saveOrder(order);

  },



  logActivity(orderId, action, details) {

    const order = this.getById(orderId);

    if (!order) return null;

    const log = [...(order.activityLog || []), createActivityEntry(action, details)];

    return this.provider.updateOrder(orderId, { activityLog: log });

  },



  update(id, patch, options) {

    const existing = this.getById(id);

    if (!existing) return null;



    const skipLog = options?.skipActivity;

    let activityPatch = {};



    if (!skipLog) {

      const log = [...(existing.activityLog || [])];



      if (patch.status !== undefined && patch.status !== existing.status) {

        log.push(

          createActivityEntry(

            OrderActivityTypes.STATUS_CHANGED,

            getOrderStatusLabel(patch.status)

          )

        );

      }

      if (patch.paymentStatus !== undefined && patch.paymentStatus !== existing.paymentStatus) {

        log.push(

          createActivityEntry(

            OrderActivityTypes.PAYMENT_CHANGED,

            getPaymentStatusLabel(patch.paymentStatus)

          )

        );

      }

      if (patch.creative?.finalLyrics !== undefined && patch.creative.finalLyrics !== existing.creative?.finalLyrics) {

        log.push(createActivityEntry(OrderActivityTypes.LYRICS_CHANGED));

      }



      if (log.length > (existing.activityLog || []).length) {

        activityPatch = { activityLog: log };

      } else if (options?.logAction) {

        activityPatch = {

          activityLog: [...log, createActivityEntry(options.logAction, options.logDetails || "")],

        };

      }

    }



    return this.provider.updateOrder(id, { ...patch, ...activityPatch });

  },



  delete(id) {

    if (window.OrderFilesProvider?.deleteForOrder) {

      OrderFilesProvider.deleteForOrder(id);

    }

    return this.provider.deleteOrder(id);

  },



  addInternalNote(orderId, text) {

    const order = this.getById(orderId);

    if (!order) return null;

    const note = {

      id: crypto.randomUUID?.() || `note-${Date.now()}`,

      date: new Date().toISOString(),

      text,

    };

    const notes = [...(order.internalNotes || []), note];

    const log = [...(order.activityLog || []), createActivityEntry(OrderActivityTypes.NOTE_ADDED)];

    return this.update(orderId, { internalNotes: notes, activityLog: log }, { skipActivity: true });

  },



  deleteInternalNote(orderId, noteId) {

    const order = this.getById(orderId);

    if (!order) return null;

    const notes = (order.internalNotes || []).filter((n) => n.id !== noteId);

    const log = [...(order.activityLog || []), createActivityEntry(OrderActivityTypes.NOTE_REMOVED)];

    return this.update(orderId, { internalNotes: notes, activityLog: log }, { skipActivity: true });

  },



  saveFinalLyrics(orderId, finalLyrics) {

    const order = this.getById(orderId);

    if (!order) return null;

    return this.update(orderId, {

      creative: { ...(order.creative || {}), finalLyrics },

    });

  },



  getRecent(limit) {

    return [...this.getAll()]

      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

      .slice(0, limit || 5);

  },



  getWithDeadlines() {

    return this.getAll()

      .filter((o) => o.deadline && o.status !== OrderStatus.ARCHIVED && o.status !== OrderStatus.DONE)

      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  },



  countByStatuses(statuses) {

    return this.getAll().filter((o) => statuses.includes(o.status)).length;

  },



  searchAndFilter({ query, status, sortBy, sortDir }) {

    let list = [...this.getAll()];

    const q = (query || "").trim().toLowerCase();



    if (q) {

      list = list.filter(

        (o) =>

          (o.name || "").toLowerCase().includes(q) ||

          (o.orderNumber || "").toLowerCase().includes(q)

      );

    }



    if (status && status !== "ALL") {

      list = list.filter((o) => o.status === status);

    }



    const dir = sortDir === "asc" ? 1 : -1;

    if (sortBy === "deadline") {

      list.sort((a, b) => {

        const da = (a.deadline || "").toLowerCase();

        const db = (b.deadline || "").toLowerCase();

        if (!da && !db) return 0;

        if (!da) return 1;

        if (!db) return -1;

        return da.localeCompare(db, "ru") * dir;

      });

    } else {

      list.sort((a, b) => (new Date(a.createdAt) - new Date(b.createdAt)) * dir);

    }



    return list;

  },

};

