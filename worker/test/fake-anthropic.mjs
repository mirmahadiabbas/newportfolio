/* A stand-in for the Anthropic streaming API, so the Worker can be
   tested end to end without a key or any spend. It produces the
   same event shapes the real API documents, and can split the
   reply into awkward chunk boundaries on purpose. */

export function anthropicSSE(text, opts) {
  opts = opts || {};
  const chunks = opts.chunks || splitEvery(text, opts.size || 7);
  const ev = [];
  ev.push(['message_start', { type: 'message_start', message: { id: 'msg_test', type: 'message', role: 'assistant', content: [], model: 'claude-haiku-5-5', stop_reason: null, usage: { input_tokens: 10, output_tokens: 1 } } }]);
  ev.push(['content_block_start', { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } }]);
  ev.push(['ping', { type: 'ping' }]);
  chunks.forEach(function (c) {
    ev.push(['content_block_delta', { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: c } }]);
  });
  if (opts.midError) ev.push(['error', { type: 'error', error: { type: 'overloaded_error', message: 'Overloaded' } }]);
  ev.push(['content_block_stop', { type: 'content_block_stop', index: 0 }]);
  ev.push(['message_delta', { type: 'message_delta', delta: { stop_reason: opts.stop || 'end_turn', stop_sequence: null }, usage: { output_tokens: 20 } }]);
  ev.push(['message_stop', { type: 'message_stop' }]);
  const wire = ev.map(function (e) { return 'event: ' + e[0] + '\ndata: ' + JSON.stringify(e[1]) + '\n\n'; }).join('');
  return byteStream(wire, opts.wireSize || 13);
}

function splitEvery(s, n) {
  const out = [];
  for (let i = 0; i < s.length; i += n) out.push(s.slice(i, i + n));
  return out;
}

/* deliver the wire bytes in small arbitrary pieces, so SSE event
   boundaries land mid-chunk the way real networks deliver them */
export function byteStream(str, size) {
  const bytes = new TextEncoder().encode(str);
  let i = 0;
  return new ReadableStream({
    pull(controller) {
      if (i >= bytes.length) { controller.close(); return; }
      controller.enqueue(bytes.slice(i, i + size));
      i += size;
    }
  });
}

/* Read our Worker's simple SSE into { text, done, errors, deltas } */
export async function readWorkerStream(body) {
  const reader = body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  const out = { text: '', done: null, errors: [], deltas: [] };
  for (;;) {
    const r = await reader.read();
    if (r.done) break;
    buf += dec.decode(r.value, { stream: true });
    let i;
    while ((i = buf.indexOf('\n\n')) !== -1) {
      const block = buf.slice(0, i);
      buf = buf.slice(i + 2);
      const evName = (block.match(/^event: (.*)$/m) || [])[1];
      const data = JSON.parse((block.match(/^data: (.*)$/m) || [])[1]);
      if (evName === 'delta') { out.text += data.t; out.deltas.push(data.t); }
      if (evName === 'done') out.done = data;
      if (evName === 'error') out.errors.push(data.message);
    }
  }
  return out;
}
