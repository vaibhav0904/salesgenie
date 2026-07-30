# E18-S1: Compose a custom test lead from chat

**As an** operator demoing or testing from a chat client only (no terminal)
**I want** `send_test_lead` to accept an optional custom subject/body/sender alongside the canned scenarios
**So that** I can play the customer with my own words, while the lead stays honestly marked as a test (channel `mcp-test`).

## Acceptance criteria
- [ ] Optional `subject`, `body`, `from_name`, `from_email`; canned scenarios unchanged as defaults.
- [ ] Custom lead flows the full pipeline; channel remains `mcp-test`.
- [ ] Tool description updated; WF-09 re-exported; new-business script updated to chat-only.

## Outcome (2026-07-27)
Done. `send_test_lead` now accepts optional `subject`/`body`/`from_name`/`from_email` (body overrides scenario; canned hot/warm/spam/vendor unchanged as defaults); tool description updated so chat clients discover the new fields. Verified live: a custom enquiry produced a lead with the exact custom subject/body/sender, channel still `mcp-test` (honestly marked as a test). WF-09 republished + re-exported. `presentation/new-business-script.md` Act 2 is now fully chat-only — no terminal anywhere in Acts 1–5 (the optional robot-buyer finale remains a terminal step by nature).
