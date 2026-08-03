# E22-S2: A reply reopens the same lead, instead of creating a duplicate

**As a** Sales Rep
**I want** a customer's reply on an existing thread to continue their existing lead
**So that** I only ever work one active conversation per customer, never a fork of duplicates

## Acceptance criteria
- [ ] When an inbound email's `In-Reply-To`/`References` header matches a
      prior `OUTBOUND` message's `message_id_header` (E22-S1), the new
      message is attached to that **same** `lead_id` — no new lead row is
      created.
- [ ] The lead re-enters the pipeline with the reply as new input (exact
      re-entry stage decided during build — classify first, or resume
      later — document whichever is chosen in this card's Outcome).
- [ ] A reply to a lead that's already `SENT` correctly reopens it (moves
      off the terminal status) rather than being silently dropped or
      creating an orphaned second lead.
- [ ] The self-send guard (BUG-001) is verified to still hold: our own
      outbound send, when it lands back in the inbox, is never
      mis-correlated as "a customer reply."
- [ ] An email with no matching `In-Reply-To` (a genuinely new enquiry)
      is unaffected — still creates a new lead exactly as today.

## Depends on
- E22-S1

## Eval gate
- none — verified via `.tests.md` + UAT (real reply on a real sent thread,
  confirm same `lead_id`, confirm a fresh unrelated email still creates a
  new lead)

## Technical notes
- This is the highest-risk story in the epic: it changes what "a new
  inbound email" means for every lead that's already reached a terminal or
  near-terminal status. Review `docs/contracts.md`'s state machine before
  building — reopening from `SENT`/`REJECTED`/`NEEDS_REVIEW` may need a
  guarded transition, same pattern as the existing draft-status trigger in
  `db/001_schema.sql` (`vaibhavcapstone_draft_transition_guard`).
- Update `docs/domain.md`'s Lead definition once behavior lands (see
  E22-S1's note) if not already done there.
