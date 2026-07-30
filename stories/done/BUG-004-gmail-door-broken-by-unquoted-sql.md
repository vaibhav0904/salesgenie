# BUG-004: The Gmail door is broken — unquoted literals in the mailbox lookup

**Severity:** high — email ingestion, one of the three doors, has been dead since 2026-07-26.

## Symptom
Every email that arrives in the watched mailbox fails. `VaibhavCapstone-02-GmailAdapter` errors at `Resolve Business From Mailbox` with:

```
Syntax error at line 2 near "%"
```

11 failed executions recorded (ids 1558–1916). Last successful run: **2026-07-26 06:52**; first failure **2026-07-26 08:05**.

## Root cause
The query lost its single quotes:

```sql
-- what is deployed (broken)
WHERE $1 ILIKE % || (config->>intake_email) || %
  AND lower($2) NOT IN (lower(config->>sender_identity), lower(config->>intake_email))
```

`%` must be `'%'` and the JSON keys must be quoted (`config->>'intake_email'`). This is the **`String.replace` `$'` footgun already recorded in CLAUDE.md** — `$'` in a replacement string expands to "everything after the match", eating the quotes. Same class of corruption that previously hit WF-05's candidate query.

Confirmed pre-existing: byte-identical in the pre-change baseline zip, so not introduced by E19-S1.

## The fix
```sql
SELECT business_id FROM vaibhavcapstone_businesses
WHERE $1 ILIKE '%' || (config->>'intake_email') || '%'
  AND lower($2) NOT IN (lower(config->>'sender_identity'), lower(config->>'intake_email'))
LIMIT 1;
```

Verified read-only against the live database:
- a customer email addressed to the intake address → resolves to `biz_oakember` ✓
- an email **from** the business's own address → returns nothing, so the self-ingestion guard of BUG-001 still holds ✓
- `biz_pagebindbooks` has a NULL intake address, so `'%' || NULL || '%'` is NULL and it can never accidentally match another tenant's mail ✓

## Acceptance criteria
- [ ] Query restored with correct quoting and republished.
- [ ] A real email to the intake address creates a lead and reaches the pipeline.
- [ ] An email sent **from** the business's own address is still ignored (BUG-001 regression).
- [ ] No new `Syntax error` events in `vaibhavcapstone_events`.

## Technical notes
- **Do not edit this query with `String.replace`** — that is what broke it. Write the replacement from a clean scratchpad file wholesale, the documented recovery pattern.
- Does not affect any published number: the evals and the deck's figures come from seed replays posted to the intake webhook, not through Gmail.
- **Does affect the demo video** — `presentation/video-script.md` Scene 3 offers "or replay via Gmail with an `[enquiry]` subject" as an alternative. That path would fail today.

## Outcome (2026-07-28)
- Query restored with correct quoting and republished to `VaibhavCapstone-02-GmailAdapter`. Written wholesale from a clean scratchpad file (`wf02-query.sql`), **never via `String.replace`** — that is what corrupted it originally.
- Deployed text read back from n8n and confirmed byte-identical to the intended SQL; connections unchanged; workflow still active.
- Verified by executing the **deployed** query text against the live database with n8n's own `$1`/`$2` parameter binding, three cases:
  - customer email addressed to the intake address → resolves to `biz_oakember` ✓
  - email sent **from** the business's own address → zero rows, so the BUG-001 self-ingestion guard still holds ✓
  - mail to an unrecognised mailbox → zero rows ✓
- No syntax error on any case. Evals unaffected (classification 10/10, extraction 98.4%, 0 hallucinated) — as expected, since they replay through the intake webhook rather than Gmail.
- **Remaining verification the operator must do:** a genuine end-to-end test needs a real email to arrive in the watched mailbox. Send one with `[enquiry]` in the subject and confirm a lead appears. The SQL is proven; the full IMAP → lead path is not yet exercised post-fix.
