/* ============================================================
   STREAM - reads Anthropic's server-sent events and re-emits a
   much simpler stream to the page:

     event: delta   data: {"t":"text to append"}
     event: done    data: {"sources":[{id,label,url}], "stop":"end_turn"}
     event: error   data: {"message":"..."}

   The model ends every reply with a line "SOURCES: a, b". That
   line must never reach the visitor, so text that could be the
   start of it is held back until it is clear either way. The ids
   are then checked against the pack, so a made-up id can never
   become a link.
   ============================================================ */

const MARKER = /(^|\n)[ \t]*SOURCES[ \t]*:/i;
const MARKER_WORD = 'sources:';

/* How much of the accumulated text is safe to show. Everything
   before the SOURCES line, and if the last line could still turn
   into a SOURCES line, everything before that line. */
export function safeLength(full) {
  const m = MARKER.exec(full);
  if (m) return m.index;
  const nl = full.lastIndexOf('\n');
  const last = full.slice(nl + 1).replace(/^[ \t]+/, '').toLowerCase();
  if (last.length > 0 && MARKER_WORD.startsWith(last)) return nl + 1;
  return full.length;
}

export function parseSources(full, pack) {
  const m = MARKER.exec(full);
  if (!m) return [];
  const line = full.slice(m.index + m[0].length).split('\n')[0];
  const byId = {};
  pack.sections.forEach(function (s) { byId[s.id] = s; });
  const seen = {};
  const out = [];
  line.split(',').forEach(function (raw) {
    const id = raw.trim().toLowerCase().replace(/[.\s]+$/, '');
    if (byId[id] && !seen[id] && out.length < 3) {
      seen[id] = true;
      out.push({ id: id, label: byId[id].label, url: byId[id].url });
    }
  });
  return out;
}

/* The visible answer with the SOURCES line removed and trailing
   whitespace trimmed. */
export function visibleText(full) {
  const m = MARKER.exec(full);
  return (m ? full.slice(0, m.index) : full).replace(/\s+$/, '');
}

function sse(event, obj) {
  return 'event: ' + event + '\ndata: ' + JSON.stringify(obj) + '\n\n';
}

/* upstream: a ReadableStream of Anthropic SSE bytes.
   Returns a ReadableStream of our simple SSE bytes. */
export function transformStream(upstream, pack) {
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  return new ReadableStream({
    async start(controller) {
      const reader = upstream.getReader();
      let buf = '';
      let full = '';
      let sent = 0;
      let stop = null;
      let failed = false;

      function flush() {
        // never emit beyond the visible text, and never emit whitespace
        // that may turn out to be trailing
        const target = full.slice(0, safeLength(full)).replace(/\s+$/, '').length;
        if (target > sent) {
          controller.enqueue(enc.encode(sse('delta', { t: full.slice(sent, target) })));
          sent = target;
        }
      }

      function handle(evt) {
        if (!evt || !evt.type) return;
        if (evt.type === 'content_block_delta' && evt.delta && evt.delta.type === 'text_delta') {
          full += evt.delta.text;
          flush();
        } else if (evt.type === 'message_delta' && evt.delta) {
          stop = evt.delta.stop_reason || stop;
        } else if (evt.type === 'error') {
          failed = true;
          controller.enqueue(enc.encode(sse('error', { message: 'The assistant was interrupted. Please try again.' })));
        }
        // ping, message_start, content_block_start/stop, message_stop,
        // thinking deltas and unknown event types are ignored
      }

      try {
        for (;;) {
          const r = await reader.read();
          if (r.done) break;
          buf += dec.decode(r.value, { stream: true });
          let i;
          while ((i = buf.indexOf('\n\n')) !== -1) {
            const block = buf.slice(0, i);
            buf = buf.slice(i + 2);
            const data = block.split('\n')
              .filter(function (l) { return l.indexOf('data:') === 0; })
              .map(function (l) { return l.slice(5).trim(); })
              .join('');
            if (!data) continue;
            try { handle(JSON.parse(data)); } catch (e) { /* malformed line: skip */ }
          }
        }
      } catch (e) {
        failed = true;
        controller.enqueue(enc.encode(sse('error', { message: 'The connection dropped. Please try again.' })));
      }

      if (!failed) {
        // final flush of anything held back that turned out not to be the marker
        const vis = visibleText(full);
        if (vis.length > sent) controller.enqueue(enc.encode(sse('delta', { t: vis.slice(sent) })));
        controller.enqueue(enc.encode(sse('done', {
          sources: parseSources(full, pack),
          stop: stop,
          truncated: stop === 'max_tokens'
        })));
      }
      controller.close();
    }
  });
}
