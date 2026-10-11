/* ============================================================
   GUARD - everything that stands between a public endpoint and
   your Anthropic bill. Cheap checks first, paid call last.
   ============================================================ */

export const LIMITS = {
  bodyBytes: 24000,        // whole request
  turns: 12,               // messages in the history sent per request
  userChars: 1200,         // one visitor message
  assistantChars: 4000,    // one earlier answer sent back as history
  totalChars: 16000        // whole history
};

export function allowedOrigin(origin, env) {
  if (!origin) return null;
  const list = String(env.ALLOWED_ORIGINS || '').split(',')
    .map(function (s) { return s.trim(); })
    .filter(Boolean);
  return list.indexOf(origin) !== -1 ? origin : null;
}

export function corsHeaders(origin) {
  const h = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
  if (origin) h['Access-Control-Allow-Origin'] = origin;
  return h;
}

/* Returns { ok: true, messages } or { ok: false, status, message } */
export function validateChat(body) {
  if (!body || typeof body !== 'object') return bad('The request was not understood.');
  const msgs = body.messages;
  if (!Array.isArray(msgs) || msgs.length === 0) return bad('No question was sent.');
  if (msgs.length > LIMITS.turns) return bad('This conversation is too long. Start a new one to keep going.');

  let total = 0;
  const clean = [];
  for (let i = 0; i < msgs.length; i++) {
    const m = msgs[i];
    const want = i % 2 === 0 ? 'user' : 'assistant';
    if (!m || m.role !== want || typeof m.content !== 'string') return bad('The conversation history was not in the expected order.');
    const text = m.content.trim();
    if (!text) return bad('Empty messages cannot be sent.');
    const cap = want === 'user' ? LIMITS.userChars : LIMITS.assistantChars;
    if (text.length > cap) {
      return bad(want === 'user'
        ? 'That question is too long. Keep it under ' + LIMITS.userChars + ' characters.'
        : 'The conversation history is too long. Start a new one to keep going.');
    }
    total += text.length;
    clean.push({ role: want, content: text });
  }
  if (clean[clean.length - 1].role !== 'user') return bad('The last message must be a question.');
  if (total > LIMITS.totalChars) return bad('This conversation is too long. Start a new one to keep going.');
  return { ok: true, messages: clean };
}

function bad(message) { return { ok: false, status: 400, message: message }; }

/* Per-visitor burst limit using the Workers rate limiting binding.
   Absent binding (local tests) means no limit. */
export async function checkBurst(env, key) {
  if (!env.BURST || typeof env.BURST.limit !== 'function') return true;
  try {
    const r = await env.BURST.limit({ key: key });
    return !!(r && r.success);
  } catch (e) {
    return true; // fail open on the burst limit; the daily cap still applies
  }
}

/* Global daily cap using KV. Approximate by design: KV is eventually
   consistent, so a burst can overshoot by a little. The hard ceiling
   is the monthly spend limit set in the Anthropic Console. */
export async function checkDaily(env, now) {
  if (!env.USAGE) return true;
  const cap = parseInt(env.DAILY_CAP || '300', 10);
  const key = 'day:' + now.toISOString().slice(0, 10);
  const used = parseInt((await env.USAGE.get(key)) || '0', 10);
  if (used >= cap) return false;
  await env.USAGE.put(key, String(used + 1), { expirationTtl: 60 * 60 * 48 });
  return true;
}
