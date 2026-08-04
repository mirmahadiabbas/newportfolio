# Builds - live experiments hub

This folder is a self-contained mini-site inside the main portfolio. It lives
at **mirmahadiabbas.com/builds/** and lists hands-on AI and automation projects
that visitors can actually try. It shares the main site's theme but depends on
nothing outside this folder, so the whole `builds/` folder can be zipped and
sent to any chat for editing.

**If you are an AI assistant reading this:** you have everything you need in
this folder. Follow the house rules at the bottom exactly.

```
builds/
  index.html            <- hub page shell (rarely touched)
  builds.css            <- the whole theme: hub, cards, and sub-page styles
  builds-data.js        <- the list of builds  <- EDIT THIS to add a card
  builds-render.js      <- draws the hub from the data (rarely touched)
  README.md             <- this file
  meeting-cost/
    index.html          <- one build = one folder with one index.html
```

## How to add a new build

1. **Create the page.** Copy the `meeting-cost/` folder, rename it to a short
   slug (lowercase, hyphens, no spaces: `invoice-parser`, not `Invoice Parser`).
   Rewrite the contents of its `index.html`. Everything specific to the demo
   (extra styles, all logic) stays inline in that one file; the shared theme
   comes from `../builds.css`.
2. **Add the card.** In `builds-data.js`, copy an item block and set `slug` to
   the folder name, plus `title`, `status` (`"live"`, `"progress"` or
   `"complete"`), `type` (`"browser"`, `"ai"` or `"research"`), `desc`, and
   `tags`. Research cards show "Read" instead of "Open".
3. Done. The hub lists cards in the order they appear in the data file.

To announce a build **before** it is ready, add the card with `slug: null`.
It renders as a non-clickable "Not live yet" card.

## Current builds

- `sponsor-search/` - UK Visa Sponsor Licence Search (status: live, type:
  `data`). Calls a Cloudflare Worker API at `sponsor-search.mirabbasun.workers.dev`
  with two endpoints: `/api/meta` (routes, snapshot date, entry count) and
  `/api/search?q=&route=&town=`. The Worker must keep sending CORS headers for
  mirmahadiabbas.com or the page goes quiet. The legal disclaimer near the top
  is published word for word and must not be reworded, shortened, or moved
  below the search box. Its snapshot date is a `<span id="ss_disc_date">` that
  the script updates from the API, so refreshing the register updates the page
  by itself: keep that wiring rather than hardcoding a new date. This build
  deliberately uses no AI; that is the point of it, so do not add any.
- `process-map/` - Process Description to Process Map (status: live). Posts
  to a synchronous Make webhook and renders the result on the page. Mermaid.js
  is loaded lazily by dynamic import inside the main script, so a CDN failure
  degrades to showing the diagram code instead of breaking the tool: keep that
  fallback. The four sample processes live in the `SAMPLES` object in the
  page script, one plain string each, and each sample card's one-line brief
  is in the HTML above the form. Keep the copy at "about 20 seconds" and keep
  the results labelled as candidates, not findings. The waiting panel's stage
  messages are on a timer, not live progress from the API: they describe the
  stages of the analysis, so do not reword them into claims about what the
  model is doing at that instant.
- `test/` - a private scratch page for the owner at `/builds/test/`. It is
  unlisted: no card in `builds-data.js`, nothing links to it, and it carries
  a noindex tag. Do not add it to the hub or link to it from any page. It is
  unlisted, not private, so nothing confidential belongs on it.
- `meeting-minutes/` - the AI Meeting Minutes service page (status: live).
  The form on the page posts JSON to a Make.com webhook (URL is in the page's
  script; Content-Type is text/plain deliberately, it avoids a CORS preflight
  that Make webhooks do not answer). Guardrails already built in: a honeypot
  field, a 500-character minimum, a 45,000-character cap with a live counter,
  and a sample meeting (title, attendees, transcript) that can fill the form
  in one click. Keep delivery-time copy at "within a few minutes". Never add
  claims about transcript storage or deletion anywhere on this page,
  including the consent checkbox, unless the owner confirms the auto-delete
  step has shipped. Keep the email reassurance exactly at this strength:
  used only to deliver the minutes, no lists, no follow-ups. Do not escalate
  it to "never stored".
- `thesis/` - the MSc thesis presentation page (status: complete). Diagrams
  are hand-built HTML/CSS, not images; edit labels as text.
- `meeting-cost/` - in-browser meeting cost calculator (status: live). Also
  the template to copy for new builds.

## The sub-page pattern

Look at `meeting-cost/index.html`; it is the template. Keep:
- the `<head>` block (fonts, `../builds.css`, favicon), with title in the form
  `Name · Builds · Mir Mahadi Abbas`
- the top bar (`.btop`) with the back link to `../`
- the `.bsheet` wrapper: an ivory sheet on the pine background, with the
  eyebrow (`Build NNN · In-browser` or `· AI-connected`), a serif `<h1>` with
  one `<em>` word, and a short `.blead`
- the footer
- demo-specific CSS in an inline `<style>`, demo logic in an inline `<script>`

Ready-made classes in `builds.css` for demo UIs: `.bfield` (label + input),
`.bhint`, `.bbtn--brass` / `.bbtn--ghost`, `.bresult` with `.bnum` + `.blabel`
(dark panel with a big brass number), `.bnote` (small note with a brass rule).

## AI-connected builds (important)

This is a static site. **Never put an API key in any file here**; anything in
this folder is public. AI builds must post to a backend the owner controls,
which in practice means a Make.com webhook. The pattern:

```html
<form id="f">
  <div class="bfield">
    <label for="text">Paste your text</label>
    <textarea id="text" rows="8" required></textarea>
  </div>
  <button class="bbtn bbtn--brass" type="submit">Run</button>
  <p id="msg" class="bhint" aria-live="polite"></p>
</form>
<script>
document.getElementById('f').addEventListener('submit', async function (e) {
  e.preventDefault();
  var msg = document.getElementById('msg');
  msg.textContent = 'Sending...';
  try {
    var res = await fetch('https://hook.eu2.make.com/YOUR-WEBHOOK-ID', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: document.getElementById('text').value })
    });
    msg.textContent = res.ok
      ? 'Received. The result lands in your inbox shortly.'
      : 'Something went wrong. Try again in a minute.';
  } catch (err) {
    msg.textContent = 'Could not reach the server. Try again.';
  }
});
</script>
```

Webhooks are rate-limited on the owner's Make plan, so AI demos should say
what happens next ("result arrives by email") rather than promise instant
output. Add a short privacy line whenever visitor input leaves the browser.

## House rules (do not break these)

- **British English. No em-dashes anywhere**, in copy, comments, or code
  strings. Use a colon, a comma, or a middot instead.
- **No fabricated numbers.** No invented stats, user counts, or performance
  claims in any build's copy.
- **Keep the theme.** Colours and fonts come from the tokens at the top of
  `builds.css`. Do not introduce new colours or fonts; deep pine, warm ivory
  and brass only. If the main site's `css/tokens.css` ever changes, mirror the
  values here.
- Plain, honest copy. No hype words ("revolutionary", "cutting-edge",
  "excited"), no exclamation marks.
- Keep each build to one folder with one `index.html` unless it genuinely
  needs more files.

## Publishing and testing

- Local preview: double-click any `index.html`; everything works from disk.
- Publish: upload the whole `builds` folder to the **root** of the GitHub
  repo (drag the folder in via Add file -> Upload files). The hub appears at
  `/builds/`, each project at `/builds/<slug>/`.
- Share links on LinkedIn in the form
  `https://mirmahadiabbas.com/builds/meeting-cost/`.
