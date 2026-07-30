# E10-S2: Scenario B — a new business onboards halfway and nothing breaks

**As the** capstone evaluator
**I want** to watch a second business (different industry) get created in chat, receive a lead while half-configured, then finish setup and see the lead complete
**So that** the headless, business-agnostic claim is proven, not asserted.

## Acceptance criteria
- [ ] Tenant B (non-furniture, e.g. bookstore/electronics) created purely via natural-language MCP conversation: profile only — no catalog, no reviewer.
- [ ] `send_test_lead` → lead runs intake → classify → extract → qualify, then parks AWAITING_SETUP (catalog gate).
- [ ] `get_setup_status` names the exact gaps + parked count.
- [ ] Catalog + reviewer added via chat → parked lead auto-resumes → recommendation grounded on tenant B's catalog → draft in tenant B's tone → approved → SENT.
- [ ] Zero workflow edits between Scenario A and B (diff of exports proves it).

## Depends on
- E10-S1, E8-S4

## Eval gate
- none

## Technical notes
- The demo's climax; rehearse it scripted for the video.

## Outcome (2026-07-26)
- Scenario B proven with "Page & Bind Books" (bookstore, Pune) - a different industry from tenant A, created entirely through MCP tool calls, never SQL.
- Half-configured first: profile only -> test lead ran intake/classify/extract/qualify (HOT, 100) then PARKED at the catalog gate with missing=[catalog]; get_setup_status named the exact gaps and the tools to fix them.
- Completing setup resumed it automatically, twice: upload_catalog (CSV, 8 valid + 1 rejected row) -> auto-resume -> grounded book recommendations -> re-parked at the reviewer gate -> set_reviewer -> auto-resume -> draft -> approved via MCP -> SENT.
- Draft voice was visibly the bookstore's ("scroll", "tomes", "The Page & Bind Crew"), from the same workflows that write Oak & Ember's furniture prose - tone comes from config.
- ZERO workflow edits between tenants; proven by grep: no tenant identifier appears in any export (the one violation found, BUG-002, was fixed).
