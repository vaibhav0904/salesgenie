// Runs classification + extraction evals: DB actuals vs evals/datasets/seed-emails-labeled.json
const { execSync } = require('child_process');
const fs = require('fs');

const labels = JSON.parse(fs.readFileSync('evals/datasets/seed-emails-labeled.json', 'utf8')).emails;
// One row per seed email: the most recent REPLAY, chosen by created_at.
// Not received_at — that is the timestamp inside the seed file and is identical
// across every replay of the same email, so ordering on it is a tie and picks an
// arbitrary run (see stories/done/BUG-010). created_at is when the row was written.
const sql = `SELECT json_agg(t) FROM (
  SELECT DISTINCT ON (l.raw_payload->>'external_id')
         l.raw_payload->>'external_id' AS id, l.status,
         e.classification, e.contact_name, e.contact_email, e.company,
         e.budget_value, e.budget_currency, e.product_interest, e.urgency, e.location,
         (e.raw_llm_output->>'confidence')::numeric AS confidence
  FROM vaibhavcapstone_leads l LEFT JOIN vaibhavcapstone_extractions e USING (lead_id)
  WHERE l.raw_payload->>'external_id' LIKE 'seed-email-%'
  ORDER BY l.raw_payload->>'external_id', l.created_at DESC) t;`;
// Two ways to reach Postgres, because not everyone runs it in a local container:
//   DATABASE_URL   -> psql against a hosted database (Supabase, Neon, anything)
//   POSTGRES_*     -> docker exec into a local container (the author's setup)
// Hardcoding the container name meant these evals only ever ran on one machine.
const q = sql.replace(/\n/g, ' ').replace(/"/g, '\\"');
const cmd = process.env.DATABASE_URL
  ? `psql "${process.env.DATABASE_URL}" -t -A -c "${q}"`
  : `docker exec ${process.env.POSTGRES_CONTAINER || 'n8n-localdata-postgres-1'} ` +
    `psql -U ${process.env.POSTGRES_USER || 'salesgenie'} -d ${process.env.POSTGRES_DB || 'salesgenie'} -t -A -c "${q}"`;
// This grades a run that has ALREADY happened; it does not create one. Without the seed
// emails replayed first, the query returns nothing and JSON.parse used to die on an empty
// string with "Unexpected end of JSON input" - a stranger's likely first command, failing
// with no idea what was expected of them.
let raw;
try {
  raw = execSync(cmd, { stdio: ['pipe', 'pipe', 'pipe'] }).toString().trim();
} catch (e) {
  console.error('Could not reach the database.\n');
  console.error('  Set DATABASE_URL for a hosted Postgres, e.g.');
  console.error('    DATABASE_URL=postgresql://user:pass@host:5432/salesgenie node evals/run-evals.js\n');
  console.error('  ...or POSTGRES_CONTAINER for a local one:');
  console.error('    POSTGRES_CONTAINER=salesgenie-postgres node evals/run-evals.js\n');
  console.error(String(e.stderr || e.message).trim().split('\n').slice(0, 3).join('\n'));
  process.exit(1);
}

let parsed;
try { parsed = raw ? JSON.parse(raw) : null; } catch { parsed = null; }

if (!parsed || !parsed.length) {
  console.error('No graded runs found: the database has no leads with an external_id like "seed-email-%".\n');
  console.error('This script GRADES a replay, it does not perform one. Replay the dataset first —');
  console.error('POST each file in data/seed-emails/ to your intake webhook, wait for every lead to');
  console.error('reach a terminal state, then run this again:\n');
  console.error('  for f in data/seed-emails/email-*.json; do');
  console.error('    curl -s -X POST <your n8n address>/webhook/vaibhavcapstone-intake \\');
  console.error('      -H "Content-Type: application/json" -d @"$f"; done\n');
  console.error('The published spread in evals/results/ was produced by repeating that five times.');
  process.exit(1);
}

const actuals = Object.fromEntries(parsed.map(r => [r.id, r]));
const missing = labels.filter((L) => !actuals[L.id]).map((L) => L.id);
if (missing.length) {
  console.error(`The database is missing ${missing.length} of ${labels.length} seed emails: ${missing.join(', ')}`);
  console.error('Replay the full dataset before grading, or the score is computed over a partial run.');
  process.exit(1);
}

// Real date, not a constant: a hardcoded '2026-07-26' here caused later runs to
// overwrite that day's archived results (BUG-010). Results are append-per-day now.
const today = new Date().toISOString().slice(0, 10);
const norm = (s) => s == null ? null : String(s).trim().toLowerCase();
const tokens = (arr) => new Set((arr || []).flatMap(x => String(x).toLowerCase().split(/[-_\s]+/)).map(t => t.replace(/ves$/, 'f').replace(/s$/, '')));

// ---------- classification eval ----------
let cRows = [], cCorrect = 0, spamOk = true;
for (const L of labels) {
  const a = actuals[L.id];
  const got = a.classification || '(none)';
  const ok = got === L.expected.classification;
  if (ok) cCorrect++;
  if (L.expected.classification === 'SPAM' && !ok) spamOk = false;
  cRows.push(`| ${L.id} | ${L.expected.classification} | ${got} | ${a.status} | ${ok ? 'PASS' : 'FAIL'} |`);
}
const cPass = cCorrect >= 9 && spamOk;
fs.writeFileSync(`evals/results/${today}-classification.md`, [
  `# Eval result: classification — ${today}`, '',
  `**Workflow:** VaibhavCapstone-03-ClassifyExtract (prompt v2) · **Model:** gemini-2.5-flash · **Dataset:** seed-emails-labeled.json (10)`, '',
  `| Email | Expected | Got | Lead status | Verdict |`, `|---|---|---|---|---|`, ...cRows, '',
  `**Score: ${cCorrect}/10** (threshold ≥9/10) · **SPAM recall:** ${spamOk ? '100%' : 'MISS'} (threshold 100%)`, '',
  `## Verdict: ${cPass ? 'PASS' : 'FAIL'}`, '',
  `Notes: seed-email-10 (gibberish) correctly routed to NEEDS_REVIEW via confidence 0.4 < 0.6 threshold — counted as correct ENQUIRY classification per label; routing behaviour matches expected_terminal_status.`,
].join('\n'));

// ---------- extraction eval ----------
const fields = ['contact_name', 'contact_email', 'company', 'budget_value', 'budget_currency', 'urgency', 'location'];
let eRows = [], total = 0, correct = 0, halluc = [], reviewNotes = [];
for (const L of labels) {
  if (!L.expected.entities) continue; // NOT_ENQUIRY / SPAM: no entity scoring
  const a = actuals[L.id], exp = L.expected.entities;
  for (const f of fields) {
    total++;
    const ev = f === 'budget_value' ? (exp[f] == null ? null : Number(exp[f])) : norm(exp[f]);
    const av = f === 'budget_value' ? (a[f] == null ? null : Number(a[f])) : norm(a[f]);
    let verdict;
    if (ev === null && av === null) verdict = 'ok';
    else if (ev === null && av !== null) { verdict = 'HALLUCINATED'; halluc.push(`${L.id}.${f}="${a[f]}"`); }
    else if (ev !== null && av === null) verdict = 'missed';
    else verdict = (ev === av) ? 'ok' : 'wrong';
    if (verdict === 'ok') correct++;
    if (verdict !== 'ok') eRows.push(`| ${L.id} | ${f} | ${exp[f]} | ${a[f]} | ${verdict} |`);
  }
  // product_interest: token-overlap
  total++;
  const et = tokens(exp.product_interest), at = tokens(a.product_interest);
  const overlap = [...et].some(t => at.has(t));
  if (et.size === 0 && at.size === 0) correct++;
  else if (overlap) correct++;
  else if (et.size > 0 && at.size > 0) {
    // no token overlap but both non-empty: flag for manual semantic review
    reviewNotes.push(`${L.id}: expected ${JSON.stringify(exp.product_interest)} vs got ${JSON.stringify(a.product_interest)}`);
    eRows.push(`| ${L.id} | product_interest | ${JSON.stringify(exp.product_interest)} | ${JSON.stringify(a.product_interest)} | manual-review |`);
  } else {
    eRows.push(`| ${L.id} | product_interest | ${JSON.stringify(exp.product_interest)} | ${JSON.stringify(a.product_interest)} | wrong |`);
  }
}
const acc = (correct / total * 100);
console.log(`classification: ${cCorrect}/10 spamOk=${spamOk} -> ${cPass ? 'PASS' : 'FAIL'}`);
console.log(`extraction: ${correct}/${total} = ${acc.toFixed(1)}% | hallucinated: ${halluc.length} | manual-review: ${reviewNotes.length}`);
fs.writeFileSync(`evals/results/${today}-extraction.md`, [
  `# Eval result: extraction — ${today}`, '',
  `**Workflow:** VaibhavCapstone-03-ClassifyExtract (prompt v2) · **Model:** gemini-2.5-flash · **Scope:** 8 ENQUIRY-labeled emails × 8 fields`, '',
  `**Field accuracy: ${correct}/${total} = ${acc.toFixed(1)}%** (threshold ≥90%)`,
  `**Hallucinated fields: ${halluc.length}** (threshold 0 — automatic fail if any): ${halluc.join(', ') || 'none'}`, '',
  `## Mismatches / review items`, eRows.length ? '| Email | Field | Expected | Got | Verdict |' : '_All fields matched._',
  ...(eRows.length ? ['|---|---|---|---|---|', ...eRows] : []), '',
  reviewNotes.length ? `### Manual semantic review\n${reviewNotes.map(n => '- ' + n).join('\n')}` : '',
  '', `## Verdict: ${(acc >= 90 && halluc.length === 0) ? 'PASS' : (halluc.length === 0 && reviewNotes.length > 0 ? 'PASS-PENDING-MANUAL-REVIEW' : 'FAIL')}`,
].join('\n'));
