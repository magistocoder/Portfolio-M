
/* =========================================================
   FILE: js/interactions.js
   PROJECT: PORTFOLIO-M
   PURPOSE: Shared website interactions
   DESIGN: Liquid Glass UI
   ========================================================= */

(() => {
  "use strict";

  // Prevent duplicate initialization.
  if (window.PortfolioInteractionsInitialized) return;
  window.PortfolioInteractionsInitialized = true;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  let initialized = false;

  // -------------------------------------------------------
  // COMPONENT LOADING
  // -------------------------------------------------------

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

  // -------------------------------------------------------
  // BACK TO TOP
  // -------------------------------------------------------

  function initializeBackToTop() {
    const buttons = document.querySelectorAll(
      "[data-back-to-top]"
    );

    buttons.forEach((button) => {
      if (button.dataset.interactionReady === "true") return;

      button.dataset.interactionReady = "true";

      function updateVisibility() {
        const visible = window.scrollY > 400;

        button.classList.toggle("is-visible", visible);

        button.setAttribute(
          "aria-hidden",
          String(!visible)
        );

        button.tabIndex = visible ? 0 : -1;
      }

      button.addEventListener("click", (event) => {
        event.preventDefault();

        window.scrollTo({
          top: 0,
          behavior: reducedMotion.matches ? "auto" : "smooth"
        });
      });

      updateVisibility();

      window.addEventListener("scroll", updateVisibility, {
        passive: true
      });
    });
  }

  // -------------------------------------------------------
  // SMOOTH SCROLLING
  // -------------------------------------------------------

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

      target.scrollIntoView({
        behavior: reducedMotion.matches ? "auto" : "smooth",
        block: "start"
      });

      // Keep the URL hash in sync without creating
      // unnecessary browser history entries.
      if (window.history?.replaceState) {
        window.history.replaceState(
          null,
          "",
          href
        );
      }
    });
  }

  // -------------------------------------------------------
  // EXTERNAL LINK SECURITY
  // -------------------------------------------------------

  function secureExternalLinks(root = document) {
    const links = [];

    if (
      root instanceof Element &&
      root.matches('a[target="_blank"]')
    ) {
      links.push(root);
    }

    if (root.querySelectorAll) {
      links.push(
        ...root.querySelectorAll('a[target="_blank"]')
      );
    }

    links.forEach((link) => {
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

  // -------------------------------------------------------
  // BUTTON FEEDBACK
  // -------------------------------------------------------

  function initializeButtonFeedback(root = document) {
    const buttons = root.querySelectorAll(
      ".btn, .social-link, .contact-detail"
    );

    buttons.forEach((button) => {
      if (button.dataset.feedbackReady === "true") return;

      button.dataset.feedbackReady = "true";

      button.addEventListener("pointerdown", () => {
        button.classList.add("is-pressed");
      });

      ["pointerup", "pointerleave", "pointercancel"].forEach(
        (eventName) => {
          button.addEventListener(eventName, () => {
            button.classList.remove("is-pressed");
          });
        }
      );
    });
  }

  // -------------------------------------------------------
  // COPYRIGHT YEAR
  // -------------------------------------------------------

  function updateCurrentYear() {
    const year = new Date().getFullYear();

    document.querySelectorAll("[data-current-year]").forEach(
      (element) => {
        element.textContent = year;
      }
    );
  }

  // -------------------------------------------------------
  // INITIALIZE INTERACTIONS
  // -------------------------------------------------------

  function initializeInteractions() {
    if (initialized) return;

    initialized = true;

    updateCurrentYear();
    initializeBackToTop();
    initializeSmoothScrolling();
    secureExternalLinks();
    initializeButtonFeedback();

    document.body.dataset.interactionsReady = "true";

    console.info(
      "[Portfolio] Interactions initialized successfully."
    );
  }

  // -------------------------------------------------------
  // REFRESH FOR DYNAMIC COMPONENTS
  // -------------------------------------------------------

  function refreshInteractions(root = document) {
    updateCurrentYear();
    initializeBackToTop();
    secureExternalLinks(root);
    initializeButtonFeedback(root);
  }

  // -------------------------------------------------------
  // PUBLIC API
  // -------------------------------------------------------

  window.PortfolioInteractions = {
    refresh: refreshInteractions,
    initialize: initializeInteractions
  };

  onComponentsReady(initializeInteractions);

})();
