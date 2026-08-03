---
description: Implement the story currently in stories/in-progress
---

Implement the single story in `stories/in-progress/` (if empty, say so and suggest /story):

0. **Refuse to proceed if `<id>-slug.tests.md` doesn't exist yet** — point to `/testplan` instead. Test cases must exist before any build work starts.
1. Re-read the story's acceptance criteria, technical notes, and its `.tests.md`.
2. Build in n8n via the n8n MCP; follow CLAUDE.md conventions (VaibhavCapstone- prefixes, Envelope contract, no tenant-specific logic).
3. Any defect discovered along the way → file `stories/backlog/BUG-<n>-slug.md` immediately (template in stories/README.md), then continue or switch per severity.
4. Verify each acceptance criterion by actually running it (webhook call, SQL check, workflow execution) — not by reading the workflow. Flip the matching row in `.tests.md` to Pass/Fail with evidence as you go.
5. If eval-gated: run the eval (/eval), save the result file, and reflect it in the eval's `.tests.md` row. Pass required to finish.
6. **Once every `.tests.md` row is Pass:** generate `<id>-slug.uat.md` (template in stories/README.md) with concrete, numbered steps Vaibhav can run against the demo database. Update `stories/STATUS.md` to "UAT pending" and **stop** — do not export, commit, or move the story yet.
7. **Only after Vaibhav replies that UAT passed:** export the touched workflow(s) JSON to `n8n/workflows/`, move the story (with its `.tests.md`/`.uat.md`) to `stories/done/`, append an **Outcome** section, and update `stories/STATUS.md`.

$ARGUMENTS may scope which criteria to work on.
