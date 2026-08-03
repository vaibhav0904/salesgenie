# Environments — test, demo, production

SalesGenie runs on **one shared local stack**: one n8n instance, one Postgres
container (`docker/README.md`). There is no separately hosted "production"
server — everything is local/free-tier (CLAUDE.md). Three ways of working sit
on top of that single stack, used **one at a time**:

| System | What it is |
|---|---|
| **Test** | `salesgenie_test` database — free to break, reset anytime |
| **Demo** | `salesgenie` database — clean, curated dummy data only |
| **Production** | The GitHub `main` branch — the versioned, deployable record |

## The switch: one credential, one field

All 14 workflows share a single n8n Postgres credential, **`Capstone-Postgres`**.
Its **Database** field is the only thing that changes between test and demo:

1. n8n → Credentials → `Capstone-Postgres`.
2. Set **Database** to `salesgenie` (demo) or `salesgenie_test` (test).
3. Save. Every workflow now reads/writes that database — no per-workflow edits.

Gmail and the MCP/A2A endpoints are unaffected either way (same n8n instance,
same URLs) — only which data gets read or written changes.

**Footgun:** forgetting which side you're on. A demo run against
`salesgenie_test` will look broken (empty/half-seeded); a test run left
pointed at `salesgenie` will pollute demo data. Check the credential's
Database field before starting either.

## Test loop

1. Switch the credential to `salesgenie_test`.
2. First time only: run `db/init_test_db.sql` (see the file header), then
   `node scripts/reset-test-db.js` to apply the schema.
3. Edit the workflow(s) live in n8n — there are no disposable `-TEST` copies.
   **Before any risky/structural edit**, export the current workflow JSON
   (n8n → workflow → ⋯ → Download) to `n8n/workflows/` as a checkpoint. This
   is the rollback point if the edit goes wrong mid-test.
4. Verify: replay leads via `LearningLab-Replay`, run the relevant case under
   `evals/`, or check `get_lead_status` / `get_setup_status` via MCP.
5. Broke something you can't easily fix? Re-import the last-good JSON from
   `n8n/workflows/`, or run `node scripts/reset-test-db.js` (add `--seed` to
   also load Oak & Ember as a known-good starting point) to wipe the data
   back to clean.

## Demo loop

1. Switch the credential to `salesgenie`.
2. Run `node scripts/reset-demo-db.js` — truncates every tenant table and
   re-seeds Oak & Ember, clearing out any businesses/leads created during
   rehearsals (e.g. the runbook's throwaway "Aurora Lamps"-style names).
3. Demo using `presentation/hero-demo-runbook.md` /
   `presentation/demo-deck.html`.

## Promote-to-production loop

Once a feature is verified in test:

1. Export the final workflow JSON(s) to `n8n/workflows/` (overwrite the old
   export).
2. If the schema changed, add a new `db/00N_*.sql` migration (idempotent,
   numbered after the last one) — never edit an already-shipped migration.
3. Commit on the feature branch, merge straight to `main`.

That merge **is** "pushing to production" — `main` is the deployable record;
nothing runs it live beyond what you stand up locally from it.

This is the ongoing day-to-day loop. It's distinct from
`stories/backlog/E20-S1-public-release.md`, which is the one-time gate for
flipping the repo from private to public (fresh-install smoke test on a
throwaway stack, secret scan, numbers audit) — that story still applies on
top of this, unchanged.
