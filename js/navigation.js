
/* =========================================================
   FILE: js/navigation.js
   PROJECT: PORTFOLIO-M
   PURPOSE: Responsive and accessible navigation
   BRAND: MAGISTO TECHY
   ========================================================= */

(() => {
  "use strict";

  const BREAKPOINT = 900;

  function initializeNavigation() {
    const navbar = document.querySelector(".navbar");

    if (!navbar || navbar.dataset.navigationReady === "true") {
      return;
    }

    const toggle = navbar.querySelector(".menu-toggle");
    const menu = navbar.querySelector(".nav-menu");

    if (!toggle || !menu) {
      console.error("[Navigation] Menu elements not found.");
      return;
    }

    if (!menu.id) {
      menu.id = "primary-navigation";
    }

    toggle.type = "button";
    toggle.setAttribute("aria-controls", menu.id);
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation menu");

    function closeMenu() {
      navbar.classList.remove("is-open");
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation menu");
    }

    function openMenu() {
      navbar.classList.add("is-open");
      menu.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close navigation menu");
    }

    toggle.addEventListener("click", (event) => {
      event.stopPropagation();

      const isOpen =
        toggle.getAttribute("aria-expanded") === "true";

      isOpen ? closeMenu() : openMenu();
    });

    menu.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) return;

      if (event.target.closest("a")) {
        closeMenu();
      }
    });

    document.addEventListener("click", (event) => {
      if (!navbar.contains(event.target)) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        toggle.getAttribute("aria-expanded") === "true"
      ) {
        closeMenu();
        toggle.focus();
      }
    });

    const desktopQuery = window.matchMedia(
      `(min-width: ${BREAKPOINT}px)`
    );

    desktopQuery.addEventListener?.("change", (event) => {
      if (event.matches) closeMenu();
    });

    window.addEventListener("pageshow", closeMenu);

    navbar.dataset.navigationReady = "true";

    console.info("[Navigation] Initialized successfully.");
  }

  function startNavigation() {
    if (document.body.dataset.componentsLoaded === "true") {
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
