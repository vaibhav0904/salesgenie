# E16-S1: The pipeline survives a model outage

**As an** operator
**I want** every pipeline LLM call to fall back to gpt-4o-mini when Gemini fails
**So that** a vendor outage degrades quality slightly instead of stopping the business.

## Acceptance criteria
- [ ] All 6 pipeline call sites: Gemini error → OpenAI gpt-4o-mini with the same prompts; merge node normalizes both vendors; parsers unchanged.
- [ ] Telemetry honest: llm_calls rows carry the real model, fallback_used, per-model cost; Langfuse prices gpt-4o-mini generations.
- [ ] Judge deliberately excluded (doer≠grader) — recorded in ADR-0013.
- [ ] Chaos tests pass: single-site outage, full outage E2E (still SQL-grounded), restore + control lead on Gemini.
- [ ] Eval regression green on primary path; exports refreshed + scanned.

## Eval gate
- chaos test results + seed-replay regression in the outcome note

## Outcome (2026-07-27)
Done. All 6 pipeline call sites now carry the fallback pair: Gemini (onError→error branch) → `OpenAI Fallback <site>` (gpt-4o-mini, same system+user prompts, json_object mode) → `LLM Result <site>` merge node normalizing both vendors; parsers untouched. Telemetry truthful end-to-end: `llm_calls.model/fallback_used/cost` computed from the model that ran; Langfuse prices gpt-4o-mini via its own model entry; judge telemetry also fixed to `usage_source='exact_api'`.
**Chaos evidence:**
- Single-site (WF-04 URL broken): `qualifier_reasons` → gpt-4o-mini, fallback_used=t, exact tokens, coherent reasons; downstream continued correctly (the NEEDS_REVIEW it hit was the *designed* budget-below-catalog path — ₹40k budget vs ₹58,999 cheapest bed — not a fallback defect).
- **Total outage** (all 6 URLs broken): fresh lead ran E2E entirely on gpt-4o-mini — 4/4 hops schema-valid, recommendations SQL-grounded (CHR-001/2/3), reached PENDING_APPROVAL; Langfuse trace priced all 4 generations as gpt-4o-mini.
- Restore + control: back on Gemini, fallback_used=f.
- Regression (full seed replay): classification 10/10, extraction 98.4%, 0 hallucinated. Judge scored the fallback draft 5/5.
- Judge deliberately has NO fallback (doer≠grader) — ADR-0013. Exports refreshed, scan clean (no chaos leftovers).
