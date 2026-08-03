# PRDs — one per epic, written before any story exists

**The rule: no new epic without a PRD.** Bugs are exempt (they go straight
to `stories/backlog/BUG-<n>-slug.md` per `stories/README.md`). A PRD lives
in exactly one of:

```
prds/backlog/    drafted, not yet approved
prds/approved/   approved — its stories exist in stories/backlog|in-progress|done
prds/done/       every story under this PRD has reached stories/done/
```

## Lifecycle

1. `/prd <idea>` drafts `prds/backlog/PRD-E<epic>-slug.md`.
2. Approving it (Vaibhav's call) means: write the story cards it lists into
   `stories/backlog/` (standard story template, `stories/README.md`), move
   the PRD file to `prds/approved/`.
3. When every story under a PRD reaches `stories/done/`, move the PRD to
   `prds/done/`.
4. `stories/STATUS.md` always shows which stage every PRD and its stories
   are at — check there before assuming a PRD's state from the folder alone
   mid-edit.

## Template

```markdown
# PRD-E<epic>: <title>
**Status:** Draft | Approved
**Date:** YYYY-MM-DD

## Problem
What's broken or missing today, for whom.

## Goals / Non-goals
What this epic will and will explicitly not do.

## Who this is for
Persona from `docs/domain.md`.

## Proposed scope → stories
- E<epic>-S1: <one-line>
- E<epic>-S2: <one-line>

## Success criteria
How we'll know this epic worked, once every story under it is done.

## Open questions
Anything still undecided — resolve before approving.
```

## Naming
`PRD-E<epic>-slug.md`, e.g. `PRD-E22-weekly-report-v2.md`. Epic numbers are
shared with `stories/` — the next free `E<n>` when the PRD is drafted.
