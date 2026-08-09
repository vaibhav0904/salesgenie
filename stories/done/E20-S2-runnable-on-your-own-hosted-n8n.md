# E20-S2: Anyone can run this on their own hosted n8n

**As** a small-business owner (or an engineer evaluating the work) who found this repo,
**I want** to point it at my own hosted n8n and my own database and have it actually run,
**so that** the repo is something I can *use*, not just read about.

**Status:** done (2026-08-09). All 19 test cases pass against a throwaway stack, plus two
UAT passes over the docs (12 blockers, then the 7 they queued). **E20-S1 is unblocked** —
its first acceptance criterion, a fresh-install run from the docs verbatim, is TC14–TC18.

**One thing this card cannot claim:** a first-time human reader has not walked the guide
end to end. Everything here was verified by execution or by adversarial reading, both by
the person who wrote the docs. That is the remaining risk, and it belongs to E20-S1.

## Why this card exists

Two audits (setup docs; all 14 workflow JSONs) found the repo is not reproducible by
anyone but its author:

- No committed compose stands up n8n + Postgres. `docker/README.md` points at an absolute
  path on the author's Windows machine, and the one compose that *is* committed
  (`langfuse-compose.yml`) joins `external: true, name: n8n-localdata_default` — so it
  depends on the missing file and cannot start standalone.
- `docs/business-onboarding-guide.md` is the best setup asset in the repo and **nothing
  links to it**. It is reachable only by browsing `docs/` and guessing.
- That guide says the `localhost` fix touches 3 workflows. It touches **20 occurrences
  across 5 files**, and **5 are inside SQL queries and Code nodes** where find-and-replace
  over node URLs misses them. Following it on hosted n8n leaves the MCP tools — its own
  Step 6 centrepiece — pointing at localhost.
- 7 further hardcoded `http://langfuse-web:3000/api/public/ingestion` across 6 workflows;
  a Docker service hostname that resolves nowhere else. No doc mentions them.
- `.env.example` still says "Future keys go below" and omits every `LANGFUSE_*` variable
  the committed compose interpolates, plus `POSTGRES_CONTAINER`.
- No per-workflow reference exists: no triggers, no webhook paths, no inputs/outputs.
- The two credential lists disagree (7 vs 6).

## Acceptance criteria

- [x] **Hosted-first README.** Leads with what it is, the demo (absolute URL), then
      "run it for your business" linking to the onboarding guide. No `<postgres-container>`
      placeholder and no author's-machine handoff anywhere in the primary path.
- [x] **"What you need before you start" checklist** stating, for each piece, whether it is
      required or optional and what degrades without it: hosted n8n with a public URL,
      Postgres (Supabase/Neon free tier), Gemini key (required), OpenAI key (optional —
      fallback model + judge), SMTP (required for approvals), IMAP (only for the email
      door), invented MCP bearer, A2A secret row (optional), Langfuse Cloud (optional).
- [x] **`.env.example` lists every variable actually consumed**, grouped by what needs it,
      with where-to-get comments, and resolves the contradiction about whether LLM keys
      belong in `.env` or in n8n credentials.
- [x] **`docs/workflows-reference.md`** covers all 14: purpose, trigger type with exact
      method and path (or cron rule), credentials consumed, tables read/written, callers
      and callees, failure behaviour — plus the call graph and one consolidated endpoint
      table. Generated from the exports so it cannot drift from reality.
- [x] **`scripts/retarget-host.js`** rewrites every host-dependent value for a supplied base
      URL — all 20 localhost occurrences *including those inside SQL and jsCode*, the 7
      Langfuse URLs, and the `reviewer@example.com` defaults in 00 and 12 — and *reports*
      the per-instance references a human must re-select (`settings.errorWorkflow` in 13
      files, 6 `executeWorkflow` node IDs).
- [x] **`scripts/sync-workflows.js`** pulls live workflows from the n8n API into
      `n8n/workflows/`, normalises volatile fields, and summarises what changed. `--check`
      exits non-zero when exports are stale.
- [x] **`docker/docker-compose.yml`** committed and self-contained (no external network),
      documented as the optional local path; `docker/README.md` no longer contains absolute
      Windows paths.
- [x] **Audit fixes:** `evals/run-evals.js` honours `POSTGRES_CONTAINER` and supports a
      connection string; credential lists reconciled to one source of truth; README's
      release link absolute.
- [x] **Proven, not described:** the whole thing executed verbatim against a throwaway
      instance that is not the demo rig (see `.tests.md`).

## Depends on
- -

## Eval gate
- none — reproducibility/tooling, verified by the fresh-install run in `.tests.md`

## Technical notes
- Reuse, don't rewrite: `docs/business-onboarding-guide.md` already covers the hosted path
  well in plain language. Fix its retargeting step and surface it; do not duplicate it.
- The 7 credentials and their exact names (including the `Capstone-IMA` truncation, which
  is real and load-bearing) are already correct in `n8n/workflows/README.md` — that table
  is the source of truth to reconcile toward.
- `retarget-host.js` must walk the whole JSON tree, not just `parameters.url`: the misses
  are in `08-MCPOnboarding` (2 in SQL), `09-MCPOperations` (1 in SQL) and `13-A2AServer`
  (2 in jsCode).
- `sync-workflows.js` is the durable answer to CLAUDE.md's "Exports drift" gotcha.
- A GitHub Action cannot run the sync — it cannot reach a private n8n — so it stays a
  local pre-commit step.
