# ADR 0006 — NL onboarding/ops via n8n MCP Server Trigger

**Status:** accepted · **Date:** 2026-07-26

## Context
"Any business sets itself up in natural language" needs an MCP tool surface. Alternatives: standalone MCP server (extra service, cleaner contract) or hybrid.

## Decision
n8n's MCP Server Trigger node exposes onboarding tools (`create_business`, `upload_catalog`, `set_reviewer`, `get_setup_status`, `get_intake_endpoint`, `update_business_config`) and operations tools (`get_lead_status`, `list_pending_approvals`, `approve_draft`, `reject_draft`, `get_insights`, `send_test_lead`) as two workflows (WF-08, WF-09). Any MCP client (Claude, etc.) is the natural-language interface.

## Consequences
- Zero extra services; the platform is fully drivable from chat — the "headless" claim.
- Tool schemas live inside n8n workflows; kept small and documented in workflow notes.
