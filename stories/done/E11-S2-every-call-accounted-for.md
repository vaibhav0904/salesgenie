# E11-S2: Every AI call is accounted for

**As an** Operator
**I want** each LLM call to record its latency, tokens, cost, prompt version and whether the output was usable
**So that** I can answer "what did the AI do, how fast, at what cost, and did it behave?" for any lead.

## Acceptance criteria
- [ ] All 6 Gemini call sites (WF-03 ×2, WF-04, WF-05, WF-06, WF-07) write a `vaibhavcapstone_llm_calls` row: trace/lead/business ids, call_site, prompt_version, model, latency_ms, input/output tokens, notional cost, schema_valid, attempt, fallback_used, finish_reason.
- [ ] Logging is `continueOnFail` — a logging failure can never break the pipeline.
- [ ] One fresh test lead produces a complete set of rows with sane values; the eval regression still passes unchanged (instrumentation is behavior-neutral).
- [ ] Workflows re-exported.

## Depends on
- E11-S1

## Eval gate
- regression: evals/run-evals.js must stay green

## Technical notes
- Latency from a `__t0` stamp in the node preceding each Gemini call; tokens from Gemini `usageMetadata` in the node output.

## Outcome (2026-07-26)
- All 6 Gemini call sites instrumented: Stamp node (t0 + input size) inline before each Gemini node; Log LLM node (continueOnFail) writes vaibhavcapstone_llm_calls. 5 of 6 sites verified live (retry site fires only on retries by design).
- Verified telemetry: fresh lead produced classify_extract/qualifier_reasons/recommender_rank/drafter rows (~4.6-5.2s latency, correct est. tokens+cost, schema_valid, STOP); insights run produced insights_narrative rows for both tenants (~10.4s).
- Tokens are chars/4 ESTIMATES - the n8n Gemini node strips usageMetadata (verified on live executions); documented in traceability.md with the direct-API upgrade path.
- GOTCHA discovered: n8n defers parallel branches past a sendAndWait pause, so WF-06 drafter logging is wired INLINE before the persist step (Persist re-pointed to $(Assemble Draft) refs). Recorded here + traceability doc.
- Regression green and behavior-neutral: classification 10/10, extraction 95.3%/0 hallucinations; telemetry lead picked TBL-001+TBL-002 correctly within budget.
