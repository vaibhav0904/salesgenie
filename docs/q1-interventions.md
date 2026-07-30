# Q1 — Three agentic-AI interventions for sales-funnel productivity

> Format per the official problem statement: user & pain (1–2 lines) · agentic idea with key tool/API calls · primary metric & direction · top assumptions + 1 risk. Twist: all three interventions were **built**, so each carries an "evidence from the build" line with its measured result.

---

## Intervention 1 — Intake agent: classify + extract every enquiry

**User & pain.** The sales team reads every inbound email by hand and re-keys names, companies and budgets into Excel — slow, error-prone, and enquiries sometimes go unnoticed for a day.

**Agentic idea.** An intake agent ingests each email (IMAP fetch → canonical webhook), calls the LLM to classify it (ENQUIRY / NOT_ENQUIRY / SPAM) and extract structured entities (contact, company, budget + currency, product interest, urgency, location) with a confidence score, and writes a CRM-grade lead record. Key calls: IMAP fetch → `POST /intake` webhook → Gemini structured-output call (JSON schema enforced) → Postgres insert → event log.

**Primary metric & direction.** Entity-extraction accuracy vs a human-labeled set: **↑ toward 95%+**, with a hard zero-tolerance for hallucinated values. (Secondary: classification accuracy, spam recall.)

**Top assumptions.** One enquiry = one lead (no dedup); English-only; a 0.6 confidence threshold separates "act automatically" from "route to a human".

**Risk.** Low-confidence or garbled emails misprocessed silently → mitigated by the confidence gate: below threshold the lead goes to NEEDS_REVIEW with the raw text intact, never guessed at.

**Evidence from the build.** Classification **10/10** with 100% spam recall; extraction **95.3%** field-level with **0 hallucinated fields** (`evals/results/2026-07-26-*.md`).

---

## Intervention 2 — Qualify + recommend agent, with a human approval gate

**User & pain.** Reps prioritize leads by gut feel and recommend products from memory — inconsistent scoring, occasional misquotes, and no audit trail of why a lead was chased or dropped.

**Agentic idea.** A qualification agent scores each extracted lead against a configurable rubric (budget fit, urgency, specificity, B2B signals) into HOT/WARM/COLD; a recommendation agent selects **only SQL-verified, in-stock SKUs** from the catalog and drafts a reply in the company's tone; a human approves or rejects every outbound message (approval buttons in email, or chat tools). Key calls: Postgres rubric lookup → deterministic scoring → SQL candidate pre-filter → Gemini ranking (allow-listed SKUs only) → SQL re-verification at persist → draft → `sendAndWait` approval → SMTP send.

**Primary metric & direction.** Recommendation grounding rate — recommended SKUs that verify against live catalog rows: **100%, non-negotiable**. Paired guardrail: reviewer approval rate **↑ toward 85–90%** read together with the auto-qualified rate.

**Top assumptions.** Scoring weights are a tenant-tunable starting rubric, not a learned model; reviewers approve/reject but don't edit (edit-and-send is the next feature); per-item budget filtering except bulk budgets.

**Risk.** Pushing automation up erodes reviewer trust (rubber-stamping or rising rejections) → mitigated by treating automation rate and approval rate as a guardrail pair — neither is meaningful alone.

**Evidence from the build.** Qualification band agreement **85.7%** with **zero HOT→COLD misses**; grounding **100%** (25/25 SKUs re-verified); approval rate **86%** on real human decisions.

---

## Intervention 3 — Insights agent: the funnel explains itself weekly

**User & pain.** Leadership has no real-time view of the funnel; understanding lead volume, conversion or response latency means asking someone to build a spreadsheet.

**Agentic idea.** A scheduled insights agent computes funnel, lead-quality and latency metrics straight from the platform's own rows, renders charts as email-safe images, has the LLM write a short narrative over the pre-computed numbers (never inventing them), and emails the report every Monday — including an **AI-health section**: cost per lead, latency percentiles, schema-validity, judge scores. Key calls: cron → SQL aggregate queries → chart-image URLs (aggregates only, no PII) → Gemini narrative over supplied numbers → SMTP.

**Primary metric & direction.** Time-to-insight: **↓** from ad-hoc spreadsheet requests to a standing Monday email; secondary, report trust — every number reproducible by SQL.

**Top assumptions.** Weekly = rolling 7 days at cron time; charts must be static images (email clients don't run JS); narrative is commentary over computed numbers, never a source of them.

**Risk.** Report numbers drifting from the underlying data → mitigated by the hand-reproducibility rule: every figure must be re-derivable by a documented query (this rule caught a real discrepancy during the build — the report's own LLM call landing after its snapshot).

**Evidence from the build.** Weekly report live for both tenants with funnel/band/volume charts + AI health (exact $0.0074 cost/lead from API-reported tokens, p50 5.5 s / p95 8.9 s, 100% schema-valid, judge averages 5.0/5.0/4.9 — every call also visible as a priced trace in self-hosted Langfuse).
