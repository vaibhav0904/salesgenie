# E11-S4: The Monday report says how healthy the AI itself is

**As a** Sales Manager
**I want** the weekly report to include AI cost, speed, reliability and judge scores
**So that** I can trust (or question) the automation with the same rigor as the sales numbers.

## Acceptance criteria
- [ ] WF-07 metrics SQL extended: cost per lead (notional), p50/p95 LLM latency, schema-validity rate, retry/fallback counts, judge averages + violation count — per call site where meaningful.
- [ ] New "AI health" section in the emailed/stored report with one additional CVD-validated QuickChart (judge scores by artifact type).
- [ ] Two AI-health numbers reproduced by hand SQL (traceability discipline).
- [ ] Regenerated for both tenants; export updated.

## Depends on
- E11-S3

## Eval gate
- manual traceability audit (2 numbers)

## Technical notes
- Same rule as ever: no LLM computes any number; narrative may reference them.

## Outcome (2026-07-26)
- WF-07 extended: ai_health block in the single metrics SQL (calls, notional cost/lead excl. judge, p50/p95 latency, schema-validity %, retries, fallbacks, judge avg+violations per artifact type) + AI-health report section + CVD-validated judge-score chart (renders HTTP 200 image/png).
- Live numbers: Oak & Ember 63 calls, $0.00019/lead, p50 1105ms / p95 4686ms, 100% schema-valid, judge avgs 5.0/5.0/4.8 with 0 violations; Page & Bind independent figures.
- Traceability audit: extraction judge avg reproduced exactly (5.00); llm_calls count reproduced 64 vs 63 - the delta IS the report-generation narrative call landing after its own snapshot (observer effect, documented).
- Fix note: String.replace $-pattern footgun corrupted a spliced node once (caught by execution error, rebuilt cleanly).
