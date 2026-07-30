# E7-S2: Numbers I can defend, and a report I can revisit

**As a** Sales Manager
**I want** every insight number traceable to raw records, and past reports retrievable
**So that** I can defend the report to my CEO and see trends over weeks.

## Acceptance criteria
- [ ] Every metric in the weekly report is reproducible by a documented SQL query over `vaibhavcapstone_leads`/`_events` (traceability doc or query list stored with the insight).
- [ ] A self-contained HTML report (inline CSS + same charts) stored per insight; retrievable via a webhook URL and via MCP `get_insights`.
- [ ] `get_insights(business_id)` returns the latest report + metrics; history retained in the insights table.

## Depends on
- E7-S1

## Eval gate
- none (manual traceability audit: pick 3 numbers, reproduce via SQL)

## Technical notes
- Grading criterion "insights traceability to underlying data (12%)" is satisfied here.

## Outcome (2026-07-26)
- Traceability audit performed: reproduced volume_total, funnel.sent and approval counts by independent SQL - and the audit CAUGHT A REAL BUG (BUG-001 self-ingestion inflating 12->15), proving the traceability loop works. After fix: all three numbers match exactly.
- Metrics provenance: single documented SQL in WF-07 (node note) over vaibhavcapstone_* rows; chart configs stored per insight; history retained in insights table.
- Retrieval: GET webhook (text/html) verified; MCP get_insights lands with E8 (WF-09).
