# E7-S1: Every Monday I get a report I can forward untouched

**As a** Sales Manager
**I want** a weekly email with charts and a plain-English summary of my sales funnel
**So that** I know volumes, quality, and bottlenecks without asking anyone to compile anything.

## Acceptance criteria
- [ ] `VaibhavCapstone-07-WeeklyInsights` runs on cron per Business (+ manual trigger for demos).
- [ ] Metrics from SQL over leads/events: enquiry volume, band mix, approval rate, avg time-to-first-draft, top requested categories, spam/discard counts, parked/dead-letter counts.
- [ ] ≥3 QuickChart charts embedded in the email (band mix donut, daily volume bar, funnel) — render in a normal mail client, no JS.
- [ ] Gemini narrative references only the computed metrics (no invented numbers — spot-checked).
- [ ] Insights row stored with metrics jsonb + narrative + chart configs.

## Depends on
- E6-S2 (funnel data exists end-to-end)

## Eval gate
- none (traceability check in E7-S2)

## Technical notes
- Chart configs contain aggregates only, never PII (ADR 0008).

## Outcome (2026-07-26)
- VaibhavCapstone-07-WeeklyInsights (id MZeaFf1tHVJYiAUk) live: weekly cron (Mon 08:00 IST) + manual run webhook + latest-report GET endpoint; loops ALL businesses (tenant-agnostic). Export in n8n/workflows/.
- One SQL statement computes every metric (volume, daily, band mix, status mix, funnel, approval rate, avg-time-to-draft, needs-review, top categories) - no LLM touches numbers.
- 3 QuickChart PNGs (funnel hbar, band-mix donut, daily bar) - palette CVD-validated via dataviz six-checks; aggregates only, no PII; verified rendering (HTTP 200 image/png). Gemini narrative constrained to provided numbers, with graceful fallback.
- Report emailed to reviewer + stored in vaibhavcapstone_insights + served at GET /webhook/vaibhavcapstone-insights-latest.
