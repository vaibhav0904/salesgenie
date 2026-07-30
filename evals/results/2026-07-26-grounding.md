# Eval result: grounding — 2026-07-26

**Workflow:** VaibhavCapstone-05-Recommender · **Method:** SQL pre-filter (in-stock, interest-token + budget window) → Gemini ranks only from candidates → allowed-SKU filter → SQL re-verification at persist · **Scope:** all recommendations on the seed set + live Gmail lead

## 1. Grounding rate (threshold: 100%, hard requirement)
Independent re-join of every recommended item against `vaibhavcapstone_products` (same business, stock > 0): **11/11 items verified = 100% PASS**

## 2. Fallback correctness (threshold: 100%)
| Email | Expected | Got | Verdict |
|---|---|---|---|
| seed-email-05 (budget ₹2,000 < cheapest ₹4,499) | no_grounded_option | grounded=false, reason "stated budget (2000) below cheapest in-stock item (4499)", lead NEEDS_REVIEW, INTERNAL note draft filed | PASS |
| seed-email-07 (gazebos/pergolas, off-catalog) | no_grounded_option | grounded=false, reason "no in-stock catalog match for interest", lead NEEDS_REVIEW, INTERNAL note draft filed | PASS |

Neither produced a customer-facing draft. **PASS**

## 3. Relevance (threshold: ≥1 plausible-set SKU in ≥80% of recommendations)
| Email | Plausible set | Got | Hit |
|---|---|---|---|
| seed-email-01 | DSK-002, DSK-001, CHR-001, CHR-002 | DSK-002, CHR-001, DSK-001 | ✓ |
| seed-email-02 | SOF-002 | SOF-002, SOF-001 | ✓ |
| seed-email-03 | DIN-001, DIN-002 | DIN-001, DIN-002 | ✓ |
| seed-email-04 | CHR-001, CHR-002 | CHR-001, CHR-002 | ✓ |
| seed-email-06 | BED-002 | BED-002 | ✓ |

**5/5 = 100% PASS.** Notable: seed-email-06 asked for out-of-stock BED-001 by name — the system never offered it and substituted in-stock BED-002 (the stock-filter working end-to-end). Out-of-stock SOF-003 similarly never appeared.

## Verdict: PASS (all three checks)
