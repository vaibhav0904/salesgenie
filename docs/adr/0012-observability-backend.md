# ADR 0012 — Exact LLM usage + a dual-write observability backend (Postgres + Langfuse)

**Status:** accepted · **Date:** 2026-07-26 · **Amends:** ADR-0010

## Context
ADR-0010's telemetry had one honest approximation: token counts were chars÷4 estimates, because n8n's Gemini node strips `usageMetadata` from responses. Estimated cost per lead read $0.00019. The user challenged this — rightly.

## Decision

**1. Exactness comes from the source, not from a tool.** No observability platform can know Gemini's token counts unless the API reports them. So all six pipeline call sites now call `generateContent` over plain HTTP (same n8n credential, same prompts, same model, JSON mode preserved) and read exact `usageMetadata`. The swap was proven behavior-neutral by replaying the full labeled seed set: identical eval scores (10/10 classification, 95.3% extraction, 0 hallucinated).

**2. Dual-write: Postgres is the system of record, Langfuse is the lens.** `vaibhavcapstone_llm_calls` (now with `usage_source = 'exact_api' | 'estimated'`) keeps feeding the SQL-reproducible weekly report. In parallel, every call ships to self-hosted **Langfuse v3** (`docker/langfuse-compose.yml`, UI :3100) as a generation on the lead's own `trace_id`, priced by registered model definitions; the LLM judge ships its own generations and attaches rubric results as Langfuse **scores** on the same trace. Shipping is fail-safe (`continueOnFail`; verified: pipeline unaffected with Langfuse stopped).

**Why Langfuse and not LangSmith:** LangSmith is SaaS-only — trace payloads (including enquiry text) would leave the machine, violating the platform's free-and-local principle. Langfuse is open source and runs entirely in the same docker network.

## The finding that justified the work
Exact cost per lead is **≈ $0.0074 — about 36× the estimate.** Gemini 2.5 Flash's *thinking tokens* (invisible to any character-based estimate, but billed as output) dominate usage. Historic estimate rows were not rewritten; they stay labeled `estimated` as a record of the correction.

## Consequences
- Every number in AI-health is now exact; latency percentiles unchanged in method, cost recomputed.
- One more one-time deploy step: model prices must exist in Langfuse (documented in `docker/README.md`).
- PII posture: Langfuse stores prompt inputs/outputs (truncated) — same trust domain, local only; noted as a production consideration (scrubbing before shipping).
