
/* =========================================================
   FILE: js/interactions.js
   PROJECT: PORTFOLIO-M
   PURPOSE: Global UI interactions
   DESIGN: Liquid Glass
   ========================================================= */

(() => {
  "use strict";

  // Prevent duplicate initialization.
  if (window.PortfolioInteractionsInitialized) return;
  window.PortfolioInteractionsInitialized = true;

  const Interactions = {
    initialized: false,

    // -----------------------------------------------------
    // INITIALIZE
    // -----------------------------------------------------

    init() {
      if (this.initialized) return;

      this.initialized = true;

      this.updateCurrentYear();
      this.initializeBackToTop();
      this.initializeSmoothScrolling();
      this.secureExternalLinks();
      this.initializeProjectFilters();

      console.info("[Portfolio] Interactions initialized.");
    },

    // -----------------------------------------------------
    // COPYRIGHT YEAR
    // -----------------------------------------------------

    updateCurrentYear() {
      const year = new Date().getFullYear();

      document.querySelectorAll("[data-current-year]").forEach(
        (element) => {
          element.textContent = year;
        }
      );
    },

    // -----------------------------------------------------
    // BACK TO TOP
    // -----------------------------------------------------

    initializeBackToTop() {
      const buttons = document.querySelectorAll(
        "[data-back-to-top]"
      );

      if (!buttons.length) return;

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const updateVisibility = () => {
        const shouldShow = window.scrollY > 400;

        buttons.forEach((button) => {
          button.classList.toggle(
            "is-visible",
            shouldShow
          );

          button.setAttribute(
            "aria-hidden",
            String(!shouldShow)
          );

          button.tabIndex = shouldShow ? 0 : -1;
        });
      };

      buttons.forEach((button) => {
        if (button.dataset.interactionReady === "true") {
          return;
        }

        button.dataset.interactionReady = "true";

        button.addEventListener("click", (event) => {
          event.preventDefault();

          window.scrollTo({
            top: 0,
            behavior: reducedMotion ? "auto" : "smooth"
          });
        });
      });

      if (!this.backToTopScrollReady) {
        window.addEventListener("scroll", updateVisibility, {
          passive: true
        });

        this.backToTopScrollReady = true;
      }

      updateVisibility();
    },

    // -----------------------------------------------------
    // SMOOTH ANCHOR SCROLLING
    // -----------------------------------------------------

    initializeSmoothScrolling() {
      if (this.smoothScrollReady) return;

      this.smoothScrollReady = true;

      document.addEventListener("click", (event) => {
        const link = event.target.closest(
          'a[href^="#"]'
        );

        if (!link) return;

        if (
          link.target === "_blank" ||
          link.hasAttribute("download")
        ) {
          return;
        }

        const href = link.getAttribute("href");

        if (!href || href === "#") return;

        // The footer uses #top as a back-to-top destination.
        if (href === "#top") {
          event.preventDefault();

          const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
          ).matches;

          window.scrollTo({
            top: 0,
            behavior: reducedMotion ? "auto" : "smooth"
          });

          return;
        }

        let target;

        try {
          target = document.querySelector(href);
        } catch {
          return;
        }

        if (!target) return;

        event.preventDefault();

        const reducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;

        target.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "start"
        });

        if (window.history?.replaceState) {
          window.history.replaceState(
            null,
            "",
            href
          );
        }
      });
    },

    // -----------------------------------------------------
    // EXTERNAL LINK SECURITY
    // -----------------------------------------------------

    secureExternalLinks() {
      document.querySelectorAll(
        'a[target="_blank"]'
      ).forEach((link) => {
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
      });
    },

    // -----------------------------------------------------
    // OPTIONAL PROJECT FILTER SUPPORT
    //
    // Future HTML can use:
    // button[data-project-filter="all"]
    // button[data-project-filter="technology"]
    // article[data-project-category="technology"]
    //
    // No filter controls currently exist in your ZIP.
    // -----------------------------------------------------

    initializeProjectFilters() {
      const filterButtons = document.querySelectorAll(
        "[data-project-filter]"
      );

      const projectCards = document.querySelectorAll(
        "[data-project-category]"
      );

      if (!filterButtons.length || !projectCards.length) {
        return;
      }

      filterButtons.forEach((button) => {
        if (button.dataset.filterReady === "true") {
          return;
        }

        button.dataset.filterReady = "true";

        button.addEventListener("click", () => {
          const selectedFilter =
            button.dataset.projectFilter;

          filterButtons.forEach((item) => {
            const active = item === button;

            item.classList.toggle("active", active);

            item.setAttribute(
              "aria-pressed",
              String(active)
            );
          });

          projectCards.forEach((card) => {
            const category =
              card.dataset.projectCategory;

            const visible =
              selectedFilter === "all" ||
              category === selectedFilter;

            card.hidden = !visible;
          });
        });
      });
    },

    // -----------------------------------------------------
    // REFRESH DYNAMIC COMPONENTS
    // -----------------------------------------------------

    refresh() {
      this.updateCurrentYear();
      this.initializeBackToTop();
      this.secureExternalLinks();
      this.initializeProjectFilters();
    }
  };

  // Public API for other scripts.
  window.PortfolioInteractions = Interactions;

  // -------------------------------------------------------
  // INITIALIZATION
  // -------------------------------------------------------

  function startInteractions() {
    if (
      document.body.dataset.componentsLoaded === "true"
    ) {
      Interactions.init();
      return;
    }

    document.addEventListener(
      "portfolio:components-loaded",
      () => Interactions.init(),
      { once: true }
    );
  }

  startInteractions();

})();
