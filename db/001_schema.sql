-- SalesGenie v2 schema (migration 001). Idempotent: safe to re-run.
-- State machines and vocabulary: docs/contracts.md. All rows keyed by business_id.

BEGIN;

CREATE TABLE IF NOT EXISTS vaibhavcapstone_businesses (
  business_id   text PRIMARY KEY,
  name          text NOT NULL,
  industry      text,
  -- tone, currency, reviewer_email, sender_identity, intake config, scoring weights/thresholds
  config        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vaibhavcapstone_products (
  business_id   text NOT NULL REFERENCES vaibhavcapstone_businesses(business_id),
  sku           text NOT NULL,
  name          text NOT NULL,
  category      text NOT NULL,
  price         numeric(12,2) NOT NULL CHECK (price >= 0),
  currency      text NOT NULL DEFAULT 'INR',
  attributes    jsonb NOT NULL DEFAULT '{}'::jsonb,
  stock_qty     integer NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (business_id, sku)
);

CREATE TABLE IF NOT EXISTS vaibhavcapstone_leads (
  lead_id       text PRIMARY KEY,
  business_id   text NOT NULL REFERENCES vaibhavcapstone_businesses(business_id),
  trace_id      text NOT NULL,
  channel       text NOT NULL,
  from_email    text,
  subject       text,
  body          text,
  raw_payload   jsonb NOT NULL DEFAULT '{}'::jsonb,
  received_at   timestamptz NOT NULL DEFAULT now(),
  status        text NOT NULL DEFAULT 'RECEIVED' CHECK (status IN (
                  'RECEIVED','CLASSIFIED','DISCARDED_SPAM','DISCARDED_NOT_ENQUIRY',
                  'EXTRACTED','QUALIFIED','RECOMMENDED','DRAFTED','PENDING_APPROVAL',
                  'APPROVED','SENT','REJECTED','AWAITING_SETUP','NEEDS_REVIEW','DEAD_LETTER')),
  -- when parked/dead: which stage to resume from and why
  status_detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_vc_leads_business_status ON vaibhavcapstone_leads (business_id, status);
CREATE INDEX IF NOT EXISTS idx_vc_leads_trace ON vaibhavcapstone_leads (trace_id);

CREATE TABLE IF NOT EXISTS vaibhavcapstone_extractions (
  lead_id          text PRIMARY KEY REFERENCES vaibhavcapstone_leads(lead_id),
  business_id      text NOT NULL REFERENCES vaibhavcapstone_businesses(business_id),
  classification   text NOT NULL CHECK (classification IN ('ENQUIRY','NOT_ENQUIRY','SPAM')),
  contact_name     text,
  contact_email    text,
  company          text,
  budget_value     numeric(14,2),
  budget_currency  text,
  product_interest jsonb NOT NULL DEFAULT '[]'::jsonb,
  urgency          text,
  location         text,
  raw_llm_output   jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vaibhavcapstone_qualifications (
  lead_id       text PRIMARY KEY REFERENCES vaibhavcapstone_leads(lead_id),
  business_id   text NOT NULL REFERENCES vaibhavcapstone_businesses(business_id),
  score         integer NOT NULL CHECK (score BETWEEN 0 AND 100),
  band          text NOT NULL CHECK (band IN ('HOT','WARM','COLD')),
  reasons       jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vaibhavcapstone_recommendations (
  lead_id            text PRIMARY KEY REFERENCES vaibhavcapstone_leads(lead_id),
  business_id        text NOT NULL REFERENCES vaibhavcapstone_businesses(business_id),
  -- [{sku, name, price, rationale}] — every sku SQL-verified before insert
  items              jsonb NOT NULL DEFAULT '[]'::jsonb,
  grounded           boolean NOT NULL DEFAULT false,
  no_grounded_reason text,
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vaibhavcapstone_drafts (
  draft_id      text PRIMARY KEY,
  lead_id       text NOT NULL REFERENCES vaibhavcapstone_leads(lead_id),
  business_id   text NOT NULL REFERENCES vaibhavcapstone_businesses(business_id),
  draft_type    text NOT NULL CHECK (draft_type IN ('CUSTOMER','INTERNAL')),
  subject       text,
  body          text NOT NULL,
  status        text NOT NULL DEFAULT 'DRAFT' CHECK (status IN (
                  'DRAFT','PENDING_APPROVAL','APPROVED','REJECTED','SENT')),
  revision      integer NOT NULL DEFAULT 1,
  decided_by    text,
  decided_at    timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_vc_drafts_business_status ON vaibhavcapstone_drafts (business_id, status);

CREATE TABLE IF NOT EXISTS vaibhavcapstone_events (
  event_id      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  business_id   text NOT NULL,
  lead_id       text,
  trace_id      text,
  agent         text NOT NULL,
  action        text NOT NULL,
  actor         text NOT NULL DEFAULT 'system',
  detail        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_vc_events_business_time ON vaibhavcapstone_events (business_id, created_at);
CREATE INDEX IF NOT EXISTS idx_vc_events_lead ON vaibhavcapstone_events (lead_id);

CREATE TABLE IF NOT EXISTS vaibhavcapstone_insights (
  insight_id    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  business_id   text NOT NULL REFERENCES vaibhavcapstone_businesses(business_id),
  week_start    date NOT NULL,
  week_end      date NOT NULL,
  metrics       jsonb NOT NULL DEFAULT '{}'::jsonb,
  narrative     text,
  chart_configs jsonb NOT NULL DEFAULT '[]'::jsonb,
  report_html   text,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_vc_insights_business ON vaibhavcapstone_insights (business_id, week_start);

-- Draft state machine enforced at DB level: only legal transitions allowed
-- (docs/contracts.md §4). The send step requires current status APPROVED.
CREATE OR REPLACE FUNCTION vaibhavcapstone_draft_transition_guard() RETURNS trigger AS $$
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  IF (OLD.status = 'DRAFT'            AND NEW.status = 'PENDING_APPROVAL')
  OR (OLD.status = 'PENDING_APPROVAL' AND NEW.status IN ('APPROVED','REJECTED'))
  OR (OLD.status = 'APPROVED'         AND NEW.status = 'SENT') THEN
    NEW.updated_at := now();
    RETURN NEW;
  END IF;
  RAISE EXCEPTION 'illegal draft transition % -> % (draft %)', OLD.status, NEW.status, OLD.draft_id;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_vc_draft_transition ON vaibhavcapstone_drafts;
CREATE TRIGGER trg_vc_draft_transition
  BEFORE UPDATE OF status ON vaibhavcapstone_drafts
  FOR EACH ROW EXECUTE FUNCTION vaibhavcapstone_draft_transition_guard();

-- Live setup-readiness per business (docs/contracts.md §5): computed, never stored flags.
CREATE OR REPLACE VIEW vaibhavcapstone_setup_state AS
SELECT
  b.business_id,
  (b.name IS NOT NULL AND b.config ? 'tone' AND b.config ? 'currency')      AS profile_ok,
  true                                                                       AS intake_ok,  -- webhook is platform-provided at birth
  EXISTS (SELECT 1 FROM vaibhavcapstone_products p
          WHERE p.business_id = b.business_id)                               AS catalog_ok,
  (b.config ? 'reviewer_email')                                              AS reviewer_ok,
  (b.config ? 'sender_identity')                                             AS sender_ok,
  (SELECT count(*) FROM vaibhavcapstone_leads l
   WHERE l.business_id = b.business_id AND l.status = 'AWAITING_SETUP')      AS parked_leads
FROM vaibhavcapstone_businesses b;

COMMIT;
