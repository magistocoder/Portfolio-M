
/* =========================================================
   FILE: js/interactions.js
   PROJECT: PORTFOLIO-M V2.0
   PURPOSE: General UI interactions and user experience
   ========================================================= */

(() => {
  "use strict";

  let initialized = false;

  /**
   * Wait for reusable components.
   * Handles scripts running before or after component loading.
   */
  function onComponentsReady(callback) {
    if (
      document.body.dataset.componentsLoaded === "true" ||
      document.querySelector(".navbar, .footer, [data-component]")
    ) {
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
   * Update copyright year automatically.
   */
  function updateCurrentYear() {
    const currentYear = new Date().getFullYear();

    document.querySelectorAll("[data-current-year]").forEach((element) => {
      element.textContent = currentYear;
    });
  }

  /**
   * Back-to-top button.
   */
  function initializeBackToTop() {
    const button = document.querySelector("[data-back-to-top]");

    if (!button) return;

    const visibilityThreshold = 400;

    const updateVisibility = () => {
      const shouldShow = window.scrollY > visibilityThreshold;

      button.classList.toggle("is-visible", shouldShow);
      button.setAttribute("aria-hidden", String(!shouldShow));
      button.tabIndex = shouldShow ? 0 : -1;
    };

    button.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches
          ? "instant"
          : "smooth"
      });
    });

    window.addEventListener("scroll", updateVisibility, {
      passive: true
    });

    updateVisibility();
  }

  /**
   * Smooth scrolling for same-page anchor links.
   */
  function initializeSmoothScrolling() {
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

      target.scrollIntoView({
        behavior: window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches
          ? "instant"
          : "smooth",
        block: "start"
      });

      // Keep the URL in sync without triggering a page jump.
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, "", href);
      }
    });
  }

  /**
   * External links opened in new tabs should be secure.
   */
  function secureExternalLinks() {
    document.querySelectorAll('a[target="_blank"]').forEach((link) => {
      const relValues = new Set(
        (link.getAttribute("rel") || "")
          .split(/\s+/)
          .filter(Boolean)
      );

      relValues.add("noopener");
      relValues.add("noreferrer");

      link.setAttribute("rel", Array.from(relValues).join(" "));
    });
  }

  /**
   * Contact form feedback.
   *
   * Native FormSubmit forms are not intercepted.
   * AJAX feedback is enabled only when data-ajax="true".
   */
  function initializeContactForms() {
    const forms = document.querySelectorAll(
      'form[data-ajax="true"]'
    );

    forms.forEach((form) => {
      if (form.dataset.interactionReady === "true") return;

      form.dataset.interactionReady = "true";

      form.addEventListener("submit", (event) => {
        const status = form.querySelector("[data-form-status]");

        if (!status) return;

        event.preventDefault();

        status.textContent =
          "AJAX submission is not configured yet. Please use the standard form submission.";

        status.setAttribute("role", "status");
      });
    });
  }

  /**
   * Initialize the complete interaction system.
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

  // Public refresh function for dynamically inserted content.
  window.PortfolioInteractions = {
    refresh() {
      updateCurrentYear();
      secureExternalLinks();
      initializeContactForms();
    }
  };

  onComponentsReady(initializeInteractions);
})();
