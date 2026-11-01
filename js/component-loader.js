
/* =========================================================
   PORTFOLIO-M — COMPONENT LOADER
   Simple • Reliable • No duplicate scripts
   ========================================================= */

(() => {
  "use strict";

  if (window.PortfolioLoaderInitialized) return;
  window.PortfolioLoaderInitialized = true;

  const ROOT = document.body.dataset.root || "./";
  const WEBSITE_ROOT = ROOT.endsWith("/") ? ROOT : `${ROOT}/`;

  const COMPONENT_PATH = "components/";

  const COMPONENT_SELECTOR = "[data-component]";

  const SCRIPTS = [
    "js/navigation.js",
    "js/animations.js",
    "js/interactions.js",
    "js/main.js"
  ];

  /* -------------------------------------------------------
     PATH HANDLING
  ------------------------------------------------------- */

  function normalizePath(value) {
    if (!value || typeof value !== "string") return value;

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

        const value = element.getAttribute(attribute);

        if (value) {
          element.setAttribute(
            attribute,
            normalizePath(value)
          );
        }
      });
    });
  }

  /* -------------------------------------------------------
     LOAD HTML COMPONENTS
  ------------------------------------------------------- */

  async function loadComponent(slot) {
    const name = slot.dataset.component;

    if (!name || !/^[a-z0-9-]+$/i.test(name)) {
      console.error("[Portfolio] Invalid component:", name);
      return false;
    }

    const url = `${WEBSITE_ROOT}${COMPONENT_PATH}${name}.html`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();

      const template = document.createElement("template");
      template.innerHTML = html.trim();

      normalizeComponentPaths(template.content);

      slot.replaceChildren(
        template.content.cloneNode(true)
      );

      slot.dataset.componentLoaded = "true";

      return true;

    } catch (error) {
      console.error(
        `[Portfolio] Component failed: ${name}`,
        error
      );

      slot.innerHTML = `
        <div class="component-error" role="alert">
          <p>Unable to load this section.</p>
        </div>
      `;

      slot.dataset.componentLoaded = "false";

      return false;
    }
  }

  async function loadAllComponents() {
    const slots = [
      ...document.querySelectorAll(COMPONENT_SELECTOR)
    ];

    const results = await Promise.all(
      slots.map(loadComponent)
    );

    const details = {
      total: results.length,
      successful: results.filter(Boolean).length,
      failed: results.filter(result => !result).length
    };

    document.body.dataset.componentsLoaded = "true";

    document.dispatchEvent(
      new CustomEvent("portfolio:components-loaded", {
        detail: details
      })
    );

    return details;
  }

  /* -------------------------------------------------------
     PREVENT DUPLICATE SCRIPT LOADING
  ------------------------------------------------------- */

  function isScriptAlreadyIncluded(path) {
    return [...document.scripts].some(script => {
      if (!script.src) return false;

      try {
        const url = new URL(script.src, document.baseURI);

        return url.pathname.endsWith(`/${path}`);
      } catch {
        return false;
      }
    });
  }

  function loadScript(path) {
    return new Promise((resolve, reject) => {

      if (isScriptAlreadyIncluded(path)) {
        console.info(`[Portfolio] Already included: ${path}`);
        resolve(path);
        return;
      }

      const script = document.createElement("script");

      script.src = `${WEBSITE_ROOT}${path}`;
      script.async = false;

      script.onload = () => {
        console.info(`[Portfolio] Loaded: ${path}`);
        resolve(path);
      };

      script.onerror = () => {
        reject(new Error(`Failed to load ${path}`));
      };

      document.body.appendChild(script);
    });
  }

  async function loadAllScripts() {
    const results = [];

    for (const path of SCRIPTS) {
      try {
        await loadScript(path);

        results.push({
          path,
          success: true
        });

      } catch (error) {
        console.error("[Portfolio]", error);

        results.push({
          path,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  /* -------------------------------------------------------
     INITIALIZATION
  ------------------------------------------------------- */

  async function initializePortfolio() {
    console.info("[Portfolio] Starting...");

    const components = await loadAllComponents();

    const scripts = await loadAllScripts();

    const details = {
      components,
      scripts,
      ready: true
    };

    document.body.dataset.portfolioReady = "true";

    document.dispatchEvent(
      new CustomEvent("portfolio:ready", {
        detail: details
      })
    );

    console.info("[Portfolio] Ready.", details);

    return details;
  }

  /* -------------------------------------------------------
     PUBLIC ACCESS
  ------------------------------------------------------- */

  window.PortfolioLoader = {
    loadAllComponents,
    loadAllScripts,
    initialize: initializePortfolio
  };

  window.portfolioComponentsReady = initializePortfolio();

})();
