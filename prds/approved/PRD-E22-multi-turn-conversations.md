# PRD-E22: Multi-turn email conversations
**Status:** Approved
**Date:** 2026-08-03

## Problem
Today every inbound email becomes one `vaibhavcapstone_leads` row holding a
single message (`from_email`, `subject`, `body` — `db/001_schema.sql`).
`docs/domain.md` already defines **Lead** as "the tracked unit of work
created from **one** Enquiry" — the domain model has never accounted for a
customer replying. When a customer replies on the same thread, the system
has no way to recognize it's a continuation: nothing correlates it back to
the original lead, and no downstream stage (classify, qualify, recommend,
draft) sees what was already said. Context is lost turn over turn, and the
pipeline can't "perform better" with a fuller picture — it re-derives from
one message every time.

## Goals / Non-goals
**Goals:** correlate a reply to its original lead; store the full message
history; feed that history to the LLM stages so recommendations/drafts
reflect the whole conversation, not just the latest message.

**Non-goals:** non-email channels (MCP chat, webhook, A2A) — email is the
only channel with a concrete "reply" mechanism today. Unbounded conversation
length / cost controls beyond a sane default — revisit if real conversations
run long.

## Who this is for
**Sales Rep** (reviews drafts, works leads) and, indirectly, **Customer**
(shouldn't have to repeat themselves across replies) — `docs/domain.md`.

## Proposed scope → stories
- E22-S1: Store the full conversation, not just one message.
- E22-S2: A reply reopens the same lead instead of creating a duplicate.
- E22-S3: Classification/recommendation/draft prompts use the conversation
  history, not just the latest message.

## Success criteria
A second email on an existing thread lands against the same `lead_id`
(never a duplicate), its content is queryable as part of that lead's message
history, and the drafted reply visibly reflects information given in an
earlier turn (e.g. a budget stated in turn 1 isn't re-asked for in turn 2).

## Open questions
- Does pipeline re-entry on a reply restart at classify, or resume later in
  the state machine? Decide during E22-S2's build.
- How many turns of history to include before truncating for token cost —
  no real multi-turn data exists yet to size this from; start unbounded,
  revisit if it becomes a real cost/quality issue.
- `docs/domain.md`'s Lead/Enquiry definitions ("created from one Enquiry")
  need a one-line update once this ships — track in E22-S1's technical notes.

## Technical constraints (confirmed during exploration, not assumptions)
02-GmailAdapter uses **IMAP** (credential `Capstone-IMA`), not the Gmail
API — thread correlation must use email headers (`Message-ID`,
`In-Reply-To`, `References`), not Gmail's `threadId`. Interacts with the
self-send guard (BUG-001): must distinguish "our own sent reply landing in
the inbox" from "the customer's reply to it."
