# E1-S1: The platform's data layer starts with one command

**As an** Operator
**I want** Postgres running next to n8n via docker-compose
**So that** the whole platform runs locally with no paid services and survives restarts.

## Acceptance criteria
- [ ] `docker compose up -d` (or documented equivalent) brings up Postgres alongside the existing n8n container, on a shared network.
- [ ] Postgres data persists across container restarts (named volume).
- [ ] n8n has a working Postgres credential to this DB.
- [ ] Connection details documented in `docker/README.md`.

## Depends on
- – (first story)

## Eval gate
- none

## Technical notes
- Reuse the user's existing n8n compose file if one exists; otherwise add `docker/docker-compose.yml` with both services. Confirm with user before touching their n8n container.

## Outcome (2026-07-26)
- Added `postgres` service (postgres:16-alpine, port 5432, healthcheck, volume `salesgenie_pg_data`) to the existing compose file in `...\Documents\n8n - Local Data\` — n8n container untouched (stayed Running).
- Secrets interpolated from repo `.env` via `--env-file`; exact command in `docker/README.md`.
- Verified: container healthy; `SELECT version()` → PostgreSQL 16.14; n8n container reaches `postgres:5432` over the compose network; marker table survived a container restart (then cleaned up).
- n8n credential **Capstone-Postgres** (id `KR1AzPVfamsVzB1d`) created via n8n API, host `postgres`.
