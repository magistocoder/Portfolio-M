
/* =========================================================
   PORTFOLIO-M — RESPONSIVE NAVIGATION
   Version: 6.0
   ========================================================= */

(() => {
  "use strict";

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
      console.warn("[Navigation] Required menu elements missing.");
      return;
    }

    if (!menu.id) {
      menu.id = "primary-navigation";
    }

    toggle.type = "button";
    toggle.setAttribute("aria-controls", menu.id);
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation menu");

    function setMenuState(open) {
      navbar.classList.toggle("is-open", open);
      menu.classList.toggle("is-open", open);

      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute(
        "aria-label",
        open ? "Close navigation menu" : "Open navigation menu"
      );
    }

    function closeMenu(returnFocus = false) {
      setMenuState(false);

      if (returnFocus) {
        toggle.focus();
      }
    }

    function toggleMenu() {
      const isOpen =
        toggle.getAttribute("aria-expanded") === "true";

      setMenuState(!isOpen);
    }

    // Hamburger button.
    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleMenu();
    });

    // Close after navigation.
    menu.addEventListener("click", (event) => {
      const link = event.target.closest("a");

      if (link) {
        closeMenu();
      }
    });

    // Close when clicking outside.
    document.addEventListener("click", (event) => {
      if (
        toggle.getAttribute("aria-expanded") === "true" &&
        !navbar.contains(event.target)
      ) {
        closeMenu();
      }
    });

    // Escape key closes the menu.
    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        toggle.getAttribute("aria-expanded") === "true"
      ) {
        closeMenu(true);
      }
    });

    // Reset menu when moving to desktop layout.
    const mediaQuery = window.matchMedia(
      `(min-width: ${BREAKPOINT}px)`
    );

    const handleBreakpoint = (event) => {
      if (event.matches) {
        closeMenu();
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener(
        "change",
        handleBreakpoint
      );
    } else {
      mediaQuery.addListener(handleBreakpoint);
    }

    // Restore a closed menu after browser navigation.
    window.addEventListener("pageshow", () => {
      closeMenu();
    });

    navbar.dataset.navigationReady = "true";

    console.info("[Navigation] Version 6.0 initialized.");
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

  window.PortfolioNavigation = {
    refresh: initializeNavigation,
    close: () => {
      const navbar = document.querySelector(".navbar");
      const menu = navbar?.querySelector(".nav-menu");
      const toggle = navbar?.querySelector(".menu-toggle");

      navbar?.classList.remove("is-open");
      menu?.classList.remove("is-open");

      toggle?.setAttribute("aria-expanded", "false");
      toggle?.setAttribute(
        "aria-label",
        "Open navigation menu"
      );
    }
  };

})();
