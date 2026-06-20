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
    navAI:          'AI & Automations',
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
    workBack:       'Voltar',
    aiBack:         'Voltar',
    heroEyebrow:    'Product Designer',
    heroH1:         'Projetando produtos e fluxos de IA que as pessoas entendem e amam.',
    heroSub:        'Ajudo equipes a transformar complexidade em experiências intuitivas por meio de estratégia, design e tecnologia.',
    heroCta1:       'Ver Projetos',
    heroCta2:       'Vamos conversar',
    proj1: 'Proj 01', proj2: 'Proj 02', proj3: 'Proj 03', proj4: 'Proj 04', proj5: 'Proj 05',
    aiProj1: 'IA 01', aiProj2: 'IA 02', aiProj3: 'IA 03', aiProj4: 'IA 04', aiProj5: 'IA 05',
  },
  en: {
    status:         'Available for new projects',
    workEyebrow:    'Recordings of this call',
    navWork:        'Work',
    navAI:          'AI & Automations',
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
    workBack:       'Back',
    aiBack:         'Back',
    heroEyebrow:    'Product Designer',
    heroH1:         'Designing products and AI workflows that people understand and love.',
    heroSub:        'I help teams turn complexity into intuitive experiences through strategy, design and technology.',
    heroCta1:       'View Case Studies',
    heroCta2:       "Let's Talk",
    proj1: 'Proj 01', proj2: 'Proj 02', proj3: 'Proj 03', proj4: 'Proj 04', proj5: 'Proj 05',
    aiProj1: 'AI 01', aiProj2: 'AI 02', aiProj3: 'AI 03', aiProj4: 'AI 04', aiProj5: 'AI 05',
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

// ===== Hero text — fade on mousemove =====
const heroText = document.getElementById('hero-text');
if (heroText) {
  let heroTimer;
  document.addEventListener('mousemove', () => {
    heroText.style.opacity = '0';
    clearTimeout(heroTimer);
    heroTimer = setTimeout(() => { heroText.style.opacity = '1'; }, 2200);
  });
}

// ===== About panel (right-side drawer) =====
const aboutBtn        = document.getElementById('about-btn');
const aboutModal      = document.getElementById('about-panel');
const aboutOverlay    = document.getElementById('about-overlay');
const aboutModalClose = document.getElementById('about-modal-close');

function openAbout() {
  aboutModal.hidden = false;
  requestAnimationFrame(() => {
    aboutModal.classList.add('open');
    aboutOverlay.classList.add('open');
    aboutOverlay.setAttribute('aria-hidden', 'false');
  });
  aboutModalClose && aboutModalClose.focus();
}

function closeAbout() {
  aboutModal.classList.remove('open');
  aboutOverlay.classList.remove('open');
  aboutOverlay.setAttribute('aria-hidden', 'true');
  aboutModal.addEventListener('transitionend', () => {
    aboutModal.hidden = true;
  }, { once: true });
  aboutBtn && aboutBtn.focus();
}

if (aboutBtn && aboutModal) {
  aboutBtn.addEventListener('click', openAbout);
  aboutModalClose && aboutModalClose.addEventListener('click', closeAbout);
  aboutOverlay && aboutOverlay.addEventListener('click', closeAbout);
}

// About tabs (section switcher)
document.querySelectorAll('.about-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const section = tab.dataset.section;
    document.querySelectorAll('.about-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    document.querySelectorAll('.about-section').forEach(s => s.classList.remove('active'));
    tab.classList.add('active'); tab.setAttribute('aria-selected', 'true');
    const target = document.getElementById('section-' + section);
    if (target) target.classList.add('active');
  });
});

// ===== Work & AI — crossfade dentro do callbar =====
const workBtn      = document.getElementById('work-btn');
const workBackBtn  = document.getElementById('work-back-btn');
const aiBtn        = document.getElementById('ai-btn');
const aiBackBtn    = document.getElementById('ai-back-btn');
const callbarInner = document.getElementById('callbar-inner');

function openWork() {
  callbarInner.classList.remove('ai-open');
  callbarInner.classList.add('work-open');
  workBtn.setAttribute('aria-expanded', 'true');
}
function closeWork() {
  callbarInner.classList.remove('work-open');
  workBtn.setAttribute('aria-expanded', 'false');
  workBtn && workBtn.focus();
}
function openAI() {
  callbarInner.classList.remove('work-open');
  callbarInner.classList.add('ai-open');
  aiBtn.setAttribute('aria-expanded', 'true');
}
function closeAI() {
  callbarInner.classList.remove('ai-open');
  aiBtn.setAttribute('aria-expanded', 'false');
  aiBtn && aiBtn.focus();
}

if (callbarInner) {
  workBtn    && workBtn.addEventListener('click', openWork);
  workBackBtn && workBackBtn.addEventListener('click', closeWork);
  aiBtn      && aiBtn.addEventListener('click', openAI);
  aiBackBtn  && aiBackBtn.addEventListener('click', closeAI);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (callbarInner.classList.contains('work-open')) closeWork();
      if (callbarInner.classList.contains('ai-open')) closeAI();
      if (aboutModal && aboutModal.classList.contains('open')) closeAbout();
    }
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
