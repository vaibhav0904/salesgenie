---
description: Implement the story currently in stories/in-progress
---

Implement the single story in `stories/in-progress/` (if empty, say so and suggest /story):

1. Re-read the story's acceptance criteria and technical notes.
2. Build in n8n via the n8n MCP; follow CLAUDE.md conventions (VaibhavCapstone- prefixes, Envelope contract, no tenant-specific logic).
3. Any defect discovered along the way → file `stories/backlog/BUG-<n>-slug.md` immediately (template in stories/README.md), then continue or switch per severity.
4. Verify each acceptance criterion by actually running it (webhook call, SQL check, workflow execution) — not by reading the workflow.
5. If eval-gated: run the eval (/eval), save the result file. Pass required to finish.
6. When all criteria check out: export the touched workflow(s) JSON to `n8n/workflows/`, move the story to `stories/done/` and append an **Outcome** section (what shipped, evidence links).

$ARGUMENTS may scope which criteria to work on.
