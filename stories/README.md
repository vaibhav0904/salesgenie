# Stories — how work moves

**The rule: no build work without a card.** Everything — features, bugs, chores — is a markdown card that lives in exactly one of:

```
stories/backlog/      all known work, written before building starts
stories/in-progress/  what is being worked RIGHT NOW (max 1 story at a time)
stories/done/         verified complete (acceptance criteria met; evals passed where gated)
```

## Lifecycle
1. Pick the next card from `backlog/` (respect `Depends on:`).
2. `git mv` (or move) it to `in-progress/`. Only one at a time.
3. Build. If you discover a defect anywhere, **stop and file `BUG-<n>-slug.md` in `backlog/` immediately** (template below) — never fix-and-forget, never fold a bug silently into the current story.
4. Verify every acceptance criterion. If the story is eval-gated, the eval case must pass and its result be saved in `evals/results/`.
5. Move the card to `done/` and append a short **Outcome** section (what shipped, links to workflow/export/eval result).

## Naming
- Stories: `E<epic>-S<n>-slug.md` (e.g. `E5-S1-real-instock-products.md`)
- Bugs: `BUG-<nnn>-slug.md`, numbered in order of discovery.

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
