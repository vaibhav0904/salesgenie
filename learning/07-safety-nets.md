# Session 7 — The Safety Nets (WF-00 Firefighter, WF-11 Nagger, WF-10 Waker-Upper)

*Taught 2026-07-31/08-01 fully in chat. Closed ✅.*

## Core ideas

- Nothing fails silently. Three ways a file stops, three catchers:
  NEEDS_REVIEW → nagger · AWAITING_SETUP → waker-upper · DEAD_LETTER → firefighter.
- **Firefighter (00):** error bell rings for any workflow crash → read the
  LEAD:|TRACE: file-number tag off the error → dead-letter that lead (unless
  already safely finished) → log WORKFLOW_ERROR → "Real Failure?" filter
  (BUG-005: alarms that cry wolf get ignored) → email the owner.
  Live check: **DEAD_LETTER count = 0** across 100+ leads (net tested by E16-S1).
- **Nagger (11):** one sweeper every 10 min covers ALL doors into NEEDS_REVIEW
  (reader unsure / checks failed twice / clerk no-match — and future doors).
  Claim query stamps-and-selects in one motion → exactly one email per file ever
  (stamp lives in the status_detail JSON pocket). Verified: S5's two parked leads
  carry exactly one stamp despite ~20 sweeps since.
- **Waker-upper (10):** not on a timer — called by onboarding (08) right after
  catalog upload / reviewer set. Finds parked files whose missing thing now
  exists (checks the live setup_state view), re-enters each file EXACTLY where it
  parked (resume_from → QUALIFIED+clerk or RECOMMENDED+letter-writer), one at a
  time. Live demo scheduled for S9 (new shop, no catalog).
- Demo sentence: "There is no eighth place a lead can be."

## Teach-back — all ✅

1. NEEDS_REVIEW = AI stepped aside, human takes over (routine queue).
   DEAD_LETTER = machine broke (investigate).
2. One email; the stamp is written in the same motion as the claim.
3. Restarting from the front desk = redundant work; named wastes: money
   (fresh AI bills) + consistency (nondeterministic re-reads could change the
   score after promises were made).
