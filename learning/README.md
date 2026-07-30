# Learning SalesGenie v2 — "Follow the Lead"

A guided curriculum for understanding this project workflow by workflow, node by node,
in simple English. Built for Vaibhav's own learning; any Claude session can resume it
from the tracker below.

## How it works

- **One sustained analogy**: the platform is the back office of a furniture showroom,
  staffed by specialists. Each workflow is one employee.
- **Predict → Run → Verify**: before every live run we predict the outcome, run it for
  real, then check Postgres + the n8n execution log against the prediction.
- **Teach-back**: every session ends with 2–3 questions Vaibhav answers in his own
  words; the answers are recorded in that session's note.
- Every session opens with a 2-minute recap quiz on the previous one.

## Learner calibration (why sessions look the way they do)

- Comfortable with n8n → no tool tutorials, straight to what nodes do *here*.
- New to SQL/Postgres → taught from zero, hands-on, starting Session 1.
- Has used LLM APIs only through n8n nodes → direct HTTP calls, tokens, fallback
  explained carefully.
- Fully live hands-on approved (real LLM calls, real inbox, MCP, A2A demo).

## Progress tracker

| # | Session | Covers | Status |
|---|---------|--------|--------|
| S0 | [The big picture](00-big-picture.md) | Problem, showroom analogy, 14-workflow map, Envelope | ✅ 2026-07-30 |
| S1 | [SQL & Postgres from zero](01-sql-foundations.md) | psql, SELECT/WHERE/JOIN, jsonb, schema tour | 🟡 exercises pending |
| S2 | The front doors | WF-01 Intake, WF-02 GmailAdapter | ⬜ |
| S3 | The reader | WF-03 ClassifyExtract + the LLM call quintet | ⬜ |
| S4 | The appraiser | WF-04 Qualifier (deterministic rubric) | ⬜ |
| S5 | The stockroom clerk | WF-05 Recommender (two-stage grounding) | ⬜ |
| S6 | The letter-writer & the signature | WF-06 DraftHITL, guarded transitions | ⬜ |
| S7 | The safety nets | WF-00 ErrorHandler, WF-11 NeedsReviewNotify, WF-10 ResumeParked | ⬜ |
| S8 | Monday morning | WF-07 WeeklyInsights | ⬜ |
| S9 | The chat control plane | WF-08 MCPOnboarding, WF-09 MCPOperations | ⬜ |
| S10 | The auditor & the trade entrance | WF-12 LLMJudge, WF-13 A2AServer, evals | ⬜ |
| S11 | Capstone teach-back | Vaibhav narrates a full lead journey | ⬜ |

Legend: ⬜ not started · 🟡 in progress · ✅ done

## Files

- `NN-<topic>.md` — one note per session: the explanation, what we ran, what we saw,
  the teach-back Q&A.
- `sql-cheatsheet.md` — every SQL concept the moment we first meet it, tied to the
  real query where it appeared.

## Resuming in a new conversation

Say "continue the learning sessions". Claude should read this README, find the first
non-✅ row, skim the previous session's note for the recap quiz, and pick up from there.
Session mechanics: recap quiz → analogy + purpose → node-by-node on the real export
JSON → predict/run/verify live → teach-back → write the note → tick this tracker.

Practice replays must use `external_id`s that do NOT start with `seed-email-` so the
eval query in `evals/run-evals.js` never picks them up.
