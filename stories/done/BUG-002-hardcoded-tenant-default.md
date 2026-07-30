# BUG-002: WF-07 latest-report endpoint defaults to a specific tenant

**Found while:** E10-S1 tenant-agnosticism grep over `n8n/workflows/*.json`
**Severity:** minor (no data leak in practice — but violates the hard rule "never branch on a specific business_id")

## Repro
1. `GET /webhook/vaibhavcapstone-insights-latest` with no `business_id` query param.
2. The SQL is `WHERE business_id = COALESCE(NULLIF($1,''), 'biz_oakember')` → silently returns Oak & Ember's report.

## Expected / Actual
- Expected: no tenant identifier anywhere in workflow logic; a missing `business_id` should be an explicit, helpful error.
- Actual: the first tenant is baked in as the fallback, so a new tenant's operator omitting the param sees someone else's report.

## Root cause
Convenience default written during E7-S1 to make manual testing easy; never removed.

## Fix

- Removed the COALESCE tenant default; the endpoint now requires business_id and returns actionable guidance when it is missing. Re-exported; repo-wide grep over n8n/workflows/*.json now finds ZERO tenant identifiers.
