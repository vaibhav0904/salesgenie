# E8-S1: I set up my company by describing it in plain English

**As an** Operator of a brand-new business
**I want** to tell a chat assistant about my company and get a working tenant
**So that** I can adopt the platform in minutes with zero technical setup.

## Acceptance criteria
- [ ] `VaibhavCapstone-08-MCPOnboarding` (MCP Server Trigger) exposes: `create_business`, `update_business_config`, `set_reviewer`, `get_intake_endpoint`, `get_setup_status`.
- [ ] From an MCP chat client, "I run a bookstore in Pune, warm friendly tone, INR" → business row with profile config + generated business_id, no SQL touched by the human.
- [ ] `get_intake_endpoint` returns the tenant's webhook URL + payload example.
- [ ] All writes logged as events with the MCP actor identity.

## Depends on
- E1-S2

## Eval gate
- none

## Technical notes
- The MCP client's LLM does the natural-language → tool-argument mapping; tools stay small and typed. Tool descriptions must be self-explanatory enough for any MCP client.

## Outcome (2026-07-26)
- VaibhavCapstone-08-MCPOnboarding (id 395BsoRk480uw7VE) live: MCP Server Trigger at /mcp/vaibhavcapstone-onboarding, bearer-auth (Capstone-MCP-Bearer; token in .env MCP_BEARER_TOKEN).
- 6 tools exposed (create_business, update_business_config, set_reviewer, upload_catalog, get_setup_status, get_intake_endpoint). Tools are thin HTTP nodes; each local webhook owns validation + SQL, so every tool is independently curl-testable.
- Verified: "Page and Bind Books" (bookstore, Pune) created from a plain-language payload -> business_id auto-slugged biz_pagebindbooks, tone/currency/timezone defaults seeded, intake URL + next steps returned. All writes logged as events with mcp actor.
