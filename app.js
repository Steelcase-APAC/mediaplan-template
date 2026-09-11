/**
 * Steelcase Media Plan Proposal Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initPrintButton();
  initScrollSpy();
});

/**
 * Dark/Light Mode Theme Management
 */
function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;

  // Check saved theme or system preference
  const savedTheme = localStorage.getItem('steelcase_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'night' || (!savedTheme && prefersDark)) {
    body.classList.remove('theme-light');
    body.classList.add('theme-night');
  } else {
    body.classList.remove('theme-night');
    body.classList.add('theme-light');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isNight = body.classList.contains('theme-night');
      if (isNight) {
        body.classList.remove('theme-night');
        body.classList.add('theme-light');
        localStorage.setItem('steelcase_theme', 'light');
      } else {
        body.classList.remove('theme-light');
        body.classList.add('theme-night');
        localStorage.setItem('steelcase_theme', 'night');
      }
    });
  }
}

/**
 * Print & Save to PDF
 */
function initPrintButton() {
  const printBtn = document.getElementById('printBtn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

/**
 * Sidebar ScrollSpy (Highlights currently active section in outline)
 */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const outlineLinks = document.querySelectorAll('.outline-link');

  if (!sections.length || !outlineLinks.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        outlineLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(sec => observer.observe(sec));
}
