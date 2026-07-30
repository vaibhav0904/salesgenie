# E3-S2: Contact details type themselves

**As a** Sales Rep
**I want** name, email, company, budget, product interest and urgency pulled from each enquiry
**So that** I never hand-type contact details into a spreadsheet again (and nothing gets mistyped or lost).

## Acceptance criteria
- [ ] For every ENQUIRY lead, an extractions row: contact_name, contact_email, company, budget (value+currency, nullable), product_interest[], urgency, location — nulls allowed, hallucinated values not.
- [ ] Missing fields stay null; the prompt forbids guessing (grounding rule).
- [ ] Lead status → EXTRACTED; event logged with trace_id.
- [ ] Field-level extraction accuracy on the labeled seed set meets `evals/cases/extraction.md` threshold.

## Depends on
- E3-S1

## Eval gate
- evals/cases/extraction.md

## Technical notes
- Replaces the manual Excel + LinkedIn-lookup step from the problem statement; enrichment beyond the email body is explicitly out of scope for MVP (assumption to document).

## Outcome (2026-07-26)
- Implemented inside WF-03 (single Gemini call with E3-S1, as planned in that story TN).
- Extraction rows for every ENQUIRY lead; nulls stay null; grounding rule enforced by prompt + eval.
- EVAL PASS (evals/results/2026-07-26-extraction.md): field accuracy 61/64 = 95.3% (threshold 90%), hallucinated fields 0 (hard requirement). Remaining 3 misses are adjacent urgency judgment calls (medium<->low), documented.
- Eval runner reusable at evals/run-evals.js. LinkedIn-style enrichment beyond the email explicitly out of scope (assumption).
