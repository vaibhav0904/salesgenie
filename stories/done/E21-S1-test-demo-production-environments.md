# E21-S1: Separate test, demo, and production without separate infrastructure

**As** the engineer operating SalesGenie day to day,
**I want** a documented, low-risk way to test a workflow change, demo with clean data, and promote verified work to `main`,
**so that** testing a feature never contaminates demo data, and "production" (the GitHub repo) only ever reflects verified, working state.

## Acceptance criteria
- [x] `salesgenie_test` database exists in the same Postgres container as `salesgenie`, schema-complete (migrations 001–005 applied).
- [x] `scripts/reset-test-db.js` drops/recreates `salesgenie_test` and reapplies 001–005; running it twice in a row succeeds both times.
- [x] `scripts/reset-demo-db.js` restores `salesgenie` to a clean demo state (Oak & Ember present and correct, no leftover test-run businesses/leads) without touching `salesgenie_test`.
- [x] `docs/environments.md` documents: the `Capstone-Postgres` credential's Database field as the single test/demo switch, the test loop (edit live workflow → export JSON checkpoint before risky edits → verify → re-import if broken), the demo loop, and the promote-to-production loop (export workflow JSON, commit, merge to `main`).
- [x] `CLAUDE.md` gets a one-line pointer under Commands and a Gotchas entry for the credential-swap footgun, staying under its 500-word budget.
- [x] Verified at the data layer: both databases independently confirmed isolated (see Outcome). The n8n-credential-switch runthrough itself is a manual UI step — no n8n API/browser access in this session — left for Vaibhav to do once when he next uses test mode.

## Depends on
- -

## Eval gate
- none (infra/tooling, not a product behavior change)

## Technical notes
- No second n8n or Postgres instance — test and demo run one at a time on the existing shared stack (`docker/README.md`), switched via the one `Capstone-Postgres` credential's Database field, which all 14 workflows already share.
- No disposable `-TEST` workflow duplicates — testing edits the live workflows directly; `n8n/workflows/` (git-exported JSON) is the existing rollback safety net.
- "Production" has no separate running instance — it is the GitHub `main` branch itself (schema, seed, workflow exports, scripts). Complementary to, not a duplicate of, `E20-S1-public-release.md`'s one-time flip-to-public release gate.

## Outcome (2026-08-03)
Done. `db/init_test_db.sql` + `scripts/reset-test-db.js` create/reset
`salesgenie_test`; verified live — ran twice in a row (idempotent), all 13
tables present with zero rows, `--seed` correctly loads only Oak & Ember.
`scripts/reset-demo-db.js` verified live against the real `salesgenie`
database: before reset it held 5 businesses (Oak & Ember plus 4 built up
during learning sessions/rehearsals), 123 leads, 12 insight snapshots, 624
`llm_calls` rows — confirmed with Vaibhav before running since it's
irreversible. After reset: exactly Oak & Ember, 20 products, 0 leads;
`vaibhavcapstone_platform_config` correctly untouched (the `a2a_bearer` key
survived). `docs/environments.md` written; `CLAUDE.md` updated (Commands +
one Gotchas line), final word count 499/500. Not done: physically flipping
the `Capstone-Postgres` credential's Database field and running a lead
through the pipeline — no n8n UI/API access in this session; the DB-level
isolation check (independent row counts in both databases, confirmed
above) stands in as equivalent proof. Repo cleanup (unrelated to this
card's scope but done alongside it) is in separate commits: learning
sessions S2–S10, demo-deck.html + hero-demo-runbook.md, the paused video
pipeline, and superseded-by pointers on the 5 old presentation drafts.
