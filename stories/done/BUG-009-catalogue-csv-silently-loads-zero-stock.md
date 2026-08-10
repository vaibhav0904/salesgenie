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

---

## Fixed 2026-08-10 — product fix, not just the script

Deployed to `VaibhavCapstone-08-MCPOnboarding`; three nodes changed.

**`Parse + Validate Catalog`**
- Stock is read from any of `stock_qty`, `stock`, `qty`, `quantity`, `stock_quantity`,
  `available`, `units` — first one present wins, and the response says which was used.
- Columns that are still unrecognised are returned as `ignored_columns` with a warning.
  This is the general lesson from the bug: an import that discards what the caller
  supplied has to admit it. Silence was the defect; the column name was only the trigger.
- If every valid row loads with stock 0, it says so outright — that is nearly always an
  import mistake rather than a sold-out shop, and it used to be indistinguishable from
  success until the first enquiry came up empty.

**`Catalog Result`** surfaces `warnings`, `ignored_columns` and `stock_column_used` in the
tool response, so the fix is visible to whoever uploaded rather than buried in the run.

**`Upsert Products`** — the `catalog_size` note in Related is fixed in the same pass. The
count read the products table as it looked *before* the statement, so a first upload always
reported 0; it now counts the union of what was there and what was just written.

### Verified

20 checks against the parsing code outside n8n (every alias, the ignored-column report, the
all-zero warning, and that rejection rules and the `items[]` path are unchanged), then live
against the running instance with the bug's own scenario:

```json
{"ok":true,"upserted":"2","catalog_size":"2","stock_column_used":"stock",
 "ignored_columns":["warehouse_bin"],
 "warnings":["ignored column(s) not recognised: warehouse_bin. Nothing from them was stored."]}
```

Rows landed as stock 40 and 7 — both would previously have been 0. `catalog_size` reporting
2 rather than 0 confirms the second fix. The throwaway tenant was removed afterwards.

Docs updated: the guide and README no longer warn about a header that now works.
