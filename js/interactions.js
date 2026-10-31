
/* =========================================================
   FILE: js/interactions.js
   PROJECT: PORTFOLIO-M V2.0
   PURPOSE: General UI interactions
   ========================================================= */

(() => {
  "use strict";

  let initialized = false;

  /**
   * Wait until component loading has actually finished.
   */
  function onComponentsReady(callback) {
    if (document.body.dataset.componentsLoaded === "true") {
      callback();
      return;
    }

    document.addEventListener(
      "portfolio:components-loaded",
      callback,
      { once: true }
    );
  }

  /**
   * Update all copyright year placeholders.
   */
  function updateCurrentYear() {
    const year = new Date().getFullYear();

    document.querySelectorAll("[data-current-year]").forEach(
      (element) => {
        element.textContent = year;
      }
    );
  }

  /**
   * Initialize back-to-top functionality.
   */
  function initializeBackToTop() {
    const button = document.querySelector("[data-back-to-top]");

    if (!button || button.dataset.backToTopReady === "true") {
      return;
    }

    button.dataset.backToTopReady = "true";

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const updateVisibility = () => {
      const visible = window.scrollY > 400;

      button.classList.toggle("is-visible", visible);
      button.setAttribute("aria-hidden", String(!visible));
      button.tabIndex = visible ? 0 : -1;
    };

    button.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: reducedMotion ? "auto" : "smooth"
      });
    });

    window.addEventListener("scroll", updateVisibility, {
      passive: true
    });

    updateVisibility();
  }

  /**
   * Smooth scrolling for same-page links.
   */
  function initializeSmoothScrolling() {
    if (document.body.dataset.smoothScrollReady === "true") {
      return;
    }

    document.body.dataset.smoothScrollReady = "true";

    document.addEventListener("click", (event) => {
      const link = event.target.closest('a[href^="#"]');

      if (!link) return;

      const href = link.getAttribute("href");

      if (!href || href === "#") return;

      let target;

      try {
        target = document.querySelector(href);
      } catch {
        return;
      }

      if (!target) return;

      event.preventDefault();

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      target.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start"
      });

      if (window.history?.replaceState) {
        window.history.replaceState(null, "", href);
      }
    });
  }

  /**
   * Secure external links.
   */
  function secureExternalLinks() {
    document.querySelectorAll('a[target="_blank"]').forEach(
      (link) => {
        const rel = new Set(
          (link.getAttribute("rel") || "")
            .split(/\s+/)
            .filter(Boolean)
        );

        rel.add("noopener");
        rel.add("noreferrer");

        link.setAttribute("rel", Array.from(rel).join(" "));
      }
    );
  }

  /**
   * Prepare optional AJAX contact forms.
   * Standard FormSubmit forms are not intercepted.
   */
  function initializeContactForms() {
    document.querySelectorAll(
      'form[data-ajax="true"]'
    ).forEach((form) => {
      if (form.dataset.interactionReady === "true") return;

      form.dataset.interactionReady = "true";

      form.addEventListener("submit", (event) => {
        const status = form.querySelector("[data-form-status]");

        if (!status) return;

        event.preventDefault();

        status.textContent =
          "AJAX submission is not configured. Please use standard form submission.";

        status.setAttribute("role", "status");
      });
    });
  }

  /**
   * Initialize all interactions once.
   */
  function initializeInteractions() {
    if (initialized) return;

    initialized = true;

    updateCurrentYear();
    initializeBackToTop();
    initializeSmoothScrolling();
    secureExternalLinks();
    initializeContactForms();
  }

  /**
   * Refresh elements inserted after initial loading.
   */
  function refreshInteractions() {
    updateCurrentYear();
    initializeBackToTop();
    secureExternalLinks();
    initializeContactForms();
  }

  window.PortfolioInteractions = {
    refresh: refreshInteractions
  };

  onComponentsReady(initializeInteractions);

})();
