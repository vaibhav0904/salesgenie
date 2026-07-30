# ADR 0004 — Canonical webhook intake; email is an adapter

**Status:** accepted · **Date:** 2026-07-26

## Context
The brief's pain is email intake, but a headless platform must be channel-agnostic — future channels (web form, WhatsApp, chat widget) shouldn't touch pipeline logic.

## Decision
One canonical intake webhook (`VaibhavCapstone-01-Intake`) accepting a normalized enquiry payload. The Gmail trigger (`VaibhavCapstone-02-GmailAdapter`) is merely the first channel adapter mapping email → that payload. Demo replays seed emails against the webhook; ≥1 live email proves the Gmail path.

## Consequences
- Deterministic, demo-safe replays; new channels = new adapters only.
- Slight indirection (adapter → webhook hop) accepted for the architectural claim.
