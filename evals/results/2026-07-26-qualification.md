# Eval result: qualification — 2026-07-26

**Workflow:** VaibhavCapstone-04-Qualifier · **Scoring:** deterministic rubric from `businesses.config.scoring` (Gemini writes reasons only) · **Scope:** 7 qualified ENQUIRY-labeled leads (seed-email-10 parks in NEEDS_REVIEW before qualification, per its label)

| Email | Expected band | Got | Score | Verdict |
|---|---|---|---|---|
| seed-email-01 | HOT | HOT | 100 | PASS |
| seed-email-02 | HOT | HOT | 95 | PASS |
| seed-email-03 | WARM | WARM | 45 | PASS |
| seed-email-04 | WARM | WARM | 45 | PASS |
| seed-email-05 | COLD | WARM | 40 | FAIL (adjacent) |
| seed-email-06 | HOT | HOT | 100 | PASS |
| seed-email-07 | WARM | WARM | 55 | PASS |

**Band agreement: 6/7 = 85.7%** (threshold ≥80%) · **Labeled-HOT scored COLD: none** (automatic-fail condition not triggered)

## Miss analysis
seed-email-05 scored exactly warm_min (40): rubric 15 base + 10 name + 20 interest + 25 budget − 40 below-catalog-budget + **10 urgency-medium**. The urgency extraction (medium vs labeled low) is the tolerated extraction-eval miss cascading here; with urgency low the rubric yields 30 → COLD as labeled. Fix path (not required to pass): tighten urgency prompt further or lower urgency_medium weight — deferred, noted in assumptions.

## Reasons audit (no-invented-facts rule)
Spot-checked all 7: every reason references facts present in the extraction or rubric factors (Zenith Works B2B, ₹90,000 fits catalog, dining interest, out-of-stock-agnostic bed interest, Green Spaces landscaping). **Zero invented facts.**

## Verdict: PASS
