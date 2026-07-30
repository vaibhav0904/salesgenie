# BUG-001: Gmail adapter re-ingests the platform's own outbound replies

**Found while:** E7-S2 traceability audit (insight said 15 leads; hand count said 12)
**Severity:** major (pollutes lead volume + insights; potential infinite mail loop in production)

## Repro
1. Approve a draft → customer reply is sent (demo-redirected to the shared inbox) with a subject like "[DEMO → …] Regarding Your Enquiry for a Bed".
2. Gmail IMAP `SUBJECT "[enquiry]"` search matches loosely (Gmail tokenizes; "Enquiry" in the subject matches).
3. WF-02 ingests the platform's own email as a new lead.

## Expected / Actual
- Expected: only genuine inbound customer enquiries become leads.
- Actual: 3 outbound replies became leads (classifier correctly discarded them as NOT_ENQUIRY — defense in depth held — but volume metrics were inflated 12→15).

## Root cause (fill when known)
Two stacked causes: (a) Gmail IMAP SUBJECT search is a loose token match, not a literal `[enquiry]` match; (b) the adapter had no self-sender guard, so mail FROM the business's own identity was eligible for ingestion.

## Fix (fill when resolved, link commit/workflow)

## Resolution (2026-07-26)
- Fix: self-sender guard in WF-02 Resolve Business - mail FROM the business own sender/intake identity is never ingested (tenant-agnostic, from config). Republished; phantom leads/events removed; insight regenerated with clean numbers.
- Defense in depth noted: even before the fix, WF-03 classified the self-mail NOT_ENQUIRY and discarded it.
