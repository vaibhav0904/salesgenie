# BUG-003: Plural interest tokens never match singular product names

**Found:** 2026-07-26, during E12-S3 (buyer-agent demo, tenant B).

## Symptom
An A2A enquiry for "hardcover notebooks or journals" to Page & Bind Books produced
`RECOMMENDATION_NO_GROUNDED` → NEEDS_REVIEW, even though **STA-001 "Leather Journal A5"**
is in stock. The A2A layer reported it honestly (`working` + explanation), and the
no-invention guardrail held — but a valid match was missed.

## Root cause
WF-05 "Fetch Lead + Grounded Candidates" matches interest tokens with
`p.name ILIKE '%' || tok || '%'`. Extracted interests are usually plural
("journals", "chairs"); catalog names are singular ("Leather Journal A5").
`%journals%` cannot match "Journal". The eval normalizer stems plurals; the SQL didn't —
which is why the grounding eval (16/16) never caught it: its fixtures happened to
use tokens that appear verbatim in names/categories.

## Fix
Strip a trailing `s` from each token at match time (candidate *selection* only —
SKU *verification* is untouched, so grounding guarantees are unchanged):
`ILIKE '%' || regexp_replace(tok, 's$', '') || '%'` on both name and category.

## Acceptance
- [ ] Tenant B demo enquiry ("notebooks or journals") grounds STA-001 and reaches the approval gate.
- [ ] Grounding eval still 16/16 (no regression).
- [ ] WF-05 export updated.

## Outcome (2026-07-26)
Fixed in WF-05 "Fetch Lead + Grounded Candidates": tokens stemmed with `regexp_replace(tok, 's$', '')` at candidate-selection time only; SKU verification untouched. All acceptance met:
- Tenant B rerun grounded STA-001 Leather Journal A5, reached the approval gate, and completed with the artifact after a human Approve.
- Regression: 25/25 recommended items (all tenants, incl. A2A) still SQL-verified; off-catalog tokens (gazebos/pergolas) still zero candidates; classification/extraction evals green.
- Export refreshed. (Meta: the first fix attempt hit the documented String.replace `$'` footgun — recovered via wholesale query rewrite from a clean script.)
