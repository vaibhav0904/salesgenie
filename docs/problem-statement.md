# Capstone Project 1 — Problem Statement (markdown extraction)

> Source: `05_Official_Problem_Statement.pdf` (Interview Kickstart, "Applied Agentic AI for PMs"). This is a faithful summary for grep-ability; the PDF is canonical.

## Company profile
**Oak & Ember Interiors** — home & office furniture retailer (stylish, ergonomic, sustainable), nationwide showrooms + logistics across India. Investing in AI-powered sales agents for end-to-end customer journeys. Wants to become an AI-first company.

## Situation
- You are an AI PM hired by the CTO (Software Development org).
- Profit-margin pressure → 7% resource cut in the **Sales org**.
- Mandate: investigate the **current sales lead intake process** and propose **agentic-AI interventions** that:
  - Reduce manual effort and response latency,
  - Improve data quality and lead prioritization,
  - Maintain or increase qualified conversions with fewer reps.

## Digitization goals with AI agents
- 24/7 conversational AI support (web + mobile).
- Personalized recommendations from user behavior/preferences.
- Automate product inquiries, availability checks, payment workflows.

## Current sales lead identification process (manual)
1. Potential customer emails the company mailbox.
2. Team reads the email; decides if it's a product/service enquiry.
3. If yes → name + email captured in an Excel sheet.
4. Team searches the person on LinkedIn for more info.
5. Company name, designation, location etc. captured in Excel; cold calls made.

### Challenges
- Manually reading/interpreting emails is time-consuming.
- Manual Excel entry → mistakes, duplicates, omissions.
- Manual product recommendation (per enquiry + budget) is slow and error-prone.
- No standard lead scoring; CRM logging not real-time.

## Assignments
- **Q1:** 3 agentic-AI interventions for sales-funnel productivity. Each: user & pain (1–2 lines), agentic idea (what agent does; key tool/API calls), primary metric & direction, top assumptions & 1 risk.
- **Q2:** Decision-making stakeholders for adopting agentic AI + benefits (3 bullets org-wide, 3 for PMs). Stakeholder + decision/concern, 1 line each.
- **Q3 (the build):** Agentic AI Sales Assistant **"SalesGenie"** that can:
  1. **Qualify leads**
  2. **Send product recommendations**
  3. **Provide weekly sales insights**

### Q3 instructions
- End-to-end flow + system architecture with clear **human-in-the-loop review**.
- Own choice of approach, prompts, tools, data structures — justify design choices.
- Success metrics + baselining plan.
- Sensible guardrails (privacy, grounding, fallbacks).
- Realistic dummy data (emails, catalog, inventory, CRM export…) and mock integrations allowed; **document all assumptions**.

### Deliverables
- Working demo (core capabilities end-to-end).
- Concise slide deck (problem, approach, outcomes).
- ~5-minute demo video.
- **n8n workflow export (JSON).**

## Evaluation (100%)
**Agentic System Design & Orchestration (n8n) — 40%**
- E2E flow correctness ingest → qualify → recommend → insights (12%)
- Node logic & routing clarity; state/branching easy to follow (10%)
- Integrations/mocks wired with basic error handling & retries (10%)
- Modularity & extensibility (8%)

**Data Grounding & Output Quality — 40%**
- Classification & entity-extraction accuracy on sample set (14%)
- Recommendation relevance grounded on catalog/inventory, with rationale (14%)
- Weekly insights usefulness & traceability to underlying data (12%)

**Product Thinking & Metrics — 20%**
- Clear objectives, 3–5 success metrics, simple baselining plan (8%)
- Assumptions explicit, reasonable, minimal for MVP (6%)
- Expected impact/KPI movement at high level (6%)

## Milestones
1. **Live Class 1** — problem, Q1/Q2 discussion, Q3 approach agreed; take-home: Q1/Q2 one-pagers, Q3 approach + assumptions v1, sample-data plan.
2. **Interim Connect 1** — plan locked; sample data created (5–10 emails, catalog/inventory, CRM CSV); n8n skeleton with stub nodes; ≥1 email ingested to placeholder output.
3. **Live Class 2 (70%)** — ingestion + classification + extraction working; recommendation returns 1–3 items from mock catalog; weekly insights draft; E2E on ≥5 emails; slide outline ≤9 slides.
4. **Interim Connect 2** — E2E demo on 5–10 emails; design choices, trade-offs, limits, next two improvements; submission checklist.
