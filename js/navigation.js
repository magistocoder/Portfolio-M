
/* =========================================================
   PORTFOLIO-M — RESPONSIVE NAVIGATION
   Version: 5.0
   Purpose: Mobile menu, accessibility and navigation control
   ========================================================= */

(() => {
  "use strict";

  // Prevent duplicate initialization.
  if (window.PortfolioNavigationInitialized) return;
  window.PortfolioNavigationInitialized = true;

  const BREAKPOINT = 900;

  function initializeNavigation() {
    const navbar = document.querySelector(".navbar");

    if (!navbar || navbar.dataset.navigationReady === "true") {
      return;
    }

    const toggle = navbar.querySelector(".menu-toggle");
    const menu = navbar.querySelector(".nav-menu");

    if (!toggle || !menu) {
      console.warn("[Navigation] Menu elements not found.");
      return;
    }

    // Accessibility setup.
    if (!menu.id) {
      menu.id = "primary-navigation";
    }

    toggle.type = "button";
    toggle.setAttribute("aria-controls", menu.id);
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation menu");

    function closeMenu() {
      navbar.classList.remove("is-open", "open", "active");
      menu.classList.remove("is-open", "open", "active");

      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation menu");
    }

    function openMenu() {
      navbar.classList.add("is-open");
      menu.classList.add("is-open");

      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close navigation menu");
    }

    function toggleMenu() {
      const isOpen =
        toggle.getAttribute("aria-expanded") === "true";

      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    // Mobile menu button.
    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleMenu();
    });

    // Close after selecting a navigation link.
    menu.addEventListener("click", (event) => {
      const link = event.target.closest("a");

      if (link) {
        closeMenu();
      }
    });

    // Close when clicking outside the navigation.
    document.addEventListener("click", (event) => {
      if (!navbar.contains(event.target)) {
        closeMenu();
      }
    });

    // Close with Escape.
    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        toggle.getAttribute("aria-expanded") === "true"
      ) {
        closeMenu();
        toggle.focus();
      }
    });

    // Reset menu when switching to desktop layout.
    const desktopQuery = window.matchMedia(
      `(min-width: ${BREAKPOINT}px)`
    );

    const handleBreakpointChange = (event) => {
      if (event.matches) {
        closeMenu();
      }
    };

    if (desktopQuery.addEventListener) {
      desktopQuery.addEventListener(
        "change",
        handleBreakpointChange
      );
    } else {
      desktopQuery.addListener(handleBreakpointChange);
    }

    // Reset menu after browser restores the page.
    window.addEventListener("pageshow", closeMenu);

    navbar.dataset.navigationReady = "true";

    console.info("[Navigation] Ready.");
  }

  function startNavigation() {
    if (
      document.body &&
      document.body.dataset.componentsLoaded === "true"
    ) {
      initializeNavigation();
      return;
    }

    document.addEventListener(
      "portfolio:components-loaded",
      initializeNavigation,
      { once: true }
    );
  }

  startNavigation();
})();
