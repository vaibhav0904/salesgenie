# Session 6 — The Letter-Writer & the Signature (WF-06 DraftHITL)

*Taught 2026-07-31 fully in chat. Hands-on DONE (real approve + reject). Teach-back pending.*

## Core ideas

- Job: write the reply in the shop's voice (grounded ONLY on the clerk's verified
  items), then STOP and wait for a human. No customer email without a click. Ever.
- Readiness gate: no reviewer configured → park AWAITING_SETUP (missing: reviewer,
  resume_from: draft).
- Writing: 5-step AI routine; both vendors fail → plain template from verified
  items (style suffers, safety and schedule never).
- **The freeze:** Ask Reviewer (Send & Wait) emails approve/reject buttons and the
  execution sleeps mid-node for hours/days at zero cost, waking exactly there on
  click. (Gotchas: waiting executions near-invisible; side-effect nodes must sit
  before the freeze.)
- **Three enforcement layers:** (1) the furniture — DB trigger allows only
  DRAFT→PENDING_APPROVAL→APPROVED→SENT (or REJECTED); (2) the guarded flip —
  "set APPROVED only if still PENDING_APPROVAL": two doors (inbox buttons + MCP
  approve_draft), one lock, loser updates 0 rows and stands down; (3) the wiring —
  Send To Customer has exactly one inbound road, starting at a human click.
- Demo safety: `customer_email_redirect` sends "customer" mail to a safe inbox
  with `[DEMO -> real@addr]` subject prefix.

## Live run results (leads from S5: Vikram=email-4, Kavita=email-6)

- Vikram: approved from inbox → draft SENT, lead SENT, decided_by
  vaibhav0904@gmail.com; "customer" email redirected to Vaibhav's inbox.
- Kavita: rejected → draft REJECTED, lead REJECTED, NO email row. Silence, recorded.
- Event biography showed: 22 seconds machine work (RECEIVED→DRAFT_CREATED
  15:20:22→15:20:44), 3.5h freeze, click 19:00:19, EMAIL_SENT +3s.
- Surprise sighting: JUDGE_SCORED events at 15:30 — WF-12 audited the AI work
  before the boss opened the mail (preview of S10).

## Teach-back (pending)

1. Name the three layers preventing an unapproved send.
2. Simultaneous approve from Gmail and chat — why can't two emails go out?
3. What was the execution doing 15:20:44→19:00:19, and what did it cost?
