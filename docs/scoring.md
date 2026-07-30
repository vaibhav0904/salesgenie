# Lead scoring — how the number is made, and how to change it

Every lead gets a **score (0–100)** and a **band (HOT / WARM / COLD)** in `VaibhavCapstone-04-Qualifier`. Two design rules govern it:

1. **The arithmetic is deterministic.** The AI never computes the score. It extracts the facts (budget, urgency, company, products); a plain rubric in the `Compute Rubric Score` node adds up points. The LLM's only scoring job is writing the human-readable *reasons* afterwards — so the same facts always produce the same score, and every score can be replayed by hand.
2. **The rubric is per-tenant.** Defaults live in the workflow; any business can override any weight or threshold from its own config, without touching a workflow.

## The default rubric

A lead starts at 0 and collects points:

| Factor | Points | When |
|---|---:|---|
| `base_enquiry` | +15 | it is a genuine enquiry at all |
| `contact_name` | +10 | the customer gave a name |
| `product_interest` | +20 | specific products/categories were named |
| `budget_stated` | +25 | any budget figure was given |
| `budget_fit_bonus` | +15 | that budget ≥ the cheapest in-stock catalogue item |
| `budget_below_catalog_penalty` | **−40** | budget given but below the cheapest catalogue item |
| `urgency_high` | +20 | a real deadline / time pressure (not enthusiasm) |
| `urgency_medium` | +10 | softer time signal |
| `company` | +10 | a business customer (B2B) |

The sum is clamped to 0–100, then banded:

| Band | Threshold (default) |
|---|---|
| **HOT** | score ≥ `hot_min` = **70** |
| **WARM** | score ≥ `warm_min` = **40** |
| **COLD** | below 40 |

Worked example — Ananya's terrace-garden enquiry (name ✓, planters+soil ✓, ₹40,000 stated ✓ and fits ✓, 3-week deadline = high urgency ✓, ByteLeaf Tech = B2B ✓):
15 + 10 + 20 + 25 + 15 + 20 + 10 = 115 → clamped to **100 → HOT**.

The full breakdown is stored on every lead (`vaibhavcapstone_qualifications.breakdown`), factor by factor, so any score can be audited after the fact.

> The demo tenant's seed (`db/002_seed_oakember.sql`) restates these exact defaults in its config — deliberately, so the file doubles as a copy-paste template. Omitting the block entirely gives identical behaviour.

## Changing it — per business, no code

Overrides **merge**: name only the keys you want to change; everything else keeps its default.

### Route 1 — MCP chat (the no-code way)

Say it to the assistant; it calls `update_business_config`:

> *"For Green Thumb, urgency matters more than budget: set the urgency_high weight to 30 and raise the HOT threshold to 75."*

which sends:

```json
{
  "business_id": "biz_greenthumb",
  "config": { "scoring": { "weights": { "urgency_high": 30 },
                           "thresholds": { "hot_min": 75 } } }
}
```

### Route 2 — plain HTTP (same tool, no chat client)

```powershell
curl.exe -s -X POST http://localhost:5678/webhook/vaibhavcapstone-tool-update-config `
  -H "Content-Type: application/json" `
  -d '{"business_id":"biz_greenthumb","config":{"scoring":{"weights":{"urgency_high":30},"thresholds":{"hot_min":75}}}}'
```

### Route 3 — directly in Postgres

```sql
UPDATE vaibhavcapstone_businesses
SET config = jsonb_set(config, '{scoring,weights,urgency_high}', '30'),
    updated_at = now()
WHERE business_id = 'biz_greenthumb';
```

Changes take effect on the **next** lead — scores already written are history, never recomputed.

## Tuning notes

- The weights are a **starting rubric, not a learned model** (see `docs/assumptions.md` §3). They were chosen so that a named, budgeted, urgent B2B enquiry lands HOT and a vague browser lands COLD — then left alone.
- The one aggressive number is the −40 below-catalogue penalty: a stated budget that cannot buy anything in stock is a strong "do not auto-recommend" signal, and it routes the lead toward a human instead.
- `urgency` means *time pressure only* — a deadline or delivery window, not excitement. That distinction is enforced in the extraction prompt and is the source of most remaining eval misses (medium↔low judgment calls).
