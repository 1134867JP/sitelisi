// DOM Elements
const header = document.querySelector('.header');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const modal = document.getElementById('agendamentoModal');
const modalOverlay = modal?.querySelector('.modal-overlay');
const modalClose = modal?.querySelector('.modal-close');
const modalForm = modal?.querySelector('#agendamentoForm');
const focusableSelectors = ['a[href]', 'button', 'input', 'textarea'];
const revealTargetsSelector = [
  '.section-tier-dark',
  '.section-tier-light',
  '.passo-card',
  '.info-card',
  '.atendimento-card',
  '.location-card',
  '.cta-content',
  '.hero-text',
  '.hero-photo',
  '.hero-brand'
].join(',');

// Testimonial carousel state
const testimonialState = {
  enabled: false,
  current: 0,
  cards: [],
  container: null,
  nav: null,
  touchStartX: 0,
  touchEndX: 0
};

let lastTapTime = 0;

// Toggle mobile menu
function toggleMobileMenu() {
  hamburger?.classList.toggle('active');
  navMenu?.classList.toggle('active');
}

// Close mobile menu
function closeMobileMenu() {
  hamburger?.classList.remove('active');
  navMenu?.classList.remove('active');
}

// Handle navigation link click
function handleNavClick(event, targetId) {
  event.preventDefault();
  const target = document.querySelector(targetId);
  if (!target || !header) return;

  const offset = header.offsetHeight + 12;
  const targetTop = target.getBoundingClientRect().top + window.scrollY;

  window.scrollTo({
    top: targetTop - offset,
    behavior: 'smooth'
  });

  closeMobileMenu();
  setActiveNavLink();
}

// Set active navigation link based on scroll position
function setActiveNavLink() {
  if (!header) return;

  const sections = document.querySelectorAll('section[id], footer[id]');
  const viewportCenter = window.scrollY + window.innerHeight / 2;
  let activeId = null;

  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    const sectionTop = rect.top + window.scrollY;
    const sectionBottom = sectionTop + rect.height;
    const id = section.getAttribute('id');

    if (viewportCenter >= sectionTop && viewportCenter < sectionBottom) {
      activeId = id;
    }
  });

  if (!activeId && sections.length && window.innerHeight + window.scrollY >= document.body.offsetHeight - 2) {
    activeId = sections[sections.length - 1].getAttribute('id');
  }

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    link.classList.toggle('active', !!activeId && href === `#${activeId}`);
  });
}

// Trap focus within a container (e.g., modal)
function trapFocus(container) {
  const focusable = container.querySelectorAll(focusableSelectors.join(','));
  if (!focusable.length) return;

  const [first] = focusable;
  const last = focusable[focusable.length - 1];

  container.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

// Open modal
function openModal() {
  if (!modal) return;

  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';

  const firstInput = modal.querySelector('input, textarea, button');
  firstInput?.focus();
}

// Close modal
function closeModal() {
  if (!modal) return;

  modal.classList.remove('is-open');
  document.body.style.overflow = '';
}

// Handle modal form submission redirecting to WhatsApp
function handleModalSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);
  const nome = (formData.get('nome') || '').toString().trim();
  const email = (formData.get('email') || '').toString().trim();
  const telefone = (formData.get('telefone') || '').toString().trim();
  const mensagem = (formData.get('mensagem') || '').toString().trim();

  const saudacaoNome = nome ? `Olá, meu nome é ${nome}` : 'Olá';
  const detalhesContato = [
    telefone ? `Telefone: ${telefone}` : null,
    email ? `E-mail: ${email}` : null
  ].filter(Boolean);

  const corpoMensagem = [
    saudacaoNome,
    'e gostaria de agendar uma conversa.',
    detalhesContato.length ? detalhesContato.join(' | ') : null,
    mensagem ? `Mensagem: ${mensagem}` : null
  ]
    .filter(Boolean)
    .join('\n');

  const whatsappUrl = `https://wa.me/5554997000173?text=${encodeURIComponent(corpoMensagem)}`;

  window.open(whatsappUrl, '_blank');
  form.reset();
  closeModal();
}

// Setup modal event listeners and focus trap
function setupModal() {
  if (!modal) return;

  trapFocus(modal);
  modalOverlay?.addEventListener('click', closeModal);
  modalClose?.addEventListener('click', closeModal);
  modalForm?.addEventListener('submit', handleModalSubmit);

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
}

// Initialize navigation event listeners
function initNavigation() {
  if (hamburger) {
    hamburger.addEventListener('click', toggleMobileMenu);
  }

  // Close menu when clicking outside on mobile
  document.addEventListener('click', event => {
    const target = event.target;
    if (!navMenu || !hamburger) return;
    const isOpen = navMenu.classList.contains('active');
    if (!isOpen) return;

    const clickedInsideMenu = navMenu.contains(target);
    const clickedHamburger = hamburger.contains(target);

    if (!clickedInsideMenu && !clickedHamburger) {
      closeMobileMenu();
    }
  });

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;

    link.addEventListener('click', event => handleNavClick(event, href));
  });

  window.addEventListener('scroll', setActiveNavLink, { passive: true });
}

// Scroll reveal using IntersectionObserver
function setupScrollReveal() {
  const targets = document.querySelectorAll(revealTargetsSelector);
  if (!targets.length) return;

  // Fallback for browsers without IntersectionObserver
  if (!('IntersectionObserver' in window)) {
    targets.forEach(target => target.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.08,
      rootMargin: '0px 0px 12% 0px'
    }
  );

  targets.forEach(target => {
    target.classList.add('reveal');
    observer.observe(target);
  });
}

// Testimonials carousel (mobile)
function isMobileViewport() {
  return window.matchMedia('(max-width: 768px)').matches;
}

function createTestimonialNav() {
  const nav = document.createElement('div');
  nav.className = 'testimonial-nav';

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.setAttribute('aria-label', 'Depoimento anterior');
  prev.textContent = '‹';

  const next = document.createElement('button');
  next.type = 'button';
  next.setAttribute('aria-label', 'Próximo depoimento');
  next.textContent = '›';

  nav.append(prev, next);
  return { nav, prev, next };
}

function showTestimonial(index) {
  testimonialState.cards.forEach((card, i) => {
    card.classList.toggle('is-active', i === index);
  });

  const active = testimonialState.cards[index];
  if (active && testimonialState.container) {
    // Align slightly before start so arrows feel like they move the card
    const offset = 12;
    const left = active.offsetLeft - offset;
    testimonialState.container.scrollTo({ left, behavior: 'smooth' });
  }
  testimonialState.current = index;
}

function enableTestimonialsCarousel() {
  const container = document.getElementById('google-reviews');
  if (!container) return;

  const cards = Array.from(container.querySelectorAll('.depoimento-card'));
  if (cards.length <= 1) return; // nothing to carousel

  testimonialState.container = container;
  testimonialState.cards = cards;

  container.classList.add('carousel-enabled');

  const { nav, prev, next } = createTestimonialNav();
  testimonialState.nav = nav;
  container.insertAdjacentElement('afterend', nav);

  prev.addEventListener('click', () => {
    const nextIndex = (testimonialState.current - 1 + cards.length) % cards.length;
    showTestimonial(nextIndex);
  });

  next.addEventListener('click', () => {
    const nextIndex = (testimonialState.current + 1) % cards.length;
    showTestimonial(nextIndex);
  });

  // Touch swipe support
  const touchStart = event => {
    testimonialState.touchStartX = event.changedTouches[0].screenX;
  };

  const touchEnd = event => {
    testimonialState.touchEndX = event.changedTouches[0].screenX;
    const delta = testimonialState.touchEndX - testimonialState.touchStartX;
    const threshold = 40; // px

    if (Math.abs(delta) < threshold) return;

    if (delta < 0) {
      // swipe left -> next
      const nextIndex = (testimonialState.current + 1) % cards.length;
      showTestimonial(nextIndex);
    } else {
      // swipe right -> prev
      const prevIndex = (testimonialState.current - 1 + cards.length) % cards.length;
      showTestimonial(prevIndex);
    }
  };

  container.addEventListener('touchstart', touchStart, { passive: true });
  container.addEventListener('touchend', touchEnd, { passive: true });
  testimonialState.touchHandlers = { touchStart, touchEnd };

  showTestimonial(0);
  testimonialState.enabled = true;
}

function disableTestimonialsCarousel() {
  if (!testimonialState.enabled) return;

  testimonialState.container?.classList.remove('carousel-enabled');
  testimonialState.cards.forEach(card => card.classList.remove('is-active'));
  testimonialState.nav?.remove();

   // Remove touch listeners if any
  if (testimonialState.touchHandlers && testimonialState.container) {
    const { touchStart, touchEnd } = testimonialState.touchHandlers;
    testimonialState.container.removeEventListener('touchstart', touchStart);
    testimonialState.container.removeEventListener('touchend', touchEnd);
  }

  testimonialState.enabled = false;
  testimonialState.current = 0;
  testimonialState.nav = null;
  testimonialState.touchHandlers = null;
}

function refreshTestimonialsCarousel() {
  const container = document.getElementById('google-reviews');
  if (!container) return;

  // If cards not yet loaded, skip
  const cards = Array.from(container.querySelectorAll('.depoimento-card'));
  if (!cards.length) return;

  testimonialState.cards = cards;

  if (isMobileViewport()) {
    if (!testimonialState.enabled) enableTestimonialsCarousel();
  } else {
    disableTestimonialsCarousel();
  }
}

// Prevent double-tap zoom on mobile (except on form controls/links)
function setupDoubleTapGuard() {
  document.addEventListener('touchend', event => {
    const now = Date.now();
    const delta = now - lastTapTime;

    if (delta > 0 && delta < 350) {
      const target = event.target;
      if (target.closest('input, textarea, select, button, a')) return;
      event.preventDefault();
    }

    lastTapTime = now;
  }, { passive: false });
}

// Initialize app
function init() {
  initNavigation();
  setupModal();
  setupScrollReveal();
  refreshTestimonialsCarousel();
  setupDoubleTapGuard();
  setActiveNavLink();
}

// DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', init);

// Listen for reviews render and viewport changes
window.addEventListener('reviewsReady', refreshTestimonialsCarousel);
window.addEventListener('resize', refreshTestimonialsCarousel);

// Expose modal functions to global scope
window.openModal = openModal;
window.closeModal = closeModal;