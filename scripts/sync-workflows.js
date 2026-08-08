#!/usr/bin/env node
// Pull the live workflows out of n8n and into n8n/workflows/, so the repo keeps
// telling the truth about what is actually running.
//
// This exists because of a real and repeated failure mode (CLAUDE.md, "Exports
// drift"): editing a workflow in the n8n UI silently changes the stored JSON -
// defaults get stripped, nodes move - so a committed export slowly stops matching
// the instance it came from. Re-export before committing, every time.
//
// Output is byte-stable: same key set and ordering as the existing exports, so a
// sync with no real change produces no diff, and any diff you see is a real one.
//
// Usage:
//   node scripts/sync-workflows.js            write n8n/workflows/, summarise changes
//   node scripts/sync-workflows.js --check    write nothing; exit 1 if exports are stale
//
// Reads N8N_API_URL and N8N_API_KEY from .env (see .env.example).

const fs = require('fs');
const path = require('path');

const PREFIX = 'VaibhavCapstone-';
const CHECK = process.argv.includes('--check');

const repoRoot = path.resolve(__dirname, '..');
const outDir = path.join(repoRoot, 'n8n', 'workflows');
const envPath = path.join(repoRoot, '.env');

function envVar(name) {
  if (process.env[name]) return process.env[name].trim();
  if (!fs.existsSync(envPath)) return null;
  const m = fs.readFileSync(envPath, 'utf8').match(new RegExp(`^${name}\\s*=\\s*(.*)$`, 'm'));
  return m ? m[1].trim() : null;
}

const API_URL = (envVar('N8N_API_URL') || '').replace(/\/+$/, '');
const API_KEY = envVar('N8N_API_KEY');
if (!API_URL || !API_KEY) {
  console.error('Need N8N_API_URL and N8N_API_KEY (in .env or the environment).');
  console.error('Get a key from n8n: Settings -> n8n API -> Create API key.');
  process.exit(1);
}

const api = async (p) => {
  const r = await fetch(API_URL + p, { headers: { 'X-N8N-API-KEY': API_KEY } });
  if (!r.ok) throw new Error(`${p} -> HTTP ${r.status} ${r.statusText}`);
  return r.json();
};

// n8n returns node keys in whatever order it happens to serialise them, and the
// committed exports carry three different orderings because they were written at
// different times. Without a canonical order every sync churns hundreds of lines
// of pure noise. Unknown keys sort alphabetically after the known ones, so a future
// n8n version adding a field degrades tidily instead of reordering everything.
const NODE_KEY_ORDER = [
  'id', 'name', 'type', 'typeVersion', 'position', 'parameters', 'credentials',
  'webhookId', 'notes', 'alwaysOutputData', 'continueOnFail', 'onError',
  'retryOnFail', 'maxTries', 'waitBetweenTries',
];

// Settings the API hands back but refuses on write. binaryMode is the known one -
// PUT rejects it as off-schema (CLAUDE.md, "n8n 2.x API"), so carrying it in an
// export would break the API deploy path for whoever imports it next.
const WRITE_REJECTED_SETTINGS = ['binaryMode'];

// The exports are a TEMPLATE other people import, and this repo is going public.
// A real operator address configured in the live instance must not ride along into
// it - scripts/retarget-host.js --reviewer is how an importer sets their own.
// Anything matching a real mailbox here gets put back to the neutral placeholder.
const PLACEHOLDER_EMAIL = 'reviewer@example.com';
const PERSONAL_EMAIL = /\b[A-Za-z0-9._%+-]+@(?!example\.(?:com|invalid)\b)(?!remote-a2a\.invalid\b)[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

// Scrub only where an operator address actually lives: the alert nodes' from/to.
// Doing it blindly across the whole tree would rewrite prompt text and tool
// descriptions that legitimately contain example addresses.
function scrubOperatorEmails(nodes, found) {
  for (const n of nodes) {
    const p = n.parameters;
    if (!p) continue;
    for (const field of ['fromEmail', 'toEmail']) {
      if (typeof p[field] === 'string' && PERSONAL_EMAIL.test(p[field])) {
        PERSONAL_EMAIL.lastIndex = 0;
        found.push(`${n.name}.${field}: ${p[field]} -> ${PLACEHOLDER_EMAIL}`);
        p[field] = PLACEHOLDER_EMAIL;
      }
      PERSONAL_EMAIL.lastIndex = 0;
    }
  }
}

function orderKeys(obj, preferred) {
  const out = {};
  for (const k of preferred) if (Object.prototype.hasOwnProperty.call(obj, k)) out[k] = obj[k];
  for (const k of Object.keys(obj).sort()) if (!(k in out)) out[k] = obj[k];
  return out;
}

// Keep only what defines the workflow. Everything else is per-instance bookkeeping
// (ids, timestamps, version hashes, activation state, execution counts) and would
// churn the diff on every sync while telling you nothing.
function normalise(wf) {
  const meta = { ...(wf.meta || {}) };
  delete meta.instanceId;              // identifies the author's n8n, not the workflow
  delete meta.templateCredsSetupCompleted;

  const settings = { ...(wf.settings || {}) };
  for (const k of WRITE_REJECTED_SETTINGS) delete settings[k];

  const nodes = (wf.nodes || []).map((n) => orderKeys(n, NODE_KEY_ORDER));
  scrubOperatorEmails(nodes, scrubbed);

  return { name: wf.name, nodes, connections: wf.connections, settings, meta };
}

const scrubbed = [];

const serialise = (wf) => JSON.stringify(normalise(wf), null, 2) + '\n';

(async () => {
  const list = await api('/api/v1/workflows?limit=250');
  const ours = (list.data || []).filter((w) => w.name && w.name.startsWith(PREFIX)).sort((a, b) => a.name.localeCompare(b.name));

  if (!ours.length) {
    console.error(`No workflows named ${PREFIX}* found at ${API_URL}.`);
    process.exit(1);
  }

  const changed = [], added = [], unchanged = [];
  for (const stub of ours) {
    const full = await api(`/api/v1/workflows/${stub.id}`);
    const text = serialise(full);
    const file = path.join(outDir, `${full.name}.json`);
    const existing = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;

    if (existing === null) { added.push(full.name); if (!CHECK) fs.writeFileSync(file, text); }
    else if (existing !== text) { changed.push(full.name); if (!CHECK) fs.writeFileSync(file, text); }
    else unchanged.push(full.name);
  }

  // An export with no live counterpart means a workflow was renamed or deleted in
  // n8n - worth surfacing, but never auto-deleted: that is the user's call.
  const liveNames = new Set(ours.map((w) => `${w.name}.json`));
  const orphans = fs.readdirSync(outDir)
    .filter((f) => f.startsWith(PREFIX) && f.endsWith('.json') && !liveNames.has(f));

  console.log(`${API_URL}  ->  ${path.relative(repoRoot, outDir)}`);
  console.log(`  ${ours.length} live workflows: ${unchanged.length} unchanged, ${changed.length} changed, ${added.length} new`);
  changed.forEach((n) => console.log(`    changed  ${n}`));
  added.forEach((n) => console.log(`    new      ${n}`));
  if (scrubbed.length) {
    console.log(`\n  scrubbed ${scrubbed.length} operator address(es) back to the placeholder:`);
    scrubbed.forEach((s) => console.log(`    ${s}`));
    console.log('    (the live instance keeps yours; importers set theirs with retarget-host.js --reviewer)');
  }
  orphans.forEach((f) => console.log(`    ORPHAN   ${f}  (no live workflow - renamed or deleted? not removed automatically)`));

  if (CHECK) {
    const stale = changed.length + added.length;
    if (stale) {
      console.error(`\nEXPORTS ARE STALE: ${stale} workflow(s) differ from the live instance.`);
      console.error('Run `node scripts/sync-workflows.js` and commit the result.');
      process.exit(1);
    }
    console.log('\nExports match the live instance.');
    return;
  }

  // Regenerate the reference so the docs can never describe a workflow that no longer
  // exists. The id->name map comes from the live instance: Execute Workflow nodes store
  // only ids, so without this the reference could not name what calls what.
  const ids = Object.fromEntries(ours.map((w) => [w.id, w.name.replace(PREFIX, '')]));
  try {
    require('child_process').execFileSync(
      process.execPath,
      [path.join(__dirname, 'gen-workflows-reference.js'), '--ids', JSON.stringify(ids)],
      { stdio: ['ignore', 'inherit', 'inherit'] }
    );
  } catch (e) {
    console.error('warning: could not regenerate docs/workflows-reference.md —', e.message);
  }

  if (changed.length + added.length) console.log('\nReview the diff, then commit.');
  else console.log('\nNothing to do - repo already matches the live instance.');
})().catch((e) => { console.error('sync failed:', e.message); process.exit(1); });
