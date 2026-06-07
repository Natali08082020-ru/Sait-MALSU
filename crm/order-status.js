/**
 * CRM: статусы заказов MalSu
 */
window.OrderStatus = {
  NEW: "NEW",
  DISCUSSION: "DISCUSSION",
  IN_PROGRESS: "IN_PROGRESS",
  APPROVAL: "APPROVAL",
  DONE: "DONE",
  ARCHIVED: "ARCHIVED",
};

window.OrderStatusLabels = {
  NEW: "Новая заявка",
  DISCUSSION: "Обсуждение",
  IN_PROGRESS: "В работе",
  APPROVAL: "Согласование",
  DONE: "Готово",
  ARCHIVED: "Архив",
};

/** Порядок этапов для визуального прогресса */
window.OrderStatusPipeline = [
  "NEW",
  "DISCUSSION",
  "IN_PROGRESS",
  "APPROVAL",
  "DONE",
];

window.getOrderStatusLabel = function (status) {
  return window.OrderStatusLabels[status] || status;
};

window.getOrderStatusIndex = function (status) {
  const idx = window.OrderStatusPipeline.indexOf(status);
  return idx === -1 ? 0 : idx;
};
