# Evals — how quality is measured

Evals are repeatable checks of LLM-step quality against labeled data. They **gate stories**: an eval-gated story cannot move to `stories/done/` until its case passes, and every run's output is archived.

```
evals/
├── datasets/   labeled ground truth (created in E1-S3)
│   └── seed-emails-labeled.json   # per email: expected classification, entities, band, plausible SKUs
├── cases/      one file per eval — what's measured, how, pass threshold
└── results/    dated run outputs: YYYY-MM-DD-<case>.md (metrics + per-item diffs)
```

## Running an eval
Replay the seed dataset through the pipeline (webhook), read actual results from Postgres, compare to labels, write a dated result file. The `/eval` command automates this comparison; the queries live in each case file.

## Cases
| Case | Measures | Gates |
|---|---|---|
| `classification.md` | ENQUIRY/NOT_ENQUIRY/SPAM accuracy | E3-S1 |
| `extraction.md` | field-level entity accuracy | E3-S2 |
| `qualification.md` | band agreement with labels | E4-S1 |
| `grounding.md` | 100% recommended SKUs verifiable + fallback correctness | E5-S1, E5-S2 |

## Rules
- Labels are written when the dataset is created (E1-S3), **before** any prompt is tuned — no teaching to the test after the fact.
- If a prompt changes, affected cases re-run; regressions are BUG cards.
- Final regression (all cases) runs in E10-S1 and is archived.
