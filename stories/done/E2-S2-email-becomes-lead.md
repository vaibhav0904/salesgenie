# E2-S2: A real email turns into a lead untouched by humans

**As a** Sales Rep
**I want** emails arriving in our inbox to become leads automatically
**So that** I never copy names and emails out of the mailbox again.

## Acceptance criteria
- [ ] `VaibhavCapstone-02-GmailAdapter` polls/triggers on the configured Gmail inbox.
- [ ] Each new email is mapped to the normalized intake payload and POSTed to the WF-01 webhook (adapter contains zero pipeline logic).
- [ ] ≥1 live email demonstrated flowing Gmail → webhook → lead row.
- [ ] Processed emails are labeled/marked in Gmail so they aren't re-ingested.

## Depends on
- E2-S1

## Eval gate
- none

## Technical notes
- Uses existing n8n Gmail credential (name confirmed with user). Which business a mailbox maps to comes from businesses config, not hardcoding.

## Outcome (2026-07-26)
- VaibhavCapstone-02-GmailAdapter (id cbqL8fknEsppvqSs) active; export in n8n/workflows/.
- IMAP trigger scoped to UNSEEN + subject contains [enquiry] (shared personal inbox safety - personal mail never touched/marked read; tag stripped before forwarding). ASSUMPTION: production tenants get dedicated mailboxes.
- Mailbox->business via config.intake_email SQL lookup (zero tenant hardcoding); unmapped mailboxes log ADAPTER_UNMAPPED_MAILBOX event.
- LIVE TEST PASSED: real email sent via Gmail SMTP -> IMAP trigger fired (execution 1433 success) -> forwarded to intake webhook -> lead_ms1eenvgfaso24tn, channel=gmail, RECEIVED. Adapter contains zero pipeline logic.
