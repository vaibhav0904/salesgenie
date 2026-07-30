# E2-S1: An enquiry sent to the business is never lost

**As a** Customer
**I want** my enquiry to be captured the moment it reaches the business
**So that** I'm not waiting on someone to notice an inbox.

## Acceptance criteria
- [ ] `VaibhavCapstone-01-Intake` webhook accepts a normalized enquiry payload (channel, from_email, subject, body, received_at) + `business_id`.
- [ ] Valid payload → `vaibhavcapstone_leads` row in RECEIVED with raw payload stored, trace_id minted, RECEIVED event logged.
- [ ] Unknown `business_id` or malformed payload → 4xx + error event; nothing half-written.
- [ ] Replaying all seed emails lands one lead each, correctly normalized.

## Depends on
- E1-S3

## Eval gate
- none

## Technical notes
- Mints the Envelope (v1.0) and hands off to WF-03. Response returns lead_id + trace_id for testability.

## Outcome (2026-07-26)
- Workflow VaibhavCapstone-01-Intake (n8n id S9Foc6yGRWB6uGqk) built via n8n API, active. Export: n8n/workflows/VaibhavCapstone-01-Intake.json
- Flow: Webhook POST /webhook/vaibhavcapstone-intake -> Validate & Normalize (mints lead_id/trace_id) -> IF valid -> atomic CTE (verify business + insert RECEIVED lead + LEAD_RECEIVED event) -> 201. Invalid -> INTAKE_REJECTED event + 400. Unknown business -> INTAKE_UNKNOWN_BUSINESS event + 404. Postgres nodes retry (maxTries 3/2).
- Query params passed as array expression (immune to commas in email bodies - tested with comma-laden payload).
- Verified: all 3 paths return correct HTTP codes; all 10 seed emails replayed -> 10 RECEIVED leads with unique trace_ids and preserved received_at; events logged. Synthetic test rows cleaned up.
