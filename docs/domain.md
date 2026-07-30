# Domain Vocabulary

Every noun in this product, defined once. If a word isn't here, it isn't a concept in this system. If two words look interchangeable, only the one listed here is allowed in code, schemas, prompts, and docs.

| Term | Definition |
|------|-----------|
| **Business** | A tenant of the platform. One row in `vaibhavcapstone_businesses`, identified by `business_id` (e.g. `biz_oakember`). "Tenant", "company", "client" in conversation all mean Business; only **Business** appears in schema/code. |
| **Operator** | The human who sets up and administers a Business via MCP chat (typically the owner or a manager). Not stored as a table; appears as `performed_by` in events. |
| **Sales Rep** | A Business-side human who reviews drafts and works leads. The **Reviewer** role is a Sales Rep duty. |
| **Sales Manager** | Business-side human who consumes Insights. |
| **Customer** | The end person/company sending an enquiry to a Business. Customers never interact with SalesGenie directly — only through channels (email etc.). |
| **Enquiry** | A raw inbound message from a Customer via any channel (the payload as received). An Enquiry may or may not become a Lead worth working. |
| **Channel** | The source an Enquiry arrives from. Canonical entry is the intake **Webhook**; **Gmail Adapter** is the first channel adapter. |
| **Lead** | The tracked unit of work created from one Enquiry: one row in `vaibhavcapstone_leads` with a status state machine (see `contracts.md`). NOT the same as Customer — one Customer could produce multiple Leads. |
| **Extraction** | Structured entities pulled from an Enquiry by the LLM: contact name, email, company, budget, product interest, urgency, etc. |
| **Classification** | The enquiry/not-enquiry/spam decision made before extraction. |
| **Qualification** | The Qualifier Agent's output for a Lead: numeric **Score**, a **Band**, and **Reasons**. |
| **Band** | HOT / WARM / COLD. The only three qualification tiers. |
| **Recommendation** | 1–3 catalog Products selected for a Lead, each with a rationale, all **Grounded**. |
| **Grounded** | Verified against system-of-record data (a real SKU row, in stock). An output that can't be verified is not grounded and must not be shown as fact. |
| **Product** | One catalog item of a Business: SKU, name, category, price, attributes, stock. |
| **Draft** | A proposed outbound communication (CUSTOMER-facing or INTERNAL) awaiting the approval state machine: DRAFT → PENDING_APPROVAL → APPROVED/REJECTED → SENT. |
| **Reviewer** | The human who approves/rejects Drafts for a Business (configured per Business; reached by email link or MCP tool). |
| **Agent** | A single-capability n8n sub-workflow (Qualifier, Recommender, Drafter, Insights) that speaks the **Envelope** contract. |
| **Envelope** | The versioned JSON wrapper every Agent accepts/returns (`envelope_version`, `business_id`, `lead_id`, `trace_id`, `agent`, `status`, `payload`). |
| **Setup State** | Per-Business readiness: which required components (profile, intake channel, catalog, reviewer, sender identity) are configured, and which pipeline stages are therefore unlocked. |
| **Parked Lead** | A Lead halted in `AWAITING_SETUP` because a pipeline stage it needs is gated by missing Setup State. Reprocessed when setup completes. |
| **Dead Letter** | A Lead halted by an unrecoverable processing error (`DEAD_LETTER` status) after retries; requires operator action. |
| **Event** | One audit-log row per agent step / state change: who (actor), what, when, trace_id. The raw material for Insights traceability. |
| **Insight** | The weekly per-Business report: metrics (volume, band mix, approval rate, latency, top categories), charts, and an LLM narrative — every number traceable to Events/Leads. |
| **Eval** | A repeatable check of LLM output quality against the labeled seed dataset (classification accuracy, extraction accuracy, grounding rate). Gates stories to done. |
| **Story / Epic / Bug** | Units of work in `stories/` (see CLAUDE.md conventions). |
