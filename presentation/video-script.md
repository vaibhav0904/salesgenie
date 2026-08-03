> **Superseded by [hero-demo-runbook.md](hero-demo-runbook.md)** and
> [video-assets/narration-script.md](video-assets/narration-script.md) — kept
> in place for E13-S3/BUG-004/BUG-008 historical traceability, not current
> presentation material.

# SalesGenie v2 — demo video script

**Four takes. Four stops. Nothing else.**

Every command and every tool call below was executed against the live system on **2026-07-29** and the outputs shown are the ones that actually came back. Where a number will differ on the day (report totals), it says so.

---

## Window layout — set this up once, before anything

| Window | What | State before you record |
|---|---|---|
| **A** | **Claude Desktop** | A brand-new empty chat |
| **B** | **Gmail** (YOUR-EMAIL@gmail.com) | Inbox open, spam checked once |
| **C** | **Terminal** (PowerShell) | At the project root, screen cleared |
| **D** | **Langfuse** — `http://localhost:3100` | Traces list open |
| **E** | **Report** | Empty tab; Take 4 opens it |
| **F** | **Deck** | Slide 4 for Take 0, slide 6 + A1 for the close |

Project root for window C:

```powershell
cd "<the folder you cloned salesgenie into>"
```

---

## Pre-flight

- [ ] `docker ps` — n8n, Postgres and the five Langfuse containers up.
- [ ] All 14 `VaibhavCapstone-*` workflows **Active** in n8n.
- [ ] **Quit Claude Desktop from the system tray and relaunch.** Not just close the window. Desktop reads its MCP config and caches the tool list at startup; a stale copy is what caused the old "that tool doesn't accept a subject" refusal.
- [ ] Set the A2A poll cadence in window C — a shell variable, *not* `.env`, which the demo script never reads for this:
      ```powershell
      $env:A2A_POLL_SECONDS=10
      ```
- [ ] **Log in to Langfuse *before* you record** and leave window D on the Traces list. The session must already be open — a login screen appearing in Take 4 would put a credential field on camera. The account was created automatically on first boot from `LANGFUSE_INIT_*` in `.env` (user `YOUR-EMAIL@gmail.com`); read the password with `Select-String -Path .env -Pattern LANGFUSE_INIT_USER_PASSWORD` in a terminal that is **not** being recorded.
- [ ] **Archive every old `[Approval needed]` / `[SalesGenie]` email before recording.** Eval replay runs (including the 2026-07-30 spread) each left a batch of approval requests in the inbox. Takes 1–3 depend on *the newest* approval email being unambiguous — an inbox full of stale ones is how the wrong draft gets approved on camera.
- [ ] Notifications silenced. Gmail spam folder checked once.
- [ ] **`Green Thumb` must not exist yet.** Only `biz_oakember` and `biz_pagebindbooks` should be present — its creation is the opening beat.

### Rig check — four commands, all four must pass

```powershell
# 1. Claude Desktop can actually reach the MCP tools (expect 3 x PASS, a few seconds each)
node scripts/verify-desktop-mcp.js

# 2. Langfuse is up (expect: HTTP 200)
curl.exe -s -o NUL -w "langfuse HTTP %{http_code}`n" http://localhost:3100

# 3. The A2A door answers (expect the agent card name)
curl.exe -s "http://localhost:5678/webhook/a2a-agent-card?business_id=biz_oakember"

# 4. Only the two expected tenants exist
docker exec n8n-localdata-postgres-1 psql -U salesgenie -d salesgenie -c "SELECT business_id, name FROM vaibhavcapstone_businesses ORDER BY business_id;"
```

Check 4 must print exactly:

```
    business_id    |         name
-------------------+-----------------------
 biz_oakember      | Oak & Ember Interiors
 biz_pagebindbooks | Page & Bind Books
```

> **If check 1 fails**, do not touch n8n. The servers must launch as `node <absolute path>`, never `npx -y` — see `stories/done/BUG-007-…`. A fresh chat or incognito makes no difference to this.

**If something stalls on camera, keep talking.** Every wait below has a line to say while it resolves. Dead air is the only unrecoverable mistake.

---

## TAKE 0 — Cold open (0:00 – 0:30) · ALREADY RECORDED, DO NOT RE-SHOOT

| Screen | Say |
|---|---|
| Deck slide 4 (architecture) | "The assignment: build an AI sales assistant for one furniture company. What I actually built is a **platform** — any business onboards in natural language, and Oak & Ember is just tenant number one. In the next five minutes: a business will onboard itself by chatting, an email lead will flow through with a human approving the send, **another company's AI agent** will do business with ours over the A2A protocol, and the system will explain its own AI costs. Everything you'll see is one pipeline — watch the doors into it." |

---

# TAKE 1 — A business is born and runs itself
### Final cut ~2:00 · wall clock ~2 min · window **A**, one cut to **B** at the end

**The point:** a business that does not exist walks in, describes itself in English, and inherits the whole pipeline. No form, no admin screen, no code. Then it jumps the gun — and the system parks the enquiry instead of breaking.

**This is one continuous take.** The only real wait is ~20 seconds near the end, and there is a line to fill it.

---

### 1.1 — Create the business

**TYPE into the empty Claude Desktop chat:**

```
Set up a new business on SalesGenie: Green Thumb, a garden and outdoor-living retailer in Pune. Industry: garden-retail. Tone of voice: warm, knowledgeable and practical. Currency INR.
```

**WATCH FOR:** Claude calls `create_business` and reports the new business. Verified response:

```json
{"business_id":"biz_greenthumb","name":"Green Thumb","industry":"garden-retail",
 "config":{"city":"Pune","tone":"warm, knowledgeable and practical","currency":"INR","timezone":"Asia/Kolkata"},
 "intake_url":"http://localhost:5678/webhook/vaibhavcapstone-intake",
 "next_steps":["catalog: use upload_catalog","reviewer: use set_reviewer"]}
```

*You never need to type the id — Claude keeps it in the conversation. From here on just say "Green Thumb".*

**SAY:** "There's no admin screen anywhere in this system. A business joins by describing itself in a sentence — and a tenant is born, with its own pipeline."

---

### 1.2 — Ask what's still missing

**TYPE:**

```
What do I still need before Green Thumb can go live?
```

**WATCH FOR:** `get_setup_status`. Claude will say, in plain English, that the catalogue is empty and no reviewer is set — and that recommendations, drafting and sending are therefore locked, while intake, classification and qualification are already live. The underlying figures:

```
catalog          0 products     not configured
reviewer         not set        not configured
sender_identity  not set        not configured
profile          name, tone, currency   configured
intake_channel   webhook issued at business creation   configured

pipeline_stages: intake ✓  classify_extract ✓  qualify ✓
                 recommend ✗  draft_and_approve ✗  send ✗
```

**SAY:** "It answers in plain language: no catalogue, no reviewer. Notice it doesn't call that an error — a half-finished setup is a normal stage of being a new customer."

---

### 1.3 — Jump the gun *(the best moment in this take)*

**TYPE — use this wording:**

```
Use send_test_lead to put this enquiry into Green Thumb, keeping the customer's exact wording: from_name "Ananya Rao", from_email "ananya@byteleaf.example", subject "Planters for our new office terrace", body: "Hi, we're setting up a terrace garden at our new Pune office and need around 15 large outdoor planters plus soil. Budget is about Rs. 40,000 total, needed within 3 weeks. — Ananya, ByteLeaf Tech"
```

**WATCH FOR:** `send_test_lead` accepts the custom subject and body and returns a lead id:

```json
{"ok":true,"lead_id":"lead_…","trace_id":"trc_…","status":"RECEIVED"}
```

> ⚠️ **Name the tool, and say "keeping the customer's exact wording".** If you instead say *"I've received a real lead, please store it"*, Claude may refuse — it reads the name `send_test_lead`, assumes only canned scenarios, worries about fabricating text under a real person's name, then tries to reach the intake webhook itself and fails (that URL is on the platform host, not reachable from the assistant).
>
> The tool does take her real words verbatim — verified: Ananya's exact text went in and came out as **Ananya Rao / ByteLeaf Tech / ₹40,000 / planters + soil**, nothing invented.

**SAY:** "Now watch what happens if a customer writes in *before* the business has finished setting up."

**TYPE:**

```
What's the status of Ananya's lead?
```

**WATCH FOR:** the enquiry was read and fully understood, then **parked**. Verified:

```
status         AWAITING_SETUP
status_detail  reason: setup_incomplete · missing: ["catalog"] · resume_from: "recommend"

extraction     Ananya Rao · ByteLeaf Tech · budget 40000 · urgency high
               product_interest: ["planters","soil"] · classification: ENQUIRY
qualification  HOT · score 100
```

**SAY:** "Every fact captured — her name, her company, forty thousand rupees, three weeks. Then it parked, waiting for the catalogue. Not an error, not lost. It's holding."

---

### 1.4 — Finish the setup

**TYPE:**

```
Here's the Green Thumb catalogue:
sku,name,category,price,currency,stock_qty
GRD-001,Large Terracotta Planter 18 inch,planters,1499,INR,40
GRD-002,Cedar Raised Planter Box,planters,3299,INR,15
GRD-003,Self-Watering Balcony Planter,planters,899,INR,60
GRD-004,Premium Potting Soil 20kg,soil-and-care,649,INR,120
GRD-005,Teak Outdoor Bench,outdoor-furniture,8999,INR,8
GRD-006,Solar Garden Lantern set of 4,garden-decor,1799,INR,35
GRD-007,Galvanised Watering Can 10L,tools,749,INR,45
GRD-008,Vertical Herb Garden Wall Frame,planters,2499,INR,20
```

> 🔴 **The header must be `stock_qty`, not `stock`.** The parser reads that column name literally. A column called `stock` is silently ignored and **every product loads with zero stock**, so the recommender correctly refuses to recommend anything and the lead ends in NEEDS_REVIEW instead of a grounded offer. This exact mistake broke a rehearsal of this take. Copy the block above; don't retype it from memory.
>
> Also avoid commas inside product names — the parser splits on commas. That is why the names read "18 inch" and "set of 4" without brackets.

**WATCH FOR:** `upload_catalog` confirms **8 upserted**:

```json
{"ok":true,"business_id":"biz_greenthumb","upserted":"8","rejected_rows":[],"note":"all rows loaded"}
```

*(The response also carries `catalog_size: "0"` — a cosmetic quirk: it counts the table as it was before this insert. `upserted: 8` is the real figure, and the setup status will confirm 8 products.)*

**SAY:** "Catalogue in — and from this moment Green Thumb can only ever recommend something that's actually on this list, in stock."

**TYPE:**

```
Set the reviewer for Green Thumb to YOUR-EMAIL@gmail.com, set the sender identity to "Green Thumb <hello@greenthumb.example>", and since this is a demo, redirect customer emails to YOUR-EMAIL@gmail.com.
```

**WATCH FOR:** `set_reviewer` confirms the reviewer and sender identity, and `update_business_config` saves the redirect.

**SAY:** "And a named human who approves every outbound word."

---

### 1.5 — It wakes up by itself

**⏱ This is the one real wait: about 20 seconds.** Do not type anything. Keep talking.

**SAY while waiting** *(this fills the wait almost exactly)*: "Nothing is being triggered now. The moment that catalogue landed, the system went back and looked for anything it had parked for this business — and Ananya's enquiry was sitting there, already understood, just missing the one thing it needed. Watch."

**TYPE:**

```
What's the status of Ananya's lead now?
```

**WATCH FOR:** it resumed **on its own** and ran to the human gate. Verified end state:

```
status         PENDING_APPROVAL       qualification  HOT · score 100
grounded       true

GRD-004  Premium Potting Soil 20kg          ₹649
GRD-002  Cedar Raised Planter Box          ₹3,299
GRD-008  Vertical Herb Garden Wall Frame   ₹2,499

timeline  LEAD_RECEIVED → LEAD_CLASSIFIED → LEAD_QUALIFIED
          → LEAD_PARKED_AWAITING_SETUP → LEAD_RESUMED_AFTER_SETUP
          → RECOMMENDATION_GROUNDED → DRAFT_CREATED
```

*Measured: RECOMMENDED at +10s, PENDING_APPROVAL at +20s after setup finished.*

**SHOW:** cut to **window B (Gmail)** — an **"[Approval needed]"** email from Green Thumb has arrived.

**SAY:** "It woke up the second its missing piece arrived, ran the rest of the pipeline, picked three real in-stock products inside her budget, and stopped for a human. Zero lines of code were written for this business."

> **Recovery:** if it hasn't resumed, say *"Resume any parked leads for Green Thumb"*. If it still hasn't, say "we'll come back to that" and move on — Take 2 proves the same pipeline. **Never debug on camera.**

**— STOP RECORDING. TAKE 1 DONE. —**

---

# TAKE 2 — An email becomes an approved reply
### Final cut ~1:20 · wall clock ~2 min · window **C** → **B**

**The point:** the established tenant, the full pipeline visible moving, and the stop that makes it trustworthy.

---

### 2.1 — Send a real enquiry in

**SHOW:** window C, cleared.

**TYPE** *(one line — note `curl.exe`, not `curl`)*:

```powershell
curl.exe -s -X POST http://localhost:5678/webhook/vaibhavcapstone-intake -H "Content-Type: application/json" -d "@data/seed-emails/demo-video-enquiry.json"
```

> **Two traps — don't "simplify" this back.** In PowerShell `curl` is an alias for `Invoke-WebRequest`, which doesn't understand `-X`/`-H`/`-d` and will throw. And this uses a **demo-only payload**, not `email-01.json` — the seed emails are the eval set, and replaying one on camera would overwrite its graded result.

**WHAT THE TERMINAL DOES:** answers in well under a second:

```json
{"ok":true,"lead_id":"lead_ms5nhdx9slzhxuc6","trace_id":"trc_ms5nhdx9fpr9jqz3","status":"RECEIVED"}
```

**SAY:** "A bulk enquiry from a design consultancy — forty desks and chairs, eighteen lakh budget. The system answered instantly with *received*. The sender never waits while we think."

---

### 2.2 — Watch it move

**TYPE, and re-run the same line every ~8 seconds — four or five times:**

```powershell
docker exec n8n-localdata-postgres-1 psql -U salesgenie -d salesgenie -c "SELECT status FROM vaibhavcapstone_leads ORDER BY created_at DESC LIMIT 1;"
```

> ⚠️ **`created_at`, not `received_at`.** `received_at` is the timestamp *inside* the enquiry; sorting on it can select some older finished lead that just sits there reading `SENT` while your real lead works invisibly. That cost a recording session. `created_at` is when the row was written, so it always picks the newest lead.

**WHAT THE TERMINAL DOES** — one word that changes each run. Measured, at 8-second intervals:

```
 2s   RECEIVED
11s   EXTRACTED
19s   QUALIFIED
28s   RECOMMENDED
37s   PENDING_APPROVAL
```

**SAY, spread across the polls:** "Read. Facts pulled out. Scored on this tenant's own weights. Matched against real stock. Drafted." … then on the last one: "About thirty-five seconds — and then it stops."

**Editing note:** jump-cut between two or three polls. Don't show all five.

---

### 2.3 — The stop

**SHOW:** window B, open the **"[Approval needed]"** email. Scroll slowly: the customer's enquiry, the extracted facts, the recommended products **with prices**, the drafted reply.

Verified contents for this enquiry — HOT, score 100, grounded, three in-stock SKUs:

```
DSK-002  Flow Height-Adjustable Standing Desk   ₹41,999
CHR-001  ErgoPro High-Back Mesh Chair           ₹18,999
DSK-001  Linea Executive Desk                   ₹32,999
```

**SAY:** "Everything a reviewer needs on one screen. And these aren't the AI's idea of furniture — every one was checked against live stock, before and after the model picked them. She asked for height-adjustable desks and ergonomic chairs; that's what came back."

**DO:** click **Approve**. Hold a beat on the click — this is the thesis of the project.

**SAY:** "Nothing reaches a customer until a person clicks this. And the send step is only reachable from an approved record — the database enforces that, not the workflow."

---

### 2.4 — Out it goes

**SHOW:** the reply arriving in the same inbox, subject prefixed `[DEMO → …]` because customer mail is redirected for the demo.

**SAY:** "Approved, and out it goes."

**— STOP RECORDING. TAKE 2 DONE. —**

---

# TAKE 3 — Another company's AI buys from us
### Final cut ~1:15 · wall clock ~1.5 min · window **C** → **B** → **C**

**The point:** a sales channel where nobody wrote an email on either side — and the human gate is still visible *to the machine*.

**This take is continuous**: the buyer agent keeps polling in window C while you approve in window B. The wait costs nothing.

---

### 3.1 — Start the buyer's agent

**SHOW:** window C, cleared.

**TYPE:**

```powershell
node scripts/buyer-agent-demo.js
```

**WHAT THE TERMINAL DOES**, printing as it goes:

```
[1/4] Fetching Agent Card (discovery — no auth needed, like a business card)...
      Agent:        Oak & Ember Interiors Sales Agent
      Description:  … Every offer is reviewed by a human before release.
      Skills:       product_enquiry
[2/4] Sending enquiry via message/send...
      Task created: a2a_…  (state: submitted)
[3/4] Polling tasks/get every 10s …
      state: working  | "… pipeline (stage: QUALIFIED)."
      state: working  | "… pipeline (stage: RECOMMENDED)."
```

**SAY:** "This is a *different company's* procurement agent. It has never seen our system. It reads our public card, sends an enquiry, and gets a ticket number to check on. It cannot see our internals — only the state of its task."

---

### 3.2 — The moment that matters

**WATCH FOR** *(measured: ~30 seconds after the task is created)*:

```
      state: input-required  | "A human reviewer at Oak & Ember Interiors is
                                checking the proposed reply before it is released."
      >>> THE HUMAN GATE, VISIBLE OVER THE PROTOCOL
```

**SHOW:** let it sit. Don't scroll past it.

**SAY:** "There it is — **input-required**. That's the protocol's standard way of saying *a human has to act before this can continue*. The buyer's AI can see our approval gate, understands it, and waits. We advertise it rather than hide it."

---

### 3.3 — Approve, and it completes

**SHOW:** switch to **window B**, open the new approval email, click **Approve**. Leave window C running — it keeps polling.

**SAY:** "Same gate, same pipeline. It makes no difference that this enquiry came from a machine."

**SHOW:** switch back to **window C**. Within one poll (~10–20s) it prints:

```
      state: completed  | "Offer approved and released by a human reviewer."
[4/4] Terminal state: COMPLETED

Structured data part — recommended_products:
  • CHR-001  ErgoPro High-Back Mesh Chair  INR 18999
  • CHR-002  Atlas Ergonomic Task Chair    INR 11999
  • CHR-003  Verve Visitor Chair           INR 6999

Done: a grounded, human-approved offer, obtained agent-to-agent. No emails exchanged.
```

**SAY:** "Completed — with a structured product list the other company's systems can file automatically. Two AI agents just did business, with a human holding the pen."

> **Recovery:** clicking Approve early or late breaks nothing; the script reports the transition on its next poll.

**— STOP RECORDING. TAKE 3 DONE. —**

---

# TAKE 4 — The system explains itself, and the close
### Final cut ~1:15 · wall clock ~1.5 min · window **C** → **E** → **D** → **F**

---

### 4.1 — Build this week's report

**SHOW:** window C.

**TYPE:**

```powershell
curl.exe -s -X POST http://localhost:5678/webhook/vaibhavcapstone-insights-run
```

**WHAT THE TERMINAL DOES:** returns **immediately** — this only *starts* the run:

```json
{"message":"Workflow was started"}
```

> ⚠️ **This is a fire-and-forget trigger, not a completion message.** The report takes roughly **15–20 seconds** to build (charts + narrative). If you open the report instantly you'll see last week's. Wait, and say the line below while you do.

**SAY while it builds:** "This runs automatically every Monday at eight for every tenant. It's building the charts and writing the narrative now."

**TYPE (opens the report in window E):**

```powershell
Start-Process "http://localhost:5678/webhook/vaibhavcapstone-insights-latest?business_id=biz_oakember"
```

---

### 4.2 — The report

**SHOW:** window E. Scroll: **Funnel → Lead quality → Daily enquiry volume → Key numbers**, then stop on **AI health**. Four charts, all QuickChart PNGs.

**SAY:** "Monday morning, every tenant gets this automatically. Every number is computed from the platform's own records — the AI writes the sentences, never the figures. Charts carry aggregates only, no personal data."

**SAY (on AI health):** "And the part nobody asked for: what the AI itself costs. A fraction of a US cent per enquiry — and that's measured from the API's own token counts, not estimated. My first version estimated tokens by counting characters. When I switched to the real numbers, my estimate turned out to be **thirty-six times too low**, because these models think silently before answering and every one of those hidden thoughts is billed."

> **Read the figures off the screen — don't recite these.** They move with every demo lead. At the last rehearsal the report showed 28 enquiries, 9 replies, 90% approval rate, 12.6 min average to draft, 146 LLM calls, **$0.00346 per lead**, p50 1438 ms / p95 8237 ms, schema-valid outputs 100%, retries and fallbacks 0 / 0.

---

### 4.3 — One lead, one trace

**SHOW:** window D (Langfuse). Traces list → click the most recent trace → expand so individual model calls show with token counts and costs.

**SAY:** "This is Langfuse, self-hosted, running free beside the pipeline. One enquiry is one trace — every model call, priced to the token."

**SHOW:** point at a score badge on the trace.

**SAY:** "And these scores? A *different vendor's* model grades our AI's work for invented facts — GPT-4o marking Gemini's homework, because a model should never grade its own. When I planted five fake claims in a draft, it caught all five and emailed me."

**SAY (no click needed):** "Every call has a second vendor behind it too. I took Gemini down completely as a test — the pipeline finished on the backup, still grounded in real stock."

---

### 4.4 — Close

| SHOW | SAY |
|---|---|
| Deck **slide 6** (scoreboard) | "Ten out of ten on classification — in every one of five independent runs. Ninety-five percent of facts captured correctly at the median, ninety-two to ninety-seven across runs — and I can tell you the spread because I re-measured until the number stopped being luck. Zero invented facts in four of those five runs; the one exception was on deliberate gibberish, which the system had already routed to a human. Every recommendation real and in stock. And the labels were written before the prompts, so I couldn't tune my way to a good score." |
| Deck **slide A1** | "One pipeline. Three doors — email, chat, and other companies' AI. Any business. Everything you just watched happened live, on this system's own data. That's SalesGenie v2. Thank you." |

**— STOP RECORDING. DONE. —**

---

## Post-shoot checklist

- [ ] Final cut runs **5:00–5:30**.
- [ ] **Both Approve clicks are on camera** (Takes 2 and 3) — they are the thesis.
- [ ] The `input-required` line is readable and held for a beat.
- [ ] The AI-health section and one Langfuse trace are legible at full screen — pause or zoom if not.
- [ ] **No secrets on screen at any point:** never show `.env`, the n8n credentials page, or a bearer token. The demo script reads the token itself; you never type it.

### Reset the database afterwards

Green Thumb and the demo leads can be removed the same way Verde Living was. Keep every `seed-replay` lead — that is the graded eval set.

```powershell
docker exec n8n-localdata-postgres-1 psql -U salesgenie -d salesgenie -c "SELECT business_id, name FROM vaibhavcapstone_businesses ORDER BY business_id;"
```

---

## What was verified, and what wasn't

Run end to end on **2026-07-29**, immediately before this script was written:

| Take | Verified |
|---|---|
| 1 | `Green Thumb` → `biz_greenthumb`; setup status correct at both ends; enquiry parked `AWAITING_SETUP` / `missing:["catalog"]`; catalogue 8 upserted; lead **resumed unaided** to `PENDING_APPROVAL`, HOT 100, three grounded in-stock SKUs |
| 2 | Intake returned `RECEIVED` instantly; poll showed all five states changing; `PENDING_APPROVAL` at 37s; three grounded furniture SKUs; approve → `SENT`, delivered to the redirect address |
| 3 | Agent card served; task `submitted → working → input-required → completed`; artifact carried three real chairs with SKUs and prices |
| 4 | Insights run started and rebuilt the report; HTTP 200, 4 QuickChart images, AI-health section present; Langfuse HTTP 200; all recent LLM calls logged `exact_api` |

**Not verifiable from outside Claude Desktop:** the assistant's exact wording in Take 1. Every tool it calls was executed directly with the arguments these instructions ask for, and all returned what is written above — but Claude composes its own sentences, so treat the "WATCH FOR" blocks as the substance to look for, not a transcript.

All rehearsal data was deleted afterwards; the tenant list is back to Oak & Ember and Page & Bind Books, and the 30 `seed-replay` eval leads are untouched.
