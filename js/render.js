/* ============================================================
   RENDER - builds the page out of the SITE object in data.js.
   You should not need to edit this file for content changes.
   Each section has its own small builder function below.
   ============================================================ */

(function () {
  'use strict';

  var app = document.getElementById('app');
  if (!app || typeof SITE === 'undefined') return;

  /* ---------- helpers ---------- */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // esc() but keeps <em>...</em> so titles can carry the italic accent
  function escEm(s) {
    return esc(s).replace(/&lt;em&gt;/g, '<em>').replace(/&lt;\/em&gt;/g, '</em>');
  }

  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M7 17L17 7M7 7h10v10"/></svg>';
  var CAMERA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>';

  var ICONS = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
    doc:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 4h12l4 4v12H4z"/><path d="M16 4v4h4"/><path d="M8 12h8M8 16h6"/></svg>',
    grid:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>',
    chat:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1-.9-3.8 8.38 8.38 0 0 1 8.5-8.5 8.5 8.5 0 0 1 8.5 8.5z"/></svg>'
  };

  function section(id, classes, inner) {
    return '<section class="section ' + classes + '"' + (id ? ' id="' + id + '"' : '') + '>' +
           '<div class="container">' + inner + '</div></section>';
  }

  function header(eyebrow, title, intro) {
    var h = '<p class="eyebrow reveal">' + esc(eyebrow) + '</p>';
    if (title) h += '<h2 class="section-title reveal">' + escEm(title) + '</h2>';
    if (intro) h += '<p class="section-intro reveal">' + esc(intro) + '</p>';
    return h;
  }

  /* ---------- date maths for the gantt ---------- */

  function toFrac(ym) {                       // "2025-06" -> 2025.416
    if (ym === 'now') return nowFrac();
    var p = ym.split('-');
    return parseInt(p[0], 10) + (parseInt(p[1], 10) - 1) / 12;
  }
  function nowFrac() {
    var d = new Date();
    return d.getFullYear() + d.getMonth() / 12 + d.getDate() / 365;
  }
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function human(ym) {                        // "2025-06" -> "Jun 2025"
    if (ym === 'now') return 'now';
    var p = ym.split('-');
    return MONTHS[parseInt(p[1], 10) - 1] + ' ' + p[0];
  }

  /* ---------- section builders ---------- */

  function renderHero() {
    var h = SITE.hero;
    var btns = h.buttons.map(function (b) {
      var cls = b.style === 'brass' ? 'btn--brass' : 'btn--ghost';
      var ext = b.external ? ' target="_blank" rel="noopener"' : '';
      return '<a href="' + esc(b.href) + '" class="btn ' + cls + '"' + ext + '>' + esc(b.label) +
             (b.external ? ARROW : '') + '</a>';
    }).join('');

    var strip = h.docStrip.map(function (c) {
      return '<div class="doc-cell"><span class="doc-k">' + esc(c.k) + '</span>' +
             '<span class="doc-v">' + esc(c.v) + '</span></div>';
    }).join('');

    return '<section class="hero" id="top">' +
      '<div class="container hero-grid">' +
        '<div class="hero-text">' +
          '<p class="hero-rotator reveal">Focus:&nbsp;<span class="rot-word" id="rotWord">' +
            esc(h.rotating[0]) + '</span><span class="caret" aria-hidden="true"></span></p>' +
          '<h1 class="hero-name reveal">' + escEm(h.name) + '</h1>' +
          '<p class="hero-tagline reveal">' + esc(h.tagline) + '</p>' +
          '<div class="hero-buttons reveal">' + btns + '</div>' +
          '<div class="doc-strip reveal">' + strip + '</div>' +
        '</div>' +
        '<div class="hero-photo-wrap reveal reveal--scale">' +
          '<div class="hero-marks" aria-hidden="true"><span></span><span></span><span></span><span></span></div>' +
          '<img src="' + esc(h.photo) + '" alt="Mir Mahadi Abbas" class="hero-photo" width="320" height="394">' +
        '</div>' +
      '</div></section>';
  }

  function renderStats() {
    var cells = SITE.stats.map(function (s) {
      return '<div class="stat reveal">' +
        '<div class="stat-num"><span class="pre">' + esc(s.prefix) + '</span>' +
        '<span class="count" data-count="' + s.value + '">0</span>' +
        '<span class="suf">' + esc(s.suffix) + '</span></div>' +
        '<p class="stat-label">' + esc(s.label) + '</p></div>';
    }).join('');
    return '<div class="stats" id="stats"><div class="container"><div class="stats-grid">' +
           cells + '</div></div></div>';
  }

  function renderAbout() {
    var a = SITE.about;
    var ps = a.paragraphs.map(function (p) {
      return '<p class="reveal">' + esc(p) + '</p>';
    }).join('');
    return section('about', 'section--ivory',
      header('About', a.title) + '<div class="about-grid">' + ps + '</div>');
  }

  function renderToolkit() {
    var items = SITE.toolkit.map(function (t) {
      return '<span class="marquee-item">' + esc(t) + '</span>';
    }).join('');
    // content twice for a seamless loop; the copy is hidden from screen
    // readers and from reduced-motion users, who see a static single list
    return '<div class="marquee" aria-label="Toolkit">' +
      '<div class="marquee-track">' +
        '<div class="marquee-half">' + items + '</div>' +
        '<div class="marquee-half" aria-hidden="true">' + items + '</div>' +
      '</div></div>';
  }

  function renderGantt(g) {
    var start = g.axisStart;
    var now = nowFrac();
    var end = Math.ceil(now + 0.2);
    var cols = end - start;

    var rows = g.rows.map(function (r, i) {
      var from = toFrac(r.from);
      var ongoing = r.to === 'now';
      var to = ongoing ? now : toFrac(r.to);
      var left = ((from - start) / cols * 100).toFixed(2);
      var width = ((to - from) / cols * 100).toFixed(2);
      var cls = 'g-bar g-bar--' + r.kind + (ongoing ? ' g-bar--ongoing' : '');
      var dates = human(r.from) + ' – ' + human(r.to);
      return '<div class="g-row">' +
        '<div class="g-label"><span class="g-org">' + esc(r.org) + '</span>' +
        '<span>' + esc(r.sub) + '</span><span class="g-dates">' + esc(dates) + '</span></div>' +
        '<div class="g-track"><button class="' + cls + '" data-target="' + esc(r.target) + '"' +
        ' style="left:' + left + '%;width:' + width + '%;transition-delay:' + (i * 0.09) + 's"' +
        ' aria-label="' + esc(r.org + ', ' + r.sub + ', ' + dates + '. Jump to details.') + '"></button></div>' +
        '</div>';
    }).join('');

    var ticks = '';
    for (var y = start; y <= end; y++) {
      var pos = ((y - start) / cols * 100).toFixed(2);
      var extra = (y === end) ? ';transform:translateX(-100%)' : '';
      ticks += '<span style="left:' + pos + '%' + extra + '">' + y + '</span>';
    }

    var nowLeft = ((now - start) / cols * 100).toFixed(2);

    return '<div class="gantt reveal" id="gantt">' +
      '<div class="gantt-head"><span class="gantt-title">Programme view · 2018 to date</span>' +
      '<div class="gantt-legend">' +
        '<span><i class="gl-swatch gl-swatch--work"></i>Role</span>' +
        '<span><i class="gl-swatch gl-swatch--study"></i>Study</span>' +
        '<span><i class="gl-swatch gl-swatch--now"></i>Today</span>' +
      '</div></div>' +
      '<div class="gantt-body" style="--cols:' + cols + '">' + rows +
        '<div class="g-now" style="left:' + nowLeft + '%"><span>NOW</span></div>' +
      '</div>' +
      '<div class="gantt-axis">' + ticks + '</div>' +
      '<p class="gantt-hint">' + esc(g.hint) + '</p>' +
      '</div>';
  }

  function renderExperience() {
    var x = SITE.experience;
    var cards = x.roles.map(function (r) {
      var inner;
      if (r.light) {
        inner = '<div class="tl-head"><h3 class="tl-org">' + esc(r.org) +
          (r.current ? ' <span class="tag-current">Current</span>' : '') + '</h3>' +
          '<span class="tl-date">' + esc(r.date) + '</span></div>' +
          '<p class="tl-role">' + esc(r.role) + '</p>';
      } else {
        inner = '<div class="tl-head"><h3 class="tl-org">' + esc(r.org) + '</h3>' +
          '<span class="tl-date">' + esc(r.date) + '</span></div>' +
          '<p class="tl-role">' + esc(r.role) + '</p>' +
          '<p class="tl-desc">' + esc(r.desc) + '</p>' +
          '<div class="tags">' + r.tags.map(function (t) {
            return '<span class="tag">' + esc(t) + '</span>';
          }).join('') + '</div>';
      }
      return '<div class="tl-item' + (r.light ? ' tl-item--light' : '') + ' reveal" id="' + esc(r.id) + '">' +
        '<span class="tl-node' + (r.light ? ' tl-node--hollow' : '') + '" aria-hidden="true"></span>' +
        '<div class="tl-card">' +
          '<div class="tl-logo"><img src="' + esc(r.logo) + '" alt="' + esc(r.org) + ' logo" loading="lazy"></div>' +
          '<div class="tl-content">' + inner + '</div>' +
        '</div></div>';
    }).join('');

    return section('experience', 'section--ivory2',
      header('Experience', x.title) +
      renderGantt(x.gantt) +
      '<div class="timeline">' + cards + '</div>');
  }

  function renderEducation() {
    var cards = SITE.education.map(function (e) {
      return '<div class="edu-card reveal">' +
        '<div class="edu-head">' +
          '<div class="edu-logo"><img src="' + esc(e.logo) + '" alt="' + esc(e.org) + ' logo" loading="lazy"></div>' +
          '<h3 class="edu-org">' + esc(e.org) + '</h3>' +
        '</div>' +
        '<p class="edu-degree">' + esc(e.degree) + '</p>' +
        '<p class="edu-desc">' + esc(e.desc) + '</p>' +
        (e.thesis ? '<p class="edu-thesis"><em>' + esc(e.thesis) + '</em></p>' : '') +
        '</div>';
    }).join('');
    return section('education', 'section--ivory',
      header('Education', null) + '<div class="edu-grid">' + cards + '</div>');
  }

  function renderProjects() {
    var p = SITE.projects;
    var cards = p.items.map(function (it) {
      var pipe = it.pipeline.map(function (n) {
        return '<span class="pipe-node">' + esc(n) + '</span>';
      }).join('<i class="pipe-link" aria-hidden="true"></i>');
      return '<div class="proj-card spot reveal">' +
        '<div class="proj-top">' +
          '<div class="proj-icon" aria-hidden="true">' + (ICONS[it.icon] || ICONS.doc) + '</div>' +
          '<h3 class="proj-title">' + esc(it.title) + '</h3>' +
        '</div>' +
        '<p class="proj-desc">' + esc(it.desc) + '</p>' +
        '<div class="pipe" aria-label="Pipeline: ' + esc(it.pipeline.join(' to ')) + '">' + pipe + '</div>' +
        '<div class="tags">' + it.tags.map(function (t) {
          return '<span class="tag tag--dark">' + esc(t) + '</span>';
        }).join('') + '</div>' +
        '</div>';
    }).join('');
    return section('projects', 'section--dark',
      header('Projects', p.title, p.intro) + '<div class="proj-grid">' + cards + '</div>');
  }

  function renderBeyond() {
    var b = SITE.beyond;
    var cards = b.items.map(function (c) {
      var imgs = c.images.join(',');
      return '<article class="comp-card reveal">' +
        '<button class="comp-media" data-images="' + esc(imgs) + '" data-title="' + esc(c.title) + '"' +
        ' aria-label="Enlarge photos from ' + esc(c.title) + '">' +
          '<img src="' + esc(c.images[0]) + '" alt="' + esc(c.title) + '" loading="lazy">' +
          '<span class="comp-count">' + CAMERA + ' ' + c.images.length + '</span>' +
        '</button>' +
        '<div class="comp-body">' +
          '<div class="comp-head"><h3 class="comp-title">' + esc(c.title) + '</h3>' +
          '<span class="badge' + (c.win ? ' badge--win' : '') + '">' + esc(c.badge) + '</span></div>' +
          '<p class="comp-desc">' + esc(c.desc) + '</p>' +
          '<a href="' + esc(c.link) + '" target="_blank" rel="noopener" class="arrow-link">View on LinkedIn ' + ARROW + '</a>' +
        '</div></article>';
    }).join('');
    return section('beyond', 'section--ivory',
      header('Beyond the CV', b.title, b.intro) + '<div class="comp-grid">' + cards + '</div>');
  }

  function renderCertificates() {
    var cards = SITE.certificates.map(function (c) {
      return '<button class="cert-card reveal" data-images="' + esc(c.image) + '"' +
        ' data-title="' + esc(c.name + ' · ' + c.issuer) + '">' +
        '<div class="cert-thumb"><img src="' + esc(c.image) + '" alt="' + esc(c.name) + ' certificate" loading="lazy"></div>' +
        '<div class="cert-meta"><span class="cert-name">' + esc(c.name) + '</span>' +
        '<span class="cert-issuer">' + esc(c.issuer) + '</span></div>' +
        '</button>';
    }).join('');
    return section('certificates', 'section--ivory2',
      header('Certificates', null) + '<div class="cert-grid">' + cards + '</div>');
  }

  function renderLinkedin() {
    var l = SITE.linkedin;
    var cards = l.posts.map(function (p) {
      return '<a href="' + esc(p.link) + '" target="_blank" rel="noopener" class="post-card reveal">' +
        '<div class="post-thumb"><img src="' + esc(p.image) + '" alt="' + esc(p.cap) + '" loading="lazy"></div>' +
        '<div class="post-body"><p class="post-text">' + esc(p.text) + '</p>' +
        '<span class="post-cap">' + esc(p.cap) + ' ' + ARROW + '</span></div></a>';
    }).join('');
    return section('linkedin', 'section--ivory',
      header('From my LinkedIn', null) +
      '<div class="post-grid">' + cards + '</div>' +
      '<p class="post-connect reveal"><a class="arrow-link" href="' + esc(l.profile) +
      '" target="_blank" rel="noopener">Connect with me on LinkedIn ' + ARROW + '</a></p>');
  }

  function renderContact() {
    var c = SITE.contact;
    return section('contact', 'section--dark contact',
      '<h2 class="section-title reveal">' + escEm(c.title) + '</h2>' +
      '<p class="contact-sub reveal">' + esc(c.sub) + '</p>' +
      '<div class="contact-buttons reveal">' +
        '<a href="mailto:' + esc(c.email) + '" class="btn btn--brass">' + esc(c.email) + '</a>' +
        '<a href="' + esc(c.linkedinUrl) + '" target="_blank" rel="noopener" class="btn btn--ghost">LinkedIn ' + ARROW + '</a>' +
      '</div>' +
      '<p class="contact-location reveal">' + esc(c.location) + '</p>');
  }

  /* ---------- assemble in the order given by SITE.sections ---------- */

  var BUILDERS = {
    hero: renderHero,
    stats: renderStats,
    about: renderAbout,
    toolkit: renderToolkit,
    experience: renderExperience,
    education: renderEducation,
    projects: renderProjects,
    beyond: renderBeyond,
    certificates: renderCertificates,
    linkedin: renderLinkedin,
    contact: renderContact
  };

  app.innerHTML = SITE.sections.map(function (name) {
    return BUILDERS[name] ? BUILDERS[name]() : '';
  }).join('');

})();
