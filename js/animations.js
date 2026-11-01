
/* =========================================================
   PORTFOLIO-M — SCROLL ANIMATION SYSTEM
   Replays on scroll up and down.
   Safe for Instagram Reel cards and embedded videos.
   ========================================================= */

(() => {
  "use strict";

  // Prevent duplicate initialization.
  if (window.PortfolioAnimationsInitialized) return;
  window.PortfolioAnimationsInitialized = true;

  const REVEAL_SELECTOR = [
    ".reveal",
    ".reveal-left",
    ".reveal-right"
  ].join(",");

  const AUTO_REVEAL_SELECTOR = [
    ".hero-content",
    ".hero-visual",
    ".section-heading",
    ".about-preview-content",
    ".statistics-grid > *",
    ".skills-grid > *",
    ".projects-grid > *",
    ".reels-grid > *",
    ".reel-card",
    ".services-preview-grid > *",
    ".journey-grid > *",
    ".contact-cta-card",
    ".footer-main > *"
  ].join(",");

  const STAGGER_GROUP_SELECTOR = [
    ".statistics-grid",
    ".skills-grid",
    ".projects-grid",
    ".reels-grid",
    ".services-preview-grid",
    ".journey-grid",
    ".footer-main"
  ].join(",");

  const CONFIG = {
    staggerDelay: 80,
    threshold: 0.12,
    rootMargin: "0px 0px -8% 0px"
  };

  let observer = null;
  let initialized = false;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  // Find matching elements, including the root itself.
  function findElements(root, selector) {
    const elements = [];

    if (
      root instanceof Element &&
      root.matches(selector)
    ) {
      elements.push(root);
    }

    if (root.querySelectorAll) {
      elements.push(
        ...root.querySelectorAll(selector)
      );
    }

    return [...new Set(elements)];
  }

  // Add reveal classes to selected page elements.
  // Only the card/container is animated, not its video.
  function prepareAutomaticReveals(root = document) {
    const elements = findElements(
      root,
      AUTO_REVEAL_SELECTOR
    );

    elements.forEach((element) => {
      const alreadyHasRevealClass =
        element.classList.contains("reveal") ||
        element.classList.contains("reveal-left") ||
        element.classList.contains("reveal-right");

      if (!alreadyHasRevealClass) {
        element.classList.add("reveal");
      }
    });
  }

  // Add a small stagger effect to grid children.
  function initializeStaggerGroups(root = document) {
    const groups = findElements(
      root,
      STAGGER_GROUP_SELECTOR
    );

    groups.forEach((group) => {
      Array.from(group.children).forEach(
        (child, index) => {
          child.style.transitionDelay =
            reducedMotion.matches
              ? "0ms"
              : `${Math.min(index, 5) * CONFIG.staggerDelay}ms`;
        }
      );
    });
  }

  // Show elements immediately when animations are disabled.
  function revealImmediately(elements) {
    elements.forEach((element) => {
      element.classList.add("is-visible");
      element.style.transitionDelay = "0ms";
    });
  }

  // Continuously observe elements.
  // This allows animations to replay in both directions.
  function createObserver() {
    if (!("IntersectionObserver" in window)) {
      return null;
    }

    return new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          } else {
            entry.target.classList.remove("is-visible");
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
    const elements = findElements(
      root,
      REVEAL_SELECTOR
    );

    if (reducedMotion.matches || !observer) {
      revealImmediately(elements);
      return;
    }

    elements.forEach((element) => {
      observer.observe(element);
    });
  }

  // Main initialization.
  function initializeAnimations() {
    if (initialized) return;

    prepareAutomaticReveals();
    initializeStaggerGroups();

    observer = createObserver();

    document.body.dataset.animationsReady = "true";

    observeElements();

    initialized = true;

    console.info(
      "[Portfolio Animations] Ready."
    );
  }

  // Refresh animations after dynamically loaded content.
  function refreshAnimations(root = document) {
    prepareAutomaticReveals(root);
    initializeStaggerGroups(root);
    observeElements(root);
  }

  // Handle device accessibility preferences.
  function handleMotionChange(event) {
    if (event.matches) {
      if (observer) {
        observer.disconnect();
        observer = null;
      }

      revealImmediately(
        findElements(document, REVEAL_SELECTOR)
      );

      return;
    }

    if (!initialized) return;

    observer = createObserver();

    if (observer) {
      observeElements();
    }
  }

  // Wait until shared page components are available.
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

  if (
    typeof reducedMotion.addEventListener === "function"
  ) {
    reducedMotion.addEventListener(
      "change",
      handleMotionChange
    );
  } else {
    reducedMotion.addListener(handleMotionChange);
  }

  // Public refresh method.
  window.PortfolioAnimations = {
    refresh: refreshAnimations
  };

  startAnimations();

})();
