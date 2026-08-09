# Docker setup — the optional local path

**Most people should not need this.** The supported way to run SalesGenie is hosted
n8n plus a managed database — see [`../docs/business-onboarding-guide.md`](../docs/business-onboarding-guide.md).
This is for developing on your own machine.

```bash
cd docker && docker compose --env-file ../.env up -d
```

`docker-compose.yml` in this folder is self-contained: its own network and volumes,
n8n on `http://localhost:5678`, Postgres on `5432`, and the `db/` migrations applied
automatically on first boot. Because n8n lands on localhost, the workflow exports
work as shipped — no `retarget-host.js` needed.

It creates three databases: `salesgenie` (the platform's records), `n8n` (n8n's own
storage) and an empty `langfuse`, so the optional tracing stack below has somewhere to
land without a manual step.

## Running a second stack beside a live one

Ports **and** container names both have to move. Compose scopes networks and volumes to
the project you pass with `-p`, but container names are absolute — so `-p` alone still
collides:

```bash
N8N_HOST_PORT=5679 POSTGRES_HOST_PORT=5433 CONTAINER_PREFIX=sg-test \
  docker compose -p sg-test --env-file ../.env up -d

docker compose -p sg-test down -v      # tear it down; -v drops its data too
```

If you move n8n off 5678, the exports need retargeting — but **to the port n8n listens
on inside its container (5678), not the one you publish**. See the warning in
[`../scripts/retarget-host.js`](../scripts/retarget-host.js); it detects this case.

## Connectivity map

| From | To Postgres | Host |
|---|---|---|
| n8n workflows (credential `Capstone-Postgres`) | compose network | `postgres:5432` |
| Host machine / psql / scripts | published port | `localhost:5432` (or `POSTGRES_HOST_PORT`) |

---

## The author's own arrangement — reference only

The rest of this file describes how this repo was developed: a **separate, uncommitted**
n8n project that predates the compose file above, sharing its Postgres with other work.
Nothing here is needed to run SalesGenie, and none of it will exist on your machine.
It is kept so the numbers in the docs and stories can be traced to a real setup.

- **Compose file:** in a sibling `n8n - Local Data` folder outside this repo, passed
  `--env-file` pointing back at this repo's `.env` so `${POSTGRES_*}` interpolate.
  Omitting `--env-file` fails interpolation for the postgres service; running containers
  are unaffected (`restart: unless-stopped`), it only matters when (re)creating.
- **Services:** `n8n` (5678), `gotenberg` (3000, pre-existing — this is why self-hosted
  Langfuse sits on 3100), `postgres` (5432, added for SalesGenie).
- **Postgres:** `postgres:16-alpine`, DB/user `salesgenie`, password from `.env`
  (`POSTGRES_PASSWORD`); data in the named volume `salesgenie_pg_data`.
- **Credential id:** `Capstone-Postgres` is `KR1AzPVfamsVzB1d` — the id the exports
  reference, which is why importing a credential under that id binds every node with no
  re-selection.

## Langfuse (LLM observability, self-hosted)

`langfuse-compose.yml` in this folder runs Langfuse v3 (web on **http://localhost:3100**, worker, ClickHouse, Redis, MinIO); its data lives in a separate `langfuse` database inside your existing postgres container, which the compose above creates for you.

```bash
cd docker
docker compose --env-file ../.env -f langfuse-compose.yml up -d   # first boot: ~2 min of migrations
```

**It has to join the network your postgres is already on**, because it reaches it as the
hostname `postgres`. The file defaults to `docker_default` — the network compose creates
when you start `docker-compose.yml` from this folder. If yours is named anything else
(a different folder name, a `-p` project, or your own n8n stack), find it with
`docker network ls` and set `N8N_DOCKER_NETWORK` in `.env`. Get this wrong and Langfuse
starts, then fails every database call.

- **Login & API keys:** created headlessly from `LANGFUSE_INIT_*` / `LANGFUSE_PUBLIC_KEY` / `LANGFUSE_SECRET_KEY` in `.env` (org `SalesGenie`, project `SalesGenie v2`). Log in at :3100 with `LANGFUSE_INIT_USER_EMAIL` / `LANGFUSE_INIT_USER_PASSWORD` from `.env`.
- **n8n → Langfuse:** every LLM call site has a fail-safe "Ship LF" node posting to `http://langfuse-web:3000/api/public/ingestion` (auth via n8n credential `Capstone-Langfuse`). Langfuse being down never affects the pipeline (verified).
- **Model prices** (one-time, already applied; re-run after wiping the langfuse DB): POST to `/api/public/models` — `gemini-2.5-flash` at $0.30/$2.50 per 1M tokens `gpt-4o` at $2.50/$10 and `gpt-4o-mini` at $0.15/$0.60 per 1M, so the UI prices every generation.

## Handy commands

```bash
docker ps                                            # find your container's real name
docker exec -i salesgenie-postgres psql -U salesgenie -d salesgenie -c "SELECT 1;"
docker compose logs postgres --tail 50               # from this folder
```

`salesgenie-postgres` is what `docker-compose.yml` here creates. If you brought your own
Postgres, use its name from `docker ps` and set `POSTGRES_CONTAINER` in `.env` so the
helper scripts find it too.
