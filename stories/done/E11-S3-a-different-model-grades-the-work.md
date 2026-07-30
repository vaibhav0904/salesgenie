# E11-S3: A different model grades the work

**As a** Sales Manager
**I want** an independent AI (different model family) to score every extraction, draft and rationale for faithfulness to instructions
**So that** quality drift is caught by monitoring, not by an embarrassed customer.

## Acceptance criteria
- [ ] `VaibhavCapstone-12-LLMJudge`: 30-min cron + manual trigger; claim-then-judge (no artifact judged twice).
- [ ] Three rubrics returning strict JSON `{score_1_5, violations[], reasoning}`: extraction faithfulness (any invented value = automatic 1), draft groundedness + tone adherence, reasons factuality.
- [ ] Judge = OpenAI (doer = Gemini): no self-preference bias. Judge failures log and skip — monitoring never blocks the pipeline.
- [ ] Scores in `vaibhavcapstone_judge_scores` + `JUDGE_SCORED` events; operator alert email when groundedness ≤ 2.
- [ ] Tamper test: a deliberately corrupted draft copy gets flagged (judge is not a rubber stamp), then cleaned up.

## Depends on
- E11-S2

## Eval gate
- tamper test doubles as the gate

## Technical notes
- Discover OpenAI credential id/name via API; cheapest capable model, noted in outcome.

## Outcome (2026-07-26)
- VaibhavCapstone-12-LLMJudge (id MoUh9tkNf5FWaoen) live: 30-min cron + manual sweep, claim-then-judge via UNIQUE(artifact_type, artifact_ref). OpenAI judges via direct chat-completions HTTP (JSON mode, temp 0, EXACT token usage - better telemetry than the Gemini sites). Judge telemetry itself lands in llm_calls (call_site=judge).
- Rubrics iterated v1->v3 in a documented disagreement loop: v1 punished derived fields (urgency) as "invented"; v2 separated verbatim vs derived; v3 added NULLS-ARE-NEVER-VIOLATIONS + implied-currency rules. gpt-4o-mini still could not follow v3 on nuanced faithfulness -> judge model upgraded to gpt-4o, which then agreed with the human-labeled ground truth: 12/12 extractions 5/5, matching our zero-hallucination eval.
- Final scores: drafts 9 avg 5.0, extractions 12 avg 5.0, reasons 11 avg 4.82 (min 3, a vague-but-harmless reason).
- TAMPER TEST PASSED: corrupted draft (50% discount, free delivery tomorrow, lifetime warranty, invented product, expiry pressure) scored 1 with ALL five fabrications listed verbatim; operator alert email fired. Cleaned up.
- PM insight recorded: judge quality is itself a model-selection decision - blatant fabrication is catchable by a mini model, nuanced faithfulness needed the stronger tier.
