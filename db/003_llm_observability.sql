-- LLM observability (migration 003). Idempotent. Plan: docs/traceability.md (E11-S1).

BEGIN;

CREATE TABLE IF NOT EXISTS vaibhavcapstone_llm_calls (
  call_id        bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  business_id    text NOT NULL,
  lead_id        text,
  trace_id       text,
  call_site      text NOT NULL CHECK (call_site IN (
                   'classify_extract','classify_extract_retry','qualifier_reasons',
                   'recommender_rank','drafter','insights_narrative','judge')),
  prompt_version text NOT NULL DEFAULT 'v1',
  model          text NOT NULL,
  latency_ms     integer,
  input_tokens   integer,
  output_tokens  integer,
  cost_usd       numeric(10,6),
  schema_valid   boolean,
  attempt        integer NOT NULL DEFAULT 1,
  fallback_used  boolean NOT NULL DEFAULT false,
  finish_reason  text,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_vc_llm_calls_biz_time ON vaibhavcapstone_llm_calls (business_id, created_at);
CREATE INDEX IF NOT EXISTS idx_vc_llm_calls_site ON vaibhavcapstone_llm_calls (call_site, created_at);
CREATE INDEX IF NOT EXISTS idx_vc_llm_calls_lead ON vaibhavcapstone_llm_calls (lead_id);

CREATE TABLE IF NOT EXISTS vaibhavcapstone_judge_scores (
  score_id       bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  business_id    text NOT NULL,
  lead_id        text REFERENCES vaibhavcapstone_leads(lead_id),
  artifact_type  text NOT NULL CHECK (artifact_type IN ('extraction','draft','reasons')),
  artifact_ref   text NOT NULL,             -- lead_id for extraction/reasons, draft_id for drafts
  judge_model    text NOT NULL,
  score          integer NOT NULL CHECK (score BETWEEN 1 AND 5),
  violations     jsonb NOT NULL DEFAULT '[]'::jsonb,
  reasoning      text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (artifact_type, artifact_ref)      -- claim-then-judge: one verdict per artifact
);
CREATE INDEX IF NOT EXISTS idx_vc_judge_biz_time ON vaibhavcapstone_judge_scores (business_id, created_at);

COMMIT;
