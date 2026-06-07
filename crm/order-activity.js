/** Журнал действий по заказу */
window.OrderActivityTypes = {
  CREATED: "Создан заказ",
  STATUS_CHANGED: "Изменён статус",
  FILE_ADDED: "Добавлен файл",
  FILE_REMOVED: "Удалён файл",
  NOTE_ADDED: "Добавлена заметка",
  NOTE_REMOVED: "Удалена заметка",
  LYRICS_CHANGED: "Изменён текст песни",
  PAYMENT_CHANGED: "Изменён статус оплаты",
  ORDER_UPDATED: "Заказ обновлён",
};

window.createActivityEntry = function (action, details) {
  return {
    id: crypto.randomUUID?.() || `act-${Date.now()}`,
    date: new Date().toISOString(),
    action,
    details: details || "",
  };
};

window.formatActivityDetails = function (entry) {
  if (!entry.details) return entry.action;
  return `${entry.action}: ${entry.details}`;
};
