# E4-S1: The hottest leads surface themselves, with reasons

**As a** Sales Rep
**I want** every lead scored and banded HOT/WARM/COLD with human-readable reasons
**So that** I always work the most valuable lead next instead of guessing.

## Acceptance criteria
- [ ] `VaibhavCapstone-04-Qualifier` produces score 0–100, band, reasons[] for every EXTRACTED lead.
- [ ] Scoring uses the Business's config (weights/thresholds from `businesses.config`) — Oak & Ember's defaults documented; a different tenant's config changes the outcome with zero workflow edits.
- [ ] Reasons reference concrete extracted facts ("budget ₹80k stated", "bulk order of 40 desks"), not vibes.
- [ ] Band agreement with labeled seed set meets `evals/cases/qualification.md` threshold.
- [ ] Lead status → QUALIFIED; event logged.

## Depends on
- E3-S2

## Eval gate
- evals/cases/qualification.md

## Technical notes
- Hybrid model: deterministic weighted rubric computed in SQL/Code node + Gemini for reasons and tie-band adjustment (keeps scores auditable, prose humane). Default weights = a TBD resolved in this story's implementation and recorded in an ADR if it hardens.

## Outcome (2026-07-26)
- VaibhavCapstone-04-Qualifier (id cm1UubLPPirEAUyy) live; WF-03 calls it for EXTRACTED leads via Envelope. Exports updated.
- Hybrid design: deterministic rubric (weights+thresholds from businesses.config.scoring - tenant-tunable, platform defaults in code) -> score 0-100 + band; Gemini writes 2-4 prose reasons referencing only provided facts, with a rubric-breakdown fallback so qualification never blocks on the LLM.
- Rubric factors: base enquiry, contact name, product interest, budget stated, budget-fits-catalog bonus / below-catalog penalty, urgency (time-pressure), B2B company.
- EVAL PASS (evals/results/2026-07-26-qualification.md): band agreement 6/7 = 85.7% (>=80%), no HOT->COLD miss, zero invented facts in reasons. Single miss traced to tolerated urgency extraction miss (documented).
