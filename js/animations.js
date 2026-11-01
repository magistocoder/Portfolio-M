
/* =========================================================
   PORTFOLIO-M — SCROLL ANIMATION ENGINE
   Version: 5.0
   ========================================================= */

(() => {
  "use strict";

  if (window.PortfolioAnimationsInitialized) return;
  window.PortfolioAnimationsInitialized = true;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  let observer = null;

  function revealImmediately(elements) {
    elements.forEach((element) => {
      element.classList.add("is-visible");
    });
  }

  function initializeAnimations() {
    const elements = document.querySelectorAll(
      ".reveal, [data-reveal]"
    );

    if (!elements.length) {
      document.body.dataset.animationsReady = "true";
      return;
    }

    // Respect the visitor's accessibility preference.
    if (
      reducedMotion.matches ||
      !("IntersectionObserver" in window)
    ) {
      revealImmediately(elements);
      document.body.dataset.animationsReady = "true";
      return;
    }

    if (observer) {
      observer.disconnect();
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target;

          if (entry.isIntersecting) {
            element.classList.add("is-visible");
          } else {
            // Remove the class outside the viewport so the
            // animation can replay when the visitor scrolls back.
            element.classList.remove("is-visible");
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    elements.forEach((element) => {
      observer.observe(element);
    });

    document.body.dataset.animationsReady = "true";
  }

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

  // Allow newly inserted content to be animated later.
  window.PortfolioAnimations = {
    refresh() {
      initializeAnimations();
    },

    destroy() {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    }
  };

  // Reinitialize if the visitor changes motion preferences.
  const handleMotionChange = () => {
    initializeAnimations();
  };

  if (reducedMotion.addEventListener) {
    reducedMotion.addEventListener(
      "change",
      handleMotionChange
    );
  } else {
    reducedMotion.addListener(handleMotionChange);
  }

  startAnimations();

})();
