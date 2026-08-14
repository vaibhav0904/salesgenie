# Eval spread — 2026-07-30 — 5 independent replay+grade cycles

**Why this exists:** BUG-010 showed the previously published single-run figure (98.4%) was a favourable draw from a nondeterministic sample — the harness graded an arbitrary replay when several shared a tied sort key. After the deterministic fix (`DISTINCT ON … ORDER BY created_at DESC`), the honest question became: *what does this pipeline actually score, run over run?* This file answers with five full cycles — each one replaying all 10 seed emails through the live pipeline (fresh Gemini calls), waiting for terminal states, then grading.

**Method:** per cycle — POST all 10 seed emails from `data/seed-emails/` to the intake webhook, poll until no fresh lead is still in a non-terminal state, then `node evals/run-evals.js` to grade that cycle. Driven from the shell, one cycle at a time; the loop itself was never committed as a script, so reproducing this means repeating those three steps five times rather than running one file. Labels untouched throughout (`git diff evals/datasets/` empty). Model: gemini-2.5-flash, prompt v2, unchanged across runs.

## Results

| Run | Classification | Spam recall | Extraction (8 emails × 8 fields) | Hallucinated | Manual review |
|---|---|---|---|---|---|
| 1 | 10/10 | 100% | 59/64 = 92.2% | 0 | 0 |
| 2 | 10/10 | 100% | 61/64 = 95.3% | 0 | 0 |
| 3 | 10/10 | 100% | 61/64 = 95.3% | 0 | 0 |
| 4 | 10/10 | 100% | 60/64 = 93.8% | **1** | 0 |
| 5 | 10/10 | 100% | 62/64 = 96.9% | 0 | 1 |

**Headline: classification 10/10 in every run · extraction 92.2–96.9%, median 95.3% · hallucination 0 in 4 of 5 runs.**

## Every miss, tallied across all five runs (17 field-misses in 320 field-checks)

| Count | Email | Field | Expected → got | Nature |
|---|---|---|---|---|
| 5/5 | 07 (off-catalog gazebo ask) | urgency | medium → low | adjacent judgment call |
| 4/5 | 05 (student, small budget) | urgency | low → medium | adjacent judgment call |
| 3/5 | 04 (browser, no deadline) | urgency | medium → low | adjacent judgment call |
| 1/5 | 10 (gibberish) | urgency | null → "medium" | **HALLUCINATED** — see below |
| 1/5 | 10 (gibberish) | product_interest | [] → ["furniture"] | over-inference on noise |
| 1/5 | 10 (gibberish) | contact_email | present → null | missed |
| 1/5 | 07 | product_interest | ["outdoor"] → ["gazebos","pergolas"] | more specific than label; flagged for semantic review, arguably correct |
| 1/5 | 05 | budget_currency | INR → "Rs" | normalisation slip |

**Reading:** 12 of 17 misses are the *same* three urgency judgment calls, stable across runs — the medium↔low boundary documented in `docs/assumptions.md` §4 ("urgency means time pressure only" cost two prompt iterations and remains the known weak edge). The scatter (currency form, gibberish handling) is run-to-run model noise.

**The one hallucination, in context:** run 4 invented `urgency: "medium"` for the gibberish email. That email's extraction confidence (0.4) is below the 0.6 action threshold, so the lead was already routed to `NEEDS_REVIEW` — a human sees it; nothing downstream consumed the invented field. The guardrail's job is exactly this case. It is still counted and reported: the eval's zero-tolerance rule marks run 4 FAIL, and that is the correct reading of that run.

## What replaces the old claims

| Old claim | Replaced by |
|---|---|
| "98.4% extraction" | **92–97% across 5 runs, median 95.3%** |
| "zero invented — not once" | **zero invented in 4 of 5 runs; the single exception was on gibberish input already gated to a human** |
| classification 10/10 (single run) | **10/10 in 5 of 5 runs, spam recall 100% in all** |

The prior 26-Jul figures (95.3%, in `2026-07-26-final-regression.md`) were produced when only one row per email existed and are consistent with this spread's median.
