# E12-S1: We adopt A2A only where it earns its keep

**As the** platform architect (PM hat)
**I want** a written needed-or-not assessment of the A2A protocol, and the discovery endpoint where it IS needed
**So that** the protocol serves a real interoperability case instead of being buzzword plumbing.

## Acceptance criteria
- [ ] `docs/adr/0011-a2a-at-the-boundary.md`: internal agents stay on the logical Envelope (ADR-0005 stands, reasons restated); A2A adopted at the platform boundary where the counterparty is another organization's agent; includes the lead-status → A2A-task-state mapping table and why MCP is the wrong shape for that boundary.
- [ ] `VaibhavCapstone-13-A2AServer` (part 1): `GET` Agent Card endpoint per business — name/description/skill/capabilities/auth built 100% from `businesses` config (zero tenant hardcoding).
- [ ] Card verified by curl for both tenants: same endpoint, different identities.

## Depends on
- E11-S4 (A2A leads should be born instrumented)

## Eval gate
- none

## Technical notes
- Capabilities declared honestly: streaming false, pushNotifications false (polling only).

## Outcome (2026-07-26)
- ADR-0011 written: A2A rejected internally (one runtime, Envelope suffices - ADR-0005 stands), adopted at the org boundary where the counterparty is another organization agent; includes the 1:1 lead-status -> A2A-task-state mapping and the MCP-vs-A2A audience distinction.
- VaibhavCapstone-13-A2AServer (id K08cnvDHzEw2iJyQ): GET /webhook/a2a-agent-card?business_id=... returns a per-tenant Agent Card 100% from config - verified for both tenants (Oak & Ember Sales Agent / Page & Bind Books Sales Agent), honest capabilities (streaming/push false).
- Gotcha: n8n prefixes webhook paths containing :params with the node UUID, so static paths + query param used; production posture = reverse proxy serving /.well-known/agent.json per tenant domain (noted in ADR).
- Auth: bearer verified against vaibhavcapstone_platform_config (token inserted at deploy from .env - Code nodes cannot read env vars in this n8n, and no secret enters git).
