# E1-S3: Oak & Ember exists with a real catalog and a week of enquiries

**As a** Sales Rep at Oak & Ember
**I want** my business fully configured with our catalog, and realistic sample enquiries available
**So that** the pipeline can be demonstrated end-to-end on believable data.

## Acceptance criteria
- [ ] Seed SQL creates `biz_oakember`: profile (furniture retail, India, INR, tone), reviewer email, sender identity — setup_state fully green.
- [ ] ~20-item furniture catalog (sofas, desks, chairs, storage; mixed price points; ≥2 items out of stock) in products + `data/catalog-oakember.csv`.
- [ ] 8–10 dummy enquiry emails in `data/seed-emails/` as replayable JSON: happy paths + edge cases (vague budget, non-enquiry, spam, out-of-stock ask, bulk B2B ask).
- [ ] Every seed email has expected labels (classification, entities, band, plausible SKUs) in `evals/datasets/seed-emails-labeled.json`.

## Depends on
- E1-S2

## Eval gate
- none (this story CREATES the eval dataset)

## Technical notes
- Tenant B is deliberately NOT seeded — it is born later via MCP (E8).

## Outcome (2026-07-26)
- db/002_seed_oakember.sql applied (idempotent upserts): biz_oakember with full config (tone, INR, reviewer/sender/intake = reviewer@example.com, scoring weights + HOT>=70/WARM>=40 thresholds); vaibhavcapstone_setup_state all green.
- 20-product catalog (2 out-of-stock: SOF-003, BED-001; cheapest BSH-002 @ 4499) in DB + data/catalog-oakember.csv.
- 10 seed emails in data/seed-emails/ (2 HOT B2C, 1 HOT B2B bulk, 2 WARM, 1 COLD-below-budget, 1 out-of-stock substitute, 1 off-catalog, 1 NOT_ENQUIRY, 1 SPAM, 1 gibberish) — all JSON-valid.
- Ground-truth labels in evals/datasets/seed-emails-labeled.json, written before any prompt exists.
