# Status — last updated 2026-08-03 by Claude

The live dashboard. `stories/README.md` is the (static) process description —
this file is the current state. Updated at every `/prd`, `/story`,
`/testplan`, `/implement`, `/bug`, `/eval` transition; never hand-edited out
of band without also fixing the folder it disagrees with.

## PRDs

| PRD | Status | Stories |
|---|---|---|
| `PRD-E22-multi-turn-conversations` | Approved | E22-S1, E22-S2, E22-S3 (all backlog) |
| `PRD-E23-returning-customer-detection` | Approved | E23-S1, E23-S2 (all backlog) |

## Backlog (priority order, top = next — set together, re-order anytime)

Not yet fully prioritized — the 5 new E22/E23 stories are appended below
the existing 3, in PRD order, not yet weighed against them or each other.
Next `/story` run should confirm real order with Vaibhav before picking one.

1. `BUG-009` — catalogue CSV silently loads zero stock (no PRD needed — bug)
2. `E19-S2` — swap plumbing code for native nodes (deliberately deferred, see card)
3. `E20-S1` — flip the repo public (blocked until the demo video is recorded)
4. `E22-S1` — store the full conversation, not just one message
5. `E22-S2` — a reply reopens the same lead (depends on E22-S1)
6. `E22-S3` — drafts/recommendations use conversation context (depends on E22-S2)
7. `E23-S1` — customer identity table + detection at intake
8. `E23-S2` — personalized returning-customer draft (depends on E23-S1)

## In progress

None.

## Recently done

- `E21-S1` — test/demo/production environments (2026-08-03)
- `E19-S1` — read the canvas without opening a node
- `E18-S1` — custom test leads from chat
- `BUG-010` — eval harness graded an arbitrary run

Full history: `stories/done/`.
