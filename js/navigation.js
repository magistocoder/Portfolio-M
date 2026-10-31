
/* FILE: js/navigation.js */

/* =========================================
   PORTFOLIO-M V2.0
   NAVIGATION CONTROLLER
   Brand: MAGISTO TECHY
========================================= */

(() => {
    "use strict";

    function initNavigation() {
        const navbar = document.querySelector(".navbar");

        if (!navbar) return;

        const toggle = navbar.querySelector(".navbar-toggle");
        const menu = navbar.querySelector(".navbar-links");

        if (!toggle || !menu) {
            console.warn(
                "Navigation toggle or menu element was not found."
            );
            return;
        }

        // Set up accessible menu attributes.
        if (!menu.id) {
            menu.id = "primary-navigation";
        }

        toggle.setAttribute("aria-controls", menu.id);
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open navigation menu");

        // Close the mobile menu.
        function closeMenu() {
            menu.classList.remove("is-open");

            toggle.setAttribute("aria-expanded", "false");
            toggle.setAttribute("aria-label", "Open navigation menu");

            toggle.classList.remove("is-active");
        }

        // Open or close the mobile menu.
        function toggleMenu() {
            const isOpen = menu.classList.toggle("is-open");

            toggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

            toggle.setAttribute(
                "aria-label",
                isOpen
                    ? "Close navigation menu"
                    : "Open navigation menu"
            );

            toggle.classList.toggle("is-active", isOpen);
        }

        // Toggle menu on button click.
        toggle.addEventListener("click", toggleMenu);

        // Close menu after selecting a navigation link.
        menu.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", closeMenu);
        });

        // Close menu when clicking outside navigation.
        document.addEventListener("click", (event) => {
            if (
                !navbar.contains(event.target) &&
                menu.classList.contains("is-open")
            ) {
                closeMenu();
            }
        });

        // Close menu using Escape key.
        document.addEventListener("keydown", (event) => {
            if (
                event.key === "Escape" &&
                menu.classList.contains("is-open")
            ) {
                closeMenu();
                toggle.focus();
            }
        });

        // Close menu when switching to desktop layout.
        const desktopQuery = window.matchMedia(
            "(min-width: 901px)"
        );

        desktopQuery.addEventListener("change", (event) => {
            if (event.matches) {
                closeMenu();
            }
        });

        // Prevent stale mobile menu state on page restoration.
        window.addEventListener("pageshow", closeMenu);

        console.info("Navigation initialized.");
    }

    // Components must exist before navigation is initialized.
    document.addEventListener(
        "portfolio:components-loaded",
        initNavigation,
        { once: true }
    );

    // Support pages where components were already loaded.
    if (
        document.documentElement.dataset.componentsLoaded === "true"
    ) {
        initNavigation();
    }

})();
