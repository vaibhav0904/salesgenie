> **Superseded by [hero-demo-runbook.md](hero-demo-runbook.md)** (Scene 2,
> "a business born in conversation") — kept in place for BUG-006/E18-S1
> historical traceability, not current presentation material.

# Script: onboard a brand-new business through Claude Desktop

Your role: a founder called **Verde Living** — an indoor-plants studio in Bengaluru — joining SalesGenie by chat. Every line below is ready to copy-paste into Claude Desktop. Expected responses are noted so you always know it's working. Total time: ~10 minutes.

## Before you start (once)

1. **Restart Claude Desktop** (fully quit from the system tray, reopen) so it loads the two new SalesGenie connections.
2. In a new chat, check the tools icon (🔨/plug icon near the message box): you should see **salesgenie-onboarding** and **salesgenie-operations** listed, with tools like `create_business`, `get_setup_status`, `approve_draft`.
3. Docker stack must be running (it already is today).

> Tip: if Claude asks permission to use a tool the first time, allow it — that's Claude Desktop's normal safety prompt.

---

## Act 1 — Register the business

**You type:**
> Set up a new business on SalesGenie: Verde Living, an indoor-plants studio in Bengaluru. Industry: plant-retail. Tone of voice: fresh, cheerful and encouraging. Currency INR.

**Expect:** Claude calls `create_business` and reports a new business id like `biz_verdeliving…` — **note this id**, you'll use it later.

**You type:**
> What do I still need before Verde Living can go live?

**Expect:** via `get_setup_status`, a plain answer: no catalog yet (so recommendations can't run) and no reviewer yet (so drafts can't be approved).

## Act 2 — Jump the gun (the best demo moment)

**You type:**
> Send a test lead to Verde Living with this custom enquiry — from Ananya Rao (ananya@byteleaf.example), subject "Plants for our new office reception", body: "Hi, I'm furnishing a new office reception and want 10 low-maintenance indoor plants, budget around Rs. 15,000 total, needed within 2 weeks. - Ananya, ByteLeaf Tech"

**Expect:** Claude calls `send_test_lead` with your custom subject/body and a lead id comes back. (The tool also has canned scenarios — hot/warm/spam/vendor — for quick smoke tests; custom text is for exactly this kind of realistic demo. Either way the lead is honestly marked as a test in the records.)

**You type:**
> What's the status of that lead?

**Expect:** via `get_lead_status` — the lead was read and understood (Ananya Rao, ByteLeaf, ₹15,000, indoor plants, urgent) and is now **parked in AWAITING_SETUP**, with a note saying it's waiting for the catalog. Not an error. Not lost.

## Act 3 — Finish the setup

**You type:**
> Here's Verde Living's catalog:
> sku,name,category,price,currency,stock
> PLT-001,Areca Palm (large),floor-plants,1499,INR,25
> PLT-002,Snake Plant,desk-plants,499,INR,60
> PLT-003,ZZ Plant,desk-plants,699,INR,40
> PLT-004,Money Plant in Ceramic Pot,desk-plants,399,INR,80
> PLT-005,Fiddle Leaf Fig,floor-plants,2499,INR,12
> PLT-006,Peace Lily,flowering,899,INR,30
> PLT-007,Rubber Plant,floor-plants,1199,INR,18
> PLT-008,Succulent Trio Set,desk-plants,649,INR,50

**Expect:** `upload_catalog` confirms 8 products loaded.

**You type:**
> Set the reviewer for Verde Living to YOUR-EMAIL@gmail.com. Also set the sender identity to "Verde Living <hello@verdeliving.example>" and, since this is a demo, redirect customer emails to YOUR-EMAIL@gmail.com.

**Expect:** reviewer + config saved — **and Ananya's parked lead from Act 2 wakes up on its own** (the resume runs automatically). Within ~30 seconds an email titled **"[Approval needed] …"** lands in your inbox with a draft reply recommending real, in-stock plants within her ₹15,000 budget, written in Verde Living's cheerful voice.

## Act 4 — The human gate (two ways, pick either)

**Way 1 — email:** open the approval email, read the draft, click **Approve**. The reply is sent (redirected to your inbox, prefixed `[DEMO → …]`).

**Way 2 — chat:**
> What's pending approval for Verde Living?
> Approve the first one.

**Expect:** approved + sent. Then try approving it again — you'll be told it's already decided. (One decision per draft, ever.)

## Act 5 — See the business run

**You type:**
> Show me Verde Living's insights.

**Expect:** the report (or a note that the first weekly run hasn't happened — you can trigger it: in a terminal, `curl -X POST http://localhost:5678/webhook/vaibhavcapstone-insights-run`, then ask again or open `http://localhost:5678/webhook/vaibhavcapstone-insights-latest?business_id=<your id>`).

**Optional finale — a robot buys your plants.** In a terminal:
```
node scripts/buyer-agent-demo.js <your business id> "We need 20 desk plants for our new office, budget Rs. 12,000, in 3 weeks. Contact: procure@officeworks.example"
```
Watch another company's "AI buyer" discover Verde Living's agent card, enquire, wait at your human gate (approve the email when it arrives!), and receive the offer as structured data.

---

## If something doesn't look right
- Tools not visible in Claude Desktop → it wasn't fully restarted; quit from the system tray and reopen.
- "Unauthorized" → the bearer token in the Desktop config no longer matches `.env` (it was set today; it matches).
- No approval email → check spam, and confirm the reviewer step in Act 3 succeeded.
- Any lead's full story, any time: *"What's the status of lead &lt;id&gt;?"*
