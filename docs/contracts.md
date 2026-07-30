# Contracts — Envelope, payloads, state machines

The single source of truth for how Agents talk to each other and what states exist. Any change here bumps `envelope_version` and gets noted in an ADR if irreversible.

## 1. Envelope (v1.0)

Every Agent sub-workflow accepts and returns:

```json
{
  "envelope_version": "1.0",
  "business_id": "biz_oakember",
  "lead_id": "lead_01H...",
  "trace_id": "trc_01H...",
  "agent": "qualifier",
  "status": "ok | error | skipped | setup_incomplete",
  "payload": { }
}
```

Rules:
- Agents validate the envelope on entry; invalid → route to Error Handler, never partial-process.
- `trace_id` is minted at intake and carried unchanged through every hop and Event row.
- `status != ok` payloads carry `{ "reason": "...", "missing": ["catalog"] }` where applicable.

## 2. Per-agent payloads (summary; JSON Schemas live beside workflows as they're built)

| Agent | Input payload (needs) | Output payload (adds) |
|---|---|---|
| `intake` | raw channel payload + channel name | normalized enquiry: from_email, subject, body, received_at |
| `classify_extract` | normalized enquiry | classification (ENQUIRY / NOT_ENQUIRY / SPAM) + extraction entities |
| `qualifier` | extraction + business scoring config | score (0–100), band (HOT/WARM/COLD), reasons[] |
| `recommender` | extraction + qualification | items[] {sku, name, price, rationale} (1–3, grounded) or no_grounded_option |
| `drafter` | recommendation + business tone | draft_id, draft_type, body |
| `insights` | business_id + week window | metrics jsonb, chart urls, narrative, report ref |

## 3. Lead status state machine

```
RECEIVED → CLASSIFIED → {DISCARDED_SPAM | DISCARDED_NOT_ENQUIRY}
CLASSIFIED → EXTRACTED → QUALIFIED → RECOMMENDED → DRAFTED
DRAFTED → PENDING_APPROVAL → {APPROVED → SENT | REJECTED}
any stage → AWAITING_SETUP   (gated stage hit missing config; resume on setup completion)
any stage → NEEDS_REVIEW     (LLM/validation fallback after retry; human triage)
any stage → DEAD_LETTER      (unrecoverable error after retries)
```

## 4. Draft status state machine

```
DRAFT → PENDING_APPROVAL → APPROVED → SENT
DRAFT → PENDING_APPROVAL → REJECTED (terminal; new revision may be created)
```
Enforced in Postgres (status checks on update), not just in workflow branching. The send node is reachable only from `APPROVED`.

## 5. Setup-readiness gates

| Component | Gates stage |
|---|---|
| profile (name, industry, tone, currency) | none (created at birth) |
| intake channel (webhook issued) | Intake |
| catalog (≥1 product) | Recommender |
| reviewer email | DraftHITL approval |
| sender identity | Send step |

`setup_state` = computed jsonb on `vaibhavcapstone_businesses`: `{component: true/false}` + derived `ready_stages[]`.

## 6. Error-tag convention

When a pipeline workflow throws deliberately (or wraps a failure), the error message starts with `LEAD:<lead_id>|TRACE:<trace_id>|<detail>`. `VaibhavCapstone-00-ErrorHandler` parses these tags (from message+description+stack — n8n splits Code-node error messages on colons) to dead-letter the right lead and stamp events. Errors without tags still alert + log, attributed to `platform`.

## 7. Events

One row per state change / agent step: `business_id, lead_id, trace_id, agent, action, actor ("system" | email | MCP identity), detail jsonb, created_at`. Insights numbers are computed from Events + Leads only — if a metric can't be traced to rows, it doesn't ship.
