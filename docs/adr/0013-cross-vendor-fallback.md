# ADR 0013 — Cross-vendor LLM fallback (Gemini 2.5 Flash → gpt-4o-mini)

**Status:** accepted · **Date:** 2026-07-27

## Context
The pipeline's six LLM call sites all depended on one vendor. A Gemini outage would have parked every lead in human triage — safe, but a full stop. The user asked for failure resistance with a price-equivalent OpenAI backup.

## Decision
Every pipeline call site gets an error-branch fallback: if the Gemini call fails outright (after its retries), the **same prompts** are re-sent to OpenAI **gpt-4o-mini** ($0.15/$0.60 per 1M — the same-tier mini, already available on the existing credential). A merge node (`LLM Result <site>`) normalizes either vendor's response to one shape, so parsers, guardrails and state machines are untouched. If the fallback also fails, the pre-existing failure lanes take over (NEEDS_REVIEW / dead-letter + alert) — never a crash, never a dropped lead.

**Telemetry stays honest:** every call is logged and priced as the model that actually ran (`model`, `fallback_used`, per-model cost in `llm_calls`; Langfuse prices `gpt-4o-mini` via its own model entry).

**The judge is deliberately excluded.** Its only sensible fallback would be Gemini — which would let Gemini grade Gemini's work. The doer≠grader separation outranks judge availability; the judge gets retries, and an outage merely delays scoring (the claim-then-judge sweep catches up).

## Proof (chaos tests, 2026-07-27)
- Single-site outage (WF-04): fallback fired; `qualifier_reasons` logged as gpt-4o-mini, fallback_used=true, exact OpenAI tokens; pipeline continued correctly.
- **Total outage** (all six Gemini URLs broken): a fresh lead ran end-to-end entirely on gpt-4o-mini — all hops schema-valid, recommendations still SQL-grounded (grounding is enforced by SQL allow-listing + re-verification, not by the model), lead reached PENDING_APPROVAL.
- Restore + control lead: back on Gemini, fallback_used=false.
- Primary-path regression after the rewiring: classification 10/10, extraction 98.4%, 0 hallucinated. *(Historical figure, as reported at the time — the harness's row sampling was later found nondeterministic; see BUG-010. The reproducible baseline is the 2026-07-30 spread: 92–97%, median 95.3%.)*

## Consequences
- Model outage now degrades quality marginally instead of stopping the funnel; the degradation is visible (fallback_used, Langfuse model split), not silent.
- Fallback output quality is slightly below Gemini Flash; acceptable for a rarely-fired path, and the judge grades fallback artifacts like any others.
