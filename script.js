/** UI и рендеринг главной страницы MalSu */
(function () {
  const menuBtn = document.querySelector(".menu-btn");
  const nav = document.querySelector(".nav");

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function observeRevealElements(container) {
    container.querySelectorAll(".reveal").forEach((el) => {
      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
        );
        observer.observe(el);
      } else {
        el.classList.add("is-visible");
      }
    });
  }

  function renderOrderTracks() {
    const list = document.getElementById("track-list");
    if (!list) return;

    const tracks = TracksService.getAll();
    const bars = "<span></span>".repeat(10);

    list.innerHTML = tracks
      .map((track, i) => {
        const num = String(i + 1).padStart(2, "0");
        const src = `audio/${encodeURIComponent(track.file)}`;
        const desc = track.description
          ? `<p class="track-desc">${escapeHtml(track.description)}</p>`
          : "";
        return `
      <li class="track-item reveal" data-track data-track-id="${escapeHtml(track.id)}">
        <div class="track-info">
          <span class="track-num">${num}</span>
          <div class="track-details">
            <h3 class="track-title">${escapeHtml(track.title)}</h3>
            ${desc}
          </div>
        </div>
        <div class="track-player">
          <div class="track-bars" aria-hidden="true">${bars}</div>
          <audio src="${src}" preload="metadata"></audio>
          <button type="button" class="track-play" aria-label="Воспроизвести «${escapeHtml(track.title)}»">
            <span class="icon-play">▶</span>
            <span class="icon-pause">❚❚</span>
          </button>
        </div>
      </li>
    `;
      })
      .join("");

    observeRevealElements(list);
    initAudioPlayers();
  }

  function renderWhyChooseIcon(item) {
    if (item.iconSrc) {
      return `<img src="${escapeHtml(item.iconSrc)}" alt="" class="why-icon-img" width="52" height="52" loading="lazy">`;
    }
    return escapeHtml(item.icon || "");
  }

  function renderWhyChoose() {
    const grid = document.getElementById("why-grid");
    if (!grid) return;

    const staticIcons = Object.fromEntries(
      (window.MalsuData?.whyChoose || []).map((item) => [item.id, item.iconSrc])
    );
    const items = SettingsService.getWhyChoose();
    grid.innerHTML = items
      .map((item) => {
        const withIcon = item.iconSrc ? item : { ...item, iconSrc: staticIcons[item.id] };
        return `
    <article class="why-card reveal" data-why-id="${escapeHtml(item.id)}">
      <span class="why-icon" aria-hidden="true">${renderWhyChooseIcon(withIcon)}</span>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.text)}</p>
    </article>
  `;
      })
      .join("");

    observeRevealElements(grid);
  }

  function renderPricing() {
    const p = PricingService.getAll();
    const subtitle = document.getElementById("pricing-subtitle");
    const price = document.getElementById("pricing-price");
    const note = document.getElementById("pricing-note");
    const included = document.getElementById("pricing-included");
    const factors = document.getElementById("pricing-factors");
    if (subtitle && p.subtitle) subtitle.textContent = p.subtitle;
    if (price && p.priceFrom) price.textContent = p.priceFrom;
    if (note && p.note) note.textContent = p.note;
    if (included) {
      included.innerHTML = (p.included || [])
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join("");
    }
    if (factors) {
      factors.innerHTML = (p.factors || [])
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join("");
    }
  }

  function renderFaq() {
    const list = document.getElementById("faq-list");
    if (!list) return;

    list.innerHTML = FaqService.getAll()
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map(
        (item) => `
    <details class="faq-item" data-faq-id="${escapeHtml(item.id)}">
      <summary>${escapeHtml(item.question)}</summary>
      <p>${escapeHtml(item.answer)}</p>
    </details>
  `
      )
      .join("");
  }

  function getPhotoReviews() {
    return window.MalsuData?.photoReviews || [];
  }

  function initPhotoReviewsCarousel() {
    const root = document.getElementById("photo-reviews");
    const track = document.getElementById("photo-reviews-track");
    const dotsRoot = document.getElementById("photo-reviews-dots");
    const carousel = document.getElementById("photo-reviews-carousel");
    if (!root || !track || !dotsRoot || !carousel) return;

    const images = getPhotoReviews();
    if (!images.length) {
      root.hidden = true;
      return;
    }

    root.hidden = false;
    track.innerHTML = images
      .map(
        (src, i) => `<figure class="photo-reviews-slide" data-index="${i}">
          <img src="${escapeHtml(src)}" alt="Фотоотзыв ${i + 1}" loading="${i === 0 ? "eager" : "lazy"}">
        </figure>`
      )
      .join("");

    dotsRoot.innerHTML = images
      .map(
        (_, i) =>
          `<button type="button" class="photo-reviews-dot${i === 0 ? " is-active" : ""}" data-index="${i}" role="tab" aria-label="Отзыв ${i + 1}" aria-selected="${i === 0}"></button>`
      )
      .join("");

    let index = 0;
    let autoplayTimer = null;
    let touchStartX = 0;
    let touchDeltaX = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const total = images.length;

    const goTo = (nextIndex) => {
      index = (nextIndex + total) % total;
      track.style.transform = `translateX(-${index * 100}%)`;
      dotsRoot.querySelectorAll(".photo-reviews-dot").forEach((dot, i) => {
        dot.classList.toggle("is-active", i === index);
        dot.setAttribute("aria-selected", i === index ? "true" : "false");
      });
    };

    const next = () => goTo(index + 1);
    const prev = () => goTo(index - 1);

    const stopAutoplay = () => {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    };

    const startAutoplay = () => {
      stopAutoplay();
      if (reduceMotion || total < 2) return;
      autoplayTimer = setInterval(next, 5500);
    };

    carousel.querySelector(".photo-reviews-btn--prev")?.addEventListener("click", () => {
      prev();
      startAutoplay();
    });
    carousel.querySelector(".photo-reviews-btn--next")?.addEventListener("click", () => {
      next();
      startAutoplay();
    });

    dotsRoot.querySelectorAll(".photo-reviews-dot").forEach((dot) => {
      dot.addEventListener("click", () => {
        goTo(Number(dot.dataset.index));
        startAutoplay();
      });
    });

    carousel.addEventListener("mouseenter", stopAutoplay);
    carousel.addEventListener("mouseleave", startAutoplay);
    carousel.addEventListener("focusin", stopAutoplay);
    carousel.addEventListener("focusout", startAutoplay);

    carousel.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].clientX;
        touchDeltaX = 0;
        stopAutoplay();
      },
      { passive: true }
    );

    carousel.addEventListener(
      "touchmove",
      (e) => {
        touchDeltaX = e.changedTouches[0].clientX - touchStartX;
      },
      { passive: true }
    );

    carousel.addEventListener(
      "touchend",
      () => {
        if (Math.abs(touchDeltaX) > 48) {
          if (touchDeltaX < 0) next();
          else prev();
        }
        startAutoplay();
      },
      { passive: true }
    );

    root.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
        startAutoplay();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
        startAutoplay();
      }
    });

    startAutoplay();
    observeRevealElements(root);
  }

  function renderReviews() {
    const grid = document.getElementById("reviews-grid");
    const placeholder = document.getElementById("reviews-placeholder");
    if (!grid) return;

    const reviews = ReviewsService.getAll();
    const reviewsPlaceholder = ReviewsService.getPlaceholder();
    const hasPhotoReviews = getPhotoReviews().length > 0;

    if (!reviews.length && !hasPhotoReviews) {
      if (placeholder) {
        placeholder.hidden = false;
        if (reviewsPlaceholder) placeholder.textContent = reviewsPlaceholder;
      }
      grid.innerHTML = `
      <article class="review-card review-card--skeleton" aria-hidden="true">
        <div class="review-photo review-photo--placeholder"></div>
        <div class="review-body">
          <p class="review-song">Название песни</p>
          <p class="review-text">Текст отзыва заказчика</p>
          <p class="review-name">Имя клиента</p>
        </div>
      </article>
      <article class="review-card review-card--skeleton" aria-hidden="true">
        <div class="review-photo review-photo--placeholder"></div>
        <div class="review-body">
          <p class="review-song">Название песни</p>
          <p class="review-text">Текст отзыва заказчика</p>
          <p class="review-name">Имя клиента</p>
        </div>
      </article>
    `;
      return;
    }

    if (placeholder) placeholder.hidden = true;

    if (!reviews.length) {
      grid.innerHTML = "";
      return;
    }

    grid.innerHTML = reviews
      .map((review) => {
        const hasImage = !!(review.reviewImage || "").trim();
        const hasText = !!(review.text || "").trim();
        const cardClass = hasImage
          ? "review-card review-card--has-image"
          : "review-card";

        const imageHtml = hasImage
          ? `<div class="review-screenshot">
              <img src="${escapeHtml(review.reviewImage)}" alt="Отзыв${review.clientName ? ` — ${escapeHtml(review.clientName)}` : ""}" class="review-screenshot-img" loading="lazy">
            </div>`
          : "";

        const photo = review.clientPhoto
          ? `<img src="${escapeHtml(review.clientPhoto)}" alt="" class="review-photo-img" loading="lazy">`
          : `<span class="review-photo-fallback">${escapeHtml((review.clientName || "?")[0])}</span>`;

        const bodyHtml =
          hasText || review.songTitle || review.clientName
            ? `<div class="review-card-body">
                ${!hasImage ? `<div class="review-photo">${photo}</div>` : ""}
                <div class="review-body">
                  ${review.songTitle ? `<p class="review-song">${escapeHtml(review.songTitle)}</p>` : ""}
                  ${hasText ? `<p class="review-text">${escapeHtml(review.text)}</p>` : ""}
                  ${review.clientName ? `<p class="review-name">${escapeHtml(review.clientName)}</p>` : ""}
                </div>
              </div>`
            : "";

        return `
      <article class="${cardClass} reveal" data-review-id="${escapeHtml(review.id)}">
        ${imageHtml}
        ${bodyHtml}
      </article>
    `;
      })
      .join("");

    observeRevealElements(grid);
  }

  function initFormSelects() {
    const categorySelect = document.getElementById("order-category");
    if (categorySelect) {
      SettingsService.getOrderCategories().forEach((cat) => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        categorySelect.appendChild(opt);
      });
    }

    const budgetSelect = document.getElementById("order-budget");
    if (budgetSelect) {
      SettingsService.getBudgetOptions().forEach((opt) => {
        const el = document.createElement("option");
        el.value = opt;
        el.textContent = opt;
        budgetSelect.appendChild(el);
      });
    }
  }

  function initCtaFollowup() {
    const text = SettingsService.getCtaFollowup();
    if (!text) return;
    document.querySelectorAll(".cta-followup").forEach((el) => {
      el.textContent = text;
    });
  }

  function initTeamAvatars() {
    document.querySelectorAll(".team-avatar[data-photo]").forEach((avatar) => {
      const src = avatar.dataset.photo;
      const initial = avatar.dataset.initial || "?";

      avatar.innerHTML = `<span class="team-avatar-fallback">${escapeHtml(initial)}</span>`;

      if (!src) {
        avatar.classList.add("is-fallback");
        return;
      }

      const img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.className = "team-avatar-img";
      img.loading = "lazy";
      img.addEventListener("load", () => avatar.classList.remove("is-fallback"));
      img.addEventListener("error", () => {
        avatar.classList.add("is-fallback");
        img.remove();
      });
      avatar.appendChild(img);
    });
  }

  function showThankYou() {
    const overlay = document.getElementById("thank-you");
    const title = document.getElementById("thank-you-title");
    const text = document.getElementById("thank-you-text");
    const subtext = document.getElementById("thank-you-subtext");
    if (!overlay) return;

    const thankYou = SettingsService.getThankYou();
    if (title && thankYou?.title) title.textContent = thankYou.title;
    if (text && thankYou?.text) text.textContent = thankYou.text;
    if (subtext && thankYou?.subtext) subtext.textContent = thankYou.subtext;

    overlay.hidden = false;
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("thank-you-open");
    document.getElementById("thank-you-home")?.focus();
  }

  function hideThankYou() {
    const overlay = document.getElementById("thank-you");
    if (!overlay) return;
    overlay.hidden = true;
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("thank-you-open");
  }

  function initThankYou() {
    document.getElementById("thank-you-home")?.addEventListener("click", () => {
      hideThankYou();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    document.getElementById("thank-you-listen")?.addEventListener("click", hideThankYou);
    document.querySelector(".thank-you-backdrop")?.addEventListener("click", hideThankYou);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.body.classList.contains("thank-you-open")) {
        hideThankYou();
      }
    });
  }

  const heroVinyl = document.getElementById("hero-vinyl");
  let currentAudio = null;
  let currentTrackItem = null;

  function stopCurrent() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    if (currentTrackItem) {
      currentTrackItem.classList.remove("is-playing");
      currentTrackItem.querySelector(".track-play")?.setAttribute("aria-label", "Воспроизвести");
    }
    heroVinyl?.classList.remove("is-playing");
    currentAudio = null;
    currentTrackItem = null;
  }

  function initAudioPlayers() {
    document.querySelectorAll("[data-track]").forEach((item) => {
      const audio = item.querySelector("audio");
      const btn = item.querySelector(".track-play");
      if (!audio || !btn || btn.dataset.bound) return;
      btn.dataset.bound = "1";

      btn.addEventListener("click", () => {
        if (currentAudio === audio && !audio.paused) {
          stopCurrent();
          return;
        }
        stopCurrent();
        currentAudio = audio;
        currentTrackItem = item;
        item.classList.add("is-playing");
        btn.setAttribute("aria-label", "Пауза");
        heroVinyl?.classList.add("is-playing");
        audio.play().catch(stopCurrent);
      });

      audio.addEventListener("ended", stopCurrent);
    });
  }

  function initMenu() {
    if (!menuBtn || !nav) return;
    menuBtn.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      menuBtn.classList.toggle("is-open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        menuBtn.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  function initReveal() {
    const revealEls = document.querySelectorAll(".reveal");
    if (!revealEls.length) return;
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
      revealEls.forEach((el) => observer.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }
  }

  function initForm() {
    const form = document.getElementById("feedback-form");
    const formStatus = document.getElementById("form-status");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const draft = OrdersService.buildFromForm(data);

      if (!draft.name || !draft.contact || !draft.story) {
        if (formStatus) {
          formStatus.textContent = "Заполните все обязательные поля.";
          formStatus.classList.remove("is-success");
          formStatus.classList.add("is-error");
        }
        return;
      }

      try {
        if (window.OrdersStore) OrdersStore.getAll();
        if (window.AdminDataStore) AdminDataStore.ensure();

        const order = OrdersService.create(data);
        if (!order?.orderNumber) {
          throw new Error("Order was not saved");
        }

        await TelegramIntegration.sendOrder(order);

        form.classList.add("is-submitted");
        form.reset();
        if (formStatus) {
          formStatus.innerHTML = "";
          formStatus.classList.remove("is-error", "is-success");
        }
        showThankYou();
      } catch (err) {
        console.error("[MalSu CRM]", err);
        if (formStatus) {
          formStatus.textContent =
            "Заявка не сохранилась локально. Напишите нам в Telegram — мы обязательно ответим.";
          formStatus.classList.add("is-error");
        }
        await TelegramIntegration.sendOrder({
          ...draft,
          orderNumber: "",
          story: draft.story,
        });
      }
    });
  }

  function initContactSection() {
    const contacts = SettingsService.getContacts();
    const heading = document.getElementById("contact-heading");
    const lead = document.getElementById("contact-lead");
    const hint = document.querySelector(".contact-hint");
    if (heading && contacts.heading) heading.textContent = contacts.heading;
    if (lead && contacts.lead) lead.textContent = contacts.lead;
    if (hint && contacts.hint) hint.textContent = contacts.hint;
  }

  function initHeroVinyl() {
    const img = document.getElementById("hero-vinyl-img");
    const src = window.MalsuData?.heroVinylImage;
    if (img && src) img.src = src;
  }

  function init() {
    initHeroVinyl();
    renderOrderTracks();
    renderWhyChoose();
    renderPricing();
    renderFaq();
    renderReviews();
    initPhotoReviewsCarousel();
    initContactSection();
    initFormSelects();
    initCtaFollowup();
    initThankYou();
    initTeamAvatars();
    initMenu();
    initReveal();
    initForm();
    window.applySeoMeta("");
    window.applySiteLinks?.();
    window.Analytics?.init();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
