
/* =========================================================
   PORTFOLIO-M — SCROLL ANIMATION ENGINE
   Replays reveal animations on scroll down AND scroll up.
   ========================================================= */

(() => {
  "use strict";

  if (window.PortfolioAnimationsInitialized) return;
  window.PortfolioAnimationsInitialized = true;

  const CONFIG = {
    selector: ".reveal, .reveal-left, .reveal-right",
    visibleClass: "is-visible",
    staggerDelay: 85,
    threshold: 0.12,
    rootMargin: "0px 0px -8% 0px"
  };

  const AUTO_REVEAL = [
    ".hero-content",
    ".hero-visual",
    ".section-heading",
    ".about-preview-content",
    ".statistics-grid > *",
    ".skills-grid > *",
    ".projects-grid > *",
    ".services-preview-grid > *",
    ".journey-grid > *",
    ".brand-grid > *",
    ".contact-cta-card",
    ".footer-main > *"
  ].join(",");

  const STAGGER_GROUPS = [
    ".statistics-grid",
    ".skills-grid",
    ".projects-grid",
    ".services-preview-grid",
    ".journey-grid",
    ".brand-grid",
    ".footer-main"
  ].join(",");

  let observer = null;
  let initialized = false;

  const motionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  function getElements(root, selector) {
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
    getElements(root, AUTO_REVEAL).forEach((element) => {
      element.classList.add("reveal");
    });
  }

  function prepareStaggerGroups(root = document) {
    getElements(root, STAGGER_GROUPS).forEach((group) => {
      Array.from(group.children).forEach((child, index) => {
        child.style.transitionDelay = motionQuery.matches
          ? "0ms"
          : `${Math.min(index, 7) * CONFIG.staggerDelay}ms`;
      });
    });
  }

  function revealAll(root = document) {
    getElements(root, CONFIG.selector).forEach((element) => {
      element.classList.add(CONFIG.visibleClass);
      element.style.transitionDelay = "0ms";
    });
  }

  function createObserver() {
    if (!("IntersectionObserver" in window)) return null;

    return new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target;

          if (entry.isIntersecting) {
            // Animate into view.
            element.classList.add(CONFIG.visibleClass);
          } else {
            // Reset when leaving view.
            // This allows the animation to replay on re-entry.
            element.classList.remove(CONFIG.visibleClass);
          }
        });
      },
      {
        threshold: CONFIG.threshold,
        rootMargin: CONFIG.rootMargin
      }
    );
  }

  function observeElements(root = document) {
    const elements = getElements(root, CONFIG.selector);

    if (motionQuery.matches || !observer) {
      revealAll(root);
      return;
    }

    elements.forEach((element) => {
      observer.observe(element);
    });
  }

  function initializeAnimations() {
    if (initialized) {
      refresh(document);
      return;
    }

    initialized = true;

    prepareAutomaticReveals();
    prepareStaggerGroups();

    observer = createObserver();

    document.body.dataset.animationsReady = "true";

    observeElements();

    console.info("[Portfolio] Scroll animations initialized.");
  }

  function refresh(root = document) {
    if (!initialized) {
      initializeAnimations();
      return;
    }

    prepareAutomaticReveals(root);
    prepareStaggerGroups(root);
    observeElements(root);
  }

  function handleMotionChange(event) {
    if (event.matches) {
      if (observer) observer.disconnect();
      revealAll();
      return;
    }

    if (observer) observer.disconnect();

    observer = createObserver();

    getElements(document, CONFIG.selector).forEach((element) => {
      element.classList.remove(CONFIG.visibleClass);
    });

    observeElements();
  }

  function start() {
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

  if (typeof motionQuery.addEventListener === "function") {
    motionQuery.addEventListener("change", handleMotionChange);
  } else {
    motionQuery.addListener(handleMotionChange);
  }

  window.PortfolioAnimations = {
    refresh,
    initialize: initializeAnimations
  };

  start();
})();
