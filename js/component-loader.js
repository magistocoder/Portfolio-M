
/* FILE: js/component-loader.js */

/* =========================================
   PORTFOLIO-M V2.0
   REUSABLE HTML COMPONENT LOADER
   Brand: MAGISTO TECHY
========================================= */

(() => {
    "use strict";

    // Read the project root from the current page.
    // Homepage: data-root="./"
    // Nested pages: data-root="../"
    const root = document.body.dataset.root || "./";

    const componentSlots = document.querySelectorAll(
        "[data-component]"
    );

    // Resolve local paths inside loaded components.
    function resolveComponentPath(path) {
        if (!path || typeof path !== "string") {
            return path;
        }

        const value = path.trim();

        // Keep external links, anchors and special URLs unchanged.
        if (
            /^(https?:|mailto:|tel:|data:|blob:|javascript:)/i.test(value) ||
            value.startsWith("#") ||
            value.startsWith("//") ||
            value.startsWith("/")
        ) {
            return value;
        }

        // Remove leading relative directory markers.
        const cleanPath = value.replace(/^(\.\.\/|\.\/)+/, "");

        return `${root}${cleanPath}`;
    }

    // Correct links and media paths inside a component.
    function normalizeComponentPaths(fragment) {
        const pathAttributes = [
            "href",
            "src",
            "action",
            "poster"
        ];

        fragment.querySelectorAll("*").forEach((element) => {
            pathAttributes.forEach((attribute) => {
                if (element.hasAttribute(attribute)) {
                    const originalPath = element.getAttribute(attribute);

                    element.setAttribute(
                        attribute,
                        resolveComponentPath(originalPath)
                    );
                }
            });

            // Also support lazy-loaded images.
            if (element.hasAttribute("data-src")) {
                const originalPath = element.getAttribute("data-src");

                element.setAttribute(
                    "data-src",
                    resolveComponentPath(originalPath)
                );
            }
        });
    }

    // Fetch and insert one component.
    async function loadComponent(slot) {
        const componentName = slot.dataset.component;

        if (!componentName) {
            return {
                name: "unknown",
                success: false
            };
        }

        // Only allow simple component filenames.
        if (!/^[a-z0-9-]+$/i.test(componentName)) {
            console.error(
                `Invalid component name: ${componentName}`
            );

            slot.textContent = "Component configuration error.";

            return {
                name: componentName,
                success: false
            };
        }

        const componentURL =
            `${root}components/${componentName}.html`;

        try {
            const response = await fetch(componentURL);

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }

            const html = await response.text();

            const template = document.createElement("template");
            template.innerHTML = html.trim();

            normalizeComponentPaths(template.content);

            slot.replaceChildren(template.content.cloneNode(true));

            slot.dataset.componentLoaded = "true";

            return {
                name: componentName,
                success: true
            };

        } catch (error) {
            console.error(
                `Failed to load component "${componentName}":`,
                error
            );

            slot.textContent =
                slot.dataset.componentFallback ||
                `Unable to load ${componentName}. Please refresh the page.`;

            slot.dataset.componentLoaded = "false";

            return {
                name: componentName,
                success: false,
                error
            };
        }
    }

    // Load all components before initializing dependent scripts.
    async function loadAllComponents() {
        const results = await Promise.all(
            Array.from(componentSlots).map(loadComponent)
        );

        const summary = {
            total: results.length,
            loaded: results.filter((item) => item.success).length,
            failed: results.filter((item) => !item.success).length
        };

        document.documentElement.dataset.componentsLoaded = "true";

        // Notify other scripts that component loading has finished.
        document.dispatchEvent(
            new CustomEvent("portfolio:components-loaded", {
                detail: {
                    results,
                    summary
                }
            })
        );

        console.info(
            `Portfolio components: ${summary.loaded}/${summary.total} loaded.`
        );

        return summary;
    }

    // Expose a promise so main.js can wait for components.
    window.portfolioComponentsReady = loadAllComponents();

})();
