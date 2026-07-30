# BUG-010: The eval harness graded an arbitrary replay, so the headline number was luck

**Severity:** high — not a data or pipeline defect, but an integrity one: the published extraction accuracy (98.4%, "zero invented") was one favourable draw from a nondeterministic sample, not a reproducible result.

## Symptom
After renaming the seed-email addresses to `.example` domains and replaying them, the eval reported 85.9% — yet the replayed rows, inspected directly, contained perfectly extracted new addresses. The harness was grading **different rows than the ones just produced**.

## Root cause
Same disease as BUG-008, in a second host. Each replay of a seed email inserts a new lead, and every copy carries the **identical `received_at`** — it is hardcoded in the seed file. After four replay sessions there were four rows per external_id, tied on the sort key:

```
seed-email-01:  4 rows, all received_at = 2026-07-20 10:15:00+05:30
```

`run-evals.js` selected rows with `ORDER BY l.received_at` and keyed `Object.fromEntries` on external_id — so with a four-way tie, *which* run got graded was up to Postgres row order. The recorded 98.4% (2026-07-28) was sampled from that lottery. The first-ever run (2026-07-26, 95.3%, one row per email at the time) is the only older figure known to be deterministic.

## Collateral damage, owned
`run-evals.js` also hardcoded `const today = '2026-07-26'`, so **every later run overwrote the archived 26-Jul classification and extraction result files**. My runs on 30 Jul destroyed those archives; there was no git history yet, so they are unrecoverable. The 26-Jul figures survive only in `2026-07-26-final-regression.md`, which a different script wrote.

## Fix
1. **Deterministic selection** — the query now takes exactly one row per seed email, the most recent *actual* run:
   ```sql
   SELECT DISTINCT ON (l.raw_payload->>'external_id') ...
   ORDER BY l.raw_payload->>'external_id', l.created_at DESC
   ```
   `created_at` is when the row was written and is never tied across replays.
2. **Real dates** — `today` is now `new Date().toISOString().slice(0,10)`; a run can no longer overwrite another day's archive.
3. **Honest numbers** — a 5-cycle replay+grade spread (`evals/results/2026-07-30-extraction-spread.md`) replaces the single point estimate everywhere it was quoted (deck slide 6, video script close, README). No label was edited at any point.

## Lesson
A metric that changes when you re-measure it was never a metric. The eval set, the labels and the prompt were all fine — the *sampling* was broken, and it failed flatteringly, which is the worst way: nothing looked wrong until an unrelated rename forced a fresh look.
