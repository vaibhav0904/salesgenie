# ADR 0005 — Logical A2A via versioned JSON Envelope

**Status:** accepted · **Date:** 2026-07-26

## Context
Agent-to-agent protocol was considered (literal A2A with agent cards). n8n doesn't speak A2A natively; the value we actually need is modular agents with explicit, versioned handoffs.

## Decision
Each capability (qualifier, recommender, drafter, insights) is a separate n8n sub-workflow exchanging the Envelope defined in `docs/contracts.md` (`envelope_version` 1.0). Agents validate the envelope on entry; invalid envelopes go to the Error Handler.

## Consequences
- Independently testable/replaceable agents; clear grading story for "node logic & routing clarity".
- No literal A2A interop; if ever needed, the Envelope maps cleanly onto an A2A task payload.
