# Eval case: grounding

**Measures:** WF-05 recommendation grounding + fallback correctness.

**Method:**
1. For every recommendation produced on the seed set: each SKU must join to a live `vaibhavcapstone_products` row (right business, in stock at recommendation time).
2. Relevance: recommended SKUs compared against labeled plausible-SKU sets (overlap expected, not exact match).
3. Fallback: seed emails labeled `no_grounded_option` (out-of-stock ask, off-catalog ask) must produce the fallback + NEEDS_REVIEW path, not a forced recommendation.

**Pass threshold:** grounding rate = **100%** (a single unverifiable SKU fails the eval — this is the hard guardrail). Fallback cases 100% correct. Relevance: ≥ 1 plausible-set SKU in ≥ 80% of recommendations.

**Gates:** E5-S1, E5-S2.

**Result file:** `results/YYYY-MM-DD-grounding.md`.
