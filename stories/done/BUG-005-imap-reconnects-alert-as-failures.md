# BUG-005: Routine IMAP reconnects fire operator alerts

**Severity:** low — noise, not breakage. But it trains the operator to ignore alerts, which is how a real failure gets missed.

## Symptom
Alert emails arrive every few hours:

```
[SalesGenie ALERT] VaibhavCapstone-02-GmailAdapter failed at unknown node
Failed node: null · Lead: none identified · Execution: null
Error: unknown error
```

Six such alerts between 2026-07-26 and 2026-07-28, with **no matching execution record** — which is why every field is null.

## Root cause
Gmail periodically drops idle IMAP connections. From the n8n logs:

```
The trigger node "Email Trigger (IMAP)" ... failed with the error:
  "This socket has been ended by the other party". Will try to reactivate.
Activation of workflow ... was successful!
```

and occasionally a container DNS hiccup:

```
There was a problem activating the workflow: "getaddrinfo EAI_AGAIN imap.gmail.com" | retry in 2 seconds
Activation of workflow ... was successful!
```

**n8n recovers on its own every time** — every failure is followed by a successful reactivation. Nothing is lost.

The failure happens in the *trigger*, before any node runs, so there is no execution and no failed node — `Extract Error Context` finds nothing to report and falls back to "unknown error". The alert is technically accurate and operationally useless.

## The fix (proposal — decide before building)
In `VaibhavCapstone-00-ErrorHandler`, suppress the operator email when **all** of these hold: no execution id, no failed node, and no lead id — i.e. a trigger-level blip that n8n self-heals. Still write the `WORKFLOW_ERROR` event so the trail is complete and the pattern stays visible; just don't email.

Optionally alert if the same workflow blips more than N times in an hour, which would indicate a genuinely broken mailbox credential rather than a routine reconnect.

## Acceptance criteria
- [ ] A self-healed trigger reconnect writes an event but sends no email.
- [ ] A real node failure (forced) still dead-letters the lead and still emails the operator — the E9-S1 guarantee is untouched.
- [ ] No regression in `00-ErrorHandler`'s existing behaviour for tagged lead failures.

## Technical notes
- Do not simply stop alerting on WF-02 — that would hide real Gmail credential failures.
- Related: BUG-004 (the actual broken query in the same workflow). These are independent; fixing one does not fix the other.

## Outcome (2026-07-28)
- Added a **`Real Failure?`** gate to `VaibhavCapstone-00-ErrorHandler`, between `Log Error Event` and `Alert Operator`. It emails only when the failure has an execution id **or** a failing node **or** an enquiry attached; a self-healed trigger blip has none of the three and takes the dead-end branch.
- The `WORKFLOW_ERROR` event is still written for **every** failure including blips, so the audit trail is complete and the pattern stays visible — only the email is suppressed. Error handler: 5 → 6 functional nodes.
- **Regression test of the E9-S1 guarantee (the thing that mattered):** created a throwaway workflow whose Code node threw a lead-tagged error, routed to the real error handler, and fired it. The error-handler execution ran `Error Trigger → Extract Error Context → Dead-letter Lead If Known → Log Error Event → Real Failure? → Alert Operator` — **`Alert Operator` ran**, so real failures still alert. The event recorded node `Boom`, execution `2087`, lead `lead_alertgatetest`, i.e. all three gate conditions populated. Throwaway workflow deleted, test event deleted, no junk lead created.
- Failure direction is safe by design: if the gate ever mis-evaluates an empty field, the worst case is that blips still send email — the status quo — never that a real failure goes silent.
- `n8n` diagnosis for the record: Gmail drops idle IMAP connections ("This socket has been ended by the other party"), and occasionally the container hits a DNS blip ("getaddrinfo EAI_AGAIN imap.gmail.com"). n8n reactivates successfully every time; nothing was ever lost.
- WF-00's sticky notes rewritten to describe the new gate, including a red note explaining why the alert is *filtered* rather than switched off.
- **Confirmation still pending:** suppression will be proven at the next natural IMAP reconnect — expect a `WORKFLOW_ERROR` event with no matching alert email.
