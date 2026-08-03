# E22-S3: Drafts and recommendations use the whole conversation, not just the latest message

**As a** Sales Rep
**I want** the AI's classification, recommendations, and drafts to reflect everything the customer has already told us
**So that** replies read as a coherent conversation and customers are never asked to repeat themselves

## Acceptance criteria
- [ ] 03-ClassifyExtract's prompt includes prior turns from
      `vaibhavcapstone_messages` (E22-S1) for the lead being processed, not
      just the newest message.
- [ ] 05-Recommender and 06-DraftHITL likewise have the conversation
      history available when building their prompts.
- [ ] Concretely demonstrated: a fact stated in turn 1 (e.g. a budget) is
      reflected in extraction/qualification/draft on turn 2, without the
      customer restating it.
- [ ] PII minimization hard rule still holds — only what's needed goes into
      the prompt (message bodies relevant to the enquiry), not unrelated
      history.

## Depends on
- E22-S2

## Eval gate
- none at this stage — verified via `.tests.md` + UAT. A future eval case
  (multi-turn extraction accuracy) is a reasonable follow-on, not required
  to ship this story.

## Technical notes
- No real multi-turn conversation data exists yet to size a token-cost
  truncation strategy — ship unbounded-history-per-lead first (per
  PRD-E22's open question), revisit only if it becomes a real problem.
- Direct-HTTP Gemini/OpenAI call sites (not n8n's native AI nodes, per
  CLAUDE.md gotcha) already need prompt-construction changes for other
  reasons — this is an additive input to those, not a rebuild.
