// Drops and recreates salesgenie_test, then reapplies the schema migrations —
// the "wipe my mess and start clean" button for the test environment
// (docs/environments.md). Never touches salesgenie (the demo database).
//
// Usage:
//   node scripts/reset-test-db.js            schema only (001, 003, 004, 005)
//   node scripts/reset-test-db.js --seed      also loads Oak & Ember (002)
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
const ADMIN_DB = envVar('POSTGRES_DB', 'salesgenie');
const TEST_DB = 'salesgenie_test';
const SEED = process.argv.includes('--seed');

function psql(db, { sql, file } = {}) {
  const args = ['exec', '-i', CONTAINER, 'psql', '-v', 'ON_ERROR_STOP=1', '-U', USER, '-d', db];
  const input = file ? fs.readFileSync(file, 'utf8') : sql;
  execFileSync('docker', args, { input, stdio: ['pipe', 'inherit', 'inherit'] });
}

const MIGRATIONS = SEED
  ? ['001_schema.sql', '002_seed_oakember.sql', '003_llm_observability.sql', '004_a2a.sql', '005_exact_usage.sql']
  : ['001_schema.sql', '003_llm_observability.sql', '004_a2a.sql', '005_exact_usage.sql'];

console.log(`Resetting ${TEST_DB} (${SEED ? 'with seed' : 'schema only'})...`);

console.log('  terminating existing connections...');
psql(ADMIN_DB, {
  sql: `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${TEST_DB}' AND pid <> pg_backend_pid();`,
});

console.log('  dropping + recreating database...');
psql(ADMIN_DB, { sql: `DROP DATABASE IF EXISTS ${TEST_DB};` });
psql(ADMIN_DB, { sql: `CREATE DATABASE ${TEST_DB};` });

for (const m of MIGRATIONS) {
  console.log(`  applying ${m}...`);
  psql(TEST_DB, { file: path.join(repoRoot, 'db', m) });
}

console.log(`DONE: ${TEST_DB} reset (${MIGRATIONS.length} migrations applied).`);
console.log('Point the Capstone-Postgres credential (n8n) at salesgenie_test to use it.');
