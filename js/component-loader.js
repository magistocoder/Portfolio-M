
/* =========================================================
   PORTFOLIO-M — COMPONENT LOADER
   Version: 5.0
   Purpose: Load shared HTML components and JavaScript files.
   ========================================================= */

(() => {
    "use strict";

    // Prevent duplicate initialization.
    if (window.PortfolioLoaderInitialized) {
        return;
    }

    window.PortfolioLoaderInitialized = true;

    // -----------------------------------------------------
    // CONFIGURATION
    // -----------------------------------------------------

    const ROOT = document.body.dataset.root || "./";

    const WEBSITE_ROOT = ROOT.endsWith("/")
        ? ROOT
        : `${ROOT}/`;

    const COMPONENT_VERSION = "5.0";

    const COMPONENT_SELECTOR = "[data-component]";

    const COMPONENTS_PATH = "components/";

    const SCRIPTS = [
        "js/navigation.js",
        "js/animations.js",
        "js/interactions.js",
        "js/main.js"
    ];

    // -----------------------------------------------------
    // PATH NORMALIZATION
    // -----------------------------------------------------

    function normalizePath(value) {
        if (!value || typeof value !== "string") {
            return value;
        }

        const path = value.trim();

        // Preserve external links, anchors and absolute paths.
        if (
            path.startsWith("#") ||
            path.startsWith("//") ||
            path.startsWith("/") ||
            /^[a-z][a-z\d+.-]*:/i.test(path)
        ) {
            return path;
        }

        const cleanPath = path.replace(
            /^(\.\/|(?:\.\.\/))+/,
            ""
        );

        return `${WEBSITE_ROOT}${cleanPath}`;
    }

    // -----------------------------------------------------
    // NORMALIZE COMPONENT LINKS AND MEDIA
    // -----------------------------------------------------

    function normalizeComponentPaths(fragment) {
        const attributes = [
            "href",
            "src",
            "action",
            "poster",
            "data-src"
        ];

        fragment.querySelectorAll("*").forEach(element => {
            attributes.forEach(attribute => {
                if (!element.hasAttribute(attribute)) {
                    return;
                }

                const original = element.getAttribute(attribute);

                if (!original) {
                    return;
                }

                element.setAttribute(
                    attribute,
                    normalizePath(original)
                );
            });
        });
    }

    // -----------------------------------------------------
    // LOAD ONE COMPONENT
    // -----------------------------------------------------

    async function loadComponent(slot) {
        const name = slot.dataset.component;

        if (!name || !/^[a-z0-9-]+$/i.test(name)) {
            console.error(
                "[Portfolio] Invalid component name:",
                name
            );

            return {
                name: name || "unknown",
                success: false
            };
        }

        const url =
            `${WEBSITE_ROOT}${COMPONENTS_PATH}${name}.html?v=${COMPONENT_VERSION}`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Accept: "text/html"
                }
            });

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }

            const html = await response.text();

            const template = document.createElement("template");

            template.innerHTML = html.trim();

            normalizeComponentPaths(template.content);

            slot.replaceChildren(
                template.content.cloneNode(true)
            );

            slot.dataset.componentLoaded = "true";

            console.info(
                `[Portfolio] Component loaded: ${name}`
            );

            return {
                name,
                success: true
            };

        } catch (error) {
            console.error(
                `[Portfolio] Component failed: ${name}`,
                error
            );

            const errorBox = document.createElement("div");

            errorBox.className = "component-error";
            errorBox.setAttribute("role", "alert");

            const message = document.createElement("p");
            message.textContent = "Unable to load this section.";

            const label = document.createElement("small");
            label.textContent = name;

            errorBox.append(message, label);

            slot.replaceChildren(errorBox);

            slot.dataset.componentLoaded = "false";

            return {
                name,
                success: false,
                error: error.message
            };
        }
    }

    // -----------------------------------------------------
    // LOAD ALL COMPONENTS
    // -----------------------------------------------------

    async function loadAllComponents() {
        const slots = Array.from(
            document.querySelectorAll(COMPONENT_SELECTOR)
        );

        const results = await Promise.all(
            slots.map(loadComponent)
        );

        const successful = results.filter(
            result => result.success
        ).length;

        const failed = results.length - successful;

        const details = {
            results,
            total: results.length,
            successful,
            failed
        };

        document.body.dataset.componentsLoaded = "true";

        document.dispatchEvent(
            new CustomEvent("portfolio:components-loaded", {
                detail: details
            })
        );

        console.info(
            `[Portfolio] Components: ${successful}/${results.length} loaded.`
        );

        return details;
    }

    // -----------------------------------------------------
    // LOAD JAVASCRIPT FILES
    // -----------------------------------------------------

    function loadScript(path) {
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");

            script.src = `${WEBSITE_ROOT}${path}?v=${COMPONENT_VERSION}`;

            script.async = false;

            script.onload = () => {
                console.info(
                    `[Portfolio] Script loaded: ${path}`
                );

                resolve({
                    path,
                    success: true
                });
            };

            script.onerror = () => {
                const error = new Error(
                    `Unable to load script: ${path}`
                );

                console.error("[Portfolio]", error);

                reject(error);
            };

            document.body.appendChild(script);
        });
    }

    // -----------------------------------------------------
    // LOAD SCRIPTS SEQUENTIALLY
    // -----------------------------------------------------

    async function loadAllScripts() {
        const results = [];

        for (const path of SCRIPTS) {
            try {
                const result = await loadScript(path);

                results.push(result);

            } catch (error) {
                results.push({
                    path,
                    success: false,
                    error: error.message
                });
            }
        }

        return results;
    }

    // -----------------------------------------------------
    // INITIALIZE PORTFOLIO
    // -----------------------------------------------------

    async function initializePortfolio() {
        console.info(
            "[Portfolio] Initialization started."
        );

        try {
            // First: Load HTML components.
            const components = await loadAllComponents();

            // Second: Load JavaScript files.
            const scripts = await loadAllScripts();

            const successfulScripts = scripts.filter(
                script => script.success
            ).length;

            const details = {
                components,
                scripts,
                successfulScripts,
                totalScripts: scripts.length
            };

            document.body.dataset.portfolioReady = "true";

            document.dispatchEvent(
                new CustomEvent("portfolio:ready", {
                    detail: details
                })
            );

            console.info(
                "[Portfolio] Initialization completed.",
                details
            );

            return details;

        } catch (error) {
            document.body.dataset.portfolioReady = "false";

            console.error(
                "[Portfolio] Initialization failed:",
                error
            );

            return {
                success: false,
                error: error.message
            };
        }
    }

    // -----------------------------------------------------
    // START
    // -----------------------------------------------------

    window.portfolioComponentsReady = initializePortfolio();

})();
