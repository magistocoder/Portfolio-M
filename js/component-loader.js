
/* =========================================================
   FILE: js/component-loader.js
   PROJECT: PORTFOLIO-M V2.0
   PURPOSE: Load reusable HTML components
   ========================================================= */

(() => {
  "use strict";

  const ROOT = document.body.dataset.root || "./";
  const COMPONENT_SELECTOR = "[data-component]";

  /**
   * Keep external URLs, page anchors and absolute URLs unchanged.
   * Normalize local paths relative to the website root.
   */
  function normalizePath(value) {
    if (!value || typeof value !== "string") {
      return value;
    }

    const path = value.trim();

    if (
      path.startsWith("#") ||
      path.startsWith("//") ||
      path.startsWith("/") ||
      /^[a-z][a-z\d+.-]*:/i.test(path) ||
      path.startsWith("data:")
    ) {
      return value;
    }

    const cleanPath = path.replace(/^(\.\/|(?:\.\.\/))+/, "");

    return `${ROOT}${cleanPath}`;
  }

  /**
   * Normalize paths inside a loaded component.
   */
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

        const originalValue = element.getAttribute(attribute);
        const normalizedValue = normalizePath(originalValue);

        element.setAttribute(attribute, normalizedValue);
      });
    });
  }

  /**
   * Load one component into its placeholder.
   */
  async function loadComponent(slot) {
    const componentName = slot.dataset.component;

    if (!componentName || !/^[a-z0-9-]+$/i.test(componentName)) {
      slot.innerHTML = "<!-- Invalid component name -->";

      return {
        name: componentName || "unknown",
        success: false
      };
    }

    const componentURL =
      `${ROOT}components/${componentName}.html`;

    try {
      const response = await fetch(componentURL, {
        method: "GET",
        headers: {
          "Accept": "text/html"
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

      return {
        name: componentName,
        success: true
      };

    } catch (error) {
      console.error(
        `Component loading failed: ${componentName}`,
        error
      );

      slot.innerHTML = `
        <div class="component-error" role="status">
          Component unavailable: ${componentName}
        </div>
      `;

      return {
        name: componentName,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Load every component placeholder on the page.
   */
  async function loadAllComponents() {
    const slots = Array.from(
      document.querySelectorAll(COMPONENT_SELECTOR)
    );

    const results = await Promise.all(
      slots.map((slot) => loadComponent(slot))
    );

    const successful = results.filter(
      (result) => result.success
    ).length;

    const failed = results.length - successful;

    document.body.dataset.componentsLoaded = "true";

    const event = new CustomEvent(
      "portfolio:components-loaded",
      {
        detail: {
          results,
          total: results.length,
          successful,
          failed
        }
      }
    );

    document.dispatchEvent(event);

    return {
      results,
      total: results.length,
      successful,
      failed
    };
  }

  // Expose the loading promise for other scripts.
  window.portfolioComponentsReady = loadAllComponents();

})();
