# ADR 0003 — Gemini 2.5 Flash as the LLM

**Status:** accepted · **Date:** 2026-07-26

## Context
A Gemini credential already exists in the local n8n; user preference is Gemini 2.5 Flash. Tasks: classification, entity extraction, qualification reasoning, grounded drafting, insights narrative — all structured-output-friendly.

## Decision
Gemini 2.5 Flash for every LLM step, via the existing n8n credential. Structured output (JSON schema) + validation + one retry on every call; fallback to `NEEDS_REVIEW` (human triage), never silent failure.

## Consequences
- Zero new cost/keys; fast and cheap per call.
- Prompts are written provider-agnostically so switching models is a node-level change, not a redesign.
