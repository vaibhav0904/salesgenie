# E19-S2: Swap plumbing code for native nodes

**As a** Builder
**I want** the trivial field-shuffling steps expressed as native n8n nodes instead of JavaScript
**So that** I can edit them by clicking rather than by coding.

> **Do not start before submission.** Deferred deliberately from E19-S1: no grading criterion rewards a lower code-node count, the change is invisible in the deck and the demo video, and it disturbs 135 by-name references on a system whose published numbers came from the current workflows. Pick this up once the grade is no longer at stake.

## Acceptance criteria
- [ ] 16 plumbing Code nodes become Set ("Edit Fields") nodes, 1:1, **each keeping its exact current name**: `Build Envelope` (01) · `Stamp classify_extract`, `Stamp classify_extract_retry`, `Envelope For Qualifier` (03) · `Stamp qualifier_reasons`, `Envelope For Recommender` (04) · `Stamp recommender_rank`, `Envelope For DraftHITL` (05) · `Stamp drafter` (06) · `Stamp insights_narrative` (07) · `Catalog Result`, `Resume Input (catalog)`, `Resume Input (reviewer)` (08) · `Restore Verdict` (12) · `Compose Unauthorized`, `Reload Routed Request` (13).
- [ ] The 4 `Validate Envelope` guards (03, 04, 05, 06) become an IF node — still named `Validate Envelope`, still passing the envelope through on the true branch — feeding a Stop and Error node.
- [ ] The 4 hidden `return []` early-exits become visible Filter nodes: `Envelope` (10, Code node disappears entirely), `Compute Rubric Score` (04), `Prep Candidates` (05), `Build Judge Prompt` (12).
- [ ] The 5 genuinely simple queries move to Postgres UI mode: `Resolve Business From Mailbox` (02) · `Get Businesses`, `Fetch Latest Insight` (07) · `Get Intake Endpoint` (08) · `Query Latest Insight` (09).
- [ ] Code nodes drop 49 → 28; Set nodes rise 0 → ~20.
- [ ] All 135 by-name references still resolve; sticky notes from E19-S1 still describe what's on the canvas (update any that named a mechanism that changed).
- [ ] Full eval replay stays within the documented baseline spread (classification 10/10; extraction ≥ 92%, consistent with `evals/results/2026-07-30-extraction-spread.md`; grounding 100%). A single run below the spread's floor means investigate, not reroll.

## Depends on
- E19-S1 (done)

## Eval gate
- **Required.** Unlike E19-S1 this changes execution. Full seed replay + `node evals/run-evals.js`, result saved to `evals/results/`. Any drift means revert, never relabel.

## Technical notes
- **The one rule that makes this safe: never change a node's name.** A `$('Node Name')` reference doesn't care whether its target is a Code node or a Set node, but it breaks silently if the name changes. 135 references depend on this.
- `Restore Verdict` must keep `$('Parse Verdict').item` (not `.first()`) — `.item` is the fix for the duplicate-judge-score bug inside the `splitInBatches` loop.
- Verify each of the 5 SQL conversions individually; if UI mode can't express one faithfully — especially empty-result behaviour for `Get Businesses`, which feeds a `splitInBatches` loop — leave it raw and keep only its sticky note.
- **Out of scope permanently:** the direct-HTTP Gemini/OpenAI call nodes (n8n's native AI nodes strip `usageMetadata`, destroying the exact-cost telemetry and the "36× low" finding); the 6 identical `LLM Result` normalisers (splitting each needs a 4-node pattern, ~18 extra canvas nodes, to remove 6 code nodes); and the 48 complex queries, whose guarded transitions (`UPDATE … WHERE status='PENDING_APPROVAL'`) are what enforce the no-double-send guarantee.
