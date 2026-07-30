# E12-S3: Watch two agents do business

**As the** capstone evaluator
**I want** to watch an external "buyer agent" discover a tenant, enquire, wait at the human gate, and receive the offer
**So that** agent-to-agent interop is demonstrated live, not asserted on a slide.

## Acceptance criteria
- [ ] `scripts/buyer-agent-demo.js` (Node, zero deps): fetches the Agent Card, sends a natural-language enquiry via `message/send`, polls `tasks/get` narrating every state change (including `input-required` while the human decides), prints the final artifact.
- [ ] Full run against tenant A with a real human approval click in the middle.
- [ ] Run against tenant B proves tenant-agnosticism (different card, different catalog, same script).
- [ ] `scripts/README.md` documents usage (env vars for token/tenant).

## Depends on
- E12-S2

## Eval gate
- the two demo runs

## Technical notes
- This is the A2A scene of the demo video.

## Outcome (2026-07-26)
Done. `scripts/buyer-agent-demo.js` (zero-dep Node) + `scripts/README.md`.
- **Tenant A run:** discovered "Oak & Ember Interiors Sales Agent", enquired (2 conference tables + 10 chairs, ₹1.5L), narrated `submitted → working (QUALIFIED) → input-required` (human-gate callout printed) `→ completed` after a real Approve click; artifact = approved reply + CHR-002/CHR-003/TBL-001.
- **Tenant B run:** same script, `biz_pagebindbooks` — different card, different catalog, zero code changes. First run exposed BUG-003 (plural tokens vs singular names; filed + fixed). Rerun grounded STA-001 Leather Journal A5 and completed after a real Approve; the tenant's configured playful tone is visible in the reply.
- The NEEDS_REVIEW detour was itself protocol-honest: reported as `working` with an explanation, never an invented product.
