
# PORTFOLIO-M V2.0

### Personal Portfolio Website — Abhinand A.S.

> Technology. Creativity. Innovation.

PORTFOLIO-M is a modern, responsive, multi-page personal portfolio website designed to showcase my digital identity, technology content, creative projects, professional services and brand collaborations.

The project uses a modular architecture with reusable HTML components, separated CSS stylesheets and JavaScript ES modules.

---

## 01. Project Overview

| Property | Details |
|---|---|
| Project Name | PORTFOLIO-M |
| Version | 2.0 |
| Owner | Abhinand A.S. |
| Brand | MAGISTO TECHY |
| Project Type | Personal Portfolio |
| Architecture | Multi-page |
| Frontend | HTML5, CSS3, JavaScript |
| Deployment | GitHub Pages |
| Status | Development |

---

## 02. Project Objectives

The primary objectives of PORTFOLIO-M are:

- Establish a professional digital identity.
- Showcase technology content creation.
- Present UGC creation services.
- Display creative projects and experiments.
- Showcase brand collaborations.
- Provide a professional contact channel.
- Maintain a scalable and maintainable codebase.

---

## 03. Technology Stack

### Core Technologies

- HTML5 — Semantic page structure.
- CSS3 — Visual design and responsive layouts.
- JavaScript — Interactive functionality.
- ES Modules — Modular JavaScript architecture.

### Typography

- Space Grotesk — Headings and display typography.
- DM Sans — Body text and interface elements.

### Deployment

- GitHub — Source code management.
- GitHub Pages — Website hosting.

No frontend framework is required for the initial implementation.

---

## 04. Project Architecture

```text
Portfolio-M/
│
├── index.html
│
├── pages/
│   ├── about.html
│   ├── projects.html
│   ├── services.html
│   ├── collaborations.html
│   └── contact.html
│
├── components/
│   ├── navbar.html
│   ├── footer.html
│   ├── hero.html
│   ├── statistics.html
│   ├── skills.html
│   ├── project-cards.html
│   └── contact-section.html
│
├── css/
│   ├── reset.css
│   ├── variables.css
│   ├── global.css
│   ├── layout.css
│   ├── components.css
│   ├── animations.css
│   ├── responsive.css
│   └── style.css
│
├── js/
│   ├── main.js
│   ├── component-loader.js
│   ├── navigation.js
│   ├── animations.js
│   └── interactions.js
│
├── assets/
│   ├── images/
│   ├── icons/
│   ├── fonts/
│   └── projects/
│
└── README.md
```

---

## 05. Page Architecture

### Homepage — index.html

The main landing page.

Components:
- Navigation
- Hero section
- Statistics
- About preview
- Skills
- Featured projects
- Services preview
- Contact section
- Footer

### About — pages/about.html

Personal introduction, background, expertise and creative journey.

### Projects — pages/projects.html

Portfolio projects, digital experiments and selected work.

### Services — pages/services.html

Content creation, UGC production and creative services.

### Collaborations — pages/collaborations.html

Brand partnerships, campaign showcases and collaboration information.

### Contact — pages/contact.html

Professional enquiries and collaboration contact information.

---

## 06. Reusable Components

Components are maintained independently inside the `components/` directory.

| Component | Responsibility |
|---|---|
| navbar.html | Global navigation |
| footer.html | Global footer |
| hero.html | Homepage introduction |
| statistics.html | Creator statistics |
| skills.html | Expertise showcase |
| project-cards.html | Featured projects |
| contact-section.html | Contact CTA |

The component loader inserts these HTML fragments into their designated containers.

This avoids duplicating shared markup across pages.

---

## 07. CSS Architecture

Stylesheets are divided according to responsibility.

| File | Purpose |
|---|---|
| reset.css | Browser style normalization |
| variables.css | Design tokens and CSS variables |
| global.css | Global typography and elements |
| layout.css | Containers and section layouts |
| components.css | Component styling |
| animations.css | Motion and transitions |
| responsive.css | Mobile and tablet layouts |
| style.css | Main stylesheet entry point |

### Design System

Primary visual identity:

| Element | Color |
|---|---|
| Background | #080A0B |
| Accent | #B8FF38 |
| Surface | #151A1B |
| Primary Text | #F5F7F2 |
| Secondary Text | #929B97 |

Design direction:
- Premium dark technology aesthetic.
- Neon green highlights.
- Minimalist interface.
- Modern typography.
- Subtle glow effects.
- Responsive layouts.
- Consistent component styling.

---

## 08. JavaScript Architecture

JavaScript functionality is separated into ES modules.

| File | Responsibility |
|---|---|
| main.js | Application initialization |
| component-loader.js | HTML component loading |
| navigation.js | Navigation functionality |
| animations.js | Scroll and reveal animations |
| interactions.js | Interactive UI functionality |

### Component Loading

HTML components are loaded using JavaScript Fetch API.

Example:

```html
<div data-component="navbar"></div>
<div data-component="footer"></div>
```

The component loader retrieves the corresponding HTML files and inserts them into these containers.

Components must load before dependent navigation and interaction scripts initialize.

---

## 09. Responsive Design

The website will support:

- Mobile smartphones.
- Tablets.
- Laptops.
- Desktop monitors.

Responsive development priorities:

1. Mobile-first layouts.
2. Flexible containers.
3. Responsive typography.
4. Mobile navigation.
5. Adaptive grids.
6. Touch-friendly controls.
7. Optimized images.

---

## 10. Development Guidelines

All contributors and future updates should follow these rules:

1. Keep HTML, CSS and JavaScript separated.
2. Never duplicate shared component markup unnecessarily.
3. Use semantic HTML elements.
4. Maintain consistent naming conventions.
5. Use relative paths compatible with GitHub Pages.
6. Avoid leading spaces in filenames and directories.
7. Keep JavaScript modular.
8. Validate all internal navigation links.
9. Test responsive behaviour before deployment.
10. Never introduce unnecessary dependencies.
11. Preserve accessibility.
12. Verify actual browser rendering before marking a feature complete.

---

## 11. Local Development

Clone the repository:

```bash
git clone https://github.com/magistocoder/Portfolio-M.git
```

Navigate into the project:

```bash
cd Portfolio-M
```

Run the project using a local development server.

For example:

```bash
python -m http.server 8000
```

Open:

```text
http://localhost:8000
```

Important: Do not rely on opening HTML files directly using `file://` because JavaScript Fetch API component loading requires an HTTP server.

---

## 12. Deployment

The project is intended for GitHub Pages.

Repository:

https://github.com/magistocoder/Portfolio-M

Expected website:

https://magistocoder.github.io/Portfolio-M/

Deployment requirements:

- Correct repository directory structure.
- Valid relative asset paths.
- Working component loading.
- No missing CSS or JavaScript files.
- Successful mobile and desktop testing.

---

## 13. Development Roadmap

| Phase | Task | Status |
|---|---|---|
| 01 | Architecture planning | Completed |
| 02 | Homepage HTML shell | Started |
| 03 | Reusable HTML components | Pending |
| 04 | CSS design system | Pending |
| 05 | JavaScript architecture | Pending |
| 06 | Individual pages | Pending |
| 07 | Responsive optimization | Pending |
| 08 | Testing and debugging | Pending |
| 09 | GitHub Pages deployment | Pending |

---

## 14. Future Improvements

Potential future enhancements:

- Advanced project filtering.
- Dynamic statistics.
- Rich project detail pages.
- Improved image optimization.
- SEO improvements.
- Accessibility enhancements.
- Contact form integration.
- Performance optimization.
- Dark and light theme support.

These features will be considered separately and implemented only when appropriate.

---

## 15. Project Identity

**PORTFOLIO-M V2.0**

Created and maintained by:

**Abhinand A.S.**

Brand: MAGISTO TECHY

Technology | Creativity | Innovation

GitHub:
https://github.com/magistocoder

Instagram:
https://instagram.com/magisto_techy

YouTube:
https://youtube.com/@MagistoTechy

---

© 2026 Abhinand A.S. All Rights Reserved.
