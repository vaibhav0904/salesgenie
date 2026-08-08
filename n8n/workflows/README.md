# n8n workflow exports

14 workflows, all prefixed `VaibhavCapstone-`. Exported from the running local instance and verified against it — node counts, node names, connections and every node's parameters match the live system exactly. Scanned for secrets: none (credentials appear as id + name references only; n8n never exports their contents).

**Every workflow is annotated.** Each canvas carries sticky notes in plain English — a note per stage explaining what that group of nodes does and why, plus callouts on the guardrails (the two stock checks, the guarded approval writes, the self-send trap). You should be able to open any workflow and narrate it end to end without opening a single node.

## The system at a glance

```
Gmail ──▶ 02-GmailAdapter ─┐
                           ├─▶ 01-Intake ─▶ 03-ClassifyExtract ─▶ 04-Qualifier ─▶ 05-Recommender ─▶ 06-DraftHITL ─▶ (human) ─▶ send
Any channel ──── webhook ──┘                      │                                      │                 │
                                                  ▼                                      ▼                 ▼
                                          DISCARDED_SPAM /                        AWAITING_SETUP     PENDING_APPROVAL
                                          DISCARDED_NOT_ENQUIRY                   NEEDS_REVIEW
                                                                                         │
   MCP chat ──▶ 08-MCPOnboarding ──(setup completed)──▶ 10-ResumeParked ─────────────────┘
   MCP chat ──▶ 09-MCPOperations  (inspect, test, approve/reject)
   Other AI ──▶ 13-A2AServer      (agent card + JSON-RPC; PENDING_APPROVAL surfaces as input-required)
   cron ──────▶ 07-WeeklyInsights (metrics + QuickChart PNGs + narrative)
   cron ──────▶ 11-NeedsReviewNotify (sweeps NEEDS_REVIEW → reviewer)
   cron ──────▶ 12-LLMJudge       (a second vendor grades the first for invented facts)
   any failure ▶ 00-ErrorHandler  (dead-letter + alert)
```

| File | Role |
|---|---|
| `00-ErrorHandler` | Global error workflow: dead-letters the lead, logs, alerts the operator |
| `01-Intake` | Canonical enquiry webhook; mints lead + trace ids, validates, hands off the Envelope |
| `02-GmailAdapter` | Email → canonical payload (channel adapter, zero pipeline logic, self-send guard) |
| `03-ClassifyExtract` | Gemini: enquiry/spam classification + entity extraction, schema-validated with retry |
| `04-Qualifier` | Deterministic rubric from tenant config → score + band; Gemini writes the reasons |
| `05-Recommender` | SQL-grounded candidates → Gemini ranks → SQL re-verifies every SKU |
| `06-DraftHITL` | Drafts in the tenant's voice; email approval gate; sends only from APPROVED |
| `07-WeeklyInsights` | Per-tenant metrics, QuickChart PNGs, narrative, stored + emailed + served |
| `08-MCPOnboarding` | MCP tools: `create_business`, `upload_catalog`, `set_reviewer`, `get_setup_status`, `update_business_config`, `get_intake_endpoint` |
| `09-MCPOperations` | MCP tools: `get_lead_status`, `list_pending_approvals`, `approve_draft`, `reject_draft`, `get_insights`, `send_test_lead` |
| `10-ResumeParked` | Un-parks AWAITING_SETUP leads once their blocking gate is satisfied |
| `11-NeedsReviewNotify` | Sweeper: tells the reviewer when the AI declined to act |
| `12-LLMJudge` | Cross-vendor grading: OpenAI GPT-4o scores Gemini's extractions, reasons and drafts for invented facts; writes `judge_scores` and alerts on a fail |
| `13-A2AServer` | Agent-to-agent door: serves the public Agent Card and the JSON-RPC endpoint (`message/send`, `tasks/get`); maps the human approval gate to the protocol's `input-required` state |

## Importing into a fresh n8n

**1. Create these credentials.** n8n matches them by name on import, so use these names exactly:

| Type | Name | Used by |
|---|---|---|
| Postgres | `Capstone-Postgres` | all 14 |
| Google Gemini (PaLM) | `Google Gemini(PaLM) Api account` | 03, 04, 05, 06, 07 — the primary model |
| OpenAI | `OpenAI account` | 03, 04, 05, 06, 07 as the **fallback** model, and 12 as the **judge** (which must be a different vendor from the model it grades) |
| SMTP | `Capstone-SMTP` | 00, 06, 07, 09, 11, 12 |
| IMAP | `Capstone-IMA` | 02-GmailAdapter *(name is stored exactly like this — not `Capstone-IMAP`)* |
| Bearer Auth | `Capstone-MCP-Bearer` | 08, 09 MCP triggers |
| Header Auth | `Capstone-Langfuse` | 03, 04, 05, 06, 07, 12 — trace shipping |

**2. Apply the database migrations, in order** — all five, not just the first two:

```
db/001_schema.sql            core tables
db/002_seed_oakember.sql     the demo tenant + 20-SKU catalogue
db/003_llm_observability.sql llm_calls, judge_scores      → 12-LLMJudge, the AI-health report section
db/004_a2a.sql               a2a_tasks                    → 13-A2AServer
db/005_exact_usage.sql       exact token accounting       → the "36× too low" cost figures
```

Skipping 003–005 leaves the pipeline running but silently breaks the judge, the A2A door and the whole AI-health section of the weekly report.

**3. Import each JSON**, then re-select any credential n8n flags.

**4. Publish in dependency order.** n8n refuses to publish a workflow that references an unpublished sub-workflow, and the chain runs *backwards* from the pipeline order — each stage calls the next, so the last stage must exist first:

```
06-DraftHITL  →  05-Recommender  →  04-Qualifier  →  03-ClassifyExtract  →  10-ResumeParked
```

then everything else in any order: `00, 01, 02, 07, 08, 09, 11, 12, 13`.

The call graph, for reference:

```
01-Intake        ──▶ 03-ClassifyExtract
03-ClassifyExtract ─▶ 04-Qualifier
04-Qualifier     ──▶ 05-Recommender
05-Recommender   ──▶ 06-DraftHITL
08-MCPOnboarding ──▶ 10-ResumeParked
10-ResumeParked  ──▶ 05-Recommender, 06-DraftHITL
```

**5. Re-point the `Execute Workflow` nodes.** Workflow IDs are per-instance; the **eight** handoff nodes reference IDs, not names, so they must be re-selected after import. `node scripts/retarget-host.js --base <your-url>` prints the exact list (and rewrites the host URLs below in the same pass).

**6. Re-point the error workflow.** All 13 non-handler workflows already carry `00-ErrorHandler` as their error workflow in these exports, but that setting is also stored as an ID — so re-select it (Settings → Error Workflow) after import, or failures will be invisible.

**Host URLs.** The exports ship with `http://localhost:5678`, which appears **20 times across 5 files** — and five of those are inside Postgres SQL queries and Code nodes, where a find-and-replace over node URLs will miss them. There are also 7 hardcoded `http://langfuse-web:3000` trace URLs (a Docker service name that resolves nowhere else). Do not hand-edit these:

```bash
node scripts/retarget-host.js --base https://you.app.n8n.cloud \
     --langfuse https://cloud.langfuse.com --reviewer you@yourbusiness.com
```

It writes retargeted copies to `n8n/workflows-retargeted/`, leaves the originals untouched, and prints everything it *cannot* fix (the error-workflow reference and the eight Execute Workflow nodes, which n8n resolves by ID).

**What each workflow does** — triggers, endpoints, credentials, tables read and written, and the call graph — is in [`docs/workflows-reference.md`](../../docs/workflows-reference.md), generated from these exports so it cannot drift.

**Keeping these files honest.** Editing a workflow in the n8n UI silently changes its stored JSON, so committed exports go stale. Before committing workflow changes, run `node scripts/sync-workflows.js` (or `--check` to just be told). It re-exports every `VaibhavCapstone-*`, regenerates the reference above, and scrubs any real operator email back to the placeholder.
