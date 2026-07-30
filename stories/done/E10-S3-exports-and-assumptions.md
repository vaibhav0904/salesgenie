# E10-S3: Everything gradable is in the repo

**As the** capstone evaluator
**I want** the workflow JSONs, assumptions, and metrics baseline in one place
**So that** the submission is complete and reproducible.

## Acceptance criteria
- [ ] Every `VaibhavCapstone-*` workflow exported to `n8n/workflows/*.json` (final versions, credentials parameterized/stripped).
- [ ] `docs/assumptions.md`: all dummy data + mock integrations identified; MVP assumptions explicit and minimal.
- [ ] `docs/metrics.md`: 5 success metrics with Week-0 baselining plan and expected direction — time-to-first-response, extraction accuracy, % leads auto-qualified, recommendation grounding rate, reviewer approval rate.
- [ ] CLAUDE.md updated with any conventions/gotchas learned during the build (self-improvement rule).
- [ ] `evals/results/` contains the final dated regression run.

## Depends on
- E10-S2

## Eval gate
- none

## Technical notes
- Deck + video script are a separate later phase per scope decision; this story only guarantees their raw material exists.

## Outcome (2026-07-26)
- All 12 VaibhavCapstone-* workflows exported to n8n/workflows/ with an import guide (credential names, publish order, ID re-pointing). Secret scan clean: no tokens/passwords in any export.
- docs/assumptions.md: dummy data, mock integrations (shared mailbox + [enquiry] tag, demo email redirect, Postgres-as-CRM), 10 product assumptions, security posture incl. the unauthenticated intake webhook as the biggest known gap, and known limitations.
- docs/metrics.md: 5 metrics with definitions, guardrail pairing (#3 vs #5), a concrete Week-0 manual baseline + shadow-week plan, and current measured values.
- evals/results/2026-07-26-final-regression.md: all four cases green, terminal states match labels 10/10, zero tenant identifiers in exports.
- CLAUDE.md refreshed (commands, doc map, gotchas) and kept under 500 words.
