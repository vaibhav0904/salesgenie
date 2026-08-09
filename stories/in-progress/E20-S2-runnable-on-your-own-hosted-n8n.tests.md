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

### Known, not yet fixed

- **`intake_email` is never set by the guide**, so the email door matches nothing even
  though Step 6 says "enquiries to your mailbox flow through automatically". Needs either
  a setup step or an honest statement that the email door requires extra configuration.
- **Prerequisites still missing** from the requirements table: 2-step verification on the
  Google account (required before an app password can exist), IMAP being enabled, and a
  publicly reachable n8n URL for the A2A door.
- **"Free" is overstated** — n8n Cloud is not free after its trial, and OpenAI is
  pay-per-use. The guide says "you do not need to pay anyone" eight lines above a table
  admitting a paid service.
- **`Capstone-Langfuse` missing** from the Step 3 credential table (six listed, seven
  needed), so the "Ship LF" nodes show a warning the reader cannot resolve.
- **`Capstone-IMA`** is listed without the note that the truncated name is deliberate;
  a tidy-minded reader will "correct" it to `Capstone-IMAP` and break the email door.
- **README jargon** — "headless, multi-tenant agentic sales platform", "cross-vendor
  judge", "per-token LLM observability" — fails the project's own plain-words-first rule
  in the very first file a newcomer opens.
- **Dead ends without a success signal**: the activation order in Step 4, the `a2a_bearer`
  insert in Step 1, and the agent card in Step 7 (which never mentions
  `scripts/buyer-agent-demo.js`, the thing that would actually prove it works).

These are queued rather than done because the ten above were the ones that stop an
install dead. A real first-time reader should still walk it end to end before the repo
goes public.
