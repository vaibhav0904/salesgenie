-- A2A boundary (migration 004). Idempotent. Decision: docs/adr/0011-a2a-at-the-boundary.md

BEGIN;

CREATE TABLE IF NOT EXISTS vaibhavcapstone_a2a_tasks (
  task_id      text PRIMARY KEY,
  lead_id      text NOT NULL REFERENCES vaibhavcapstone_leads(lead_id),
  business_id  text NOT NULL REFERENCES vaibhavcapstone_businesses(business_id),
  remote_agent text,                          -- whatever the caller declares about itself
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_vc_a2a_biz ON vaibhavcapstone_a2a_tasks (business_id, created_at);

-- Platform-level (not tenant) configuration. Secrets are inserted at deploy time
-- from .env (see docker/README.md) - never committed in a migration.
CREATE TABLE IF NOT EXISTS vaibhavcapstone_platform_config (
  key        text PRIMARY KEY,
  value      text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMIT;
