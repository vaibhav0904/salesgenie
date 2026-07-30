# ADR 0001 — n8n as the orchestration engine

**Status:** accepted · **Date:** 2026-07-26

## Context
The capstone requires an n8n workflow export as a scored deliverable (40% of grade is n8n orchestration). We also want the build itself to be agent-driven: Claude authors workflows through the n8n MCP against a local Docker n8n.

## Decision
All pipeline logic, agents, MCP tool surfaces, and crons are n8n workflows. No sidecar app servers. Workflows are authored via the n8n MCP and exported as JSON into `n8n/workflows/`.

## Consequences
- Everything demoable inside one tool; exports are the deliverable.
- Logic that would be one line of code becomes nodes — accepted for clarity/grading.
- State cannot live in n8n memory → forces Postgres as system of record (ADR 0002).
