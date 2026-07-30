# E14-S1: Exact tokens at the source

**As an** operator watching AI spend
**I want** every LLM call's token counts and cost to come from the API's own usage metadata, not estimates
**So that** the AI-health numbers are facts, not approximations.

## Acceptance criteria
- [ ] All 6 Gemini call sites (WF-03 x2, WF-04, WF-05, WF-06, WF-07) call `generateContent` directly via HTTP Request with the existing googlePalmApi credential; prompts/model/config unchanged.
- [ ] `db/005_exact_usage.sql`: `usage_source` column; new rows = 'exact_api', history stays 'estimated'.
- [ ] Log nodes write exact prompt/candidates(+thoughts) tokens and recomputed cost.
- [ ] Eval regression green (behavior unchanged); fresh lead shows sane exact numbers.

## Technical notes
- Spike on WF-04 first; fallback = user pastes key into a header-auth credential.

## Outcome (2026-07-26)
Done. Spike proved `predefinedCredentialType: googlePalmApi` authenticates a raw HTTP call to `generateContent`, which returns exact `usageMetadata` (incl. `thoughtsTokenCount`). All 6 call sites swapped in place (same node names → wiring and `$()` references intact); prompts/system messages carried verbatim; `responseMimeType: application/json` preserves JSON mode. Parsers normalize `candidates[0].content`; Log nodes write exact prompt/candidates+thoughts tokens with `usage_source='exact_api'` (migration `db/005_exact_usage.sql`; 96 historic rows stay labeled 'estimated').
**Regression:** full 10-email seed replay through the swapped pipeline → classification 10/10, extraction 95.3%/0 hallucinated (identical to pre-swap); grounding re-join 39/39.
**The headline finding:** exact cost ≈ **$0.0069/lead** vs the old $0.00019 estimate — ~36× higher, because thinking tokens (invisible to estimates) dominate output. The user's push for exactness materially changed the number. All 5 exports refreshed.
