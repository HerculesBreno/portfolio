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

// ===== Hero text — fade on mousemove, hidden when modals open =====
const heroText = document.getElementById('hero-text');
let heroTimer, heroModalCount = 0;

function heroModalOpen() {
  heroModalCount++;
  if (heroText) { clearTimeout(heroTimer); heroText.style.opacity = '0'; heroText.style.transition = 'opacity 0.3s ease'; }
}
function heroModalClose() {
  heroModalCount = Math.max(0, heroModalCount - 1);
  if (heroModalCount === 0 && heroText) {
    heroTimer = setTimeout(() => { heroText.style.opacity = '1'; }, 400);
  }
}

if (heroText) {
  document.addEventListener('mousemove', () => {
    if (heroModalCount > 0) return;
    heroText.style.opacity = '0';
    clearTimeout(heroTimer);
    heroTimer = setTimeout(() => { heroText.style.opacity = '1'; }, 1200);
  });
}

// ===== About panel (right-side drawer) =====
const aboutBtn        = document.getElementById('about-btn');
const aboutModal      = document.getElementById('about-panel');
const aboutOverlay    = document.getElementById('about-overlay');
const aboutModalClose = document.getElementById('about-modal-close');

function openAbout() {
  heroModalOpen();
  aboutModal.hidden = false;
  requestAnimationFrame(() => {
    aboutModal.classList.add('open');
    aboutOverlay.classList.add('open');
    aboutOverlay.setAttribute('aria-hidden', 'false');
  });
  aboutModalClose && aboutModalClose.focus();
}

function closeAbout() {
  heroModalClose();
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

// ===== Work & AI — dock estilo Apple TV + overlay =====
const workBtn      = document.getElementById('work-btn');
const aiBtn        = document.getElementById('ai-btn');
const callbarInner = document.getElementById('callbar-inner');
const callbar      = document.querySelector('.callbar');
const tvDock       = document.getElementById('tv-dock');
const tvShelf      = document.getElementById('tv-shelf');
const tvGrid       = document.getElementById('tv-grid');
const tvBack       = document.getElementById('tv-back');
const tvExpand     = document.getElementById('tv-expand');
const tvOverlay    = document.getElementById('tv-overlay');
const tvOverlayClose    = document.getElementById('tv-overlay-close');
const tvOverlayBackdrop = document.getElementById('tv-overlay-backdrop');
const tvOverlayTitle    = document.getElementById('tv-overlay-title');
const tvOverlayEyebrow  = document.getElementById('tv-overlay-eyebrow');

// Ícones placeholder (trocar depois pelos reais)
const TV_ICONS = {
  tv:       '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
  arcade:   '<svg viewBox="0 0 24 24" fill="#fff"><circle cx="12" cy="5.5" r="2.5"/><rect x="11" y="7" width="2" height="6"/><path d="M4 17l8-4 8 4-8 4z"/></svg>',
  fitness:  '<svg viewBox="0 0 24 24" fill="none" stroke-width="3"><circle cx="12" cy="12" r="9" stroke="#fa114f"/><circle cx="12" cy="12" r="6" stroke="#a3f900"/><circle cx="12" cy="12" r="3" stroke="#00e0ff"/></svg>',
  facetime: '<svg viewBox="0 0 24 24" fill="#fff"><rect x="2" y="6" width="13" height="12" rx="3"/><path d="M22 8l-6 4 6 4z"/></svg>',
  music:    '<svg viewBox="0 0 24 24" fill="#fff" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 17V5l10-2v12" fill="none"/><circle cx="6.5" cy="17" r="2.6" stroke="none"/><circle cx="16.5" cy="15" r="2.6" stroke="none"/></svg>',
  appstore: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18l6-12 6 12M8.5 14h7"/></svg>',
  photos:   '<svg viewBox="0 0 24 24" fill="#fff"><circle cx="12" cy="12" r="3.2"/><path d="M12 3c1.2 1.6 1.2 4 0 6-2-1-3.4-3-3-6zM21 12c-1.6 1.2-4 1.2-6 0 1-2 3-3.4 6-3zM12 21c-1.2-1.6-1.2-4 0-6 2 1 3.4 3 3 6zM3 12c1.6-1.2 4-1.2 6 0-1 2-3 3.4-6 3z"/></svg>',
  notes:    '<svg viewBox="0 0 24 24" fill="none" stroke="#3a2a00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M4 12h16M4 17h9"/></svg>',
  podcasts: '<svg viewBox="0 0 24 24" fill="#fff"><rect x="9.5" y="3" width="5" height="10" rx="2.5"/><path d="M7 11a5 5 0 0 0 10 0" fill="none" stroke="#fff" stroke-width="2"/><path d="M12 16v4" stroke="#fff" stroke-width="2"/></svg>',
  maps:     '<svg viewBox="0 0 24 24" fill="#fff"><path d="M12 2a6 6 0 0 0-6 6c0 4.5 6 12 6 12s6-7.5 6-12a6 6 0 0 0-6-6z"/><circle cx="12" cy="8" r="2.4" fill="#23a35a"/></svg>',
  mail:     '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M4 7l8 6 8-6"/></svg>',
  safari:   '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z" fill="#fff" stroke="none"/></svg>',
  spark:    '<svg viewBox="0 0 24 24" fill="#fff"><path d="M12 2l2.2 6.3L20.5 10l-6.3 2.2L12 18.5l-2.2-6.3L3.5 10l6.3-1.7z"/><circle cx="18.5" cy="17.5" r="2"/></svg>',
  bot:      '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="8" width="16" height="11" rx="3"/><path d="M12 4v4"/><circle cx="9" cy="13.5" r="1.4" fill="#fff" stroke="none"/><circle cx="15" cy="13.5" r="1.4" fill="#fff" stroke="none"/></svg>',
  flow:     '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="12" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M8.5 7.5l7 3M8.5 16.5l7-3"/></svg>',
  chat:     '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12z"/></svg>',
  chart:    '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><path d="M4 19V9M10 19V5M16 19v-6M22 19H2"/></svg>',
  wand:     '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19L17 7M14.5 4.5l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/></svg>',
};

// Datasets placeholder — trocar por imagens/ícones reais depois
const DECKS = {
  work: {
    label: 'Trabalhos',
    eyebrow: 'Portfólio',
    title: 'Todos os trabalhos',
    items: [
      { n: 1,  color: 'tv',       icon: 'tv' },
      { n: 2,  color: 'arcade',   icon: 'arcade' },
      { n: 3,  color: 'fitness',  icon: 'fitness' },
      { n: 4,  color: 'facetime', icon: 'facetime' },
      { n: 5,  color: 'music',    icon: 'music' },
      { n: 6,  color: 'appstore', icon: 'appstore' },
      { n: 7,  color: 'photos',   icon: 'photos' },
      { n: 8,  color: 'notes',    icon: 'notes' },
      { n: 9,  color: 'podcasts', icon: 'podcasts' },
      { n: 10, color: 'maps',     icon: 'maps' },
      { n: 11, color: 'mail',     icon: 'mail' },
      { n: 12, color: 'safari',   icon: 'safari' },
    ],
  },
  ai: {
    label: 'AI & Automations',
    eyebrow: 'AI & Automations',
    title: 'Todas as automações',
    items: [
      { n: 1,  color: 'indigo',   icon: 'spark' },
      { n: 2,  color: 'cyan',     icon: 'bot' },
      { n: 3,  color: 'slate',    icon: 'flow' },
      { n: 4,  color: 'lime',     icon: 'chat' },
      { n: 5,  color: 'magenta',  icon: 'chart' },
      { n: 6,  color: 'orange',   icon: 'wand' },
      { n: 7,  color: 'appstore', icon: 'flow' },
      { n: 8,  color: 'photos',   icon: 'spark' },
      { n: 9,  color: 'facetime', icon: 'chat' },
      { n: 10, color: 'music',    icon: 'chart' },
      { n: 11, color: 'notes',    icon: 'bot' },
      { n: 12, color: 'safari',   icon: 'wand' },
    ],
  },
};

let activeDeck = 'work';

function makeTile(type, item) {
  const isWork = type === 'work';
  const btn = document.createElement('button');
  btn.className = `tv-tile tv-c-${item.color}`;
  const n = String(item.n).padStart(2, '0');
  btn.setAttribute('aria-label', isWork ? `Projeto ${n}` : `Automação ${n}`);
  btn.innerHTML = TV_ICONS[item.icon] || '';
  btn.addEventListener('click', () => openProjModal(type, item.n));
  return btn;
}

function renderDeck(type) {
  const deck = DECKS[type];
  if (!deck || !tvShelf || !tvGrid) return;
  tvShelf.replaceChildren(...deck.items.slice(0, 6).map((i) => makeTile(type, i)));
  tvGrid.replaceChildren(...deck.items.map((i) => makeTile(type, i)));
  tvDock.setAttribute('aria-label', deck.label);
  if (tvOverlayEyebrow) tvOverlayEyebrow.textContent = deck.eyebrow;
  if (tvOverlayTitle)   tvOverlayTitle.textContent   = deck.title;
}

function deckTrigger() { return activeDeck === 'ai' ? aiBtn : workBtn; }

function openDock(type) {
  activeDeck = type;
  renderDeck(type);
  callbar && callbar.classList.add('dimmed');
  tvDock.hidden = false;
  requestAnimationFrame(() => tvDock.classList.add('open'));
  deckTrigger() && deckTrigger().setAttribute('aria-expanded', 'true');
  tvBack && tvBack.focus();
}
function closeDock() {
  const trigger = deckTrigger();
  tvDock.classList.remove('open');
  callbar && callbar.classList.remove('dimmed');
  tvDock.addEventListener('transitionend', function h() {
    tvDock.hidden = true;
    tvDock.removeEventListener('transitionend', h);
  }, { once: true });
  trigger && trigger.setAttribute('aria-expanded', 'false');
  trigger && trigger.focus();
}
function openDeckOverlay() {
  heroModalOpen();
  tvOverlay.hidden = false;
  requestAnimationFrame(() => tvOverlay.classList.add('open'));
  tvExpand && tvExpand.setAttribute('aria-expanded', 'true');
  tvOverlayClose && tvOverlayClose.focus();
}
function closeDeckOverlay() {
  heroModalClose();
  tvOverlay.classList.remove('open');
  tvOverlay.addEventListener('transitionend', function h() {
    tvOverlay.hidden = true;
    tvOverlay.removeEventListener('transitionend', h);
  }, { once: true });
  tvExpand && tvExpand.setAttribute('aria-expanded', 'false');
  tvExpand && tvExpand.focus();
}

if (tvDock) {
  workBtn && workBtn.addEventListener('click', () => openDock('work'));
  aiBtn   && aiBtn.addEventListener('click', () => openDock('ai'));
  tvBack  && tvBack.addEventListener('click', closeDock);
  tvExpand && tvExpand.addEventListener('click', openDeckOverlay);
  tvOverlayClose && tvOverlayClose.addEventListener('click', closeDeckOverlay);
  tvOverlayBackdrop && tvOverlayBackdrop.addEventListener('click', closeDeckOverlay);
}

// ===== Escape global =====
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (contactModal && contactModal.classList.contains('open')) { closeContactModal(); return; }
  if (projModal && projModal.classList.contains('open')) { closeProjModal(); return; }
  if (aboutModal && aboutModal.classList.contains('open')) { closeAbout(); return; }
  if (tvOverlay && !tvOverlay.hidden) { closeDeckOverlay(); return; }
  if (tvDock && !tvDock.hidden) { closeDock(); return; }
});

// ===== Project modal =====
const projModal      = document.getElementById('proj-modal');
const projModalClose = document.getElementById('proj-modal-close');
const projBackdrop   = document.getElementById('proj-modal-backdrop');
const projLabel      = document.getElementById('proj-modal-label');
const projTitle      = document.getElementById('proj-modal-title');

function openProjModal(type, n) {
  heroModalOpen();
  const isWork = type === 'work';
  projLabel.textContent = isWork ? `CASE STUDY 00${n}` : `AI PROJECT 00${n}`;
  projTitle.textContent = isWork ? `Projeto ${String(n).padStart(2,'0')}` : `IA Projeto ${String(n).padStart(2,'0')}`;
  projModal.hidden = false;
  requestAnimationFrame(() => projModal.classList.add('open'));
}
function closeProjModal() {
  heroModalClose();
  projModal.classList.remove('open');
  projModal.addEventListener('transitionend', () => { projModal.hidden = true; }, { once: true });
}

if (projModal) {
  projModalClose && projModalClose.addEventListener('click', closeProjModal);
  projBackdrop   && projBackdrop.addEventListener('click', closeProjModal);
}

// ===== Contact modal =====
const contactModal      = document.getElementById('contact-modal');
const contactModalClose = document.getElementById('contact-modal-close');
const contactBackdrop   = document.getElementById('contact-modal-backdrop');
const contactBtn        = document.getElementById('contact-btn');

function openContactModal() {
  heroModalOpen();
  contactModal.hidden = false;
  requestAnimationFrame(() => contactModal.classList.add('open'));
}
function closeContactModal() {
  heroModalClose();
  contactModal.classList.remove('open');
  contactModal.addEventListener('transitionend', () => { contactModal.hidden = true; }, { once: true });
  contactBtn && contactBtn.focus();
}

if (contactBtn && contactModal) {
  contactBtn.addEventListener('click', openContactModal);
  contactModalClose && contactModalClose.addEventListener('click', closeContactModal);
  contactBackdrop   && contactBackdrop.addEventListener('click', closeContactModal);
}

// ===== Dock magnification no callbar (efeito dock do macOS) =====
(function () {
  const inner = document.getElementById('callbar-inner');
  if (!inner) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer  = window.matchMedia('(hover: hover) and (pointer: fine)');

  const params = { scale: 1.28, shift: 14, range: 150 };
  const row = document.getElementById('callbar-nav');
  if (!row) return;
  const items = Array.from(row.querySelectorAll(':scope > .call-link, :scope > .call-end'));

  function resetAll() {
    items.forEach((el) => { el.style.transform = ''; });
  }

  inner.addEventListener('mousemove', (e) => {
    if (reduceMotion.matches || !finePointer.matches) return;
    const rowLeft = row.getBoundingClientRect().left;

    items.forEach((item) => {
      const center = rowLeft + item.offsetLeft + item.offsetWidth / 2;
      const distance = center - e.clientX;
      let scale = 1;
      let x;
      if (Math.abs(distance) < params.range) {
        const rad = (distance / params.range) * (Math.PI / 2);
        scale = 1 + (params.scale - 1) * Math.cos(rad);
        x = params.shift * Math.sin(rad);
      } else {
        x = (distance > 0 ? 1 : -1) * params.shift;
      }
      item.style.transform = `translateX(${x.toFixed(2)}px) scale(${scale.toFixed(3)})`;
    });
  });

  inner.addEventListener('mouseleave', resetAll);
  [workBtn, aiBtn].forEach((btn) => {
    btn && btn.addEventListener('click', resetAll);
  });
})();

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
