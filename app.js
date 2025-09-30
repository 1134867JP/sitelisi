// DOM Elements
const header = document.querySelector('.header');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const modal = document.getElementById('agendamentoModal');
const modalOverlay = modal?.querySelector('.modal-overlay');
const modalClose = modal?.querySelector('.modal-close');
const focusableSelectors = ['a[href]', 'button', 'input', 'textarea'];

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

// Setup modal event listeners and focus trap
function setupModal() {
  if (!modal) return;

  trapFocus(modal);
  modalOverlay?.addEventListener('click', closeModal);
  modalClose?.addEventListener('click', closeModal);

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

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;

    link.addEventListener('click', event => handleNavClick(event, href));
  });

  window.addEventListener('scroll', setActiveNavLink, { passive: true });
}

// Initialize app
function init() {
  initNavigation();
  setupModal();
  setActiveNavLink();
}

// DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', init);

// Expose modal functions to global scope
window.openModal = openModal;
window.closeModal = closeModal;