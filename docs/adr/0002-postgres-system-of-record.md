# ADR 0002 — Postgres in Docker as system of record

**Status:** accepted · **Date:** 2026-07-26

## Context
Multi-tenant registry, lead state machines, an approval flow that must survive restarts, and insights that must be traceable to raw rows. Alternatives considered: Google Sheets (weak state machines), Airtable/NocoDB (external dependency), n8n Data Tables (poor querying/portability).

## Decision
Postgres runs in the same docker-compose as n8n. All tables prefixed `vaibhavcapstone_`, every row keyed by `business_id`. State machines (lead status, draft status) enforced at the DB level where possible.

## Consequences
- Transactional approval flow; SQL aggregates power insights; local and free.
- Requires migrations discipline (`db/`), and n8n Postgres credentials.
