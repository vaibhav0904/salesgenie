# E14-S2: Langfuse — professional observability, fully local

**As an** operator (and as the capstone evaluator)
**I want** every LLM call visible as a priced trace in a real observability UI, with judge scores attached
**So that** "we track everything" is a screen I can click, not a claim.

## Acceptance criteria
- [ ] `docker/langfuse-compose.yml` (official v3 stack, local, free); bring-up steps in `docker/README.md`; keys via `.env` → `vaibhavcapstone_platform_config`.
- [ ] Every call site ships trace+generation (exact usage) to `/api/public/ingestion`, fail-safe (`continueOnFail`; inline before sendAndWait in WF-06).
- [ ] WF-12 ships judge generations and attaches rubric scores to the target trace.
- [ ] Fresh lead → 1 trace, 4 priced generations; judge sweep → scores visible; Langfuse stopped → pipeline unaffected.

## Depends on
- E14-S1

## Outcome (2026-07-26)
Done. Langfuse v3 self-hosted via `docker/langfuse-compose.yml` (web :3100 — host 3000 was taken by gotenberg; worker, ClickHouse, Redis, MinIO on the existing docker network; separate `langfuse` DB in the existing Postgres). Headless init from `.env` (`LANGFUSE_INIT_*`) — no manual setup clicks. Auth to n8n via new `Capstone-Langfuse` header credential (cleaner than platform_config: secret never touches a workflow body).
- All 6 call sites ship trace+generation with EXACT usage; trace id = platform `trace_id`, so a lead is one trace with 4 priced generations. Model prices registered (`gemini-2.5-flash`, `gpt-4o`) — verified $0.0028 for a 1k/1k test.
- WF-12 ships judge generations (exact OpenAI usage, priced) and attaches rubric scores to the lead's trace. First wiring hit the n8n loop pitfall ($('X').first() in a splitInBatches loop repeats iteration 1) — fixed with inline chain + `.item` pairing + Restore Verdict node; dup scores deleted; 58 historic scores backfilled.
- **Fail-safe proven:** with Langfuse fully stopped, a fresh lead ran the whole pipeline (PENDING_APPROVAL, all 4 exact-usage rows in Postgres). Postgres remains system of record; the weekly report is untouched.
