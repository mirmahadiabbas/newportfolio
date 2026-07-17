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

- `meeting-minutes/` - the AI Meeting Minutes service page (status:
  progress). Its "Try it" button is deliberately NOT connected. When public
  access is ready, replace the button with a real link; there is an HTML
  comment marked `MIR / FUTURE CHAT` at the exact spot, and the delivery-time
  copy ("usually within a couple of hours") should change to "within a few
  minutes" only once the webhook version is live. Never add claims about
  transcript storage or deletion to this page unless the owner confirms the
  auto-delete step has shipped.
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
