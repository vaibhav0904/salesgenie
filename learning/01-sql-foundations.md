# Session 1 — SQL & Postgres from zero, on real data

*Status: taught, exercises pending. Companion: `sql-cheatsheet.md`. Schema: `db/001_schema.sql`.*

## Why this session exists

n8n workflows have amnesia between runs; Postgres is the filing cabinet where
everything that matters is a row. Vaibhav had never queried a database directly
(only n8n data tables), so this is the room of his own building he'd never entered.

## The mental model

Database = cabinet room · table = drawer · row = card · column = field on the card.
Unlike n8n data tables, Postgres drawers have **rules built into the furniture**:
CHECK constraints (a lead status must be one of 15 legal values; stock can't go
negative), foreign keys (an extraction card must point at a real lead card), and
even a trigger that physically refuses illegal draft status jumps (S6).

## How to talk to it

```
docker exec n8n-localdata-postgres-1 psql -U salesgenie -d salesgenie -c "<query>"
```
`docker exec` = "run this inside the postgres container"; `psql` = the cabinet's
front counter; `-c` = one query and return.

## What we ran and saw (2026-07-30)

1. **`\dt vaibhavcapstone*`** → 13 tables. Core 9 from migration 001 + `llm_calls`,
   `judge_scores` (observability), `a2a_tasks`, `platform_config`.
2. **Out-of-stock check** (`WHERE stock_qty = 0`) → exactly SOF-003 (Nook Loveseat)
   and BED-001 (Rosewood King Bed) — the two *deliberately* out-of-stock products
   that exist to prove the grounding guardrail (S5 will use them).
3. **Catalog shape** (`GROUP BY category`) → 8 categories, 20 products, ₹4,499
   (bookshelf) to ₹89,999 (sofa).
4. **Lead statuses** (`GROUP BY status`) → the whole business at a glance:
   21 PENDING_APPROVAL · 14 SENT · 14 NEEDS_REVIEW · 5 DISCARDED_SPAM ·
   4 DISCARDED_NOT_ENQUIRY · 1 REJECTED. (21 drafts are literally waiting for a
   human signature right now.)
5. **jsonb `->>`** on `businesses.config` → each shop's tone/currency/reviewer live
   in a JSON pocket on its card — the S0 lesson ("config rows scale") made physical.
6. **First JOIN** (leads ⋈ extractions on `lead_id`) → the Zenith Works enquiry
   appears 4× as *separate* leads (same seed email replayed on different days —
   each replay mints a new lead_id; the drawer keeps them all).

## Key observations Vaibhav should retain

- A query never *changes* anything unless it says INSERT/UPDATE/DELETE. SELECT is
  always safe to explore with.
- Constraints in the DB protect against *every* writer at once — workflow bugs,
  manual psql, future code. Workflow-level checks protect only that one workflow.
- `business_id` is on almost every card: that one column IS multi-tenancy.

## Exercises (answers to be recorded) — done by BUILDING LearningLab-Data

*(Revision: Vaibhav writes zero SQL — everything through native node UIs. He builds
the lab himself, guided click-by-click.)*

Build: new workflow named **LearningLab-Data** → *Trigger manually* → Postgres node
(credential `Capstone-Postgres`) with operation **Select rows from table**.

1. **Predict, then run:** point the Select node at `vaibhavcapstone_products`,
   add where-condition `price` *smaller than* `10000`, sort by `price` ascending,
   Output Columns `name, price`. BEFORE clicking *Execute step*: what kind of items
   will appear, in what order?
2. **Configure your own:** a second Select node on `vaibhavcapstone_leads` showing
   `subject, from_email` — two where-conditions combined with AND:
   `status` equals `NEEDS_REVIEW`, `business_id` equals `biz_oakember`.
3. **Concept:** why does `stock_qty >= 0` live as a CHECK in the database instead of
   just being careful in workflow code?

## Exercise results (2026-07-30)

1. **Prediction ✅** — items under ₹10k ascending. Bonus discovery: the list mixed
   ALL THREE tenants' products (picture books, potting soil…) because the node had
   no business_id filter — multi-tenancy seen physically. Every product query in
   the real pipeline always filters business_id.
2. **Got 588, truth is 28.** Filters were correct; the node was wired downstream of
   exercise 1's node, and **n8n runs a node once per incoming item**: 21 products ×
   28 leads = 588. Fix: connect from the trigger (parallel) or Settings → Execute
   Once. THE key n8n looping behavior behind the project's splitInBatches gotchas.
3. **CHECK vs IF (Vaibhav's answer, sharpened):** an IF node protects one path in
   one workflow — only executions that pass through it are checked. A CHECK guards
   the data itself at the storage layer, against every writer (14 workflows, MCP
   tools, manual edits, future code), forever.

## Bonus investigation: the 50 mystery leads

Cabinet grew 59 → 109 leads in one day; Vaibhav made no runs. Evidence (grouping
leads by channel + created date): 60 leads created 2026-07-30, channel
`seed-replay`, external_id `seed-email-%` → the GitHub-upload session ran the eval
suite (~6 full passes of the 10 seed emails). Also verified during this: repo now
on GitHub (vaibhav0904/salesgenie) with `.env` ignored and untracked — secrets safe.
Lesson: the cabinet never forgets, and grouping by channel/date answers "who did
this?" in seconds.

## Session closed ✅ (2026-07-30)

- Ex2 re-run after rewiring: **28** ✓ (per-item execution lesson landed).
- Summarize exercise: first attempt fed from the FILTERED node (28 items) →
  27 seed-replay + 1 webhook. Extra lesson: **Postgres nodes query the database;
  Summarize only summarizes the items flowing into it.** Accidental insight: only
  1 of the 28 NEEDS_REVIEW leads is organic; 27 are eval replays.
- 📌 Bookmarked for S3: a seed-email-07 (gazebo, off-catalog) replay was found in
  NEEDS_REVIEW — same email lands in different states on different replays. Why?
  (LLM nondeterminism/confidence — revisit when we open ClassifyExtract.)
