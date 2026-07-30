# E1-S2: Every fact the platform knows has one home

**As an** Operator
**I want** the full multi-tenant schema migrated
**So that** every workflow reads/writes one system of record and no state hides inside n8n.

## Acceptance criteria
- [ ] Migration SQL in `db/` creates all `vaibhavcapstone_*` tables: businesses, products, leads, extractions, qualifications, recommendations, drafts, events, insights.
- [ ] Lead + draft status columns constrained to the state machines in `docs/contracts.md` (CHECK constraints).
- [ ] All tenant tables keyed by `business_id` with FK to businesses.
- [ ] Migration is idempotent (safe to re-run) and documented.

## Depends on
- E1-S1

## Eval gate
- none

## Technical notes
- `setup_state` jsonb on businesses; `config` jsonb for tone/currency/reviewer/sender/scoring weights.

## Outcome (2026-07-26)
- db/001_schema.sql: 9 vaibhavcapstone_* tables + indexes, draft state-machine trigger, live setup_state view. Applied twice (idempotent, clean second run).
- Trigger verified: DRAFT->SENT rejected; DRAFT->PENDING_APPROVAL->APPROVED->SENT allowed (test data rolled back).
