# Eval case: extraction

**Measures:** WF-03 entity extraction accuracy per field (contact_name, contact_email, company, budget, product_interest, urgency, location) vs. labels.

**Method:** for each ENQUIRY-labeled seed email, compare `vaibhavcapstone_extractions` row to expected entities. A field scores: correct / wrong / hallucinated (value invented where label is null) / missed (null where label has value).

**Pass threshold:** ≥ 90% field-level accuracy across the set, **zero hallucinated fields** (hallucination is an automatic fail — grounding rule).

**Gates:** E3-S2.

**Result file:** `results/YYYY-MM-DD-extraction.md` — per-field accuracy table + hallucination list (must be empty).
