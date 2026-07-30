# BUG-009: A catalogue CSV with a `stock` column silently loads every product out of stock

**Severity:** high for a new tenant — the business appears to onboard successfully, then can never recommend anything. Nothing reports an error at any point.

**Status:** the demo script is fixed (uses `stock_qty`). The **product defect is open** — deliberately not changed before the video recording, because it means editing, redeploying and re-exporting WF-08.

## Symptom
A brand-new tenant uploads an 8-product catalogue by chat. `upload_catalog` reports success:

```json
{"ok":true,"business_id":"biz_greenthumb","upserted":"8","rejected_rows":[],"note":"all rows loaded"}
```

`get_setup_status` then confirms **"catalog: 8 products, configured: true"**, and every pipeline stage unlocks. Everything says the business is ready.

But the first enquiry ends in `NEEDS_REVIEW`:

```
"reason": "no_grounded_option",
"detail": "no in-stock catalog item matches the requested interest: [\"planters\",\"soil\",\"outdoor\"]"
```

— for a catalogue that plainly contains four planters and a bag of soil.

## Root cause
`Parse + Validate Catalog` (WF-08) reads the stock column by exact name:

```js
stock_qty: o.stock_qty === '' || o.stock_qty == null ? 0 : Math.max(0, ...)
```

The CSV header in the old demo script was `stock`, not `stock_qty`. `o.stock_qty` is therefore `undefined` on every row, and each product silently loads with **stock 0**:

```
 GRD-001 | Large Terracotta Planter 18 inch | planters | 1499.00 |  0
 GRD-002 | Cedar Raised Planter Box         | planters | 3299.00 |  0
 …
```

The recommender then behaves **correctly** — it refuses to offer anything out of stock, which is the platform's headline guardrail. The failure is upstream, in silent data loss during import.

Validation only rejects rows missing `name`, `category` or `price`. An unrecognised column is neither used nor reported, so `rejected_rows` is empty and the operator is told everything loaded.

This was never caught before because earlier tests of `upload_catalog` passed `items[]`, which carries `stock_qty` explicitly. **The CSV path in the script had never actually been run.**

## Fix applied (script only)
`presentation/video-script.md` now uses the header `stock_qty`, with a red warning box explaining the consequence of getting it wrong, and a note that product names must not contain commas (the parser splits on them).

Verified: with the corrected header, the same enquiry resumes to `PENDING_APPROVAL`, HOT 100, grounded, recommending Premium Potting Soil ₹649, Cedar Raised Planter Box ₹3,299 and Vertical Herb Garden Wall Frame ₹2,499.

## Proposed product fix (not yet done)
In `Parse + Validate Catalog`:

1. Accept `stock`, `stock_qty`, `qty` and `quantity` as aliases for the stock column.
2. Report unrecognised CSV headers back in the response, so an operator sees `"ignored_columns": ["stock"]` instead of silence.
3. Consider warning when **every** row in an upload has zero stock — that is almost always an import mistake, not a catalogue where everything is sold out.

Item 2 is the general lesson: an import that discards a column the user supplied should say so. Items 1 and 2 are a few lines in one Code node; the risk is not the change but the redeploy + re-export + re-zip cycle, which is why it is queued rather than done.

## Related
`catalog_size` in the same tool's response always reports the count **before** the insert (0 on a first upload), because the CTE reads the pre-insert snapshot. Cosmetic — `upserted` is correct — but worth fixing in the same pass.
