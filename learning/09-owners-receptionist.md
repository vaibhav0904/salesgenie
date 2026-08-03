# Session 9 — The Owner's Receptionist (WF-08 MCPOnboarding + WF-09 MCPOperations)

*Taught 2026-08-01; full lifecycle executed live via the tool lanes. Teach-back pending.*

## Core ideas

- The owner's entire interface is chat (headless). MCP = a standard plug letting a
  chat assistant use tools the system publishes. **Tool descriptions ARE the UI**
  (BUG-006 scar: fixing assistant behavior = rewriting descriptions).
- WF-08 tools: create_business, upload_catalog (validates rows, reports rejects —
  BUG-009 scar lives here), set_reviewer, update_business_config, get_setup_status,
  get_intake_endpoint. Each tool = a small webhook lane in the same workflow.
- **upload_catalog and set_reviewer lanes call the waker-upper directly** — setup
  completion is exactly when parked files should wake; cause and effect, no timer.
- WF-09 tools: list_pending_approvals, approve_draft / reject_draft (SAME guarded
  flip as the inbox buttons — two doors, one lock), get_lead_status, get_insights,
  send_test_lead. Bearer-protected, tenant-scoped.

## Live lifecycle (biz_lumencandles, 2026-08-01, 31 seconds end to end)

create → checklist showed catalog ✗ reviewer ✗ → test lead (Meera, wedding
candles, ₹15k) → classified+qualified then PARKED (missing catalog,
resume_from recommend) → catalog uploaded (3 candles) → **resumed 1 second
later** → grounded recs → PARKED AGAIN (missing reviewer, resume_from draft) →
reviewer set → resumed → warm-cozy draft recommending 12-second-old products →
approved via chat lane (actor recorded: mcp-client) → SENT with
[DEMO -> meera.test@example.com] redirect.

Biography: LEAD_RECEIVED → LEAD_CLASSIFIED → LEAD_QUALIFIED →
LEAD_PARKED_AWAITING_SETUP → LEAD_RESUMED_AFTER_SETUP → RECOMMENDATION_GROUNDED
→ LEAD_PARKED_AWAITING_SETUP → LEAD_RESUMED_AFTER_SETUP → DRAFT_CREATED →
DRAFT_APPROVED (mcp-client) → EMAIL_SENT.

Lumen Candles kept as demo-rehearsal tenant.

## Teach-back — answered, session closed ✅ (2026-08-01)

1. Spirit right → precise mechanism taught: the parking step writes `resume_from`
   into the lead's own status_detail pocket; the waker-upper reads the bookmark.
2. ✅ audit trail: who, when, which door — forever.
3. "Don't know" → taught the rule: **event when you can, sweep when you must.**
   Setup completion has a knowable exact moment (the lane itself) → call directly
   (1-second wake). NEEDS_REVIEW has many doors across workflows → one timer
   sweeper covers all doors forever; minutes of nag delay harm nobody.
