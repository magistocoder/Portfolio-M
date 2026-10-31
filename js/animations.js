
/* =========================================================
   FILE: js/animations.js
   PROJECT: PORTFOLIO-M V2.0
   PURPOSE: Scroll reveal and entrance animations
   ========================================================= */

(() => {
  "use strict";

  const CONFIG = {
    revealSelector: ".reveal, .reveal-left, .reveal-right",
    staggerSelector: "[data-stagger]",
    visibleClass: "is-visible",
    initializedAttribute: "data-animations-ready",
    staggerDelay: 100,
    observerThreshold: 0.12,
    observerRootMargin: "0px 0px -50px 0px"
  };

  let observer = null;
  let initialized = false;

  /**
   * Wait for reusable components without missing
   * the event if they have already loaded.
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
   * Immediately reveal elements when animations
   * are unavailable or reduced motion is preferred.
   */
  function revealImmediately(elements) {
    elements.forEach((element) => {
      element.classList.add(CONFIG.visibleClass);
    });
  }

  /**
   * Apply staggered transition delays to children.
   */
  function initializeStaggerGroups() {
    const groups = document.querySelectorAll(
      CONFIG.staggerSelector
    );

    groups.forEach((group) => {
      const children = Array.from(group.children);

      children.forEach((child, index) => {
        child.style.transitionDelay =
          `${index * CONFIG.staggerDelay}ms`;
      });
    });
  }

  /**
   * Initialize scroll reveal observation.
   */
  function initializeRevealElements() {
    const elements = Array.from(
      document.querySelectorAll(CONFIG.revealSelector)
    );

    if (!elements.length) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (
      reducedMotion ||
      !("IntersectionObserver" in window)
    ) {
      revealImmediately(elements);
      return;
    }

    observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add(CONFIG.visibleClass);

          // Stop observing after the reveal animation.
          currentObserver.unobserve(entry.target);
        });
      },
      {
        threshold: CONFIG.observerThreshold,
        rootMargin: CONFIG.observerRootMargin
      }
    );

    elements.forEach((element) => {
      if (element.classList.contains(CONFIG.visibleClass)) {
        return;
      }

      observer.observe(element);
    });
  }

  /**
   * Initialize all animation features once.
   */
  function initializeAnimations() {
    if (initialized) return;

    if (
      document.body.dataset.animationsReady === "true"
    ) {
      initialized = true;
      return;
    }

    initialized = true;
    document.body.dataset.animationsReady = "true";

    initializeStaggerGroups();
    initializeRevealElements();
  }

  /**
   * Re-observe newly inserted reveal elements.
   * Useful if another script adds content later.
   */
  function refreshAnimations() {
    if (!initialized) return;

    const elements = document.querySelectorAll(
      CONFIG.revealSelector
    );

    if (!observer) {
      revealImmediately(Array.from(elements));
      return;
    }

    elements.forEach((element) => {
      if (
        !element.classList.contains(CONFIG.visibleClass)
      ) {
        observer.observe(element);
      }
    });
  }

  // Public refresh method for future dynamic sections.
  window.PortfolioAnimations = {
    refresh: refreshAnimations
  };

  onComponentsReady(initializeAnimations);
})();
