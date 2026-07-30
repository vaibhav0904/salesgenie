# ADR 0007 — HITL approval via email links + MCP tools

**Status:** accepted · **Date:** 2026-07-26

## Context
No customer-facing message may be sent without human approval (non-negotiable). The reviewer is a per-Business config; the platform has no UI.

## Decision
Two equivalent approval surfaces over one Postgres-enforced state machine:
1. n8n wait-for-approval email to the Business's reviewer (approve/reject links).
2. MCP tools `list_pending_approvals` / `approve_draft` / `reject_draft` with `performed_by` identity.

## Consequences
- Headless-compatible; both surfaces demoed.
- Draft state transitions enforced in Postgres so the two surfaces can't race into a double-send; every decision is an Event with an actor.
