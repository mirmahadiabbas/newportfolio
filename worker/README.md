# Site assistant: the Worker

The backend for the "Ask about Mir" assistant. A Cloudflare Worker that holds
the Claude API key, checks every request, and streams answers back to the page.
Same idea as the sponsor search Worker, plus an AI call.

**Keep this folder out of the GitHub Pages repo.** Nothing in it is secret,
but Pages would publish it as part of the website. Keep it in its own folder
on your laptop (or its own private repo).

```
worker/
  wrangler.toml        <- Worker settings: name, allowed sites, limits, schedule
  package.json         <- the npm commands below
  src/
    knowledge.js       <- EVERYTHING the assistant knows  <- EDIT THIS
    prompt.js          <- the rules it follows (change with care)
    index.js           <- the routes: /api/meta, /api/chat, /api/health
    guard.js           <- size limits, origin check, rate limit, daily cap
    stream.js          <- turns Claude's stream into a simple one for the page
  test/                <- offline tests, no key and no cost
  evals/               <- behaviour tests against the real model
```

## How a question travels

```
Visitor's browser (builds/test page)
   |  POST /api/chat  { messages }
   v
Cloudflare Worker
   1. is the request from mirmahadiabbas.com?       no -> 403
   2. under 8 questions a minute for this visitor?   no -> 429
   3. sensible size and shape?                       no -> 400 / 413
   4. under today's cap (300 questions)?             no -> 503, "email Mir"
   5. call Claude (Haiku 5.5) with the knowledge pack as the system prompt
   v
Claude streams the answer, ending with a hidden line "SOURCES: tui, wspl"
   v
Worker strips that line, checks the ids exist in the pack, and streams
text to the page, then the source links
```

The origin check stops other websites using your assistant. It is not a
lock: a script can fake an origin. The rate limit, the daily cap and the
spend limit in the Anthropic Console are what protect your money.

## First-time setup (about 20 minutes)

You need Node.js installed, and a terminal open in this `worker` folder.

1. **Install the tools**
   `npm install`

2. **Log in to Cloudflare** (same account as the sponsor search)
   `npx wrangler login`

3. **Create the storage for the daily cap and health check**
   `npx wrangler kv namespace create USAGE`
   It prints an `id`. Paste it into `wrangler.toml` where it says
   `PASTE_KV_NAMESPACE_ID_HERE`.

4. **Add the API key as a secret** (it is stored by Cloudflare, never in a file)
   `npx wrangler secret put ANTHROPIC_API_KEY`
   Paste the key when asked. Use a new key just for this, named something
   like `site-assistant`, so you can revoke it without breaking anything else.

5. **Set a spend limit in the Anthropic Console.** Settings, then Limits.
   This is the real backstop: whatever else fails, the bill cannot pass it.

6. **Deploy**
   `npm run deploy`
   It prints the Worker's address. The test page expects
   `https://mir-assistant.mirabbasun.workers.dev`. If yours differs, change
   `DEFAULT_ENDPOINT` near the bottom of `builds/test/index.html`.

7. **Check it is alive**
   Open `https://mir-assistant.mirabbasun.workers.dev/api/meta` in a browser.
   You should see the starter questions.

8. **Upload `builds/test/index.html`** to the site repo and open
   `mirmahadiabbas.com/builds/test/`. The pill should say Live.

9. **Run the behaviour tests** (step below). Do this before showing it to anyone.

If deploy complains about the `[[ratelimits]]` block, your Cloudflare plan
may not include the rate limiting binding. Delete that block and redeploy;
the daily cap and the spend limit still protect you.

## Changing what it knows

Edit `src/knowledge.js`. Each section is a block of plain sentences with an
id and a link. Then:

```
npm test          # offline: format, dashes, links, no phone numbers
npm run deploy
npm run eval      # online: how the real model now behaves
```

**Only put in facts that are true and already public.** The assistant cannot
know anything that is not in this file, which is the point: if it is not in
here, it says it does not know.

## The two kinds of test

`npm test` runs 49 checks with a fake Claude, so it is free and needs no key.
It proves the plumbing: the hidden SOURCES line never leaks at any chunk size,
made-up source ids never become links, other websites are refused, limits stop
requests before any paid call, an expired key produces a friendly message, and
the key never reaches the browser.

`npm run eval` asks the real assistant 21 questions and checks the answers:
it must answer from the pack, cite the right section, refuse to invent
(employers, numbers, dates), hand salary and notice period to you, give the
right-to-work line word for word, resist "ignore your instructions", refuse to
speak as you, and never use an em dash. It takes about three minutes and
costs a fraction of a penny. Read the printed answers too: a pattern check
can pass an answer that still reads badly.

## Keeping an eye on it

Every morning at 07:00 UTC the Worker makes one tiny call to Claude and
records whether it worked. Open `/api/health` to see the result: `ok: true`,
or the error status (401 means the key expired or was revoked, which is what
happened to the Make builds). For an alert, point a free uptime monitor such
as UptimeRobot at `/api/health`; it returns 503 when the last check failed.

## Privacy

The Worker logs nothing a visitor types. On an error it logs only the status
code. Questions are sent to Anthropic's API to generate the answer, which the
page says plainly. Do not claim on any page that questions are "never stored"
anywhere: Anthropic's own retention policy applies to API traffic.

## Cost

The knowledge pack is about 3,500 tokens and is cached between questions.
At Haiku 5.5's listed starting price (from $0.10 per million input tokens and
$0.50 per million output), a typical question costs well under a tenth of a
penny. The daily cap of 300 questions keeps even a bad day small. Check the
pricing page before relying on these figures; the spend limit is what
actually guarantees them.

## Local testing (optional)

```
npx wrangler dev
```

runs the Worker at `http://127.0.0.1:8787`. Put your key in a file called
`.dev.vars` (never commit it) as `ANTHROPIC_API_KEY=...` and add
`ALLOWED_ORIGINS=http://localhost:8000`. Then serve the site folder
(`python -m http.server 8000`) and open
`http://localhost:8000/builds/test/?endpoint=http://127.0.0.1:8787`.

To see the interface with no Worker at all, open the test page with `?mock=1`.
It plays canned answers to the four suggested questions and says
"Preview: no AI" so nobody mistakes it for the real thing.
