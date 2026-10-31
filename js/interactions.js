
/* FILE: js/interactions.js */

/* =========================================
   PORTFOLIO-M V2.0
   UI INTERACTIONS CONTROLLER
   Brand: MAGISTO TECHY
========================================= */

(() => {
    "use strict";

    function initInteractions() {
        if (document.documentElement.dataset.interactionsReady === "true") {
            return;
        }

        document.documentElement.dataset.interactionsReady = "true";

        // =====================================
        // 1. DYNAMIC COPYRIGHT YEAR
        // =====================================

        document.querySelectorAll("[data-current-year]").forEach((element) => {
            element.textContent = new Date().getFullYear();
        });

        // =====================================
        // 2. BACK TO TOP
        // =====================================

        const backToTop = document.querySelector("[data-back-to-top]");

        if (backToTop) {
            const updateBackToTop = () => {
                backToTop.classList.toggle(
                    "is-visible",
                    window.scrollY > 400
                );
            };

            window.addEventListener("scroll", updateBackToTop, {
                passive: true
            });

            updateBackToTop();

            backToTop.addEventListener("click", () => {
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            });
        }

        // =====================================
        // 3. SMOOTH INTERNAL NAVIGATION
        // =====================================

        document.querySelectorAll('a[href^="#"]').forEach((link) => {
            link.addEventListener("click", (event) => {
                const targetID = link.getAttribute("href");

                if (!targetID || targetID === "#") return;

                const target = document.querySelector(targetID);

                if (!target) return;

                event.preventDefault();

                target.scrollIntoView({
                    behavior: window.matchMedia(
                        "(prefers-reduced-motion: reduce)"
                    ).matches ? "auto" : "smooth",
                    block: "start"
                });

                // Keep keyboard navigation accessible.
                if (!target.hasAttribute("tabindex")) {
                    target.setAttribute("tabindex", "-1");
                }

                target.focus({ preventScroll: true });
            });
        });

        // =====================================
        // 4. CONTACT FORM FEEDBACK
        // =====================================

        const contactForms = document.querySelectorAll(
            ".contact-form"
        );

        contactForms.forEach((form) => {
            form.addEventListener("submit", (event) => {
                // Let native HTML validation run first.
                if (!form.checkValidity()) {
                    return;
                }

                // Do not interrupt normal FormSubmit submission.
                if (form.dataset.ajax === "true") {
                    event.preventDefault();

                    const status = form.querySelector(
                        "[data-form-status]"
                    );

                    if (status) {
                        status.textContent =
                            "Your form is being processed...";
                        status.setAttribute("role", "status");
                    }
                }
            });
        });

        // =====================================
        // 5. EXTERNAL LINKS
        // =====================================

        document.querySelectorAll('a[target="_blank"]').forEach((link) => {
            const relValues = new Set(
                (link.getAttribute("rel") || "")
                    .split(/\s+/)
                    .filter(Boolean)
            );

            relValues.add("noopener");
            relValues.add("noreferrer");

            link.setAttribute("rel", [...relValues].join(" "));
        });

        console.info("Portfolio interactions initialized.");
    }

    // Wait until components have been inserted.
    document.addEventListener(
        "portfolio:components-loaded",
        initInteractions,
        { once: true }
    );

    // Support pages without component placeholders.
    if (
        document.documentElement.dataset.componentsLoaded === "true"
    ) {
        initInteractions();
    }

})();

/* =========================================
   OPTIONAL BACK-TO-TOP BUTTON MARKUP

   <button
       type="button"
       data-back-to-top
       aria-label="Back to top"
   >
       ↑
   </button>

   Add class "is-visible" through JavaScript.
========================================= */
