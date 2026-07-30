# E11-S1: We decide what to watch before we start watching

**As an** Operator
**I want** a written plan of exactly what every AI call must record and how its quality is judged
**So that** instrumentation follows deliberate product decisions, not whatever was easy to log.

## Acceptance criteria
- [ ] `docs/traceability.md`: per-call-site capture matrix (all 6 Gemini sites) — what's captured, what "bad" looks like, which metric it feeds, who acts on it; judge design (artifacts, rubrics, scale, alert thresholds); cost model with price constants and the free-tier caveat.
- [ ] `db/003_llm_observability.sql`: idempotent migration creating `vaibhavcapstone_llm_calls` and `vaibhavcapstone_judge_scores`, business_id-keyed, indexed.
- [ ] `docs/adr/0010-llm-observability.md`: DB-tables-plus-sweeper over an observability SaaS, with consequences.
- [ ] Migration applied and verified against the running Postgres.

## Depends on
- – (Phase 2 start)

## Eval gate
- none (this story defines future gates)

## Technical notes
- Plan-first is the point: the doc is written and agreed before any workflow is touched (E11-S2 implements it).

## Outcome (2026-07-26)
- docs/traceability.md written FIRST: capture matrix for all 6 call sites (what/why/bad-looks-like/metric/owner), latency+token+notional-cost model with price constants and free-tier caveat, judge design (OpenAI grades Gemini - separated doer/grader), alert thresholds, and an explicit do-NOT-capture list.
- db/003_llm_observability.sql applied twice (idempotent): vaibhavcapstone_llm_calls (per-call telemetry, CHECK-constrained call sites) + vaibhavcapstone_judge_scores (UNIQUE per artifact = claim-then-judge).
- ADR-0010: Postgres tables + sweeper judge over an observability SaaS; logging is continueOnFail so observability can fail without touching the pipeline.
