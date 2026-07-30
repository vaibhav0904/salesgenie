# E8-S2: My product catalog goes in through the same conversation

**As an** Operator
**I want** to hand over my product list (CSV or pasted text) in chat and have it become my catalog
**So that** recommendations can be grounded on what I actually sell.

## Acceptance criteria
- [ ] `upload_catalog(business_id, items|csv)` MCP tool inserts/updates products rows (upsert by SKU).
- [ ] Accepts structured JSON items AND a CSV string; malformed rows are reported back per-row, valid rows still load.
- [ ] Missing SKUs are auto-generated deterministically; prices/stock validated as numbers.
- [ ] Setup state flips `catalog: true` when ≥1 product exists; parked leads gated on catalog reprocess (E8-S4).

## Depends on
- E8-S1

## Eval gate
- none

## Technical notes
- The chat client can transform a messy free-text list into the tool's item schema — that's the "natural language" magic; the tool itself stays strict.

## Outcome (2026-07-26)
- upload_catalog accepts items[] OR csv string; SKUs auto-generated when absent; prices/stock coerced and validated.
- Verified with a 9-row CSV containing one malformed row: 8 valid rows upserted, bad row returned in rejected_rows with reason ("missing name"), catalog_size reported. Re-running is idempotent (upsert by business_id+sku).
- Setup state flips catalog=true automatically (computed from product count) and parked leads resume (E8-S4).
