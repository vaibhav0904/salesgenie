# BUG-008: The demo poll query watched the wrong lead

**Severity:** medium — no data was wrong, but it cost a recording session and looked exactly like a dead pipeline.

## Symptom
Following the video script's "watch it move" step, the status query returned `SENT` and never changed, run after run:

```
docker exec … -c "SELECT status FROM vaibhavcapstone_leads ORDER BY received_at DESC LIMIT 1;"
 status
--------
 SENT
```

Read as: the pipeline is stuck, or the enquiry never arrived.

## Root cause
Two columns, two different meanings:

- `received_at` — when the enquiry *says* it was received. It comes from the payload.
- `created_at` — when the row was actually written.

`data/seed-emails/demo-video-enquiry.json` hardcoded `"received_at": "2026-07-28T10:15:00+05:30"`. Any lead created later by wall clock therefore sorted **above** the fresh demo lead, so `ORDER BY received_at DESC LIMIT 1` returned a different, already-finished lead — one that reads `SENT` and will never change again.

The real lead was fine throughout. Its trail, from the run that triggered this report:

```
intake            LEAD_RECEIVED            09:22:52
classify-extract  LEAD_CLASSIFIED          09:22:58
qualifier         LEAD_QUALIFIED           09:23:03
recommender       RECOMMENDATION_GROUNDED  09:23:16
draft-hitl        DRAFT_CREATED            09:23:23
```

31 seconds, HOT, score 100, grounded recommendation, draft waiting for approval.

## Fix
Two changes, either of which is sufficient — both applied because this one is worth over-fixing:

1. **The query now orders by `created_at`** (`presentation/video-script.md`, Take 2.2), with a warning box explaining why.
2. **`received_at` was deleted from `demo-video-enquiry.json`.** `Create Lead` in WF-01 already does `COALESCE((p.j->>'received_at')::timestamptz, now())`, so omitting the key makes `received_at = created_at = now`. The two orderings can no longer disagree for this payload.

## Verification
Re-ran the intake command and the corrected poll at 8-second intervals:

```
 2s   RECEIVED
11s   EXTRACTED
19s   QUALIFIED
28s   RECOMMENDED
37s   PENDING_APPROVAL
```

A changing status, which is the whole point of the step. Those measured timings are now the ones printed in the script.

## Lesson
The script asserted an output it had never been run against. Every command in the rewritten script has now been executed verbatim and its **real** output pasted in — no illustrative samples.
