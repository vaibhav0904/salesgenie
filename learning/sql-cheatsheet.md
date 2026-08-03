# SQL ↔ n8n Rosetta Stone — grown one concept at a time

Vaibhav writes **nodes, never SQL**. But the product workflows are full of SQL, so
this file is a translation dictionary: each SQL idea, its native-n8n twin (what
Vaibhav actually uses in LearningLab-Data), and the real query where we met it.

## The Rosetta stone

| SQL (you READ this in product nodes) | Native n8n (you USE this) |
|---|---|
| `SELECT col1, col2` | Postgres node → *Select rows* → **Output Columns** option |
| `FROM table` | **Table** dropdown |
| `WHERE x = y AND …` | **Select Rows (where)** condition rows (AND combine) |
| `ORDER BY price ASC` | **Sort** rule (or a separate Sort node) |
| `LIMIT 5` | **Limit** field (Return All = off) |
| `COUNT(*) … GROUP BY status` | **Summarize** node (aggregation: count, split by: status) |
| `JOIN … ON a.id = b.id` | **Merge** node (Combine → match on fields) |
| `config->>'tone'` (jsonb) | just an expression: `{{ $json.config.tone }}` |
| `INSERT` / `UPDATE` | Postgres node insert/update operations (product only — labs never write) |

## The mental model (S1)

| SQL thing | Filing-cabinet analogy | n8n equivalent |
|---|---|---|
| database | the whole cabinet room | (no equivalent — n8n has no shared memory) |
| table | one drawer | a data table |
| row | one card in the drawer | one item |
| column | one field printed on every card | a field |
| primary key | the card's unique file number | — |
| foreign key | "see file #X in the other drawer" | — |

## Concepts met in S1 (SQL shown for READING practice — the product's nodes use these shapes)

**`\dt vaibhavcapstone*`** — list the drawers (13 tables).

**SELECT / FROM** — "show me these fields from that drawer."
```sql
SELECT business_id, name FROM vaibhavcapstone_businesses;
```

**WHERE** — filter which cards come back.
```sql
SELECT sku, name, price, stock_qty FROM vaibhavcapstone_products WHERE stock_qty = 0;
-- → SOF-003 and BED-001: the two deliberate out-of-stock items that test grounding
```

**ORDER BY / LIMIT** — sort, and cap how many rows return.

**COUNT(*) + GROUP BY** — squash rows into per-group summaries.
```sql
SELECT status, COUNT(*) FROM vaibhavcapstone_leads GROUP BY status ORDER BY count DESC;
-- → the whole business at a glance: 21 PENDING_APPROVAL, 14 SENT, 14 NEEDS_REVIEW...
```

**jsonb and `->>`** — a column can hold a JSON pocket; `->>` reaches inside and pulls
one value out as text. This is how "config rows scale":
```sql
SELECT name, config->>'tone' AS tone FROM vaibhavcapstone_businesses;
```
(`AS tone` renames the output column. `->` gets JSON, `->>` gets plain text.)

**JOIN ... ON** — staple matching cards from two drawers together by a shared key.
```sql
SELECT l.subject, e.classification, e.budget_value
FROM vaibhavcapstone_leads l
JOIN vaibhavcapstone_extractions e ON e.lead_id = l.lead_id;
```
(`l` and `e` are nicknames — aliases — declared right after each table name.)

**CHECK constraint** — a rule the drawer itself enforces, e.g. `stock_qty >= 0`,
or lead `status` must be one of the 15 legal values. Bad card → the drawer refuses it,
no matter which workflow (or human) tried to file it.

## Coming later (placeholders)

- UPSERT / ON CONFLICT (S4) · CTE `WITH` (S2) · trigger (S6) · view (S7) ·
  UNION (S10) · `FOR UPDATE SKIP LOCKED`-style claim patterns (S7)
