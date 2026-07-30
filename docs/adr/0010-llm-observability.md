# ADR 0010 — LLM observability: Postgres tables + sweeper judge, not a SaaS

**Status:** accepted, amended by ADR-0012 (token estimates replaced by exact API usage; Langfuse added as the observability lens) · **Date:** 2026-07-26

## Context
Six Gemini call sites run unobserved beyond the `events` audit trail. We need per-call latency/tokens/cost/validity and an instruction-adherence signal (LLM-as-judge). Options: an observability SaaS (Langfuse/LangSmith-style), n8n execution-log mining, or first-class rows in our own Postgres.

## Decision
1. **`vaibhavcapstone_llm_calls`** — one row per LLM call, written by a `continueOnFail` logging node at each call site (observability may fail; the pipeline may not). Latency via a `__t0` stamp in the preceding node; tokens from Gemini `usageMetadata`; cost notional from price constants.
2. **`vaibhavcapstone_judge_scores`** — an **OpenAI** judge (different family than the Gemini doer → no self-preference bias) scores extractions, drafts and reasons via a 30-minute claim-then-judge sweeper (`VaibhavCapstone-12`), never inline.
3. **Prompt versions** are explicit strings recorded on every call.
4. Full plan and capture matrix: `docs/traceability.md` (written before instrumentation).

## Consequences
- Metrics live next to the data they describe: one SQL join answers "what did the AI do to this lead and was it faithful?" — consistent with the insights traceability rule.
- Free and local; no data leaves the stack except the judge's OpenAI calls (which see only what the original call saw).
- We own the dashboards (weekly AI-health section) instead of getting a vendor UI; acceptable at this scale.
- Judge scores are a monitoring signal, not ground truth — the labeled eval set remains the quality gold standard.
