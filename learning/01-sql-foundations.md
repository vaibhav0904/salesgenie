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

## Exercises (answers to be recorded)

1. **Predict:** `SELECT name, price FROM vaibhavcapstone_products WHERE price < 10000 ORDER BY price;`
   — what kind of items come back, and in what order?
2. **Write your own:** show subject and from_email of every Oak & Ember lead
   currently in NEEDS_REVIEW. (Drawer: `vaibhavcapstone_leads`; filters needed: two.)
3. **Concept:** why does `stock_qty >= 0` live as a CHECK in the database instead of
   just being careful in workflow code?
