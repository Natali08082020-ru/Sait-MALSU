/**
 * Подстановка контактов и соцссылок из siteConfig в разметку.
 * data-site-link="telegram" — href
 * data-site-text="telegramUser" — текст
 */
window.applySiteLinks = function () {
  const site = window.siteConfig || window.MalsuData?.site;
  if (!site) return;

  const telegramUrl = site.contacts?.telegram || site.telegram;
  const telegramUser = site.contacts?.telegramUser || site.telegramUser;

  document.querySelectorAll('[data-site-link="telegram"]').forEach((el) => {
    if (telegramUrl) el.href = telegramUrl;
  });

  document.querySelectorAll('[data-site-text="telegramUser"]').forEach((el) => {
    if (telegramUser) el.textContent = telegramUser;
  });
};
