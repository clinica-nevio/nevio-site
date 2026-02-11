/* Nevio — minimal vanilla JS (menu, FAQ, form validation, smooth scroll, language mapping) */
(function() {
  'use strict';

  const MAP = {
    "/ro/index.html": "/en/index.html",
    "/ro/pages/despre.html": "/en/pages/about.html",
    "/ro/pages/servicii.html": "/en/pages/services.html",
    "/ro/pages/preturi.html": "/en/pages/pricing.html",
    "/ro/pages/echipa.html": "/en/pages/team.html",
    "/ro/pages/cazuri.html": "/en/pages/cases.html",
    "/ro/pages/programare.html": "/en/pages/appointments.html",
    "/ro/pages/contact.html": "/en/pages/contact.html",
    "/ro/pages/confidentialitate.html": "/en/pages/privacy.html",
    "/ro/pages/cookies.html": "/en/pages/cookies.html",

    "/en/index.html": "/ro/index.html",
    "/en/pages/about.html": "/ro/pages/despre.html",
    "/en/pages/services.html": "/ro/pages/servicii.html",
    "/en/pages/pricing.html": "/ro/pages/preturi.html",
    "/en/pages/team.html": "/ro/pages/echipa.html",
    "/en/pages/cases.html": "/ro/pages/cazuri.html",
    "/en/pages/appointments.html": "/ro/pages/programare.html",
    "/en/pages/contact.html": "/ro/pages/contact.html",
    "/en/pages/privacy.html": "/ro/pages/confidentialitate.html",
    "/en/pages/cookies.html": "/ro/pages/cookies.html"
  };

  function normalizePath(pathname) {
    // Ensure it ends in .html (for file browsing) and starts with /ro or /en
    if (!pathname) return "/ro/index.html";
    if (pathname === "/" || pathname === "/ro/" || pathname === "/en/") {
      return pathname.startsWith("/en") ? "/en/index.html" : "/ro/index.html";
    }
    // If user opens folder path, add index.html
    if (pathname.endsWith("/")) {
      return pathname + "index.html";
    }
    return pathname;
  }

  function setLanguageLinks() {
    const current = normalizePath(window.location.pathname);
    const alt = MAP[current];
    if (!alt) return;

    document.querySelectorAll('[data-lang-toggle]').forEach(a => {
      a.setAttribute('href', alt);
    });
  }

  function initMobileMenu() {
    const btn = document.querySelector('[data-menu-btn]');
    const panel = document.querySelector('[data-mobile-panel]');
    if (!btn || !panel) return;

    function close() {
      panel.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    }

    btn.addEventListener('click', () => {
      const isOpen = panel.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', (e) => {
      const t = e.target;
      if (!panel.classList.contains('is-open')) return;
      if (panel.contains(t) || btn.contains(t)) return;
      close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  }

  function initFAQ() {
    const items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    items.forEach(item => {
      const btn = item.querySelector('.faq-btn');
      const panel = item.querySelector('.faq-panel');
      if (!btn || !panel) return;

      btn.addEventListener('click', () => {
        const open = item.getAttribute('data-open') === 'true';
        // close others for a cleaner UX
        items.forEach(i => {
          i.setAttribute('data-open', 'false');
          const p = i.querySelector('.faq-panel');
          const b = i.querySelector('.faq-btn');
          if (p) p.hidden = true;
          if (b) b.setAttribute('aria-expanded', 'false');
        });

        item.setAttribute('data-open', String(!open));
        panel.hidden = open;
        btn.setAttribute('aria-expanded', String(!open));
      });
    });
  }

  function initSmoothAnchors() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
      if (!id || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', id);
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      setTimeout(() => target.removeAttribute('tabindex'), 250);
    });
  }

  function initAppointmentForm() {
    const form = document.querySelector('[data-appointment-form]');
    if (!form) return;

    const lang = document.documentElement.lang || 'ro';
    const successText = lang.startsWith('ro')
      ? "Mulțumim! Te vom contacta telefonic pentru confirmare."
      : "Thank you! We’ll call you to confirm.";

    const successEl = document.querySelector('[data-form-success]');
    const errorBox = form.querySelector('[data-form-errors]');

    function setFieldError(input, message) {
      const id = input.getAttribute('id');
      const holder = form.querySelector(`[data-error-for="{id}"]`.replace('{id}', id));
      if (holder) holder.textContent = message || '';
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
    }

    function validate() {
      let ok = true;
      if (errorBox) errorBox.textContent = '';

      const name = form.querySelector('#name');
      const phone = form.querySelector('#phone');
      const email = form.querySelector('#email');
      const service = form.querySelector('#service');
      const windowPref = form.querySelector('#window');
      const msg = form.querySelector('#message');

      const reqMsg = lang.startsWith('ro') ? "Câmp obligatoriu." : "This field is required.";
      const emailMsg = lang.startsWith('ro') ? "Te rugăm introdu un email valid." : "Please enter a valid email.";
      const phoneMsg = lang.startsWith('ro') ? "Te rugăm introdu un număr de telefon valid." : "Please enter a valid phone number.";

      function isEmail(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      }
      function isPhone(v) {
        // light validation (digits, +, spaces, hyphens)
        return /^[+\d][\d\s-]{6,}$/.test(v);
      }

      // reset errors
      [name, phone, email, service, windowPref, msg].forEach(i => i && setFieldError(i, ''));

      if (name && !name.value.trim()) { ok = false; setFieldError(name, reqMsg); }
      if (phone && !phone.value.trim()) { ok = false; setFieldError(phone, reqMsg); }
      if (phone && phone.value.trim() && !isPhone(phone.value.trim())) { ok = false; setFieldError(phone, phoneMsg); }
      if (email && !email.value.trim()) { ok = false; setFieldError(email, reqMsg); }
      if (email && email.value.trim() && !isEmail(email.value.trim())) { ok = false; setFieldError(email, emailMsg); }
      if (service && !service.value) { ok = false; setFieldError(service, reqMsg); }
      if (windowPref && !windowPref.value.trim()) { ok = false; setFieldError(windowPref, reqMsg); }

      if (!ok && errorBox) {
        errorBox.textContent = lang.startsWith('ro')
          ? "Verifică câmpurile marcate și încearcă din nou."
          : "Please check the highlighted fields and try again.";
      }
      return ok;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validate()) return;

      // Static site: show success and clear form
      if (successEl) {
        successEl.textContent = successText;
        successEl.hidden = false;
      }
      form.reset();

      // Move focus to success for a11y
      if (successEl) {
        successEl.setAttribute('tabindex', '-1');
        successEl.focus();
        setTimeout(() => successEl.removeAttribute('tabindex'), 250);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setLanguageLinks();
    initMobileMenu();
    initFAQ();
    initSmoothAnchors();
    initAppointmentForm();
  });
})();
