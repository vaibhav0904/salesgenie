# Q2 — Decision-making stakeholders for adopting agentic AI, and the benefits

> Format per the official problem statement: stakeholder + decision/concern (1 line each) · 3 org-wide benefits · 3 PM-specific benefits. Each concern is answered by something the build actually ships, not a promise.

## Stakeholders and their decisions/concerns

| Stakeholder | Decision / concern — and the shipped answer |
|---|---|
| **CTO** (sponsor) | Owns architecture and build-vs-buy; concern: lock-in and maintainability → config-driven multi-tenancy on open tooling (n8n + Postgres), 11 written ADRs, exportable workflows. |
| **VP Sales** | Approves the workflow change; concern: quota risk during transition → the shadow-week pilot runs the pipeline behind human approval on the same inbox, so nothing changes for customers until the numbers are in. |
| **Sales reps** (daily users) | Adopt or quietly bypass; concern: "will it misquote a customer?" → recommendations are 100% SQL-grounded against live stock, and a rep approves every outbound message. |
| **IT / Security** | Signs off on data handling; concern: credentials, tenant bleed → secrets only in `.env`, bearer-gated MCP/A2A endpoints, tenant isolation by business-id predicate in every query, full event audit log. |
| **Finance** | Approves recurring LLM spend; concern: unbounded token bills → per-call cost telemetry with cost-per-lead in the weekly report; spend is observable before it is scary. |
| **Legal / Compliance** | Clears outbound automation; concern: PII exposure and false claims to customers → PII-minimized prompts (each step sees only the fields it needs), human-in-the-loop on every send, and an LLM judge flagging fabrications automatically. |

## Benefits — organization-wide

1. **Minutes-not-hours response at flat headcount:** the pipeline drafts in ~19 seconds; reviewers shift from reading-and-writing to approving-and-exceptions, so the same team covers multiples of the enquiry volume.
2. **Zero-error data capture with a full audit trail:** no more Excel re-keying; every lead, decision and message is a queryable row with a trace id.
3. **A growth model built into the architecture:** a new business line (or acquisition) onboards itself in natural language — a config row, not an integration project.

## Benefits — for product managers specifically

1. **Every AI decision is measurable:** evals + LLM-judge scores + per-call telemetry make the system a dashboard, not a black box — the PM can answer "how good, how fast, how much" from SQL.
2. **Guardrail metrics make trade-offs explicit:** automation rate vs approval rate is a visible dial per tenant, so the classic "more automation vs more trust" argument becomes a data conversation.
3. **Eval-first discipline de-risks iteration:** labeled ground truth written before prompts turns every prompt change into a regression-tested release instead of a vibe check.
