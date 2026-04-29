/* ═══════════════════════════════════════════════════════
   SMOOTH BY JUNE — Main JavaScript
   Navigation, scroll reveal, FAQ, cookies
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── Utility ─── */
  const qs  = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ─── Navigation ─── */
  const nav       = qs('.nav');
  const navToggle = qs('#navToggle');
  const navMenu   = qs('#navMenu');

  if (nav) {
    /* Sticky background on scroll */
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* Mobile toggle */
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        const open = navMenu.classList.toggle('open');
        navToggle.classList.toggle('open', open);
        navToggle.setAttribute('aria-expanded', open);
        document.body.style.overflow = open ? 'hidden' : '';
      });

      /* Close menu when a link is clicked */
      qsa('.nav__link', navMenu).forEach(link => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('open');
          navToggle.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });

      /* Close on outside click */
      document.addEventListener('click', e => {
        if (!nav.contains(e.target) && navMenu.classList.contains('open')) {
          navMenu.classList.remove('open');
          navToggle.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      });
    }

    /* Active link highlighting */
    const path = window.location.pathname.split('/').pop() || 'index.html';
    qsa('.nav__link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === path || (path === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  /* ─── Scroll Reveal ─── */
  if ('IntersectionObserver' in window) {
    const revealObs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    qsa('.reveal').forEach(el => revealObs.observe(el));
  } else {
    /* Fallback — just show everything */
    qsa('.reveal').forEach(el => el.classList.add('visible'));
  }

  /* ─── Hero parallax (subtle) ─── */
  const heroBg = qs('.hero__bg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const offset = window.scrollY;
      heroBg.style.transform = `translateY(${offset * 0.25}px)`;
    }, { passive: true });
  }

  /* ─── FAQ Accordion ─── */
  qsa('.faq-item').forEach(item => {
    const btn = qs('.faq-item__q', item);
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      /* Close all siblings */
      const parent = item.closest('.faq-list');
      if (parent) {
        qsa('.faq-item', parent).forEach(sibling => {
          sibling.classList.remove('open');
          qs('.faq-item__q', sibling)?.setAttribute('aria-expanded', 'false');
        });
      }

      /* Toggle clicked item */
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });

    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('role', 'button');
  });

  /* ─── Smooth scroll for anchor links ─── */
  qsa('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = qs(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ─── Cookie Banner ─── */
  const cookieBanner = qs('#cookieBanner');
  if (cookieBanner) {
    const accepted = localStorage.getItem('sbj_cookies');

    if (!accepted) {
      /* Show after small delay */
      setTimeout(() => cookieBanner.classList.add('visible'), 1200);
    }

    qs('#cookieAccept')?.addEventListener('click', () => {
      localStorage.setItem('sbj_cookies', 'accepted');
      cookieBanner.classList.remove('visible');
    });

    qs('#cookieDecline')?.addEventListener('click', () => {
      localStorage.setItem('sbj_cookies', 'declined');
      cookieBanner.classList.remove('visible');
    });
  }

  /* ─── Stagger children with reveal class ─── */
  qsa('.reveal-stagger').forEach(parent => {
    qsa(':scope > *', parent).forEach((child, i) => {
      child.classList.add('reveal', `reveal-d${Math.min(i + 1, 4)}`);
    });
    /* Re-observe new elements */
    if ('IntersectionObserver' in window) {
      const staggerObs = new IntersectionObserver(
        entries => entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('visible'); staggerObs.unobserve(e.target); }
        }),
        { threshold: 0.1 }
      );
      qsa('.reveal', parent).forEach(el => staggerObs.observe(el));
    }
  });

})();
