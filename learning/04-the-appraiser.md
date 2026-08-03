# Session 4 — The Appraiser (WF-04 Qualifier)

*Taught 2026-07-31 fully in chat (plain language). Teach-back pending.*

## Core ideas (plain words)

- Job: score every lead 0–100 and band it HOT (≥70) / WARM (≥40) / COLD.
- **Roles flipped vs Session 3:** there, AI did the work and math checked it; here,
  plain math does the work and AI only writes the explanation sentences. The AI
  never touches the number. Why: same lead must score the same every time; every
  score must be explainable point by point; every shop must be able to tune it.
- Point sheet defaults (factory settings, in the Compute Rubric Score node):
  enquiry +15 · name +10 · products +20 · budget stated +25 · budget fits +15 ·
  budget below cheapest in-stock −40 · high hurry +20 / mild +10 · company +10.
  Squash rule: `Math.max(0, Math.min(100, total))` — and the DB CHECK enforces
  0–100 too (belt and suspenders).
- **Who sets the rules:** defaults by the platform builder; ANY shop can override
  any weight/threshold via `config.scoring` in its businesses row; the way a shop
  does that is chat → MCP tool `update_business_config` (config merge). No
  workflow edits, ever.
- Node flow: doorbell → routing-slip check → fetch (only if status EXTRACTED —
  the "already processed" stamp again; also fetches the cheapest in-stock price
  for the −40 rule) → calculator → 5-step AI routine for the write-up →
  safety net (AI fails? the point breakdown itself becomes the reasons — AI
  failure costs style, never the score) → receipt → save (upsert: "write the
  card, or replace it if one's already in the slot") + status → QUALIFIED →
  routing slip → stockroom clerk (WF-05).

## Hands-on result

Vaibhav hand-scored email-01 (Zenith Works): 105 raw (chose mild hurry +10) →
squashed 100 · HOT. Machine: 115 raw (urgency judged "high" by the READER's
extraction) → 100 · HOT. Three replays in DB: all identical 100/HOT.
**Subtle lesson:** the appraiser's math is repeatable, but one ingredient
(urgency) is judged by the AI one desk earlier — the score is only as steady as
the reading it stands on; that's why extraction has its own eval.
AI-written reasons in the DB mention only point-sheet facts — nothing invented.

## Teach-back — answered, session closed ✅ (2026-07-31)

1. ✅ Shop changes it via MCP access. Sharpened: one value in that shop's config
   row changes; the workflow and every other shop stay untouched.
2. ✅ "Scores deterministic; the logic can be presented creatively." Math owns
   the truth, AI owns the storytelling.
3. ✅ Falls back to the rules as reasons — and the lead still reaches QUALIFIED
   on time; the only casualty is prose style.
