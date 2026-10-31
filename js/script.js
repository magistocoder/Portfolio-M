
// Mobile navigation menu
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');

    const isOpen = navLinks.classList.contains('active');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.textContent = isOpen ? '✕' : '☰';
  });

  // Close menu after selecting a navigation link
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.textContent = '☰';
    });
  });
}

// Reveal elements when they enter the screen
const revealElements = document.querySelectorAll(
  '.section-label, .section-title, .section-description, ' +
  '.about-card, .project-card, .service-card, .brand-list span, .contact-box'
);

revealElements.forEach((element) => {
  element.classList.add('reveal');
});

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          currentObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12
    }
  );

  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => {
    element.classList.add('visible');
  });
}

// Automatically update the footer year
const yearElement = document.querySelector('[data-current-year]');

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

// Close mobile menu if the screen becomes wider
window.addEventListener('resize', () => {
  if (window.innerWidth > 800 && navLinks && menuToggle) {
    navLinks.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.textContent = '☰';
  }
});
