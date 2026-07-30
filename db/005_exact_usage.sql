-- Exact LLM usage (migration 005). Idempotent. Decision: docs/adr/0012-observability-backend.md
-- Token counts now come from the Gemini API's own usageMetadata (direct HTTP calls).
-- Historic rows keep usage_source='estimated' - honestly labeled, never rewritten.

BEGIN;

ALTER TABLE vaibhavcapstone_llm_calls
  ADD COLUMN IF NOT EXISTS usage_source text NOT NULL DEFAULT 'estimated'
  CHECK (usage_source IN ('estimated', 'exact_api'));

COMMIT;
