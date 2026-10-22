/* ============================================================
   JAANKI INFRA DEVELOPERS — script.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── NAV SCROLL EFFECT ── */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if (window.scrollY > 40) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on load

  /* ── MOBILE NAV TOGGLE ── */
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open);
      // Animate hamburger → X
      const spans = navToggle.querySelectorAll('span');
      if (open) {
        spans[0].style.cssText = 'transform: rotate(45deg) translate(5px,5px)';
        spans[1].style.cssText = 'opacity:0';
        spans[2].style.cssText = 'transform: rotate(-45deg) translate(5px,-5px)';
      } else {
        spans.forEach(s => s.style.cssText = '');
      }
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.querySelectorAll('span').forEach(s => s.style.cssText = '');
      });
    });
  }

  /* ── ACTIVE NAV LINK ── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === currentPage ||
       (currentPage === '' && href === 'index.html') ||
       (currentPage === 'index.html' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* ── INTERSECTION OBSERVER (reveal on scroll) ── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-up, .project-card, .feature-card, .stat-item').forEach(el => {
    revealObserver.observe(el);
  });

  /* ── ANIMATED COUNTERS ── */
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target || el.textContent);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();

    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = eased * target;
      el.textContent = (Number.isInteger(target) ? Math.round(value) : value.toFixed(1)) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const numEl = entry.target.querySelector('.stat-number[data-target]');
        if (numEl) animateCounter(numEl);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-item').forEach(el => counterObserver.observe(el));

  /* ── SPEC ACCORDION ── */
  document.querySelectorAll('.spec-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.spec-item');
      const wasOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.spec-item.open').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  // Open first spec item by default
  const firstSpec = document.querySelector('.spec-item');
  if (firstSpec) firstSpec.classList.add('open');

  /* ── GALLERY LIGHTBOX ── */
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (galleryItems.length) {
    // Create lightbox
    const lb = document.createElement('div');
    lb.id = 'lightbox';
    lb.style.cssText = `
      display:none; position:fixed; inset:0; z-index:9999;
      background:rgba(0,0,0,0.92); align-items:center;
      justify-content:center; cursor:zoom-out;
    `;
    lb.innerHTML = `
      <button id="lb-close" style="position:absolute;top:1.5rem;right:1.5rem;background:rgba(255,255,255,0.1);
        border:none;color:#fff;width:44px;height:44px;border-radius:50%;font-size:1.2rem;cursor:pointer;
        transition:background 0.2s;">&times;</button>
      <button id="lb-prev" style="position:absolute;left:1.5rem;top:50%;transform:translateY(-50%);
        background:rgba(255,255,255,0.1);border:none;color:#fff;width:44px;height:44px;border-radius:50%;
        font-size:1.2rem;cursor:pointer;">&#8249;</button>
      <img id="lb-img" src="" style="max-width:90vw;max-height:88vh;object-fit:contain;border-radius:8px;
        box-shadow:0 24px 80px rgba(0,0,0,0.6);">
      <button id="lb-next" style="position:absolute;right:1.5rem;top:50%;transform:translateY(-50%);
        background:rgba(255,255,255,0.1);border:none;color:#fff;width:44px;height:44px;border-radius:50%;
        font-size:1.2rem;cursor:pointer;">&#8250;</button>
    `;
    document.body.appendChild(lb);

    const imgs = Array.from(galleryItems).map(g => g.querySelector('img')?.src).filter(Boolean);
    let idx = 0;

    const openLB = (i) => {
      idx = i;
      document.getElementById('lb-img').src = imgs[idx];
      lb.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    };

    const closeLB = () => {
      lb.style.display = 'none';
      document.body.style.overflow = '';
    };

    galleryItems.forEach((item, i) => item.addEventListener('click', () => openLB(i)));
    document.getElementById('lb-close').addEventListener('click', closeLB);
    lb.addEventListener('click', e => { if (e.target === lb) closeLB(); });
    document.getElementById('lb-prev').addEventListener('click', e => {
      e.stopPropagation();
      idx = (idx - 1 + imgs.length) % imgs.length;
      document.getElementById('lb-img').src = imgs[idx];
    });
    document.getElementById('lb-next').addEventListener('click', e => {
      e.stopPropagation();
      idx = (idx + 1) % imgs.length;
      document.getElementById('lb-img').src = imgs[idx];
    });
    document.addEventListener('keydown', e => {
      if (lb.style.display === 'flex') {
        if (e.key === 'Escape') closeLB();
        if (e.key === 'ArrowLeft') document.getElementById('lb-prev').click();
        if (e.key === 'ArrowRight') document.getElementById('lb-next').click();
      }
    });
  }

  /* ── NEWSLETTER FORM ── */
  document.querySelectorAll('.footer-newsletter, .newsletter-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('input');
      if (input?.value) {
        input.value = '';
        const btn = form.querySelector('button');
        if (btn) { btn.innerHTML = '✓'; btn.style.background = '#2d8a4e'; }
        setTimeout(() => {
          if (btn) { btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i>'; btn.style.background = ''; }
        }, 2500);
      }
    });
  });

  /* ── CONTACT FORM ── */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      if (btn) {
        btn.textContent = 'Sending…';
        btn.disabled = true;
        setTimeout(() => {
          btn.textContent = '✓ Message Sent! We\'ll contact you shortly.';
          btn.style.background = 'linear-gradient(135deg, #2d8a4e, #1a6b38)';
          contactForm.reset();
          setTimeout(() => {
            btn.textContent = 'Send Message';
            btn.style.background = '';
            btn.disabled = false;
          }, 4000);
        }, 1200);
      }
    });
  }

  /* ── SMOOTH SCROLL for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ── STAGGER CHILDREN on visible ── */
  const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const children = entry.target.querySelectorAll(':scope > *');
        children.forEach((child, i) => {
          child.style.transitionDelay = `${i * 0.08}s`;
          child.classList.add('visible');
        });
        staggerObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.stagger-children').forEach(el => staggerObserver.observe(el));

});
