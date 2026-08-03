# E23-S2: Drafted replies acknowledge a returning customer

**As a** Sales Rep
**I want** the AI's draft to acknowledge, appropriately, that a contact has reached out before
**So that** replies feel personal and consistent with the relationship, not generic every time

## Acceptance criteria
- [ ] When `is_returning_customer = true` (E23-S1), 06-DraftHITL's prompt
      receives that signal plus minimal prior-context (e.g. the previous
      lead's product-interest category) — not the full prior message body.
- [ ] The drafted reply for a returning customer visibly differs from a
      first-time draft (a warm acknowledgment), without fabricating
      specifics it wasn't given.
- [ ] The tenant's configured tone (`businesses.config.tone`) still governs
      voice — this is an addition to the existing drafting prompt, not a
      tone override.
- [ ] A first-time customer's draft is provably unaffected (no regression,
      no stray "welcome back" language).

## Depends on
- E23-S1

## Eval gate
- none at this stage — verified via `.tests.md` + UAT (one returning
  contact, one first-time contact, compare drafts side by side)

## Technical notes
- PII minimization hard rule: pass a category/summary, not raw past
  message text, into the prompt.
- Stretch goal (not this story, see PRD-E23 open questions): a
  tenant-configurable qualifier scoring bonus for returning customers,
  fitting the existing `businesses.config.scoring.weights` pattern.
