# ADR 0011 — A2A protocol: not inside the platform, yes at its boundary

**Status:** accepted · **Date:** 2026-07-26

## Context
The question "should SalesGenie use the Agent2Agent (A2A) protocol?" deserves a real answer, not buzzword adoption. We examined two candidate locations.

## Decision

**Internally: no.** Our agents (classify/qualify/recommend/draft/insights) are sub-workflows in one n8n runtime, one process boundary, one trust domain. A2A there would replace in-memory Envelope handoffs (ADR-0005) with HTTP + JSON-RPC + task polling between nodes that share a database — pure overhead, no interoperability gained. ADR-0005 stands.

**At the boundary: yes.** The genuine A2A use case is a counterparty we don't control: another organization's agent. Concretely: a buyer's procurement AI wants to enquire with a tenant's sales operation. MCP is the wrong shape there — MCP exposes *your* tools to *your* operator's client; A2A is peer-to-peer *task* exchange between independent agents, with discovery (Agent Card), opaque internals, and a task lifecycle. Every SalesGenie tenant therefore gets an A2A-discoverable **Sales Agent** (`VaibhavCapstone-13-A2AServer`), built as a thin adapter in front of the untouched pipeline — exactly like the Gmail adapter.

## The mapping that makes it cheap and honest
Our lead state machine translates 1:1 onto the A2A task lifecycle:

| Lead status | A2A task state | Note |
|---|---|---|
| RECEIVED / CLASSIFIED / EXTRACTED / QUALIFIED / RECOMMENDED / DRAFTED | `working` | with a stage message |
| PENDING_APPROVAL | `input-required` | **the human gate is visible to the remote agent, not hidden** |
| SENT | `completed` | artifact = approved reply + recommended items |
| REJECTED | `canceled` | reviewer declined |
| DISCARDED_SPAM / DISCARDED_NOT_ENQUIRY | `rejected` | not a valid enquiry |
| NEEDS_REVIEW / AWAITING_SETUP | `working` | status message explains a human/config step |
| DEAD_LETTER | `failed` | |

## Scope (deliberately minimal)
`agent-card` discovery + JSON-RPC `message/send` and `tasks/get`, polling only. Declared honestly in the card: `streaming:false, pushNotifications:false`. Auth: bearer (shared demo token; per-tenant keys are the production posture). A2A task ids map to leads via `vaibhavcapstone_a2a_tasks`.

## Consequences
- All guardrails hold by construction: A2A enquiries run the same pipeline — grounded recommendations, Postgres-enforced HITL, full telemetry (A2A leads are born instrumented).
- Two protocols, two audiences, one pipeline: MCP for the tenant's own operator, A2A for other parties' agents.
- Not implemented: streaming, push notifications, multi-turn task input, agent-card signatures — listed as production upgrades, not silently missing.
