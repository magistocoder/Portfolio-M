
/* FILE: js/main.js */

/* =========================================
   PORTFOLIO-M V2.0
   CENTRAL JAVASCRIPT CONTROLLER
   Brand: MAGISTO TECHY
========================================= */

(() => {
    "use strict";

    const Portfolio = {
        initialized: false,

        // Initialize the website after components load.
        init() {
            if (this.initialized) return;

            this.initialized = true;

            console.info("MAGISTO TECHY Portfolio initialized.");

            this.setCurrentYear();
            this.setActiveNavigation();
            this.dispatchReadyEvent();
        },

        // Automatically update copyright year.
        setCurrentYear() {
            const yearElements = document.querySelectorAll(
                "[data-current-year]"
            );

            const currentYear = new Date().getFullYear();

            yearElements.forEach((element) => {
                element.textContent = currentYear;
            });
        },

        // Highlight the current page in navigation.
        setActiveNavigation() {
            const currentPath = window.location.pathname;

            const navigationLinks = document.querySelectorAll(
                ".navbar-links a, .footer-links a"
            );

            navigationLinks.forEach((link) => {
                const href = link.getAttribute("href");

                if (!href || href.startsWith("#")) return;

                try {
                    const linkURL = new URL(href, window.location.href);

                    const currentURL = new URL(window.location.href);

                    const normalizePath = (path) => {
                        return path.replace(/\/+$/, "") || "/";
                    };

                    const isCurrentPage =
                        normalizePath(linkURL.pathname) ===
                        normalizePath(currentURL.pathname);

                    if (isCurrentPage) {
                        link.classList.add("active");

                        if (link.closest(".navbar-links")) {
                            link.setAttribute("aria-current", "page");
                        }
                    } else {
                        link.classList.remove("active");
                        link.removeAttribute("aria-current");
                    }
                } catch (error) {
                    console.warn(
                        "Unable to evaluate navigation link:",
                        href
                    );
                }
            });
        },

        // Notify other scripts that the website is ready.
        dispatchReadyEvent() {
            document.dispatchEvent(
                new CustomEvent("portfolio:ready")
            );
        }
    };

    // Wait for the component loader.
    function startPortfolio() {
        if (Portfolio.initialized) return;

        Portfolio.init();
    }

    if (window.portfolioComponentsReady) {
        window.portfolioComponentsReady
            .then(startPortfolio)
            .catch((error) => {
                console.error(
                    "Component loading encountered an error:",
                    error
                );

                // Initialize the remaining page functionality.
                startPortfolio();
            });
    } else if (
        document.documentElement.dataset.componentsLoaded === "true"
    ) {
        startPortfolio();
    } else {
        document.addEventListener(
            "portfolio:components-loaded",
            startPortfolio,
            { once: true }
        );
    }

    // Expose the controller for debugging.
    window.Portfolio = Portfolio;

})();
