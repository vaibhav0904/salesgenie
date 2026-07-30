# SalesGenie v2 — Initial Plan (rough)

Headless, multi-tenant agentic sales platform. Oak & Ember (furniture retail) is
tenant #1, but the point is: ANY business onboards in natural language over MCP
and immediately gets the full pipeline. No tenant-specific logic anywhere —
everything is config keyed by business_id.

## High-level plan
- n8n (Docker, local) is the orchestration engine; built/authored via n8n MCP.
- Postgres (same docker-compose) is the system of record. Tables prefixed
  vaibhavcapstone_, workflows prefixed VaibhavCapstone-.
- LLM: Gemini 2.5 Flash (credential already in n8n).
- Control plane: tenant registry — profile, catalog, tone, reviewer, scoring
  weights, sender identity, setup-readiness state. Written by MCP onboarding
  tools, read by every workflow.
- Data plane pipeline per lead:
  webhook intake (canonical; Gmail trigger is just an adapter)
  → classify (enquiry vs not, spam) + extract entities (Gemini structured output)
  → qualifier agent: score + HOT/WARM/COLD band + reasons (tenant weights)
  → recommender agent: 1–3 items grounded on tenant catalog in Postgres,
    hard SKU/stock verification, "no grounded option" fallback
  → drafter: customer email in tenant tone → human approve/reject via
    email link (n8n Wait) or MCP tool → send on approve only
  → weekly insights: SQL aggregates + Gemini narrative + free charts
    (QuickChart PNGs in email + self-contained HTML report).
- Agents are separate n8n sub-workflows talking through a versioned JSON
  envelope (logical A2A; no literal A2A protocol).
- MCP Server Trigger workflows expose: create_business, upload_catalog,
  set_reviewer, get_setup_status, get_lead_status, list_pending_approvals,
  approve/reject_draft, get_insights, send_test_lead.
- Setup-incomplete tenants degrade gracefully: leads park in AWAITING_SETUP,
  get_setup_status says exactly what's missing, parked leads reprocess when
  fixed.
- Test twice: Tenant A fully configured end-to-end; Tenant B onboarded halfway
  via MCP, proves parking + guided completion + reprocess.
- Global error handler workflow: audit log, dead-letter, alert email.

## What I'm sure about (non-negotiables)
- Headless + multi-tenant: any business, natural-language onboarding via MCP,
  zero per-tenant code.
- The three capstone capabilities must demonstrably work: lead qualification,
  grounded product recommendations, weekly sales insights.
- No customer-facing message is ever sent without human approval.
- Recommendations must be grounded: only real SKUs from the tenant's catalog.
- n8n + Postgres + Gemini 2.5 Flash; everything runs locally in Docker; the
  whole stack (including charts) is free of cost.
- Channel-agnostic intake: webhook is canonical, email is one adapter.
- Visual insights reports (graphs), not just text.
- Naming prefix VaibhavCapstone for workflows and tables.
- Users: sales reps + sales managers of SMB retailers (tenant side), and a
  business operator persona doing setup via MCP chat.
- Deliverable includes exported n8n workflow JSONs.

## What I haven't decided (TBD — the map of the conversation)
- Qualification model: fixed weighted rubric vs pure LLM judgment vs hybrid;
  what the default weights/thresholds are; how much a tenant can override.
- What happens to COLD leads — archive, nurture queue, or nothing.
- Draft revision loop: reviewer can only approve/reject, or also edit text /
  ask the AI to revise with feedback.
- Setup-readiness rules: exactly which config pieces are required vs optional,
  and which pipeline stages each one gates.
- Whether parked AWAITING_SETUP leads auto-reprocess or need a manual kick.
- Catalog ingestion formats: CSV only? JSON? free-text pasted list?
- Per-tenant outbound sender identity: one shared Gmail vs per-tenant SMTP —
  and what tenant B uses in the demo.
- Webhook/MCP security: per-tenant API keys? shared secret? none for demo?
- Dedup/idempotency: same customer emails twice — new lead or merge?
- Spam policy: silently drop, log, or notify.
- Insights report delivery/history: email-only, MCP-retrievable, hosted page?
  How far back history goes.
- Chart specifics: which charts (band mix, volume trend, funnel, category
  breakdown?), QuickChart vs inline Chart.js in the HTML report.
- Multi-language enquiries: detect + respond in-language, or English only.
- Timezone/currency per tenant (affects "weekly" cron and price display).
- Error recovery UX: who unparks dead-lettered leads and how.
- Week-0 baselining mechanics for the success metrics.
- PII retention: how long raw emails are kept; any redaction in logs.
- Whether HOT leads trigger any immediate notification to reps (beyond the
  draft approval email).
- n8n environment portability: how credentials/URLs are parameterized so the
  export imports cleanly elsewhere.
