# E9-S2: When the AI is unsure, a human decides

**As a** Sales Rep
**I want** leads the AI couldn't confidently process routed to me with context
**So that** automation failure degrades to manual work, never to wrong answers.

## Acceptance criteria
- [ ] Schema-invalid LLM output after one retry → lead NEEDS_REVIEW (not DEAD_LETTER — this is triage, not system failure).
- [ ] NEEDS_REVIEW leads notify the reviewer with the raw enquiry + what failed.
- [ ] NEEDS_REVIEW leads appear in `list_pending_approvals`-adjacent MCP visibility (`get_lead_status`, insights counts).
- [ ] The gibberish/ambiguous seed email lands in NEEDS_REVIEW in the demo.

## Depends on
- E9-S1, E3-S1

## Eval gate
- none

## Technical notes
- The line: DEAD_LETTER = the system broke; NEEDS_REVIEW = the system knows its limits (a guardrail, worth saying in the deck).

## Outcome (2026-07-26)
- VaibhavCapstone-11-NeedsReviewNotify (id uLxUljdVAobSBp6g) live: 10-minute sweeper + manual trigger. Chose a sweeper over an inline step so the lead pipeline stays fast and nothing is lost across restarts.
- Claim-then-notify pattern: the same UPDATE that selects a lead stamps review_notified_at, so a lead can never be emailed twice (verified: second sweep claimed 0, still 3 REVIEW_REQUESTED events). Tenants without a reviewer are skipped, not failed.
- Triage email carries the original enquiry, why the assistant stopped (no grounded match vs low confidence), and any internal note; it is never a customer email.
- Verified on all three NEEDS_REVIEW leads: seed-email-05 + 07 (no_grounded_option) and seed-email-10 (low_confidence, the gibberish case from E9-S2 acceptance).
