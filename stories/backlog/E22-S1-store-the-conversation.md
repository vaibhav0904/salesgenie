# E22-S1: Store the full conversation, not just one message

**As a** Sales Rep
**I want** every message in a customer's email conversation captured, not just the one that started it
**So that** nothing a customer already told us is lost by the time they reply again

## Acceptance criteria
- [ ] New `vaibhavcapstone_messages` table: `message_id` PK, `lead_id` FK,
      `business_id`, `direction` (`INBOUND`/`OUTBOUND`), `from_email`,
      `subject`, `body`, `message_id_header` (the email `Message-ID`),
      `in_reply_to_header`, `received_at`/`sent_at`.
- [ ] 02-GmailAdapter writes one `INBOUND` row per ingested email (in
      addition to today's `vaibhavcapstone_leads` write — this story does
      not change lead creation, only adds message capture).
- [ ] 06-DraftHITL writes one `OUTBOUND` row when a draft is actually sent,
      capturing the `Message-ID` n8n's email-send node returns.
- [ ] A lead with 1 message today still works exactly as before — this is
      additive, not a breaking change to the existing single-message flow.
- [ ] Existing self-send guard (BUG-001) still passes: an outbound send
      does not get double-recorded as a new inbound message.

## Depends on
- -

## Eval gate
- none — verified via `.tests.md` + UAT (send/reply through the real inbox,
  confirm both rows exist)

## Technical notes
- 02-GmailAdapter uses **IMAP** (`Capstone-IMA`), not the Gmail API —
  confirm which headers n8n's IMAP/email node actually exposes
  (`Message-ID`, `In-Reply-To`, `References`) before assuming they're all
  present; some IMAP configurations don't surface full headers by default.
- This story only stores messages — correlating a reply to its lead (using
  `in_reply_to_header`) and reopening the lead is E22-S2, not here.
- Once this ships, `docs/domain.md`'s Lead definition ("created from one
  Enquiry") needs a one-line update to reflect that a Lead now spans a
  conversation, not a single message — small doc fix, do it in this story
  or E22-S2, whichever lands the behavior change.
