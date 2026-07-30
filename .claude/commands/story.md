---
description: Pick the next story from the backlog and move it to in-progress
---

Select and start the next unit of work:

1. List `stories/in-progress/`. If a story is already there, summarize its state and continue it — do NOT start a second one.
2. Otherwise list `stories/backlog/`, pick the next story whose `Depends on:` are all in `stories/done/` (BUG cards with severity blocker/major jump the queue).
3. Move the chosen file to `stories/in-progress/`.
4. Read the story + `docs/contracts.md` sections it touches, restate the acceptance criteria, and outline the implementation steps before building.

$ARGUMENTS may name a specific story to pick instead.
