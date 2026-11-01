
/* =========================================================
   FILE: js/animations.js
   PROJECT: PORTFOLIO-M
   PURPOSE: Automatic scroll reveal + stagger animations
   ========================================================= */

(() => {
  "use strict";

  const REVEAL_SELECTOR =
    ".reveal, .reveal-left, .reveal-right";

  const AUTO_REVEAL_SELECTOR = [
    ".hero-content",
    ".hero-visual",
    ".section-heading",
    ".about-preview-content",
    ".statistics-grid > *",
    ".skills-grid > *",
    ".projects-grid > *",
    ".services-preview-grid > *",
    ".journey-grid > *",
    ".contact-cta-card",
    ".footer-main > *"
  ].join(",");

  const STAGGER_GROUP_SELECTOR = [
    ".statistics-grid",
    ".skills-grid",
    ".projects-grid",
    ".services-preview-grid",
    ".journey-grid",
    ".footer-main"
  ].join(",");

  const CONFIG = {
    staggerDelay: 90,
    threshold: 0.08,
    rootMargin: "0px 0px -8% 0px"
  };

  let observer = null;
  let initialized = false;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  function findElements(root, selector) {
    const elements = [];

    if (root instanceof Element && root.matches(selector)) {
      elements.push(root);
    }

    if (root.querySelectorAll) {
      elements.push(...root.querySelectorAll(selector));
    }

    return [...new Set(elements)];
  }

  function prepareAutomaticReveals(root = document) {
    const targets = findElements(
      root,
      AUTO_REVEAL_SELECTOR
    );

    targets.forEach((element) => {
      if (
        !element.classList.contains("reveal") &&
        !element.classList.contains("reveal-left") &&
        !element.classList.contains("reveal-right")
      ) {
        element.classList.add("reveal");
      }
    });
  }

  function initializeStaggerGroups(root = document) {
    const groups = findElements(
      root,
      STAGGER_GROUP_SELECTOR
    );

    groups.forEach((group) => {
      Array.from(group.children).forEach((child, index) => {
        child.style.transitionDelay = reducedMotion.matches
          ? "0ms"
          : `${Math.min(index, 6) * CONFIG.staggerDelay}ms`;
      });
    });
  }

  function revealImmediately(elements) {
    elements.forEach((element) => {
      element.classList.add("is-visible");
      element.style.transitionDelay = "0ms";
    });
  }

  function createObserver() {
    if (!("IntersectionObserver" in window)) {
      return null;
    }

    return new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        });
      },
      {
        threshold: CONFIG.threshold,
        rootMargin: CONFIG.rootMargin
      }
    );
  }

  function observeElements(root = document) {
    const elements = findElements(
      root,
      REVEAL_SELECTOR
    );

    if (reducedMotion.matches || !observer) {
      revealImmediately(elements);
      return;
    }

    elements.forEach((element) => {
      if (!element.classList.contains("is-visible")) {
        observer.observe(element);
      }
    });
  }

  function initializeAnimations() {
    if (initialized) return;

    prepareAutomaticReveals();
    initializeStaggerGroups();

    observer = createObserver();

    document.body.dataset.animationsReady = "true";

    observeElements();

    initialized = true;

    console.info("[Animations] Initialized successfully.");
  }

  function refreshAnimations(root = document) {
    if (!initialized) {
      initializeAnimations();
      return;
    }

    prepareAutomaticReveals(root);
    initializeStaggerGroups(root);
    observeElements(root);
  }

  function handleMotionChange(event) {
    if (!event.matches) return;

    if (observer) {
      observer.disconnect();
    }

    revealImmediately(
      findElements(document, REVEAL_SELECTOR)
    );
  }

  function startAnimations() {
    if (document.body.dataset.componentsLoaded === "true") {
      initializeAnimations();
      return;
    }

    document.addEventListener(
      "portfolio:components-loaded",
      initializeAnimations,
      { once: true }
    );
  }

  if (typeof reducedMotion.addEventListener === "function") {
    reducedMotion.addEventListener(
      "change",
      handleMotionChange
    );
  } else {
    reducedMotion.addListener(handleMotionChange);
  }

  window.PortfolioAnimations = {
    refresh: refreshAnimations
  };

  startAnimations();

})();
