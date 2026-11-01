
/* =========================================================
   PORTFOLIO-M — COMPONENT LOADER
   Version: 4.0
   Purpose:
   - Load shared HTML components
   - Resolve paths for homepage and inner pages
   - Prevent duplicate script loading
   - Initialize scripts in the correct order
   ========================================================= */

(() => {
    "use strict";

    // Prevent duplicate initialization.
    if (window.PortfolioLoaderInitialized) return;
    window.PortfolioLoaderInitialized = true;

    const ROOT = document.body.dataset.root || "./";

    const WEBSITE_ROOT = ROOT.endsWith("/")
        ? ROOT
        : `${ROOT}/`;

    const COMPONENT_FOLDER = "components/";

    const SCRIPT_FILES = [
        "js/navigation.js",
        "js/animations.js",
        "js/interactions.js",
        "js/main.js"
    ];

    const loadedScripts = new Set();

    // -----------------------------------------------------
    // PATH HANDLING
    // -----------------------------------------------------

    function normalizePath(value) {
        if (!value || typeof value !== "string") {
            return value;
        }

        const path = value.trim();

        if (
            path.startsWith("#") ||
            path.startsWith("//") ||
            path.startsWith("/") ||
            /^[a-z][a-z\d+.-]*:/i.test(path)
        ) {
            return value;
        }

        const cleanPath = path.replace(
            /^(\.\/|(?:\.\.\/))+/,
            ""
        );

        return `${WEBSITE_ROOT}${cleanPath}`;
    }

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
                if (!element.hasAttribute(attribute)) return;

                const original = element.getAttribute(attribute);

                if (!original) return;

                element.setAttribute(
                    attribute,
                    normalizePath(original)
                );
            });
        });
    }

    // -----------------------------------------------------
    // COMPONENT LOADING
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
            `${WEBSITE_ROOT}${COMPONENT_FOLDER}${name}.html`;

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status} while loading ${name}`
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

            slot.innerHTML = `
                <div class="component-error" role="alert">
                    <p>This section could not be loaded.</p>
                    <small>${name}</small>
                </div>
            `;

            slot.dataset.componentLoaded = "false";

            return {
                name,
                success: false,
                error: error.message
            };
        }
    }

    async function loadAllComponents() {
        const slots = [
            ...document.querySelectorAll("[data-component]")
        ];

        const results = await Promise.all(
            slots.map(loadComponent)
        );

        const successful = results.filter(
            item => item.success
        ).length;

        const failed = results.length - successful;

        const details = {
            total: results.length,
            successful,
            failed,
            results
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
    // DUPLICATE SCRIPT DETECTION
    // -----------------------------------------------------

    function findExistingScript(path) {
        const expectedPath = new URL(
            `${WEBSITE_ROOT}${path}`,
            document.baseURI
        ).pathname;

        return [...document.scripts].find(script => {
            if (!script.src) return false;

            try {
                return new URL(script.src).pathname === expectedPath;
            } catch {
                return false;
            }
        });
    }

    // -----------------------------------------------------
    // SCRIPT LOADING
    // -----------------------------------------------------

    function loadScript(path) {
        return new Promise((resolve, reject) => {
            if (loadedScripts.has(path)) {
                resolve(path);
                return;
            }

            const existingScript = findExistingScript(path);

            if (existingScript) {
                if (existingScript.dataset.portfolioLoaded === "true") {
                    loadedScripts.add(path);
                    resolve(path);
                    return;
                }

                if (existingScript.dataset.portfolioLoading === "true") {
                    existingScript.addEventListener(
                        "load",
                        () => {
                            loadedScripts.add(path);
                            resolve(path);
                        },
                        { once: true }
                    );

                    existingScript.addEventListener(
                        "error",
                        () => reject(
                            new Error(`Script failed: ${path}`)
                        ),
                        { once: true }
                    );

                    return;
                }

                // A script already included in the HTML will execute
                // independently. Do not inject another copy.
                loadedScripts.add(path);
                resolve(path);
                return;
            }

            const script = document.createElement("script");

            script.src = `${WEBSITE_ROOT}${path}`;
            script.async = false;
            script.dataset.portfolioLoading = "true";

            script.onload = () => {
                script.dataset.portfolioLoaded = "true";

                loadedScripts.add(path);

                console.info(
                    `[Portfolio] Script loaded: ${path}`
                );

                resolve(path);
            };

            script.onerror = () => {
                reject(
                    new Error(`Unable to load script: ${path}`)
                );
            };

            document.body.appendChild(script);
        });
    }

    async function loadAllScripts() {
        const results = [];

        for (const path of SCRIPT_FILES) {
            try {
                await loadScript(path);

                results.push({
                    path,
                    success: true
                });

            } catch (error) {
                console.error(
                    "[Portfolio] Script loading error:",
                    error
                );

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
    // INITIALIZATION
    // -----------------------------------------------------

    async function initializePortfolio() {
        console.info(
            "[Portfolio] Initialization started."
        );

        const components = await loadAllComponents();

        const scripts = await loadAllScripts();

        const successfulScripts = scripts.filter(
            item => item.success
        ).length;

        const failedScripts = scripts.length - successfulScripts;

        const details = {
            components,
            scripts,
            successfulScripts,
            failedScripts
        };

        document.body.dataset.portfolioReady =
            failedScripts === 0 ? "true" : "false";

        document.dispatchEvent(
            new CustomEvent("portfolio:ready", {
                detail: details
            })
        );

        console.info(
            "[Portfolio] Initialization finished.",
            details
        );

        return details;
    }

    // -----------------------------------------------------
    // PUBLIC API
    // -----------------------------------------------------

    window.PortfolioLoader = {
        initialize: initializePortfolio,
        loadComponent,
        loadAllComponents
    };

    window.portfolioComponentsReady =
        initializePortfolio();

})();
