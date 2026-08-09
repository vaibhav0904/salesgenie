# Test cases: E20-S2 Anyone can run this on their own hosted n8n

The governing rule for this card: **a doc is only "done" when it has been executed
verbatim by following it, not when it has been written.**

TC1–TC13 verify the tooling and docs. TC14–TC19 were attempted for real on
2026-08-09 against a throwaway stack (`docker compose -p sg-fresh`, n8n on :5679,
Postgres on :5433, its own volumes, never touching the live rig). What that run
could and could not prove is recorded honestly below.

| # | Case | Status | Evidence |
|---|---|---|---|
| TC1 | Retarget rewrites every host-dependent value, including the buried ones | **Pass** | 20/20 rewritten, grep clean. **Confirmed live, not just by grep:** on the fresh instance `create_business` returned `"intake_url":"http://localhost:5679/..."` — that string comes from inside a Postgres SQL query in `08-MCPOnboarding`, one of the five buried occurrences |
| TC2 | Retarget handles Langfuse | **Pass** | 7/7 rewritten across 03,04,05,06,07,12 |
| TC3 | Retarget reports what it cannot fix | **Pass** | Reports 13 errorWorkflow files and **8** executeWorkflow nodes — the repo documented **6**, which was wrong; corrected |
| TC4 | Retarget is non-destructive | **Pass** | `git status n8n/workflows/` clean; output isolated and gitignored |
| TC5 | Sync pulls live workflows | **Pass** | 14 fetched and written |
| TC6 | Sync `--check` detects drift | **Pass** | Exited 1 naming 9 stale workflows; after sync, exits 0 |
| TC7 | Sync output is diff-friendly | **Pass** | Needed canonical node-key ordering (exports carried 3 orderings) and dropping `binaryMode`, which the API returns but PUT rejects |
| TC8 | Every endpoint in the reference is real | **Partial** | Six exercised live on the fresh instance: intake, create-business, setup-status, upload-catalog, set-reviewer, a2a-agent-card — all behaved as documented. The rest are generated from the exports, not transcribed |
| TC9 | Reference covers all 14 with required fields | **Pass** | All 14; tables derived by parsing SQL; 21-endpoint table and call graph included |
| TC10 | Credential lists agree | **Pass** | Generated from the exports; the two prose lists now point at it |
| TC11 | `.env.example` is complete | **Pass** | Every consumed variable, with where-to-get comments; states AI keys belong in n8n credentials, not `.env` |
| TC12 | No author's-machine paths in the setup path | **Pass** | `evals/run-evals.js` honours `DATABASE_URL` or `POSTGRES_CONTAINER`; `docker/README.md` leads with the committed compose |
| TC13 | **Committed compose starts standalone** | **Pass** | `docker compose -p sg-fresh up -d` on alternate ports brought up n8n + Postgres with no external network, and **all 13 `vaibhavcapstone_*` tables were created automatically** from `db/` on first boot |
| TC14 | Fresh-install run, verbatim | **Partial** | Reached a working install on a clean instance: 14 workflows imported, all 14 published, `Capstone-Postgres` bound, business created, catalogue uploaded, reviewer set. **But not via the guide verbatim** — imported by CLI rather than the UI, and only 1 of 7 credentials could be created (see "What blocked the rest") |
| TC15 | Fresh install processes a lead | **Partial** | Intake works correctly: unknown business → `404 unknown business_id` (refuses rather than guesses); valid business → `201`, lead row `RECEIVED`. **Did not reach `PENDING_APPROVAL`** — blocked on the stale `executeWorkflow` ids and the missing Gemini credential |
| TC16 | MCP over the internet | **Not run** | Needs a public URL and Vaibhav's chat client |
| TC17 | **A2A door works on the new host** | **Pass** | `GET /webhook/a2a-agent-card?business_id=biz_freshinstallte` returned the card with `"url":"http://localhost:5679/webhook/a2a-rpc?..."` — from inside `13-A2AServer`'s jsCode, another buried occurrence, proven live |
| TC18 | Weekly report on the new host | **Not run** | The narrative step needs Gemini |
| TC19 | Docs survive the run unchanged | **Pass (with fixes)** | Two defects found *by running it* and fixed in the docs rather than worked around — below |

## What the run proved that grepping could not

- **The buried SQL and jsCode rewrites genuinely work.** Both the `intake_url` returned
  by `create_business` and the `url` in the A2A agent card came back on `:5679`. Those
  are exactly the two places a find-and-replace over node URLs would have missed.
- **The manual re-pointing step is not optional.** `01-Intake` accepted the lead and then
  errored: its `Execute Workflow` node still referenced the *old* instance's workflow id.
  The lead sat at `RECEIVED`. This is precisely what `retarget-host.js` warns about, and
  it confirms that skipping it breaks the pipeline silently after the first step.

## Two defects found by running it, now fixed in the docs

1. **CLI-published workflows do not register their webhooks until n8n restarts.** Every
   endpoint returned *"the requested webhook is not registered"* while the database said
   `active = 1` for all 14. Documented in `n8n/workflows/README.md`.
2. **The committed compose loaded the demo tenant by default**, so a first catalogue
   upload landed alongside 20 sample products — confusing for anyone expecting an empty
   shop, and contrary to the seedless quickstart. The compose now says so plainly and
   explains how to opt out.

## What blocked the rest, and what it would take

`.env` holds no Gemini, OpenAI or SMTP secrets — they exist only inside n8n's credential
store, which the API cannot read back. So on a throwaway instance only
`Capstone-Postgres` could be created, and every AI stage (03, 04, 05, 06, 07, 12) and all
email is therefore untestable by me.

To finish TC14–TC16 and TC18 someone must, on a fresh instance: create the remaining six
credentials with their own keys, re-select the error workflow and the eight
`Execute Workflow` targets, and point a chat client at the MCP endpoints. That is a human
sitting in front of the n8n UI with their own accounts — which is, after all, exactly the
experience this card exists to make survivable.

UAT: Vaibhav follows the rewritten onboarding guide himself against a throwaway
instance, without consulting me, and confirms he never had to guess.
