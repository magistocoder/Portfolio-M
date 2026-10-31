
/* =========================================================
   FILE: js/navigation.js
   PROJECT: PORTFOLIO-M V2.0
   PURPOSE: Responsive navigation and mobile menu
   BRAND: MAGISTO TECHY
   ========================================================= */

(() => {
  "use strict";

  // -------------------------------------------------------
  // CONFIGURATION
  // -------------------------------------------------------

  const CONFIG = {
    breakpoint: 900,
    navbarSelector: ".navbar",
    toggleSelector: ".navbar-toggle",
    linksSelector: ".navbar-links",
    initializedAttribute: "data-navigation-ready"
  };

  let mediaQuery = null;

  // -------------------------------------------------------
  // INITIALIZATION GUARD
  // -------------------------------------------------------

  function initializeNavigation() {
    const navbar = document.querySelector(
      CONFIG.navbarSelector
    );

    if (!navbar) {
      console.warn("[Navigation] Navbar not found.");
      return;
    }

    if (
      navbar.getAttribute(CONFIG.initializedAttribute) === "true"
    ) {
      return;
    }

    const toggle = navbar.querySelector(
      CONFIG.toggleSelector
    );

    const links = navbar.querySelector(
      CONFIG.linksSelector
    );

    if (!toggle || !links) {
      console.warn(
        "[Navigation] Toggle or navigation links missing."
      );
      return;
    }

    // -----------------------------------------------------
    // ACCESSIBILITY SETUP
    // -----------------------------------------------------

    if (!links.id) {
      links.id = "primary-navigation";
    }

    toggle.type = "button";

    toggle.setAttribute("aria-controls", links.id);
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute(
      "aria-label",
      "Open navigation menu"
    );

    // -----------------------------------------------------
    // MENU FUNCTIONS
    // -----------------------------------------------------

    function closeMenu() {
      navbar.classList.remove("is-open");
      links.classList.remove("is-open");

      toggle.setAttribute("aria-expanded", "false");

      toggle.setAttribute(
        "aria-label",
        "Open navigation menu"
      );
    }

    function openMenu() {
      navbar.classList.add("is-open");
      links.classList.add("is-open");

      toggle.setAttribute("aria-expanded", "true");

      toggle.setAttribute(
        "aria-label",
        "Close navigation menu"
      );
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

    // -----------------------------------------------------
    // MOBILE MENU TOGGLE
    // -----------------------------------------------------

    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleMenu();
    });

    // -----------------------------------------------------
    // NAVIGATION LINK HANDLING
    // -----------------------------------------------------

    links.addEventListener("click", (event) => {
      const target = event.target;

      if (!(target instanceof Element)) return;

      const link = target.closest("a");

      if (!link || !links.contains(link)) return;

      closeMenu();
    });

    // -----------------------------------------------------
    // CLICK OUTSIDE TO CLOSE
    // -----------------------------------------------------

    document.addEventListener("click", (event) => {
      if (!navbar.contains(event.target)) {
        closeMenu();
      }
    });

    // -----------------------------------------------------
    // ESCAPE KEY SUPPORT
    // -----------------------------------------------------

    document.addEventListener("keydown", (event) => {
      const isOpen =
        toggle.getAttribute("aria-expanded") === "true";

      if (event.key === "Escape" && isOpen) {
        closeMenu();
        toggle.focus();
      }
    });

    // -----------------------------------------------------
    // RESPONSIVE BREAKPOINT
    // -----------------------------------------------------

    mediaQuery = window.matchMedia(
      `(min-width: ${CONFIG.breakpoint}px)`
    );

    function handleBreakpointChange(event) {
      if (event.matches) {
        closeMenu();
      }
    }

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener(
        "change",
        handleBreakpointChange
      );
    } else {
      mediaQuery.addListener(handleBreakpointChange);
    }

    // -----------------------------------------------------
    // BROWSER NAVIGATION RESET
    // -----------------------------------------------------

    window.addEventListener("pageshow", () => {
      closeMenu();
    });

    // -----------------------------------------------------
    // MARK INITIALIZATION COMPLETE
    // -----------------------------------------------------

    navbar.setAttribute(
      CONFIG.initializedAttribute,
      "true"
    );

    console.info(
      "[Navigation] Successfully initialized."
    );
  }

  // -------------------------------------------------------
  // WAIT FOR COMPONENT LOADER
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
