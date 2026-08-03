# PRD-E23: Returning-customer detection & personalization
**Status:** Approved
**Date:** 2026-08-03

## Problem
`docs/domain.md` already distinguishes **Customer** from **Lead** — "NOT the
same as Customer — one Customer could produce multiple Leads" — but no
persistent Customer record has ever been built; the distinction exists only
in the vocabulary, not the schema. Every enquiry is treated as if from a
stranger. A contact who reached out weeks, months, or years ago and comes
back gets no acknowledgement, and nothing in the database distinguishes them
from a first-time enquiry — losing a personalization opportunity and a
business signal (how many contacts come back, one proxy for satisfaction).

The system has no purchase/order-completion tracking (state machine tops
out at `SENT`/`APPROVED`/`REJECTED`, `db/001_schema.sql`) — "returning"
here means *the same contact reached out before*, not *confirmed they
bought before*. Building purchase/conversion tracking is a separate,
larger effort and explicitly out of scope.

## Goals / Non-goals
**Goals:** durably record that a contact (`from_email`, scoped to one
Business) has enquired before; stamp new leads from a known contact as
returning; let the drafted reply acknowledge that appropriately.

**Non-goals:** purchase/conversion tracking. Weekly Insights reporting on
repeat-contact rate (natural follow-on, deliberately deferred to its own
future story so this epic stays shippable). Fuzzy identity matching (phone,
name) — `from_email` exact match only, for now.

## Who this is for
**Sales Rep** (treats a returning contact differently) and **Sales
Manager** (repeat-contact rate is a trust signal, even before it's surfaced
in Insights) — `docs/domain.md`.

## Proposed scope → stories
- E23-S1: Customer identity table + detection at intake.
- E23-S2: Drafted replies acknowledge a returning customer, personalized
  within the tenant's configured tone.

## Success criteria
A second enquiry from the same `from_email` at the same Business is
stamped `is_returning_customer = true` and linked to the prior lead;
`vaibhavcapstone_customers` correctly counts enquiries per contact; the
drafted reply for a returning customer visibly (but not fabricated-ly)
acknowledges the relationship.

## Open questions
- A tenant-configurable qualifier scoring bonus for returning customers is
  a natural fit (`businesses.config.scoring.weights` already supports
  per-tenant weight categories) but is **not** committed to this epic — a
  stretch goal, revisit as its own story if wanted after E23 ships.
- Matching key is `from_email`, not the LLM-extracted `contact_email` (which
  may differ and isn't available until after classification) — deliberate,
  so detection can happen deterministically at intake, before any LLM call.
