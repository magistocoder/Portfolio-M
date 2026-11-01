
/* =========================================================
   PORTFOLIO-M — ANIMATION CONTROLLER
   Version: 6.0

   Features:
   - Scroll reveal animations
   - Staggered card animations
   - IntersectionObserver support
   - Reduced-motion accessibility
   - Component-loader compatibility
   ========================================================= */

(() => {
  "use strict";

  if (window.PortfolioAnimationsInitialized) return;

  window.PortfolioAnimationsInitialized = true;

  let initialized = false;
  let revealObserver = null;

  const SELECTORS = [
    ".reveal",
    ".reveal-up",
    ".reveal-left",
    ".reveal-right",
    ".fade-in",
    ".fade-up",
    ".animate-on-scroll"
  ].join(",");

  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     1. MAKE ELEMENTS VISIBLE
     --------------------------------------------------------- */

  function revealImmediately(element) {
    element.classList.add("is-visible", "revealed");
  }

  /* ---------------------------------------------------------
     2. OBSERVER SETUP
     --------------------------------------------------------- */

  function createRevealObserver() {
    if (!("IntersectionObserver" in window)) {
      revealAll();
      return null;
    }

    return new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add(
            "is-visible",
            "revealed"
          );

          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -45px 0px"
      }
    );
  }

  /* ---------------------------------------------------------
     3. REVEAL ELEMENTS
     --------------------------------------------------------- */

  function initializeRevealElements() {
    const elements = Array.from(
      document.querySelectorAll(SELECTORS)
    );

    if (!elements.length) return;

    if (prefersReducedMotion()) {
      elements.forEach(revealImmediately);
      return;
    }

    if (!revealObserver) {
      revealObserver = createRevealObserver();
    }

    if (!revealObserver) return;

    elements.forEach((element) => {
      if (
        element.classList.contains("is-visible") ||
        element.classList.contains("revealed")
      ) {
        return;
      }

      revealObserver.observe(element);
    });
  }

  /* ---------------------------------------------------------
     4. STAGGERED CARD ANIMATIONS
     --------------------------------------------------------- */

  function initializeStaggeredCards() {
    const groups = document.querySelectorAll(
      ".skills-grid, .reels-grid, .services-grid, " +
      ".statistics-grid, .workflow-grid, .journey-grid"
    );

    groups.forEach((group) => {
      const cards = Array.from(group.children).filter(
        (child) =>
          child.matches(
            ".skill-card, .reel-card, .service-card, " +
            ".stat-card, .workflow-card, .journey-card"
          )
      );

      cards.forEach((card, index) => {
        if (card.dataset.staggerReady === "true") return;

        card.dataset.staggerReady = "true";

        card.style.setProperty(
          "--reveal-delay",
          `${Math.min(index * 90, 450)}ms`
        );
      });
    });
  }

  /* ---------------------------------------------------------
     5. REVEAL EVERYTHING
     --------------------------------------------------------- */

  function revealAll() {
    document.querySelectorAll(SELECTORS).forEach(
      revealImmediately
    );
  }

  /* ---------------------------------------------------------
     6. INITIALIZATION
     --------------------------------------------------------- */

  function initializeAnimations() {
    if (initialized) return;

    initialized = true;

    initializeStaggeredCards();
    initializeRevealElements();

    document.documentElement.classList.add(
      "animations-ready"
    );
  }

  /* ---------------------------------------------------------
     7. COMPONENT LOADER COMPATIBILITY
     --------------------------------------------------------- */

  function startAnimations() {
    if (document.body?.dataset.componentsLoaded === "true") {
      initializeAnimations();
      return;
    }

    document.addEventListener(
      "portfolio:components-loaded",
      initializeAnimations,
      { once: true }
    );
  }

  /* ---------------------------------------------------------
     8. PUBLIC API
     --------------------------------------------------------- */

  window.PortfolioAnimations = {
    refresh() {
      initialized = false;

      if (revealObserver) {
        revealObserver.disconnect();
        revealObserver = null;
      }

      initializeAnimations();
    },

    revealAll,

    observe(element) {
      if (!element) return;

      if (prefersReducedMotion()) {
        revealImmediately(element);
        return;
      }

      if (!revealObserver) {
        revealObserver = createRevealObserver();
      }

      revealObserver?.observe(element);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      startAnimations,
      { once: true }
    );
  } else {
    startAnimations();
  }

})();
