# E12-S2: A remote agent can transact — through the same guardrails

**As a** buyer's AI agent (another organization's software)
**I want** to submit an enquiry as an A2A task and poll its progress
**So that** my principal gets a grounded, human-approved offer without either of us exchanging emails.

## Acceptance criteria
- [ ] `POST /webhook/a2a/<business_id>/rpc` handles JSON-RPC `message/send` (creates a lead via the untouched WF-01 intake, channel `a2a`) and `tasks/get` (translates lead status via the ADR-0011 mapping); unknown methods → JSON-RPC error; bearer auth required.
- [ ] `PENDING_APPROVAL` surfaces as `input-required` — the human gate is visible to the remote agent, not hidden.
- [ ] `SENT` returns the task as `completed` with the approved reply + recommended items as the task artifact.
- [ ] `db/004_a2a.sql`: `vaibhavcapstone_a2a_tasks` mapping table (A2A task ids decoupled from lead ids), idempotent.
- [ ] All guardrails intact: HITL still gates, recommendations still SQL-verified, tenant isolation via path + business_id predicates.

## Depends on
- E12-S1

## Eval gate
- none (E12-S3 demo run is the acceptance test)

## Technical notes
- Reuse, don't fork: the A2A endpoint is an adapter in front of the existing pipeline, exactly like the Gmail adapter.

## Outcome (2026-07-26)
Done. `VaibhavCapstone-13-A2AServer` (K08cnvDHzEw2iJyQ) serves `POST /webhook/a2a-rpc?business_id=<id>` (static path + query param — n8n prefixes `:param` webhook paths with a node UUID, so path params were dropped).
- **JSON-RPC surface verified:** missing bearer → `-32001 unauthorized`; `tasks/cancel` → `-32601 method not found`; unknown task id → `-32004 task not found`; malformed envelope → `-32600`.
- **Live transaction (tenant A):** "Northwind Procurement Agent" `message/send` (25 ergonomic chairs, ₹3,00,000, 4 weeks) → task `a2a_ms1kx7nkfyd3wxly` `submitted` → lead ran the untouched pipeline (HOT/100; CHR-001/002/003 all SQL-grounded) → `tasks/get` showed `working` → **`input-required`** ("A human reviewer at Oak & Ember Interiors is checking the proposed reply") → after a real human Approve click, **`completed`** with artifact = approved reply text + `recommended_products` data part.
- Guardrails intact by construction: same intake, same HITL gate, same grounding; A2A leads born instrumented (llm_calls rows present). Bearer verified against `vaibhavcapstone_platform_config` (Code nodes can't read env vars).
- Export `n8n/workflows/VaibhavCapstone-13-A2AServer.json` scanned: zero tenant identifiers, zero secrets.
