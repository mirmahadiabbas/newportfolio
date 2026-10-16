/* ============================================================
   SITE ASSISTANT - one file, loaded by every page.

   What it does on each page:
     - If the page has <div id="assistant-mount"></div>, the
       assistant is drawn there, inline (home page, the build
       page). The corner button then scrolls to it.
     - Otherwise it adds an "Ask about Mir" button in the corner
       that opens the assistant in a side panel (full screen on
       a phone).

   The conversation is kept for the current browser tab only
   (sessionStorage), so it follows the visitor from page to page
   and is gone when the tab closes.

   Self-contained: carries its own styles, needs nothing else.
   If this file fails to load, every page works without it.

   Talks to the Cloudflare Worker; the page never sees the key.
   Testing switches (add to any page address):
     ?mock=1                      canned answers, no AI
     ?ma_endpoint=http://...      point at a local Worker
   ============================================================ */

(function () {
  'use strict';

  if (window.__mirAssistant) return;
  window.__mirAssistant = true;

  var DEFAULT_ENDPOINT = 'https://mir-assistant.mirabbasun.workers.dev';
  var EMAIL = 'mirabbasun@gmail.com';
  var MAX_CHARS = 1200;
  var STORE_KEY = 'mir-assistant-v1';
  var FALLBACK_STARTERS = [
    'What did Mir do at TUI Airlines?',
    'What has he built with AI?',
    'What kind of roles is he looking for?',
    'Tell me about his consulting experience'
  ];

  var qs = new URLSearchParams(location.search);
  var MOCK = qs.get('mock') === '1';
  var ENDPOINT = (qs.get('ma_endpoint') || DEFAULT_ENDPOINT).replace(/\/+$/, '');

  /* ---------- styles (prefixed .ma- so nothing leaks either way) ---------- */

  var CSS = [
    '.ma-panel, .ma-panel *, .ma-launch, .ma-launch * { box-sizing: border-box; }',
    '.ma-panel {',
    '  --ma-950: #0B1912; --ma-900: #10231A; --ma-800: #16301F; --ma-700: #23402C;',
    '  --ma-cream: #F2EEDF; --ma-c70: rgba(242,238,223,.72); --ma-c45: rgba(242,238,223,.45);',
    '  --ma-brass: #C2932F; --ma-brass-hi: #DBAE4A; --ma-leaf: #79B36A;',
    '  --ma-line: rgba(242,238,223,.13);',
    '  --ma-body: "Archivo", -apple-system, BlinkMacSystemFont, sans-serif;',
    '  --ma-display: "Instrument Serif", Georgia, serif;',
    '  --ma-mono: "JetBrains Mono", "SF Mono", Consolas, monospace;',
    '  background: var(--ma-950); color: var(--ma-cream);',
    '  font-family: var(--ma-body); font-size: 15px; line-height: 1.6; text-align: left;',
    '  display: flex; flex-direction: column; overflow: hidden;',
    '  -webkit-font-smoothing: antialiased;',
    '}',
    '.ma-panel--inline { border-radius: 14px; min-height: 500px; border: 1px solid var(--ma-700); box-shadow: 0 16px 44px rgba(8,16,11,.35); }',
    '.ma-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 15px 18px; border-bottom: 1px solid var(--ma-line); }',
    '.ma-title { font-family: var(--ma-display); font-weight: 400; font-size: 23px; line-height: 1.1; margin: 0 auto 0 0; color: var(--ma-cream); }',
    '.ma-title em { font-style: italic; color: var(--ma-brass-hi); }',
    '.ma-state { font-family: var(--ma-mono); font-size: 10px; letter-spacing: .14em; text-transform: uppercase; padding: 4px 10px; border-radius: 999px; display: inline-flex; align-items: center; gap: 7px; color: var(--ma-c45); border: 1px solid var(--ma-line); }',
    '.ma-state::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }',
    '.ma-state[data-s="live"] { color: var(--ma-leaf); border-color: rgba(121,179,106,.4); }',
    '.ma-state[data-s="mock"] { color: var(--ma-brass-hi); border-color: rgba(194,147,47,.5); }',
    '.ma-btn-quiet { font-family: var(--ma-mono); font-size: 10.5px; letter-spacing: .1em; text-transform: uppercase; color: var(--ma-c70); background: none; border: 1px solid transparent; border-radius: 8px; padding: 6px 9px; cursor: pointer; }',
    '.ma-btn-quiet:hover, .ma-btn-quiet:focus-visible { color: var(--ma-brass-hi); border-color: var(--ma-line); }',
    '.ma-btn-quiet[hidden] { display: none; }',
    '.ma-close { width: 36px; height: 36px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid var(--ma-line); color: var(--ma-cream); background: none; cursor: pointer; }',
    '.ma-close:hover, .ma-close:focus-visible { border-color: var(--ma-brass); color: var(--ma-brass-hi); }',
    '.ma-close svg { width: 16px; height: 16px; }',
    '.ma-log { flex: 1; overflow-y: auto; padding: 20px 18px 8px; overscroll-behavior: contain; }',
    '.ma-panel--inline .ma-log { max-height: 520px; }',
    '.ma-intro { color: var(--ma-c70); font-size: 14.5px; margin: 0 0 16px; max-width: 520px; }',
    '.ma-starters { display: flex; flex-wrap: wrap; gap: 8px; }',
    '.ma-chip { font-family: var(--ma-body); font-size: 13.5px; line-height: 1.4; text-align: left; color: var(--ma-cream); background: var(--ma-900); border: 1px solid var(--ma-line); border-radius: 999px; padding: 8px 14px; cursor: pointer; transition: border-color .2s, color .2s; }',
    '.ma-chip:hover, .ma-chip:focus-visible { border-color: var(--ma-brass); color: var(--ma-brass-hi); }',
    '.ma-q { margin: 18px 0 12px auto; max-width: 85%; width: fit-content; background: var(--ma-800); border: 1px solid rgba(194,147,47,.35); border-radius: 14px 14px 4px 14px; padding: 9px 14px; font-size: 14.5px; white-space: pre-wrap; overflow-wrap: anywhere; color: var(--ma-cream); }',
    '.ma-a { font-size: 15px; line-height: 1.65; color: var(--ma-cream); overflow-wrap: anywhere; }',
    '.ma-a p { margin: 0; }',
    '.ma-a p + p, .ma-a p + ul, .ma-a ul + p { margin-top: 10px; }',
    '.ma-a ul { list-style: none; padding: 0; margin: 0; }',
    '.ma-a li { position: relative; padding-left: 18px; margin: 4px 0; }',
    '.ma-a li::before { content: ""; position: absolute; left: 0; top: 11px; width: 7px; height: 1.5px; background: var(--ma-brass); }',
    '.ma-a strong { color: var(--ma-brass-hi); font-weight: 600; }',
    '.ma-src { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 11px; }',
    '.ma-src a { display: inline-flex; align-items: center; gap: 6px; font-family: var(--ma-mono); font-size: 10.5px; letter-spacing: .05em; color: var(--ma-brass-hi); border: 1px solid rgba(194,147,47,.4); border-radius: 999px; padding: 4px 11px; text-decoration: none; }',
    '.ma-src a:hover, .ma-src a:focus-visible { background: rgba(194,147,47,.12); }',
    '.ma-src svg { width: 11px; height: 11px; }',
    '.ma-note { font-family: var(--ma-mono); font-size: 11px; color: var(--ma-c45); margin: 8px 0 0; }',
    '.ma-err { margin-top: 6px; border: 1px solid rgba(194,147,47,.5); background: rgba(194,147,47,.08); color: var(--ma-brass-hi); border-radius: 9px; padding: 10px 13px; font-size: 13.5px; }',
    '.ma-err button { font: inherit; text-decoration: underline; margin-left: 6px; color: var(--ma-cream); background: none; border: 0; cursor: pointer; padding: 0; }',
    '.ma-dots { display: inline-flex; gap: 5px; padding: 8px 0; }',
    '.ma-dots i { width: 6px; height: 6px; border-radius: 50%; background: var(--ma-brass); opacity: .3; animation: ma-blink 1.2s infinite; }',
    '.ma-dots i:nth-child(2) { animation-delay: .2s; } .ma-dots i:nth-child(3) { animation-delay: .4s; }',
    '@keyframes ma-blink { 0%, 100% { opacity: .25; } 40% { opacity: 1; } }',
    '.ma-form { border-top: 1px solid var(--ma-line); padding: 12px 14px 12px; margin: 0; }',
    '.ma-row { display: flex; gap: 10px; align-items: flex-end; background: var(--ma-900); border: 1px solid var(--ma-line); border-radius: 9px; padding: 6px 6px 6px 13px; transition: border-color .2s, box-shadow .2s; }',
    '.ma-row:focus-within { border-color: var(--ma-brass); box-shadow: 0 0 0 3px rgba(194,147,47,.16); }',
    '.ma-input { flex: 1; min-width: 0; background: transparent; border: 0; outline: none; resize: none; color: var(--ma-cream); font-family: var(--ma-body); font-size: 16px; line-height: 1.5; padding: 7px 0; margin: 0; max-height: 140px; }',
    '.ma-input::placeholder { color: var(--ma-c45); }',
    '.ma-send { width: 40px; height: 40px; flex: none; border-radius: 8px; border: 0; background: var(--ma-brass); color: var(--ma-950); display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: background .2s, opacity .2s; }',
    '.ma-send:hover { background: var(--ma-brass-hi); }',
    '.ma-send:disabled { opacity: .4; cursor: not-allowed; }',
    '.ma-send[data-mode="stop"] { background: var(--ma-700); color: var(--ma-cream); }',
    '.ma-send svg { width: 18px; height: 18px; }',
    '.ma-meta { display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; margin-top: 8px; font-size: 11.5px; line-height: 1.5; color: var(--ma-c45); }',
    '.ma-meta a { color: var(--ma-c70); text-decoration: underline; text-underline-offset: 2px; }',
    '.ma-meta a:hover { color: var(--ma-brass-hi); }',
    '.ma-count[data-warn="1"] { color: var(--ma-brass-hi); }',
    '.ma-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }',

    /* corner button */
    '.ma-launch { position: fixed; right: 22px; bottom: 22px; z-index: 140; display: inline-flex; align-items: center; gap: 9px; font-family: "JetBrains Mono", "SF Mono", Consolas, monospace; font-size: 12.5px; font-weight: 500; letter-spacing: .04em; color: #0B1912; background: linear-gradient(160deg, #DBAE4A, #C2932F); border: 0; border-radius: 999px; padding: 13px 18px 13px 15px; box-shadow: 0 8px 24px rgba(8,16,11,.35); cursor: pointer; transition: transform .25s cubic-bezier(.22,.61,.36,1), opacity .25s, box-shadow .25s; }',
    '.ma-launch:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(8,16,11,.42); }',
    '.ma-launch:focus-visible { outline: 2px solid #F2EEDF; outline-offset: 3px; }',
    '.ma-launch svg { width: 18px; height: 18px; flex: none; }',
    '.ma-launch[data-hide="1"] { opacity: 0; transform: translateY(12px); pointer-events: none; }',

    /* side panel */
    '.ma-backdrop { position: fixed; inset: 0; z-index: 159; background: rgba(8,16,11,.55); opacity: 0; pointer-events: none; transition: opacity .3s; }',
    '.ma-backdrop.open { opacity: 1; pointer-events: auto; }',
    '.ma-panel--drawer { position: fixed; top: 0; right: 0; bottom: 0; z-index: 160; width: min(440px, 100vw); border-left: 1px solid var(--ma-700); box-shadow: -16px 0 44px rgba(8,16,11,.45); transform: translateX(104%); visibility: hidden; transition: transform .35s cubic-bezier(.22,.61,.36,1), visibility 0s linear .35s; }',
    '.ma-panel--drawer.open { transform: none; visibility: visible; transition: transform .35s cubic-bezier(.22,.61,.36,1), visibility 0s; }',

    '@media (max-width: 600px) {',
    '  .ma-launch { right: 14px; bottom: 14px; padding: 13px; }',
    '  .ma-launch span { display: none; }',
    '  .ma-panel--drawer { width: 100vw; border-left: 0; }',
    '  .ma-q { max-width: 92%; }',
    '  .ma-log { padding: 16px 14px 6px; }',
    '  .ma-head { padding: 12px 14px; }',
    '  .ma-title { font-size: 20px; }',
    '  .ma-head { flex-wrap: nowrap; gap: 6px; }',
    '  .ma-title, .ma-state { white-space: nowrap; }',
    '  .ma-wide { display: none; }',
    '  .ma-state { padding: 3px 8px; letter-spacing: .1em; }',
    '  .ma-close { width: 34px; height: 34px; flex: none; }',
    '  .ma-panel--inline { min-height: 460px; }',
    '}',
    '@media (prefers-reduced-motion: reduce) {',
    '  .ma-dots i { animation: none; opacity: .7; }',
    '  .ma-launch, .ma-panel--drawer, .ma-backdrop { transition: none; }',
    '}'
  ].join('\n');

  var ICON_OUT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 17L17 7M7 7h10v10"/></svg>';
  var ICON_SEND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var ICON_STOP = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="1.5"/></svg>';
  var ICON_CHAT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1-.9-3.8A8.4 8.4 0 0 1 12.5 3a8.5 8.5 0 0 1 8.5 8.5z"/></svg>';
  var ICON_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  /* ---------- small helpers ---------- */

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* The only formatting allowed: paragraphs, "- " bullets, **bold**.
     Everything is escaped first, so nothing the model writes can
     become markup or a link. */
  function render(text) {
    return esc(text).split(/\n{2,}/).map(function (block) {
      var out = [], list = [];
      block.split('\n').forEach(function (l) {
        if (/^\s*[-*] /.test(l)) { list.push('<li>' + l.replace(/^\s*[-*] /, '') + '</li>'); }
        else if (l.trim()) {
          if (list.length) { out.push('<ul>' + list.join('') + '</ul>'); list = []; }
          out.push('<p>' + l + '</p>');
        }
      });
      if (list.length) out.push('<ul>' + list.join('') + '</ul>');
      return out.join('');
    }).join('').replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  }

  function safeSourceUrl(u) {
    return /^(https:\/\/(www\.)?mirmahadiabbas\.com\/|https:\/\/(www\.)?linkedin\.com\/|mailto:)/.test(u || '');
  }

  /* ---------- the conversation, kept for this tab ---------- */

  var turns = [];   // [{ q, a, sources: [{label,url}], note }]

  function load() {
    try {
      var raw = sessionStorage.getItem(STORE_KEY);
      var d = raw ? JSON.parse(raw) : null;
      if (d && d.v === 1 && Array.isArray(d.turns)) {
        turns = d.turns.filter(function (t) { return t && typeof t.q === 'string' && typeof t.a === 'string'; }).slice(-12);
      }
    } catch (e) { turns = []; }
  }
  function save() {
    try { sessionStorage.setItem(STORE_KEY, JSON.stringify({ v: 1, turns: turns.slice(-12) })); } catch (e) { /* storage blocked: fine */ }
  }
  function clearStore() {
    try { sessionStorage.removeItem(STORE_KEY); } catch (e) { /* fine */ }
  }

  /* Keep within the Worker's limits: at most 5 earlier exchanges and
     about 12,000 characters, dropping the oldest first. */
  function messagesFor(q) {
    var past = [];
    turns.slice(-5).forEach(function (t) {
      past.push({ role: 'user', content: t.q.slice(0, MAX_CHARS) });
      past.push({ role: 'assistant', content: t.a.slice(0, 3800) });
    });
    function size(arr) { return arr.reduce(function (n, m) { return n + m.content.length; }, 0); }
    while (past.length && size(past) + q.length > 12000) past = past.slice(2);
    return past.concat([{ role: 'user', content: q }]);
  }

  /* ---------- build the panel ---------- */

  function buildPanel(kind) {
    var p = document.createElement(kind === 'drawer' ? 'aside' : 'section');
    p.className = 'ma-panel ma-panel--' + kind;
    p.setAttribute('aria-label', 'Ask about Mir');
    if (kind === 'drawer') {
      p.setAttribute('role', 'dialog');
      p.setAttribute('aria-modal', 'true');
      p.id = 'ma-drawer';
    }
    p.innerHTML =
      '<div class="ma-head">' +
        '<h2 class="ma-title">Ask about <em>Mir</em></h2>' +
        '<span class="ma-state" data-s="wait">Connecting</span>' +
        '<button class="ma-btn-quiet ma-new" type="button" aria-label="Start a new conversation" hidden>New<span class="ma-wide"> conversation</span></button>' +
        (kind === 'drawer' ? '<button class="ma-close" type="button" aria-label="Close the assistant">' + ICON_X + '</button>' : '') +
      '</div>' +
      '<div class="ma-log" aria-live="off">' +
        '<div class="ma-empty">' +
          '<p class="ma-intro">Ask about Mir\'s experience, education, projects or availability. Answers come only from his CV and this website, with a link to where each one comes from.</p>' +
          '<div class="ma-starters"></div>' +
        '</div>' +
      '</div>' +
      '<form class="ma-form" autocomplete="off">' +
        '<div class="ma-row">' +
          '<label class="ma-sr" for="ma-input-' + kind + '">Your question</label>' +
          '<textarea class="ma-input" id="ma-input-' + kind + '" rows="1" maxlength="' + MAX_CHARS + '" placeholder="Ask a question about Mir"></textarea>' +
          '<button class="ma-send" type="submit" aria-label="Send question" data-mode="send">' + ICON_SEND + '</button>' +
        '</div>' +
        '<div class="ma-meta">' +
          '<span>AI answers from Mir\'s CV and this site, and they can be wrong. Questions go to Anthropic\'s Claude API; this site keeps no record of them.</span>' +
          '<span><span class="ma-count"></span> <a class="ma-mail" href="mailto:' + EMAIL + '">Email Mir instead</a></span>' +
        '</div>' +
      '</form>' +
      '<div class="ma-sr ma-announce" aria-live="polite"></div>';
    return p;
  }

  /* ---------- the controller for one panel ---------- */

  function Assistant(panel) {
    var el = {
      state: panel.querySelector('.ma-state'),
      log: panel.querySelector('.ma-log'),
      empty: panel.querySelector('.ma-empty'),
      starters: panel.querySelector('.ma-starters'),
      form: panel.querySelector('.ma-form'),
      input: panel.querySelector('.ma-input'),
      send: panel.querySelector('.ma-send'),
      count: panel.querySelector('.ma-count'),
      mail: panel.querySelector('.ma-mail'),
      fresh: panel.querySelector('.ma-new'),
      announce: panel.querySelector('.ma-announce')
    };
    var busy = false;
    var controller = null;

    function setState(s, label) { el.state.setAttribute('data-s', s); el.state.textContent = label; }
    function scrollDown() { el.log.scrollTop = el.log.scrollHeight; }

    function setBusy(b) {
      busy = b;
      el.send.setAttribute('data-mode', b ? 'stop' : 'send');
      el.send.setAttribute('aria-label', b ? 'Stop the answer' : 'Send question');
      el.send.innerHTML = b ? ICON_STOP : ICON_SEND;
      el.log.setAttribute('aria-busy', b ? 'true' : 'false');
      updateSend();
    }
    function updateSend() {
      var n = el.input.value.length;
      el.send.disabled = !busy && el.input.value.trim().length === 0;
      el.count.textContent = n > MAX_CHARS * 0.75 ? n + ' / ' + MAX_CHARS : '';
      el.count.setAttribute('data-warn', n > MAX_CHARS * 0.9 ? '1' : '0');
    }
    function autosize() {
      el.input.style.height = 'auto';
      el.input.style.height = Math.min(el.input.scrollHeight, 140) + 'px';
    }
    function updateMail(lastQ) {
      var body = lastQ ? 'Hi Mir,\n\nI was asking your site assistant:\n"' + lastQ + '"\n\n' : 'Hi Mir,\n\n';
      el.mail.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Question from your website') + '&body=' + encodeURIComponent(body);
    }

    function showStarters(list) {
      el.starters.innerHTML = '';
      list.forEach(function (s) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'ma-chip';
        b.textContent = s;
        b.addEventListener('click', function () { ask(s); });
        el.starters.appendChild(b);
      });
    }

    function addSources(aEl, sources) {
      if (!sources || !sources.length) return;
      var src = document.createElement('div');
      src.className = 'ma-src';
      sources.forEach(function (s) {
        if (!safeSourceUrl(s.url)) return;
        var a = document.createElement('a');
        a.href = s.url;
        a.innerHTML = ICON_OUT + '<span></span>';
        a.lastChild.textContent = s.label;
        src.appendChild(a);
      });
      if (src.children.length) aEl.appendChild(src);
    }
    function addNote(aEl, text) {
      var n = document.createElement('p');
      n.className = 'ma-note';
      n.textContent = text;
      aEl.appendChild(n);
    }

    function drawTurn(t) {
      var qEl = document.createElement('div');
      qEl.className = 'ma-q';
      qEl.textContent = t.q;
      el.log.appendChild(qEl);
      var aEl = document.createElement('div');
      aEl.className = 'ma-a';
      aEl.innerHTML = render(t.a);
      addSources(aEl, t.sources);
      if (t.note) addNote(aEl, t.note);
      el.log.appendChild(aEl);
    }

    function restore() {
      if (!turns.length) return;
      el.empty.hidden = true;
      el.fresh.hidden = false;
      turns.forEach(drawTurn);
      updateMail(turns[turns.length - 1].q);
      scrollDown();
    }

    function reset() {
      if (busy && controller) controller.abort();
      turns = [];
      clearStore();
      Array.prototype.slice.call(el.log.children).forEach(function (c) { if (c !== el.empty) c.remove(); });
      el.empty.hidden = false;
      el.fresh.hidden = true;
      updateMail('');
      el.input.focus();
    }

    function ask(q) {
      q = String(q || '').trim();
      if (!q || busy) return;
      if (q.length > MAX_CHARS) q = q.slice(0, MAX_CHARS);

      el.empty.hidden = true;
      el.fresh.hidden = false;
      el.input.value = '';
      autosize();
      updateMail(q);

      var qEl = document.createElement('div');
      qEl.className = 'ma-q';
      qEl.textContent = q;
      el.log.appendChild(qEl);
      var aEl = document.createElement('div');
      aEl.className = 'ma-a';
      aEl.innerHTML = '<span class="ma-dots" aria-label="Writing an answer"><i></i><i></i><i></i></span>';
      el.log.appendChild(aEl);
      scrollDown();

      setBusy(true);
      var text = '';
      var source = MOCK ? mockStream(q) : liveStream(messagesFor(q));

      source.onDelta = function (t) {
        text += t;
        aEl.innerHTML = render(text);
        scrollDown();
      };
      source.onDone = function (info) {
        info = info || {};
        if (!text) aEl.innerHTML = info.stopped ? '' : render('No answer came back. Try rephrasing the question.');
        var sources = (info.sources || []).filter(function (s) { return safeSourceUrl(s.url); })
          .map(function (s) { return { label: s.label, url: s.url }; });
        addSources(aEl, sources);
        var note = info.truncated ? 'That answer was cut short. Ask a narrower question for the rest.' : (info.stopped ? 'Stopped.' : '');
        if (note) addNote(aEl, note);
        if (text) {
          turns.push({ q: q, a: text, sources: sources, note: note });
          save();
        }
        el.announce.textContent = text;
        setBusy(false);
        scrollDown();
        if (!isTouch()) el.input.focus();
      };
      source.onError = function (msg) {
        if (!text) aEl.innerHTML = '';
        var e = document.createElement('div');
        e.className = 'ma-err';
        e.textContent = msg + ' ';
        var retry = document.createElement('button');
        retry.type = 'button';
        retry.textContent = 'Try again';
        retry.addEventListener('click', function () { qEl.remove(); aEl.remove(); ask(q); });
        e.appendChild(retry);
        aEl.appendChild(e);
        el.announce.textContent = msg;
        setBusy(false);
        scrollDown();
      };
      source.start();
    }

    function liveStream(messages) {
      var s = {};
      s.start = function () {
        controller = new AbortController();
        fetch(ENDPOINT + '/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: messages }),
          signal: controller.signal
        }).then(function (res) {
          var ct = res.headers.get('content-type') || '';
          if (!res.ok || ct.indexOf('text/event-stream') === -1) {
            return res.json().catch(function () { return {}; }).then(function (j) {
              s.onError(j.error || 'The assistant is unavailable right now. You can email Mir instead.');
            });
          }
          return readSSE(res.body, s);
        }).catch(function (err) {
          if (err && err.name === 'AbortError') { s.onDone({ stopped: true }); return; }
          s.onError('Could not reach the assistant. Check your connection, or email Mir instead.');
        });
      };
      return s;
    }

    function readSSE(body, s) {
      var reader = body.getReader();
      var dec = new TextDecoder();
      var buf = '';
      var finished = false;
      function pump() {
        return reader.read().then(function (r) {
          if (r.done) { if (!finished) s.onError('The answer stopped early. Try again.'); return; }
          buf += dec.decode(r.value, { stream: true });
          var i;
          while ((i = buf.indexOf('\n\n')) !== -1) {
            var block = buf.slice(0, i);
            buf = buf.slice(i + 2);
            var ev = (block.match(/^event: (.*)$/m) || [])[1];
            var raw = (block.match(/^data: (.*)$/m) || [])[1];
            if (!raw) continue;
            var data;
            try { data = JSON.parse(raw); } catch (e) { continue; }
            if (ev === 'delta') s.onDelta(data.t || '');
            else if (ev === 'done') { finished = true; s.onDone(data); }
            else if (ev === 'error') { finished = true; s.onError(data.message || 'Something went wrong.'); }
          }
          return pump();
        });
      }
      return pump().catch(function (err) {
        if (err && err.name === 'AbortError') { if (!finished) s.onDone({ stopped: true }); return; }
        if (!finished) s.onError('The connection dropped. Try again.');
      });
    }

    function mockStream(q) {
      var s = {};
      var hit = MOCK_ANSWERS.filter(function (m) { return m.k.test(q); })[0];
      var reply = hit ? hit.t : 'Preview mode only answers the suggested questions. Remove ?mock=1 from the address to use the real assistant.';
      var cancelled = false;
      s.start = function () {
        controller = { abort: function () { cancelled = true; } };
        var words = reply.match(/\S+\s*/g) || [];
        var i = 0;
        setTimeout(function tick() {
          if (cancelled) { s.onDone({ stopped: true }); return; }
          if (i >= words.length) { s.onDone({ sources: hit ? hit.s : [] }); return; }
          s.onDelta(words[i++]);
          setTimeout(tick, 24);
        }, 400);
      };
      return s;
    }

    /* wiring */
    el.form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (busy) { if (controller) controller.abort(); return; }
      ask(el.input.value);
    });
    el.input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        if (!busy) ask(el.input.value);
      }
    });
    el.input.addEventListener('input', function () { autosize(); updateSend(); });
    el.fresh.addEventListener('click', reset);

    updateSend();
    updateMail('');
    showStarters(FALLBACK_STARTERS);
    restore();

    return {
      focus: function () { el.input.focus(); },
      setState: setState,
      showStarters: showStarters
    };
  }

  /* ---------- preview mode answers (true, from the knowledge pack) ---------- */

  var MOCK_ANSWERS = [
    { k: /tui/i, t: 'Mir was a Project Management Intern in the PMO at TUI Airlines from June to September 2025, on the Advance Crew Management System programme across five European airline entities.\n\n- Ran current-state analysis through interviews with subject matter experts\n- Built weighted RFI and RFP scorecards that fed the steering committee\'s vendor selection\n- Produced the programme\'s PID, RACI matrix and RAID log',
      s: [{ label: 'TUI Airlines', url: 'https://mirmahadiabbas.com/#xp-tui' }] },
    { k: /built|\bai\b|automation/i, t: 'He builds practical AI and automation tools, several of which you can try on his Builds page. Examples include a **process description to process map** tool, an **AI meeting minutes** service that emails a PDF, and a job discovery pipeline that scores listings with Claude.',
      s: [{ label: 'Builds page', url: 'https://mirmahadiabbas.com/builds/' }, { label: 'Automation projects', url: 'https://mirmahadiabbas.com/#projects' }] },
    { k: /role|looking|available/i, t: 'Mir is open to work and looking for consulting, PMO and business analyst roles in the UK. He also takes on freelance projects. The best way to reach him is email at ' + EMAIL + '.',
      s: [{ label: 'Contact and availability', url: 'https://mirmahadiabbas.com/#contact' }] },
    { k: /consult/i, t: 'At WSPL in Bengaluru, from November 2023 to September 2024, Mir was an Associate Consultant and supported the CEO directly. He delivered competitor benchmarking and pricing analysis for Topiq, a GenAI SaaS that secured a $1M seed round, and led a digital revamp for Truedigital that generated 30+ leads in its first month.',
      s: [{ label: 'WSPL', url: 'https://mirmahadiabbas.com/#xp-wspl' }] }
  ];

  function isTouch() { return window.matchMedia && window.matchMedia('(pointer: coarse)').matches; }

  /* ---------- start ---------- */

  function start() {
    var style = document.createElement('style');
    style.id = 'ma-styles';
    style.textContent = CSS;
    document.head.appendChild(style);

    load();

    var mount = document.getElementById('assistant-mount');
    var panel, api;

    if (mount) {
      panel = buildPanel('inline');
      mount.innerHTML = '';
      mount.appendChild(panel);
      api = Assistant(panel);
    } else {
      panel = buildPanel('drawer');
      var backdrop = document.createElement('div');
      backdrop.className = 'ma-backdrop';
      document.body.appendChild(backdrop);
      document.body.appendChild(panel);
      api = Assistant(panel);
    }

    /* corner button */
    var launch = document.createElement('button');
    launch.type = 'button';
    launch.className = 'ma-launch';
    launch.setAttribute('aria-label', 'Ask about Mir: open the site assistant');
    launch.innerHTML = ICON_CHAT + '<span>Ask about Mir</span>';
    document.body.appendChild(launch);

    if (mount) {
      // the assistant is already on this page: the button takes you to it,
      // and hides itself while the assistant is on screen
      launch.addEventListener('click', function () {
        mount.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(function () { api.focus(); }, 450);
      });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (e) { launch.setAttribute('data-hide', e.isIntersecting ? '1' : '0'); });
        }, { threshold: 0.15 }).observe(mount);
      }
    } else {
      var opener = null;
      var prevOverflow = '';
      var open = false;

      function openDrawer() {
        if (open) return;
        open = true;
        opener = document.activeElement;
        prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        backdrop.classList.add('open');
        panel.classList.add('open');
        launch.setAttribute('aria-expanded', 'true');
        launch.setAttribute('data-hide', '1');
        setTimeout(function () { api.focus(); }, 60);
      }
      function closeDrawer() {
        if (!open) return;
        open = false;
        document.body.style.overflow = prevOverflow;
        backdrop.classList.remove('open');
        panel.classList.remove('open');
        launch.setAttribute('aria-expanded', 'false');
        launch.setAttribute('data-hide', '0');
        if (opener && typeof opener.focus === 'function') opener.focus();
      }

      launch.setAttribute('aria-controls', 'ma-drawer');
      launch.setAttribute('aria-expanded', 'false');
      launch.addEventListener('click', openDrawer);
      backdrop.addEventListener('click', closeDrawer);
      panel.querySelector('.ma-close').addEventListener('click', closeDrawer);

      document.addEventListener('keydown', function (e) {
        if (!open) return;
        if (e.key === 'Escape') { e.stopPropagation(); closeDrawer(); return; }
        if (e.key === 'Tab') {
          // keep keyboard focus inside the panel while it is open
          var f = Array.prototype.filter.call(
            panel.querySelectorAll('button, a[href], textarea'),
            function (x) { return !x.disabled && !x.hidden && x.offsetParent !== null; });
          if (!f.length) return;
          var first = f[0], last = f[f.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      });
    }

    /* status and starter prompts */
    if (MOCK) {
      api.setState('mock', 'Preview: no AI');
    } else {
      fetch(ENDPOINT + '/api/meta').then(function (r) {
        if (!r.ok) throw new Error('meta ' + r.status);
        return r.json();
      }).then(function (m) {
        if (m.starters && m.starters.length) api.showStarters(m.starters);
        api.setState('live', 'Live');
      }).catch(function () {
        api.setState('off', 'Offline');
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
