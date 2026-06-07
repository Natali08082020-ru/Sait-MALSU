/** Статус оплаты заказа */
window.PaymentStatus = {
  UNPAID: "UNPAID",
  PREPAID: "PREPAID",
  PAID_FULL: "PAID_FULL",
};

window.PaymentStatusLabels = {
  UNPAID: "Не оплачено",
  PREPAID: "Предоплата",
  PAID_FULL: "Оплачено полностью",
};

window.getPaymentStatusLabel = function (status) {
  return window.PaymentStatusLabels[status] || status || PaymentStatusLabels.UNPAID;
};
