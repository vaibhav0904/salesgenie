# Eval case: qualification

**Measures:** WF-04 band assignment (HOT/WARM/COLD) vs. labeled expected band; reasons sanity.

**Method:** compare `vaibhavcapstone_qualifications.band` to labels. Reasons spot-check: each reason must reference a fact present in the extraction (no invented facts).

**Pass threshold:** ≥ 80% band agreement (bands are judgment calls; adjacent-band misses tolerated except a labeled-HOT lead scored COLD, which is an automatic fail — lost hot leads are the business-killer). Zero invented facts in reasons.

**Gates:** E4-S1.

**Result file:** `results/YYYY-MM-DD-qualification.md`.
