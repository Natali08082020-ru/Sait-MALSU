/**
 * SEO: canonical, Open Graph и Twitter Card из siteConfig.baseUrl.
 */
window.applySeoMeta = function (pagePath, pageMeta) {
  const site = window.siteConfig || window.MalsuData?.site;
  if (!site) return;

  const origin = window.getSiteBaseUrl?.() || site.baseUrl || "";
  const path =
    pagePath !== undefined && pagePath !== null
      ? pagePath
      : window.location.pathname.replace(/^\//, "").replace(/\\/g, "/");
  const canonicalUrl = path ? `${origin}/${path}` : `${origin}/`;
  const imageUrl = `${origin}/${site.ogImage || "malsu/malsu.jpg"}`;

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.href = canonicalUrl;

  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.content = canonicalUrl;

  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage) ogImage.content = imageUrl;

  const twitterImage = document.querySelector('meta[name="twitter:image"]');
  if (twitterImage) twitterImage.content = imageUrl;

  const ogSiteName = document.querySelector('meta[property="og:site_name"]');
  if (ogSiteName && site.siteTitle) ogSiteName.content = site.siteTitle;

  if (pageMeta?.title) {
    document.title = pageMeta.title;
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = pageMeta.title;
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.content = pageMeta.title;
  }

  if (pageMeta?.description) {
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.content = pageMeta.description;
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.content = pageMeta.description;
    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (twitterDesc) twitterDesc.content = pageMeta.description;
  }
};
