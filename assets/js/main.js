// ===== Topbar solid state on scroll =====
const topbar = document.querySelector('.topbar');
if (topbar) {
  window.addEventListener('scroll', () => {
    topbar.classList.toggle('solid', window.scrollY > window.innerHeight * 0.6);
  });
}

// ===== Dropdown menu (the ⋮ button) =====
const menuBtn = document.querySelector('.menu-btn');
const dropdown = document.querySelector('.dropdown');
if (menuBtn && dropdown) {
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });
  document.addEventListener('click', () => dropdown.classList.remove('open'));
}

// ===== Live local-time readout (UTC-3 / Florianópolis) =====
const clockEl = document.getElementById('local-clock');
function tickClock() {
  if (!clockEl) return;
  const now = new Date();
  const formatted = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo'
  });
  clockEl.textContent = formatted;
}
tickClock();
setInterval(tickClock, 30000);

// ===== Scroll reveal =====
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach((el) => observer.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('in-view'));
}

// ===== Scrollspy for the call-control nav =====
const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.call-link');
if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  sections.forEach((s) => spy.observe(s));
}
