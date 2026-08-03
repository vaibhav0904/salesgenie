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
- **All learner hands-on happens in the n8n UI** (decided after S1) — terminal/psql
  is Claude's backstage tool only. The same n8n surfaces double as demo utilities.

## Hands-on style: native n8n nodes only (revised again after S1)

Vaibhav writes **zero SQL**. All data exploration uses node UIs — the Postgres
node's *Select rows* operation (table dropdowns, where-condition rows, sort),
plus the native twins of every SQL idea (see the Rosetta stone in
`sql-cheatsheet.md`). Raw SQL is only ever *read* when walking through product
workflows, with Claude translating to plain English + node equivalents.

The Learning Labs (learning/demo aids, deliberately named OUTSIDE the
`VaibhavCapstone-` convention; never activate them, never wire into the pipeline):

- **`LearningLab-Data`** — built BY Vaibhav in the n8n UI during S1 (guided
  click-by-click; no import). Manual Trigger + Postgres *Select rows* nodes he
  configures himself; grows Summarize/Merge branches in later sessions.
  Replaces every "run psql / write a query" instruction.
- **`LearningLab-Replay`** (`labs/LearningLab-Replay.json`, import via
  ⋯ → Import from File) — set `email_number` (1–10) in *Pick Email*,
  *Execute workflow*, read the intake response in the last node. Replaces every
  "POST/curl a seed email" instruction. Rewrites `external_id` to
  `lab-<timestamp>` so eval queries never see lab runs.

Translation for older session notes: "query Postgres/psql" → LearningLab-Data
node UIs · "POST a seed email" → LearningLab-Replay · "check logs" → n8n
Executions panel · "step through a workflow" → open it, pin input, Execute step —
**never save changes to `VaibhavCapstone-*` workflows**.

## Progress tracker

| # | Session | Covers | Status |
|---|---------|--------|--------|
| S0 | [The big picture](00-big-picture.md) | Problem, showroom analogy, 14-workflow map, Envelope | ✅ 2026-07-30 |
| S1 | [Data foundations](01-sql-foundations.md) | Postgres via node UIs, filters, Summarize, per-item execution, CHECKs | ✅ 2026-07-30 |
| S2 | [The front doors](02-front-doors.md) | WF-01 Intake, WF-02 GmailAdapter | ✅ 2026-07-31 (live rounds deferred) |
| S3 | [The reader](03-the-reader.md) | WF-03 ClassifyExtract + the 5-step AI routine | ✅ 2026-07-31 |
| S4 | [The appraiser](04-the-appraiser.md) | WF-04 Qualifier (math scores, AI narrates) | ✅ 2026-07-31 |
| S5 | [The stockroom clerk](05-the-stockroom-clerk.md) | WF-05 Recommender (two locks, honest lanes) | ✅ 2026-07-31 |
| S6 | [The letter-writer & the signature](06-letter-writer-signature.md) | WF-06 DraftHITL — freeze, three layers, real approve/reject done | ✅ 2026-07-31 |
| S7 | [The safety nets](07-safety-nets.md) | WF-00 firefighter, WF-11 nagger, WF-10 waker-upper | ✅ 2026-08-01 |
| S8 | [The Monday reporter](08-monday-reporter.md) | WF-07 WeeklyInsights — live run, real numbers | ✅ 2026-08-01 |
| S9 | [The owner's receptionist](09-owners-receptionist.md) | WF-08/09 MCP — live tenant lifecycle (Lumen Candles) | 🟡 teach-back pending |
| S10 | [The auditor & the trade entrance](10-auditor-trade-entrance.md) | WF-12 LLMJudge, WF-13 A2AServer, evals — live judge sweep + buyer demo | ✅ 2026-08-01 |
| S11 | Capstone teach-back | Vaibhav narrates a full lead journey | ⬜ |

Legend: ⬜ not started · 🟡 in progress · ✅ done

**Demo:** the presentable deck (diagrams, works offline) is
[../presentation/demo-deck.html](../presentation/demo-deck.html) — open in a
browser, navigate with ←/→. The prose archive is
[../presentation/hero-demo-runbook.md](../presentation/hero-demo-runbook.md).
One-click status checks during the demo: the **LearningLab-DemoStatus** workflow
in n8n (created 2026-08-01, native nodes: Pick Shop → Latest Lead → File
Biography).

**Demo video (in progress):** AI-narrated (Sarvam TTS), AI-edited short cut
for GitHub + LinkedIn — see
[../presentation/video-assets/](../presentation/video-assets/): narration
script, timed shot list, and the `assemble.js` pipeline (record raw footage
per `shot-list.md`, drop in `raw/`, run `node assemble.js`).

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
