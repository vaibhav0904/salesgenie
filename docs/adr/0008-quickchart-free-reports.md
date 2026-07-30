# ADR 0008 — QuickChart + self-contained HTML for free visual reports

**Status:** accepted · **Date:** 2026-07-26

## Context
Weekly insights must include good-looking graphs at zero cost. Email clients don't execute JavaScript, so charts in email must be images.

## Decision
- **Email:** QuickChart.io URLs (free, no key, Chart.js config in the URL) embedded as `<img>` — renders in any client.
- **Archive/deep-dive:** a self-contained HTML report (inline CSS + the same chart images) stored in `vaibhavcapstone_insights` and retrievable via webhook/MCP.

## Consequences
- Zero cost, zero infra; charts identical in email and report.
- QuickChart is an external free service: chart configs contain only aggregate numbers, never PII. If it's down, the report degrades to tables + narrative (fallback, not failure).
