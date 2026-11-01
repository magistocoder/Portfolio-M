
/* =========================================================
   PORTFOLIO-M — INTERACTIONS
   Version: 6.0
   Handles:
   - Smooth internal navigation
   - Back-to-top controls
   - Automatic footer year
   - Scroll-based visibility
   - Component-ready initialization
   ========================================================= */

(() => {
  "use strict";

  if (window.PortfolioInteractionsInitialized) return;

  window.PortfolioInteractionsInitialized = true;

  let initialized = false;
  let scrollHandlerAttached = false;

  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scrollToElement = (element) => {
    if (!element) return;

    element.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start"
    });
  };

  /* ---------------------------------------------------------
     1. AUTOMATIC FOOTER YEAR
     --------------------------------------------------------- */

  function updateFooterYear() {
    const currentYear = new Date().getFullYear();

    document.querySelectorAll(
      "#current-year, [data-current-year]"
    ).forEach((element) => {
      element.textContent = currentYear;
    });
  }

  /* ---------------------------------------------------------
     2. BACK TO TOP
     --------------------------------------------------------- */

  function updateBackToTopVisibility() {
    const isVisible = window.scrollY > 300;

    document.querySelectorAll(
      "[data-back-to-top], .back-to-top"
    ).forEach((button) => {
      button.classList.toggle("is-visible", isVisible);
      button.setAttribute("aria-hidden", String(!isVisible));

      if ("tabIndex" in button) {
        button.tabIndex = isVisible ? 0 : -1;
      }
    });
  }

  function initializeBackToTop() {
    const controls = document.querySelectorAll(
      "[data-back-to-top], .back-to-top"
    );

    controls.forEach((control) => {
      if (control.dataset.interactionReady === "true") return;

      control.dataset.interactionReady = "true";

      control.addEventListener("click", (event) => {
        const href = control.getAttribute("href");

        if (
          control.tagName === "BUTTON" ||
          href === "#top" ||
          href === "#"
        ) {
          event.preventDefault();

          window.scrollTo({
            top: 0,
            behavior: prefersReducedMotion() ? "auto" : "smooth"
          });
        }
      });
    });

    updateBackToTopVisibility();

    if (!scrollHandlerAttached) {
      window.addEventListener(
        "scroll",
        updateBackToTopVisibility,
        { passive: true }
      );

      scrollHandlerAttached = true;
    }
  }

  /* ---------------------------------------------------------
     3. SMOOTH INTERNAL NAVIGATION
     --------------------------------------------------------- */

  function initializeSmoothNavigation() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      if (link.dataset.smoothScrollReady === "true") return;

      if (link.matches("[data-back-to-top], .back-to-top")) return;

      link.dataset.smoothScrollReady = "true";

      link.addEventListener("click", (event) => {
        const href = link.getAttribute("href");

        if (!href || href === "#") return;

        let target;

        try {
          target = document.querySelector(href);
        } catch (error) {
          return;
        }

        if (!target) return;

        event.preventDefault();
        scrollToElement(target);

        if (target.id) {
          history.replaceState(null, "", `#${target.id}`);
        }
      });
    });
  }

  /* ---------------------------------------------------------
     4. EXTERNAL LINK SECURITY
     --------------------------------------------------------- */

  function secureExternalLinks() {
    document.querySelectorAll('a[target="_blank"]').forEach((link) => {
      const relValues = new Set(
        (link.getAttribute("rel") || "")
          .split(/\s+/)
          .filter(Boolean)
      );

      relValues.add("noopener");
      relValues.add("noreferrer");

      link.setAttribute("rel", [...relValues].join(" "));
    });
  }

  /* ---------------------------------------------------------
     5. MAIN INITIALIZATION
     --------------------------------------------------------- */

  function initializeInteractions() {
    if (initialized) return;

    initialized = true;

    updateFooterYear();
    initializeBackToTop();
    initializeSmoothNavigation();
    secureExternalLinks();

    document.documentElement.classList.add(
      "interactions-ready"
    );
  }

  /* ---------------------------------------------------------
     6. COMPONENT LOADER COMPATIBILITY
     --------------------------------------------------------- */

  function start() {
    if (document.body?.dataset.componentsLoaded === "true") {
      initializeInteractions();
      return;
    }

    document.addEventListener(
      "portfolio:components-loaded",
      initializeInteractions,
      { once: true }
    );
  }

  /* ---------------------------------------------------------
     7. PUBLIC REFRESH API
     --------------------------------------------------------- */

  window.PortfolioInteractions = {
    refresh() {
      initialized = false;
      initializeInteractions();
    },

    updateBackToTop: updateBackToTopVisibility
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, {
      once: true
    });
  } else {
    start();
  }

})();
