# E5-S1: Customers are offered real, in-stock products that fit their ask

**As a** Customer
**I want** the products suggested to me to actually exist, be in stock, and match my need and budget
**So that** the first reply I get is useful, not a generic brochure.

## Acceptance criteria
- [ ] `VaibhavCapstone-05-Recommender` selects 1–3 products for each QUALIFIED lead using the Business's catalog queried from Postgres (grounding source).
- [ ] Every recommended SKU is hard-verified by SQL: exists, in stock. A failed verification drops the item; zero survivors → E5-S2 path.
- [ ] Each item carries a one-line rationale tied to extracted facts (budget, category, quantity).
- [ ] Grounding rate on seed set = 100% (`evals/cases/grounding.md`); relevance spot-checked against labeled plausible SKUs.
- [ ] Lead status → RECOMMENDED; recommendations row + event written.

## Depends on
- E4-S1

## Eval gate
- evals/cases/grounding.md

## Technical notes
- Pattern: SQL pre-filter (category/price window) → Gemini ranks/justifies from ONLY those rows → SQL post-verify. The LLM never sees products it isn't allowed to pick.

## Outcome (2026-07-26)
- VaibhavCapstone-05-Recommender (id w5EsrbELebUE2ibV) live; WF-04 hands off via Envelope. Export in n8n/workflows/.
- Three grounding layers: SQL candidate pre-filter (in-stock, interest tokens, budget window; bulk budgets uncapped per-item) -> Gemini ranks ONLY candidates -> allowed-SKU filter -> SQL re-verify at persist.
- EVAL PASS (evals/results/2026-07-26-grounding.md): 11/11 SKUs independently verified in-stock (100%); relevance 5/5 plausible-set hits; out-of-stock BED-001/SOF-003 never recommended (BED-002 substitution proven).
