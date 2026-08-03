# E23-S1: Customer identity table + detection at intake

**As a** Sales Manager
**I want** the system to durably recognize when a contact has enquired before
**So that** repeat contacts are visible in the data, not lost as identical-looking first-time enquiries

## Acceptance criteria
- [ ] New `vaibhavcapstone_customers` table: composite key
      (`business_id`, `from_email`), `first_seen_at`, `last_seen_at`,
      `enquiry_count`.
- [ ] 01-Intake upserts this table for every lead (increment
      `enquiry_count`, bump `last_seen_at`) — deterministic, before any LLM
      call, so detection never depends on extraction succeeding.
- [ ] Every new lead is stamped `is_returning_customer` (true when
      `enquiry_count > 1` after the upsert) and `previous_lead_id` (the
      contact's most recent prior lead at this business, null if none).
- [ ] A brand-new contact: `is_returning_customer = false`,
      `previous_lead_id = null`, `enquiry_count = 1`.
- [ ] A contact's second-ever enquiry, at the same business, any time later
      (tested with a synthetic gap, not literally weeks/months/years):
      `is_returning_customer = true`, correct `previous_lead_id`.
- [ ] A contact enquiring at a **different** business is treated as
      unrelated — `vaibhavcapstone_customers` is scoped per `business_id`,
      matching the platform's tenant-isolation convention.

## Depends on
- -

## Eval gate
- none — verified via `.tests.md` + UAT (replay the same `from_email`
  through intake twice, confirm the stamps)

## Technical notes
- Matching key is `from_email` (available at 01-Intake, deterministic),
  **not** the LLM-extracted `contact_email` — deliberate, per PRD-E23.
- This table is independent of E22's `vaibhavcapstone_messages` — E23 does
  not require E22 to be built first, though both touch the intake path and
  should be reviewed together for conflicts when both are in flight.
- Lay the groundwork cleanly for a possible future Weekly Insights
  repeat-contact metric (explicitly deferred, not this story) — don't
  design the table in a way that would need reshaping for that later.
