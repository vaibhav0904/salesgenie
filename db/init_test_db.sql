-- One-time: create the salesgenie_test database inside the existing Postgres
-- container, alongside salesgenie (docker/README.md). Safe to re-run — only
-- creates the database if it doesn't already exist.
--
-- Run with psql (needs \gexec, a psql-only meta-command):
--   docker exec -i n8n-localdata-postgres-1 psql -U salesgenie -d salesgenie -f - < db/init_test_db.sql
--
-- After this runs once, use scripts/reset-test-db.js to (re)apply the schema
-- migrations (001, 003, 004, 005 — see n8n/workflows/README.md) and wipe it
-- back to clean whenever testing leaves a mess.

SELECT 'CREATE DATABASE salesgenie_test'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'salesgenie_test')
\gexec
