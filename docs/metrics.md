# Success metrics & baselining plan

Five metrics, each tied to a stated pain in the brief, each computable from `vaibhavcapstone_*` rows today (no new instrumentation needed).

## The metrics

| # | Metric | Definition | Why this one | Direction |
|---|---|---|---|---|
| 1 | **Time to first response** | Median minutes from `LEAD_RECEIVED` to `EMAIL_SENT` for leads that get a reply | The brief's core pain: manual reading + hand-written replies create hours of latency | ↓ sharply |
| 2 | **Extraction accuracy** | % of entity fields matching a human-labeled set, with a hard zero-tolerance for hallucinated values | Replaces "manual Excel entry → mistakes, duplicates, omissions" | ↑ toward 95%+ |
| 3 | **Auto-qualified rate** | % of enquiries that reach `QUALIFIED` without human help (i.e. not `NEEDS_REVIEW`/`DEAD_LETTER`) | Measures how much of the funnel actually runs unattended — the 7% headcount cut premise | ↑, watch alongside #5 |
| 4 | **Recommendation grounding rate** | % of recommended SKUs that verify against live, in-stock catalog rows | The anti-hallucination guardrail; a single failure is a customer-trust incident | **100%, non-negotiable** |
| 5 | **Reviewer approval rate** | approved ÷ (approved + rejected) drafts | Proxy for output quality *and* for reviewer trust; a falling rate means the AI is drifting | ↑ toward 85–90% |

**Guardrail pairing:** #3 and #5 must be read together. Pushing automation up (#3) by lowering the confidence threshold will show up as a falling approval rate (#5). Neither number is meaningful alone.

## Week-0 baselining plan

**The manual baseline (before switching anything on).** For one week, the sales team keeps working exactly as today, logging four things per enquiry in a shared sheet: timestamp received, timestamp replied, whether a recommendation was included, and whether the enquiry was even noticed the same day. That gives baselines for #1 and #3 that are real rather than estimated. For #2, a manager re-keys 20 already-processed enquiries and counts field-level discrepancies against the CRM — the manual error rate. #4 has no manual baseline worth measuring (humans read the stock sheet); #5 starts at 100% by definition since humans write everything.

**Illustrative starting figures** (from the brief's description of the process, to be replaced by real Week-0 data): first response measured in hours-to-days; some enquiries never answered; recommendation quality varies by rep.

**The shadow week (system on, humans still in charge).** Run the pipeline over the same inbox with every draft going to a reviewer. Nothing reaches customers without approval — that is already how the system works, so the shadow week costs nothing to arrange. It yields the first real values for #2, #4 and #5, and a like-for-like #1 (time to *drafted*, comparable to the manual time-to-replied).

**Current measured values** (this build, 12 leads across the seed set — a demo sample, not a pilot):

| Metric | Value | Source |
|---|---|---|
| Time to first response | 34.5 min average lead→draft, including human approval wait; pipeline-only latency is **~19 s** | `avg_mins_to_draft` in the weekly insight; the 19s figure timed on a fresh webhook lead |
| Extraction accuracy | **92.2–96.9%** field-level across 5 runs, median **95.3%**; hallucinated fields 0 in 4 of 5 runs | `evals/results/2026-07-30-extraction-spread.md` |
| Auto-qualified rate | 7 of 10 enquiries fully automatic; 3 routed to humans by design | `evals/results/2026-07-26-final-regression.md` |
| Grounding rate | **100%** (16/16 SKUs verified) | same |
| Approval rate | 86% (6 approved, 1 rejected) | weekly insight `approval` block |

## How each is instrumented

Every metric already falls out of the event log and lead table — the same SQL that builds the weekly report (`VaibhavCapstone-07`, node *Compute Metrics*). No separate analytics pipeline, and every figure is reproducible by hand, which is how BUG-001 was caught.

## Expected impact (stated as a hypothesis, not a promise)

If the shadow week holds up, the pipeline replies to a qualified enquiry in minutes instead of hours, removes hand-keying entirely, and keeps a rep in the loop on every outbound message. The headcount question then becomes a throughput question: the same reviewers can cover several times the enquiry volume, because their work shifts from *reading and writing* to *approving and handling exceptions* — the three NEEDS_REVIEW cases per ten enquiries seen here.
