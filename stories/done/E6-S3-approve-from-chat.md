# E6-S3: I can review and approve from chat, too

**As a** Reviewer (Sales Rep)
**I want** to list pending drafts and approve/reject them from my MCP chat client
**So that** approval works wherever I already am — headless, no dashboard.

## Acceptance criteria
- [ ] MCP tools (WF-09): `list_pending_approvals(business_id)`, `approve_draft`, `reject_draft` — decisions require `performed_by` identity.
- [ ] A decision made over MCP drives the exact same Postgres state machine as the email path (shared logic, not a parallel copy).
- [ ] Email and MCP racing on the same draft cannot double-send (second decision no-ops with logged warning).
- [ ] Demo shows one draft approved by email (E6-S2) and another via MCP.

## Depends on
- E6-S2, E8-S1 (MCP server workflow exists)

## Eval gate
- none

## Technical notes
- Both surfaces call one shared "decide draft" sub-workflow.

## Outcome (2026-07-26)
- Chat approval surface delivered in WF-09: list_pending_approvals (hottest first, with draft text + recommended products), approve_draft, reject_draft, all requiring performed_by.
- Both surfaces drive the SAME guarded Postgres transition (PENDING_APPROVAL -> APPROVED only). VERIFIED: tenant-B draft approved via MCP -> email sent -> draft+lead SENT, events recorded actor + via=mcp; immediate replay of the same approval returned "no pending draft ... nothing was sent" (no double-send). reject_draft guard verified against an unknown id.
- Demo now covers both paths: 6 approvals + 1 rejection by inbox buttons (E6-S2), 1 approval by MCP tool (here).
