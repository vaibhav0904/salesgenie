// Restores salesgenie (the demo database) to a pristine state: truncates
// every tenant/transactional table, then re-seeds Oak & Ember via
// db/002_seed_oakember.sql. Clears out anything created during rehearsals
// (e.g. the throwaway "Aurora Lamps"-style businesses created while rehearsing)
// without touching schema or the test database (docs/environments.md).
//
// vaibhavcapstone_platform_config is deliberately NOT truncated — it holds
// platform-level, deploy-time config, not demo data.
//
// Usage: node scripts/reset-demo-db.js
//
// No new dependencies: shells out to `docker exec ... psql`, same pattern as
// docker/README.md's documented handy commands. Requires Docker Desktop running.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const envPath = path.join(repoRoot, '.env');
const envText = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
function envVar(name, fallback) {
  const m = envText.match(new RegExp(`^${name}\\s*=\\s*(.*)$`, 'm'));
  return (m && m[1].trim()) || fallback;
}

const CONTAINER = envVar('POSTGRES_CONTAINER', 'n8n-localdata-postgres-1');
const USER = envVar('POSTGRES_USER', 'salesgenie');
const DEMO_DB = envVar('POSTGRES_DB', 'salesgenie');

const TABLES = [
  'vaibhavcapstone_businesses',
  'vaibhavcapstone_products',
  'vaibhavcapstone_leads',
  'vaibhavcapstone_extractions',
  'vaibhavcapstone_qualifications',
  'vaibhavcapstone_recommendations',
  'vaibhavcapstone_drafts',
  'vaibhavcapstone_events',
  'vaibhavcapstone_insights',
  'vaibhavcapstone_llm_calls',
  'vaibhavcapstone_judge_scores',
  'vaibhavcapstone_a2a_tasks',
];

function psql(db, { sql, file } = {}) {
  const args = ['exec', '-i', CONTAINER, 'psql', '-v', 'ON_ERROR_STOP=1', '-U', USER, '-d', db];
  const input = file ? fs.readFileSync(file, 'utf8') : sql;
  execFileSync('docker', args, { input, stdio: ['pipe', 'inherit', 'inherit'] });
}

console.log(`Resetting ${DEMO_DB} to pristine demo state...`);

console.log('  truncating tenant/transactional tables...');
psql(DEMO_DB, { sql: `TRUNCATE ${TABLES.join(', ')} CASCADE;` });

console.log('  reseeding Oak & Ember (db/002_seed_oakember.sql)...');
psql(DEMO_DB, { file: path.join(repoRoot, 'db', '002_seed_oakember.sql') });

console.log(`DONE: ${DEMO_DB} reset — Oak & Ember only, no test-run debris.`);
console.log('Point the Capstone-Postgres credential (n8n) at salesgenie to use it.');
