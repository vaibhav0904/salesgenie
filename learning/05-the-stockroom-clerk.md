# Session 5 — The Stockroom Clerk (WF-05 Recommender)

*Taught 2026-07-31 fully in chat, plain language. Teach-back pending.*

## Core ideas

- Strictest rule in the system: only suggest items really on the shelf, right now;
  nothing fits → say so honestly; never invent. Eval bar: 100%, non-negotiable.
- **Two locks:** (1) the AI only sees a pre-approved tray (SQL: this shop, matching
  interest, stock > 0) and a filter afterwards discards anything not on the tray,
  max 3; (2) before saving, SQL re-checks each item exists with stock > 0.
  The AI is never asked "what should we recommend?" — only "which of THESE fit?"
- Fetch details: word-chopping before matching (BUG-003: "sofas" vs "sofa");
  budget cap `price <= budget × 1.15` unless budget > ₹1,00,000 (bulk/project
  total); also fetches catalog size + cheapest in-stock price.
- Honesty gates BEFORE any AI: catalog empty → park AWAITING_SETUP
  (missing: catalog, resume_from: recommend — waker-upper resumes here);
  tray empty → no-grounded lane: recommendation saved with grounded=false +
  precise reason, INTERNAL draft ("reply manually / check stock"), lead →
  NEEDS_REVIEW with reason no_grounded_option. No product → no customer promises.
- Grounded path: 5-step AI routine ranks the tray → Lock-1 filter → receipt →
  Lock-2 verify + save, grounded=true, status → RECOMMENDED → letter-writer.

## Live run (2026-07-31): Vaibhav predicted 3/4

- email-4 chair → ✅ grounded: ErgoPro ₹18,999 + Atlas ₹11,999 → PENDING_APPROVAL
- email-6 Rosewood bed (stock 0) → ✅ predicted "different bed": Oakhaven Queen
  ₹58,999; the landmine never appeared
- email-7 gazebos → ✅ not grounded ("no in-stock item matches gazebo/pergolas/
  outdoor") → INTERNAL draft, NEEDS_REVIEW
- email-5 student ₹2,000 → ❌ predicted grounded-over-budget; reality: not
  grounded ("budget 2000 below cheapest 4499"). **Lesson: honesty beats
  upselling** — the ×1.15 grace didn't reach ₹4,499; the clerk's arithmetic
  enforces the shop's "no pushy sales" tone; a human decides via internal note.

## Correction of the S3 story (verified in DB)

Old S1 gazebo NEEDS_REVIEW leads: ALL parked with reason `no_grounded_option` —
the clerk's honest lane, not confidence wobble. NEEDS_REVIEW = one parking lot,
several doors (reader unsure / answer failed check twice / clerk has nothing);
`status_detail.reason` records which. (Confidence wobble is still real —
email-10 @ 0.4 — it just wasn't the gazebo's door.)

## Teach-back — answered, session closed ✅ (2026-07-31)

1. Partial → taught: Lock 1 guards against imagination; Lock 2 guards against
   **time and bugs** (stock can change during the AI's 5–7s of thinking; and the
   drawer-side check catches anything upstream).
2. Missed the arithmetic → taught: 4,000 × 1.15 = 4,600 ≥ 4,499 → the bookshelf
   now qualifies; grounded suggestion, no review. The grace rule exists for
   near-misses. (Wrinkle: appraiser still applies −40 strictly — band affects
   priority, never service.)
3. ✅ + deepened: a wrong recommendation embarrasses; a wrong auto-rejection
   silently loses a real customer (BUG-003's plural bug made real customers look
   like no-match). "No" to a customer is always a human's call.
