#!/usr/bin/env node
// Generate docs/workflows-reference.md from the exports in n8n/workflows/.
//
// Generated, not hand-written, because a hand-written reference to 14 workflows and
// ~40 endpoints drifts the moment anyone edits a node - and a setup doc that lies is
// worse than no setup doc. Run by scripts/sync-workflows.js after every sync, so the
// reference always describes the workflows the repo actually ships.
//
// The one thing not derivable from JSON is *why* each workflow exists, so those
// sentences live in PURPOSE below and are the only part meant to be edited by hand.

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const srcDir = path.join(repoRoot, 'n8n', 'workflows');
const outFile = path.join(repoRoot, 'docs', 'workflows-reference.md');

const PURPOSE = {
  '00-ErrorHandler': 'Catches failures from every other workflow, dead-letters the affected lead if one can be identified, records the error, and emails the operator. Nothing fails silently.',
  '01-Intake': 'The front door. Validates an incoming enquiry against the Envelope contract, refuses unknown businesses, creates the lead row, and hands off to classification.',
  '02-GmailAdapter': 'The email door. Polls a mailbox over IMAP for tagged enquiries and forwards each one to the intake webhook as a normal payload, so email is not a special case downstream.',
  '03-ClassifyExtract': 'Decides whether a message is a genuine enquiry, spam, or not an enquiry at all, and pulls out the facts (contact, budget, product interest, urgency). Retries once, then routes to a human rather than guessing.',
  '04-Qualifier': 'Scores the lead against the tenant\'s own rubric - deterministic arithmetic, not model opinion - and asks the model only to explain the score in words.',
  '05-Recommender': 'Asks the database first for real in-stock products matching the need, lets the model rank only that shortlist, then re-verifies every chosen SKU against live stock before saving. Parks the lead if the tenant has no catalogue yet.',
  '06-DraftHITL': 'Writes the customer reply in the tenant\'s voice and stops. The send step is reachable only after a human approves, by email or from chat.',
  '07-WeeklyInsights': 'The Monday report: funnel, lead quality, approval rate, top categories, and exact AI cost per lead from provider token counts. Also serves the latest report as a web page.',
  '08-MCPOnboarding': 'The setup half of the chat interface. Six tools that create a business, update its config, set a reviewer, upload a catalogue, report setup status, and reveal the intake endpoint. Wakes parked leads when setup completes.',
  '09-MCPOperations': 'The day-to-day half of the chat interface. Six tools to check a lead, list what is waiting for approval, approve or reject a draft, fetch insights, and send a test lead.',
  '10-ResumeParked': 'Un-parks leads that arrived before the tenant was ready, the moment the missing piece (catalogue or reviewer) is supplied, and pushes them back through the pipeline.',
  '11-NeedsReviewNotify': 'Sweeps for leads the system deliberately handed to a human and makes sure somebody is told, once, rather than leaving them sitting unnoticed.',
  '12-LLMJudge': 'A different vendor\'s model re-reads the pipeline\'s own output looking for invented facts, scores it, and alerts the operator when quality drops.',
  '13-A2AServer': 'The robot door. Publishes an agent card other companies\' AI can discover, accepts enquiries over JSON-RPC, and exposes the human approval gate honestly as the protocol state `input-required`.',
};

const short = (f) => f.replace('VaibhavCapstone-', '').replace('.json', '');

function triggersOf(wf) {
  const out = [];
  for (const n of wf.nodes) {
    const p = n.parameters || {};
    switch (n.type) {
      case 'n8n-nodes-base.webhook':
        out.push(`\`${(p.httpMethod || 'GET').toUpperCase()} /webhook/${p.path}\``);
        break;
      case '@n8n/n8n-nodes-langchain.mcpTrigger':
        out.push(`\`/mcp/${p.path}\` (MCP, bearer auth)`);
        break;
      case 'n8n-nodes-base.scheduleTrigger': {
        const r = ((p.rule || {}).interval || [])[0] || {};
        if (r.field === 'weeks') out.push(`schedule: weekly, day ${r.triggerAtDay}, ${String(r.triggerAtHour).padStart(2, '0')}:00`);
        else if (r.field === 'minutes') out.push(`schedule: every ${r.minutesInterval} minutes`);
        else out.push(`schedule: ${JSON.stringify(r)}`);
        break;
      }
      case 'n8n-nodes-base.executeWorkflowTrigger':
        out.push('called by another workflow (sub-workflow)');
        break;
      case 'n8n-nodes-base.emailReadImap':
        out.push(`IMAP poll of \`${p.mailbox || 'INBOX'}\``);
        break;
      case 'n8n-nodes-base.errorTrigger':
        out.push('fires when any workflow naming it as error handler fails');
        break;
    }
  }
  return out;
}

function credsOf(wf) {
  const s = new Set();
  for (const n of wf.nodes) for (const [type, c] of Object.entries(n.credentials || {})) s.add(`${c.name} (${type})`);
  return [...s].sort();
}

function tablesOf(wf) {
  const txt = JSON.stringify(wf);
  const reads = new Set(), writes = new Set();
  for (const m of txt.matchAll(/\b(?:FROM|JOIN)\s+(vaibhavcapstone_[a-z_]+)/gi)) reads.add(m[1]);
  for (const m of txt.matchAll(/\b(?:INSERT\s+INTO|UPDATE|DELETE\s+FROM|TRUNCATE)\s+(vaibhavcapstone_[a-z_]+)/gi)) writes.add(m[1]);
  return { reads: [...reads].sort(), writes: [...writes].sort() };
}

function calleesOf(wf) {
  const out = [];
  for (const n of wf.nodes) {
    if (n.type !== 'n8n-nodes-base.executeWorkflow') continue;
    const id = (n.parameters && n.parameters.workflowId && (n.parameters.workflowId.value || n.parameters.workflowId)) || '?';
    out.push({ node: n.name, id, cached: (n.parameters.workflowId && n.parameters.workflowId.cachedResultName) || null });
  }
  return out;
}

const files = fs.readdirSync(srcDir).filter((f) => f.endsWith('.json')).sort();
const wfs = files.map((f) => ({ file: f, key: short(f), wf: JSON.parse(fs.readFileSync(path.join(srcDir, f), 'utf8')) }));

// Execute Workflow nodes store only the target's internal id, so the exports alone
// cannot say which workflow an id belongs to. sync-workflows.js resolves the mapping
// from the live instance and passes it in with --ids. Run standalone (as someone who
// just cloned the repo would), we simply show the id — still accurate, and the id is
// exactly what they need when re-selecting the target after import.
const idToName = {};
const idsArg = process.argv.indexOf('--ids');
if (idsArg !== -1 && process.argv[idsArg + 1]) {
  try { Object.assign(idToName, JSON.parse(process.argv[idsArg + 1])); }
  catch (e) { console.error('--ids was not valid JSON, falling back to raw ids'); }
}

const L = [];
L.push('# Workflow reference — what each of the 14 workflows does');
L.push('');
L.push('**Generated from `n8n/workflows/*.json` by `scripts/gen-workflows-reference.js`.**');
L.push('Do not edit by hand — run `node scripts/sync-workflows.js`, which re-exports the live');
L.push('workflows and regenerates this file. Only the one-line purposes are hand-written.');
L.push('');
L.push('Paths below are shown relative to your n8n base URL. The exports ship with');
L.push('`http://localhost:5678`; `scripts/retarget-host.js` rewrites them for your host.');
L.push('');

L.push('## Every endpoint, in one place');
L.push('');
L.push('| Endpoint | Workflow | What it is for |');
L.push('|---|---|---|');
const ENDPOINT_NOTE = {
  'vaibhavcapstone-intake': 'The one door every enquiry enters by, whatever its origin',
  'vaibhavcapstone-insights-run': 'Generate this week\'s report now',
  'vaibhavcapstone-insights-latest': 'Serve the latest report as a web page',
  'vaibhavcapstone-needs-review-sweep': 'Notify reviewers of leads awaiting a human, now',
  'vaibhavcapstone-judge-sweep': 'Run the quality examiner now',
  'a2a-agent-card': 'Public discovery document for other companies\' AI',
  'a2a-rpc': 'JSON-RPC endpoint for agent-to-agent enquiries',
};
for (const { key, wf } of wfs) {
  for (const n of wf.nodes) {
    const p = n.parameters || {};
    if (n.type === 'n8n-nodes-base.webhook') {
      const note = ENDPOINT_NOTE[p.path] || (p.path.startsWith('vaibhavcapstone-tool-') ? 'Backing endpoint for the matching chat tool' : '');
      L.push(`| \`${(p.httpMethod || 'GET').toUpperCase()} /webhook/${p.path}\` | ${key} | ${note} |`);
    } else if (n.type === '@n8n/n8n-nodes-langchain.mcpTrigger') {
      L.push(`| \`/mcp/${p.path}\` | ${key} | MCP server — point your chat client here (bearer auth) |`);
    }
  }
}
L.push('');

L.push('## How they call each other');
L.push('');
L.push('```');
L.push('POST /webhook/vaibhavcapstone-intake');
L.push('        │');
L.push('        ▼');
L.push('  01-Intake ──▶ 03-ClassifyExtract ──▶ 04-Qualifier ──▶ 05-Recommender ──▶ 06-DraftHITL ──▶ 🧑 approve ──▶ send');
L.push('');
L.push('  02-GmailAdapter ─┐');
L.push('  09-MCPOperations ┼─ HTTP POST ──▶ /webhook/vaibhavcapstone-intake');
L.push('  13-A2AServer ────┘');
L.push('');
L.push('  08-MCPOnboarding ──▶ 10-ResumeParked ──▶ 05-Recommender ──▶ 06-DraftHITL');
L.push('');
L.push('  every workflow ──(on failure)──▶ 00-ErrorHandler');
L.push('```');
L.push('');
L.push('Handoffs use n8n **Execute Workflow** nodes, which reference the target by internal');
L.push('id. Those ids are per-instance, so after importing you must re-select the target in');
L.push('each one — `scripts/retarget-host.js` prints the exact list.');
L.push('');

L.push('## The workflows');
L.push('');
for (const { file, key, wf } of wfs) {
  const t = tablesOf(wf);
  const callees = calleesOf(wf);
  L.push(`### ${key}`);
  L.push('');
  L.push(PURPOSE[key] || '_(purpose not documented — add it to PURPOSE in scripts/gen-workflows-reference.js)_');
  L.push('');
  L.push(`- **Starts when:** ${triggersOf(wf).join(' · ') || '—'}`);
  L.push(`- **Credentials:** ${credsOf(wf).join(', ') || 'none'}`);
  if (t.writes.length) L.push(`- **Writes:** ${t.writes.map((x) => `\`${x}\``).join(', ')}`);
  if (t.reads.length) L.push(`- **Reads:** ${t.reads.map((x) => `\`${x}\``).join(', ')}`);
  if (callees.length) L.push(`- **Calls:** ${callees.map((c) => `${idToName[c.id] || c.id} (via "${c.node}")`).join(', ')}`);
  L.push(`- **Nodes:** ${wf.nodes.length}`);
  L.push(`- **Export:** \`n8n/workflows/${file}\``);
  L.push('');
}

L.push('## Credentials these workflows expect');
L.push('');
L.push('n8n matches credentials **by name** on import, so create them with exactly these names.');
L.push('');
L.push('| Name | Type | Needed by | Required? |');
L.push('|---|---|---|---|');
const credUse = {};
for (const { key, wf } of wfs) {
  for (const n of wf.nodes) {
    for (const [type, c] of Object.entries(n.credentials || {})) {
      const k = `${c.name}||${type}`;
      (credUse[k] = credUse[k] || new Set()).add(key.slice(0, 2));
    }
  }
}
const REQUIRED = {
  'Capstone-Postgres': 'Yes — nothing works without it',
  'Google Gemini(PaLM) Api account': 'Yes — the primary model',
  'OpenAI account': 'Optional — fallback model and the quality judge',
  'Capstone-SMTP': 'Yes — approval requests and alerts are email',
  'Capstone-IMA': 'Only for the email door (note the truncated name — it is real)',
  'Capstone-MCP-Bearer': 'Only if you use the chat (MCP) interface',
  'Capstone-Langfuse': 'Optional — LLM tracing; nodes fail harmlessly without it',
};
for (const [k, uses] of Object.entries(credUse).sort()) {
  const [name, type] = k.split('||');
  L.push(`| \`${name}\` | ${type} | ${[...uses].sort().join(', ')} | ${REQUIRED[name] || '—'} |`);
}
L.push('');

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, L.join('\n'));
console.log(`wrote ${path.relative(repoRoot, outFile)} (${wfs.length} workflows)`);
