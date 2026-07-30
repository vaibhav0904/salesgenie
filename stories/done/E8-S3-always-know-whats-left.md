# E8-S3: I always know exactly what's left to configure

**As an** Operator
**I want** to ask "what's missing?" and get a precise, plain-language answer
**So that** I'm never stuck wondering why some feature isn't working yet.

## Acceptance criteria
- [ ] `get_setup_status(business_id)` returns each component (profile, intake channel, catalog, reviewer, sender identity) as configured/missing, which pipeline stages are unlocked/gated, count of parked leads, and a next-step suggestion per gap.
- [ ] Response is structured but self-describing enough that any MCP client renders a helpful answer.
- [ ] Setup state is computed live from data (catalog = product count ≥ 1), never a manually-maintained flag.

## Depends on
- E8-S1

## Eval gate
- none

## Technical notes
- Gates table lives in `docs/contracts.md` §5; this tool is its runtime mirror.

## Outcome (2026-07-26)
- get_setup_status returns per-component configured/detail, unlocked vs gated pipeline stages, parked-lead count, plain-language next steps, and a single ready boolean.
- Computed live from data (catalog = product count, reviewer = config key) via the vaibhavcapstone_setup_state view - never a stored flag.
- Verified on half-configured tenant B: catalog+reviewer+sender flagged missing, recommend/draft/send gated, next_steps named the exact tools to call.
