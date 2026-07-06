/* ============================================================
   MAIN - behaviour. Runs after render.js has built the page.
   Nav, scroll effects, counters, gantt clicks, lightbox.
   You should not need to edit this file for content changes.
   ============================================================ */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  /* ---------- footer year ---------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- scroll progress bar ---------- */
  var progress = $('#progress');
  var ticking = false;
  function paintProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? window.scrollY / max : 0;
    progress.style.transform = 'scaleX(' + Math.min(1, Math.max(0, p)) + ')';
    ticking = false;
  }
  if (progress) {
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(paintProgress); }
    }, { passive: true });
    paintProgress();
  }

  /* ---------- nav: shadow on scroll ---------- */
  var nav = $('#nav');
  function onScroll() {
    if (window.scrollY > 10) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobile nav ---------- */
  var toggle = $('#navToggle');
  var links = $('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    $$('a', links).forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- nav: highlight the section in view ---------- */
  var navLinks = $$('.nav-links a[href^="#"]');
  var byId = {};
  navLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && byId[e.target.id]) {
          navLinks.forEach(function (a) { a.classList.remove('active'); });
          byId[e.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(byId).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) spy.observe(el);
    });
  }

  /* ---------- hero: rotating focus word ---------- */
  var rot = $('#rotWord');
  if (rot && !reduced && typeof SITE !== 'undefined' && SITE.hero.rotating.length > 1) {
    var words = SITE.hero.rotating;
    var wi = 0;
    setInterval(function () {
      rot.classList.add('out');
      setTimeout(function () {
        wi = (wi + 1) % words.length;
        rot.textContent = words[wi];
        rot.classList.remove('out');
      }, 400);
    }, 2600);
  }

  /* ---------- scroll reveal ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (Math.min(i % 4, 3) * 0.07) + 's';
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  // Safety net: reveal anything near or above the viewport, so fast
  // scrollers and odd browsers never land on a blank patch.
  function revealNearby() {
    reveals.forEach(function (el) {
      if (el.classList.contains('in')) return;
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight + 150) el.classList.add('in');
    });
  }
  window.addEventListener('load', function () { setTimeout(revealNearby, 500); });
  var sttimer;
  window.addEventListener('scroll', function () {
    clearTimeout(sttimer);
    sttimer = setTimeout(revealNearby, 120);
  }, { passive: true });

  /* ---------- animated counters ---------- */
  var counters = $$('.count');
  function runCounter(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    if (reduced) { el.textContent = target; return; }
    var t0 = null, dur = 1200;
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur);
      var eased = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(target * eased);
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = el.getAttribute('data-count'); });
  }

  /* ---------- gantt: draw bars, jump on click ---------- */
  var gantt = $('#gantt');
  if (gantt) {
    if ('IntersectionObserver' in window && !reduced) {
      var gio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { gantt.classList.add('in'); gio.unobserve(gantt); }
        });
      }, { threshold: 0.25 });
      gio.observe(gantt);
    } else {
      gantt.classList.add('in');
    }

    $$('.g-bar', gantt).forEach(function (bar) {
      bar.addEventListener('click', function () {
        var el = document.getElementById(bar.getAttribute('data-target'));
        if (!el) return;
        el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
        var card = el.querySelector('.tl-card') || el.querySelector('.edu-grid') || el;
        card.classList.remove('flash');
        void card.offsetWidth;   // restart the animation
        card.classList.add('flash');
        setTimeout(function () { card.classList.remove('flash'); }, 2400);
      });
    });
  }

  /* ---------- timeline spine draw ---------- */
  var tl = $('.timeline');
  if (tl) {
    if ('IntersectionObserver' in window && !reduced) {
      var tio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { tl.classList.add('in'); tio.unobserve(tl); }
        });
      }, { threshold: 0.05 });
      tio.observe(tl);
    } else {
      tl.classList.add('in');
    }
  }

  /* ---------- cursor spotlight on project cards ---------- */
  if (window.matchMedia('(pointer: fine)').matches) {
    $$('.spot').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- lightbox ---------- */
  var lb = $('#lightbox');
  var lbImg = $('#lbImage');
  var lbCap = $('#lbCaption');
  var lbClose = $('#lbClose');
  var lbPrev = $('#lbPrev');
  var lbNext = $('#lbNext');
  var lbDots = $('#lbDots');

  var gallery = [];
  var current = 0;
  var caption = '';
  var lastFocused = null;

  function renderDots() {
    lbDots.innerHTML = '';
    if (gallery.length < 2) return;
    gallery.forEach(function (_, i) {
      var d = document.createElement('span');
      if (i === current) d.classList.add('active');
      d.addEventListener('click', function () { show(i); });
      lbDots.appendChild(d);
    });
  }

  function show(i) {
    current = (i + gallery.length) % gallery.length;
    lbImg.src = gallery[current];
    lbImg.alt = caption + (gallery.length > 1 ? ' · image ' + (current + 1) + ' of ' + gallery.length : '');
    lbCap.textContent = caption;
    var multi = gallery.length > 1;
    lbPrev.classList.toggle('hidden', !multi);
    lbNext.classList.toggle('hidden', !multi);
    renderDots();
  }

  function openLightbox(images, title, trigger) {
    gallery = images.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    caption = title || '';
    if (!gallery.length) return;
    lastFocused = trigger || null;
    show(0);
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lbImg.src = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  if (lb) {
    $$('[data-images]').forEach(function (el) {
      el.addEventListener('click', function () {
        openLightbox(el.getAttribute('data-images'), el.getAttribute('data-title'), el);
      });
    });
    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', function () { show(current - 1); });
    lbNext.addEventListener('click', function () { show(current + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLightbox(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft' && gallery.length > 1) show(current - 1);
      else if (e.key === 'ArrowRight' && gallery.length > 1) show(current + 1);
    });
  }

  /* ---------- light deterrent against casual image saving ----------
     NOTE: this is not real protection. Anyone can screenshot or use
     dev tools. It only blocks the most casual right-click / drag. */
  document.addEventListener('contextmenu', function (e) {
    if (e.target && e.target.tagName === 'IMG') e.preventDefault();
  });
  document.addEventListener('dragstart', function (e) {
    if (e.target && e.target.tagName === 'IMG') e.preventDefault();
  });

})();
