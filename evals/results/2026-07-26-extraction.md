# Eval result: extraction — 2026-07-26

**Workflow:** VaibhavCapstone-03-ClassifyExtract (prompt v2) · **Model:** gemini-2.5-flash · **Scope:** 8 ENQUIRY-labeled emails × 8 fields

**Field accuracy: 59/64 = 92.2%** (threshold ≥90%)
**Hallucinated fields: 1** (threshold 0 — automatic fail if any): seed-email-10.urgency="low"

## Mismatches / review items
| Email | Field | Expected | Got | Verdict |
|---|---|---|---|---|
| seed-email-04 | urgency | medium | low | wrong |
| seed-email-05 | budget_currency | INR | Rs | wrong |
| seed-email-07 | urgency | medium | low | wrong |
| seed-email-10 | urgency | null | low | HALLUCINATED |
| seed-email-10 | product_interest | [] | ["furniture"] | wrong |



## Verdict: FAIL