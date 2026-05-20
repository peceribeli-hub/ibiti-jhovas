/* ==========================================================================
   Ibiti Jhovas Chalés — Landing Page
   Interações: nav scroll/mobile, reveal on scroll, carrossel de depoimentos
   ========================================================================== */

(function () {
  'use strict';

  /* ---------------- Nav: estado ao rolar + mobile menu ---------------- */
  const nav = document.querySelector('.nav');
  const navToggle = document.querySelector('.nav__toggle');
  const navMobile = document.getElementById('mobile-menu');

  const updateNavScrollState = () => {
    if (!nav) return;
    if (window.scrollY > 50) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };

  updateNavScrollState();
  window.addEventListener('scroll', updateNavScrollState, { passive: true });

  if (navToggle && navMobile) {
    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navMobile.hidden = !isOpen;
    });

    // Fecha o menu ao clicar num link
    navMobile.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navMobile.hidden = true;
      });
    });
  }


  /* ---------------- Reveal on scroll ---------------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealEls.forEach(el => io.observe(el));
  } else {
    // fallback: mostra tudo
    revealEls.forEach(el => el.classList.add('is-visible'));
  }


  /* ---------------- Carrossel de depoimentos ---------------- */
  const carousel = document.querySelector('[data-carousel]');
  if (carousel) {
    const track = carousel.querySelector('[data-track]');
    const btnPrev = carousel.querySelector('[data-prev]');
    const btnNext = carousel.querySelector('[data-next]');
    const dotsWrap = carousel.querySelector('[data-dots]');
    const cards = Array.from(track.children);

    // calcula quantos cards são visíveis simultaneamente para criar paginação
    const getCardsPerView = () => {
      const trackWidth = track.clientWidth;
      const cardWidth = cards[0].getBoundingClientRect().width + 24; // gap
      return Math.max(1, Math.round(trackWidth / cardWidth));
    };

    let cardsPerView = getCardsPerView();
    let totalPages = Math.max(1, Math.ceil(cards.length / cardsPerView));

    const buildDots = () => {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      cardsPerView = getCardsPerView();
      totalPages = Math.max(1, Math.ceil(cards.length / cardsPerView));
      for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', `Ir para página ${i + 1}`);
        dot.addEventListener('click', () => goToPage(i));
        dotsWrap.appendChild(dot);
      }
      updateDots();
    };

    const updateDots = () => {
      if (!dotsWrap) return;
      const scrollLeft = track.scrollLeft;
      const pageWidth = track.clientWidth;
      const current = Math.round(scrollLeft / pageWidth);
      Array.from(dotsWrap.children).forEach((d, i) => {
        d.classList.toggle('is-active', i === current);
      });
    };

    const goToPage = (idx) => {
      const pageWidth = track.clientWidth;
      track.scrollTo({ left: idx * pageWidth, behavior: 'smooth' });
    };

    const updateButtons = () => {
      if (!btnPrev || !btnNext) return;
      const maxScroll = track.scrollWidth - track.clientWidth - 2;
      btnPrev.disabled = track.scrollLeft <= 2;
      btnNext.disabled = track.scrollLeft >= maxScroll;
    };

    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' });
      });
    }
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        track.scrollBy({ left: track.clientWidth, behavior: 'smooth' });
      });
    }

    track.addEventListener('scroll', () => {
      updateButtons();
      updateDots();
    }, { passive: true });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        buildDots();
        updateButtons();
      }, 200);
    });

    buildDots();
    updateButtons();
  }


  /* ---------------- Mini-carrosseis dos chalés ---------------- */
  document.querySelectorAll('[data-gallery]').forEach(gallery => {
    const track = gallery.querySelector('[data-track]');
    const btnPrev = gallery.querySelector('[data-prev]');
    const btnNext = gallery.querySelector('[data-next]');
    const counter = gallery.querySelector('[data-counter]');
    if (!track) return;
    const total = track.querySelectorAll('img').length;
    if (!total) return;

    const update = () => {
      const w = track.clientWidth;
      if (!w) return;
      const idx = Math.min(total - 1, Math.max(0, Math.round(track.scrollLeft / w)));
      if (counter) counter.textContent = `${idx + 1} / ${total}`;
      if (btnPrev) btnPrev.disabled = idx <= 0;
      if (btnNext) btnNext.disabled = idx >= total - 1;
    };

    if (btnPrev) btnPrev.addEventListener('click', (e) => {
      e.preventDefault();
      track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' });
    });
    if (btnNext) btnNext.addEventListener('click', (e) => {
      e.preventDefault();
      track.scrollBy({ left: track.clientWidth, behavior: 'smooth' });
    });

    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', () => {
      clearTimeout(track._galleryResize);
      track._galleryResize = setTimeout(update, 150);
    });

    update();
  });


  /* ---------------- Ano no footer ---------------- */
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  /* ---------------- Tracking de CTAs (Meta Pixel) ---------------- */
  // WhatsApp  -> Lead (intenção forte: contato direto para reservar)
  // Airbnb    -> InitiateCheckout (clique sai do site rumo ao checkout do Airbnb)
  document.querySelectorAll('[data-cta]').forEach(el => {
    el.addEventListener('click', () => {
      if (!window.fbq) return;
      const ctaId = el.getAttribute('data-cta') || '';
      if (ctaId.includes('whatsapp')) {
        fbq('track', 'Lead', { cta: ctaId });
      } else if (ctaId.includes('airbnb')) {
        fbq('track', 'InitiateCheckout', { cta: ctaId });
      }
    });
  });

})();
