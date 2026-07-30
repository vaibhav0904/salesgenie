# ADR 0009 — VaibhavCapstone naming prefix

**Status:** accepted · **Date:** 2026-07-26

## Context
The local n8n instance and Postgres may host other projects; the capstone's artifacts must be unmistakably identifiable and exportable as a set.

## Decision
- Every n8n workflow: `VaibhavCapstone-<NN>-<Name>` (e.g. `VaibhavCapstone-05-Recommender`).
- Every Postgres table: `vaibhavcapstone_<name>` (e.g. `vaibhavcapstone_leads`).
- Exports land in `n8n/workflows/` with matching filenames.

## Consequences
- Trivial to filter, export, demo, and clean up.
- Slightly long names; accepted.
