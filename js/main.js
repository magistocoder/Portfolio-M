
/* =========================================================
   FILE: js/main.js
   PROJECT: PORTFOLIO-M
   PURPOSE: Main website initialization
   DESIGN: Liquid Glass UI
   ========================================================= */

(() => {
  "use strict";

  // Prevent duplicate execution if the file is loaded twice.
  if (window.PortfolioMainInitialized) return;
  window.PortfolioMainInitialized = true;

  const Portfolio = {
    initialized: false,

    init() {
      if (this.initialized) return;

      this.initialized = true;

      this.setCurrentYear();
      this.setActiveNavigation();
      this.initializeExternalLinks();
      this.initializePageVisibility();

      document.documentElement.classList.add("portfolio-ready");
      document.body.dataset.portfolioReady = "true";

      console.info("[Portfolio] Main initialization complete.");
    },

    // -----------------------------------------------------
    // COPYRIGHT YEAR
    // -----------------------------------------------------

    setCurrentYear() {
      const year = new Date().getFullYear();

      document.querySelectorAll("[data-current-year]").forEach(
        (element) => {
          element.textContent = year;
        }
      );
    },

    // -----------------------------------------------------
    // PATH NORMALIZATION
    // -----------------------------------------------------

    normalizePath(path) {
      if (!path) return "/";

      let normalized = path
        .replace(/\/+/g, "/")
        .replace(/\/index\.html$/i, "");

      if (normalized.length > 1) {
        normalized = normalized.replace(/\/+$/, "");
      }

      return normalized || "/";
    },

    // -----------------------------------------------------
    // ACTIVE NAVIGATION
    // -----------------------------------------------------

    setActiveNavigation() {
      const currentURL = new URL(window.location.href);

      const currentPath = this.normalizePath(
        currentURL.pathname
      );

      const navigationLinks = document.querySelectorAll(
        ".nav-menu a[href], " +
        ".navbar-links a[href], " +
        ".mobile-bottom-nav a[href]"
      );

      navigationLinks.forEach((link) => {
        const href = link.getAttribute("href");

        if (
          !href ||
          href.startsWith("#") ||
          href.startsWith("mailto:") ||
          href.startsWith("tel:") ||
          href.startsWith("javascript:")
        ) {
          return;
        }

        let linkURL;

        try {
          linkURL = new URL(href, window.location.href);
        } catch {
          return;
        }

        if (linkURL.origin !== currentURL.origin) return;

        const linkPath = this.normalizePath(
          linkURL.pathname
        );

        const isActive = linkPath === currentPath;

        link.classList.toggle("active", isActive);

        if (isActive) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    },

    // -----------------------------------------------------
    // EXTERNAL LINK SECURITY
    // -----------------------------------------------------

    initializeExternalLinks() {
      document.querySelectorAll('a[target="_blank"]').forEach(
        (link) => {
          const relValues = new Set(
            (link.getAttribute("rel") || "")
              .split(/\s+/)
              .filter(Boolean)
          );

          relValues.add("noopener");
          relValues.add("noreferrer");

          link.setAttribute(
            "rel",
            Array.from(relValues).join(" ")
          );
        }
      );
    },

    // -----------------------------------------------------
    // PAGE VISIBILITY
    // -----------------------------------------------------

    initializePageVisibility() {
      document.body.classList.add("page-loaded");

      // Remove the loading state if the browser restores
      // the page from its back-forward cache.
      window.addEventListener("pageshow", () => {
        document.body.classList.add("page-loaded");
      });
    },

    // -----------------------------------------------------
    // REFRESH API
    // -----------------------------------------------------

    refresh() {
      this.setCurrentYear();
      this.setActiveNavigation();
      this.initializeExternalLinks();
    }
  };

  // Make the controller available to other project scripts.
  window.Portfolio = Portfolio;

  // -------------------------------------------------------
  // COMPONENT LOADING COMPATIBILITY
  // -------------------------------------------------------

  function startPortfolio() {
    const readyPromise = window.portfolioComponentsReady;

    if (readyPromise && typeof readyPromise.then === "function") {
      readyPromise
        .then(() => Portfolio.init())
        .catch((error) => {
          console.error(
            "[Portfolio] Component loading error:",
            error
          );

          // Keep the main page functional even if a component
          // fails to load.
          Portfolio.init();
        });

      return;
    }

    if (
      document.body.dataset.componentsLoaded === "true"
    ) {
      Portfolio.init();
      return;
    }

    document.addEventListener(
      "portfolio:components-loaded",
      () => Portfolio.init(),
      { once: true }
    );
  }

  startPortfolio();

})();
