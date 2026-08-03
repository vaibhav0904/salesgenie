# Session 8 — The Monday Reporter (WF-07 WeeklyInsights)

*Taught 2026-08-01 with a live run. Closed ✅.*

## Core ideas

- Two doorbells (Monday 8am schedule + run-now webhook), one desk; per-shop loop
  (loop trap scar: "first item" inside a loop repeats shop #1 — use current item).
- One big SQL query computes ALL numbers from leads/events. House rule: "if a
  number can't be traced to rows, it doesn't ship."
- Charts = QuickChart URLs → PNG images, because email programs don't run
  JavaScript. Reliability over fanciness.
- Narrative via the 5-step AI routine; fixed sentence if both vendors fail.
- Store in insights drawer → email → next shop; GET webhook serves the newest
  report as a webpage on demand.
- AI-health block = every receipt from S3–S6 surfacing to the boss (cost/lead,
  latencies, format-check rate, fallback count, auditor averages).

## Live run (2026-08-01 09:29, all 3 shops)

Oak & Ember's real week: 24 enquiries → 17 qualified → 13 recommended → 6 sent;
14 HOT/2 WARM/1 COLD; 12 approved/2 rejected; 11 NEEDS_REVIEW; AI health: 556
calls, p50 3.4s, p95 8.7s, $0.026/lead, 100% format-valid, 5 fallbacks, judge
avg 4.98–5.0 over 238 artifacts, 0 invented facts. Report URL:
`GET /webhook/vaibhavcapstone-insights-latest?business_id=biz_oakember`.

## Teach-back — closed with one correction

1. ✅ single source of truth; challenges answered by a query, not an argument.
2. ✅ email clients don't run JS → PNG from URLs.
3. Corrected: PENDING_APPROVAL = "please sign" (draft exists, awaiting decision)
   vs NEEDS_REVIEW = "please take over" (machine stepped aside; NO draft).
   Personal inventory: Vikram (sent), Kavita (rejected), Sneha + gazebo (review),
   raj "frnitur" (review) — all created during these sessions.
