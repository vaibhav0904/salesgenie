# E8-S5: I can run and inspect my whole pipeline from chat

**As an** Operator or Sales Rep
**I want** to check any lead's status, fire a test lead, and pull my latest insights from chat
**So that** the platform is fully operable without any dashboard.

## Acceptance criteria
- [ ] `VaibhavCapstone-09-MCPOperations` exposes: `get_lead_status(business_id, lead_id)` (full pipeline trail: classification → extraction → qualification → recommendation → draft state + next action), `send_test_lead(business_id, scenario)`, `get_insights(business_id)`.
- [ ] `get_lead_status` output is assembled from Postgres rows + events (nothing recomputed by an LLM).
- [ ] `send_test_lead` posts a canned enquiry to the tenant's intake webhook and returns the new lead_id.
- [ ] All reads work for ANY business_id — proving tenant isolation (asking for tenant A data never leaks tenant B rows).

## Depends on
- E8-S1, E6-S2

## Eval gate
- none

## Technical notes
- List of approval tools lives in E6-S3; this story is the read/ops side.

## Outcome (2026-07-26)
- VaibhavCapstone-09-MCPOperations (id H8K5H8RcVWH2mhXc) live at /mcp/vaibhavcapstone-operations (bearer auth): get_lead_status, list_pending_approvals, approve_draft, reject_draft, get_insights, send_test_lead.
- get_lead_status assembles the full trail from Postgres rows + events (no LLM recomputation) and returns a plain-language next_action per state. Verified on the tenant-B lead: complete 11-step timeline incl. both park/resume cycles.
- send_test_lead offers hot/warm/spam/vendor canned enquiries; spam scenario verified end-to-end (DISCARDED_SPAM). get_insights returns metrics + narrative + report URL.
- TENANT ISOLATION verified: the same tool called with the other business_id returns only that tenant rows (tenant A pending list empty while tenant B had one).
