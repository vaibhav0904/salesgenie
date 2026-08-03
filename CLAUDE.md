# SalesGenie v2

Headless, multi-tenant agentic sales platform (capstone): businesses onboard in natural language over MCP, get lead qualification, grounded recommendations, weekly insights. Oak & Ember is tenant #1.

## Tech stack
n8n (Docker, authored via REST API) · Postgres (compose) · Gemini 2.5 Flash (pipeline; gpt-4o-mini fallback) · OpenAI gpt-4o (judge) · Langfuse self-hosted :3100 (LLM traces) · QuickChart · Gmail. All free-tier, local.

## Where things live
- `docs/architecture.md` — picture; `docs/contracts.md` — Envelope, payloads, state machines; `docs/traceability.md` — LLM observability
- `docs/adr/` — decisions; `docs/domain.md` — vocabulary; `docs/assumptions.md` + `docs/metrics.md` — limits & KPIs
- `stories/backlog|in-progress|done/` — all work; `stories/README.md` — lifecycle; `stories/STATUS.md` — live dashboard; `prds/` — one PRD per epic; `evals/` — dataset, cases, results
- `db/` — migrations/seeds; `data/` — seed emails + catalogs; `n8n/workflows/` — exports + import guide; `docker/` — compose

## Commands
- `/prd` `/story` `/testplan` `/implement` `/review` `/eval <case>` `/bug <desc>` — see `.claude/commands/`
- Evals: `node evals/run-evals.js` · Replay: POST a seed email to `/webhook/vaibhavcapstone-intake`
- Insights: `POST /webhook/vaibhavcapstone-insights-run` · `GET /webhook/vaibhavcapstone-insights-latest?business_id=…`
- Deploy a workflow edit: PUT via API, then deactivate→activate · A2A demo: `scripts/buyer-agent-demo.js [business_id]`
- Environments: `docs/environments.md` · reset: `scripts/reset-test-db.js` / `reset-demo-db.js`

## Conventions
- Workflows `VaibhavCapstone-<NN>-<Name>`; tables `vaibhavcapstone_<name>`; every row keyed by `business_id`.
- Agents exchange Envelope (contracts.md §1), validated on entry; `trace_id` flows everywhere; every step writes an Event.
- Tenant behavior comes ONLY from `businesses` config — never branch on a business_id.
- Stories: end-user perspective first; bugs filed immediately; eval-gated needs a result.
- Secrets only in `.env` (template `.env.example`) — never in code, workflows, or exports; `.mcp.json` loads via dotenv-cli.

## Gotchas
- Old v1 artifacts: reference only. n8n holds no state between runs — persist to Postgres.
- Email clients don't run JS: email charts are QuickChart PNG `<img>`s.
- Missing tenant config is a PRODUCT state (AWAITING_SETUP), not an error.
- n8n 2.x API: PUT edits DRAFT only, rejects off-schema settings (`binaryMode`) — whitelist; Code-node errors only in `stack`; waiting executions invisible.
- Exports drift: UI edits strip defaults, move nodes — re-export first.
- Gmail IMAP SUBJECT search loose — outbound mail can self-ingest; WF-02's self-sender guard (BUG-001).
- No `jq` — validate JSON via `node -e`. JS `String.replace`: `$'`/`$&` expand — use a replacer.
- `:param` webhook paths get UUID-prefixed — use static paths + query params. Code nodes can't read env vars — use `platform_config`/credentials.
- `sendAndWait` pauses BEFORE parallel branches — side-effect nodes must sit inline first.
- n8n's Gemini node strips `usageMetadata` — call sites use HTTP `generateContent` (thinking tokens made estimates 36× low).
- In `splitInBatches` loops, `$('X').first()` repeats iteration 1 — use `.item`.
- Test/demo share one credential (`Capstone-Postgres`) — its Database field is the switch.

## Hard rules
- No customer-facing send without human approval; send node reachable only from APPROVED.
- Recommendations only from SQL-verified, in-stock tenant SKUs; no verifiable option → say so.
- No epic without an approved PRD; no build without test cases; no promote without UAT sign-off; one story at a time.
- No PII in prompts beyond what's needed; none in chart URLs. Never tune labels to match output.

## Self-improvement
Living file — update in the same story when conventions/gotchas/commands change; keep under 500 words.
