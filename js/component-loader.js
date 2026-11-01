
/* =========================================================
   PORTFOLIO-M — COMPONENT LOADER
   Version: 5.0
   Loads HTML components and initializes JavaScript.
   ========================================================= */

(() => {
  "use strict";

  if (window.PortfolioLoaderInitialized) return;
  window.PortfolioLoaderInitialized = true;

  const VERSION = "5.0";
  const ROOT = document.body.dataset.root || "./";
  const WEBSITE_ROOT = ROOT.endsWith("/") ? ROOT : `${ROOT}/`;

  const COMPONENT_SELECTOR = "[data-component]";

  const SCRIPTS = [
    "js/navigation.js",
    "js/animations.js",
    "js/interactions.js",
    "js/main.js"
  ];

  // -------------------------------------------------------
  // PATH HANDLING
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

  // -------------------------------------------------------
  // COMPONENT LOADING
  // -------------------------------------------------------

  async function loadComponent(slot) {
    const name = slot.dataset.component;

    if (!name || !/^[a-z0-9-]+$/i.test(name)) {
      console.error("[Portfolio] Invalid component:", name);

      return {
        name: name || "unknown",
        success: false
      };
    }

    if (slot.dataset.componentLoaded === "true") {
      return { name, success: true, skipped: true };
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

      slot.replaceChildren(template.content.cloneNode(true));

      slot.dataset.componentLoaded = "true";

      console.info(`[Portfolio] Component loaded: ${name}`);

      return {
        name,
        success: true
      };

    } catch (error) {
      console.error(
        `[Portfolio] Component failed: ${name}`,
        error
      );

      const message = document.createElement("div");
      message.className = "component-error";
      message.setAttribute("role", "alert");

      const title = document.createElement("p");
      title.textContent = "Unable to load this section.";

      const detail = document.createElement("small");
      detail.textContent = name;

      message.append(title, detail);
      slot.replaceChildren(message);

      slot.dataset.componentLoaded = "false";

      return {
        name,
        success: false,
        error: error.message
      };
    }
  }

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
      `[Portfolio] Components loaded: ${successful}/${results.length}`
    );

    return details;
  }

  // -------------------------------------------------------
  // SCRIPT LOADING
  // -------------------------------------------------------

  function loadScript(path) {
    return new Promise((resolve, reject) => {
      const scriptURL =
        `${WEBSITE_ROOT}${path}?v=${VERSION}`;

      // Avoid loading the same script twice.
      const existing = Array.from(
        document.scripts
      ).find((item) => {
        return item.src === new URL(
          scriptURL,
          window.location.href
        ).href;
      });

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
        console.info(`[Portfolio] Script loaded: ${path}`);

        resolve({
          path,
          success: true
        });
      };

      script.onerror = () => {
        const error = new Error(
          `Unable to load ${path}`
        );

        console.error("[Portfolio]", error);

        reject(error);
      };

      document.body.appendChild(script);
    });
  }

  async function loadAllScripts() {
    const results = [];

    // Keep the order. These files depend on components
    // being loaded before their initialization.
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

  // -------------------------------------------------------
  // PORTFOLIO INITIALIZATION
  // -------------------------------------------------------

  async function initializePortfolio() {
    console.info("[Portfolio] Initialization started.");

    try {
      const components = await loadAllComponents();

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
  }

  // -------------------------------------------------------
  // PUBLIC API
  // -------------------------------------------------------

  window.PortfolioLoader = {
    version: VERSION,

    refresh() {
      return initializePortfolio();
    }
  };

  window.portfolioComponentsReady = initializePortfolio();

})();
