
/* FILE: js/animations.js */

/* =========================================
   PORTFOLIO-M V2.0
   ANIMATION CONTROLLER
   Brand: MAGISTO TECHY
========================================= */

(() => {
    "use strict";

    function initAnimations() {
        // Prevent duplicate initialization.
        if (document.documentElement.dataset.animationsReady === "true") {
            return;
        }

        document.documentElement.dataset.animationsReady = "true";

        // Check accessibility preferences.
        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        const revealElements = document.querySelectorAll(
            ".reveal, .reveal-left, .reveal-right"
        );

        // Make every reveal element visible if motion is disabled.
        if (reducedMotion || !("IntersectionObserver" in window)) {
            revealElements.forEach((element) => {
                element.classList.add("is-visible");
            });

            console.info("Animations initialized without scroll effects.");
            return;
        }

        // Observe elements as they enter the viewport.
        const observer = new IntersectionObserver(
            (entries, currentObserver) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");

                        // Animate only once.
                        currentObserver.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -40px 0px"
            }
        );

        revealElements.forEach((element) => {
            observer.observe(element);
        });

        // Add staggered animation delays to grouped cards.
        const staggerGroups = document.querySelectorAll(
            "[data-stagger]"
        );

        staggerGroups.forEach((group) => {
            const children = Array.from(group.children);

            children.forEach((child, index) => {
                const delay = Math.min(index * 100, 500);

                child.style.transitionDelay = `${delay}ms`;
            });
        });

        console.info(
            `${revealElements.length} scroll-reveal elements initialized.`
        );
    }

    // Initialize after all HTML components have loaded.
    document.addEventListener(
        "portfolio:components-loaded",
        initAnimations,
        { once: true }
    );

    // Handle pages without component placeholders.
    if (
        document.documentElement.dataset.componentsLoaded === "true"
    ) {
        initAnimations();
    }

})();
