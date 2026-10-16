# Portfolio v3 - how this site works

Your site is now split into small files with one job each. **Almost every future
edit happens in a single file: `js/data.js`.**

```
index.html        <- page shell (nav, lightbox, footer). Rarely touched.
favicon.svg       <- the little tab icon
css/
  tokens.css      <- ALL colours, fonts, spacing. Change the look here.
  base.css        <- typography, buttons, shared styles
  components.css  <- gantt chart, cards, nav, lightbox
  sections.css    <- hero, stats band, about, contact layout
js/
  data.js         <- ALL content: every word, link, image, date  <- EDIT THIS
  render.js       <- builds the page from data.js
  main.js         <- animations, gantt clicks, counters, lightbox
  assistant.js    <- the site assistant: the Ask section's chat and the
                     "Ask about Mir" corner button on every page. Self-
                     contained (carries its own styles). What it KNOWS
                     lives in the Worker, not here.
builds/           <- the /builds mini-site: live experiments visitors can try.
                     Self-contained, has its OWN README inside. To add a new
                     build, send just that folder to a chat.
images/           <- already in your repo, unchanged
headshot.jpg      <- already in your repo, unchanged
```

The mental model: `data.js` is the content, `render.js` turns it into HTML,
`main.js` makes it move. If you are changing words, links, images or dates,
you never leave `data.js`.

---

## Publishing to GitHub Pages

Your repo (`mirmahadiabbas/mirmahadiabbas.github.io`) already has the
`images/` folder and `headshot.jpg`. **Leave those alone.** You are only
replacing code.

1. Open https://github.com/mirmahadiabbas/mirmahadiabbas.github.io
2. Delete the old `style.css` and `script.js` from the repo root
   (open each file -> bin icon -> commit). They are no longer used.
3. Click **Add file -> Upload files**, then drag in from this folder:
   - `index.html` (say yes when it asks to replace)
   - `favicon.svg`
   - the whole `css` folder
   - the whole `js` folder

   GitHub keeps folder structure when you drag folders in. If folder-dragging
   does not work in your browser: **Add file -> Create new file**, type
   `css/tokens.css` as the name, paste that file's contents, commit, and repeat
   for the other five css/js files.
4. Commit with a message like "portfolio v3".
5. Wait 1 to 2 minutes, then hard-refresh https://mirmahadiabbas.github.io/
   (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac).

To preview locally first: just double-click `index.html`. Everything works
from a folder on your machine except the photos, which live in the repo, so
images will be blank locally unless you copy the `images/` folder and
`headshot.jpg` in next to `index.html`.

---

## Everyday edits (all in `js/data.js`)

**Change any wording** - find the text, edit it inside the quotes. Keep the
quotes and the trailing comma.

**Add a competition** - copy one whole `{ ... },` block inside
`beyond.items`, paste it below, change title, badge, desc, the two image
filenames, and the LinkedIn link. Add `win: true` for a first place (it turns
the badge brass). Drop the new photos into `images/` on GitHub.

**Add a project** - copy a block in `projects.items`. `pipeline` is the list
of steps shown as the little node diagram; `icon` can be `search`, `doc`,
`grid` or `chat`.

**Add a certificate or LinkedIn post** - same pattern, in `certificates` or
`linkedin.posts`.

**Update the gantt chart** - each row in `experience.gantt.rows` has
`from` and `to` as `"YYYY-MM"`. Use `to: "now"` for an ongoing role (it gets
the pulsing green end). `target` is the id of the card it jumps to when
clicked. When you land a new role, add a row here AND a card in
`experience.roles` (give the card a new id like `"xp-newco"` and use the same
id as the row's `target`). The chart's end year and the NOW line move by
themselves as time passes.

**Edit the freelance services** - `services.items`, same copy-paste pattern.
`meta` is the small line under each card; `icon` can be `web`, `spark`,
`flow`, `bars`, `film` or `plus`. The button at the bottom of the section is
`services.cta`.

**Change the rotating words in the hero** - edit `hero.rotating`.

**Update the stats** - edit `stats`. `value` is the number it counts up to;
`prefix`/`suffix` are the symbols around it.

**Hide or reorder whole sections** - the `sections` list at the top of
`data.js` controls the page order. Delete a line (or put `//` in front of it)
to hide that section. Move a line to move the section. If you hide a section
that is in the nav, also remove its link near the top of `index.html`.

**Change the look** - `css/tokens.css`. The dark green is `--pine-950`, the
gold is `--brass`, the light background is `--ivory`. Fonts are listed there
too (they load from Google Fonts in `index.html`, so if you change a font
name, change it in both places).

After any edit, re-upload the changed file to GitHub and commit.

---

## The site assistant

`js/assistant.js` is loaded by this page and by every page in `builds/`.
On a page with `<div id="assistant-mount"></div>` (the home page's Ask
section, the Site Assistant build page) it draws the chat there. On every
other page it adds a corner button that opens the chat in a side panel.
The conversation follows the visitor between pages until they close the tab.

- To move the Ask section, move `"assistant"` in the `sections` list in
  `data.js`. Its wording is under `assistant:` in `data.js`.
- To change what the assistant knows, edit `worker/src/knowledge.js` in the
  Worker folder and redeploy it. Nothing on the website needs to change.
- To add it to a new page, put `<script src="js/assistant.js"></script>`
  before `</body>`, with the right number of `../` for the page's depth.
- If the button says Offline, check `/api/health` on the Worker. A 401 there
  means the API key expired.

## Troubleshooting

- **Whole page is blank** -> there is a typo in `js/data.js` (usually a
  missing quote or comma). Open the site, press F12 -> Console, and it will
  point at the line. Fix, re-upload.
- **An image is blank** -> the file is not in `images/`, or the capitalisation
  does not match. Filenames are case-sensitive on GitHub: `Levy-1.jpg` is not
  `levy-1.jpg`.
- **Headshot is blank** -> `headshot.jpg` must sit in the repo root with
  exactly that name.
- **Old design still showing** -> wait 2 minutes and hard-refresh; browsers
  cache aggressively. Also check the old `style.css` was deleted.
- **Site looks unstyled** -> the `css` folder did not upload, or it is not at
  the repo root (the path must be `css/tokens.css`, not `site/css/tokens.css`).
- **Focus line or skills strip not moving** -> they now animate for everyone,
  including machines with "reduce motion" switched on in the operating system
  (that setting is what froze them on desktop before). If they are still
  static, hard-refresh to clear the old CSS.

## A note on the images

The "do not save my images" deterrents (no right-click, no drag) are still in
the code, but no public website can truly stop image saving. Anyone can
screenshot or use browser tools. The certificate images are readable when
enlarged, so only keep showing them if you are comfortable with that.
