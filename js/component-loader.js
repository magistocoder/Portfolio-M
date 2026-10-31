
/* =========================================================
   FILE: js/component-loader.js
   PROJECT: PORTFOLIO-M V2.0
   PURPOSE: Reliable HTML component and script loading
   BRAND: MAGISTO TECHY
   ========================================================= */

(() => {
  "use strict";

  // -------------------------------------------------------
  // CONFIGURATION
  // -------------------------------------------------------

  const ROOT = document.body.dataset.root || "./";

  const COMPONENT_SELECTOR = "[data-component]";

  const COMPONENTS_PATH = "components/";

  const SCRIPTS = [
    "js/navigation.js",
    "js/animations.js",
    "js/interactions.js",
    "js/main.js"
  ];

  // Normalize the website root.
  const WEBSITE_ROOT = ROOT.endsWith("/")
    ? ROOT
    : `${ROOT}/`;

  // -------------------------------------------------------
  // PATH NORMALIZATION
  // -------------------------------------------------------

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

  // -------------------------------------------------------
  // NORMALIZE COMPONENT HTML PATHS
  // -------------------------------------------------------

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

        const normalized = normalizePath(original);

        element.setAttribute(attribute, normalized);
      });
    });
  }

  // -------------------------------------------------------
  // LOAD INDIVIDUAL COMPONENT
  // -------------------------------------------------------

  async function loadComponent(slot) {
    const name = slot.dataset.component;

    if (!name || !/^[a-z0-9-]+$/i.test(name)) {
      console.error("Invalid component name:", name);

      return {
        name: name || "unknown",
        success: false
      };
    }

    const url =
      `${WEBSITE_ROOT}${COMPONENTS_PATH}${name}.html`;

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

      console.info(`[Portfolio] Loaded: ${name}`);

      return {
        name,
        success: true
      };

    } catch (error) {
      console.error(
        `[Portfolio] Failed to load ${name}:`,
        error
      );

      slot.innerHTML = `
        <div class="component-error" role="alert">
          <p>Unable to load this section.</p>
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

  // -------------------------------------------------------
  // LOAD ALL HTML COMPONENTS
  // -------------------------------------------------------

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

  // -------------------------------------------------------
  // LOAD JAVASCRIPT FILES SEQUENTIALLY
  // -------------------------------------------------------

  function loadScript(path) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");

      script.src = `${WEBSITE_ROOT}${path}`;

      script.async = false;

      script.onload = () => {
        console.info(`[Portfolio] Script loaded: ${path}`);
        resolve(path);
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
        results.push({
          path,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  // -------------------------------------------------------
  // INITIALIZE PORTFOLIO
  // -------------------------------------------------------

  async function initializePortfolio() {
    console.info("[Portfolio] Initialization started.");

    try {
      // First: Load all HTML components.
      const components = await loadAllComponents();

      // Second: Load dependent JavaScript files.
      const scripts = await loadAllScripts();

      const successfulScripts = scripts.filter(
        script => script.success
      ).length;

      document.body.dataset.portfolioReady = "true";

      const details = {
        components,
        scripts,
        successfulScripts,
        totalScripts: scripts.length
      };

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

  // -------------------------------------------------------
  // PUBLIC API
  // -------------------------------------------------------

  window.portfolioComponentsReady = initializePortfolio();

})();
