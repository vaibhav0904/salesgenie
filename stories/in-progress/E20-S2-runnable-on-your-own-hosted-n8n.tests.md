# Test cases: E20-S2 Anyone can run this on their own hosted n8n

The governing rule for this card: **a doc is only "done" when it has been executed
verbatim by following it, not when it has been written.**

Executed 2026-08-09 against a throwaway stack (`docker compose -p sg-fresh`, n8n on
:5679, Postgres on :5433, its own volumes, never touching the live rig), torn down
with `down -v` afterwards.

| # | Case | Status | Evidence |
|---|---|---|---|
| TC1 | Retarget rewrites every host-dependent value, including the buried ones | **Pass** | 20/20 rewritten. **Proven live, not just by grep:** `create_business` on the fresh instance returned `"intake_url":"http://localhost:5679/..."` — that string lives inside a Postgres SQL query in `08-MCPOnboarding`, one of the five occurrences a URL-field search misses |
| TC2 | Retarget handles Langfuse | **Pass** | 7/7 rewritten across 03,04,05,06,07,12 |
| TC3 | Retarget reports what it cannot fix | **Pass** | Found **8** executeWorkflow nodes where the repo documented 6. Superseded by the id-stamping fix below |
| TC4 | Retarget is non-destructive | **Pass** | `git status n8n/workflows/` clean; output isolated and gitignored |
| TC5 | Sync pulls live workflows | **Pass** | 14 fetched and written |
| TC6 | Sync `--check` detects drift | **Pass** | Exited 1 naming 9 stale workflows; after sync, exits 0 |
| TC7 | Sync output is diff-friendly | **Pass** | Needed canonical node-key ordering (exports carried 3 orderings) and dropping `binaryMode`, which the API returns but PUT rejects |
| TC8 | Every endpoint in the reference is real | **Pass** | Nine exercised live: intake, create-business, setup-status, upload-catalog, set-reviewer, insights-run, insights-latest, a2a-agent-card, plus the intake guard. All behaved as documented |
| TC9 | Reference covers all 14 with required fields | **Pass** | All 14; tables derived by parsing SQL; 21-endpoint table and call graph |
| TC10 | Credential lists agree | **Pass** | Generated from the exports; both prose lists point at it |
| TC11 | `.env.example` is complete | **Pass** | Every consumed variable with where-to-get comments; states AI keys belong in n8n credentials |
| TC12 | No author's-machine paths in the setup path | **Pass** | `evals/run-evals.js` honours `DATABASE_URL` or `POSTGRES_CONTAINER` |
| TC13 | Committed compose starts standalone | **Pass** | Came up on alternate ports, no external network, **all 13 tables created automatically** from `db/` on first boot |
| TC14 | **Fresh-install run** | **Pass** | 7 credentials + 14 workflows imported into a clean instance, all 14 published, business created, catalogue uploaded, reviewer set |
| TC15 | **Fresh install processes a lead** | **Pass** | Unknown business → `404 unknown business_id` (refuses rather than guesses). Valid lead → `201` → **`PENDING_APPROVAL` in ~30s**, band **HOT**, 1 recommendation, 1 draft, 4 LLM calls. Recommendation verified against the catalogue: `TST-001`, real and in stock |
| TC16 | MCP over the internet | **Not run** | Needs a public URL and a chat client. The tool URLs it depends on were retargeted and proven by TC1 |
| TC17 | A2A door works on the new host | **Pass** | Agent card returned `"url":"http://localhost:5679/webhook/a2a-rpc?..."` — from inside `13-A2AServer`'s jsCode, the other buried occurrence |
| TC18 | **Weekly report on the new host** | **Pass** | `insights-run` then `insights-latest` returned a 6,880-byte report with that instance's own data: "processed a total volume of 1 lead… classified as 'HOT'" |
| TC19 | Docs survive the run unchanged | **Pass (with fixes)** | Three defects found *by running it*, fixed in the docs and tooling rather than worked around |

## What running it changed

**The manual re-pointing step is gone.** The first run confirmed the warning was real —
`01-Intake` accepted a lead, then errored because its Execute Workflow node referenced an
id that did not exist, and the lead stopped dead at `RECEIVED`. But n8n honours a
top-level `id` on import, so `retarget-host.js` now stamps the six referenced workflows
with the ids the others already point at. Second run: imported, published, and a lead ran
the entire pipeline to `PENDING_APPROVAL` with **no manual re-selection at all**.

That removes the most error-prone step in the whole setup — one that failed silently.

## Three defects found by doing it

1. **CLI-published workflows do not register webhooks until n8n restarts.** Every endpoint
   returned "the requested webhook is not registered" while the database said `active = 1`
   for all 14. Documented in `n8n/workflows/README.md` and in the script's own output.
2. **The committed compose loaded the demo tenant by default**, so a first catalogue upload
   landed beside 20 sample products — contrary to the seedless quickstart. Now stated
   plainly, with how to opt out.
3. **The repo documented 6 Execute Workflow handoffs; there are 8.**

## The one case still open

TC16 (MCP driven from a chat client over the internet) needs a publicly reachable URL and
a configured client. Everything it depends on — the twelve retargeted tool URLs in `08`
and `09` — was rewritten and verified by TC1 and TC8, so the remaining risk is the client
connection itself rather than the workflows.

UAT: Vaibhav follows the rewritten onboarding guide himself against a throwaway
instance, without consulting me, and confirms he never had to guess.
