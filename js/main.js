
/* =========================================================
   PORTFOLIO-M — MAIN CONTROLLER
   Version: 6.0

   Responsibilities:
   - Active navigation link
   - Header scroll state
   - Animated statistics
   - Image fallback handling
   - Page initialization
   - Safe component-loader integration
   ========================================================= */

(() => {
  "use strict";

  if (window.PortfolioMainInitialized) return;

  window.PortfolioMainInitialized = true;

  let initialized = false;
  let headerScrollAttached = false;
  let statsObserver = null;

  /* ---------------------------------------------------------
     1. SHARED HELPERS
     --------------------------------------------------------- */

  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const selectAll = (selector, parent = document) =>
    Array.from(parent.querySelectorAll(selector));

  /* ---------------------------------------------------------
     2. ACTIVE NAVIGATION LINK
     --------------------------------------------------------- */

  function initializeActiveNavigation() {
    const currentPath = window.location.pathname
      .replace(/\/+$/, "")
      .toLowerCase();

    const currentFile = currentPath.split("/").pop() || "index.html";

    const links = selectAll(".nav-menu a[href]");

    links.forEach((link) => {
      const href = link.getAttribute("href");

      if (!href || href.startsWith("#")) return;

      let linkPath;

      try {
        linkPath = new URL(href, document.baseURI).pathname
          .replace(/\/+$/, "")
          .toLowerCase();
      } catch (error) {
        return;
      }

      const linkFile = linkPath.split("/").pop() || "index.html";

      const isActive =
        linkPath === currentPath ||
        linkFile === currentFile;

      link.classList.toggle("active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  /* ---------------------------------------------------------
     3. HEADER SCROLL EFFECT
     --------------------------------------------------------- */

  function updateHeaderState() {
    const header = document.querySelector(
      ".site-header, .navbar"
    );

    if (!header) return;

    header.classList.toggle(
      "is-scrolled",
      window.scrollY > 30
    );
  }

  function initializeHeaderScroll() {
    updateHeaderState();

    if (headerScrollAttached) return;

    window.addEventListener(
      "scroll",
      updateHeaderState,
      { passive: true }
    );

    headerScrollAttached = true;
  }

  /* ---------------------------------------------------------
     4. ANIMATED STATISTICS
     --------------------------------------------------------- */

  function animateCounter(element) {
    if (element.dataset.counterAnimated === "true") return;

    element.dataset.counterAnimated = "true";

    const rawValue =
      element.dataset.count ||
      element.dataset.target ||
      element.textContent.trim();

    const numericValue = Number(
      String(rawValue).replace(/[^0-9.-]/g, "")
    );

    if (!Number.isFinite(numericValue)) return;

    const originalText = element.textContent.trim();

    const prefix = originalText.match(/^[^0-9-]*/)?.[0] || "";
    const suffix = originalText.match(/[^0-9.]+$/)?.[0] || "";

    if (prefersReducedMotion()) {
      element.textContent =
        `${prefix}${numericValue.toLocaleString("en-IN")}${suffix}`;
      return;
    }

    const duration = 1400;
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const progress = Math.min(
        (currentTime - startTime) / duration,
        1
      );

      const easedProgress = 1 - Math.pow(1 - progress, 3);

      const currentValue = Math.round(
        numericValue * easedProgress
      );

      element.textContent =
        `${prefix}${currentValue.toLocaleString("en-IN")}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent =
          `${prefix}${numericValue.toLocaleString("en-IN")}${suffix}`;
      }
    }

    requestAnimationFrame(updateCounter);
  }

  function initializeStatistics() {
    const counters = selectAll(
      "[data-count], [data-counter], [data-target]"
    );

    if (!counters.length) return;

    if (!("IntersectionObserver" in window)) {
      counters.forEach(animateCounter);
      return;
    }

    if (statsObserver) {
      statsObserver.disconnect();
    }

    statsObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          animateCounter(entry.target);
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.45
      }
    );

    counters.forEach((counter) => {
      statsObserver.observe(counter);
    });
  }

  /* ---------------------------------------------------------
     5. IMAGE FALLBACK HANDLING
     --------------------------------------------------------- */

  function initializeImageFallbacks() {
    const images = selectAll("img");

    images.forEach((image) => {
      if (image.dataset.fallbackReady === "true") return;

      image.dataset.fallbackReady = "true";

      image.addEventListener("error", () => {
        image.classList.add("image-load-error");

        const fallback = image.closest(
          ".hero-image-frame, .about-profile-image, .image-wrapper"
        );

        if (fallback) {
          fallback.classList.add("has-image-error");
        }
      });
    });
  }

  /* ---------------------------------------------------------
     6. EXTERNAL LINK TARGETS
     --------------------------------------------------------- */

  function initializeExternalLinks() {
    selectAll('a[href^="http"]').forEach((link) => {
      if (link.hostname === window.location.hostname) return;

      if (link.hasAttribute("target")) return;

      link.setAttribute("target", "_blank");

      const rel = new Set(
        (link.getAttribute("rel") || "")
          .split(/\s+/)
          .filter(Boolean)
      );

      rel.add("noopener");
      rel.add("noreferrer");

      link.setAttribute("rel", [...rel].join(" "));
    });
  }

  /* ---------------------------------------------------------
     7. PAGE INITIALIZATION
     --------------------------------------------------------- */

  function initializeMain() {
    if (initialized) return;

    initialized = true;

    initializeActiveNavigation();
    initializeHeaderScroll();
    initializeStatistics();
    initializeImageFallbacks();
    initializeExternalLinks();

    document.documentElement.classList.add("main-ready");

    window.dispatchEvent(
      new CustomEvent("portfolio:main-ready")
    );
  }

  /* ---------------------------------------------------------
     8. COMPONENT LOADER COMPATIBILITY
     --------------------------------------------------------- */

  function startMain() {
    if (document.body?.dataset.componentsLoaded === "true") {
      initializeMain();
      return;
    }

    document.addEventListener(
      "portfolio:components-loaded",
      initializeMain,
      { once: true }
    );
  }

  /* ---------------------------------------------------------
     9. PUBLIC API
     --------------------------------------------------------- */

  window.PortfolioMain = {
    refresh() {
      initialized = false;
      initializeMain();
    },

    updateHeader: updateHeaderState,

    updateNavigation: initializeActiveNavigation
  };

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      startMain,
      { once: true }
    );
  } else {
    startMain();
  }

})();
