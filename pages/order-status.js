/**

 * Страница статуса заказа — /pages/order-status.html?id=MS-2026-001

 */

(function () {

  const DEMO_ORDER = {

    id: "demo-order-001",

    orderNumber: "MS-2026-001",

    name: "Анна",

    contact: "@example",

    category: "День рождения",

    budget: "4 000–8 000 ₽",

    story: "Песня для мамы",

    deadline: "15 июня",

    status: "IN_PROGRESS",

    createdAt: "2026-06-01T10:00:00.000Z",

    updatedAt: "2026-06-01T12:00:00.000Z",

  };



  const STEP_LABELS = {

    NEW: "Заявка получена",

    DISCUSSION: "Обсуждение",

    IN_PROGRESS: "В работе",

    APPROVAL: "Согласование",

    DONE: "Готово",

  };



  function formatDate(iso) {

    try {

      return new Date(iso).toLocaleDateString("ru-RU", {

        day: "numeric",

        month: "long",

        year: "numeric",

      });

    } catch {

      return iso;

    }

  }



  function resolveOrder() {

    const params = new URLSearchParams(window.location.search);

    const queryId = params.get("id") || params.get("order");



    if (queryId && window.OrdersStore) {
      const byNumber = OrdersStore.findByNumber(queryId);
      if (byNumber) return byNumber;
      const byId = OrdersStore.findById(queryId);
      if (byId) return byId;
    }

    if (window.OrdersStore) {
      const orders = OrdersStore.getAll();
      if (orders.length) return orders[orders.length - 1];
    }

    if (queryId && window.LocalProvider) {

      const byNumber = LocalProvider.getOrderByNumber(queryId);

      if (byNumber) return byNumber;

      const byId = LocalProvider.getOrderById(queryId);

      if (byId) return byId;

    }



    if (window.LocalProvider) {

      const orders = LocalProvider.getOrders();

      if (orders.length) return orders[orders.length - 1];

    }



    return DEMO_ORDER;

  }



  function renderProgress(status) {

    const currentIdx = getOrderStatusIndex(status);

    const list = document.getElementById("order-progress");

    if (!list) return;



    list.innerHTML = OrderStatusPipeline.map((step, idx) => {

      const done = idx <= currentIdx;

      const active = idx === currentIdx;

      return `

        <li class="order-progress-step ${done ? "is-done" : ""} ${active ? "is-active" : ""}">

          <span class="order-progress-mark">${done ? "✓" : idx + 1}</span>

          <span class="order-progress-label">${STEP_LABELS[step]}</span>

        </li>

      `;

    }).join("");

  }



  function init() {

    const order = resolveOrder();

    document.getElementById("order-number").textContent = order.orderNumber;

    document.getElementById("order-client").textContent = order.name;

    document.getElementById("order-status-label").textContent = getOrderStatusLabel(order.status);

    document.getElementById("order-created").textContent = formatDate(order.createdAt);

    renderProgress(order.status);

  }



  if (document.readyState === "loading") {

    document.addEventListener("DOMContentLoaded", init);

  } else {

    init();

  }

})();


