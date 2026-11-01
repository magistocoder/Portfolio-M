
/* =========================================================
   FILE: js/navigation.js
   PROJECT: PORTFOLIO-M
   PURPOSE: Responsive Liquid Glass Navigation
   ========================================================= */

(() => {
  "use strict";

  // Prevent duplicate initialization.
  if (window.PortfolioNavigationInitialized) return;
  window.PortfolioNavigationInitialized = true;

  const BREAKPOINT = 900;

  function initializeNavigation() {
    const navbar = document.querySelector(".navbar");
    const header = document.querySelector(".site-header");

    if (!navbar || navbar.dataset.navigationReady === "true") {
      return;
    }

    const toggle = navbar.querySelector(".menu-toggle");
    const menu = navbar.querySelector(".nav-menu");

    if (!toggle || !menu) {
      console.error("[Navigation] Required elements are missing.");
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

    menu.setAttribute("aria-label", "Website navigation");

    const desktopQuery = window.matchMedia(
      `(min-width: ${BREAKPOINT}px)`
    );

    let isOpen = false;

    // -----------------------------------------------------
    // OPEN MENU
    // -----------------------------------------------------

    function openMenu() {
      if (desktopQuery.matches) return;

      isOpen = true;

      navbar.classList.add("is-open");
      menu.classList.add("is-open");

      if (header) {
        header.classList.add("menu-open");
      }

      document.body.classList.add("navigation-open");

      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close navigation menu");
    }

    // -----------------------------------------------------
    // CLOSE MENU
    // -----------------------------------------------------

    function closeMenu(returnFocus = false) {
      isOpen = false;

      navbar.classList.remove("is-open");
      menu.classList.remove("is-open");

      if (header) {
        header.classList.remove("menu-open");
      }

      document.body.classList.remove("navigation-open");

      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation menu");

      if (returnFocus) {
        toggle.focus();
      }
    }

    // -----------------------------------------------------
    // TOGGLE BUTTON
    // -----------------------------------------------------

    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // -----------------------------------------------------
    // NAVIGATION LINKS
    // -----------------------------------------------------

    menu.addEventListener("click", (event) => {
      const link = event.target.closest("a");

      if (!link) return;

      closeMenu();

      // Allow normal browser navigation.
    });

    // -----------------------------------------------------
    // CLOSE WHEN CLICKING OUTSIDE
    // -----------------------------------------------------

    document.addEventListener("click", (event) => {
      if (!isOpen) return;

      if (
        !navbar.contains(event.target) &&
        !menu.contains(event.target)
      ) {
        closeMenu();
      }
    });

    // -----------------------------------------------------
    // ESCAPE KEY
    // -----------------------------------------------------

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isOpen) {
        closeMenu(true);
      }
    });

    // -----------------------------------------------------
    // RESPONSIVE BREAKPOINT
    // -----------------------------------------------------

    function handleBreakpointChange(event) {
      if (event.matches) {
        closeMenu();
      }
    }

    if (desktopQuery.addEventListener) {
      desktopQuery.addEventListener(
        "change",
        handleBreakpointChange
      );
    } else {
      desktopQuery.addListener(handleBreakpointChange);
    }

    // -----------------------------------------------------
    // PAGE RESTORATION
    // -----------------------------------------------------

    window.addEventListener("pageshow", () => {
      closeMenu();
    });

    // -----------------------------------------------------
    // INITIALIZE
    // -----------------------------------------------------

    navbar.dataset.navigationReady = "true";

    console.info("[Navigation] Liquid Glass navigation ready.");
  }

  // -------------------------------------------------------
  // COMPONENT LOADER COMPATIBILITY
  // -------------------------------------------------------

  function startNavigation() {
    if (
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
