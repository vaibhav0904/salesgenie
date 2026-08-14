# Status — last updated 2026-08-10 by Claude

The live dashboard. `stories/README.md` is the (static) process description —
this file is the current state. Updated at every `/prd`, `/story`,
`/testplan`, `/implement`, `/bug`, `/eval` transition; never hand-edited out
of band without also fixing the folder it disagrees with.

## PRDs

| PRD | Status | Stories |
|---|---|---|
| `PRD-E22-multi-turn-conversations` | Approved | E22-S1, E22-S2, E22-S3 (all backlog) |
| `PRD-E23-returning-customer-detection` | Approved | E23-S1, E23-S2 (all backlog) |
| `PRD-E24-self-recorded-demo-video` | Approved | E24-S1 (done) |

## Backlog (priority order, top = next — set together, re-order anytime)

Not yet fully prioritized — the 5 E22/E23 stories are appended below
`E19-S2`, in PRD order, not yet weighed against it or each other.
Next `/story` run should confirm real order with Vaibhav before picking one.

1. `E19-S2` — swap plumbing code for native nodes (deliberately deferred, see card)
2. `E22-S1` — store the full conversation, not just one message
3. `E22-S2` — a reply reopens the same lead (depends on E22-S1)
4. `E22-S3` — drafts/recommendations use conversation context (depends on E22-S2)
5. `E23-S1` — customer identity table + detection at intake
6. `E23-S2` — personalized returning-customer draft (depends on E23-S1)

## In progress

Nothing.

## Rig state (2026-08-10)

Demo is closed and the stack is quiet.

**Seed data now lives in `salesgenie_test` only** (2026-08-10, owner's call). The live
`salesgenie` database holds **no businesses and no products** — Oak & Ember and its 20
products were removed. `platform_config` (the A2A bearer) survives in both, so the test
database is a complete environment rather than a partial one. `db/002` stays in the repo
and rebuilds the demo shop in one command.

11 of 14 workflows active: `02-GmailAdapter`, `07-WeeklyInsights` and `12-LLMJudge` are
deactivated so nothing polls, no Monday cron fires, and the half-hourly judge sweep stops
spending OpenAI tokens. Reactivate those three before demoing again.

**History was rewritten 2026-08-10** — every commit is now authored
`vaibhav0904@gmail.com` and the course PDF is gone from all of it. Commit ids therefore
differ from anything noted before that date. Pre-rewrite backup bundle:
`../salesgenie-backup-pre-rewrite-2026-08-10.bundle`.

## Recently done

- `E20-S1` — **repo made public** (2026-08-10). Six gates plus a final three-way
  audit, which caught a real blocker on the day: two tracked files had republished
  the employer name and local path the video redaction existed to hide — and
  `preflight-publish.js` reported CLEAN over both. Values removed, history scrubbed
  a second time, scanner taught to read file content

- `BUG-009` — catalogue CSV silently loaded zero stock; stock column aliases +
  ignored-column reporting, verified live (2026-08-10)

- `E20-S2` — anyone can run this on their own hosted n8n (2026-08-09) — retarget
  and sync tooling, generated per-workflow reference, self-contained compose,
  rewritten README/guide/`.env.example`; proven by a full fresh install on a
  throwaway stack, then two UAT passes over the docs (19 defects fixed)
- `E24-S1` — presenter deck + demo setup, verified environment (2026-08-04);
  video recorded, cut to 9:47, published as release `demo-v1` (2026-08-08)
- `E21-S1` — test/demo/production environments (2026-08-03)
- `E19-S1` — read the canvas without opening a node
- `E18-S1` — custom test leads from chat
- `BUG-010` — eval harness graded an arbitrary run

Full history: `stories/done/`.
