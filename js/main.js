
/* =========================================================
   PORTFOLIO-M — MAIN WEBSITE CONTROLLER
   Version: 5.0
   ========================================================= */

(() => {
  "use strict";

  if (window.PortfolioMainInitialized) return;
  window.PortfolioMainInitialized = true;

  const Portfolio = {
    initialized: false,

    init() {
      if (this.initialized) return;

      this.initialized = true;

      this.setCurrentYear();
      this.setActiveNavigation();
      this.markPageReady();

      window.dispatchEvent(
        new CustomEvent("portfolio:ready")
      );

      console.info("[Portfolio] Main controller ready.");
    },

    setCurrentYear() {
      const year = new Date().getFullYear();

      document.querySelectorAll(
        "[data-current-year], #current-year"
      ).forEach((element) => {
        element.textContent = year;
      });
    },

    normalizePath(path) {
      if (!path) return "/";

      let normalized = path.replace(/\/+/g, "/");

      // Treat /folder/index.html and /folder/ as equivalent.
      normalized = normalized.replace(/\/index\.html$/i, "/");

      if (!normalized.endsWith("/")) {
        normalized += "/";
      }

      return normalized;
    },

    setActiveNavigation() {
      const currentPath = this.normalizePath(
        window.location.pathname
      );

      const links = document.querySelectorAll(
        ".nav-menu a[href], .navbar-links a[href]"
      );

      links.forEach((link) => {
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

        // Only highlight links pointing to this website.
        if (linkURL.origin !== window.location.origin) {
          return;
        }

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

    markPageReady() {
      document.documentElement.classList.add(
        "portfolio-ready"
      );

      document.body.dataset.portfolioReady = "true";
    },

    refresh() {
      this.setCurrentYear();
      this.setActiveNavigation();
    }
  };

  window.Portfolio = Portfolio;

  function startPortfolio() {
    const readyPromise = window.portfolioComponentsReady;

    if (
      readyPromise &&
      typeof readyPromise.then === "function"
    ) {
      readyPromise
        .then(() => Portfolio.init())
        .catch((error) => {
          console.error(
            "[Portfolio] Component loading failed:",
            error
          );

          // Keep the page usable even if a component fails.
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
