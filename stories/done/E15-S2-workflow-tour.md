# E15-S2: The grand tour — every workflow, in plain words

**As a** curious non-engineer (and as the person testing the system)
**I want** each of the 14 workflows explained: one-breath big picture, an analogy, then node-by-node in simple language, with a "try it yourself" box
**So that** I can understand and personally test the entire platform in one afternoon.

## Acceptance criteria
- [ ] `docs/workflow-tour.md` covers all 14 workflows, sourced from the real exports; each node's role in plain words + which table it touches.
- [ ] Ends with a full-system test script (ordered, with expected outcomes).
- [ ] Published as an artifact in a human voice; commands dry-run verified.

## Outcome (2026-07-26)
Done. `docs/workflow-tour.md` — all 14 workflows, each with a one-breath summary, an analogy (reception desk, stockroom clerk with the tattooed rule, external examiner from a different school…), a node-by-node walkthrough sourced from the live exports (node names verified verbatim), and a try-it box. Ends with the 10-step full-system test ("one afternoon, every capability") including the Langfuse kill-test. Published as artifact: — commands reuse the endpoints dry-run-verified in E13-S3/E14 (intake 201, insights 200, agent-card 200, judge-sweep, buyer demo).
