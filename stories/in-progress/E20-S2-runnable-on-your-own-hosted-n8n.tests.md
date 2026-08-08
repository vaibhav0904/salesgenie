# Test cases: E20-S2 Anyone can run this on their own hosted n8n

The governing rule for this card: **a doc is only "done" when it has been executed
verbatim by following it, not when it has been written.** Where a case says "follow",
it means change nothing that is not written down; anything that fails gets fixed in
the document rather than worked around.

TC1–TC13 verify the tooling and the docs. TC14–TC19 are the ones that actually prove
the claim, and they need a throwaway instance — they are deliberately still open.

| # | Case | Expected | Status | Evidence |
|---|---|---|---|---|
| TC1 | Retarget rewrites every host-dependent value, including the buried ones | 0 `localhost:5678` left; the 5 non-obvious ones (08 ×2 in SQL, 09 ×1 in SQL, 13 ×2 in jsCode) rewritten | **Pass** | 20/20 rewritten, grep returns 0. The 5 buried ones checked individually by node: `Insert Business`, `Get Intake Endpoint`, `Query Latest Insight`, `Build Agent Card` (2 refs) |
| TC2 | Retarget handles Langfuse | 0 `langfuse-web:3000` left; all 7 rewritten across 03,04,05,06,07,12 | **Pass** | 7/7 rewritten to `https://cloud.langfuse.com` |
| TC3 | Retarget reports what it cannot fix | Names the errorWorkflow files and every `executeWorkflow` node needing re-selection | **Pass** | Reports 13 files carrying id `7jyaQ5gz8eYDBFJI` and **8** executeWorkflow nodes — `n8n/workflows/README.md` had documented **6**, which was wrong; corrected |
| TC4 | Retarget is non-destructive | Committed exports unmodified | **Pass** | `git status n8n/workflows/` clean; output isolated to `n8n/workflows-retargeted/`, now gitignored |
| TC5 | Sync pulls live workflows | All 14 written with a change summary | **Pass** | 14 fetched and written |
| TC6 | Sync `--check` detects drift | Exits 0 when clean, non-zero when stale, naming the workflows | **Pass** | First run exited **1** naming 9 stale workflows; after sync, exits **0** — "Exports match the live instance" |
| TC7 | Sync output is diff-friendly | Two consecutive runs → no diff | **Pass** | Needed canonical node-key ordering (the exports carried **3 different orderings**) and dropping `binaryMode`, which the API returns but PUT rejects (CLAUDE.md gotcha) |
| TC8 | Every endpoint in the reference is real | Each path/method responds as documented | Deferred | Endpoints are *generated from the exports*, not transcribed, so they cannot be wrong about the files. Live confirmation belongs with TC14 |
| TC9 | Reference covers all 14 with the required fields | Purpose, trigger, credentials, tables, callers/callees per workflow | **Pass** | All 14 present; tables read/written derived by parsing the SQL; consolidated endpoint table (21 endpoints) and call graph included |
| TC10 | Credential lists agree | One source of truth, 7 credentials, exact names | **Pass** | Reference generates the table from the exports themselves. `n8n/workflows/README.md` and the onboarding guide now both point at it |
| TC11 | `.env.example` is complete | Every consumed variable present, with where-to-get comments | **Pass** | Rewritten: `N8N_*`, `DATABASE_URL`, `POSTGRES_*` incl. `POSTGRES_CONTAINER`, `MCP_BEARER_TOKEN`, `A2A_*`, all 10 `LANGFUSE_*`. States explicitly that AI keys belong in n8n credentials, **not** `.env` — the contradiction the old README carried |
| TC12 | No author's-machine paths in the setup path | Nothing a stranger must act on | **Pass** | `evals/run-evals.js` now honours `DATABASE_URL` or `POSTGRES_CONTAINER`/`USER`/`DB`; `docker/README.md` leads with the committed compose and labels the author's arrangement as reference only |
| TC13 | Committed compose starts standalone | `up -d` brings n8n + Postgres up with no external network | **Partial** | `docker compose config` validates; no `external:` anywhere. **`up -d` not executed** — ports 5678/5432 are held by the live stack. Must run on a clean machine as part of TC14 |
| TC14 | **Fresh-install run, hosted-shaped, verbatim** | Working install from the guide alone | Pending | Needs a throwaway n8n + database |
| TC15 | Fresh install processes a lead | Lead reaches `PENDING_APPROVAL`, approval email arrives | Pending | Needs TC14 |
| TC16 | MCP works over the internet from that instance | Tools list and respond; business onboarded by chat | Pending | Needs TC14. **This is the case that catches what the old guide got wrong** — the six tool URLs in each MCP workflow |
| TC17 | A2A door works on the new host | Agent card returns URLs on the new host | Pending | Needs TC14 |
| TC18 | Weekly report renders on the new host | Report shows that instance's own data | Pending | Needs TC14 |
| TC19 | Docs survive the run unchanged | Final docs are what was actually followed | Pending | Needs TC14 |

## What is proven so far, and what is not

**Proven:** the tooling works and the documentation is now internally consistent and
complete. Two real defects were found and fixed along the way — the repo said 6
Execute Workflow nodes when there are 8, and the exports had drifted from the live
instance in 9 of 14 workflows (including a personal email address that would have been
published, now scrubbed automatically).

**Not proven:** that a stranger can actually succeed. That requires TC14–TC19 against a
throwaway instance, and until those run, the claim in the story title is unverified.
No amount of careful writing substitutes for following the guide on a clean machine.

UAT: Vaibhav follows the rewritten onboarding guide himself against a throwaway
instance, without consulting me, and confirms he never had to guess.
