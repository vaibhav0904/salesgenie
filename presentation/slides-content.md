> **Superseded by [demo-deck.html](demo-deck.html)** — kept in place for
> E13-S1/E14-S3 historical traceability, not current presentation material.

# SalesGenie v2 — Slide Content (paste-ready, matches deck.html 1:1)

> Final per-slide text for the official IK template, in the presenter's own voice. Speaker notes in *italics*. Visuals in [brackets]. Deck artifact: same content, designed.

---

## Slide 1 — Title

**SalesGenie v2** — *a headless, multi-tenant agentic sales platform*

The assignment asked me to build a sales assistant for one furniture company. I built the platform underneath it instead — and the furniture company became its first customer.

Applied Agentic AI for PMs · Capstone #1 · Vaibhav Saraf · July 2026

*Speaker note: open with the rule — "nothing goes on a slide unless I can prove it from a SQL row, an eval file, or a live demo. The evidence table at the end maps every number to its file. Check my work — that's the point."*

## Slide 2 — Problem & Context

Here's the day I was asked to fix. At Oak & Ember Interiors, someone opens every enquiry email, decides if it's real, types the name into Excel, looks the buyer up on LinkedIn, and recommends furniture from memory. It's slow, it drops leads — and the team just lost 7% of its people.

What I decided "good" had to mean: minutes not hours, with zero hand-keying · **never an invented product** · a human approving every outbound word · leadership seeing the funnel weekly without asking.

My constraints: everything free-tier and local (n8n + Postgres in Docker, Gemini, Langfuse, QuickChart, Gmail); no custom UI anywhere; no LinkedIn scraping — deliberately (ToS + PII risk, no MVP value).

**Asked:** fix one company's intake. **Built:** a platform where any business walks in, describes itself in plain language, and gets this entire pipeline. Zero new code per tenant.

## Slide 3 — Objectives & Scope

Five metrics, all computable from the platform's own Postgres rows — no dashboard team required:

| Metric | Direction | Measured (demo sample) |
|---|---|---|
| Time to first response | ↓ sharply | ~19 s pipeline (34.5 min avg incl. the human approval wait) |
| Extraction accuracy | ↑ 95%+ | **95.3%**, **0 hallucinated fields** |
| Auto-qualified rate | ↑ (read with approval rate) | 7/10 fully automatic; 3 sent to humans on purpose |
| Recommendation grounding | **100% non-negotiable** | **100%** — 39/39 SKUs SQL-verified |
| Reviewer approval rate | ↑ 85–90% | **86%** (6 approved / 1 rejected, real clicks) |

In scope: qualify → recommend → weekly visual insights · human gate on every send · multi-tenancy by config · exact LLM telemetry + AI judge · MCP onboarding · A2A at the boundary. Out: payments, CRM sync, nurture, streaming A2A, multilingual.

*Speaker note: automation rate and approval rate only mean something together — push one carelessly and the other tells on you.*

## Slide 4 — Approach: System Overview

[Visual: two-plane + boundary diagram — MCP control plane; data plane pipeline with the approval gate highlighted; Gmail/webhook doors on the left; A2A Sales Agent door on the right; Postgres underneath everything; note "every LLM call → Langfuse trace"]

Three rules produced this shape, and I never broke them:
1. **Tenancy is configuration, not code.** One set of 14 workflows serves everyone; there is no `if business == …` anywhere.
2. **If it matters, it's a Postgres row.** n8n forgets everything between runs; state, approvals and telemetry live in the database. Approvals survive restarts.
3. **Adapters in front of one pipeline.** Gmail is a door. MCP is a door. A2A is a door. The pipeline never knows which door a lead came through.

## Slide 5 — Data & Assumptions

I wrote the answer key before I wrote the prompts. Ten enquiry emails designed to break the system — bulk B2B, vague browser, budget below the whole catalog, out-of-stock request, off-catalog request, vendor pitch, spam, gibberish — each hand-labeled with what a perfect system should extract. That answer key became the contract: **labels never moved to flatter the output.** When the system missed, the miss went on the record.

The catalog has 2 items deliberately out of stock — bait for the stock guardrail. And tenant B was never seeded at all: Page & Bind Books was born in an MCP chat, live.

Assumptions I'm making on purpose (docs/assumptions.md): one enquiry = one lead · confidence 0.6 splits "act" from "ask a human" · scoring weights are a tenant-tunable rubric, not a learned model · urgency = time pressure only (cost me two prompt iterations) · reviewers approve/reject, editing is next · Postgres **is** the CRM.

## Slide 6 — Demo Scenarios & Results

**A · An email becomes an approved reply.** Nineteen seconds after an enquiry lands it's classified, extracted, scored HOT by this tenant's weights, matched to in-stock products only, and drafted. Then everything stops — until a human clicks Approve. That stop is the product.

**B · A business that barely exists yet.** A new tenant onboards by chatting. Half-configured, its first lead doesn't error — it **parks**, with a plain-language note about what's missing. Finish setup, and the parked lead wakes up and completes on its own.

**C · Another company's AI buys from ours.** A procurement agent discovers our tenant's A2A card, enquires, and polls. It sees `input-required` — the human gate, visible over the protocol — then `completed`, with the approved offer as the artifact.

**Scoreboard (5 independent replay runs, 2026-07-30):** classification 10/10 in all 5 (spam recall 100%) · extraction 92–97%, median 95.3% · 0 hallucinated in 4/5 runs — the single exception was on gibberish input already gated to a human · qualification 85.7%, no HOT→COLD · grounding 100% (39/39) · judge averages 5.0/5.0/4.9. Full spread: evals/results/2026-07-30-extraction-spread.md.

## Slide 7 — Limitations & Trade-offs

**The confession that became a feature.** My first telemetry estimated tokens by counting characters — and I labeled it an estimate everywhere. When challenged, I replaced it with exact API-reported usage and discovered the estimates were **36× too low**: Gemini's invisible thinking tokens dominate the bill. Real cost ≈ **$0.0074/lead**, not $0.0002. Both numbers stay in the database, labeled honestly (`usage_source`).

Still simplified, on purpose: intake webhook unauthenticated (**biggest known gap** — fine on localhost, per-tenant keys in production) · A2A polling-only with a shared bearer (declared in the Agent Card) · IMAP polling bounds latency, not the pipeline · Langfuse stores prompt text locally (same trust domain; scrubbing is the production upgrade) · reviewers can't edit yet.

When things fail: an LLM failure retries, then **falls over to a second vendor** — if Gemini goes down entirely, gpt-4o-mini picks up the exact same prompts, logged and priced as itself (I simulated a total outage; a lead ran the whole pipeline on the backup, still SQL-grounded). Beyond that: human triage, never a crash. Chart service down → tables. Two of my three logged bugs were caught by my own demos and monitoring — which is exactly what they're for.

## Slide 8 — Next Steps & Pilot

Next two improvements: reviewer edit-and-send (the most-requested missing verb) · production A2A (per-tenant keys, push notifications).

How I'd baseline it: **Week 0** — the team works exactly as today, logging received/replied timestamps; that's the real baseline. **Shadow week** — the same inbox through the pipeline with every draft human-approved, *which is already how it works*, so the pilot needs no new controls.

What I'd watch: the automation/approval guardrail pair · the judge-score floor (≤2 already emails the operator) · cost per lead in Langfuse — now exact, so drift is visible.

And the growth model? It's the architecture. Every new tenant is a config row, not a project.

## Slide 9 — Appendix & Links

n8n exports: 14 JSONs, scanned clean (n8n/workflows/) · working demo: docker/ (incl. Langfuse), data/, db/ · evals: labeled dataset + dated results (evals/) · decisions: 12 ADRs, contracts, traceability (docs/) · process: 43 story cards incl. bugs (stories/) · guides: business onboarding + full workflow tour (docs/) · Q1/Q2 one-pagers (docs/).

---

# Appendix slides

## A1 — Beyond the brief: the platform DNA

Each of these exists because a question a real PM must answer wouldn't leave me alone: *Who else can use this? What does it actually cost? Who operates it? Who else can talk to it?*

| The brief asked for | What I built | Proof |
|---|---|---|
| A sales assistant for Oak & Ember | Any business onboards in natural language; zero per-tenant code | Tenant B born live in an MCP chat, never seeded; same 14 workflows |
| — no tracking asked — | Every LLM call logged with exact tokens & cost, traced in self-hosted Langfuse, graded by an AI judge | llm_calls + judge_scores · Langfuse :3100 · AI-health in the weekly report |
| "Use n8n" | Fully headless over MCP — onboarding, approvals, status from a chat client, no UI | WF-08/09 · tenant B's entire lifecycle |
| — no interop asked — | A2A at the boundary: other orgs' agents transact with any tenant | WF-13 + buyer-agent demo, proven on both tenants |

## A2 — Observability deep-dive

Every call site calls Gemini's API directly and reads the usage the API itself reports — including the thinking tokens estimates can't see. Each call lands twice: a Postgres row (system of record, feeds the weekly report) and a priced generation in self-hosted Langfuse, where one lead = one clickable trace. I stopped Langfuse mid-run to prove the pipeline doesn't care.

The models are redundant too: every call site falls back cross-vendor (Gemini → gpt-4o-mini, same prompts) on failure, logged and priced as itself (ADR-0013). The judge is a different vendor on purpose — gpt-4o grades Gemini's work; I don't let a model grade its own homework — and for the same reason the judge has no Gemini fallback. The rubric took three versions to calibrate, and gpt-4o-mini couldn't follow it at all; that upgrade decision is written down.

Is the judge awake? I planted five fabrications in a copy of a draft. It scored 1/5, cited all five verbatim, and the alert fired.

**Numbers:** $0.0074 exact cost/lead · estimates were 36× low · 100% schema-valid · tamper test 5/5 caught.

## A3 — A2A deep-dive

I said no to A2A first — inside the platform it's pure overhead (one runtime, one trust domain; ADR-0011). At the boundary, the counterparty is another organization's agent, which is exactly what A2A is for. Favorite detail: our approval state maps to `input-required` — the remote agent literally sees that a person is checking the offer.

[Visual: the real terminal transcript — submitted → working → input-required (human gate callout) → completed with artifact]

The demo earned its keep: the tenant B run exposed a real matching bug (plural "journals" vs "Leather Journal A5") → BUG-003 → fixed → regression-verified.

## A4 — Evidence table

| Claim | Source |
|---|---|
| Classification 10/10 · spam 100% | evals/results/2026-07-26-classification.md |
| Extraction median 95.3% (92.2–96.9% over 5 runs) · 0 hallucinated in 4 of 5 | evals/results/2026-07-30-extraction-spread.md |
| Qualification 85.7% · no HOT→COLD | evals/results/2026-07-26-qualification.md |
| Grounding 100% (39/39) | evals/results/2026-07-26-grounding.md + post-fix re-join |
| ~19 s pipeline · 34.5 min incl. approval | docs/metrics.md |
| Exact $0.0074/lead · estimates 36× low | llm_calls (usage_source='exact_api') · Langfuse · ADR-0012 |
| Judge 5.0/5.0/4.9 · tamper 5/5 | judge_scores · Langfuse scores · E11-S3 outcome |
| Exact-API swap behavior-neutral | full seed replay, identical eval scores (E14-S1) |
| Langfuse down ⇒ pipeline fine | live kill test (E14-S2) |
| Tenant B via MCP, parked & resumed | E8/E10 outcomes · events table |
| A2A completed on both tenants | E12-S2/S3 outcomes · a2a_tasks |
| 43 story cards, bugs included | stories/done/ |

## A5 — Q1 in one slide (all three shipped)

1. **Intake agent** — reads, classifies, extracts; no more Excel. Measured: 95.3%, 0 hallucinated. Risk handled: <0.6 confidence goes to a human, raw text intact.
2. **Qualify + recommend, human-gated** — tenant-configured scoring, SQL-verified products only, human approves every send. Measured: grounding 100%, approval 86%. Risk handled: the guardrail pair.
3. **Insights agent** — Monday email with funnel, quality, AI-health; every number SQL-reproducible. Risk handled: the reproducibility rule caught a real discrepancy.

## A6 — Q2 in one slide

CTO: "lock-in?" → open tooling, 12 ADRs, exports. VP Sales: "transition risk?" → the shadow week is just how it already runs. Reps: "will it misquote?" → it can't; 100% grounded + human approval. IT/Security: "where does data go?" → nowhere; local, .env secrets, bearer gates, tenant isolation. Finance: "the bill?" → exact $0.0074/lead, visible in Langfuse. Legal: "false claims?" → the judge hunts fabrications; a human holds the pen.

Org-wide: minutes-not-hours at flat headcount · zero-error capture with audit trail · business lines onboard themselves. For PMs: every AI decision measurable · guardrail metrics turn debates into data · labels-before-prompts makes prompt changes regression-tested releases.
