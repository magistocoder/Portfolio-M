
/* =========================================================
   FILE: js/animations.js
   PROJECT: PORTFOLIO-M V2.0
   PURPOSE: Scroll reveal and entrance animations
   BRAND: MAGISTO TECHY
   ========================================================= */

(() => {
  "use strict";

  // -------------------------------------------------------
  // CONFIGURATION
  // -------------------------------------------------------

  const CONFIG = {
    revealSelector: ".reveal, .reveal-left, .reveal-right",
    staggerSelector: "[data-stagger]",
    visibleClass: "is-visible",

    staggerDelay: 100,

    observerThreshold: 0.12,
    observerRootMargin: "0px 0px -50px 0px"
  };

  let observer = null;
  let initialized = false;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  // -------------------------------------------------------
  // IMMEDIATE REVEAL
  // -------------------------------------------------------

  function revealImmediately(elements) {
    elements.forEach((element) => {
      element.classList.add(CONFIG.visibleClass);
      element.style.transitionDelay = "0ms";
    });
  }

  // -------------------------------------------------------
  // STAGGER ANIMATIONS
  // -------------------------------------------------------

  function initializeStaggerGroups(root = document) {
    const groups = [];

    if (
      root instanceof Element &&
      root.matches(CONFIG.staggerSelector)
    ) {
      groups.push(root);
    }

    groups.push(
      ...root.querySelectorAll(CONFIG.staggerSelector)
    );

    groups.forEach((group) => {
      Array.from(group.children).forEach(
        (child, index) => {
          if (reducedMotion.matches) {
            child.style.transitionDelay = "0ms";
            return;
          }

          child.style.transitionDelay =
            `${index * CONFIG.staggerDelay}ms`;
        }
      );
    });
  }

  // -------------------------------------------------------
  // OBSERVER SETUP
  // -------------------------------------------------------

  function createObserver() {
    if (!("IntersectionObserver" in window)) {
      return null;
    }

    return new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add(
            CONFIG.visibleClass
          );

          currentObserver.unobserve(entry.target);
        });
      },
      {
        threshold: CONFIG.observerThreshold,
        rootMargin: CONFIG.observerRootMargin
      }
    );
  }

  // -------------------------------------------------------
  // INITIALIZE REVEAL ELEMENTS
  // -------------------------------------------------------

  function initializeRevealElements(root = document) {
    const elements = [];

    if (
      root instanceof Element &&
      root.matches(CONFIG.revealSelector)
    ) {
      elements.push(root);
    }

    elements.push(
      ...root.querySelectorAll(CONFIG.revealSelector)
    );

    if (!elements.length) return;

    if (reducedMotion.matches || !observer) {
      revealImmediately(elements);
      return;
    }

    elements.forEach((element) => {
      if (element.classList.contains(CONFIG.visibleClass)) {
        return;
      }

      observer.observe(element);
    });
  }

  // -------------------------------------------------------
  // INITIALIZE ANIMATIONS
  // -------------------------------------------------------

  function initializeAnimations() {
    if (initialized) return;

    initialized = true;

    observer = createObserver();

    initializeStaggerGroups();
    initializeRevealElements();

    document.body.dataset.animationsReady = "true";

    console.info(
      "[Animations] Successfully initialized."
    );
  }

  // -------------------------------------------------------
  // REFRESH DYNAMIC CONTENT
  // -------------------------------------------------------

  function refreshAnimations(root = document) {
    if (!initialized) {
      initializeAnimations();
      return;
    }

    initializeStaggerGroups(root);
    initializeRevealElements(root);
  }

  // -------------------------------------------------------
  // REDUCED MOTION CHANGES
  // -------------------------------------------------------

  function handleMotionChange(event) {
    if (!event.matches) return;

    const elements = document.querySelectorAll(
      CONFIG.revealSelector
    );

    if (observer) {
      observer.disconnect();
    }

    revealImmediately(Array.from(elements));
  }

  if (typeof reducedMotion.addEventListener === "function") {
    reducedMotion.addEventListener(
      "change",
      handleMotionChange
    );
  } else {
    reducedMotion.addListener(handleMotionChange);
  }

  // -------------------------------------------------------
  // CLEANUP
  // -------------------------------------------------------

  function destroyAnimations() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }

    initialized = false;

    delete document.body.dataset.animationsReady;

    console.info("[Animations] Observer cleaned up.");
  }

  // -------------------------------------------------------
  // PUBLIC API
  // -------------------------------------------------------

  window.PortfolioAnimations = {
    refresh: refreshAnimations,
    destroy: destroyAnimations
  };

  // -------------------------------------------------------
  // START AFTER COMPONENT LOADING
  // -------------------------------------------------------

  function startAnimations() {
    if (
      document.body.dataset.componentsLoaded === "true"
    ) {
      initializeAnimations();
      return;
    }

    document.addEventListener(
      "portfolio:components-loaded",
      initializeAnimations,
      { once: true }
    );
  }

  startAnimations();

})();
