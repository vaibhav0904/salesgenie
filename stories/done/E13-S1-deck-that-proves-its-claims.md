# E13-S1: A deck where every claim carries its proof

**As the** capstone evaluator
**I want** a ≤9-slide core deck (official template order) + appendix that shows both what was asked and what was actually built
**So that** I can grade the rubric line-by-line and see the platform DNA (multi-tenant, observability, MCP, A2A) without taking anyone's word for it.

## Acceptance criteria
- [ ] `presentation/slides-content.md`: paste-ready per-slide text + speaker notes + visual placement, 1:1 with the HTML deck.
- [ ] `presentation/deck.html` published as an Artifact: 9 core slides per `docs/presentation-template.md` + appendix (DNA, traceability, A2A, evidence table).
- [ ] Every number on every slide appears in the evidence table with its repo source; no unverifiable claims.
- [ ] All visuals self-contained (inline SVG / data URIs — no external requests); renders in light and dark.
- [ ] "Asked → Built" framing present on the slides where the project exceeds the brief.

## Eval gate
- evidence-table cross-check (every claim → artifact)

## Technical notes
- Load `artifact-design` skill before writing the deck. QuickChart PNGs must be inlined as data URIs.

## Outcome (2026-07-26)
Done. `presentation/slides-content.md` (paste-ready, 9 core + 6 appendix slides, speaker notes, visual placement) and `presentation/deck.html`, both in the repo.
- Design: two-hue semantic system (ember = the business/tenant world, steel = the platform/protocol world) so "asked vs built" is encoded in color; monospace voice reserved for evidence/terminal proof; inline SVG architecture diagram; light+dark; print CSS → PDF.
- Self-contained: zero external requests; all facts cross-checked against eval result files (qualification 85.7%/no HOT→COLD re-verified from `evals/results/2026-07-26-qualification.md` before inclusion).
- Evidence table (slide A4) doubles as the fact-check checklist; every headline number maps to a repo artifact.
