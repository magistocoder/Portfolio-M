
/* =========================================================
   PORTFOLIO-M — COMPONENT LOADER
   Version: 6.0

   Responsibilities:
   - Load reusable HTML components
   - Normalize component asset paths
   - Handle loading failures
   - Initialize JavaScript in the correct order
   - Prevent duplicate script loading
   - Expose a refresh API
   ========================================================= */

(() => {
  "use strict";

  if (window.PortfolioLoaderInitialized) return;

  window.PortfolioLoaderInitialized = true;

  const VERSION = "6.0";

  const ROOT = document.body.dataset.root || "./";

  const WEBSITE_ROOT = ROOT.endsWith("/")
    ? ROOT
    : `${ROOT}/`;

  const COMPONENT_SELECTOR = "[data-component]";

  const SCRIPT_FILES = [
    "js/navigation.js",
    "js/animations.js",
    "js/interactions.js",
    "js/main.js"
  ];

  let initializationPromise = null;

  /* ---------------------------------------------------------
     1. PATH NORMALIZATION
     --------------------------------------------------------- */

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

    fragment.querySelectorAll("*").forEach((element) => {
      attributes.forEach((attribute) => {
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

  /* ---------------------------------------------------------
     2. COMPONENT ERROR DISPLAY
     --------------------------------------------------------- */

  function showComponentError(slot, name, error) {
    console.error(
      `[Portfolio] Component failed: ${name}`,
      error
    );

    const message = document.createElement("div");

    message.className = "component-error";
    message.setAttribute("role", "alert");

    const title = document.createElement("p");

    title.textContent =
      "Unable to load this section. Please refresh the page.";

    const detail = document.createElement("small");

    detail.textContent = `Component: ${name}`;

    message.append(title, detail);

    slot.replaceChildren(message);

    slot.dataset.componentLoaded = "false";
  }

  /* ---------------------------------------------------------
     3. LOAD SINGLE COMPONENT
     --------------------------------------------------------- */

  async function loadComponent(slot, force = false) {
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

    if (
      !force &&
      slot.dataset.componentLoaded === "true"
    ) {
      return {
        name,
        success: true,
        skipped: true
      };
    }

    const url =
      `${WEBSITE_ROOT}components/${name}.html?v=${VERSION}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "text/html"
        },
        cache: "no-cache"
      });

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const html = await response.text();

      if (!html.trim()) {
        throw new Error("The component file is empty.");
      }

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
      showComponentError(slot, name, error);

      return {
        name,
        success: false,
        error: error.message
      };
    }
  }

  /* ---------------------------------------------------------
     4. LOAD ALL COMPONENTS
     --------------------------------------------------------- */

  async function loadAllComponents(force = false) {
    const slots = Array.from(
      document.querySelectorAll(COMPONENT_SELECTOR)
    );

    const results = await Promise.all(
      slots.map((slot) => loadComponent(slot, force))
    );

    const successful = results.filter(
      result => result.success
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
      `[Portfolio] Components: ${successful}/${results.length} loaded`
    );

    return details;
  }

  /* ---------------------------------------------------------
     5. SCRIPT LOADING
     --------------------------------------------------------- */

  function loadScript(path) {
    return new Promise((resolve) => {
      const scriptURL = new URL(
        `${WEBSITE_ROOT}${path}?v=${VERSION}`,
        window.location.href
      ).href;

      const existing = Array.from(
        document.scripts
      ).find((script) => script.src === scriptURL);

      if (existing) {
        resolve({
          path,
          success: true,
          skipped: true
        });

        return;
      }

      const script = document.createElement("script");

      script.src = scriptURL;
      script.async = false;
      script.dataset.portfolioScript = path;

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
        console.error(
          `[Portfolio] Script failed: ${path}`
        );

        resolve({
          path,
          success: false,
          error: `Unable to load ${path}`
        });
      };

      document.body.appendChild(script);
    });
  }

  /* ---------------------------------------------------------
     6. LOAD SCRIPTS IN SEQUENCE
     --------------------------------------------------------- */

  async function loadAllScripts() {
    const results = [];

    for (const path of SCRIPT_FILES) {
      const result = await loadScript(path);

      results.push(result);
    }

    return results;
  }

  /* ---------------------------------------------------------
     7. PORTFOLIO INITIALIZATION
     --------------------------------------------------------- */

  async function initializePortfolio(force = false) {
    if (initializationPromise && !force) {
      return initializationPromise;
    }

    initializationPromise = (async () => {
      console.info(
        "[Portfolio] Initialization started."
      );

      try {
        const components = await loadAllComponents(force);

        const scripts = await loadAllScripts();

        const successfulScripts = scripts.filter(
          script => script.success
        ).length;

        const failedScripts = scripts.length - successfulScripts;

        const details = {
          components,
          scripts,
          successfulScripts,
          failedScripts,
          totalScripts: scripts.length,
          success: failedScripts === 0
        };

        document.body.dataset.portfolioReady =
          details.success ? "true" : "partial";

        document.dispatchEvent(
          new CustomEvent("portfolio:loader-ready", {
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
    })();

    return initializationPromise;
  }

  /* ---------------------------------------------------------
     8. PUBLIC API
     --------------------------------------------------------- */

  window.PortfolioLoader = {
    version: VERSION,

    loadComponent,

    loadAllComponents,

    loadAllScripts,

    refresh() {
      return initializePortfolio(true);
    }
  };

  /* ---------------------------------------------------------
     9. START LOADING
     --------------------------------------------------------- */

  window.portfolioComponentsReady =
    initializePortfolio();

})();
