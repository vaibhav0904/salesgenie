# Session 2 — The Front Doors (WF-01 Intake + WF-02 GmailAdapter)

*Taught 2026-07-30/31. Hands-on rounds deferred by choice — predictions were all correct.*

## Core ideas

- **One door for every channel.** All enquiries enter via `POST /webhook/vaibhavcapstone-intake`;
  everything else (Gmail, A2A, MCP test, labs) is an adapter that walks payloads to
  this door. One place to guard, one payload shape.
- **WF-01 in phases:** door (webhook, `responseMode: responseNode`) → bouncer
  (Validate & Normalize Code node — *births lead_id + trace_id*) → atomic filing
  (Create Lead: a CTE = "three fused nodes that can't half-succeed": verify business →
  insert lead RECEIVED → log LEAD_RECEIVED) → three stamps (201 / 400 / 404, each
  failure lane logs an event BEFORE answering) → envelope + Call ClassifyExtract
  **after** the 201 (caller waits ms; the ~19s pipeline runs after the door closed).
- **WF-02 = translator:** IMAP watch `[enquiry]` → parse fields → reverse phone-book
  lookup (to-address → `config->>'intake_email'` → business_id) with the BUG-001
  self-send guard ("letter in our own handwriting → bin it") → forward to the SAME
  front door. Adapters never process.

## Vaibhav's questions (both excellent)

1. **"Who sees the 201/400/404 and how?"** — Never the human customer. Every caller
   is a machine (adapter, A2A server, MCP tool, lab, future website form) standing at
   the counter waiting for a stamped receipt: 2xx created / 4xx caller's fault /
   5xx server's fault + JSON body. Codes exist so callers can branch on numbers
   instead of parsing prose. `responseMode: responseNode` is what lets one webhook
   choose its stamp.
2. **"Why does WF-02 check business exists when WF-01 also checks?"** — Different
   questions: node 3 TRANSLATES mailbox→id, node 4 asks "did translation find
   anyone?" (no id → nothing to forward; logs ADAPTER_UNMAPPED_MAILBOX). WF-01
   verifies whatever id it's HANDED (INTAKE_UNKNOWN_BUSINESS) because the front desk
   trusts no caller. Different events = different 11pm diagnoses.

## Predictions (all correct; runs deferred)

- Round 1 (`email_number: 2`): 201, lead created → full pipeline fires (multiple
  executions; drawers: leads, events, extractions, qualifications, recommendations,
  drafts, llm_calls; ends PENDING_APPROVAL + approval email — don't click until S6).
- Round 2 (`{"body": "hello i want furniture"}`): 400 at *Valid Payload?* — no lead,
  but an INTAKE_REJECTED event IS written (rejections are data).
- Round 3 (`biz_doesnotexist`): 404 at *Business Found?* — different guard than
  Round 2; INTAKE_UNKNOWN_BUSINESS event.

## Deferred hands-on (do anytime, ~60s)

Fire Rounds 1–3 in LearningLab-Replay; verify in LearningLab-Data
(leads where channel=learning-lab; events where lead_id=<your lead>); count
executions from one click; admire-don't-click the approval email.
