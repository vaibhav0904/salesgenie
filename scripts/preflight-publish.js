#!/usr/bin/env node
// Pre-publication scan: what would a stranger get if this repo went public right now?
//
// Four questions, because a secret can hide in four different places:
//   1. Is a real secret sitting in a tracked file?      (live-value scan against .env)
//   2. Does anything LOOK like a key?                   (pattern scan)
//   3. Is a file tracked that should never ship?        (.env, course PDFs, archives, video)
//   4. Was one of those EVER committed?                 (history scan — deleting it today
//                                                        does not remove it from history)
//
// Question 4 is the one people forget. `git rm` makes a file vanish from the working tree
// while leaving it perfectly readable in every clone of the history.
//
//   node scripts/preflight-publish.js          scan and report
//   node scripts/preflight-publish.js --quiet  findings only, no reassurance
//
// Exits 0 when clean, 1 when anything needs a decision. Nothing is modified.

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const quiet = process.argv.includes('--quiet');

function git(args) {
  return execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

// ---------------------------------------------------------------- what ships
const tracked = git(['ls-files', '-z']).split('\0').filter(Boolean);

// Files whose mere presence is the finding. The course PDFs are here because the brief
// is third-party material: the README says it is summarised, not redistributed, and
// .gitignore already excludes one of them by name — so shipping the other contradicts a
// stated position as well as being someone else's copyright.
const FORBIDDEN_FILES = [
  { test: (f) => /(^|\/)\.env$/.test(f) || /(^|\/)\.env\.[^/]*$/.test(f) && !/\.example$/.test(f),
    why: 'real environment file — this is where the secrets actually live' },
  { test: (f) => /\.pdf$/i.test(f),
    why: 'PDF: course material is third-party and the README says it is not redistributed' },
  { test: (f) => /\.(zip|tar|tgz|gz|7z|rar)$/i.test(f),
    why: 'archive — opaque to review, and nobody audits what is inside one' },
  { test: (f) => /\.(mp4|mov|avi|mkv)$/i.test(f),
    why: 'video: ship it as a release asset, not in the tree (and it may show private screens)' },
  { test: (f) => /\.(pem|key|p12|pfx|keystore)$/i.test(f),
    why: 'looks like a private key or certificate' },
  { test: (f) => /(^|\/)(id_rsa|id_ed25519|\.npmrc|\.pypirc|\.netrc)$/.test(f),
    why: 'credential file' },
];

// -------------------------------------------------------- what a secret looks like
const PATTERNS = [
  [/\bsk-(proj-)?[A-Za-z0-9_-]{20,}/g, 'OpenAI-style key'],
  [/\bAIza[0-9A-Za-z_-]{30,}/g, 'Google API key'],
  [/\b(pk|sk)-lf-[0-9a-f-]{20,}/g, 'Langfuse key'],
  [/\b(ghp|gho|ghs|ghu)_[A-Za-z0-9]{30,}/g, 'GitHub token'],
  [/\bgithub_pat_[A-Za-z0-9_]{50,}/g, 'GitHub fine-grained token'],
  [/\bxox[baprs]-[A-Za-z0-9-]{10,}/g, 'Slack token'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/g, 'private key block'],
  [/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, 'JWT'],
  [/\bAKIA[0-9A-Z]{16}\b/g, 'AWS access key id'],
  [/postgres(ql)?:\/\/[^\s:@'"]+:[^\s@'"]+@/g, 'Postgres URL with an inline password'],
];

// Documentation legitimately contains placeholders. A finding is only real if it is not
// one of these — otherwise the scan cries wolf on its own instructions and gets ignored,
// which is worse than not running it.
const PLACEHOLDER = /(example|placeholder|your-|<your|paste-|choose-|generate-with|xxx|\.\.\.|abc123|changeme|sk-lf-xxx|pk-lf-xxx|the-same-phrase|not-a-real|user:password|:password@|\$\{|<[a-z-]+>)/i;

function isProbablyText(file) {
  if (/\.(png|jpe?g|gif|webp|ico|pdf|zip|mp4|mov|woff2?|ttf|eot|so|dll|exe)$/i.test(file)) return false;
  try {
    const buf = fs.readFileSync(path.join(repoRoot, file));
    return !buf.subarray(0, 8000).includes(0);
  } catch { return false; }
}

function redact(s) {
  const str = String(s);
  if (str.length <= 12) return str[0] + '…' + str.slice(-1);
  return str.slice(0, 6) + '…' + str.slice(-4) + ` (${str.length} chars)`;
}

// ----------------------------------------------- live values from the real .env
// The strongest check by far: not "does this look like a key" but "is THE key here".
//
// But only for variables that actually hold secrets. A first cut flagged every file
// containing "salesgenie" (POSTGRES_USER) and "http://localhost:5678" (N8N_API_URL) —
// 40-odd findings, none of them real. A scanner that reports the database name as a leak
// trains you to skim past the one line that matters.
const SECRET_NAME = /(PASSWORD|PASSWD|SECRET|_KEY|^KEY|TOKEN|SALT|CREDENTIAL|PRIVATE|BEARER|AUTH)/i;
const EMAIL_VALUE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const liveValues = [];
const envPath = path.join(repoRoot, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    const name = m[1];
    const value = m[2].trim().replace(/^["']|["']$/g, '');
    // Short or placeholder values produce noise, not signal: a password of "y" would
    // match half the repo.
    if (value.length < 8 || PLACEHOLDER.test(value)) continue;
    if (SECRET_NAME.test(name)) liveValues.push({ name, value, kind: 'LIVE SECRET' });
    else if (EMAIL_VALUE.test(value)) liveValues.push({ name, value, kind: 'PERSONAL DATA' });
    // Everything else — hosts, ports, usernames, database names — is configuration.
    // It is meant to appear in the docs; that is what the docs are for.
  }
}

// Addresses the author has decided are public identity, not leaks. This list is the
// difference between a scanner people act on and one they learn to ignore: it flagged
// this address 6 times across docs the author wrote deliberately, and a check that is
// always red is the same as no check at all.
//
// vaibhav0904@gmail.com is the repo's git author identity — it is on every commit by
// design (2026-08-09). Any OTHER address still gets reported.
const ACCEPTED_IDENTITY = new Set(['vaibhav0904@gmail.com']);

for (let i = liveValues.length - 1; i >= 0; i--) {
  if (ACCEPTED_IDENTITY.has(liveValues[i].value)) liveValues.splice(i, 1);
}

// ------------------------------------------------------------------- the scans
const findings = [];

for (const file of tracked) {
  for (const rule of FORBIDDEN_FILES) {
    if (rule.test(file)) findings.push({ kind: 'tracked file', file, detail: rule.why });
  }
}

for (const file of tracked) {
  if (!isProbablyText(file)) continue;
  const text = fs.readFileSync(path.join(repoRoot, file), 'utf8');
  const lines = text.split(/\r?\n/);

  for (const { name, value, kind } of liveValues) {
    lines.forEach((line, i) => {
      if (!line.includes(value)) return;
      findings.push({
        kind, file, line: i + 1,
        detail: kind === 'LIVE SECRET'
          ? `the actual value of ${name} from your .env — ${redact(value)}`
          : `${name}: ${value}`,
      });
    });
  }

  for (const [re, label] of PATTERNS) {
    lines.forEach((line, i) => {
      for (const match of line.match(re) || []) {
        if (PLACEHOLDER.test(match) || PLACEHOLDER.test(line)) continue;
        findings.push({ kind: 'looks like a secret', file, line: i + 1, detail: `${label}: ${redact(match)}` });
      }
    });
  }
}

// -------------------------------------------------- history: deleted ≠ gone
// Every path that has ever existed in this history, not just the ones here now.
let historical = [];
try {
  historical = [...new Set(git(['log', '--all', '--pretty=format:', '--name-only', '--diff-filter=A'])
    .split(/\r?\n/).map((s) => s.trim()).filter(Boolean))];
} catch { /* shallow clone or no history — skip rather than fail */ }

const trackedSet = new Set(tracked);
for (const file of historical) {
  if (trackedSet.has(file)) continue;               // already reported above if forbidden
  for (const rule of FORBIDDEN_FILES) {
    if (rule.test(file)) {
      findings.push({
        kind: 'IN HISTORY', file,
        detail: `${rule.why}. Removed from the tree but still readable in every clone — ` +
                'untracking it now does not unpublish it.',
      });
    }
  }
}

// ------------------------------------------ who the commits say you are
// Scrubbing an address out of five markdown files while every commit carries it in its
// author field is theatre. Publishing a repo publishes its metadata: names, addresses,
// and the times of day you were working.
try {
  const authors = {};
  for (const line of git(['log', '--all', '--format=%ae%n%ce']).split(/\r?\n/)) {
    const addr = line.trim();
    if (addr) authors[addr] = (authors[addr] || 0) + 1;
  }
  for (const [addr, n] of Object.entries(authors)) {
    if (/noreply|users\.noreply\.github\.com/i.test(addr)) continue;
    if (ACCEPTED_IDENTITY.has(addr)) continue;
    findings.push({
      kind: 'PERSONAL DATA', file: 'git history (commit metadata)',
      detail: `${addr} — on ${n} commit record(s). Visible on every commit once public, ` +
              'and only removable by rewriting history.' +
              (/\.(org|com|net|io)$/i.test(addr) && !/gmail|outlook|yahoo|proton|hotmail/i.test(addr)
                ? ' This one names an employer domain.' : ''),
    });
  }
} catch { /* no history — nothing to report */ }

// ------------------------------------------------------------------- report
const order = { 'LIVE SECRET': 0, 'IN HISTORY': 1, 'tracked file': 2, 'looks like a secret': 3, 'PERSONAL DATA': 4 };
findings.sort((a, b) => (order[a.kind] - order[b.kind]) || a.file.localeCompare(b.file));

console.log(`Pre-publication scan — ${tracked.length} tracked files, ` +
            `${liveValues.length} live values from .env, ${historical.length} paths in history\n`);

if (!findings.length) {
  console.log('CLEAN — nothing found that should block publication.');
  if (!quiet) {
    console.log('\nStill a human call, because no scanner can judge these:');
    console.log('  - screenshots and video frames (private inboxes, real addresses)');
    console.log('  - real customer names or emails in seed data or story cards');
    console.log('  - anything a reader could combine into something you did not intend');
  }
  process.exit(0);
}

let last = null;
for (const f of findings) {
  if (f.kind !== last) { console.log(`\n### ${f.kind.toUpperCase()}`); last = f.kind; }
  console.log(`  ${f.file}${f.line ? ':' + f.line : ''}`);
  console.log(`      ${f.detail}`);
}

console.log(`\n${findings.length} finding(s). Resolve each before making this public.`);
if (findings.some((f) => f.kind === 'LIVE SECRET')) {
  console.log('A LIVE SECRET is the serious one: rotate the key, do not merely delete the line.');
}
process.exit(1);
