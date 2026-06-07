/**
 * Страницы админ-панели MalSu — CRM и управление контентом.
 * Все операции через сервисный слой (без прямого localStorage).
 */
window.AdminApp = {
  ui: window.AdminUI,

  navMap: {
    dashboard: "index.html",
    orders: "orders.html",
    orderDetail: "orders.html",
    albums: "albums.html",
    tracks: "tracks.html",
    reviews: "reviews.html",
    faq: "faq.html",
    pricing: "pricing.html",
    settings: "settings.html",
  },

  init(pageKey, navPage) {
    if (window.AdminAuth && !AdminAuth.requireAuth()) return;
    AdminShell.init(navPage || this.navMap[pageKey] || "index.html");
    if (window.OrdersStore) OrdersStore.getAll();
    if (window.AdminDataStore) AdminDataStore.ensure();
    const fn = this.pages[pageKey];
    if (fn) fn.call(this);
  },

  _saveOrderFromForm(id, form, options) {
    const payload = window.collectOrderFormData(form);
    const saved = OrdersService.update(id, payload);
    if (!saved) {
      AdminUI.toast("Не удалось сохранить заказ", "error");
      return null;
    }
    if (!options?.quiet) AdminUI.toast("Заказ сохранён");
    else AdminUI.toast("Статус сохранён");
    return saved;
  },

  pages: {
    dashboard() {
      const orders = OrdersService.getAll();
      const stats = [
        { label: "Заказы", value: orders.length },
        { label: "Альбомы", value: AlbumsService.getAll(true).length },
        { label: "Треки", value: TracksService.getAll(true).length },
        { label: "Отзывы", value: ReviewsService.getAll(true).length },
      ];
      document.getElementById("admin-stats").innerHTML = stats
        .map(
          (s) =>
            `<div class="admin-stat"><span class="admin-stat-value">${s.value}</span><span class="admin-stat-label">${AdminUI.escapeHtml(s.label)}</span></div>`
        )
        .join("");

      const inWork = OrdersService.countByStatuses([
        OrderStatus.IN_PROGRESS,
        OrderStatus.APPROVAL,
      ]);
      document.getElementById("admin-in-work").textContent = String(inWork);

      const recent = OrdersService.getRecent(5);
      const recentEl = document.getElementById("admin-recent-orders");
      recentEl.innerHTML =
        recent.length === 0
          ? AdminUI.emptyTable(6, "Заявок пока нет")
          : recent
              .map(
                (o) => `<tr>
          <td><a href="order.html?id=${encodeURIComponent(o.id)}">${AdminUI.escapeHtml(o.orderNumber)}</a></td>
          <td>${AdminUI.formatDate(o.createdAt)}</td>
          <td>${AdminUI.escapeHtml(o.name)}</td>
          <td>${AdminUI.escapeHtml(o.category || "—")}</td>
          <td>${AdminUI.statusBadge(o.status)}</td>
          <td>${AdminUI.escapeHtml(o.deadline || "—")}</td>
        </tr>`
              )
              .join("");

      const deadlines = OrdersService.getWithDeadlines().slice(0, 8);
      const dlEl = document.getElementById("admin-deadlines");
      dlEl.innerHTML =
        deadlines.length === 0
          ? AdminUI.emptyTable(4, "Нет заказов с указанным дедлайном")
          : deadlines
              .map(
                (o) => `<tr>
          <td><a href="order.html?id=${encodeURIComponent(o.id)}">${AdminUI.escapeHtml(o.orderNumber)}</a></td>
          <td>${AdminUI.escapeHtml(o.name)}</td>
          <td>${AdminUI.escapeHtml(o.deadline)}</td>
          <td>${AdminUI.statusBadge(o.status)}</td>
        </tr>`
              )
              .join("");
    },

    orders() {
      const root = document.getElementById("admin-orders-root");
      let query = "";
      let statusFilter = "ALL";
      let sortBy = "date";
      let sortDir = "desc";

      const render = () => {
        const list = OrdersService.searchAndFilter({
          query,
          status: statusFilter,
          sortBy,
          sortDir,
        });
        const statusOptions = [
          `<option value="ALL">Все статусы</option>`,
          ...Object.entries(OrderStatusLabels).map(
            ([val, label]) =>
              `<option value="${val}" ${statusFilter === val ? "selected" : ""}>${AdminUI.escapeHtml(label)}</option>`
          ),
        ].join("");

        root.innerHTML = `
          <div class="admin-toolbar admin-filters">
            <input type="search" id="orders-search" class="admin-input" placeholder="Поиск по клиенту или номеру" value="${AdminUI.escapeHtml(query)}">
            <select id="orders-status" class="admin-input">${statusOptions}</select>
            <select id="orders-sort" class="admin-input">
              <option value="date-desc" ${sortBy === "date" && sortDir === "desc" ? "selected" : ""}>Дата ↓</option>
              <option value="date-asc" ${sortBy === "date" && sortDir === "asc" ? "selected" : ""}>Дата ↑</option>
              <option value="deadline-asc" ${sortBy === "deadline" && sortDir === "asc" ? "selected" : ""}>Дедлайн ↑</option>
              <option value="deadline-desc" ${sortBy === "deadline" && sortDir === "desc" ? "selected" : ""}>Дедлайн ↓</option>
            </select>
            <p class="admin-toolbar-meta">Найдено: ${list.length}</p>
          </div>
          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Номер</th><th>Дата</th><th>Клиент</th><th>Категория</th>
                  <th>Бюджет</th><th>Статус</th><th>Оплата</th><th>Дедлайн</th><th></th>
                </tr>
              </thead>
              <tbody>
                ${
                  list.length
                    ? list
                        .map(
                          (o) => `<tr>
                    <td>${AdminUI.escapeHtml(o.orderNumber)}</td>
                    <td>${AdminUI.formatDate(o.createdAt)}</td>
                    <td>${AdminUI.escapeHtml(o.name)}</td>
                    <td>${AdminUI.escapeHtml(o.category || "—")}</td>
                    <td>${AdminUI.escapeHtml(o.budget || "—")}</td>
                    <td>${AdminUI.statusBadge(o.status)}</td>
                    <td>${AdminUI.paymentBadge(o.paymentStatus)}</td>
                    <td>${AdminUI.escapeHtml(o.deadline || "—")}</td>
                    <td class="admin-actions">
                      <a class="admin-btn admin-btn--sm" href="order.html?id=${encodeURIComponent(o.id)}">Открыть</a>
                      <button type="button" class="admin-btn admin-btn--sm admin-btn--danger" data-delete="${AdminUI.escapeHtml(o.id)}">Удалить</button>
                    </td>
                  </tr>`
                        )
                        .join("")
                    : AdminUI.emptyTable(9, "Заказов не найдено")
                }
              </tbody>
            </table>
          </div>`;

        root.querySelector("#orders-search")?.addEventListener("input", (e) => {
          query = e.target.value;
          render();
        });
        root.querySelector("#orders-status")?.addEventListener("change", (e) => {
          statusFilter = e.target.value;
          render();
        });
        root.querySelector("#orders-sort")?.addEventListener("change", (e) => {
          const [by, dir] = e.target.value.split("-");
          sortBy = by;
          sortDir = dir;
          render();
        });
        root.querySelectorAll("[data-delete]").forEach((btn) => {
          btn.addEventListener("click", () => {
            if (!AdminUI.confirmAction("Удалить заказ?")) return;
            OrdersService.delete(btn.dataset.delete);
            AdminUI.toast("Заказ удалён");
            render();
          });
        });
      };
      render();
    },

    orderDetail() {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");
      const root = document.getElementById("admin-order-root");
      if (!id) {
        root.innerHTML = `<p class="admin-error">Не указан ID заказа.</p>`;
        return;
      }

      let order = OrdersService.getById(id);
      if (!order) {
        root.innerHTML = `<p class="admin-error">Заказ не найден.</p>`;
        return;
      }

      const render = () => {
        order = OrdersService.getById(id);
        const projectFiles = OrderFilesService.list(id);

        const statusOptions = Object.entries(OrderStatusLabels)
          .map(
            ([val, label]) =>
              `<option value="${val}" ${order.status === val ? "selected" : ""}>${AdminUI.escapeHtml(label)}</option>`
          )
          .join("");

        const paymentOptions = Object.entries(PaymentStatusLabels)
          .map(
            ([val, label]) =>
              `<option value="${val}" ${order.paymentStatus === val ? "selected" : ""}>${AdminUI.escapeHtml(label)}</option>`
          )
          .join("");

        const stagesHtml = CreativeStages.map(
          (s) => `<label class="admin-check">
          <input type="checkbox" name="stage_${s.key}" ${order.stages?.[s.key] ? "checked" : ""}>
          <span>${AdminUI.escapeHtml(s.label)}</span>
        </label>`
        ).join("");

        const notesHtml = (order.internalNotes || [])
          .slice()
          .reverse()
          .map(
            (n) => `<article class="admin-note">
          <header>${AdminUI.formatDateTime(n.date)}</header>
          <p>${AdminUI.escapeHtml(n.text)}</p>
          <button type="button" class="admin-btn admin-btn--sm admin-btn--danger" data-note-del="${AdminUI.escapeHtml(n.id)}">Удалить</button>
        </article>`
          )
          .join("") || `<p class="admin-muted">Заметок пока нет</p>`;

        const filesHtml = projectFiles.length
          ? `<table class="admin-table admin-files-table">
              <thead><tr><th>Название</th><th>Размер</th><th>Дата загрузки</th><th></th></tr></thead>
              <tbody>${projectFiles
                .map(
                  (f) => `<tr>
                  <td>${AdminUI.escapeHtml(f.fileName)}</td>
                  <td>${AdminUI.formatFileSize(f.fileSize)}</td>
                  <td>${AdminUI.formatDateTime(f.uploadDate)}</td>
                  <td class="admin-actions">
                    <button type="button" class="admin-btn admin-btn--sm" data-file-dl="${AdminUI.escapeHtml(f.id)}">Скачать</button>
                    <button type="button" class="admin-btn admin-btn--sm admin-btn--danger" data-file-del="${AdminUI.escapeHtml(f.id)}">Удалить</button>
                  </td>
                </tr>`
                )
                .join("")}</tbody>
            </table>`
          : `<p class="admin-muted">Файлов пока нет</p>`;

        const activityHtml = (order.activityLog || [])
          .slice()
          .reverse()
          .map(
            (a) => `<li class="admin-activity-item">
              <time>${AdminUI.formatDateTime(a.date)}</time>
              <span>${AdminUI.escapeHtml(formatActivityDetails(a))}</span>
            </li>`
          )
          .join("") || `<li class="admin-muted">История пуста</li>`;

        const allowedExt = OrderFilesService.getAllowedExtensions().join(", ");

        root.innerHTML = `
          <div class="admin-toolbar">
            <a href="orders.html" class="admin-btn admin-btn--ghost">← К списку</a>
            <button type="button" class="admin-btn admin-btn--primary" id="order-save">Сохранить</button>
            <button type="button" class="admin-btn admin-btn--danger" id="order-delete">Удалить</button>
          </div>

          <form id="order-form" class="admin-form-grid">
            <section class="admin-section admin-card">
              <h2>Карточка заказа</h2>
              <div class="admin-field"><label>Номер заказа</label><input value="${AdminUI.escapeHtml(order.orderNumber)}" readonly></div>
              <div class="admin-field"><label>Имя клиента</label><input name="name" value="${AdminUI.escapeHtml(order.name)}" required></div>
              <div class="admin-field"><label>Контакт</label><input name="contact" value="${AdminUI.escapeHtml(order.contact)}"></div>
              <div class="admin-field"><label>Категория</label><input name="category" value="${AdminUI.escapeHtml(order.category || "")}"></div>
              <div class="admin-field"><label>Бюджет</label><input name="budget" value="${AdminUI.escapeHtml(order.budget || "")}"></div>
              <div class="admin-field admin-field--full"><label>История клиента</label><textarea name="story" rows="4">${AdminUI.escapeHtml(order.story || "")}</textarea></div>
              <div class="admin-field"><label>Дата создания</label><input value="${AdminUI.formatDateTime(order.createdAt)}" readonly></div>
              <div class="admin-field"><label>Желаемая дата</label><input name="deadline" value="${AdminUI.escapeHtml(order.deadline || "")}"></div>
              <div class="admin-field"><label>Статус</label><select name="status">${statusOptions}</select></div>
            </section>

            <section class="admin-section admin-card">
              <h2>Оплата</h2>
              <div class="admin-field"><label>Статус оплаты</label><select name="paymentStatus">${paymentOptions}</select></div>
            </section>

            <section class="admin-section admin-card">
              <h2>Работа над песней</h2>
              <div class="admin-field"><label>Название песни</label><input name="creative_songTitle" value="${AdminUI.escapeHtml(order.creative?.songTitle || "")}"></div>
              <div class="admin-field admin-field--full"><label>Основная идея</label><textarea name="creative_mainIdea" rows="2">${AdminUI.escapeHtml(order.creative?.mainIdea || "")}</textarea></div>
              <div class="admin-field"><label>Настроение</label><input name="creative_mood" value="${AdminUI.escapeHtml(order.creative?.mood || "")}"></div>
              <div class="admin-field"><label>Стиль музыки</label><input name="creative_musicStyle" value="${AdminUI.escapeHtml(order.creative?.musicStyle || "")}"></div>
              <div class="admin-field admin-field--full"><label>Ключевые фразы клиента</label><textarea name="creative_keyPhrases" rows="2">${AdminUI.escapeHtml(order.creative?.keyPhrases || "")}</textarea></div>
              <div class="admin-field admin-field--full"><label>Дополнительные пожелания</label><textarea name="creative_additionalWishes" rows="2">${AdminUI.escapeHtml(order.creative?.additionalWishes || "")}</textarea></div>
              <div class="admin-field admin-field--full"><label>Рабочие заметки</label><textarea name="creative_workNotes" rows="3">${AdminUI.escapeHtml(order.creative?.workNotes || "")}</textarea></div>
              <div class="admin-field admin-field--full"><label>Черновик текста песни</label><textarea name="creative_draftLyrics" rows="6" class="admin-textarea-lg">${AdminUI.escapeHtml(order.creative?.draftLyrics || "")}</textarea></div>
            </section>

            <section class="admin-section admin-card admin-field--full">
              <h2>Файлы проекта</h2>
              <p class="admin-hint">Форматы: ${AdminUI.escapeHtml(allowedExt)}. Хранение в localStorage — позже Supabase Storage.</p>
              <div class="admin-file-upload">
                <label class="admin-btn admin-file-label">
                  Прикрепить файлы
                  <input type="file" id="project-files-input" multiple accept=".mp3,.wav,.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png" hidden>
                </label>
              </div>
              ${filesHtml}
            </section>

            <section class="admin-section admin-card admin-field--full">
              <h2>Финальный текст песни</h2>
              <textarea id="final-lyrics" rows="10" class="admin-textarea-lg">${AdminUI.escapeHtml(order.creative?.finalLyrics || "")}</textarea>
              <div class="admin-toolbar">
                <button type="button" class="admin-btn admin-btn--primary" id="final-lyrics-save">Сохранить</button>
              </div>
            </section>

            <section class="admin-section admin-card">
              <h2>Этапы создания песни</h2>
              <div class="admin-stages">${stagesHtml}</div>
            </section>

            <section class="admin-section admin-card admin-field--full">
              <h2>Внутренние заметки</h2>
              <p class="admin-hint">Рабочие комментарии Натальи и Игоря. Не отображаются клиенту.</p>
              <div class="admin-notes">${notesHtml}</div>
              <div class="admin-note-form">
                <div class="admin-field admin-field--full"><label>Текст заметки</label><textarea id="note-text" rows="2"></textarea></div>
                <button type="button" class="admin-btn" id="note-add">Добавить</button>
              </div>
            </section>

            <section class="admin-section admin-card admin-field--full">
              <h2>История изменений</h2>
              <ul class="admin-activity">${activityHtml}</ul>
            </section>
          </form>`;

        const save = (options) => {
          const form = document.getElementById("order-form");
          if (!form) return;
          const saved = AdminApp._saveOrderFromForm(id, form, options);
          if (saved) {
            order = saved;
            if (!options?.skipRender) render();
          }
        };

        document.getElementById("order-save").addEventListener("click", () => save({}));
        document.getElementById("order-form")?.querySelector('[name="status"]')?.addEventListener("change", () => {
          save({ quiet: true, skipRender: false });
        });
        document.getElementById("order-form")?.querySelector('[name="paymentStatus"]')?.addEventListener("change", () => {
          save({ quiet: true, skipRender: false });
        });
        document.getElementById("order-delete").addEventListener("click", () => {
          if (!AdminUI.confirmAction("Удалить заказ безвозвратно?")) return;
          OrdersService.delete(id);
          window.location.href = "orders.html";
        });
        document.getElementById("note-add")?.addEventListener("click", () => {
          const text = document.getElementById("note-text").value.trim();
          if (!text) return;
          OrdersService.addInternalNote(id, text);
          AdminUI.toast("Заметка добавлена");
          render();
        });
        root.querySelectorAll("[data-note-del]").forEach((btn) => {
          btn.addEventListener("click", () => {
            if (!AdminUI.confirmAction("Удалить заметку?")) return;
            OrdersService.deleteInternalNote(id, btn.dataset.noteDel);
            AdminUI.toast("Заметка удалена");
            render();
          });
        });
        document.getElementById("final-lyrics-save")?.addEventListener("click", () => {
          const text = document.getElementById("final-lyrics").value;
          OrdersService.saveFinalLyrics(id, text);
          AdminUI.toast("Финальный текст сохранён");
          render();
        });
        document.getElementById("project-files-input")?.addEventListener("change", async (e) => {
          const files = [...(e.target.files || [])];
          if (!files.length) return;
          try {
            for (const file of files) {
              await OrderFilesService.upload(id, file);
            }
            AdminUI.toast(files.length > 1 ? "Файлы прикреплены" : "Файл прикреплён");
            render();
          } catch (err) {
            AdminUI.toast(err.message || "Ошибка загрузки", "error");
          }
          e.target.value = "";
        });
        root.querySelectorAll("[data-file-dl]").forEach((btn) => {
          btn.addEventListener("click", () => OrderFilesService.download(btn.dataset.fileDl));
        });
        root.querySelectorAll("[data-file-del]").forEach((btn) => {
          btn.addEventListener("click", () => {
            if (!AdminUI.confirmAction("Удалить файл?")) return;
            OrderFilesService.delete(id, btn.dataset.fileDel);
            AdminUI.toast("Файл удалён");
            render();
          });
        });
      };

      render();
    },

    albums() {
      AdminApp._crudList({
        rootId: "admin-albums-root",
        service: AlbumsService,
        columns: ["title", "status", "published"],
        labels: { title: "Название", status: "Статус", published: "Опубликован" },
        formFields: [
          { name: "title", label: "Название", required: true },
          { name: "description", label: "Описание", type: "textarea" },
          { name: "cover", label: "Обложка (путь)", placeholder: "malsu/album.jpg" },
          { name: "bandLink", label: "Ссылка" },
          { name: "releaseDate", label: "Дата релиза" },
          { name: "status", label: "Статус", placeholder: "released / draft" },
          { name: "side", label: "Подпись (Side A)" },
          { name: "tags", label: "Теги (через запятую)" },
          { name: "published", label: "Опубликован", type: "checkbox", checked: true },
        ],
        toRow: (a) => [
          a.title,
          a.status || "—",
          a.published !== false ? "Да" : "Скрыт",
        ],
        fromForm: (d, item) => ({
          ...item,
          title: d.title,
          description: d.description,
          cover: d.cover,
          bandLink: d.bandLink,
          releaseDate: d.releaseDate,
          status: d.status,
          side: d.side,
          tags: d.tags ? d.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
          published: d.published === true,
        }),
      });
    },

    tracks() {
      AdminApp._crudList({
        rootId: "admin-tracks-root",
        service: TracksService,
        columns: ["sortOrder", "title", "category", "published"],
        labels: { sortOrder: "#", title: "Название", category: "Категория", published: "Опубликован" },
        formFields: [
          { name: "title", label: "Название", required: true },
          { name: "description", label: "Описание", type: "textarea" },
          { name: "category", label: "Категория" },
          { name: "sortOrder", label: "Порядок", type: "number" },
          { name: "file", label: "Файл", placeholder: "audio/track.mp3" },
          { name: "published", label: "Опубликован", type: "checkbox", checked: true },
        ],
        toRow: (t) => [t.sortOrder, t.title, t.category || "—", t.published !== false ? "Да" : "Скрыт"],
        fromForm: (d, item) => ({
          ...item,
          title: d.title,
          description: d.description,
          category: d.category,
          sortOrder: Number(d.sortOrder) || 1,
          file: d.file,
          published: d.published === true,
        }),
      });
    },

    reviews() {
      AdminApp._crudList({
        rootId: "admin-reviews-root",
        service: ReviewsService,
        columns: ["clientName", "songTitle", "hasImage", "published"],
        labels: {
          clientName: "Клиент",
          songTitle: "Песня",
          hasImage: "Картинка",
          published: "Опубликован",
        },
        formFields: [
          { name: "clientName", label: "Имя клиента", required: true },
          { name: "songTitle", label: "Название песни" },
          { name: "text", label: "Текст отзыва", type: "textarea" },
          { name: "clientPhoto", label: "Фото клиента (URL/путь)", placeholder: "team/photo.jpg" },
          {
            name: "reviewImage",
            label: "Картинка отзыва (скриншот)",
            type: "image-upload",
            placeholder: "reviews/screenshot.jpg",
          },
          { name: "published", label: "Опубликован", type: "checkbox" },
        ],
        toRow: (r) => [
          r.clientName,
          r.songTitle || "—",
          r.reviewImage ? "Да" : "—",
          r.published ? "Да" : "Скрыт",
        ],
        fromForm: (d, item) => ({
          ...item,
          clientName: d.clientName,
          songTitle: d.songTitle,
          text: d.text,
          clientPhoto: d.clientPhoto,
          reviewImage: d.reviewImage,
          published: d.published === true,
        }),
        validateForm(d) {
          if (!(d.text || "").trim() && !(d.reviewImage || "").trim()) {
            return "Добавьте текст отзыва или картинку";
          }
          return true;
        },
      });
    },

    faq() {
      AdminApp._crudList({
        rootId: "admin-faq-root",
        service: FaqService,
        columns: ["sortOrder", "question"],
        labels: { sortOrder: "#", question: "Вопрос" },
        formFields: [
          { name: "question", label: "Вопрос", required: true },
          { name: "answer", label: "Ответ", type: "textarea", required: true },
          { name: "sortOrder", label: "Порядок", type: "number" },
        ],
        toRow: (f) => [f.sortOrder || "—", f.question],
        fromForm: (d, item) => ({
          ...item,
          question: d.question,
          answer: d.answer,
          sortOrder: Number(d.sortOrder) || 1,
        }),
        extraToolbar: `<button type="button" class="admin-btn" id="faq-sort-btn">Сохранить порядок ↑↓</button>`,
        onRender(root, render) {
          root.querySelector("#faq-sort-btn")?.addEventListener("click", () => {
            const ids = [...root.querySelectorAll("[data-sort-id]")].map((el) => el.dataset.sortId);
            FaqService.reorder(ids);
            AdminUI.toast("Порядок FAQ сохранён");
            render();
          });
        },
        rowExtra: (f) => ` data-sort-id="${AdminUI.escapeHtml(f.id)}"`,
        rowActions: (f) =>
          `<button type="button" class="admin-btn admin-btn--sm" data-up="${f.id}">↑</button>
           <button type="button" class="admin-btn admin-btn--sm" data-down="${f.id}">↓</button>`,
        onRowActions(root, render) {
          const list = FaqService.getAll();
          root.querySelectorAll("[data-up]").forEach((btn) => {
            btn.addEventListener("click", () => {
              const ids = list.map((x) => x.id);
              const i = ids.indexOf(btn.dataset.up);
              if (i > 0) [ids[i - 1], ids[i]] = [ids[i], ids[i - 1]];
              FaqService.reorder(ids);
              render();
            });
          });
          root.querySelectorAll("[data-down]").forEach((btn) => {
            btn.addEventListener("click", () => {
              const ids = list.map((x) => x.id);
              const i = ids.indexOf(btn.dataset.down);
              if (i >= 0 && i < ids.length - 1) [ids[i], ids[i + 1]] = [ids[i + 1], ids[i]];
              FaqService.reorder(ids);
              render();
            });
          });
        },
      });
    },

    pricing() {
      const root = document.getElementById("admin-pricing-root");
      const render = () => {
        const p = PricingService.getAll();
        root.innerHTML = `
        <form id="pricing-form" class="admin-form admin-card">
          <div class="admin-field"><label>Базовая цена</label><input name="priceFrom" value="${AdminUI.escapeHtml(p.priceFrom || "")}"></div>
          <div class="admin-field"><label>Подзаголовок</label><input name="subtitle" value="${AdminUI.escapeHtml(p.subtitle || "")}"></div>
          <div class="admin-field admin-field--full"><label>Описание</label><textarea name="note" rows="3">${AdminUI.escapeHtml(p.note || "")}</textarea></div>
          <div class="admin-field admin-field--full"><label>Что входит (по одному на строку)</label><textarea name="included" rows="5">${AdminUI.escapeHtml((p.included || []).join("\n"))}</textarea></div>
          <div class="admin-field admin-field--full"><label>Факторы стоимости / срочность (по строке)</label><textarea name="factors" rows="4">${AdminUI.escapeHtml((p.factors || []).join("\n"))}</textarea></div>
          <div class="admin-field admin-field--full"><label>Категории заказа (по строке)</label><textarea name="orderCategories" rows="4">${AdminUI.escapeHtml((p.orderCategories || []).join("\n"))}</textarea></div>
          <div class="admin-field admin-field--full"><label>Варианты бюджета (по строке)</label><textarea name="budgetOptions" rows="4">${AdminUI.escapeHtml((p.budgetOptions || []).join("\n"))}</textarea></div>
          <button type="submit" class="admin-btn admin-btn--primary">Сохранить</button>
        </form>`;
        document.getElementById("pricing-form").addEventListener("submit", (e) => {
          e.preventDefault();
          const d = AdminUI.readForm(e.target);
          const split = (s) => s.split("\n").map((x) => x.trim()).filter(Boolean);
          PricingService.save({
            priceFrom: d.priceFrom,
            subtitle: d.subtitle,
            note: d.note,
            included: split(d.included),
            factors: split(d.factors),
            orderCategories: split(d.orderCategories),
            budgetOptions: split(d.budgetOptions),
          });
          AdminUI.toast("Стоимость обновлена — изменения на сайте");
          render();
        });
      };
      render();
    },

    settings() {
      const root = document.getElementById("admin-settings-root");
      const site = SettingsService.getSite();
      const contacts = SettingsService.getContacts();
      const adminAuth = SettingsService.getAdminAuth();
      root.innerHTML = `
        <form id="settings-form" class="admin-form admin-card">
          <h2>Сайт</h2>
          <div class="admin-field"><label>Название сайта</label><input name="siteTitle" value="${AdminUI.escapeHtml(site.siteTitle || site.name || "")}"></div>
          <div class="admin-field admin-field--full"><label>Описание сайта</label><textarea name="siteDescription" rows="2">${AdminUI.escapeHtml(site.siteDescription || site.description || "")}</textarea></div>
          <div class="admin-field"><label>Базовый URL</label><input name="baseUrl" value="${AdminUI.escapeHtml(site.baseUrl || "")}"></div>
          <div class="admin-field"><label>Telegram</label><input name="telegram" value="${AdminUI.escapeHtml(site.telegram || site.contacts?.telegram || "")}"></div>
          <div class="admin-field"><label>Telegram @</label><input name="telegramUser" value="${AdminUI.escapeHtml(site.telegramUser || site.contacts?.telegramUser || "")}"></div>
          <div class="admin-field"><label>Email</label><input name="email" value="${AdminUI.escapeHtml(contacts.email || site.contacts?.email || "")}"></div>
          <div class="admin-field admin-field--full"><label>Заголовок контактов</label><input name="contactsHeading" value="${AdminUI.escapeHtml(contacts.heading || "")}"></div>
          <div class="admin-field admin-field--full"><label>Контакты (lead)</label><textarea name="contactsLead" rows="2">${AdminUI.escapeHtml(contacts.lead || "")}</textarea></div>
          <div class="admin-field admin-field--full"><label>Подсказка в форме</label><textarea name="contactsHint" rows="2">${AdminUI.escapeHtml(contacts.hint || "")}</textarea></div>
          <div class="admin-field admin-field--full"><label>Соцсети (label|url — по строке)</label><textarea name="socialLinks" rows="3">${AdminUI.escapeHtml(
            (site.socialLinks || [])
              .map((s) => `${s.label}|${s.url}`)
              .join("\n")
          )}</textarea></div>
          <h2>Доступ в админку</h2>
          <div class="admin-field"><label>Логин</label><input name="adminLogin" value="${AdminUI.escapeHtml(adminAuth.login)}" autocomplete="username"></div>
          <div class="admin-field"><label>Пароль</label><input name="adminPassword" type="password" value="${AdminUI.escapeHtml(adminAuth.password)}" autocomplete="new-password"></div>
          <button type="submit" class="admin-btn admin-btn--primary">Сохранить настройки</button>
        </form>

        <section class="admin-card admin-section">
          <h2>Резервное копирование</h2>
          <p class="admin-hint">Экспорт и импорт всех данных в JSON.</p>
          <div class="admin-toolbar">
            <button type="button" class="admin-btn" id="export-btn">Экспорт JSON</button>
            <label class="admin-btn admin-btn--ghost admin-file-label">
              Импорт JSON
              <input type="file" id="import-file" accept="application/json,.json" hidden>
            </label>
          </div>
        </section>`;

      document.getElementById("settings-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const d = AdminUI.readForm(e.target);
        const socialLinks = d.socialLinks
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            const [label, url] = line.split("|").map((x) => x.trim());
            return { label, url, handle: label === "Telegram" ? d.telegramUser : "" };
          });
        const raw = SettingsService.getRaw();
        SettingsService.save({
          site: {
            ...raw.site,
            siteTitle: d.siteTitle,
            name: d.siteTitle,
            siteDescription: d.siteDescription,
            description: d.siteDescription,
            baseUrl: (d.baseUrl || "").replace(/\/$/, ""),
            telegram: d.telegram,
            telegramUser: d.telegramUser,
            contacts: {
              ...(raw.site?.contacts || {}),
              telegram: d.telegram,
              telegramUser: d.telegramUser,
              email: d.email,
            },
            socialLinks,
          },
          contacts: {
            ...raw.contacts,
            heading: d.contactsHeading,
            lead: d.contactsLead,
            hint: d.contactsHint,
            email: d.email,
          },
          adminAuth: {
            login: d.adminLogin || "admin",
            password: d.adminPassword || "admin123",
          },
        });
        window.siteConfig = SettingsService.getSite();
        AdminUI.toast("Настройки сохранены");
      });

      document.getElementById("export-btn").addEventListener("click", () => {
        DataPortabilityService.downloadExport();
        AdminUI.toast("Экспорт начат");
      });

      document.getElementById("import-file").addEventListener("change", (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          try {
            if (!AdminUI.confirmAction("Импорт заменит все текущие данные. Продолжить?")) return;
            DataPortabilityService.importJson(reader.result);
            AdminUI.toast("Импорт выполнен");
            setTimeout(() => location.reload(), 800);
          } catch (err) {
            AdminUI.toast(err.message || "Ошибка импорта", "error");
          }
        };
        reader.readAsText(file);
      });
    },
  },

  _crudList(opts) {
    const root = document.getElementById(opts.rootId);
    let editingId = null;

    const render = () => {
      const list = opts.service.getAll(true);
      const cols = opts.columns;
      const head = cols.map((c) => `<th>${AdminUI.escapeHtml(opts.labels[c] || c)}</th>`).join("");
      const rows = list.length
        ? list
            .map((item) => {
              const cells = opts.toRow(item).map((v) => `<td>${AdminUI.escapeHtml(String(v))}</td>`).join("");
              const extra = opts.rowExtra?.(item) || "";
              const actions = opts.rowActions?.(item) || "";
              return `<tr${extra}>
                ${cells}
                <td class="admin-actions">
                  ${actions}
                  <button type="button" class="admin-btn admin-btn--sm" data-edit="${AdminUI.escapeHtml(item.id)}">Редактировать</button>
                  <button type="button" class="admin-btn admin-btn--sm admin-btn--danger" data-del="${AdminUI.escapeHtml(item.id)}">Удалить</button>
                </td>
              </tr>`;
            })
            .join("")
        : AdminUI.emptyTable(cols.length + 1, "Записей пока нет");

      const editingItem =
        editingId && editingId !== "new" ? opts.service.getById(editingId) : null;
      const showForm = editingId != null;

      const formFields = opts.formFields
        .map((f) => {
          const val = editingItem;
          let v = val ? val[f.name] : "";
          if (f.name === "tags" && val?.tags) v = val.tags.join(", ");
          if (f.type === "checkbox") {
            const chk = AdminUI.isPublishedChecked(val, f.checked);
            return `<label class="admin-check admin-field--full"><input type="checkbox" name="${f.name}" ${chk ? "checked" : ""}> ${AdminUI.escapeHtml(f.label)}</label>`;
          }
          if (f.type === "textarea") {
            return `<div class="admin-field admin-field--full"><label>${AdminUI.escapeHtml(f.label)}</label><textarea name="${f.name}" rows="3">${AdminUI.escapeHtml(v ?? "")}</textarea></div>`;
          }
          if (f.type === "image-upload") {
            const preview = v
              ? `<img src="${AdminUI.escapeHtml(v)}" alt="" class="admin-img-preview__img">`
              : `<span class="admin-muted">Превью появится после загрузки</span>`;
            return `<div class="admin-field admin-field--full admin-image-upload">
              <label>${AdminUI.escapeHtml(f.label)}</label>
              <input name="${f.name}" type="text" value="${AdminUI.escapeHtml(v ?? "")}" placeholder="${AdminUI.escapeHtml(f.placeholder || "")}">
              <p class="admin-hint">Путь к файлу на сайте или загрузите изображение (jpg, png, webp).</p>
              <label class="admin-btn admin-file-label">
                Загрузить картинку
                <input type="file" accept="image/jpeg,image/png,image/webp,image/jpg" data-image-target="${f.name}" hidden>
              </label>
              <div class="admin-img-preview" data-preview-for="${f.name}">${preview}</div>
            </div>`;
          }
          return `<div class="admin-field"><label>${AdminUI.escapeHtml(f.label)}</label><input name="${f.name}" type="${f.type || "text"}" value="${AdminUI.escapeHtml(v ?? "")}" placeholder="${AdminUI.escapeHtml(f.placeholder || "")}" ${f.required ? "required" : ""}></div>`;
        })
        .join("");

      root.innerHTML = `
        <div class="admin-toolbar">
          <button type="button" class="admin-btn admin-btn--primary" id="crud-add">+ Добавить</button>
          ${opts.extraToolbar || ""}
        </div>
        <div class="admin-table-wrap">
          <table class="admin-table"><thead><tr>${head}<th></th></tr></thead><tbody>${rows}</tbody></table>
        </div>
        <form id="crud-form" class="admin-card admin-form ${showForm ? "" : "is-hidden"}">
          <h2>${editingId === "new" ? "Новая запись" : editingId ? "Редактирование" : ""}</h2>
          ${formFields}
          <div class="admin-toolbar">
            <button type="submit" class="admin-btn admin-btn--primary">Сохранить</button>
            <button type="button" class="admin-btn admin-btn--ghost" id="crud-cancel">Отмена</button>
          </div>
        </form>`;

      root.querySelector("#crud-add")?.addEventListener("click", () => {
        editingId = "new";
        render();
        AdminUI.scrollToForm(root.querySelector("#crud-form"));
      });
      root.querySelector("#crud-cancel")?.addEventListener("click", () => {
        editingId = null;
        render();
      });
      root.querySelectorAll("[data-edit]").forEach((btn) => {
        btn.addEventListener("click", () => {
          editingId = btn.dataset.edit;
          render();
          AdminUI.scrollToForm(root.querySelector("#crud-form"));
        });
      });
      root.querySelectorAll("[data-del]").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (!AdminUI.confirmAction("Удалить запись?")) return;
          opts.service.delete(btn.dataset.del);
          if (editingId === btn.dataset.del) editingId = null;
          AdminUI.toast("Удалено");
          render();
        });
      });
      root.querySelector("#crud-form")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const d = AdminUI.readForm(e.target);
        const validation = opts.validateForm?.(d);
        if (validation !== undefined && validation !== true) {
          AdminUI.toast(typeof validation === "string" ? validation : "Проверьте форму", "error");
          return;
        }
        let item =
          editingId === "new"
            ? { id: crypto.randomUUID?.() || `item-${Date.now()}` }
            : { ...(opts.service.getById(editingId) || {}) };
        if (editingId !== "new" && !item.id) {
          AdminUI.toast("Запись не найдена", "error");
          return;
        }
        item = opts.fromForm(d, item);
        opts.service.save(item);
        editingId = item.id;
        AdminUI.toast("Сохранено");
        render();
        AdminUI.scrollToForm(root.querySelector("#crud-form"));
      });

      opts.onRender?.(root, render);
      opts.onRowActions?.(root, render);

      root.querySelectorAll("[data-image-target]").forEach((input) => {
        input.addEventListener("change", () => {
          const file = input.files?.[0];
          if (!file) return;
          if (!file.type.startsWith("image/")) {
            AdminUI.toast("Выберите изображение", "error");
            return;
          }
          if (file.size > 2 * 1024 * 1024) {
            AdminUI.toast("Файл больше 2 МБ — используйте путь к файлу на сервере", "error");
            return;
          }
          const targetName = input.dataset.imageTarget;
          const reader = new FileReader();
          reader.onload = () => {
            const form = root.querySelector("#crud-form");
            const field = form?.querySelector(`[name="${targetName}"]`);
            if (field) field.value = reader.result;
            const preview = form?.querySelector(`[data-preview-for="${targetName}"]`);
            if (preview) {
              preview.innerHTML = `<img src="${reader.result}" alt="" class="admin-img-preview__img">`;
            }
            AdminUI.toast("Картинка загружена — нажмите «Сохранить»");
          };
          reader.readAsDataURL(file);
          input.value = "";
        });
      });
    };

    render();
  },
};
