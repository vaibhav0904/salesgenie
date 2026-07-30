# BUG-006: The onboarding assistant editorialises and named another tenant

**Severity:** medium — no data exposure, but it reads like a breach, and it would confuse a real business owner and the demo audience.

## Symptom
Onboarding "Bloom Garden Supplies" through Claude Desktop returned, unprompted, a developer-facing architecture critique — and **named a different tenant**:

> The intake URL is not tenant-scoped. It's the same `vaibhavcapstone-intake` path **Verde Living** got. Isolation depends entirely on the caller putting the right `business_id` in the payload…

## This is not a data breach — verified
- **Verde Living does not exist in the database.** 0 rows in `vaibhavcapstone_businesses`, 0 traces in `vaibhavcapstone_events` (deleted 2026-07-27). No tool could have returned it.
- **Every MCP read query is tenant-scoped.** All eleven checked. `Compute Setup Status` ends `WHERE b.business_id = $1`; `Query Lead Trail`, `Query Pending Drafts`, `Query Latest Insight`, `Get Intake Endpoint` are all filtered by `business_id`. **No tool returns a list of businesses.**
- The name came from **Claude Desktop's own context** — the earlier chat where Verde Living was genuinely onboarded, and/or `presentation/new-business-script.md` (11 mentions) if Desktop has filesystem access.

## Root cause
The 12 `toolDescription` fields describe only the JSON schema — what to send, what comes back. They say nothing about **who the reader is**. Claude sees a shared intake URL come back and helpfully volunteers a multi-tenancy critique written for a developer, when the reader is a business owner setting up their shop.

## The fix
Append presentation guidance to each of the 12 tool descriptions (6 in WF-08, 6 in WF-09), **appending only** — the existing schema text is what makes the assistant call the tool with correct parameters:

> PRESENTATION: you are speaking to a business owner about their own business. Report only what this call returned, in plain non-technical language: what is now set up, what is still needed, and the next step. Do not comment on platform architecture, security, webhook design or infrastructure. Do not mention, compare with, or reference any other business on the platform — this call is scoped to a single business and returns no information about any other.

Also delete the test tenant `biz_bloomgardensup` created during the incident.

**Honest limit:** a tool description *influences* a third-party assistant, it cannot *guarantee* its wording. The hard guarantee is the verified one above — the returned data contains nothing about any other tenant. This makes bad output much less likely, not impossible.

## Acceptance criteria
- [ ] All 12 tool descriptions carry the guidance, each still starting with its original schema text.
- [ ] No other node parameter, connection or node count changed in either workflow.
- [ ] Onboarding and operations endpoints still return normal JSON when called directly.
- [ ] `biz_bloomgardensup` gone from every `business_id` table.
- [ ] **Operator confirms in a brand-new Claude Desktop chat:** no architecture commentary, no other tenant named. (The existing chat still holds Verde Living in context and will keep repeating it regardless of this fix — a new chat is required to test.)

## Technical notes
- Separate finding, documented not fixed: `approve_draft` / `reject_draft` / `Mark SENT` match on `draft_id` alone with no `business_id`, so a caller holding one tenant's draft id could act on it while nominally working on another. Not a real authorisation boundary today either way — all MCP access shares one bearer token; per-tenant keys are the declared production upgrade. Recorded in `docs/assumptions.md`. Changing `approve_draft`'s signature before the demo video would risk the chat-approval flow in Scene 2.

## Outcome (2026-07-28)
- **No data exposure confirmed.** Verde Living: 0 rows in `vaibhavcapstone_businesses`, 0 traces in `vaibhavcapstone_events`. All eleven MCP read queries verified tenant-scoped; no tool returns a list of businesses. The name came from the chat client's own context, not from the platform.
- **Presentation guidance appended to all 12 tool descriptions** (6 in WF-08, 6 in WF-09). Verified 12/12 still start with their original schema text — that text is what drives correct parameter selection, so it was appended to, never rewritten.
- **Surgical:** the applier asserted, before writing, that only `toolDescription` on tool nodes differed, node counts were unchanged, and `connections` byte-identical. Re-export confirms exactly those 12 nodes changed and nothing else across all 14 workflows. 138/138 by-name references still resolve.
- **Tools still function** — called directly over their webhooks, bypassing the chat client: `setup_status` for Oak & Ember returns `ready: true` with correct next steps; `pending_approvals` returns 1 row, all scoped to `biz_oakember`.
- **Test tenant removed:** `biz_bloomgardensup` deleted (1 business row + 1 event). Back to `biz_oakember` and `biz_pagebindbooks` only.
- Separate finding recorded in `docs/assumptions.md`, not fixed: draft actions key on `draft_id` alone; not a real authorisation boundary today because all MCP access shares one bearer token. Also recorded there: what the assistant *says* is not a system guarantee — only the data is.
- Exports refreshed, `salesgenie-n8n-workflows.zip` regenerated.

## Still to confirm — operator, in Claude Desktop
Start a **brand-new chat**. The existing one still holds Verde Living in its context and will keep repeating it no matter what was changed here. Onboard a throwaway business and check the reply has no architecture commentary and names no other tenant.
