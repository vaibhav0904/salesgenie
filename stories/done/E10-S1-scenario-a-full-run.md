# E10-S1: Scenario A — a fully set-up business runs end-to-end

**As the** capstone evaluator
**I want** to watch every seed enquiry travel ingest → qualify → recommend → approve → send → insights for Oak & Ember
**So that** all three required capabilities are demonstrated on one coherent tenant.

## Acceptance criteria
- [ ] All 8–10 seed emails replayed via webhook + ≥1 live Gmail email; each reaches its correct terminal state (SENT / DISCARDED_* / NEEDS_REVIEW per labels).
- [ ] ≥1 draft approved via email link, ≥1 via MCP tool; ≥1 rejected.
- [ ] Weekly insights triggered; charts render; 3 sampled numbers reproduced by SQL.
- [ ] Full run recorded as the happy-path + edge demo scenarios (screenshots/exec logs kept for the deck).
- [ ] All evals re-run green; results archived in `evals/results/`.

## Depends on
- E7-S2, E6-S3, E9-S2

## Eval gate
- all eval cases (regression)

## Technical notes
- This story IS the acceptance test of the capstone's core rubric.

## Outcome (2026-07-26)
- Full Scenario A verified end to end on Oak & Ember. All 10 seed emails replayed via webhook + 1 live Gmail email; every lead reached the terminal state its label predicted (6 SENT, 3 NEEDS_REVIEW, 2 DISCARDED, plus 1 REJECTED from the extra reject-test lead).
- Human decisions were real: 6 drafts approved via inbox buttons, 1 rejected, and 1 approved via MCP tool (tenant B) - both surfaces exercised.
- Weekly insights generated for both tenants; sampled numbers reproduced by SQL (the audit that caught BUG-001).
- Eval regression all green: evals/results/2026-07-26-final-regression.md (classification 10/10, extraction 95.3% with zero hallucinations, qualification 85.7%, grounding 16/16 = 100%).
