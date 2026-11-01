
/* =========================================================
   PORTFOLIO-M — GENERAL INTERACTIONS
   Version: 5.0
   ========================================================= */

(() => {
  "use strict";

  if (window.PortfolioInteractionsInitialized) return;
  window.PortfolioInteractionsInitialized = true;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  function updateCurrentYear() {
    const year = new Date().getFullYear();

    document.querySelectorAll(
      "[data-current-year], #current-year"
    ).forEach((element) => {
      element.textContent = year;
    });
  }

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: reducedMotion.matches ? "auto" : "smooth"
    });
  }

  function initializeBackToTop() {
    document.querySelectorAll(
      "[data-back-to-top]"
    ).forEach((button) => {
      if (button.dataset.backToTopReady === "true") return;

      button.dataset.backToTopReady = "true";

      // Hide until the visitor scrolls down.
      const updateVisibility = () => {
        const visible = window.scrollY > 400;

        button.classList.toggle("is-visible", visible);

        if (button.tagName === "BUTTON") {
          button.setAttribute(
            "aria-hidden",
            String(!visible)
          );

          button.tabIndex = visible ? 0 : -1;
        }
      };

      button.addEventListener("click", (event) => {
        event.preventDefault();
        scrollToTop();
      });

      window.addEventListener(
        "scroll",
        updateVisibility,
        { passive: true }
      );

      updateVisibility();
    });
  }

  function initializeSmoothScrolling() {
    if (document.body.dataset.smoothScrollReady === "true") {
      return;
    }

    document.body.dataset.smoothScrollReady = "true";

    document.addEventListener("click", (event) => {
      const link = event.target.closest(
        'a[href^="#"]'
      );

      if (!link) return;

      const href = link.getAttribute("href");

      if (!href || href === "#") return;

      // Handle top links even if no #top element exists.
      if (href === "#top") {
        event.preventDefault();
        scrollToTop();
        return;
      }

      let target;

      try {
        target = document.querySelector(href);
      } catch {
        return;
      }

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: reducedMotion.matches ? "auto" : "smooth",
        block: "start"
      });

      if (window.history?.replaceState) {
        window.history.replaceState(null, "", href);
      }
    });
  }

  function secureExternalLinks() {
    document.querySelectorAll(
      'a[target="_blank"]'
    ).forEach((link) => {
      const rel = new Set(
        (link.getAttribute("rel") || "")
          .split(/\s+/)
          .filter(Boolean)
      );

      rel.add("noopener");
      rel.add("noreferrer");

      link.setAttribute(
        "rel",
        Array.from(rel).join(" ")
      );
    });
  }

  function initializeInteractions() {
    updateCurrentYear();
    initializeBackToTop();
    initializeSmoothScrolling();
    secureExternalLinks();

    document.body.dataset.interactionsReady = "true";

    console.info("[Portfolio] Interactions initialized.");
  }

  function start() {
    if (
      document.body.dataset.componentsLoaded === "true"
    ) {
      initializeInteractions();
      return;
    }

    document.addEventListener(
      "portfolio:components-loaded",
      initializeInteractions,
      { once: true }
    );
  }

  window.PortfolioInteractions = {
    refresh() {
      updateCurrentYear();
      initializeBackToTop();
      secureExternalLinks();
    }
  };

  start();
})();
