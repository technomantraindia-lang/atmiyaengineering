/* =============================================
   ATMIYA ENGINEERING - Main JavaScript
   ============================================= */

'use strict';

/* ---- 1. SMART NAVBAR SCROLL EFFECT (HIDE ON DOWN SCROLL, SHOW ON UP SCROLL) ---- */
const navbar = document.getElementById('navbar');
let lastScrollY = window.scrollY;

function handleNavbarScroll() {
  if (!navbar) return;
  const currentScrollY = window.scrollY;

  // Add scrolled class for background opacity
  if (currentScrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Keep navbar visible if mobile nav menu is active
  const navMenu = document.getElementById('nav-menu');
  if (navMenu && navMenu.classList.contains('active')) {
    navbar.classList.remove('nav-hidden');
    return;
  }

  // Smart Hide/Show direction logic:
  // When scrolling DOWN (currentScrollY > lastScrollY) past 100px -> Hide header (slides up)
  // When scrolling UP (currentScrollY < lastScrollY) -> Reveal header (slides down into view)
  if (currentScrollY > lastScrollY && currentScrollY > 100) {
    navbar.classList.add('nav-hidden');
  } else {
    navbar.classList.remove('nav-hidden');
  }

  lastScrollY = currentScrollY;
}

window.addEventListener('scroll', handleNavbarScroll, { passive: true });
handleNavbarScroll();

/* ---- 2. MOBILE HAMBURGER MENU ---- */
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navMenu.classList.toggle('active');
  document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
});

// Close menu on nav link click
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navMenu.classList.remove('active');
    document.body.style.overflow = '';
  });
});

// Close menu on outside click
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target)) {
    hamburger.classList.remove('open');
    navMenu.classList.remove('active');
    document.body.style.overflow = '';
  }
});

/* ---- 3. SMOOTH SCROLL FOR ANCHOR LINKS ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80; // navbar height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ---- 4. SCROLL REVEAL (IntersectionObserver) ---- */
const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger delay for sibling cards
      const siblings = entry.target.parentElement.querySelectorAll('.reveal, .reveal-left, .reveal-right');
      let delay = 0;
      siblings.forEach((sib, idx) => {
        if (sib === entry.target) delay = idx * 80;
      });
      setTimeout(() => {
        entry.target.classList.add('active');
      }, delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealElements.forEach(el => revealObserver.observe(el));

/* ---- 5. ANIMATED COUNTERS ---- */
function animateCounter(el) {
  const target   = parseInt(el.getAttribute('data-target'), 10);
  const duration = 2000;
  const start    = performance.now();

  function update(timestamp) {
    const elapsed  = timestamp - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }
  requestAnimationFrame(update);
}

const statsSection  = document.querySelector('.stats-section');
let countersFired   = false;

const statsObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !countersFired) {
    countersFired = true;

    // Counters
    document.querySelectorAll('.count').forEach(el => animateCounter(el));

    // Animate ring fills
    document.querySelectorAll('.stat-card').forEach(card => {
      const progress  = parseInt(card.querySelector('.stat-ring')?.getAttribute('data-progress') || '0', 10);
      const ringFill  = card.querySelector('.ring-fill');
      const barFill   = card.querySelector('.scb-fill');
      const barWidth  = parseInt(barFill?.getAttribute('data-width') || '0', 10);
      const totalDash = 213;

      if (ringFill) {
        setTimeout(() => {
          ringFill.style.strokeDashoffset = totalDash - (totalDash * progress / 100);
        }, 200);
      }
      if (barFill) {
        setTimeout(() => {
          barFill.style.width = barWidth + '%';
        }, 300);
      }
    });

    statsObserver.disconnect();
  }
}, { threshold: 0.25 });

if (statsSection) statsObserver.observe(statsSection);

/* ---- 5b. SKILL BAR ANIMATION (About section) ---- */
const skillFills = document.querySelectorAll('.skill-fill');
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const w = entry.target.getAttribute('data-width');
      setTimeout(() => { entry.target.style.width = w + '%'; }, 200);
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
skillFills.forEach(sf => skillObserver.observe(sf));

/* ---- 5c. MOSAIC THUMBNAIL SWITCHER ---- */
const mosaicThumbs = document.querySelectorAll('.mosaic-thumb');
const mosaicMain   = document.getElementById('mosaicMain');
mosaicThumbs.forEach(thumb => {
  thumb.addEventListener('click', () => {
    mosaicThumbs.forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
    if (mosaicMain) {
      mosaicMain.style.opacity = '0';
      mosaicMain.style.transition = 'opacity 0.3s ease';
      setTimeout(() => {
        mosaicMain.src = thumb.getAttribute('data-src');
        mosaicMain.style.opacity = '1';
      }, 300);
    }
  });
});

/* ---- 6. HERO SLIDER ---- */
(function () {
  const slides   = document.querySelectorAll('.hero-slide');
  const dots     = document.querySelectorAll('.hdot');
  const prevBtn  = document.getElementById('heroPrev');
  const nextBtn  = document.getElementById('heroNext');
  if (!slides.length) return;

  let current   = 0;
  let autoTimer = null;

  function goTo(n) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function startAuto() {
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }
  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(parseInt(dot.getAttribute('data-slide'), 10));
      resetAuto();
    });
  });

  startAuto();
})();

/* ---- 6b. HERO HEADING WORD ANIMATION ---- */
(function () {
  const words = document.querySelectorAll('.hw');
  if (!words.length) return;
  words.forEach((w, i) => {
    setTimeout(() => w.classList.add('visible'), 400 + i * 150);
  });
})();

/* ---- 6c. ROTATING SUBTITLE ---- */
(function () {
  const items = document.querySelectorAll('.hr-item');
  if (!items.length) return;
  let idx = 0;

  setInterval(() => {
    items[idx].classList.remove('active');
    items[idx].classList.add('exit');
    const prev = idx;
    idx = (idx + 1) % items.length;
    items[idx].classList.add('active');
    setTimeout(() => items[prev].classList.remove('exit'), 500);
  }, 2800);
})();

/* ---- 6d. PARTICLE CANVAS ---- */
(function () {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function rand(min, max) { return Math.random() * (max - min) + min; }

  // Create particles
  for (let i = 0; i < 55; i++) {
    particles.push({
      x: rand(0, window.innerWidth),
      y: rand(0, window.innerHeight),
      r: rand(1, 3),
      dx: rand(-0.3, 0.3),
      dy: rand(-0.5, -0.15),
      alpha: rand(0.2, 0.7),
      color: Math.random() > 0.5 ? '201,162,39' : '255,255,255'
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
      ctx.fill();

      // Move
      p.x += p.dx;
      p.y += p.dy;

      // Wrap
      if (p.y < -5)  p.y = H + 5;
      if (p.x < -5)  p.x = W + 5;
      if (p.x > W+5) p.x = -5;
    });

    // Draw connecting lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(201,162,39,${0.12 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ---- 7. ACTIVE NAV LINK ON SCROLL ---- */
const sections  = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        }
      });
    }
  });
}, { threshold: 0.35 });

sections.forEach(sec => sectionObserver.observe(sec));

/* ---- 8. HERO PARALLAX (subtle inner content) ---- */
window.addEventListener('scroll', () => {
  const heroInner = document.querySelector('.hero-inner');
  if (heroInner && window.scrollY < window.innerHeight) {
    heroInner.style.transform = `translateY(${window.scrollY * 0.18}px)`;
  }
}, { passive: true });

/* ---- 9. GALLERY LIGHTBOX ---- */
const galleryImages = [
  'assets/images/new-1.png',
  'assets/images/new-2.png',
  'assets/images/new-3.png',
  'assets/images/new-4.png',
  'assets/images/new-5.png',
  'assets/images/new-6.png',
  'assets/images/new-7.png',
  'assets/images/new-8.png',
  'assets/images/new-9.png',
  'assets/images/new-10.png',
  'assets/images/new-11.png',
  'assets/images/new-12.png'
];

const lightbox   = document.getElementById('lightbox');
const lbImg      = document.getElementById('lightbox-img');
const lbPrev     = document.getElementById('lb-prev');
const lbNext     = document.getElementById('lb-next');
const lbClose    = document.getElementById('lb-close');
const lbCounter  = document.getElementById('lb-counter');
let currentIndex = 0;

function openLightbox(index) {
  currentIndex = index;
  lbImg.src = galleryImages[currentIndex];
  lbCounter.textContent = `${currentIndex + 1} / ${galleryImages.length}`;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
  lbImg.src = '';
}

function showPrev() {
  currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
  lbImg.src = galleryImages[currentIndex];
  lbCounter.textContent = `${currentIndex + 1} / ${galleryImages.length}`;
}

function showNext() {
  currentIndex = (currentIndex + 1) % galleryImages.length;
  lbImg.src = galleryImages[currentIndex];
  lbCounter.textContent = `${currentIndex + 1} / ${galleryImages.length}`;
}

// Open on gallery item click
document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    const index = parseInt(item.getAttribute('data-index'), 10);
    openLightbox(index);
  });
});

// Controls
lbClose.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click',  showPrev);
lbNext.addEventListener('click',  showNext);

// Close on backdrop click
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   showPrev();
  if (e.key === 'ArrowRight')  showNext();
});

// Touch swipe support for lightbox
let touchStartX = 0;
lightbox.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].clientX;
}, { passive: true });
lightbox.addEventListener('touchend', (e) => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) {
    diff > 0 ? showNext() : showPrev();
  }
}, { passive: true });

/* ---- 10. CONTACT FORM SUBMIT ---- */
const contactForm = document.getElementById('contactForm');
const toast       = document.getElementById('toast');

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name  = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();

    if (!name) {
      showToast('⚠ Please enter your name.');
      document.getElementById('name').focus();
      return;
    }
    if (!phone) {
      showToast('⚠ Please enter your phone number.');
      document.getElementById('phone').focus();
      return;
    }

    // Simulate send (replace with actual backend/EmailJS as needed)
    const btn = contactForm.querySelector('.form-submit');
    btn.textContent = 'Sending...';
    btn.disabled = true;

    setTimeout(() => {
      contactForm.reset();
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send Message`;
      btn.disabled = false;
      showToast('✓ Thank you! We\'ll contact you shortly.');
    }, 1200);
  });
}

/* ---- 11. SERVICE CARD STAGGER ON LOAD ---- */
window.addEventListener('load', () => {
  // Force-trigger reveals for above-the-fold elements
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      setTimeout(() => el.classList.add('active'), 100);
    }
  });
});

/* ---- 12. FLOATING SHAPES MOUSE PARALLAX ---- */
const shapes = document.querySelectorAll('.shape');
document.addEventListener('mousemove', (e) => {
  const cx = window.innerWidth  / 2;
  const cy = window.innerHeight / 2;
  const dx = (e.clientX - cx) / cx;
  const dy = (e.clientY - cy) / cy;

  shapes.forEach((shape, i) => {
    const factor = (i + 1) * 6;
    shape.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
  });
});

/* ---- 13. BACK TO TOP on logo click ---- */
document.querySelector('.logo').addEventListener('click', (e) => {
  const href = document.querySelector('.logo').getAttribute('href');
  if (href === '#home') {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

/* ---- 14. SERVICES FILTER TABS ---- */
(function () {
  const tabs  = document.querySelectorAll('.svc-tab');
  const cards = document.querySelectorAll('.svc-card');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');

      cards.forEach((card, i) => {
        const cat = card.getAttribute('data-category');
        const show = filter === 'all' || cat === filter;

        if (show) {
          card.style.display = 'flex';
          card.classList.remove('hidden');
          setTimeout(() => {
            card.style.opacity   = '1';
            card.style.transform = 'translateY(0) scale(1)';
          }, i * 60);
        } else {
          card.style.opacity   = '0';
          card.style.transform = 'scale(0.92)';
          card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
          setTimeout(() => { card.style.display = 'none'; }, 260);
        }
      });
    });
  });
})();

console.log('%cAtmiya Engineering Website Loaded ✓', 'color:#C9A227;font-size:14px;font-weight:bold;');

/* ---- 15. WHY CHOOSE v2 — Dynamic Animations ---- */
(function () {

  /* ---- 15a. Why Section Particle Canvas ---- */
  const whyCanvas = document.getElementById('whyCanvas');
  if (whyCanvas) {
    const wCtx = whyCanvas.getContext('2d');
    let wW, wH;

    function wResize() {
      const rect = whyCanvas.parentElement.getBoundingClientRect();
      wW = whyCanvas.width  = rect.width  || window.innerWidth;
      wH = whyCanvas.height = rect.height || 600;
    }
    wResize();
    window.addEventListener('resize', wResize, { passive: true });

    // Build gold particle field
    const wParticles = Array.from({ length: 40 }, () => ({
      x: Math.random() * wW,
      y: Math.random() * wH,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.1
    }));

    function wDraw() {
      wCtx.clearRect(0, 0, wW, wH);
      wParticles.forEach(p => {
        wCtx.beginPath();
        wCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        wCtx.fillStyle = `rgba(201,162,39,${p.alpha})`;
        wCtx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0) p.x = wW; if (p.x > wW) p.x = 0;
        if (p.y < 0) p.y = wH; if (p.y > wH) p.y = 0;
      });
      // Subtle connecting lines
      for (let i = 0; i < wParticles.length; i++) {
        for (let j = i + 1; j < wParticles.length; j++) {
          const dx = wParticles[i].x - wParticles[j].x;
          const dy = wParticles[i].y - wParticles[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            wCtx.beginPath();
            wCtx.moveTo(wParticles[i].x, wParticles[i].y);
            wCtx.lineTo(wParticles[j].x, wParticles[j].y);
            wCtx.strokeStyle = `rgba(201,162,39,${0.08 * (1 - d / 120)})`;
            wCtx.lineWidth = 0.5;
            wCtx.stroke();
          }
        }
      }
      requestAnimationFrame(wDraw);
    }
    wDraw();
  }

  /* ---- 15b. Why Section Counter Animation ---- */
  const whySection   = document.querySelector('.why-v2-section');
  let whyCounterDone = false;

  if (whySection) {
    const whyObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !whyCounterDone) {
        whyCounterDone = true;

        // Animate wv2-count numbers
        document.querySelectorAll('.wv2-count').forEach(el => {
          const target   = parseInt(el.getAttribute('data-target'), 10);
          const duration = 2200;
          const start    = performance.now();
          function tick(now) {
            const elapsed  = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased    = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target);
            if (progress < 1) requestAnimationFrame(tick);
            else el.textContent = target;
          }
          requestAnimationFrame(tick);
        });

        whyObs.disconnect();
      }
    }, { threshold: 0.2 });

    whyObs.observe(whySection);
  }

  /* ---- 15c. Progress bar fill on card reveal ---- */
  const wv2Fills = document.querySelectorAll('.wv2-progress-fill');

  const wv2ProgressObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const targetWidth = entry.target.getAttribute('data-width');
        setTimeout(() => {
          entry.target.style.width = targetWidth + '%';
        }, 400);
        wv2ProgressObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  wv2Fills.forEach(f => wv2ProgressObs.observe(f));

  /* ---- 15d. Card stagger entrance ---- */
  // Cards already use .reveal class handled by the main revealObserver,
  // but we also add a custom staggered delay via CSS --delay variable.
  // Ensure cards get .active class with their delay applied:
  const wv2Cards = document.querySelectorAll('.wv2-card');

  const wv2CardObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseFloat(getComputedStyle(entry.target).getPropertyValue('--delay') || '0') * 1000;
        setTimeout(() => {
          entry.target.classList.add('active');
        }, delay);
        wv2CardObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

  wv2Cards.forEach(card => wv2CardObs.observe(card));

  /* ---- 15e. Card 3D tilt on mouse move ---- */
  wv2Cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const rx     = ((e.clientY - cy) / (rect.height / 2)) * 5;   // max 5deg
      const ry     = ((e.clientX - cx) / (rect.width  / 2)) * -5;
      card.style.transform = `translateY(-10px) scale(1.02) perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

})();

/* ---- 16. CTA BANNER v2 — Particles, Typing, Interactions ---- */
(function () {

  /* ── 16a. Particle Canvas ── */
  const ctaCanvas = document.getElementById('ctaCanvas');
  if (ctaCanvas) {
    const ctx = ctaCanvas.getContext('2d');
    let W, H;

    function resize() {
      const rect = ctaCanvas.parentElement.getBoundingClientRect();
      W = ctaCanvas.width  = rect.width  || window.innerWidth;
      H = ctaCanvas.height = rect.height || 400;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    /* Mix of gold dots and small diamond shapes */
    const particles = Array.from({ length: 60 }, (_, i) => ({
      x:     Math.random() * (window.innerWidth  || 1200),
      y:     Math.random() * 400,
      r:     Math.random() * 2.2 + 0.4,
      dx:    (Math.random() - 0.5) * 0.35,
      dy:    (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.30 + 0.06,
      shape: i % 5 === 0 ? 'diamond' : 'circle',  // every 5th = diamond
      size:  Math.random() * 4 + 2,
      color: i % 3 === 0 ? '201,162,39' : '26,39,68'  // gold or navy
    }));

    function drawDiamond(cx, cy, half) {
      ctx.beginPath();
      ctx.moveTo(cx,        cy - half);
      ctx.lineTo(cx + half, cy);
      ctx.lineTo(cx,        cy + half);
      ctx.lineTo(cx - half, cy);
      ctx.closePath();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      particles.forEach(p => {
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = `rgba(${p.color},1)`;

        if (p.shape === 'diamond') {
          drawDiamond(p.x, p.y, p.size);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }

        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0)  p.x = W;
        if (p.x > W)  p.x = 0;
        if (p.y < 0)  p.y = H;
        if (p.y > H)  p.y = 0;
      });

      /* Soft connecting lines between nearby circles */
      ctx.globalAlpha = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          if (particles[i].shape !== 'circle' || particles[j].shape !== 'circle') continue;
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(26,39,68,${0.07 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ── 16b. Typing / word-cycle effect ── */
  const typedEl   = document.getElementById('ctaTyped');
  const cursorEl  = document.querySelector('.cta-v2-cursor');
  if (typedEl) {
    const words    = ['Project', 'Dream', 'Vision', 'Factory', 'Plant', 'Future'];
    let wordIdx    = 0;
    let charIdx    = 0;
    let deleting   = false;
    let pauseTick  = 0;

    function typeStep() {
      const current = words[wordIdx];

      if (!deleting && charIdx <= current.length) {
        typedEl.textContent = current.slice(0, charIdx);
        charIdx++;
        setTimeout(typeStep, charIdx > current.length ? 1600 : 95);  // pause when complete
      } else if (!deleting && charIdx > current.length) {
        deleting = true;
        setTimeout(typeStep, 50);
      } else if (deleting && charIdx >= 0) {
        typedEl.textContent = current.slice(0, charIdx);
        charIdx--;
        if (charIdx < 0) {
          deleting = false;
          wordIdx  = (wordIdx + 1) % words.length;
          charIdx  = 0;
          setTimeout(typeStep, 300);
        } else {
          setTimeout(typeStep, 55);
        }
      }
    }

    /* Start typing when CTA section enters viewport */
    const ctaBanner = document.querySelector('.cta-v2-banner');
    if (ctaBanner) {
      const typingObs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setTimeout(typeStep, 600);
          typingObs.disconnect();
        }
      }, { threshold: 0.3 });
      typingObs.observe(ctaBanner);
    } else {
      setTimeout(typeStep, 600);
    }
  }

  /* ── 16c. Button ripple on click ── */
  document.querySelectorAll('.cta-v2-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      /* Create ripple element */
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        transform: scale(0);
        background: rgba(255,255,255,0.25);
        pointer-events: none;
        animation: ctaRipple 0.55s ease-out forwards;
        z-index: 10;
      `;

      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      ripple.style.width  = size + 'px';
      ripple.style.height = size + 'px';
      ripple.style.left   = (e.clientX - rect.left  - size / 2) + 'px';
      ripple.style.top    = (e.clientY - rect.top   - size / 2) + 'px';

      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  /* Inject ripple keyframe once */
  if (!document.getElementById('ctaRippleStyle')) {
    const style = document.createElement('style');
    style.id = 'ctaRippleStyle';
    style.textContent = `
      @keyframes ctaRipple {
        to { transform: scale(1); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ── 16d. Stat-badge counter pop when section enters viewport ── */
  const ctaSection   = document.querySelector('.cta-v2-banner');
  let ctaStatsFired  = false;

  if (ctaSection) {
    const ctaStatsObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !ctaStatsFired) {
        ctaStatsFired = true;

        /* Stagger the stat badges popping in */
        document.querySelectorAll('.cta-v2-stat-badge').forEach((badge, i) => {
          badge.style.opacity   = '0';
          badge.style.transform = 'translateY(20px) scale(0.9)';
          badge.style.transition = `opacity 0.5s ease ${i * 0.15}s, transform 0.5s cubic-bezier(.22,.68,0,1.4) ${i * 0.15}s, box-shadow 0.3s ease`;
          /* Force reflow then animate in */
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              badge.style.opacity   = '1';
              badge.style.transform = '';
            });
          });
        });

        ctaStatsObs.disconnect();
      }
    }, { threshold: 0.25 });

    ctaStatsObs.observe(ctaSection);
  }

  /* ── 16e. Mouse-parallax on orbs ── */
  const orb1 = document.querySelector('.cta-v2-orb-1');
  const orb2 = document.querySelector('.cta-v2-orb-2');

  if (ctaSection && orb1 && orb2) {
    ctaSection.addEventListener('mousemove', (e) => {
      const rect = ctaSection.getBoundingClientRect();
      const cx   = rect.width  / 2;
      const cy   = rect.height / 2;
      const dx   = (e.clientX - rect.left  - cx) / cx;
      const dy   = (e.clientY - rect.top   - cy) / cy;

      orb1.style.transform = `translate(${dx * 28}px, ${dy * 18}px) scale(1)`;
      orb2.style.transform = `translate(${dx * -20}px, ${dy * -14}px) scale(1)`;
    });
    ctaSection.addEventListener('mouseleave', () => {
      orb1.style.transform = '';
      orb2.style.transform = '';
    });
  }

})();

/* =============================================
   18. GET A FREE QUOTE — POPUP MODAL
   ============================================= */
(function () {
  'use strict';

  const QUOTE_SERVICES = [
    'Chemical Equipment Manufacturing',
    'Pharmaceutical Equipment',
    'Custom Fabrication',
    'Pressure Vessels & Tanks',
    'Process Piping Systems',
    'Heat Exchangers',
    'Structural Steel Fabrication',
    'Annual Maintenance Contract',
    'Other'
  ];

  /* ---- Build the modal ---- */
  const modal = document.createElement('div');
  modal.className = 'quote-modal';
  modal.id = 'quoteModal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-hidden', 'true');

  modal.innerHTML = `
    <div class="quote-modal-overlay" data-quote-close></div>
    <div class="quote-modal-dialog">
      <button type="button" class="quote-modal-close" data-quote-close aria-label="Close Quote Form">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <div class="quote-modal-body" id="quoteModalBody">
        <div class="quote-modal-header">
          <div class="quote-modal-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </div>
          <h3>Get a Free Quote</h3>
          <p>Tell us about your project and our engineers will get back to you within 24 hours.</p>
        </div>
        <form id="quoteForm" novalidate>
          <div class="quote-form-row">
            <div class="quote-form-group">
              <label for="quoteName">Full Name <span class="quote-req">*</span></label>
              <input type="text" id="quoteName" name="name" placeholder="Your full name" required>
            </div>
            <div class="quote-form-group">
              <label for="quotePhone">Phone Number <span class="quote-req">*</span></label>
              <input type="tel" id="quotePhone" name="phone" placeholder="+91 00000 00000" required>
            </div>
          </div>
          <div class="quote-form-row">
            <div class="quote-form-group">
              <label for="quoteEmail">Email Address</label>
              <input type="email" id="quoteEmail" name="email" placeholder="your@email.com">
            </div>
            <div class="quote-form-group">
              <label for="quoteCompany">Company / Organization</label>
              <input type="text" id="quoteCompany" name="company" placeholder="Optional">
            </div>
          </div>
          <div class="quote-form-group">
            <label for="quoteService">Service Required <span class="quote-req">*</span></label>
            <select id="quoteService" name="service" required>
              <option value="">Select a service...</option>
            </select>
          </div>
          <div class="quote-form-group">
            <label for="quoteMessage">Project Details</label>
            <textarea id="quoteMessage" name="message" placeholder="Describe your project requirements..."></textarea>
          </div>
          <button type="submit" class="quote-submit-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            Request My Free Quote
          </button>
        </form>
        <div class="quote-modal-foot">
          <span>Prefer to talk?</span>
          <div class="quote-foot-links">
            <a href="tel:+917069685356"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>+91 70696 85356</a>
            <a href="mailto:atmiyaengineering26@gmail.com"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>atmiyaengineering26@gmail.com</a>
          </div>
        </div>
      </div>
    </div>`;

  document.body.appendChild(modal);

  const body      = modal.querySelector('.quote-modal-body');
  const formHTML  = body.innerHTML;
  let   formShown = true;

  /* Populate the service dropdown */
  function populateServices() {
    const sel = body.querySelector('#quoteService');
    if (!sel) return;
    while (sel.options.length > 1) sel.remove(sel.options.length - 1);
    QUOTE_SERVICES.forEach((service) => {
      const opt = document.createElement('option');
      opt.value = service;
      opt.textContent = service;
      sel.appendChild(opt);
    });
  }

  function resetForm() {
    body.innerHTML = formHTML;
    populateServices();
    formShown = true;
  }

  function showSuccess() {
    body.innerHTML = `
      <div class="quote-success">
        <div class="quote-success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <h3>Thank You!</h3>
        <p>Your quote request has been received. Our engineering team will contact you within 24 hours.</p>
        <button type="button" class="quote-submit-btn" data-quote-close>Done</button>
      </div>`;
    formShown = false;
  }

  function openQuote(triggerLink) {
    /* If the modal is showing the success view, restore the form */
    if (!formShown) resetForm();

    /* Pre-fill the service when clicking a link inside a service/product card */
    const card = triggerLink ? triggerLink.closest('.svc-card, .service-card, .wv2-card, .ind-card') : null;
    if (card) {
      const h3 = card.querySelector('h3');
      const sel = body.querySelector('#quoteService');
      if (h3 && sel) {
        const title = h3.textContent.trim().toLowerCase();
        for (const opt of sel.options) {
          if (opt.value.toLowerCase() === title) {
            sel.value = opt.value;
            break;
          }
        }
      }
    }

    /* Close the mobile nav menu if it is open */
    const hamburgerBtn = document.getElementById('hamburger');
    const navMenu      = document.getElementById('nav-menu');
    if (hamburgerBtn && hamburgerBtn.classList.contains('open')) {
      hamburgerBtn.classList.remove('open');
      if (navMenu) navMenu.classList.remove('active');
    }

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeQuote() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (!formShown) resetForm();
  }

  function isQuoteLink(link) {
    if (!link || link.tagName !== 'A') return false;
    const text = (link.textContent || '').trim().toLowerCase();
    return /quote|request|enquiry|discuss your project/.test(text);
  }

  /* ---- 18a. Intercept every "Get a Quote"-style link site-wide ---- */
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    if (isQuoteLink(link)) {
      e.preventDefault();
      e.stopPropagation();
      openQuote(link);
    }
  }, true);

  /* ---- 18b. Close via overlay / X button / Done button ---- */
  modal.addEventListener('click', (e) => {
    if (e.target.closest('[data-quote-close]')) closeQuote();
  });

  /* ---- 18c. Escape key closes the modal ---- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeQuote();
  });

  /* ---- 18d. Form submit + validation ---- */
  modal.addEventListener('submit', (e) => {
    const form = e.target.closest('#quoteForm');
    if (!form) return;
    e.preventDefault();

    const name    = body.querySelector('#quoteName');
    const phone   = body.querySelector('#quotePhone');
    const service = body.querySelector('#quoteService');

    let valid = true;
    [name, phone, service].forEach((field) => {
      if (!field) return;
      const value = (field.value || '').trim();
      if (!value) {
        field.classList.add('error-field');
        valid = false;
      }
    });

    if (!valid) return;
    showSuccess();
  });

  /* ---- 18e. Clear error styling as the user types ---- */
  modal.addEventListener('input', (e) => {
    const field = e.target;
    if (field.classList && field.classList.contains('error-field')) {
      field.classList.remove('error-field');
    }
  });

  /* Extra CSS rule for the select error state */
  const extraStyle = document.createElement('style');
  extraStyle.textContent = '.quote-form-group select.error-field{border-color:#e23c3c !important;box-shadow:0 0 0 4px rgba(226,60,60,.12) !important;}';
  document.head.appendChild(extraStyle);

  populateServices();
})();
