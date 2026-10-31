
/* =========================================================
   FILE: js/navigation.js
   PROJECT: PORTFOLIO-M V2.0
   PURPOSE: Responsive navigation and mobile menu handling
   ========================================================= */

(() => {
  "use strict";

  const NAVIGATION = {
    desktopBreakpoint: 900,
    initializedAttribute: "data-navigation-ready"
  };

  let initialized = false;
  let mediaQuery = null;

  /**
   * Run callback when reusable components are available.
   * Handles both early and late script execution.
   */
  function onComponentsReady(callback) {
    if (
      document.body.dataset.componentsLoaded === "true" ||
      document.querySelector(".navbar")
    ) {
      callback();
      return;
    }

    document.addEventListener(
      "portfolio:components-loaded",
      callback,
      { once: true }
    );
  }

  function closeMenu(navbar, toggle, links) {
    navbar.classList.remove("is-open");
    links.classList.remove("is-open");

    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation menu");
  }

  function openMenu(navbar, toggle, links) {
    navbar.classList.add("is-open");
    links.classList.add("is-open");

    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close navigation menu");
  }

  function initializeNavigation() {
    if (initialized) return;

    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    if (navbar.hasAttribute(NAVIGATION.initializedAttribute)) {
      initialized = true;
      return;
    }

    const toggle = navbar.querySelector(".navbar-toggle");
    const links = navbar.querySelector(".navbar-links");

    if (!toggle || !links) {
      console.warn(
        "Navigation initialization skipped: toggle or links element missing."
      );
      return;
    }

    initialized = true;
    navbar.setAttribute(NAVIGATION.initializedAttribute, "true");

    // Accessibility setup
    if (!links.id) {
      links.id = "primary-navigation";
    }

    toggle.setAttribute("aria-controls", links.id);
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation menu");
    toggle.setAttribute("type", "button");

    // Responsive breakpoint
    mediaQuery = window.matchMedia(
      `(min-width: ${NAVIGATION.desktopBreakpoint}px)`
    );

    // Toggle mobile navigation
    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";

      if (isOpen) {
        closeMenu(navbar, toggle, links);
      } else {
        openMenu(navbar, toggle, links);
      }
    });

    // Close menu after selecting a navigation link
    links.addEventListener("click", (event) => {
      const link = event.target.closest("a");

      if (link) {
        closeMenu(navbar, toggle, links);
      }
    });

    // Close when clicking outside the navbar
    document.addEventListener("click", (event) => {
      if (
        !navbar.contains(event.target) &&
        toggle.getAttribute("aria-expanded") === "true"
      ) {
        closeMenu(navbar, toggle, links);
      }
    });

    // Close when Escape is pressed
    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        toggle.getAttribute("aria-expanded") === "true"
      ) {
        closeMenu(navbar, toggle, links);
        toggle.focus();
      }
    });

    // Close mobile menu when switching to desktop layout
    const handleBreakpointChange = (event) => {
      if (event.matches) {
        closeMenu(navbar, toggle, links);
      }
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleBreakpointChange);
    } else {
      // Compatibility fallback for older browsers
      mediaQuery.addListener(handleBreakpointChange);
    }

    // Reset menu state after browser back/forward navigation
    window.addEventListener("pageshow", () => {
      if (mediaQuery.matches) {
        closeMenu(navbar, toggle, links);
      }
    });
  }

  // Start only after the navbar component is available
  onComponentsReady(initializeNavigation);
})();
