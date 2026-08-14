# Eval result: extraction — 2026-07-26

> **This file no longer holds the 26 July run.** The harness hardcoded its output date, so a
> re-run on 30 July overwrote it and there was no git history yet to recover from — that is
> BUG-010's collateral damage, recorded in `stories/done/BUG-010-eval-harness-graded-an-arbitrary-run.md`.
> What remains below is one 30 July run: 92.2%, one hallucinated field, FAIL.
>
> **For the reproducible figure, read [`2026-07-30-extraction-spread.md`](2026-07-30-extraction-spread.md)**
> — five full replays, 92.2–96.9%, median 95.3%. This file is kept rather than deleted
> because the loss is part of the record.

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