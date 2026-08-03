---
description: Review the in-progress (or a named) story's implementation against its contract
---

Review the implementation of the story in `stories/in-progress/` (or the story named in $ARGUMENTS):

1. Check every acceptance criterion against the actual system state (n8n workflows via MCP, Postgres rows, exports) — evidence, not assumption.
2. Cross-check the story's `.tests.md`: every row's Status/Evidence should match what you actually observe, not just what it claims.
3. Check conventions: VaibhavCapstone-/vaibhavcapstone_ prefixes, Envelope validation on agent entry, events logged with trace_id, no tenant-specific logic, error paths wired to VaibhavCapstone-00-ErrorHandler.
4. Check guardrails relevant to the story: grounding (SKU verification), HITL (send only from APPROVED), PII minimization in prompts.
5. Report findings as: criteria met / criteria failed / convention violations / bugs to file. File BUG cards for anything that must not be fixed silently.
