# Assumptions, dummy data & mock integrations

Everything here is an explicit, deliberate simplification for the MVP. Nothing below is hidden behind "it works" — each item names what is real, what is simulated, and what would change in production.

## Dummy data (all fictional, created for this project)

| Artifact | What it is | Where |
|---|---|---|
| Oak & Ember Interiors | Tenant A: fictional furniture retailer from the capstone brief | `db/002_seed_oakember.sql` |
| 20-product furniture catalog | Invented SKUs/prices in INR; **2 deliberately out of stock** (SOF-003, BED-001) to exercise the stock guardrail | `data/catalog-oakember.csv` |
| 10 enquiry emails | Written to cover every branch: bulk B2B, clear-budget B2C, vague browser, budget-below-catalog, out-of-stock request, off-catalog request, vendor pitch, lottery spam, gibberish | `data/seed-emails/` |
| Labeled ground truth | Expected classification, entities, band, plausible SKUs, terminal status — **written before any prompt existed** | `evals/datasets/seed-emails-labeled.json` |
| Green Thumb | Tenant B: fictional garden-retail shop in Pune, created live via MCP chat during the demo video (never seeded) | created at runtime |
| Page & Bind Books | An earlier runtime-created tenant, kept as standing evidence of multi-tenancy | created at runtime |

## Mock / substituted integrations

| Real-world thing | What we did instead | Why |
|---|---|---|
| Per-tenant business mailboxes | One shared Gmail account with IMAP/SMTP app password; the adapter fetches only unread mail whose subject contains `[enquiry]` | No budget for multiple domains; the tag keeps personal mail untouched. Production: a dedicated mailbox (or alias) per tenant, no tag needed. |
| Sending to real customers | `config.customer_email_redirect` reroutes approved replies to the operator inbox with a `[DEMO → real@address]` subject prefix; the intended recipient is recorded in the `EMAIL_SENT` event | The seed customers are fictional; nobody should receive mail. Remove the config key and mail goes to the real address. |
| CRM | Postgres **is** the CRM (leads, extractions, qualifications, recommendations, drafts, events) | Keeps the capstone self-contained; a CRM sync would be one more adapter workflow. |
| LinkedIn enrichment (in the brief's manual process) | **Out of scope.** Extraction uses only what the customer wrote | Scraping LinkedIn is against its ToS and adds PII risk for no MVP value. |
| Payments / order management | Out of scope | The mandate is lead intake → qualification → recommendation → insights. |
| Chart rendering service | QuickChart.io (free, no key). Configs carry aggregates only, never PII | Email clients can't run JS, so charts must be images. If QuickChart is unreachable the report degrades to tables + narrative. |

## Product & modelling assumptions

1. **One enquiry = one lead.** No dedup or thread-merging; a customer emailing twice creates two leads. Deliberate: merging needs an identity model we don't have yet.
2. **Confidence threshold 0.6** (per-tenant overridable via `config.min_confidence`) separates "act automatically" from "ask a human". Chosen from observed Gemini confidence on the seed set, not tuned against labels.
3. **Scoring weights are a starting rubric**, not a learned model: budget stated/fits, urgency, product specificity, B2B, contact completeness. Tenant-tunable in `config.scoring`. HOT ≥ 70, WARM ≥ 40.
4. **Urgency means time pressure only** (deadline/delivery window), not enthusiasm. This distinction cost two prompt iterations and is the source of the remaining eval misses.
5. **English-only.** No language detection or multilingual replies.
6. **Budget filtering is per-item**, except when the stated budget exceeds ₹1,00,000, which is treated as a bulk/total budget so individual items aren't wrongly excluded.
7. **No nurture track for COLD leads** — they're qualified and visible, but nothing automatic happens.
8. **Reviewers can approve or reject, not edit.** An edit-and-send loop is the obvious next feature.
9. **Weekly = rolling 7 days** at cron time (Mon 08:00 IST), per-tenant timezone stored but not yet used for the cron itself.
10. **Setup gates**: catalog gates recommendations; reviewer gates drafting/approval; sender gates the send. Missing config parks the lead (`AWAITING_SETUP`) — a product state, never an error.

## Security & privacy posture (MVP)

- **Secrets** live only in `.env` (gitignored); `.mcp.json` injects them at launch and contains none.
- **MCP endpoints** require a bearer token; **the intake webhook is currently unauthenticated** — acceptable for a local demo, would need a per-tenant key or signature in production. This is the biggest known gap.
- **PII minimization**: prompts receive only the fields a step needs (the drafting prompt never sees the customer's email address, location, or raw message). Chart URLs carry aggregates only.
- **No PII retention policy yet** — raw enquiry text is kept indefinitely for traceability.
- **Tenant isolation** is enforced by `business_id` predicates in every query, verified by test, but not by row-level security. Audited 2026-07-28: all eleven MCP read queries are scoped, and **no tool returns a list of businesses** — a caller can only ever see the business it named.
- **Draft actions are keyed by `draft_id` alone.** `approve_draft`, `reject_draft` and the send transition match on the draft id without a `business_id` predicate, so a caller holding one tenant's draft id could act on it while nominally working on another. This is not a real authorisation boundary in either direction today, because **all MCP access shares a single bearer token** — there is no per-tenant credential to check against. Per-tenant keys are the production fix; adding `business_id` to those queries would be defence-in-depth against *accidental* cross-tenant action only.
- **What the assistant says is not a system guarantee.** The MCP tools return correctly scoped data, but the chat client (Claude Desktop) composes the wording and carries its own conversation memory. It once named a previously-onboarded tenant while setting up a new one — from its own context, not from any tool response. Tool descriptions now instruct it to speak only about the business at hand; that reduces the risk but cannot guarantee a third-party model's output. The hard guarantee remains the data (BUG-006).

## Known limitations

- **Catalogue CSV import silently drops unrecognised columns.** A header of `stock` instead of `stock_qty` loads every product with zero stock; `upload_catalog` still reports success and setup status still reads "configured". The recommender then correctly refuses to ground anything, so the tenant looks broken for a reason nothing surfaces (BUG-009).

- Waiting (paused) executions are invisible to the n8n public API, so HITL state must be read from Postgres, not n8n.
- The Gmail adapter polls; latency is bounded by the IMAP poll interval, not the pipeline (which takes ~19s end-to-end).
- Two remaining eval misses are adjacent urgency judgments (medium↔low); one cascades into a single band miss (seed-email-05).
- No load testing: the design is per-lead and stateless, but concurrency has not been measured.
