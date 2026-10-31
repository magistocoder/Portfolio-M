
/* =========================================================
   FILE: js/main.js
   PROJECT: PORTFOLIO-M V2.0
   PURPOSE: Main website initialization
   ========================================================= */

(() => {
  "use strict";

  const Portfolio = {
    initialized: false,

    /**
     * Start the website after reusable components load.
     */
    async init() {
      if (this.initialized) return;

      this.initialized = true;

      this.setCurrentYear();
      this.setActiveNavigation();
      this.markPageReady();

      window.dispatchEvent(
        new CustomEvent("portfolio:ready")
      );
    },

    /**
     * Automatically update copyright year.
     */
    setCurrentYear() {
      const year = new Date().getFullYear();

      document.querySelectorAll("[data-current-year]").forEach(
        (element) => {
          element.textContent = year;
        }
      );
    },

    /**
     * Highlight the navigation link matching
     * the current page.
     */
    setActiveNavigation() {
      const currentPath = this.normalizePath(
        window.location.pathname
      );

      document.querySelectorAll(".navbar-links a[href]").forEach(
        (link) => {
          const href = link.getAttribute("href");

          if (
            !href ||
            href.startsWith("#") ||
            href.startsWith("mailto:") ||
            href.startsWith("tel:")
          ) {
            return;
          }

          let linkURL;

          try {
            linkURL = new URL(href, window.location.href);
          } catch {
            return;
          }

          if (linkURL.origin !== window.location.origin) {
            return;
          }

          const linkPath = this.normalizePath(
            linkURL.pathname
          );

          const isHomePage =
            currentPath.endsWith("/index.html") ||
            currentPath === "/Portfolio-M/" ||
            currentPath === "/";

          const matchesHome =
            isHomePage &&
            (
              linkPath.endsWith("/index.html") ||
              linkPath === "/Portfolio-M/" ||
              linkPath === "/"
            );

          const isActive =
            matchesHome ||
            (
              !isHomePage &&
              linkPath === currentPath
            );

          if (isActive) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
          } else {
            link.classList.remove("active");
            link.removeAttribute("aria-current");
          }
        }
      );
    },

    /**
     * Normalize paths for consistent comparison.
     */
    normalizePath(path) {
      if (!path) return "/";

      let normalized = path.replace(/\/+/g, "/");

      if (normalized.length > 1) {
        normalized = normalized.replace(/\/$/, "");
      }

      return normalized;
    },

    /**
     * Mark the website as initialized.
     */
    markPageReady() {
      document.documentElement.classList.add(
        "portfolio-ready"
      );

      document.body.dataset.portfolioReady = "true";
    }
  };

  /**
   * Wait for component loading.
   * The promise also handles the case where components
   * have already finished loading.
   */
  function startPortfolio() {
    const readyPromise = window.portfolioComponentsReady;

    if (readyPromise && typeof readyPromise.then === "function") {
      readyPromise
        .then(() => Portfolio.init())
        .catch((error) => {
          console.error(
            "Portfolio component loading encountered an error:",
            error
          );

          Portfolio.init();
        });

      return;
    }

    if (
      document.body.dataset.componentsLoaded === "true" ||
      document.querySelector(".navbar")
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

  // Make the main controller available to other scripts.
  window.Portfolio = Portfolio;

  startPortfolio();

})();
