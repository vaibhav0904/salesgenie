# E5-S2: The system is honest when it has nothing good to offer

**As a** Sales Rep
**I want** leads with no suitable catalog match flagged to me instead of papered over
**So that** customers never get a nonsense recommendation just to fill a template.

## Acceptance criteria
- [ ] When pre-filter + verification yield zero valid items, the Recommender returns `no_grounded_option` with the reason (e.g. "budget below cheapest desk", "asked for category we don't carry").
- [ ] The lead routes to NEEDS_REVIEW with an internal note draft (not a customer email).
- [ ] The out-of-stock and off-catalog seed emails exercise this path in the demo.

## Depends on
- E5-S1

## Eval gate
- evals/cases/grounding.md (fallback cases)

## Technical notes
- This is the grounding guardrail's user-visible half; the demo's "edge scenario".

## Outcome (2026-07-26)
- Implemented as the fallback path of WF-05: zero candidates OR zero verified survivors -> recommendations row grounded=false with explicit reason, INTERNAL note draft for the rep (with suggested actions), lead -> NEEDS_REVIEW, RECOMMENDATION_NO_GROUNDED event.
- Both fallback seed emails exercised it: seed-email-05 (budget below catalog) and seed-email-07 (off-catalog ask). No customer email was drafted for either. Eval section 2 = PASS.
