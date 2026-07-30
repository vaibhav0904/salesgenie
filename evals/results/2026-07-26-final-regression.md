# Final regression — 2026-07-26

Run after the complete build (11 workflows, 2 tenants), against `evals/datasets/seed-emails-labeled.json`.

| Eval case | Result | Threshold | Verdict |
|---|---|---|---|
| classification | 10/10; SPAM recall 100% | ≥9/10, SPAM 100% | **PASS** |
| extraction | 61/64 fields = 95.3%; **0 hallucinated** | ≥90%, 0 hallucinated | **PASS** |
| qualification | 6/7 band agreement = 85.7%; no HOT→COLD | ≥80%, no HOT→COLD | **PASS** |
| grounding | **16/16** recommended SKUs verified in-stock for their own tenant | 100% | **PASS** |

## Terminal states vs labels (tenant A seed set)
All 10 match their `expected_terminal_status`:

| Email | Expected | Actual |
|---|---|---|
| 01, 02, 03, 04, 06 | SENT | SENT |
| 05 (budget below catalog) | NEEDS_REVIEW | NEEDS_REVIEW |
| 07 (off-catalog ask) | NEEDS_REVIEW | NEEDS_REVIEW |
| 08 (vendor pitch) | DISCARDED_NOT_ENQUIRY | DISCARDED_NOT_ENQUIRY |
| 09 (lottery scam) | DISCARDED_SPAM | DISCARDED_SPAM |
| 10 (gibberish) | NEEDS_REVIEW | NEEDS_REVIEW |

## Tenant-agnosticism check
`grep -riE "biz_oakember|oak.?&.?ember|pagebind" n8n/workflows/` → **0 matches**. No workflow contains a tenant identifier; all tenant behaviour comes from `vaibhavcapstone_businesses.config`. (This grep found and killed BUG-002.)

## Cross-tenant state at end of run
| Tenant | SENT | NEEDS_REVIEW | REJECTED | DISCARDED |
|---|---|---|---|---|
| biz_oakember (furniture, seeded) | 6 | 3 | 1 | 2 |
| biz_pagebindbooks (bookstore, born via MCP chat) | 1 | 0 | 0 | 1 |

Both tenants have their own weekly insight row with independent numbers.
