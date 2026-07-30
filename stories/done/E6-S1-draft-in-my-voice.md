# E6-S1: The reply is written for me, in my business's voice

**As a** Sales Rep
**I want** a ready-to-send reply drafted from the recommendation, in our tone
**So that** responding to a lead takes seconds of review, not twenty minutes of writing.

## Acceptance criteria
- [ ] `VaibhavCapstone-06-DraftHITL` generates a CUSTOMER draft from the recommendation using the Business's tone/persona config.
- [ ] Draft contains ONLY grounded facts: recommended SKUs/prices from the recommendations row; no invented discounts, stock claims, or dates.
- [ ] Draft stored with status DRAFT → PENDING_APPROVAL; revision number tracked; event logged.
- [ ] Same workflow with tenant B's tone config produces a visibly different voice (checked in Scenario B).

## Depends on
- E5-S1

## Eval gate
- none (spot-check for grounded-facts rule during review)

## Technical notes
- Prompt receives: extraction summary, recommendation items+rationales, business tone/sign-off. Nothing else.

## Outcome (2026-07-26)
- VaibhavCapstone-06-DraftHITL (id 6SDxlPJ5fU1PSwLB) live; WF-05 calls it for grounded RECOMMENDED leads. Export in n8n/workflows/.
- Gemini drafts from tone config + grounded facts only (PII minimized: model sees name + products, never email/location/raw body); deterministic template fallback so drafting never blocks on the LLM.
- 6/6 grounded leads produced CUSTOMER drafts in PENDING_APPROVAL; spot check (seed-email-02): real SKU names/prices, tenant sign-off, no invented discounts/dates. Tenant-B tone contrast deferred to Scenario B per acceptance.
- Demo note: config.customer_email_redirect reroutes approved sends to the operator inbox (seed customers are fictional); intended recipient recorded in EMAIL_SENT events. Gotcha logged: waiting executions are invisible to the n8n public API.
