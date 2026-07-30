# Session 0 — The Big Picture

*Status: taught, teach-back pending. Sources: `docs/architecture.md`, `docs/contracts.md`, `docs/domain.md`.*

## The problem in one sentence

Small businesses drown in enquiry emails: some are gold (a company wanting 40 desks),
some are noise (spam, vendor pitches), and replying well to all of them takes hours a
day. SalesGenie reads every enquiry, figures out what the customer wants, scores how
serious they are, picks real in-stock products to suggest, writes a reply in the shop's
voice — and then **stops and waits for a human to approve it** before anything is sent.

## The analogy: a furniture showroom's back office

Imagine Oak & Ember Interiors hires a back-office team. Nobody on this team ever talks
to a customer directly — everything funnels through one manager's signature.

| Employee | Workflow | What they do |
|---|---|---|
| **Front desk** | 01-Intake | Logs every walk-in into the register, stamps a file number, rejects nonsense at the door |
| **Mailroom translator** | 02-GmailAdapter | Opens the post, turns letters into the front desk's standard form |
| **The reader** | 03-ClassifyExtract | Reads the enquiry: is this a real customer? What do they want, what's their budget? |
| **The appraiser** | 04-Qualifier | Scores how serious the customer is: HOT / WARM / COLD |
| **Stockroom clerk** | 05-Recommender | May only suggest items *physically on the shelf* — checks the stockroom twice |
| **Letter-writer** | 06-DraftHITL | Drafts the reply in the shop's voice, then waits for the **manager's signature** |
| **Monday reporter** | 07-WeeklyInsights | Every Monday 8am: charts + a plain-English summary of the week |
| **Firefighter** | 00-ErrorHandler | When anyone drops a file, files it in the "problems" drawer and alerts the owner |
| **Receptionist for the owner** | 08/09-MCP | The owner phones in plain English: "set up my shop", "approve that draft" |
| **The waker-upper** | 10-ResumeParked | When a missing shelf/manager finally exists, pulls parked files out of the drawer |
| **The nagger** | 11-NeedsReviewNotify | Every 10 min: "boss, the reader gave up on this one, please look" |
| **Night auditor** | 12-LLMJudge | A grader from a *different company* re-checks the team's work for made-up facts |
| **Trade entrance** | 13-A2AServer | A side door where other companies' robots can ask to buy, politely |

Two things make this a *platform*, not one shop's tool:

1. **Multi-tenant**: the same 14 employees serve every business. What differs per shop
   lives entirely in a config row (tone, currency, reviewer email, scoring weights,
   catalog). Rule: no workflow ever branches on a business_id.
2. **Headless**: there's no app UI. Owners talk to it in chat (MCP), reviewers act
   from their inbox, reports arrive by email.

## Two planes

- **Control plane** (WF-08/09, MCP): where a business is *configured* — profile,
  catalog, reviewer. Writes to `businesses`, `products`.
- **Data plane** (WF-01→06, 07, 00): where each lead is *processed*, reading that
  config at runtime.

Analogy: the control plane is HR + shop-fitting (hire the manager, stock the shelves);
the data plane is the daily assembly line handling customer files.

## The Envelope: the routing slip

n8n workflows can't remember anything between runs, so agents pass a standard slip
stapled to every file (contracts.md §1):

```json
{ "envelope_version": "1.0", "business_id": "...", "lead_id": "...",
  "trace_id": "...", "agent": "...", "status": "ok", "payload": { } }
```

Every agent checks the slip on arrival (wrong slip → straight to the firefighter).
`trace_id` is stamped at the front desk and never changes — it's how one enquiry can
be followed through every desk, every database row, and every LLM call.

## Where does memory live? Postgres.

n8n holds no state between executions. **Anything that matters is a row** in a
`vaibhavcapstone_*` table: the lead, what was extracted, the score, the recommended
SKUs, the draft and its approval status, every event, every LLM call. That's why S1
is SQL — the database *is* the system's memory, audit log, and single source of truth.

## The lead's journey (status state machine)

```
RECEIVED → CLASSIFIED → EXTRACTED → QUALIFIED → RECOMMENDED
        → DRAFTED → PENDING_APPROVAL → APPROVED → SENT
Side exits: DISCARDED_SPAM · DISCARDED_NOT_ENQUIRY · REJECTED
Waiting rooms: AWAITING_SETUP (shop not ready — a product state, NOT an error)
              NEEDS_REVIEW (AI unsure — human triage)
Problem drawer: DEAD_LETTER (unrecoverable error)
```

## The four hard guardrails

1. **Grounding** — only SQL-verified, in-stock SKUs are ever recommended.
2. **HITL** — nothing reaches a customer without a human approval; the send node is
   only reachable from APPROVED, enforced in the database itself.
3. **Privacy** — prompts get only the fields a step needs; PII stays in Postgres.
4. **LLM discipline** — validate the LLM's output, retry once, fall back to a
   different vendor (Gemini → gpt-4o-mini), and if all fails, park for a human.
   The AI failing never crashes the pipeline or silently drops a lead.

## Live state at time of teaching (2026-07-30)

Stack healthy: n8n :5678, Postgres :5432, Langfuse :3100. Three tenants exist:
`biz_oakember` (seeded), `biz_greenthumb` and `biz_pagebindbooks` (born via MCP chat).

## Teach-back Q&A (answered 2026-07-30)

1. **Gibberish email — what happens?** Vaibhav: "goes to human review" ✅ (NEEDS_REVIEW).
   Missed: the reader (03) only *stamps* the status — the employee who actually alerts
   a human is the **nagger (11-NeedsReviewNotify)**, sweeping every 10 min, exactly one
   email per file. (Why a separate sweeper? Revisit in S7.)
2. **Why never branch on business_id?** Took a simpler re-ask. Landed on: hardcoded IF
   branches mean a new tenant matches NO branch — leads silently fall off the edge, and
   a developer must edit workflows for every new shop. Config rows in the DB mean the
   workflow asks one neutral question ("does THIS shop's row have what I need?") and
   parks in AWAITING_SETUP when missing. **Config rows scale; IF branches don't.**
3. **Only path to a customer email?** ✅ Full journey recited correctly from memory.
   Refinement added: approval has two doors (inbox link, MCP chat) but one lock —
   the PENDING_APPROVAL → APPROVED transition guarded in Postgres.
