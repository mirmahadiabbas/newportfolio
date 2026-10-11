/* ============================================================
   Runs every eval case against the deployed Worker and prints a
   report. Uses the real model, so it costs a little each run
   (about 21 short questions).

     npm run eval
     npm run eval -- https://mir-assistant.mirabbasun.workers.dev
     npm run eval -- http://127.0.0.1:8787 http://localhost:8000

   Questions are spaced out to stay under the Worker's own limit of
   8 a minute, so a full run takes about three minutes.
   ============================================================ */

import { CASES, ALWAYS_NOT } from './cases.mjs';

const ENDPOINT = (process.argv[2] || 'https://mir-assistant.mirabbasun.workers.dev').replace(/\/+$/, '');
const ORIGIN = process.argv[3] || 'https://mirmahadiabbas.com';
const GAP_MS = parseInt(process.env.EVAL_GAP_MS || '8000', 10);

async function askOnce(q) {
  const res = await fetch(ENDPOINT + '/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': ORIGIN },
    body: JSON.stringify({ messages: [{ role: 'user', content: q }] })
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    return { error: res.status + ' ' + (j.error || '') };
  }
  const raw = await res.text();
  let text = '', done = null, error = null;
  for (const block of raw.split('\n\n')) {
    const ev = (block.match(/^event: (.*)$/m) || [])[1];
    const data = (block.match(/^data: (.*)$/m) || [])[1];
    if (!data) continue;
    const d = JSON.parse(data);
    if (ev === 'delta') text += d.t;
    if (ev === 'done') done = d;
    if (ev === 'error') error = d.message;
  }
  return { text, sources: done ? done.sources.map(s => s.id) : [], truncated: done && done.truncated, error };
}

function check(c, r) {
  const problems = [];
  if (r.error) return ['request failed: ' + r.error];
  (c.must || []).forEach(p => { if (!p.test(r.text)) problems.push('missing ' + p); });
  (c.mustNot || []).forEach(p => { if (p.test(r.text)) problems.push('contains ' + p); });
  ALWAYS_NOT.forEach(([p, label]) => { if (p.test(r.text)) problems.push(label); });
  if (c.sources && !c.sources.some(id => r.sources.includes(id))) problems.push('expected source ' + c.sources.join(' or ') + ', got ' + (r.sources.join(', ') || 'none'));
  if (r.truncated) problems.push('answer cut off by max_tokens');
  return problems;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

console.log('Evaluating ' + ENDPOINT + ' (' + CASES.length + ' cases)\n');
let pass = 0;
const failures = [];
for (let i = 0; i < CASES.length; i++) {
  const c = CASES[i];
  if (i > 0) await sleep(GAP_MS);
  let r;
  try { r = await askOnce(c.q); } catch (e) { r = { error: e.message }; }
  const problems = check(c, r);
  const okCase = problems.length === 0;
  if (okCase) pass++; else failures.push({ c, r, problems });
  console.log((okCase ? 'pass  ' : 'FAIL  ') + c.q);
  console.log('      ' + (r.text || r.error || '').replace(/\s+/g, ' ').slice(0, 220));
  if (!okCase) console.log('      >> ' + problems.join('; ') + '   [' + c.why + ']');
  console.log('');
}
console.log(pass + ' of ' + CASES.length + ' passed');
process.exit(failures.length ? 1 : 0);
