/* ============================================================
   MIR ASSISTANT - Cloudflare Worker

   GET  /api/meta     starter prompts, pack version, contact
   POST /api/chat     { messages: [{role, content}, ...] }
                      -> text/event-stream (see stream.js)
   GET  /api/health   result of the last scheduled API check

   The Anthropic key is a Worker secret (ANTHROPIC_API_KEY) and
   never leaves this file's runtime. Nothing a visitor types is
   logged or stored here.
   ============================================================ */

import { PACK } from './knowledge.js';
import { buildSystemPrompt } from './prompt.js';
import { transformStream } from './stream.js';
import { allowedOrigin, corsHeaders, validateChat, checkBurst, checkDaily, LIMITS } from './guard.js';

const SYSTEM = buildSystemPrompt(PACK);
const API = 'https://api.anthropic.com/v1/messages';

function anthropicBody(env, messages, maxTokens) {
  return {
    model: env.MODEL || 'claude-haiku-5-5',
    max_tokens: maxTokens,
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages: messages,
    // a lookup over a fixed text: no thinking needed, and it keeps answers fast
    thinking: { type: 'disabled' },
    output_config: { effort: 'low' }
  };
}

function callAnthropic(env, body) {
  // API_URL is only ever set for local testing against a fake server
  return fetch(env.API_URL || API, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(body)
  });
}

function json(obj, status, extra) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: Object.assign({ 'content-type': 'application/json; charset=utf-8' }, extra || {})
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = allowedOrigin(request.headers.get('Origin'), env);
    const cors = corsHeaders(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: origin ? 204 : 403, headers: cors });
    }

    /* ---------- meta ---------- */
    if (url.pathname === '/api/meta' && request.method === 'GET') {
      return json({
        version: PACK.version,
        starters: PACK.starters,
        contactEmail: PACK.contactEmail,
        limits: { userChars: LIMITS.userChars, turns: LIMITS.turns }
      }, 200, Object.assign({ 'cache-control': 'public, max-age=300' }, cors));
    }

    /* ---------- health ---------- */
    if (url.pathname === '/api/health' && request.method === 'GET') {
      let last = null;
      if (env.USAGE) {
        try { last = JSON.parse((await env.USAGE.get('health:last')) || 'null'); } catch (e) { last = null; }
      }
      const ok = !!(last && last.ok);
      return json({ ok: ok, keyConfigured: !!env.ANTHROPIC_API_KEY, lastCheck: last }, ok ? 200 : 503, cors);
    }

    /* ---------- chat ---------- */
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      // Browsers always send Origin on a cross-site POST. Refusing requests
      // without an allowed one stops other sites spending this budget.
      if (!origin) return json({ error: 'This assistant only answers on mirmahadiabbas.com.' }, 403, cors);

      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      if (!(await checkBurst(env, ip))) {
        return json({ error: 'That is a lot of questions in a short time. Wait a minute and try again.' }, 429, cors);
      }

      const len = parseInt(request.headers.get('content-length') || '0', 10);
      if (len > LIMITS.bodyBytes) return json({ error: 'That message is too long.' }, 413, cors);

      let raw;
      try { raw = await request.text(); } catch (e) { return json({ error: 'The request was not understood.' }, 400, cors); }
      if (raw.length > LIMITS.bodyBytes) return json({ error: 'That message is too long.' }, 413, cors);

      let body;
      try { body = JSON.parse(raw); } catch (e) { return json({ error: 'The request was not understood.' }, 400, cors); }

      const v = validateChat(body);
      if (!v.ok) return json({ error: v.message }, v.status, cors);

      if (!env.ANTHROPIC_API_KEY) {
        return json({ error: 'The assistant is not set up yet.' }, 503, cors);
      }
      if (!(await checkDaily(env, new Date()))) {
        return json({ error: 'The assistant has answered its limit of questions for today. Email ' + PACK.contactEmail + ' and Mir will reply himself.' }, 503, cors);
      }

      let upstream;
      try {
        upstream = await callAnthropic(env, Object.assign(anthropicBody(env, v.messages, parseInt(env.MAX_TOKENS || '700', 10)), { stream: true }));
      } catch (e) {
        return json({ error: 'The assistant could not be reached. Try again in a minute.' }, 502, cors);
      }

      if (!upstream.ok || !upstream.body) {
        // Status code only: never log visitor content.
        console.error('anthropic_status', upstream.status);
        const msg = upstream.status === 429 || upstream.status === 529
          ? 'The assistant is busy right now. Try again in a minute.'
          : 'The assistant is unavailable right now. Email ' + PACK.contactEmail + ' and Mir will reply himself.';
        return json({ error: msg }, 502, cors);
      }

      return new Response(transformStream(upstream.body, PACK), {
        status: 200,
        headers: Object.assign({
          'content-type': 'text/event-stream; charset=utf-8',
          'cache-control': 'no-store',
          'x-content-type-options': 'nosniff'
        }, cors)
      });
    }

    return json({ error: 'Not found' }, 404, cors);
  },

  /* Daily check that the key and credit still work, so a dead key
     shows up on /api/health instead of as a silent broken page. */
  async scheduled(event, env, ctx) {
    const result = { at: new Date().toISOString(), ok: false, status: null };
    try {
      const res = await callAnthropic(env, Object.assign(anthropicBody(env, [{ role: 'user', content: 'Reply with OK.' }], 5)));
      result.status = res.status;
      result.ok = res.ok;
    } catch (e) {
      result.status = 'network';
    }
    if (!result.ok) console.error('health_check_failed', result.status);
    if (env.USAGE) await env.USAGE.put('health:last', JSON.stringify(result));
  }
};
