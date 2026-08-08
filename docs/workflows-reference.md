# Workflow reference — what each of the 14 workflows does

**Generated from `n8n/workflows/*.json` by `scripts/gen-workflows-reference.js`.**
Do not edit by hand — run `node scripts/sync-workflows.js`, which re-exports the live
workflows and regenerates this file. Only the one-line purposes are hand-written.

Paths below are shown relative to your n8n base URL. The exports ship with
`http://localhost:5678`; `scripts/retarget-host.js` rewrites them for your host.

## Every endpoint, in one place

| Endpoint | Workflow | What it is for |
|---|---|---|
| `POST /webhook/vaibhavcapstone-intake` | 01-Intake | The one door every enquiry enters by, whatever its origin |
| `POST /webhook/vaibhavcapstone-insights-run` | 07-WeeklyInsights | Generate this week's report now |
| `GET /webhook/vaibhavcapstone-insights-latest` | 07-WeeklyInsights | Serve the latest report as a web page |
| `/mcp/vaibhavcapstone-onboarding` | 08-MCPOnboarding | MCP server — point your chat client here (bearer auth) |
| `POST /webhook/vaibhavcapstone-tool-create-business` | 08-MCPOnboarding | Backing endpoint for the matching chat tool |
| `POST /webhook/vaibhavcapstone-tool-update-config` | 08-MCPOnboarding | Backing endpoint for the matching chat tool |
| `POST /webhook/vaibhavcapstone-tool-set-reviewer` | 08-MCPOnboarding | Backing endpoint for the matching chat tool |
| `POST /webhook/vaibhavcapstone-tool-upload-catalog` | 08-MCPOnboarding | Backing endpoint for the matching chat tool |
| `POST /webhook/vaibhavcapstone-tool-setup-status` | 08-MCPOnboarding | Backing endpoint for the matching chat tool |
| `POST /webhook/vaibhavcapstone-tool-intake-endpoint` | 08-MCPOnboarding | Backing endpoint for the matching chat tool |
| `/mcp/vaibhavcapstone-operations` | 09-MCPOperations | MCP server — point your chat client here (bearer auth) |
| `POST /webhook/vaibhavcapstone-tool-lead-status` | 09-MCPOperations | Backing endpoint for the matching chat tool |
| `POST /webhook/vaibhavcapstone-tool-pending-approvals` | 09-MCPOperations | Backing endpoint for the matching chat tool |
| `POST /webhook/vaibhavcapstone-tool-approve-draft` | 09-MCPOperations | Backing endpoint for the matching chat tool |
| `POST /webhook/vaibhavcapstone-tool-reject-draft` | 09-MCPOperations | Backing endpoint for the matching chat tool |
| `POST /webhook/vaibhavcapstone-tool-get-insights` | 09-MCPOperations | Backing endpoint for the matching chat tool |
| `POST /webhook/vaibhavcapstone-tool-send-test-lead` | 09-MCPOperations | Backing endpoint for the matching chat tool |
| `POST /webhook/vaibhavcapstone-needs-review-sweep` | 11-NeedsReviewNotify | Notify reviewers of leads awaiting a human, now |
| `POST /webhook/vaibhavcapstone-judge-sweep` | 12-LLMJudge | Run the quality examiner now |
| `GET /webhook/a2a-agent-card` | 13-A2AServer | Public discovery document for other companies' AI |
| `POST /webhook/a2a-rpc` | 13-A2AServer | JSON-RPC endpoint for agent-to-agent enquiries |

## How they call each other

```
POST /webhook/vaibhavcapstone-intake
        │
        ▼
  01-Intake ──▶ 03-ClassifyExtract ──▶ 04-Qualifier ──▶ 05-Recommender ──▶ 06-DraftHITL ──▶ 🧑 approve ──▶ send

  02-GmailAdapter ─┐
  09-MCPOperations ┼─ HTTP POST ──▶ /webhook/vaibhavcapstone-intake
  13-A2AServer ────┘

  08-MCPOnboarding ──▶ 10-ResumeParked ──▶ 05-Recommender ──▶ 06-DraftHITL

  every workflow ──(on failure)──▶ 00-ErrorHandler
```

Handoffs use n8n **Execute Workflow** nodes, which reference the target by internal
id. Those ids are per-instance, so after importing you must re-select the target in
each one — `scripts/retarget-host.js` prints the exact list.

## The workflows

### 00-ErrorHandler

Catches failures from every other workflow, dead-letters the affected lead if one can be identified, records the error, and emails the operator. Nothing fails silently.

- **Starts when:** fires when any workflow naming it as error handler fails
- **Credentials:** Capstone-Postgres (postgres), Capstone-SMTP (smtp)
- **Writes:** `vaibhavcapstone_events`, `vaibhavcapstone_leads`
- **Reads:** `vaibhavcapstone_leads`
- **Nodes:** 11
- **Export:** `n8n/workflows/VaibhavCapstone-00-ErrorHandler.json`

### 01-Intake

The front door. Validates an incoming enquiry against the Envelope contract, refuses unknown businesses, creates the lead row, and hands off to classification.

- **Starts when:** `POST /webhook/vaibhavcapstone-intake`
- **Credentials:** Capstone-Postgres (postgres)
- **Writes:** `vaibhavcapstone_events`, `vaibhavcapstone_leads`
- **Reads:** `vaibhavcapstone_businesses`
- **Calls:** 03-ClassifyExtract (via "Call ClassifyExtract")
- **Nodes:** 18
- **Export:** `n8n/workflows/VaibhavCapstone-01-Intake.json`

### 02-GmailAdapter

The email door. Polls a mailbox over IMAP for tagged enquiries and forwards each one to the intake webhook as a normal payload, so email is not a special case downstream.

- **Starts when:** IMAP poll of `INBOX`
- **Credentials:** Capstone-IMA (imap), Capstone-Postgres (postgres)
- **Writes:** `vaibhavcapstone_events`
- **Reads:** `vaibhavcapstone_businesses`
- **Nodes:** 10
- **Export:** `n8n/workflows/VaibhavCapstone-02-GmailAdapter.json`

### 03-ClassifyExtract

Decides whether a message is a genuine enquiry, spam, or not an enquiry at all, and pulls out the facts (contact, budget, product interest, urgency). Retries once, then routes to a human rather than guessing.

- **Starts when:** called by another workflow (sub-workflow)
- **Credentials:** Capstone-Langfuse (httpHeaderAuth), Capstone-Postgres (postgres), Google Gemini(PaLM) Api account (googlePalmApi), OpenAI account (openAiApi)
- **Writes:** `vaibhavcapstone_events`, `vaibhavcapstone_extractions`, `vaibhavcapstone_leads`, `vaibhavcapstone_llm_calls`
- **Reads:** `vaibhavcapstone_businesses`
- **Calls:** 04-Qualifier (via "Call Qualifier")
- **Nodes:** 31
- **Export:** `n8n/workflows/VaibhavCapstone-03-ClassifyExtract.json`

### 04-Qualifier

Scores the lead against the tenant's own rubric - deterministic arithmetic, not model opinion - and asks the model only to explain the score in words.

- **Starts when:** called by another workflow (sub-workflow)
- **Credentials:** Capstone-Langfuse (httpHeaderAuth), Capstone-Postgres (postgres), Google Gemini(PaLM) Api account (googlePalmApi), OpenAI account (openAiApi)
- **Writes:** `vaibhavcapstone_events`, `vaibhavcapstone_leads`, `vaibhavcapstone_llm_calls`, `vaibhavcapstone_qualifications`
- **Reads:** `vaibhavcapstone_products`
- **Calls:** 05-Recommender (via "Call Recommender")
- **Nodes:** 19
- **Export:** `n8n/workflows/VaibhavCapstone-04-Qualifier.json`

### 05-Recommender

Asks the database first for real in-stock products matching the need, lets the model rank only that shortlist, then re-verifies every chosen SKU against live stock before saving. Parks the lead if the tenant has no catalogue yet.

- **Starts when:** called by another workflow (sub-workflow)
- **Credentials:** Capstone-Langfuse (httpHeaderAuth), Capstone-Postgres (postgres), Google Gemini(PaLM) Api account (googlePalmApi), OpenAI account (openAiApi)
- **Writes:** `vaibhavcapstone_drafts`, `vaibhavcapstone_events`, `vaibhavcapstone_leads`, `vaibhavcapstone_llm_calls`, `vaibhavcapstone_recommendations`
- **Reads:** `vaibhavcapstone_extractions`, `vaibhavcapstone_leads`, `vaibhavcapstone_products`, `vaibhavcapstone_qualifications`
- **Calls:** 06-DraftHITL (via "Call DraftHITL")
- **Nodes:** 24
- **Export:** `n8n/workflows/VaibhavCapstone-05-Recommender.json`

### 06-DraftHITL

Writes the customer reply in the tenant's voice and stops. The send step is reachable only after a human approves, by email or from chat.

- **Starts when:** called by another workflow (sub-workflow)
- **Credentials:** Capstone-Langfuse (httpHeaderAuth), Capstone-Postgres (postgres), Capstone-SMTP (smtp), Google Gemini(PaLM) Api account (googlePalmApi), OpenAI account (openAiApi)
- **Writes:** `vaibhavcapstone_drafts`, `vaibhavcapstone_events`, `vaibhavcapstone_leads`, `vaibhavcapstone_llm_calls`
- **Nodes:** 28
- **Export:** `n8n/workflows/VaibhavCapstone-06-DraftHITL.json`

### 07-WeeklyInsights

The Monday report: funnel, lead quality, approval rate, top categories, and exact AI cost per lead from provider token counts. Also serves the latest report as a web page.

- **Starts when:** schedule: weekly, day 1, 08:00 · `POST /webhook/vaibhavcapstone-insights-run` · `GET /webhook/vaibhavcapstone-insights-latest`
- **Credentials:** Capstone-Langfuse (httpHeaderAuth), Capstone-Postgres (postgres), Capstone-SMTP (smtp), Google Gemini(PaLM) Api account (googlePalmApi), OpenAI account (openAiApi)
- **Writes:** `vaibhavcapstone_events`, `vaibhavcapstone_insights`, `vaibhavcapstone_llm_calls`
- **Reads:** `vaibhavcapstone_businesses`, `vaibhavcapstone_events`, `vaibhavcapstone_extractions`, `vaibhavcapstone_insights`, `vaibhavcapstone_judge_scores`, `vaibhavcapstone_leads`, `vaibhavcapstone_llm_calls`, `vaibhavcapstone_products`, `vaibhavcapstone_qualifications`, `vaibhavcapstone_recommendations`
- **Nodes:** 25
- **Export:** `n8n/workflows/VaibhavCapstone-07-WeeklyInsights.json`

### 08-MCPOnboarding

The setup half of the chat interface. Six tools that create a business, update its config, set a reviewer, upload a catalogue, report setup status, and reveal the intake endpoint. Wakes parked leads when setup completes.

- **Starts when:** `/mcp/vaibhavcapstone-onboarding` (MCP, bearer auth) · `POST /webhook/vaibhavcapstone-tool-create-business` · `POST /webhook/vaibhavcapstone-tool-update-config` · `POST /webhook/vaibhavcapstone-tool-set-reviewer` · `POST /webhook/vaibhavcapstone-tool-upload-catalog` · `POST /webhook/vaibhavcapstone-tool-setup-status` · `POST /webhook/vaibhavcapstone-tool-intake-endpoint`
- **Credentials:** Capstone-MCP-Bearer (httpBearerAuth), Capstone-Postgres (postgres)
- **Writes:** `vaibhavcapstone_businesses`, `vaibhavcapstone_events`, `vaibhavcapstone_products`
- **Reads:** `vaibhavcapstone_products`, `vaibhavcapstone_setup_state`
- **Calls:** 10-ResumeParked (via "Resume Parked (catalog)"), 10-ResumeParked (via "Resume Parked (reviewer)")
- **Nodes:** 33
- **Export:** `n8n/workflows/VaibhavCapstone-08-MCPOnboarding.json`

### 09-MCPOperations

The day-to-day half of the chat interface. Six tools to check a lead, list what is waiting for approval, approve or reject a draft, fetch insights, and send a test lead.

- **Starts when:** `/mcp/vaibhavcapstone-operations` (MCP, bearer auth) · `POST /webhook/vaibhavcapstone-tool-lead-status` · `POST /webhook/vaibhavcapstone-tool-pending-approvals` · `POST /webhook/vaibhavcapstone-tool-approve-draft` · `POST /webhook/vaibhavcapstone-tool-reject-draft` · `POST /webhook/vaibhavcapstone-tool-get-insights` · `POST /webhook/vaibhavcapstone-tool-send-test-lead`
- **Credentials:** Capstone-MCP-Bearer (httpBearerAuth), Capstone-Postgres (postgres), Capstone-SMTP (smtp)
- **Writes:** `vaibhavcapstone_drafts`, `vaibhavcapstone_events`, `vaibhavcapstone_leads`
- **Reads:** `vaibhavcapstone_businesses`, `vaibhavcapstone_drafts`, `vaibhavcapstone_events`, `vaibhavcapstone_extractions`, `vaibhavcapstone_leads`, `vaibhavcapstone_qualifications`, `vaibhavcapstone_recommendations`
- **Nodes:** 31
- **Export:** `n8n/workflows/VaibhavCapstone-09-MCPOperations.json`

### 10-ResumeParked

Un-parks leads that arrived before the tenant was ready, the moment the missing piece (catalogue or reviewer) is supplied, and pushes them back through the pipeline.

- **Starts when:** called by another workflow (sub-workflow)
- **Credentials:** Capstone-Postgres (postgres)
- **Writes:** `vaibhavcapstone_events`, `vaibhavcapstone_leads`
- **Reads:** `vaibhavcapstone_leads`, `vaibhavcapstone_setup_state`
- **Calls:** 05-Recommender (via "Call Recommender"), 06-DraftHITL (via "Call DraftHITL")
- **Nodes:** 11
- **Export:** `n8n/workflows/VaibhavCapstone-10-ResumeParked.json`

### 11-NeedsReviewNotify

Sweeps for leads the system deliberately handed to a human and makes sure somebody is told, once, rather than leaving them sitting unnoticed.

- **Starts when:** schedule: every 10 minutes · `POST /webhook/vaibhavcapstone-needs-review-sweep`
- **Credentials:** Capstone-Postgres (postgres), Capstone-SMTP (smtp)
- **Writes:** `vaibhavcapstone_events`, `vaibhavcapstone_leads`
- **Reads:** `vaibhavcapstone_businesses`, `vaibhavcapstone_drafts`, `vaibhavcapstone_extractions`, `vaibhavcapstone_recommendations`
- **Nodes:** 9
- **Export:** `n8n/workflows/VaibhavCapstone-11-NeedsReviewNotify.json`

### 12-LLMJudge

A different vendor's model re-reads the pipeline's own output looking for invented facts, scores it, and alerts the operator when quality drops.

- **Starts when:** schedule: every 30 minutes · `POST /webhook/vaibhavcapstone-judge-sweep`
- **Credentials:** Capstone-Langfuse (httpHeaderAuth), Capstone-Postgres (postgres), Capstone-SMTP (smtp), OpenAI account (openAiApi)
- **Writes:** `vaibhavcapstone_events`, `vaibhavcapstone_judge_scores`, `vaibhavcapstone_llm_calls`
- **Reads:** `vaibhavcapstone_businesses`, `vaibhavcapstone_drafts`, `vaibhavcapstone_extractions`, `vaibhavcapstone_judge_scores`, `vaibhavcapstone_leads`, `vaibhavcapstone_qualifications`, `vaibhavcapstone_recommendations`
- **Nodes:** 18
- **Export:** `n8n/workflows/VaibhavCapstone-12-LLMJudge.json`

### 13-A2AServer

The robot door. Publishes an agent card other companies' AI can discover, accepts enquiries over JSON-RPC, and exposes the human approval gate honestly as the protocol state `input-required`.

- **Starts when:** `GET /webhook/a2a-agent-card` · `POST /webhook/a2a-rpc`
- **Credentials:** Capstone-Postgres (postgres)
- **Writes:** `vaibhavcapstone_a`, `vaibhavcapstone_events`
- **Reads:** `vaibhavcapstone_drafts`, `vaibhavcapstone_platform_config`, `vaibhavcapstone_products`, `vaibhavcapstone_recommendations`
- **Nodes:** 26
- **Export:** `n8n/workflows/VaibhavCapstone-13-A2AServer.json`

## Credentials these workflows expect

n8n matches credentials **by name** on import, so create them with exactly these names.

| Name | Type | Needed by | Required? |
|---|---|---|---|
| `Capstone-IMA` | imap | 02 | Only for the email door (note the truncated name — it is real) |
| `Capstone-Langfuse` | httpHeaderAuth | 03, 04, 05, 06, 07, 12 | Optional — LLM tracing; nodes fail harmlessly without it |
| `Capstone-MCP-Bearer` | httpBearerAuth | 08, 09 | Only if you use the chat (MCP) interface |
| `Capstone-Postgres` | postgres | 00, 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13 | Yes — nothing works without it |
| `Capstone-SMTP` | smtp | 00, 06, 07, 09, 11, 12 | Yes — approval requests and alerts are email |
| `Google Gemini(PaLM) Api account` | googlePalmApi | 03, 04, 05, 06, 07 | Yes — the primary model |
| `OpenAI account` | openAiApi | 03, 04, 05, 06, 07, 12 | Optional — fallback model and the quality judge |
