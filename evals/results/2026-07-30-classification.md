# Eval result: classification — 2026-07-30

**Workflow:** VaibhavCapstone-03-ClassifyExtract (prompt v2) · **Model:** gemini-2.5-flash · **Dataset:** seed-emails-labeled.json (10)

| Email | Expected | Got | Lead status | Verdict |
|---|---|---|---|---|
| seed-email-01 | ENQUIRY | ENQUIRY | PENDING_APPROVAL | PASS |
| seed-email-02 | ENQUIRY | ENQUIRY | PENDING_APPROVAL | PASS |
| seed-email-03 | ENQUIRY | ENQUIRY | PENDING_APPROVAL | PASS |
| seed-email-04 | ENQUIRY | ENQUIRY | PENDING_APPROVAL | PASS |
| seed-email-05 | ENQUIRY | ENQUIRY | NEEDS_REVIEW | PASS |
| seed-email-06 | ENQUIRY | ENQUIRY | PENDING_APPROVAL | PASS |
| seed-email-07 | ENQUIRY | ENQUIRY | NEEDS_REVIEW | PASS |
| seed-email-08 | NOT_ENQUIRY | NOT_ENQUIRY | DISCARDED_NOT_ENQUIRY | PASS |
| seed-email-09 | SPAM | SPAM | DISCARDED_SPAM | PASS |
| seed-email-10 | ENQUIRY | ENQUIRY | NEEDS_REVIEW | PASS |

**Score: 10/10** (threshold ≥9/10) · **SPAM recall:** 100% (threshold 100%)

## Verdict: PASS

Notes: seed-email-10 (gibberish) correctly routed to NEEDS_REVIEW via confidence 0.4 < 0.6 threshold — counted as correct ENQUIRY classification per label; routing behaviour matches expected_terminal_status.