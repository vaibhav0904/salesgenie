# E6-S2: Nothing reaches a customer unless I approved it — from my inbox

**As a** Reviewer (Sales Rep)
**I want** each draft emailed to me with approve/reject links, and sending to happen only on approve
**So that** I keep full control of what customers see without logging into any tool.

## Acceptance criteria
- [ ] PENDING_APPROVAL drafts are emailed to the Business's reviewer with the draft body + lead context + approve/reject links (n8n wait-for-approval).
- [ ] Approve → draft APPROVED → customer email sent via the Business's sender identity → SENT; lead → SENT; events log the human actor.
- [ ] Reject → REJECTED (terminal), lead closed with reason; nothing sent.
- [ ] The send node is unreachable except from APPROVED — verified by attempting a manual bypass in testing.
- [ ] State transitions enforced in Postgres (stale/double decision → no-op with logged warning, no double-send).

## Depends on
- E6-S1

## Eval gate
- none

## Technical notes
- This is the platform's hardest guardrail; the DB-level state machine is the enforcement, workflow branching is just UX.

## Outcome (2026-07-26)
- Full HITL verified with REAL human decisions (reviewer reviewer@example.com):
  - 6 drafts approved via inbox buttons -> Postgres-guarded PENDING_APPROVAL->APPROVED -> customer email sent (demo-redirected, intended recipient in EMAIL_SENT event) -> draft+lead SENT.
  - 1 draft (Deepak Verma test lead) rejected -> draft+lead REJECTED, decided_by recorded, ZERO send events.
- End-to-end auto-chain proven on a fresh webhook enquiry: RECEIVED->CLASSIFIED->QUALIFIED(HOT)->GROUNDED->DRAFT in 19s with correct wardrobe+TV picks within combined budget.
- Race/stale-decision guard proven: second decision on a decided draft updates 0 rows (no double-send possible). Send node reachable only after the DB transition (trigger tested in E1-S2).
- MCP approval surface (E6-S3) pending E8; the shared guarded UPDATEs make both surfaces race-safe by construction.
