#!/usr/bin/env node
// Rewrite the workflow exports for YOUR n8n instead of the author's laptop.
//
// The exports were built on a machine where n8n answered at http://localhost:5678.
// On hosted n8n that address means nothing, and the breakage is quiet: the MCP tool
// nodes still "work" in the sense that they run, they just call an address that
// isn't there. So this rewrites every host-dependent value in one pass.
//
// It walks the ENTIRE JSON tree, not just parameters.url, because five of the
// twenty occurrences are buried where a URL-field search never looks:
//   08-MCPOnboarding  - 2, inside Postgres SQL queries
//   09-MCPOperations  - 1, inside a Postgres SQL query
//   13-A2AServer      - 2, inside a Code node's jsCode
//
// Usage:
//   node scripts/retarget-host.js --base https://you.app.n8n.cloud
//   node scripts/retarget-host.js --base https://you.app.n8n.cloud \
//        --langfuse https://cloud.langfuse.com --reviewer you@yourbusiness.com
//   node scripts/retarget-host.js --base ... --out some/dir
//
// Reads  n8n/workflows/*.json   (never modified)
// Writes <out>/*.json           (default: n8n/workflows-retargeted/)

const fs = require('fs');
const path = require('path');

const OLD_HOST = 'http://localhost:5678';
const OLD_LANGFUSE = 'http://langfuse-web:3000';
const OLD_REVIEWER = 'reviewer@example.com';

const ERROR_WORKFLOW_ID = '7jyaQ5gz8eYDBFJI';

// The exports reference six workflows by internal id — the error handler, and the
// five handoff targets. Normally those ids do not exist on a new instance, so every
// Execute Workflow node and every error-workflow setting has to be re-selected by
// hand: fiddly, easy to skip, and it fails silently (the enquiry simply stops after
// the first step).
//
// n8n honours a top-level `id` on import, so stamping each of these six files with
// the id the others already point at makes every reference resolve on arrival.
// Verified on a clean instance 2026-08-09: imported with ids, published, and a lead
// ran the full pipeline to PENDING_APPROVAL with no manual re-pointing at all.
const STAMP_IDS = {
  'VaibhavCapstone-00-ErrorHandler.json': '7jyaQ5gz8eYDBFJI',
  'VaibhavCapstone-03-ClassifyExtract.json': 'BmN8SfRaPZQYYb9m',
  'VaibhavCapstone-04-Qualifier.json': 'cm1UubLPPirEAUyy',
  'VaibhavCapstone-05-Recommender.json': 'w5EsrbELebUE2ibV',
  'VaibhavCapstone-06-DraftHITL.json': '6SDxlPJ5fU1PSwLB',
  'VaibhavCapstone-10-ResumeParked.json': 'wrGgSDQrj6djOd8C',
};

function parseArgs(argv) {
  const a = {};
  for (let i = 2; i < argv.length; i += 2) {
    const k = argv[i];
    if (!k || !k.startsWith('--')) throw new Error(`unexpected argument: ${k}`);
    a[k.slice(2)] = argv[i + 1];
  }
  return a;
}

const args = parseArgs(process.argv);
if (!args.base) {
  console.error(`Rewrite the workflow exports for your own n8n host.

  --base      REQUIRED  your n8n base URL, e.g. https://you.app.n8n.cloud
  --langfuse  optional  Langfuse ingestion host, e.g. https://cloud.langfuse.com
  --reviewer  optional  replaces the reviewer@example.com alert defaults
  --out       optional  output directory (default n8n/workflows-retargeted)

Nothing under n8n/workflows/ is modified.`);
  process.exit(1);
}

const base = String(args.base).replace(/\/+$/, '');
if (!/^https?:\/\//.test(base)) {
  console.error(`--base must start with http:// or https:// (got "${args.base}")`);
  process.exit(1);
}

// --base must be reachable BY N8N ITSELF, not just by your browser. Twelve of the
// rewritten URLs are the MCP tool nodes, and n8n calls those from inside its own
// process: they are server-to-server, not browser-to-server.
//
// Verified 2026-08-09 on a container published as host port 5679: from inside the
// container http://localhost:5679 returned 404 while http://localhost:5678 (the port
// n8n actually listens on) returned 200. Retargeting to the host port there would
// have broken every chat tool, silently.
const m = base.match(/^https?:\/\/(localhost|127\.0\.0\.1)(?::(\d+))?/i);
if (m && m[2] && m[2] !== '5678') {
  console.warn(`WARNING  --base is ${base}, a localhost address on port ${m[2]}.`);
  console.warn('         If n8n runs in Docker published on that host port, it does NOT listen');
  console.warn('         on it internally - n8n listens on 5678 inside the container, so its own');
  console.warn('         tool calls to this address will 404 and the chat tools will fail quietly.');
  console.warn('         For a local container use --base http://localhost:5678 (the internal port).');
  console.warn('         For hosted n8n use your public URL, which is reachable either way.\n');
}
const langfuse = args.langfuse ? String(args.langfuse).replace(/\/+$/, '') : null;
const reviewer = args.reviewer || null;

const repoRoot = path.resolve(__dirname, '..');
const srcDir = path.join(repoRoot, 'n8n', 'workflows');
const outDir = args.out ? path.resolve(repoRoot, args.out) : path.join(repoRoot, 'n8n', 'workflows-retargeted');

// Replace on the raw JSON text so occurrences inside SQL strings and jsCode are
// caught too. Split/join rather than a regex: no escaping pitfalls, and the
// author's own CLAUDE.md warns that JS replace() expands $' and $& in the
// replacement, which would silently corrupt SQL containing those characters.
function replaceAll(text, needle, replacement) {
  const parts = text.split(needle);
  return { text: parts.join(replacement), count: parts.length - 1 };
}

fs.mkdirSync(outDir, { recursive: true });
const files = fs.readdirSync(srcDir).filter((f) => f.endsWith('.json')).sort();
if (!files.length) {
  console.error(`no .json files found in ${srcDir}`);
  process.exit(1);
}

let totalHost = 0, totalLf = 0, totalRev = 0;
const needsManual = { errorWorkflow: [], executeWorkflow: [] };
const perFile = [];

for (const file of files) {
  let text = fs.readFileSync(path.join(srcDir, file), 'utf8');

  const h = replaceAll(text, OLD_HOST, base); text = h.text;
  let lf = { count: 0 };
  if (langfuse) { lf = replaceAll(text, OLD_LANGFUSE, langfuse); text = lf.text; }
  let rv = { count: 0 };
  if (reviewer) { rv = replaceAll(text, OLD_REVIEWER, reviewer); text = rv.text; }

  totalHost += h.count; totalLf += lf.count; totalRev += rv.count;

  // Must still parse — a broken rewrite is worse than none.
  let wf;
  try { wf = JSON.parse(text); }
  catch (e) { console.error(`FAILED: ${file} no longer parses as JSON after rewrite: ${e.message}`); process.exit(1); }

  if (wf.settings && wf.settings.errorWorkflow === ERROR_WORKFLOW_ID) needsManual.errorWorkflow.push(file);
  for (const n of wf.nodes || []) {
    if (n.type === 'n8n-nodes-base.executeWorkflow') {
      const id = n.parameters && n.parameters.workflowId && (n.parameters.workflowId.value || n.parameters.workflowId);
      needsManual.executeWorkflow.push(`${file} → node "${n.name}" → workflow id ${id}`);
    }
  }

  // Stamp the referenced workflows with the ids the others point at, so the handoffs
  // and the error-workflow setting resolve the moment they are imported.
  if (STAMP_IDS[file]) wf.id = STAMP_IDS[file];

  fs.writeFileSync(path.join(outDir, file), JSON.stringify(wf, null, 2) + '\n');
  if (h.count || lf.count || rv.count) {
    perFile.push(`  ${file.padEnd(42)} host:${String(h.count).padStart(2)}  langfuse:${lf.count}  reviewer:${rv.count}`);
  }
}

console.log(`Rewrote ${files.length} workflows -> ${path.relative(repoRoot, outDir)}\n`);
console.log(`  ${OLD_HOST}  ->  ${base}                 ${totalHost} occurrences`);
console.log(`  ${OLD_LANGFUSE}  ->  ${langfuse || '(unchanged - pass --langfuse to rewrite)'}  ${totalLf} occurrences`);
console.log(`  ${OLD_REVIEWER}  ->  ${reviewer || '(unchanged - pass --reviewer to rewrite)'}  ${totalRev} occurrences`);
console.log('\nper file:'); perFile.forEach((l) => console.log(l));

if (!langfuse && totalLf === 0) {
  console.log(`\nNOTE  ${OLD_LANGFUSE} still appears in these exports. It is a Docker service`);
  console.log('      name that resolves only inside the author\'s compose network. The "Ship LF"');
  console.log('      nodes fail silently and harmlessly if left - tracing is simply off. Pass');
  console.log('      --langfuse https://cloud.langfuse.com to send traces to Langfuse Cloud.');
}

console.log(`\nStamped ${Object.keys(STAMP_IDS).length} workflows with the ids the others reference,`);
console.log('so the error-workflow setting and all 8 Execute Workflow handoffs resolve on import.');
console.log('No manual re-selection needed — verified end to end on a clean instance.');

console.log('\n--- IMPORT ---');
console.log('Import the files from the output directory, NOT n8n/workflows/.');
console.log('Order still matters, so sub-workflows exist before their callers:');
console.log('   00 -> 06 -> 05 -> 04 -> 03 -> 10 -> then 01, 02, 07, 08, 09, 11, 12, 13');
console.log('\nIf you import from the command line, RESTART n8n afterwards: CLI publishing sets');
console.log('active in the database but does not register the webhooks in the running process,');
console.log('so every endpoint 404s until it restarts. Importing through the UI is unaffected.');
console.log('\nAfterwards, confirm in n8n that each workflow\'s Settings -> Error Workflow shows');
console.log(`"VaibhavCapstone-00-ErrorHandler" (${needsManual.errorWorkflow.length} workflows reference it) and that the`);
console.log(`${needsManual.executeWorkflow.length} Execute Workflow nodes show a named target rather than an unresolved id.`);
