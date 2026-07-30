# E20-S1: Flip the repo public — as a stranger, not as the author

**As** a PM/engineer who found `github.com/vaibhav0904/salesgenie` cold,
**I want** the README quickstart to actually work on a machine that has never seen this project,
**so that** the public repo is evidence of the system, not just a description of it.

**Status:** blocked until the demo video is recorded (the local rig must not be disturbed before then). Repo is **private** until every box below is ticked.

## Acceptance criteria — all must pass before `--visibility public`

1. **Fresh-install smoke test, seedless.** Throwaway n8n + Postgres on alternate ports / own volumes (never touching the demo stack). Execute the README quickstart *verbatim*: migrations 001+003+004+005 (no 002), import per `n8n/workflows/README.md`, create a business over the tool webhooks (Route B), upload a catalogue (`stock_qty` header), set a reviewer, POST a lead → reaches `PENDING_APPROVAL`. Any instruction that fails gets fixed in the doc, not worked around. (Same discipline that caught BUG-009: the only catalogue path ever exercised before rehearsal was `items[]` — the CSV path in the docs had never been run.)
2. **Seed decision executed.** Seeds are already fictional + `.example`-scrubbed, so they are *safe* to keep as optional demo data; owner's stated preference is to remove them post-demo. Either way: `db/002`, `data/seed-emails/`, `evals/datasets` stay mutually consistent, and the eval section of the README still describes something a stranger can run.
3. **Numbers audit.** `grep -rn "98.4\|zero invented" README.md docs/ presentation/ evals/` returns nothing unannotated; every quoted metric traces to a file in `evals/results/`. (Story cards in `stories/done/` keep their as-reported historical figures — BUG-010 is the correction record beside them; ADR-0013 carries an inline annotation.)
4. **Secret scan** (`preflight-publish.js` pattern + live-value scan against `.env`) clean on the final tree; `git ls-files` contains no `.env`, no course PDF, no zip.
5. **Flip and verify:** `gh repo edit vaibhav0904/salesgenie --visibility public`, then in a logged-out/incognito browser: README renders, quickstart legible, no sensitive file reachable.

## Also before any public screenshot / on-camera n8n screen
- Deactivate or delete `ZZ-TEMP-Dispatch03` (leftover test workflow, webhook-only, still Active).

## Non-goals
- BUG-009 product fix (CSV header aliases + reporting ignored columns) — separate card, may land before or after the flip.
- E19-S2 Code→Set conversions — after the video, unrelated to visibility.
