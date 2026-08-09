#!/usr/bin/env node
// Buyer-agent demo: an external "procurement agent" transacting with a SalesGenie
// tenant over the A2A protocol (agent card discovery -> message/send -> tasks/get polling).
// Zero dependencies. See scripts/README.md for usage.

const fs = require('fs');
const path = require('path');

// ---- configuration (env first, .env fallback for the bearer token) ----------
const BASE = process.env.A2A_BASE_URL || 'http://localhost:5678/webhook';
const BUSINESS_ID = process.env.A2A_BUSINESS_ID || process.argv[2] || 'biz_oakember';
const ENQUIRY = process.env.A2A_ENQUIRY || process.argv[3] ||
  'Hello, this is the procurement agent for Northwind Labs. We need 25 ergonomic office chairs ' +
  'for our new Bengaluru office, budget around Rs. 3,00,000 total, needed within 4 weeks. ' +
  'What can you offer? Contact: procurement@northwindlabs.example';
const AGENT_NAME = process.env.A2A_AGENT_NAME || 'Northwind Procurement Agent (demo)';
const POLL_SECONDS = Number(process.env.A2A_POLL_SECONDS || 10);
const MAX_MINUTES = Number(process.env.A2A_MAX_MINUTES || 30);

// The A2A door checks the caller's token against the `a2a_bearer` row in
// vaibhavcapstone_platform_config — NOT against the MCP credential. On the author's rig
// both happen to hold the same string, which hid the difference; anyone setting up fresh
// invents two separate phrases and would get a bare "unauthorized" here. So prefer the
// correctly-named variable, keep the old one working, and say which row must match.
function bearerToken() {
  const names = ['A2A_BEARER_TOKEN', 'MCP_BEARER_TOKEN'];
  for (const name of names) {
    if (process.env[name]) return process.env[name];
  }
  const envFile = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envFile)) {
    for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
      for (const name of names) {
        const m = line.match(new RegExp(`^${name}=(.*)$`));
        if (m && m[1].trim()) return m[1].trim();
      }
    }
  }
  console.error('No A2A_BEARER_TOKEN (or MCP_BEARER_TOKEN) in the environment or ../.env.');
  console.error('It must equal the `a2a_bearer` row in vaibhavcapstone_platform_config:');
  console.error("  SELECT value FROM vaibhavcapstone_platform_config WHERE key = 'a2a_bearer';");
  process.exit(1);
}

const TOKEN = bearerToken();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const say = (s) => console.log(s);
const rule = () => say('-'.repeat(72));

async function rpc(method, params) {
  const res = await fetch(`${BASE}/a2a-rpc?business_id=${BUSINESS_ID}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }),
  });
  const body = await res.json();
  if (body.error) throw new Error(`JSON-RPC ${body.error.code}: ${body.error.message}`);
  return body.result;
}

(async () => {
  rule();
  say(`BUYER AGENT: "${AGENT_NAME}"`);
  say(`Target tenant: ${BUSINESS_ID}`);
  rule();

  // 1. Discovery: who am I talking to?
  say('\n[1/4] Fetching Agent Card (discovery — no auth needed, like a business card)...');
  const cardRes = await fetch(`${BASE}/a2a-agent-card?business_id=${BUSINESS_ID}`);
  if (!cardRes.ok) throw new Error(`agent card fetch failed: HTTP ${cardRes.status}`);
  const card = await cardRes.json();
  say(`      Agent:        ${card.name}`);
  say(`      Description:  ${card.description}`);
  say(`      Skills:       ${(card.skills || []).map((s) => s.id).join(', ')}`);
  say(`      Streaming:    ${card.capabilities?.streaming}  |  Push: ${card.capabilities?.pushNotifications} (polling it is)`);

  // 2. Send the enquiry as an A2A task.
  say('\n[2/4] Sending enquiry via message/send...');
  say(`      "${ENQUIRY.slice(0, 100)}..."`);
  const task = await rpc('message/send', {
    message: { role: 'user', parts: [{ kind: 'text', text: ENQUIRY }] },
    metadata: {
      agent_name: AGENT_NAME,
      contact_name: 'Northwind Labs Procurement',
      contact_email: 'procurement@northwindlabs.example',
    },
  });
  say(`      Task created: ${task.id}  (state: ${task.status?.state})`);

  // 3. Poll until terminal, narrating every transition.
  say(`\n[3/4] Polling tasks/get every ${POLL_SECONDS}s (the seller's internals are opaque to me — I only see task states)...`);
  const TERMINAL = new Set(['completed', 'canceled', 'rejected', 'failed']);
  let lastState = task.status?.state || 'submitted';
  let lastMsg = '';
  let current = task;
  const deadline = Date.now() + MAX_MINUTES * 60 * 1000;

  while (!TERMINAL.has(lastState)) {
    if (Date.now() > deadline) {
      say(`      Gave up after ${MAX_MINUTES} minutes (still '${lastState}').`);
      process.exit(2);
    }
    await sleep(POLL_SECONDS * 1000);
    current = await rpc('tasks/get', { id: task.id });
    const state = current.status?.state;
    const msg = current.status?.message?.parts?.map((p) => p.text).join(' ') || '';
    if (state !== lastState || msg !== lastMsg) {
      say(`      ${new Date().toLocaleTimeString()}  state: ${state}${msg ? `  |  "${msg}"` : ''}`);
      if (state === 'input-required') {
        say('      >>> THE HUMAN GATE, VISIBLE OVER THE PROTOCOL: a human reviewer at the');
        say('      >>> seller is checking the offer before release. I wait — no send without approval.');
      }
      lastState = state;
      lastMsg = msg;
    }
  }

  // 4. Show what we got.
  rule();
  say(`[4/4] Terminal state: ${lastState.toUpperCase()}`);
  if (lastState === 'completed') {
    for (const artifact of current.artifacts || []) {
      say(`\nArtifact: ${artifact.name}`);
      for (const part of artifact.parts || []) {
        if (part.kind === 'text') {
          rule();
          say(part.text);
        } else if (part.kind === 'data' && part.data?.recommended_products) {
          rule();
          say('Structured data part — recommended_products:');
          for (const p of part.data.recommended_products) {
            say(`  • ${p.sku}  ${p.name}  ${p.currency} ${p.price}`);
          }
        }
      }
    }
    rule();
    say('Done: a grounded, human-approved offer, obtained agent-to-agent. No emails exchanged.');
  } else {
    say(`Status message: ${lastMsg || '(none)'}`);
  }
})().catch((e) => {
  console.error(`\nBuyer agent aborted: ${e.message}`);
  process.exit(1);
});
