# SalesGenie v2 — a headless, multi-tenant agentic sales platform

A business describes itself in one English sentence and inherits a complete AI sales pipeline: lead intake, classification and entity extraction, deterministic scoring, stock-grounded product recommendations, human-approved replies, and a weekly self-explaining insights report. No admin screen exists anywhere in the system — everything is done by talking to it, calling it, or emailing it.

Built on **n8n** (14 workflows, authored via its REST API) + **Postgres** + **Gemini 2.5 Flash** (gpt-4o-mini fallback) with **GPT-4o as a cross-vendor judge**, **Langfuse** for per-token LLM observability, QuickChart for email-safe charts. All free-tier, all local.

## ▶ See it work

**[Watch the 10-minute demo](https://github.com/vaibhav0904/salesgenie/releases/tag/demo-v1)** —
a business born by chat, an enquiry that parks itself until the shop is ready and resumes
on its own, two attempts to make the AI lie (both fail), the weekly cost report, and
another company's AI buying over A2A while a human still holds the pen. Recorded live
against this system; every number on screen traces back to a `vaibhavcapstone_*` row.

## Run it for your own business

**→ [The complete setup guide](docs/business-onboarding-guide.md)** — about 45 minutes,
no command line, free tiers throughout. That is the path to follow if you want to *use*
this rather than read about it.

**What you need before you start:**

| Piece | Required? | What happens without it |
|---|---|---|
| **Hosted n8n** with a public URL (n8n Cloud, or self-hosted anywhere) | Yes | Nothing runs |
| **A Postgres database** (Supabase / Neon free tier) | Yes | Nothing runs — this is the system of record |
| **A Google Gemini API key** (free tier) | Yes | No reading, scoring or drafting |
| **An OpenAI API key** | Optional | No fallback when Gemini is down, and no independent quality judge |
| **A mailbox with SMTP** (Gmail app password works) | Yes | No approval requests, no alerts — and approval is the whole safety model |
| **IMAP on that mailbox** | Optional | The email door is off; the webhook, chat and A2A doors still work |
| **An invented bearer token** | Optional | No chat (MCP) control; you would set up over HTTP instead |
| **A Langfuse Cloud account** (free) | Optional | No per-call LLM tracing; the Monday report still shows cost and quality from your own database |

Your AI keys and mailbox password go into **n8n's Credentials**, not into `.env` —
`.env` is only for the helper scripts. [`docs/workflows-reference.md`](docs/workflows-reference.md)
lists the seven credentials and their exact names.

**One thing you must not skip:** these exports were built against `http://localhost:5678`,
which appears 20 times across 5 files — five of them buried inside SQL queries and Code
nodes. Run `node scripts/retarget-host.js --base https://your-n8n-url` before importing;
it rewrites all of them and prints the handful it cannot fix for you.

**Understanding what you are running:**
[`docs/workflows-reference.md`](docs/workflows-reference.md) documents all 14 workflows —
what each does, what starts it, its endpoints, which credentials and database tables it
uses, and how they call each other. It is generated from the exports, so it cannot drift.

## Three doors, one pipeline

```
Email  ──▶ 02-GmailAdapter ─┐
Webhook ────────────────────┼─▶ 01-Intake ─▶ 03-ClassifyExtract ─▶ 04-Qualifier ─▶ 05-Recommender ─▶ 06-DraftHITL ─▶ 🧑 approve ─▶ send
MCP chat ─▶ 09-MCPOperations┘
Other AI ─▶ 13-A2AServer      (A2A protocol: agent card + JSON-RPC; the human gate is visible as `input-required`)
```

- **Email** — a tagged mailbox; the adapter turns mail into the same canonical payload as everything else.
- **MCP chat** — 12 tools over two MCP servers; a business onboards, uploads a catalogue, checks status, approves drafts, entirely in natural language (Claude Desktop or any MCP client).
- **A2A** — another company's agent discovers the public agent card, sends an enquiry via `message/send`, polls `tasks/get`, and *sees the human approval gate* as the protocol state `input-required`.

Four invariants hold everywhere:

1. **No customer-facing send without a human click.** The send node is only reachable from an `APPROVED` record — enforced by a guarded SQL transition, not workflow shape.
2. **Recommendations only from SQL-verified, in-stock, own-tenant SKUs** — checked before *and* after the model picks. No verifiable option → the system says so and routes to a human.
3. **Tenant behaviour comes only from config.** No workflow branches on a business id (regression-tested by grep).
4. **A half-finished setup is a product state, not an error.** Leads that arrive early park in `AWAITING_SETUP` and resume by themselves when the missing piece lands.

## Quickstart — a brand-new business, no seed data

The platform needs **zero seed files**. The demo tenant in `db/002` is optional test data, nothing more.

### 0. Prerequisites

- Docker, Node ≥ 18.
- An **n8n ≥ 2.x + Postgres 16** stack. Any arrangement works; the author's compose reference (ports, volumes, network) is in [`docker/README.md`](docker/README.md). Postgres needs a `salesgenie` database.
- `cp .env.example .env` and fill it: Postgres password, Gemini + OpenAI keys, Gmail app password (only if using the email door), an MCP bearer token you invent, Langfuse init values.
- Optional but worth it — **Langfuse** (self-hosted, compose file included):
  ```bash
  cd docker && docker compose --env-file ../.env -f langfuse-compose.yml up -d
  ```
  First boot provisions the org/project/user headlessly from `.env` — there is no signup screen.

### 1. Database

Apply migrations in order (`002` is the **optional** demo tenant — skip it for a clean platform):

```bash
docker exec -i <postgres-container> psql -U salesgenie -d salesgenie < db/001_schema.sql
docker exec -i <postgres-container> psql -U salesgenie -d salesgenie < db/003_llm_observability.sql
docker exec -i <postgres-container> psql -U salesgenie -d salesgenie < db/004_a2a.sql
docker exec -i <postgres-container> psql -U salesgenie -d salesgenie < db/005_exact_usage.sql
```

Skipping 003–005 leaves the core pipeline working but silently disables the LLM judge, the A2A door and the AI-health section of the weekly report — see [`n8n/workflows/README.md`](n8n/workflows/README.md).

### 2. Import the workflows

Follow [`n8n/workflows/README.md`](n8n/workflows/README.md) — it lists the seven credentials (exact names matter), the publish order (sub-workflows deepest-first: `06 → 05 → 04 → 03 → 10`, then the rest), and the two per-instance re-pointing steps (`Execute Workflow` nodes and the error workflow reference IDs, not names).

### 3. Onboard your business — pick either route

**Route A — MCP chat** (Claude Desktop or any MCP client). Two servers, both bearer-authenticated:

```
http://localhost:5678/mcp/vaibhavcapstone-onboarding    create_business · upload_catalog · set_reviewer ·
                                                        get_setup_status · update_business_config · get_intake_endpoint
http://localhost:5678/mcp/vaibhavcapstone-operations    send_test_lead · get_lead_status · list_pending_approvals ·
                                                        approve_draft · reject_draft · get_insights
```

> **Claude Desktop on Windows:** launch the servers with `node <absolute path to mcp-remote>`, **never `npx -y`** — npx re-resolves on every start and blows Desktop's 60-second initialize deadline, which surfaces as "MCP tools are not available" (full writeup: `stories/done/BUG-007-…`). `scripts/verify-desktop-mcp.js` proves the connection in one command.

Then just talk:

> *"Set up a new business on SalesGenie: Green Thumb, a garden retailer in Pune. Tone: warm and practical. Currency INR."*
> *"Here's the catalogue: …"* — CSV header must say **`stock_qty`** (a column named `stock` silently loads as zero stock; BUG-009)
> *"Set the reviewer to you@example.com"*

**Route B — plain HTTP** (each MCP tool is also a webhook; no chat client needed):

```bash
curl -s -X POST http://localhost:5678/webhook/vaibhavcapstone-tool-create-business \
  -H "Content-Type: application/json" \
  -d '{"name":"Green Thumb","industry":"garden-retail","city":"Pune","currency":"INR"}'
# → {"business_id":"biz_greenthumb", ..., "next_steps":["catalog: use upload_catalog","reviewer: use set_reviewer"]}

curl -s -X POST http://localhost:5678/webhook/vaibhavcapstone-tool-upload-catalog \
  -H "Content-Type: application/json" \
  -d '{"business_id":"biz_greenthumb","csv":"sku,name,category,price,currency,stock_qty\nGRD-001,Terracotta Planter,planters,1499,INR,40"}'

curl -s -X POST http://localhost:5678/webhook/vaibhavcapstone-tool-set-reviewer \
  -H "Content-Type: application/json" \
  -d '{"business_id":"biz_greenthumb","reviewer_email":"you@example.com"}'
```

### 4. Send the first lead

```bash
curl -s -X POST http://localhost:5678/webhook/vaibhavcapstone-intake \
  -H "Content-Type: application/json" \
  -d '{"business_id":"biz_greenthumb","from_name":"Ananya Rao","from_email":"ananya@byteleaf.example",
       "subject":"Planters for our terrace",
       "body":"We need 15 large outdoor planters plus soil, budget Rs. 40,000, within 3 weeks."}'
```

~30 seconds later the lead sits at `PENDING_APPROVAL` — scored, matched against your real stock, drafted in your tone — and the reviewer has an email with **Approve / Reject** buttons. Send a lead *before* uploading a catalogue and it parks in `AWAITING_SETUP` instead, then resumes on its own when the catalogue arrives. That is deliberate.

### 5. The other doors

```bash
# A2A: what other companies' agents see
curl -s "http://localhost:5678/webhook/a2a-agent-card?business_id=biz_greenthumb"
node scripts/buyer-agent-demo.js biz_greenthumb          # plays an external procurement agent end to end

# Weekly insights (also runs on cron, Mon 08:00)
curl -s -X POST http://localhost:5678/webhook/vaibhavcapstone-insights-run
curl -s "http://localhost:5678/webhook/vaibhavcapstone-insights-latest?business_id=biz_greenthumb"
```

## Scoring — deterministic, per-tenant, no code to change it

The AI extracts facts; **a plain rubric computes the score** (LLMs never do arithmetic here). Defaults: specific products +20, stated budget +25 (+15 if it fits the catalogue, **−40** if below the cheapest item), real time pressure +20, B2B +10 … clamped 0–100; **HOT ≥ 70, WARM ≥ 40**. Every lead stores its factor-by-factor breakdown for audit.

Any tenant can reweight any factor or threshold — by one MCP chat sentence, one HTTP call, or one SQL update. Full rubric and all three override recipes: [`docs/scoring.md`](docs/scoring.md).

## Evals — labels written before prompts, sampling fixed in the open

A 10-email labelled dataset (every branch: bulk B2B, vague browser, budget-below-catalog, out-of-stock ask, vendor pitch, spam, gibberish) gates changes to prompts. Ground truth was written **before** the first prompt existed and has never been edited to match output.

Current, reproducible results (`evals/run-evals.js`, deterministic row selection):

- **Classification:** 10/10 in **all 5** replay runs; spam recall 100% in every run.
- **Extraction:** 92.2–96.9% across 5 runs, median **95.3%** (8 ENQUIRY emails × 8 fields). 12 of the 17 total misses are the same three adjacent urgency judgment calls, documented in `docs/assumptions.md`.
- **Hallucination:** zero invented fields in 4 of 5 runs; the single exception invented an urgency for the *gibberish* email — which the confidence gate had already routed to a human, so nothing downstream consumed it. Counted and reported anyway.
- **Grounding:** every recommended SKU verified in-stock for its own tenant, before and after model choice.

Full spread with every miss tallied: [`evals/results/2026-07-30-extraction-spread.md`](evals/results/2026-07-30-extraction-spread.md).

An earlier single-run figure (98.4%) turned out to be a favourable draw from a nondeterministic sample — the harness was grading an arbitrary replay. The bug, the fix and the honest spread are documented in `stories/done/BUG-010-…` and `evals/results/`. The spread is the number; the story of finding it is part of the submission.

## Security posture (MVP — stated, not hidden)

- Secrets live only in `.env` (gitignored; template in `.env.example`). n8n exports contain credential *references*, never contents.
- MCP endpoints require a bearer token; **the intake webhook is unauthenticated** — fine locally, a per-tenant key in production. This is the biggest known gap.
- One shared bearer for all tenants (per-tenant keys are the production fix); prompts receive only the fields a step needs; chart URLs carry aggregates, never PII.
- Full list with reasoning: [`docs/assumptions.md`](docs/assumptions.md).

## Repo map

| Path | What |
|---|---|
| `n8n/workflows/` | The 14 workflow exports + import guide (every canvas annotated with sticky notes) |
| `db/` | Migrations (001 schema · 002 **optional** demo tenant · 003 LLM observability · 004 A2A · 005 exact token usage) |
| `docs/` | `architecture.md` · `contracts.md` (Envelope, state machines) · `scoring.md` · `traceability.md` · `assumptions.md` · `metrics.md` · ADRs |
| `evals/` | Labelled dataset, harness, dated results |
| `stories/` | Every unit of work as a card — including every bug, with root cause (`BUG-001…010`) |
| `data/` | Fictional seed enquiries (all `.example` addresses) + demo catalogues |
| `scripts/` | `buyer-agent-demo.js` (A2A client) · `verify-desktop-mcp.js` (MCP rig check) |
| `presentation/` | Demo video script, deck content |

## The brief (summarised — course PDF not redistributed)

Interview Kickstart "Applied Agentic AI for PMs" capstone: build an AI sales assistant for a furniture retailer — qualify inbound leads, recommend products from the catalogue, draft replies, report weekly. This project answers with a *platform*: the furniture retailer is simply tenant #1.

## License

MIT — see [LICENSE](LICENSE).
