/* ============================================================
   BUILDS RENDER - draws the hub page from builds-data.js.
   No content lives here; edit builds-data.js instead.
   ============================================================ */

(function () {
  'use strict';

  var mount = document.getElementById('bhub');
  if (!mount || typeof BUILDS === 'undefined') return;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function escEm(s) {
    return esc(s).replace(/&lt;em&gt;/g, '<em>').replace(/&lt;\/em&gt;/g, '</em>');
  }

  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M7 17L17 7M7 7h10v10"/></svg>';

  var STATUS = {
    live:     '<span class="bstatus bstatus--live"><span class="dot"></span>Live</span>',
    progress: '<span class="bstatus bstatus--progress">In progress</span>',
    complete: '<span class="bstatus bstatus--complete">Completed</span>'
  };
  var TYPE = {
    browser:  '<span class="btype">In-browser</span>',
    ai:       '<span class="btype">AI-connected</span>',
    research: '<span class="btype">Research</span>'
  };

  var cards = BUILDS.items.map(function (b, i) {
    var inner =
      '<div class="bcard-top">' + (STATUS[b.status] || '') + (TYPE[b.type] || '') + '</div>' +
      '<h2 class="bcard-title">' + esc(b.title) + '</h2>' +
      '<p class="bcard-desc">' + esc(b.desc) + '</p>' +
      '<div class="bcard-tags">' + b.tags.map(function (t) {
        return '<span>' + esc(t) + '</span>';
      }).join('') + '</div>';

    var delay = ' style="animation-delay:' + (i * 0.08) + 's"';

    if (b.slug) {
      var go = b.type === 'research' ? 'Read' : 'Open';
      return '<a class="bcard" href="' + esc(b.slug) + '/"' + delay + '>' + inner +
        '<span class="bcard-go">' + go + ' ' + ARROW + '</span></a>';
    }
    return '<div class="bcard bcard--soon"' + delay + '>' + inner +
      '<span class="bcard-go">Not live yet</span></div>';
  }).join('');

  mount.innerHTML =
    '<header class="bhead">' +
      '<p class="beyebrow">Builds</p>' +
      '<h1 class="btitle">' + escEm(BUILDS.title) + '</h1>' +
      '<p class="bintro">' + esc(BUILDS.intro) + '</p>' +
    '</header>' +
    '<div class="bgrid">' + cards + '</div>';

})();
