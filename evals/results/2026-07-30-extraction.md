# Eval result: extraction — 2026-07-30

**Workflow:** VaibhavCapstone-03-ClassifyExtract (prompt v2) · **Model:** gemini-2.5-flash · **Scope:** 8 ENQUIRY-labeled emails × 8 fields

**Field accuracy: 62/64 = 96.9%** (threshold ≥90%)
**Hallucinated fields: 0** (threshold 0 — automatic fail if any): none

## Mismatches / review items
| Email | Field | Expected | Got | Verdict |
|---|---|---|---|---|
| seed-email-07 | urgency | medium | low | wrong |
| seed-email-07 | product_interest | ["outdoor"] | ["gazebos","pergolas"] | manual-review |

### Manual semantic review
- seed-email-07: expected ["outdoor"] vs got ["gazebos","pergolas"]

## Verdict: PASS