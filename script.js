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


  /* ---------------- Carregamento sob demanda das fotos ----------------
     Só a 1ª foto de cada carrossel vem no HTML. As outras têm data-src e
     entram quando a pessoa passa a foto ou abre o lightbox. Isso derruba
     o peso do primeiro carregamento sem tirar nada do site. */
  const hidratar = (raiz) => {
    (raiz || document).querySelectorAll('img[data-src]').forEach(img => {
      const s = img.getAttribute('data-src');
      const ss = img.getAttribute('data-srcset');
      if (ss) img.srcset = ss;
      if (s) img.src = s;
      img.removeAttribute('data-src');
      img.removeAttribute('data-srcset');
    });
  };
  window.hidratarFotos = hidratar;

  // Rede de segurança: se nada disso disparar, carrega tudo bem depois,
  // pra nenhuma foto ficar presa. Os 8s são de propósito: já passou muito
  // do carregamento inicial, então não disputa banda com o que importa.
  window.addEventListener('load', () => {
    setTimeout(() => {
      const depois = () => hidratar(document);
      if ('requestIdleCallback' in window) requestIdleCallback(depois, { timeout: 4000 });
      else depois();
    }, 8000);
  });


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

    // Ao primeiro toque/clique no carrossel, carrega as fotos restantes dele.
    // Nada de 'pointerenter': passar o mouse por cima não é intenção de ver as
    // fotos, e ao rolar a página o ponteiro cruzaria todos os cards de uma vez.
    const acordar = () => hidratar(gallery);
    ['pointerdown','touchstart','focusin'].forEach(ev =>
      gallery.addEventListener(ev, acordar, { once: true, passive: true }));
    // rolar o próprio carrossel para o lado também conta como intenção
    track.addEventListener('scroll', acordar, { once: true, passive: true });

    if (btnPrev) btnPrev.addEventListener('click', (e) => {
      e.preventDefault();
      acordar();
      track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' });
    });
    if (btnNext) btnNext.addEventListener('click', (e) => {
      e.preventDefault();
      acordar();
      track.scrollBy({ left: track.clientWidth, behavior: 'smooth' });
    });

    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', () => {
      clearTimeout(track._galleryResize);
      track._galleryResize = setTimeout(update, 150);
    });

    update();
  });


  /* ---------------- Lightbox: clique na foto abre em tamanho real ---------------- */
  (() => {
    const lb    = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    const lbCap = document.getElementById('lightbox-cap');
    const lbCon = document.getElementById('lightbox-contador');
    if (!lb || !lbImg) return;

    const btnPrev = lb.querySelector('[data-lb-prev]');
    const btnNext = lb.querySelector('[data-lb-next]');

    let fotos = [];   // imgs da galeria clicada
    let idx = 0;
    let origem = null; // pra devolver o foco ao fechar

    // o card usa a versão pequena (srcset); ampliado tem que usar a maior
    const versaoGrande = (img) => {
      const base = img.getAttribute('data-src') || img.getAttribute('src') || '';
      return base.replace(/-(?:400|800)\.webp$/, '.webp');
    };

    const mostrar = () => {
      const img = fotos[idx];
      if (!img) return;
      lbImg.src = versaoGrande(img);
      lbImg.alt = img.alt || '';
      if (lbCap) lbCap.textContent = img.alt || '';
      if (lbCon) lbCon.textContent = fotos.length > 1 ? `(${idx + 1} de ${fotos.length})` : '';
      if (btnPrev) btnPrev.disabled = idx <= 0;
      if (btnNext) btnNext.disabled = idx >= fotos.length - 1;
    };

    const abrir = (galeria, img) => {
      // garante que as fotos adiadas dessa galeria já tenham src antes de ampliar
      if (window.hidratarFotos) window.hidratarFotos(galeria);
      fotos = Array.from(galeria.querySelectorAll('[data-track] img'));
      idx = Math.max(0, fotos.indexOf(img));
      origem = img;
      mostrar();
      lb.hidden = false;
      lb.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-aberto');
      const alvo = lb.querySelector('.lightbox__close');
      if (alvo) alvo.focus();
    };

    const fechar = () => {
      lb.hidden = true;
      lb.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-aberto');
      lbImg.src = '';
      if (origem && typeof origem.focus === 'function') origem.focus();
      origem = null;
    };

    const ir = (passo) => {
      const novo = idx + passo;
      if (novo < 0 || novo >= fotos.length) return;
      idx = novo;
      mostrar();
    };

    // delegação: pega qualquer foto de qualquer galeria, inclusive as da área comum
    document.addEventListener('click', (e) => {
      const img = e.target.closest('[data-gallery] [data-track] img');
      if (!img) return;
      const galeria = img.closest('[data-gallery]');
      if (!galeria) return;
      e.preventDefault();
      abrir(galeria, img);
    });

    lb.querySelectorAll('[data-fechar-lightbox]').forEach(b => b.addEventListener('click', fechar));
    if (btnPrev) btnPrev.addEventListener('click', () => ir(-1));
    if (btnNext) btnNext.addEventListener('click', () => ir(1));

    document.addEventListener('keydown', (e) => {
      if (lb.hidden) return;
      if (e.key === 'Escape')     { fechar(); }
      if (e.key === 'ArrowLeft')  { ir(-1); }
      if (e.key === 'ArrowRight') { ir(1); }
    });

    // arrastar pro lado no celular
    let x0 = null;
    lb.addEventListener('touchstart', (e) => { x0 = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) ir(dx < 0 ? 1 : -1);
      x0 = null;
    }, { passive: true });
  })();


  /* ---------------- Ano no footer ---------------- */
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  /* Tracking de CTAs migrado para o Google Tag Manager (GTM-WJZH2X5V):
     WhatsApp -> Lead, Airbnb -> InitiateCheckout, com content_name = data-cta (chalé).
     Os atributos data-cta nos botões continuam sendo usados pela variável do GTM. */


  /* ---------------- Modal Pré-reserva ---------------- */
  (() => {
    const modal = document.getElementById('prereserva');
    const form  = document.getElementById('prereserva-form');
    if (!modal || !form) return;

    const ENDPOINT = 'https://script.google.com/macros/s/AKfycbx6dTvCBMGjz_47mwSwgW6uBeF1X9oqRlg1wdk0a-zk6-3D31abI1p2YpPBeEoMhl48-Q/exec';
    const WHATS = '5532984789082';
    const selChale = document.getElementById('prereserva-chale');

    // data-cta do botão -> nome do chalé (pra pré-selecionar)
    const MAPA = {
      'chale-pode-cre-whatsapp': 'Chalé Pode-Cré',
      'chale-uai-so-whatsapp':   'Chalé Uai-Só',
      'chale-trem-bao-whatsapp': 'Chalé Trem-Bão',
      'chale-demais-whatsapp':   'Chalé Demais da Conta'
    };

    // data-cta do botão -> rótulo de origem (de qual botão o lead veio)
    const ORIGEM = {
      'hero-whatsapp':           'Hero (topo do site)',
      'chale-pode-cre-whatsapp': 'Card Chalé Pode-Cré',
      'chale-uai-so-whatsapp':   'Card Chalé Uai-Só',
      'chale-trem-bao-whatsapp': 'Card Chalé Trem-Bão',
      'chale-demais-whatsapp':   'Card Chalé Demais',
      'valores-whatsapp':        'Seção Tarifas',
      'cta-final-whatsapp':      'CTA Final'
    };
    let origemAtual = 'form-site';

    const abrir = (chale) => {
      if (chale && selChale) selChale.value = chale;
      modal.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-aberto');
    };
    const fechar = () => {
      modal.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-aberto');
    };

    // Botões de RESERVA (hero / chalé / valores / cta-final + whatsapp) abrem o modal.
    // Os secundários (nav, rodapé, flutuante, eventos) seguem direto pro WhatsApp.
    document.querySelectorAll('a[data-cta]').forEach((el) => {
      const cta = el.getAttribute('data-cta') || '';
      const ehReserva = cta.includes('whatsapp') &&
        (cta.startsWith('hero') || cta.startsWith('chale-') ||
         cta.startsWith('valores') || cta.startsWith('cta-final'));
      if (!ehReserva) return;
      el.addEventListener('click', (e) => {
        e.preventDefault();
        origemAtual = ORIGEM[cta] || cta;
        abrir(MAPA[cta] || '');
      });
    });

    modal.querySelectorAll('[data-fechar-modal]').forEach((b) => b.addEventListener('click', fechar));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) fechar(); });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const dados = {
        nome:     (fd.get('nome')     || '').toString().trim(),
        whatsapp: (fd.get('whatsapp') || '').toString().trim(),
        chale:    (fd.get('chale')    || '').toString(),
        checkin:  (fd.get('checkin')  || '').toString(),
        checkout: (fd.get('checkout') || '').toString(),
        hospedes: (fd.get('hospedes') || '').toString(),
        origem:   origemAtual
      };

      // 1) Salva na planilha (não bloqueia; keepalive garante o envio mesmo ao abrir o WhatsApp)
      try {
        fetch(ENDPOINT, { method: 'POST', body: JSON.stringify(dados), keepalive: true }).catch(() => {});
      } catch (err) { /* silencioso */ }

      // 2) Evento pro GTM (pré-reserva qualificada) — o Lead passa a disparar aqui
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'prereserva_enviada', chale: dados.chale, hospedes: dados.hospedes, origem: dados.origem });

      // 3) Abre o WhatsApp com a mensagem já montada
      const msg =
        'Olá! Quero fazer uma pré-reserva:\n' +
        '\n👤 ' + dados.nome +
        '\n🏡 ' + dados.chale +
        '\n📅 Check-in: ' + dados.checkin +
        '\n📅 Check-out: ' + dados.checkout +
        '\n👥 Hóspedes: ' + dados.hospedes;
      window.open('https://wa.me/' + WHATS + '?text=' + encodeURIComponent(msg), '_blank');

      fechar();
      form.reset();
    });
  })();

})();
