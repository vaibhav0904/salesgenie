# LLM Traceability & Observability Plan

> **Update (2026-07-26, ADR-0012):** token counts are now EXACT — all six call sites call Gemini's API directly and read `usageMetadata` (including thinking tokens). Every call also ships to self-hosted **Langfuse** (http://localhost:3100) as a priced generation on the lead's trace, with judge results attached as scores. Postgres stays the system of record. Exact cost/lead ≈ $0.0074 — ~36× the old chars÷4 estimate, because thinking tokens dominate. Sections below describing the estimate remain as designed-history; `usage_source` in `vaibhavcapstone_llm_calls` says which regime a row belongs to.

Written **before** instrumenting (E11-S1). The question this document answers, per call site: *what must we capture, what does "bad" look like, which metric does it feed, and who acts on it?* Instrumentation (E11-S2), judging (E11-S3) and reporting (E11-S4) implement this plan — nothing is logged that isn't decided here.

## Why observe LLM calls at all

Deterministic code fails loudly; LLM steps fail *plausibly*. The three failure classes we must see coming:
1. **Behavioral drift** — a model update or prompt edit silently changes classification/extraction quality. Caught by: schema-validity rate, retry rate, judge scores over time.
2. **Economic drift** — prompts grow, volume grows, cost per lead creeps. Caught by: token counts and notional cost per call site.
3. **Trust erosion** — outputs stop following instructions (invented discounts, wrong tone) in ways schema validation can't see. Caught by: LLM-as-judge scoring with violations.

## What every call records (`vaibhavcapstone_llm_calls`)

| Field | Why it exists |
|---|---|
| `trace_id`, `lead_id`, `business_id` | Join any AI action to the lead journey and tenant — same traceability rule as everything else |
| `call_site` | Which of the 6 prompts ran (see matrix) — every metric is per-site or it's noise |
| `prompt_version` | The variable most likely to change behavior; without it, drift is unattributable |
| `model` | Second most likely variable |
| `latency_ms` | Feeds p50/p95; the pipeline's 19s end-to-end budget is mostly LLM time |
| `input_tokens`, `output_tokens` | Raw material for cost; also catches prompt bloat. **Estimated** (chars ÷ 4): the n8n Gemini node strips the API's `usageMetadata`, verified on live executions. Direct-API calls would give exact counts — noted as a production upgrade. |
| `cost_usd` (notional) | Computed at write time from price constants below |
| `schema_valid` | Did the output parse against the contract on this attempt? |
| `attempt` (1/2), `fallback_used` | Retry pressure and how often we degrade to deterministic fallbacks |
| `finish_reason` | Truncations (`MAX_TOKENS`) are a distinct failure smell |

**Latency measurement**: `Date.now() − __t0`, where `__t0` is stamped by the node feeding the Gemini node. Includes n8n hop overhead (~tens of ms); documented as approximate and consistent, which is what trend-watching needs.

**Cost constants** (Gemini 2.5 Flash, per 1M tokens): input $0.30, output $2.50. The AI-Studio free tier makes real spend ₹0 today — cost is recorded *notionally* so the economics are visible before they're real. Judge calls (OpenAI) get the same treatment with that model's constants.

## Capture matrix — the six call sites

| Call site (workflow) | What "bad" looks like | Extra signal beyond the standard row | Metric it feeds | Who acts |
|---|---|---|---|---|
| `classify_extract` (WF-03) | Spam reaching reps; invented entities; garbled mail confidently processed | confidence value; classification | Extraction accuracy, spam recall | PM (prompt), reviewer (triage) |
| `classify_extract_retry` (WF-03) | Retry rate climbing = prompt/schema mismatch | attempt=2 | Retry rate | PM |
| `qualifier_reasons` (WF-04) | Reasons citing facts not in the extraction | fallback_used (rubric-as-reasons) | Reasons factuality (judge) | PM |
| `recommender_rank` (WF-05) | SKUs outside the candidate list (already filtered — frequency of filtering is the signal) | dropped-SKU count | Grounding pressure | PM |
| `drafter` (WF-06) | Invented discounts/dates; tone drift | — | Draft groundedness + tone (judge), approval rate | Reviewer, PM |
| `insights_narrative` (WF-07) | Numbers in prose that aren't in the metrics | fallback_used | Narrative faithfulness (spot check) | Manager |

## LLM-as-judge design (E11-S3)

**Separation of doer and grader**: Gemini produces, **OpenAI judges** — a different model family, so no self-preference bias. Judge runs as a background **sweeper** (30-min cron, claim-then-judge like WF-11): monitoring must never add latency to the pipeline or block it — a judge outage degrades observability, not sales.

| Artifact | Rubric (strict JSON `{score_1_5, violations[], reasoning}`) | Auto-fail |
|---|---|---|
| Extraction vs raw email | Every non-null field traceable to the text; nulls where the text is silent | Any invented value → score 1 + violation |
| Draft vs facts + tone config | Only provided products/prices; no invented discounts, stock promises, dates; tone matches the config description | Any invented commercial claim → ≤2 |
| Reasons vs extraction + rubric | Each reason references a real fact or rubric factor | Any invented fact → ≤2 |

**Scale**: 1–5, criteria-anchored in the prompt (5 = fully faithful & on-tone; 3 = faithful but tone-flat; 1 = fabrication). **Coverage**: 100% at demo volume; the sampling knob is a config value for production. **Alerting**: any groundedness score ≤ 2 emails the operator immediately (same channel as WF-00 alerts). **Privacy**: the judge sees exactly the inputs the original call saw, never more.

**Known limits** (stated, not hidden): the judge is itself an LLM — scores are a monitoring signal, not ground truth; the labeled eval set remains the gold standard. Judge disagreement with human evals should be reviewed monthly (production posture).

## Reporting (E11-S4)

Weekly report gains an **AI health** section: cost/lead, p50/p95 latency, schema-validity %, retries, fallbacks, judge averages + violations — every number from SQL over `llm_calls`/`judge_scores`, reproducible by hand, same as all other insights.

## What we deliberately do NOT capture

- Full prompts/completions per call (PII-heavy duplication; `raw_llm_output` already lives on the artifact rows where needed).
- Per-token logprobs / embeddings — no consumer for them in this product.
- External observability SaaS (Langfuse/LangSmith): rejected in ADR-0010 — local, free, and queryable next to the data it describes beats a dashboard we'd have to leave the stack to see.
