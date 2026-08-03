# Stories — how work moves

**The rule: no build work without a card, and no new epic without a PRD
first.** `stories/STATUS.md` is the live dashboard — check it before
assuming a story's stage from the folder alone. This file is the static
process description.

## The full lifecycle (from E22 onward — E1–E21 predate this, not retrofitted)

```
prds/backlog/ → prds/approved/ ─┐
                                 ▼
                    stories/backlog/ (prioritized together)
                                 │  /story — picked, confirmed with Vaibhav
                                 ▼
                    stories/in-progress/<id>.md
                                 │  /testplan — BEFORE any build work
                                 ▼
                    <id>.tests.md created, all rows "Not Run"
                                 │  /implement — build, verify each criterion
                                 ▼
                    test case rows flip to Pass/Fail; eval gate runs if required
                                 │  all Pass →
                                 ▼
                    <id>.uat.md generated — STOP, wait for Vaibhav
                                 │  Vaibhav runs UAT with dummy data, signs off
                                 ▼
                    export workflow JSON, commit, merge to main
                                 │
                                 ▼
                    stories/done/<id>.md (+ .tests.md, .uat.md alongside)
```

Bug cards (`BUG-<n>`) skip the PRD step — they go straight to
`stories/backlog/` — but still get a `.tests.md` and UAT sign-off like any
other story once picked up.

## Folders

```
prds/backlog|approved|done/     see prds/README.md
stories/backlog/                 all known work, written before building starts
stories/in-progress/             what is being worked RIGHT NOW (max 1 story at a time)
stories/done/                    verified complete, UAT signed off, promoted to main
stories/STATUS.md                live dashboard — check first
```

## Step detail

1. **PRD** (`/prd`): new capability → drafted in `prds/backlog/`. Approving
   it writes the story cards into `stories/backlog/` and moves the PRD to
   `prds/approved/`. Bugs skip this.
2. **Prioritize + pick up** (`/story`): backlog order in `STATUS.md` is set
   *together*, not mechanically — `/story` proposes the next pick (respecting
   `Depends on` and BUG severity) and confirms with Vaibhav before moving the
   card to `stories/in-progress/`.
3. **Test cases** (`/testplan`): written **before any build work**, one row
   per acceptance criterion in `<id>.tests.md`, all starting "Not Run".
   `/implement` refuses to start building without this file present.
4. **Build + test** (`/implement`): build, verify each criterion by actually
   running it, flip test-case rows to Pass/Fail, run the eval gate if the
   story has one. If every row is Pass, generate `<id>.uat.md` and stop —
   nothing merges yet.
5. **UAT**: Vaibhav follows `<id>.uat.md` — switch to the demo database
   (`docs/environments.md`), run `scripts/reset-demo-db.js` for clean dummy
   data, work through the numbered steps, and explicitly says "UAT passed"
   (or reports what's wrong). This is a human gate, never automatic.
6. **Promote**: only after sign-off — export touched workflow JSON to
   `n8n/workflows/`, move the card (+ its `.tests.md`/`.uat.md`) to
   `stories/done/` with an **Outcome** section, commit, merge to `main`.
7. If a defect surfaces at any point, **stop and file
   `BUG-<n>-slug.md`** immediately (template below) — never fix-and-forget,
   never fold a bug silently into the current story.

## Naming
- PRDs: `PRD-E<epic>-slug.md` (`prds/README.md`)
- Stories: `E<epic>-S<n>-slug.md`, paired `.tests.md` / `.uat.md` once picked up
- Bugs: `BUG-<nnn>-slug.md`, numbered in order of discovery

## Story template
```markdown
# E<epic>-S<n>: <title from the end user's point of view>

**As a** <persona from docs/domain.md>
**I want** <capability>
**So that** <outcome>

## Acceptance criteria
- [ ] ...

## Depends on
- <story ids or "-">

## Eval gate
- <evals/cases/... or "none">

## Technical notes
- ...
```

## Test case template (`<id>-slug.tests.md`)
```markdown
# Test cases: E<epic>-S<n> <title>
| # | Case | Steps | Expected | Status | Evidence |
|---|---|---|---|---|---|
| TC1 | ... | ... | ... | Not Run |  |
```
One row per acceptance criterion minimum. Eval-gated stories reference the
eval case by name in one row rather than duplicating it.

## UAT template (`<id>-slug.uat.md`)
```markdown
# UAT: E<epic>-S<n> <title>
1. Switch Capstone-Postgres credential to `salesgenie` (demo).
2. `node scripts/reset-demo-db.js` — clean dummy data.
3. <numbered steps: what to type/click, what you should see>
4. Sign-off: reply "UAT passed" (or file what's wrong) before this promotes.
```

## Bug template
```markdown
# BUG-<nnn>: <symptom, one line>

**Found while:** <story id / activity>
**Severity:** blocker | major | minor

## Repro
1. ...

## Expected / Actual
- Expected: ...
- Actual: ...

## Root cause (fill when known)
## Fix (fill when resolved, link commit/workflow)
```
