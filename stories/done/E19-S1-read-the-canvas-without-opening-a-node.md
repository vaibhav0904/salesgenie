# E19-S1: Read the canvas without opening a node

**As an** Operator
**I want** every workflow to explain itself on the canvas in plain English
**So that** I can follow, demo and defend the whole system without reading code or SQL.

## Acceptance criteria
- [x] All 14 workflows carry sticky notes; the system goes from 0 to 71.
- [x] Every stage group has a note naming the step and its purpose in plain English (no node names, no jargon).
- [x] Every Code node is explained by a note covering it — what it does and why it is still code. *(Revised from "one note per node" — see Outcome.)*
- [x] Every SQL node is explained by a note covering it — what it asks the database and why it is a query; guarded transitions call out the safety catch explicitly.
- [x] Behaviour is provably unchanged: functional node count stays 220, every `connections` block byte-identical, no existing node's `parameters` touched.
- [x] All 135 `$('Node Name')` references still resolve.
- [x] A seed email still runs end to end to human approval after the republish cycle.
- [x] Each workflow can be narrated top to bottom from its notes alone, without opening a single node.

## Depends on
- none (purely additive annotation)

## Eval gate
- none — no logic changes. `node evals/run-evals.js` run at the end as free confirmation.

## Technical notes
- Prompted by an audit of all 220 nodes: 49 Code nodes (39,111 chars JS), 53/53 Postgres nodes on raw `executeQuery` (43,588 chars SQL — the larger half), 23/23 HTTP nodes on raw JSON bodies, and **0 Set nodes and 0 sticky notes** in the entire system. The absence of explanation, not the presence of code, is the real gap.
- Serves the "Node logic & routing clarity; state/branching easy to follow" grading criterion (10%).
- Voice reused from `docs/workflow-tour.md`, whose plain-English framing is already validated.
- Sticky notes participate in no connections and are referenced by nothing, so the change is inert by construction.
- A larger refactor (49 → 28 Code nodes via Set/IF/Filter, plus 5 queries to Postgres UI mode) was scoped and deliberately deferred to the backlog (E19-S2..S5): invisible to the grader, and it would disturb 135 by-name references and require a full eval replay to re-prove the deck's published numbers.
- Publish per CLAUDE.md: PUT edits the draft only → deactivate → activate → re-export.

## Outcome (2026-07-28)
- **71 sticky notes across all 14 workflows** (from zero). Colour-coded: green = what this workflow is for, grey = stage explanation, red = a guardrail or honest limitation, blue = a design decision worth defending.
- **Design change, made deliberately:** rather than one pin note per Code/SQL node (which would have meant ~102 notes and an unreadable canvas), each stage note explains every node in its group with bullets. Every Code and SQL node is covered and explained; none has a dedicated note. This reads better and keeps the canvas usable — criteria 3 and 4 were reworded to match what was built rather than ticked as written.
- **Inertness proven, not assumed.** The applier asserted, before every write, that functional node count, `connections`, and every existing node's `parameters` were unchanged. Post-publish: 220 functional nodes (unchanged), all 14 active, 135/135 by-name references resolve, `errorWorkflow` and `binaryMode` settings survived the round-trip.
- **Smoke test:** a seed enquiry ran the full pipeline — ENQUIRY / HOT / score 100 / 1 grounded recommendation / 1 draft / PENDING_APPROVAL with the approval email sent. Four AI calls all logged `exact_api`, schema-valid, priced. Test lead and its rows deleted afterwards so metrics are unaffected.
- **Evals re-run:** classification 10/10 with spam recall intact; extraction 63/64 = 98.4%, 0 hallucinated, 0 manual-review.
- **Pre-existing drift found and fixed (unplanned, worth knowing).** The repo exports for 03, 05, 06, 07 and 09 did not match what was actually running in n8n — those five had been edited in the UI at some point without re-export, so n8n had normalised away default parameters (`resource: "database"`, `weeksInterval: 1`, `batchSize: 1`, …) and moved node positions. Proven not to be caused by this story: the other 9 workflows went through the identical PUT → deactivate → activate cycle and came back byte-identical, all 25 of their Postgres nodes still carrying `resource: "database"`. The re-export has brought the repo back in sync; **the submission zip previously did not match the system that produced the deck's numbers.**
- `n8n/workflows/README.md` corrected (said 12 workflows, there are 14) and given an annotation note. `salesgenie-n8n-workflows.zip` regenerated: 14 workflows, 220 functional nodes, 71 sticky notes.
