/**
 * Сборка конфигурации MalSu из модулей data/*.js
 * Готово к замене на Supabase provider.
 */
(function () {
  const parts = window.MalsuDataPart || {};
  const site = parts.site || {};

  window.MalsuData = {
    site,
    albums: parts.albums || [],
    tracks: parts.tracks || [],
    faq: parts.faq || [],
    reviews: parts.reviews || [],
    reviewsPlaceholder: parts.reviewsPlaceholder || "",
    photoReviews: parts.photoReviews || [],
    heroVinylImage: parts.heroVinylImage || "malsu_foto/Bazaart_20260607_055012_577.png",
    pricing: parts.pricing || {},
    contacts: parts.contacts || {},
    team: parts.team || [],
    news: parts.news || [],
    whyChoose: parts.whyChoose || [],
    orderCategories: parts.pricing?.orderCategories || [],
    budgetOptions: parts.pricing?.budgetOptions || [],
    ctaFollowup: site.ctaFollowup || "",
    thankYou: site.thankYou || {},
  };

  window.siteConfig = site;
})();
