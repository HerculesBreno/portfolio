// ===== Topbar solid state on scroll =====
const topbar = document.querySelector('.topbar');
if (topbar) {
  window.addEventListener('scroll', () => {
    topbar.classList.toggle('solid', window.scrollY > window.innerHeight * 0.6);
  });
}

// ===== Dropdown menu (the ⋮ button) =====
const menuBtn  = document.querySelector('.menu-btn');
const dropdown = document.querySelector('.dropdown');
if (menuBtn && dropdown) {
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });
  document.addEventListener('click', () => dropdown.classList.remove('open'));
}

// ===== Language toggle =====
const i18n = {
  pt: {
    status:         'Disponível para novos projetos',
    workEyebrow:    'Gravações desta chamada',
    navWork:        'Work',
    aiEyebrow:      'Tela compartilhada',
    ptEyebrow:      'Legendas da chamada',
    aboutEyebrow:   'Participante',
    contactEyebrow: 'Chamada encerrando',
    contactTitle:   'Vamos agendar a próxima call?',
    contactLede:    'Responda em até 1 dia útil. Disponível para projetos freelance e full-time.',
    emailBtn:       'Enviar e-mail',
    aboutNavBio:    'Sobre',
    aboutNavContact:'Contato',
    aboutBio:       'Sua bio aqui — quem você é, como você pensa produto, o que te diferencia. Duas ou três frases, sem enrolação.',
    workBack:       'Versão anterior',
    proj1: 'Projeto 01', proj2: 'Projeto 02', proj3: 'Projeto 03',
  },
  en: {
    status:         'Available for new projects',
    workEyebrow:    'Recordings of this call',
    navWork:        'Work',
    aiEyebrow:      'Shared screen',
    ptEyebrow:      'Call captions',
    aboutEyebrow:   'Participant',
    contactEyebrow: 'Call ending',
    contactTitle:   "Let's schedule the next call?",
    contactLede:    'Response within 1 business day. Available for freelance and full-time projects.',
    emailBtn:       'Send email',
    aboutNavBio:    'About',
    aboutNavContact:'Contact',
    aboutBio:       'Your bio here — who you are, how you think about product, what sets you apart. Two or three sentences.',
    workBack:       'Previous version',
    proj1: 'Project 01', proj2: 'Project 02', proj3: 'Project 03',
  }
};

let currentLang = 'pt';

function applyLang(lang) {
  currentLang = lang;
  const dict = i18n[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key] !== undefined) el.textContent = dict[key];
  });
  document.querySelectorAll('.lang-option').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.lang === lang);
  });
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
}

const langToggle = document.getElementById('lang-toggle');
if (langToggle) {
  langToggle.addEventListener('click', () => {
    applyLang(currentLang === 'pt' ? 'en' : 'pt');
  });
}

// ===== About modal (Maps sidebar style) =====
const aboutBtn        = document.getElementById('about-btn');
const aboutModal      = document.getElementById('about-panel');
const aboutOverlay    = document.getElementById('about-overlay');
const aboutClose      = document.getElementById('about-close');
const aboutModalClose = document.getElementById('about-modal-close');
const aboutSidebar    = document.getElementById('about-sidebar');

function openAbout() {
  aboutModal.hidden = false;
  requestAnimationFrame(() => {
    aboutModal.classList.add('open');
    aboutOverlay.classList.add('open');
    aboutOverlay.setAttribute('aria-hidden', 'false');
  });
  document.body.style.overflow = 'hidden';
  aboutClose && aboutClose.focus();
}

function closeAbout() {
  aboutModal.classList.remove('open');
  aboutOverlay.classList.remove('open');
  aboutOverlay.setAttribute('aria-hidden', 'true');
  aboutModal.addEventListener('transitionend', () => {
    aboutModal.hidden = true;
    document.body.style.overflow = '';
  }, { once: true });
  aboutBtn && aboutBtn.focus();
}

if (aboutBtn && aboutModal) {
  aboutBtn.addEventListener('click', openAbout);
  aboutModalClose && aboutModalClose.addEventListener('click', closeAbout);
  aboutOverlay && aboutOverlay.addEventListener('click', closeAbout);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && aboutModal.classList.contains('open')) closeAbout();
  });
}

// Sidebar collapse toggle — clicking the icon inside the sidebar toggles it;
// clicking from collapsed state (icon floated in content) expands it back
let sidebarCollapsed = false;
if (aboutClose && aboutSidebar) {
  aboutClose.addEventListener('click', (e) => {
    e.stopPropagation();
    sidebarCollapsed = !sidebarCollapsed;
    aboutSidebar.classList.toggle('collapsed', sidebarCollapsed);
  });
}

// About nav items (section switcher)
document.querySelectorAll('.about-nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const section = item.dataset.section;
    document.querySelectorAll('.about-nav-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.about-section').forEach(s => s.classList.remove('active'));
    item.classList.add('active');
    const target = document.getElementById('section-' + section);
    if (target) target.classList.add('active');
  });
});

// ===== Work overlay (Apple TV card grid) =====
const workBtn          = document.getElementById('work-btn');
const workOverlay      = document.getElementById('work-overlay');
const workOverlayClose = document.getElementById('work-overlay-close');

function openWork() {
  workOverlay.hidden = false;
  requestAnimationFrame(() => workOverlay.classList.add('open'));
  workBtn.classList.add('active');
}

function closeWork() {
  workOverlay.classList.remove('open');
  workBtn.classList.remove('active');
  workOverlay.addEventListener('transitionend', () => {
    workOverlay.hidden = true;
  }, { once: true });
  workBtn && workBtn.focus();
}

if (workBtn && workOverlay) {
  workBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    workOverlay.classList.contains('open') ? closeWork() : openWork();
  });
  workOverlayClose && workOverlayClose.addEventListener('click', closeWork);
  document.addEventListener('click', (e) => {
    if (workOverlay.classList.contains('open') && !workOverlay.contains(e.target)) closeWork();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && workOverlay.classList.contains('open')) closeWork();
  });
}

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
const navLinks  = document.querySelectorAll('.call-link[href]');
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
