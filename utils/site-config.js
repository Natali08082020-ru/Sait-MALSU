/**
 * Единый доступ к siteConfig и URL сайта.
 */
(function () {
  function syncSiteConfig() {
    window.siteConfig =
      window.MalsuData?.site ||
      window.MalsuDataPart?.site ||
      window.siteConfig ||
      {};
    return window.siteConfig;
  }

  window.getSiteBaseUrl = function () {
    const site = syncSiteConfig();
    if (
      typeof window !== "undefined" &&
      window.location.protocol.startsWith("http") &&
      !window.location.hostname.includes("localhost") &&
      !window.location.hostname.startsWith("127.0.0.1")
    ) {
      return window.location.origin;
    }
    return (site.baseUrl || "").replace(/\/$/, "");
  };

  window.resolveSiteUrl = function (pagePath) {
    const base = window.getSiteBaseUrl();
    if (!pagePath) return `${base}/`;
    return `${base}/${String(pagePath).replace(/^\//, "")}`;
  };

  syncSiteConfig();
})();
