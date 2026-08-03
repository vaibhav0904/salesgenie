---
description: Run an eval case against the labeled seed dataset and archive the result
---

Run the eval named in $ARGUMENTS (classification | extraction | qualification | grounding; no argument = all applicable):

1. Read the case definition in `evals/cases/<name>.md` and the labels in `evals/datasets/seed-emails-labeled.json`.
2. Ensure the seed set has been replayed through the pipeline (replay via the intake webhook if results are stale).
3. Pull actuals from Postgres (`vaibhavcapstone_*` tables), compare to labels per the case's method.
4. Write `evals/results/<YYYY-MM-DD>-<case>.md`: metrics vs threshold, per-item diffs, PASS/FAIL verdict.
5. If this eval gates a story currently in progress, update that story's `.tests.md` row for this case with the verdict and a link to the result file.
6. On FAIL: diagnose the top failure pattern and file a BUG card; do not tune the labels to fit the output.
