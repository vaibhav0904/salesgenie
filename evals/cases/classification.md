# Eval case: classification

**Measures:** WF-03 classification of each seed email as ENQUIRY / NOT_ENQUIRY / SPAM vs. labels in `datasets/seed-emails-labeled.json`.

**Method:** replay all seed emails → read `vaibhavcapstone_leads.status` + classification event per lead → compare to expected label.

**Pass threshold:** ≥ 9/10 correct (100% on SPAM — spam leaking to reps is the costly error).

**Gates:** E3-S1.

**Result file:** `results/YYYY-MM-DD-classification.md` — confusion table + per-miss diagnosis.
