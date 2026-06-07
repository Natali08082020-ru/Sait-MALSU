/**
 * Генерация номера заказа: MS-2026-001
 * Локальная реализация — позже заменится Supabase sequence.
 */
window.generateOrderNumber = function () {
  const year = new Date().getFullYear();
  const key = `malsu_order_seq_${year}`;
  let seq = parseInt(localStorage.getItem(key) || "0", 10) + 1;
  localStorage.setItem(key, String(seq));
  return `MS-${year}-${String(seq).padStart(3, "0")}`;
};
