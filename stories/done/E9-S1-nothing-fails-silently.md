# E9-S1: Nothing fails silently

**As an** Operator
**I want** every processing failure captured, retried, and escalated if unrecoverable
**So that** no customer enquiry ever evaporates.

## Acceptance criteria
- [ ] `VaibhavCapstone-00-ErrorHandler` is set as the error workflow for every pipeline workflow.
- [ ] Transient failures (DB, HTTP, LLM timeouts) retry with backoff (n8n node retry settings) before erroring.
- [ ] Unrecoverable failure → lead DEAD_LETTER + error event (trace_id, failing node, message) + alert email to the operator.
- [ ] A deliberately malformed intake payload and a forced node failure both produce a dead letter + alert in testing — no silent loss.

## Depends on
- E2-S1

## Eval gate
- none

## Technical notes
- Built early (alongside E2) so every later story inherits it; grading criterion "error handling & retries (10%)".

## Outcome (2026-07-26)
- VaibhavCapstone-00-ErrorHandler (id 7jyaQ5gz8eYDBFJI) active; wired as errorWorkflow on WF-01 and WF-02; export in n8n/workflows/.
- Chain: Error Trigger -> parse LEAD:/TRACE: tags (from message+description+stack) -> dead-letter known lead (guarded UPDATE, never touches SENT/REJECTED) -> WORKFLOW_ERROR event (business resolved from lead, else platform) -> operator alert email. DB writes are continueOnFail so alerts still go out if Postgres itself is down.
- Forced-failure test PASSED: tagged throw -> lead DEAD_LETTER with error context, event with business_id+trace_id, alert emails received.
- Malformed-payload path: handled gracefully by WF-01 (400 + INTAKE_REJECTED), which exceeds the dead-letter criterion for that case.
- Two gotchas discovered and recorded in CLAUDE.md + contracts.md SS6: n8n draft/publish (PUT edits draft only) and Code-node error colon-splitting. Retry policy: transient-prone nodes use retryOnFail (2-3 tries, backoff).
