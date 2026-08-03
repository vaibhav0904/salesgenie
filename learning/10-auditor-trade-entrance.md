# Session 10 — The Night Auditor & The Trade Entrance (WF-12 LLMJudge, WF-13 A2AServer) + Evals

*Taught 2026-08-01 with two live runs. Closed ✅.*

## Core ideas

- **Auditor (12):** nobody grades their own homework — GPT-4o (different company)
  grades Gemini's extractions/reasons/drafts every 30 min. One narrow question:
  faithfulness (invented anything not in the source?). Score 1–5 + violations;
  ≤2 → alarm email. One-grade-per-artifact uniqueness rule (claim-stamp family).
  **No fallback by design:** audits can wait (not time-critical) AND the only
  fallback would be the doer grading itself. Judge calls get llm_calls receipts
  like everyone else.
- **Trade entrance (13):** robots as customers (A2A protocol). Public business
  card (unauthenticated GET, states "every offer is reviewed by a human");
  bearer-protected JSON-RPC counter: message/send → task id; tasks/get → status.
  **Thin adapter into the SAME front desk** — no second pipeline, so grounding/
  HITL/telemetry hold by construction for any new channel.
  Masterstroke mapping: PENDING_APPROVAL → `input-required` — the human gate
  visible over the protocol.
- **Evals:** answer keys written BEFORE tuning, never edited to match output
  (else every exam passes forever and numbers mean nothing). Four cases:
  classification (100% spam recall), extraction (≥90%, zero invented fields),
  qualification, grounding (100% non-negotiable). Eval-gated stories; dated
  result files; regressions → bug cards.

## Live runs (2026-08-01)

- Judge sweep: today's artifacts (Lumen Candles, Northwind chairs) graded 5/5,
  0 violations ("all extracted fields are supported by the email text";
  "draft fully grounded, only allowed products, correct prices").
- Buyer demo (`node scripts/buyer-agent-demo.js biz_oakember`): card discovery →
  message/send → working (QUALIFIED) → working (RECOMMENDED) →
  **input-required** ("a human reviewer is checking") → approved via chat lane →
  completed with artifact: prose offer + CHR-001/002/003 with real prices.

## Teach-back — closed

1. Half → completed: audits can wait (not urgent) AND fallback = doer grading
   itself, the exact corruption the auditor prevents.
2. ✅ same pipeline by construction — thin adapter to the same front desk;
   new channels are new doors, never new kitchens.
3. ✅ adapting keys → every exam passes forever → numbers measure agreement
   with yourself, not accuracy. Failures become bug cards, not label edits.
