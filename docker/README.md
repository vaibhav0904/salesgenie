# Docker setup

The platform reuses the existing n8n compose project rather than running a second stack.

- **Compose file:** `<your project folder>\n8n - Local Data\docker-compose.yml`
- **Services:** `n8n` (port 5678), `gotenberg` (port 3000, pre-existing), `postgres` (port 5432, added for SalesGenie)
- **Postgres:** `postgres:16-alpine`, DB/user `salesgenie`, password in this repo's `.env` (`POSTGRES_PASSWORD`). Data persists in the named volume `salesgenie_pg_data` (verified across container restart).

## Start / update the stack

Compose interpolates `${POSTGRES_*}` from this repo's `.env`, so pass `--env-file`:

```bash
cd "<your project folder>\n8n - Local Data"
docker compose --env-file "<the folder you cloned salesgenie into>\.env" up -d
```

Running `up -d` without `--env-file` will fail interpolation for the postgres service — always include it. Containers themselves keep running/restarting fine without it (`restart: unless-stopped`); the flag is only needed when (re)creating.

## Connectivity map

| From | To Postgres | Host |
|---|---|---|
| n8n workflows (credential `Capstone-Postgres`, id `KR1AzPVfamsVzB1d`) | compose network | `postgres:5432` |
| Host machine / psql / scripts | published port | `localhost:5432` |

## Langfuse (LLM observability, self-hosted)

`langfuse-compose.yml` in this folder runs Langfuse v3 (web on **http://localhost:3100**, worker, ClickHouse, Redis, MinIO) on the same docker network; its Postgres data lives in a separate `langfuse` database inside the existing postgres container.

```bash
cd docker
docker compose --env-file ../.env -f langfuse-compose.yml up -d   # first boot: ~2 min of migrations
```

- **Login & API keys:** created headlessly from `LANGFUSE_INIT_*` / `LANGFUSE_PUBLIC_KEY` / `LANGFUSE_SECRET_KEY` in `.env` (org `SalesGenie`, project `SalesGenie v2`). Log in at :3100 with `LANGFUSE_INIT_USER_EMAIL` / `LANGFUSE_INIT_USER_PASSWORD` from `.env`.
- **n8n → Langfuse:** every LLM call site has a fail-safe "Ship LF" node posting to `http://langfuse-web:3000/api/public/ingestion` (auth via n8n credential `Capstone-Langfuse`). Langfuse being down never affects the pipeline (verified).
- **Model prices** (one-time, already applied; re-run after wiping the langfuse DB): POST to `/api/public/models` — `gemini-2.5-flash` at $0.30/$2.50 per 1M tokens `gpt-4o` at $2.50/$10 and `gpt-4o-mini` at $0.15/$0.60 per 1M, so the UI prices every generation.

## Handy commands

```bash
docker ps                                                   # all containers
docker exec n8n-localdata-postgres-1 psql -U salesgenie -d salesgenie -c "SELECT 1;"
docker compose logs postgres --tail 50                      # from the compose dir
```
