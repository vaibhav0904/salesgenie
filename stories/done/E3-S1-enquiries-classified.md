# E3-S1: Only real enquiries reach the sales team

**As a** Sales Rep
**I want** spam and non-enquiry mail filtered out automatically
**So that** my queue contains only potential business.

## Acceptance criteria
- [ ] `VaibhavCapstone-03-ClassifyExtract` classifies each lead ENQUIRY / NOT_ENQUIRY / SPAM via Gemini structured output.
- [ ] NOT_ENQUIRY and SPAM leads end in DISCARDED_* states with a logged reason event — kept for audit, never worked.
- [ ] Schema-invalid LLM output retries once, then lead → NEEDS_REVIEW (no silent drop).
- [ ] Classification accuracy on the labeled seed set meets `evals/cases/classification.md` threshold.

## Depends on
- E2-S1

## Eval gate
- evals/cases/classification.md

## Technical notes
- Classification and extraction are one Gemini call (one schema) to halve cost/latency; still separately reported in evals.

## Outcome (2026-07-26)
- VaibhavCapstone-03-ClassifyExtract (id BmN8SfRaPZQYYb9m) live; WF-01 hands off via Envelope (Build Envelope -> Execute Workflow, fire-and-forget). Export in n8n/workflows/.
- One Gemini 2.5 Flash call does classification + extraction (structured JSON); schema validation with one visible retry branch; still-invalid -> NEEDS_REVIEW (proven live when the initial output-parsing bug sent all leads there - no silent drops).
- Atomic persist CTE routes: SPAM/NOT_ENQUIRY -> DISCARDED_*, confidence < business min_confidence (default 0.6) -> NEEDS_REVIEW, else EXTRACTED.
- EVAL PASS (evals/results/2026-07-26-classification.md): 10/10, SPAM recall 100%. Gibberish email correctly parked at confidence 0.4.
- Prompt iterations v1->v3 recorded: pass From-Name header; names must be plausible (handles -> null); urgency = time-pressure only; location = city/region only; garbled -> extract nothing. Labels never modified.
