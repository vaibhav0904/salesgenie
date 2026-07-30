# Architecture — decisions + rationale

SalesGenie v2 is a **headless, multi-tenant agentic sales platform**. Oak & Ember is tenant #1; the design goal is that any Business onboards in natural language over MCP and immediately gets the whole pipeline, with zero per-tenant code. Irreversible choices each have an ADR in `docs/adr/`; this file is the connected picture.

## Two planes

```
                       ┌─────────────────────────────────────────────┐
   MCP client (chat)   │                CONTROL PLANE                │
   "Set up my shop" ──▶│  VaibhavCapstone-08-MCPOnboarding           │
                       │  VaibhavCapstone-09-MCPOperations           │
                       │  writes/reads: businesses, products,        │
                       │  setup_state                                │
                       └───────────────┬─────────────────────────────┘
                                       │ config lookup by business_id
                                       ▼
 Customer email ─▶ Gmail Adapter ─┐  ┌─────────────────────────────────┐
 Any channel  ───▶ Intake Webhook ┴─▶│           DATA PLANE            │
                                     │ 01 Intake → 03 ClassifyExtract  │
                                     │ → 04 Qualifier → 05 Recommender │
                                     │ → 06 DraftHITL ──▶ send on      │
                                     │      ▲ human approve only       │
                                     │ 07 WeeklyInsights (cron)        │
                                     │ 00 ErrorHandler (global)        │
                                     └─────────────────────────────────┘
                                       all state in Postgres (vaibhavcapstone_*)
```

- **Control plane** = tenant registry. Business profile, catalog, tone, reviewer, sender identity, scoring weights, setup-readiness. Written only by MCP onboarding tools; read by every data-plane workflow at runtime.
- **Data plane** = per-Lead pipeline + weekly insights. Stateless workflows; all state lives in Postgres so approval/parking survive restarts and are auditable.

**Why:** multi-tenancy by configuration, not by cloning workflows. One set of workflows serves every Business; "headless" means every human touchpoint (onboarding, approval, reporting) works over email/MCP with no bespoke UI.

## Logical agent-to-agent contract

Each capability is its own n8n sub-workflow ("Agent") exchanging a versioned JSON **Envelope** (schema in `contracts.md`). This gives A2A-style modularity — agents are independently testable, replaceable, and their handoffs are explicit — without literal A2A protocol plumbing that n8n can't natively speak.

## The platform boundary: MCP in, A2A out

Two protocols, two audiences, one pipeline (ADR-0011):

- **MCP** is the surface for the *tenant's own operator* — onboarding and operations tools exposed to their chat client (WF-08/09).
- **A2A** is the surface for *other organizations' agents*. Every tenant gets a discoverable Sales Agent (`VaibhavCapstone-13-A2AServer`): Agent Card at `GET /webhook/a2a-agent-card?business_id=…`, JSON-RPC `message/send` + `tasks/get` at `POST /webhook/a2a-rpc?business_id=…` (bearer auth). It is a thin adapter in front of the untouched pipeline — exactly like the Gmail adapter — so grounding, HITL and telemetry hold by construction. Lead states map 1:1 onto A2A task states; notably `PENDING_APPROVAL → input-required`, making the human gate visible to the remote agent. Demo client: `scripts/buyer-agent-demo.js`.

Internally A2A is deliberately **not** used: the agents share one runtime and one trust domain, so the Envelope (ADR-0005) stays.

## LLM observability layer

Every Gemini call site logs to `vaibhavcapstone_llm_calls` (latency, estimated tokens, notional cost, prompt version, schema-validity, attempt/fallback) via fail-safe Postgres nodes — logging can never break the pipeline. A separate **LLM-as-judge** sweeper (`VaibhavCapstone-12-LLMJudge`, OpenAI gpt-4o — doer and grader are different vendors) claims un-judged artifacts and scores extraction faithfulness, draft groundedness/tone, and reasons factuality into `vaibhavcapstone_judge_scores`, alerting the operator on any score ≤ 2. The weekly report's **AI health** section surfaces cost/lead, p50/p95 latency, schema-validity and judge averages — every number reproducible by SQL. Full design: `docs/traceability.md`, ADR-0010.

## Setup-readiness model (graceful degradation)

Each pipeline stage declares the config it needs (catalog → Recommender; reviewer + sender → DraftHITL...). A Business missing a component still gets every stage before the gate; the Lead then **parks** in `AWAITING_SETUP` and `get_setup_status` explains, in plain language, what's missing. Completing setup reprocesses parked Leads. This is what makes "partially onboarded business" a demoable product state rather than an error.

## Guardrails (designed-in, not bolted-on)

1. **Grounding:** Recommender may only emit SKUs verified by SQL against the tenant catalog (existence + stock). No verifiable row → "no grounded option," never an invented product.
2. **HITL:** the Draft state machine lives in Postgres; the send node is only reachable from `APPROVED`. No path sends customer email without a human decision.
3. **Privacy:** PII stays in Postgres; prompts receive only the fields a step needs; every actor action is an Event.
4. **LLM discipline:** structured output with schema validation, one retry, then a **cross-vendor fallback** (Gemini 2.5 Flash → gpt-4o-mini with identical prompts, logged and priced as itself — ADR-0013), then human-triage via Error Handler. LLM failure degrades or parks work; it never crashes the pipeline or silently drops a Lead. The judge has no fallback by design (doer≠grader).

## Quality gates

The seed emails are a **labeled eval dataset** (`evals/`). Classification, extraction, and grounding each have eval cases; the stories that implement them are not "done" until their eval passes. Weekly-insight numbers must be reproducible from `events`/`leads` rows (traceability).

## Key runtime components

| Component | Choice | ADR |
|---|---|---|
| Orchestration | n8n (Docker, local), authored via n8n MCP | 0001 |
| System of record | Postgres in same docker-compose | 0002 |
| LLM | Gemini 2.5 Flash via n8n credential | 0003 |
| Intake | Canonical webhook; Gmail as adapter | 0004 |
| Agent handoff | Versioned JSON Envelope (logical A2A) | 0005 |
| NL setup/ops surface | n8n MCP Server Trigger workflows | 0006 |
| HITL | Email approve/reject + MCP tools | 0007 |
| Charts | QuickChart.io PNGs + self-contained HTML report | 0008 |
| Naming | `VaibhavCapstone-` workflows, `vaibhavcapstone_` tables | 0009 |
| LLM observability | DB tables + LLM-as-judge sweeper (OpenAI grades Gemini) | 0010 |
| A2A | Not internal; boundary Sales Agent per tenant | 0011 |
