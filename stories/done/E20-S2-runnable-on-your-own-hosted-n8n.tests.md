# Test cases: E20-S2 Anyone can run this on their own hosted n8n

The governing rule for this card: **a doc is only "done" when it has been executed
verbatim by following it, not when it has been written.**

Executed 2026-08-09 against a throwaway stack (`docker compose -p sg-fresh`, n8n on
:5679, Postgres on :5433, its own volumes, never touching the live rig), torn down
with `down -v` afterwards.

| # | Case | Status | Evidence |
|---|---|---|---|
| TC1 | Retarget rewrites every host-dependent value, including the buried ones | **Pass** | 20/20 rewritten. **Proven live, not just by grep:** `create_business` on the fresh instance returned `"intake_url":"http://localhost:5679/..."` — that string lives inside a Postgres SQL query in `08-MCPOnboarding`, one of the five occurrences a URL-field search misses |
| TC2 | Retarget handles Langfuse | **Pass** | 7/7 rewritten across 03,04,05,06,07,12 |
| TC3 | Retarget reports what it cannot fix | **Pass** | Found **8** executeWorkflow nodes where the repo documented 6. Superseded by the id-stamping fix below |
| TC4 | Retarget is non-destructive | **Pass** | `git status n8n/workflows/` clean; output isolated and gitignored |
| TC5 | Sync pulls live workflows | **Pass** | 14 fetched and written |
| TC6 | Sync `--check` detects drift | **Pass** | Exited 1 naming 9 stale workflows; after sync, exits 0 |
| TC7 | Sync output is diff-friendly | **Pass** | Needed canonical node-key ordering (exports carried 3 orderings) and dropping `binaryMode`, which the API returns but PUT rejects |
| TC8 | Every endpoint in the reference is real | **Pass** | Nine exercised live: intake, create-business, setup-status, upload-catalog, set-reviewer, insights-run, insights-latest, a2a-agent-card, plus the intake guard. All behaved as documented |
| TC9 | Reference covers all 14 with required fields | **Pass** | All 14; tables derived by parsing SQL; 21-endpoint table and call graph |
| TC10 | Credential lists agree | **Pass** | Generated from the exports; both prose lists point at it |
| TC11 | `.env.example` is complete | **Pass** | Every consumed variable with where-to-get comments; states AI keys belong in n8n credentials |
| TC12 | No author's-machine paths in the setup path | **Pass** | `evals/run-evals.js` honours `DATABASE_URL` or `POSTGRES_CONTAINER` |
| TC13 | Committed compose starts standalone | **Pass** | Came up on alternate ports, no external network, **all 13 tables created automatically** from `db/` on first boot |
| TC14 | **Fresh-install run** | **Pass** | 7 credentials + 14 workflows imported into a clean instance, all 14 published, business created, catalogue uploaded, reviewer set |
| TC15 | **Fresh install processes a lead** | **Pass** | Unknown business → `404 unknown business_id` (refuses rather than guesses). Valid lead → `201` → **`PENDING_APPROVAL` in ~30s**, band **HOT**, 1 recommendation, 1 draft, 4 LLM calls. Recommendation verified against the catalogue: `TST-001`, real and in stock |
| TC16 | MCP driven by a client | **Pass** | Drove the MCP server directly over streamable HTTP. Auth correct: no token 403, wrong token 403, real token 200. `initialize` established a session; `tools/list` returned all **6 onboarding tools**. Tool invocation exposed a real defect in the retarget guidance — see below |
| TC17 | A2A door works on the new host | **Pass** | Agent card returned `"url":"http://localhost:5679/webhook/a2a-rpc?..."` — from inside `13-A2AServer`'s jsCode, the other buried occurrence |
| TC18 | **Weekly report on the new host** | **Pass** | `insights-run` then `insights-latest` returned a 6,880-byte report with that instance's own data: "processed a total volume of 1 lead… classified as 'HOT'" |
| TC19 | Docs survive the run unchanged | **Pass (with fixes)** | Three defects found *by running it*, fixed in the docs and tooling rather than worked around |

## What running it changed

**The manual re-pointing step is gone.** The first run confirmed the warning was real —
`01-Intake` accepted a lead, then errored because its Execute Workflow node referenced an
id that did not exist, and the lead stopped dead at `RECEIVED`. But n8n honours a
top-level `id` on import, so `retarget-host.js` now stamps the six referenced workflows
with the ids the others already point at. Second run: imported, published, and a lead ran
the entire pipeline to `PENDING_APPROVAL` with **no manual re-selection at all**.

That removes the most error-prone step in the whole setup — one that failed silently.

## Three defects found by doing it

1. **CLI-published workflows do not register webhooks until n8n restarts.** Every endpoint
   returned "the requested webhook is not registered" while the database said `active = 1`
   for all 14. Documented in `n8n/workflows/README.md` and in the script's own output.
2. **The committed compose loaded the demo tenant by default**, so a first catalogue upload
   landed beside 20 sample products — contrary to the seedless quickstart. Now stated
   plainly, with how to opt out.
3. **The repo documented 6 Execute Workflow handoffs; there are 8.**

## The defect TC16 exposed

**`--base` must be an address n8n itself can reach, not just your browser.** Twelve of
the rewritten URLs are the chat-tool nodes, which n8n calls from inside its own
process — server to server, not browser to server.

Measured from inside the container published on host port 5679:

| From inside the n8n container | Result |
|---|---|
| `http://localhost:5679` (the host port I retargeted to) | **404** |
| `http://localhost:5678` (the port n8n listens on internally) | **200** |

So retargeting a local Docker install to its *host* port breaks every chat tool,
silently — the exact failure this script exists to prevent. Hosted n8n is unaffected,
since its public URL is reachable from both sides. `scripts/retarget-host.js` now
detects and warns on the risky case, and the guide explains it.

What remains genuinely untested is only a specific chat *application* (Claude Desktop
and friends) against a public URL. The server, its auth, its tool discovery and the
retargeted URLs are all covered.

UAT: Vaibhav follows the rewritten onboarding guide himself against a throwaway
instance, without consulting me, and confirms he never had to guess.

## UAT — run 2026-08-09

Vaibhav asked me to run the UAT rather than doing it himself. **Caveat worth stating: I
wrote these docs, so I cannot be genuinely surprised by them.** A fresh human reader is
still the real test. What I did instead was an adversarial read-through against the
question "could a non-developer actually follow this?" — which found 12 blockers,
including one I had introduced myself.

### Fixed in this pass

| # | Defect | Fix |
|---|---|---|
| 1 | **Step 3 point 1 said "jump to point 4"; the command is in point 5.** My own fix from earlier today, off by one — and load-bearing: point 4 tells you to open already-imported workflows, so a reader would import the un-retargeted files, the exact failure the step exists to prevent | Corrected to point 5 |
| 2 | Guide invited pasting a catalogue with a `stock` column, which loads everything as zero stock (BUG-009) and then reports "nothing suitable" as correct behaviour | Names `stock_qty`, explains the symptom, suggests plain sentences |
| 3 | "You'll never touch a command line" / "no command line" — false; Step 3 runs Node | Reworded; Node and the download added to the requirements table |
| 4 | Guide never said where to get the package | "Code → Download ZIP" added to the table |
| 5 | Step 5's smoke test had no request body, no finished sentence, and promised an approval email that cannot arrive before a business exists | Replaced with a runnable `curl` whose **expected output is the refusal** — that refusal being the pass |
| 6 | Step 1 told a real business to run `002`, the fictional demo tenant | Says to skip it, and names the stray `init_test_db.sql` |
| 7 | Step 8 told you to hand-edit 7 Langfuse URLs the script already rewrote | Now says select the credential only, and to re-run the script rather than hand-edit |
| 8 | `n8n/workflows/README.md` still ordered import-before-retarget, and still said the eight handoffs must be re-pointed — both stale since the id-stamping change | Retarget promoted to step 0; re-pointing downgraded to a check |
| 9 | README line 76 told you to put Gemini/OpenAI keys in `.env`, contradicting line 34 forty lines above | Corrected to point at n8n Credentials |
| 10 | Step 6 dead-ended a non-developer: Claude Desktop cannot take a bare MCP URL, and the guide had no alternative | Added the `mcp-remote` requirement **and** a full `curl` route that needs no chat client |

### Second pass — the seven queued issues, now fixed

| # | Defect | Fix |
|---|---|---|
| 11 | **`intake_email` is never set**, so the email door matches nothing while Step 6 claimed enquiries flow through automatically. Reading the adapter showed it is worse than logged: the IMAP trigger is scoped to `[["UNSEEN"],["SUBJECT","[enquiry]"]]`, so **two** undocumented conditions had to hold | New "Opening the email door" section: the `update_business_config` sentence (and `curl`) that sets `intake_email`, the subject tag and how to remove it, the same-mailbox requirement, the anti-loop guard, and a success signal. The false claim is replaced with an honest pointer |
| 12 | Prerequisites missing: Google 2-step verification, IMAP enablement, a publicly reachable n8n URL | All three added to both requirement tables. 2-step is framed by its consequence — Google will not *offer* an app password until it is on, so the credential simply cannot be filled in |
| 13 | **"Free" overstated** — "you do not need to pay anyone" eight lines above a paid service | Replaced with a short honest costs block naming the two that are not free (n8n Cloud after trial, OpenAI pay-per-use) and what stays free. Mirrored in the README |
| 14 | `Capstone-Langfuse` missing from the Step 3 credential table (six listed, seven needed) | Added, marked as Step 8 only, with what the unresolved warning means if skipped |
| 15 | `Capstone-IMA` listed without noting the truncated name is deliberate | Called out explicitly: n8n matches by name character for character, so "correcting" it breaks the email door |
| 16 | **README jargon** in the first paragraph a newcomer reads | Opening rewritten plain-words-first; the terms follow the explanation rather than replacing it. The doors section now explains MCP and A2A instead of naming them |
| 17 | **Dead ends without success signals** — Step 4 activation, the `a2a_bearer` insert, the agent card | Each now says what "worked" looks like: 14 Active and what a bounced toggle means (plus the CLI-restart trap); *"Success. No rows returned"* being the pass for a write; and Step 7 now runs `scripts/buyer-agent-demo.js` end to end, naming `input-required` as the thing to watch for |

### The defect the fixes exposed

**The A2A demo authenticated with the wrong secret.** `scripts/buyer-agent-demo.js` read
`MCP_BEARER_TOKEN`, but `13-A2AServer` checks the caller against the `a2a_bearer` row in
`vaibhavcapstone_platform_config`. On this rig both hold the same string, which is exactly
why it was never noticed — anyone setting up fresh invents two different phrases, follows
Step 7, and gets a bare `unauthorized`.

Fixed by preferring `A2A_BEARER_TOKEN`, keeping `MCP_BEARER_TOKEN` as a fallback so
existing setups are untouched (verified: the resolver still finds the token in this repo's
`.env`), and printing the SQL that reveals the right value when neither is set.
`.env.example` corrected — it *described* the distinction accurately while the code
ignored it.

### Third pass — closing the card found three more, in the Docker path

Ticking the acceptance criteria meant re-checking each, and two were not actually met.

1. **`docker/README.md` still carried two absolute Windows paths** — the exact defect the
   criterion names. The author's arrangement is now a clearly-fenced reference section
   with no machine-specific paths, and the `docker exec` example names the container the
   committed compose actually creates instead of the author's.
2. **`langfuse-compose.yml` still joined `external: name: n8n-localdata_default`** — a
   network that exists only on this machine, so it could not start standalone. Now
   `${N8N_DOCKER_NETWORK:-docker_default}`, defaulting to what `docker-compose.yml`
   creates, with the "find yours with `docker network ls`" escape documented in three
   places. Verified: `docker compose config` resolves the default to `docker_default`.
3. **Found by running it: the committed compose could not run twice.** Its own comment
   recommended `docker compose -p sg-test up -d` for a throwaway stack beside a live one —
   but `container_name: salesgenie-postgres` is absolute and ignores `-p`, so the second
   stack collides on the name. (Noticed because my verification container appeared as
   `salesgenie-postgres` under project `sg-dbinit-check`.) Now
   `${CONTAINER_PREFIX:-salesgenie}-postgres`; verified both forms resolve correctly.

Also proven rather than assumed while there: the init service creates the extra databases.
Brought up a throwaway stack and queried `pg_database` — `salesgenie`, `n8n` and
`langfuse` all present, so the optional tracing stack no longer needs a manual
`CREATE DATABASE`. Torn down with `down -v`; the live rig was never touched.

**Still outstanding:** a real first-time human reader walking it end to end. Everything
above was found by adversarial reading and by testing the code paths the docs point at;
neither substitutes for someone who has never seen this system.

## Re-validation 2026-08-10 — the docs changed, so the run had to be repeated

TC14–TC18 were executed against the docs *as they stood on 2026-08-09*. Since then the
guide gained a whole "Opening the email door" section, a `curl` route through Step 6, a
success signal for the `a2a_bearer` insert, a `buyer-agent-demo.js` step in Step 7, and
BUG-009 changed catalogue upload behaviour. **A passing run against superseded docs is not
evidence about the current ones**, so the whole path was run again, verbatim, on a
throwaway stack — n8n on :5679, Postgres on :5433, own volumes, `CONTAINER_PREFIX=sg-uat`,
torn down with `down -v`. The live rig was never touched (verified after: still 0
businesses).

| Step of the guide | Result |
|---|---|
| Compose comes up beside a live stack | **Pass** — `sg-uat-postgres` / `sg-uat-n8n`, no collision. This exercised the `CONTAINER_PREFIX` fix made the same day; before it, container names were absolute and the second stack could not start |
| 13 tables auto-created; skip `002` as the guide says | **Pass** |
| Step 1.4 `a2a_bearer` insert | **Pass** |
| Step 3 retarget → import 14 + 7 credentials | **Pass** — id-stamping meant nothing needed re-pointing |
| Step 4 activate in dependency order | **Pass** — all 14, none refused |
| Restart after CLI activation | **Required, as documented** |
| Step 5 smoke test | **Pass** — returned exactly the documented refusal, `{"ok":false,"error":"unknown business_id: not_a_real_business"}` |
| Step 6 `curl` route: create business | **Pass** — `biz_terracottatale` |
| Step 6 upload catalogue **headed `stock`** | **Pass** — `stock_column_used: "stock"`, `catalog_size: 3`. Before the BUG-009 fix this loaded 3 products at zero stock and the run would have ended in `NEEDS_REVIEW` |
| Step 6 set reviewer | **Pass** — and `customer_email_redirect` was set automatically, exactly as the ⚠ section warns |
| A lead, end to end | **Pass** — `PENDING_APPROVAL`, **HOT score 100**, grounded, 2 recommendations (`POT-001`, `POT-002`), 4 LLM calls. Both SKUs came from the uploaded catalogue, which is only possible because stock loaded — BUG-009 proven end to end, not just unit-tested |
| "Opening the email door" — the `update_business_config` call | **Pass** — `intake_email` landed exactly where `02-GmailAdapter`'s lookup reads it |
| Switching the demo redirect off, as documented | **Pass** — cleared; replies would now reach the customer |
| Step 7 agent card | **Pass** — served the tenant's own card |
| Step 7 `buyer-agent-demo.js` with `A2A_BEARER_TOKEN` | **Pass** — discovery → `message/send` → polled through EXTRACTED, QUALIFIED, RECOMMENDED → **`input-required`**, the human gate visible over the protocol. This exercised the bearer-name fix; the old `MCP_BEARER_TOKEN` would have returned a bare `unauthorized` here |
| Weekly report | **Pass** — 6,832 bytes, correct tenant name and date window, from that instance's own data |

**No defects found this time.** Every step behaved as written, including all seven areas
rewritten on 2026-08-09 that had never actually been executed.

Credentials were reused via `n8n export:credentials --decrypted` rather than recreated, with
only the seven `Capstone-*`/AI credentials imported — the four belonging to the owner's other
projects were filtered out and left alone. The decrypted copies were deleted from both the
container and disk afterwards.

**What this still is not:** a first-time human reader. It is the author executing his own
instructions. Every mechanical claim in the guide is now verified against the current text;
whether the *prose* is followable by a stranger remains untested.
