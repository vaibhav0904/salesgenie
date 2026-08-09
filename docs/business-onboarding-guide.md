# Run SalesGenie for your business — the complete setup guide

SalesGenie is an AI back office for your sales inbox. It reads every enquiry, captures the customer's details perfectly, scores how promising the lead is, recommends only products you actually have in stock, and writes a draft reply in your brand's voice — then **stops and waits for you to click Approve** before anything reaches a customer. Every Monday it emails you a report on how your funnel is doing.

This guide takes you from nothing to your first approved reply. You do not need to be technical, and you do not need to pay anyone: every piece runs on free plans, and you bring your own (free) AI key.

**What you'll use:**

| Piece | What it does | Cost |
|---|---|---|
| Your **n8n** account | Runs the SalesGenie machinery (n8n is a tool where automations run as visual flowcharts) | Your existing account |
| A **Supabase** account | Your free database — the permanent record book where enquiries, decisions and reports live | Free plan, no card needed |
| A **Google Gemini key** | The AI that reads, scores and writes | Free tier |
| An **OpenAI key** *(optional but recommended)* | Powers two extras: a backup AI if Google has an outage, and an independent "examiner" AI that checks the quality of every AI output | Pay-per-use, fractions of a cent |
| Your **email mailbox** | Where enquiries arrive and approval requests are sent | You have this |

Total setup time: about 45 minutes, once.

---

## Step 1 — Create your free database (~5 minutes)

Everything SalesGenie knows lives in a database. Supabase gives you one free, with a browser page where you can paste setup text — you'll never touch a command line.

1. Go to **supabase.com**, sign up (free), and click **New project**. Name it `salesgenie`, choose a strong database password, and **save that password** — you'll need it in Step 3.
2. When the project is ready, open **SQL Editor** in the left menu. This is a box where you paste setup text and press **Run**.
3. The SalesGenie package includes five setup files in its `db/` folder, numbered `001` to `005`. Open them one at a time in any text editor, copy the whole content, paste into the SQL Editor, and press **Run** — in number order. Each should finish with a success message. (These create the record book's "pages": leads, products, decisions, reports, AI logs.)
4. One more small paste. This sets the secret password that protects the door where other companies' AIs can reach you (Step 7). Replace the middle part with any long random phrase of your own and run:

```sql
INSERT INTO vaibhavcapstone_platform_config (key, value)
VALUES ('a2a_bearer', 'choose-a-long-random-secret-here')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

5. Finally, find your database's connection details: **Project Settings → Database**. Note down the **host**, **port**, **database name**, **user**, and the password from step 1. (Use the "connection pooling" host if offered — it's the more reliable one.)

---

## Step 2 — Get your AI keys (~5 minutes)

**Google Gemini (required, free).** Go to **aistudio.google.com**, sign in with any Google account, and click **Get API key**. Copy it somewhere safe. This key is how SalesGenie's reading-and-writing intelligence works; Google's free tier is generous enough for a small business's daily enquiries.

**OpenAI (optional, strongly recommended).** Go to **platform.openai.com**, create a key under **API keys**. This unlocks two safety features: if Google's AI ever has an outage, an OpenAI model of the same price class automatically takes over mid-enquiry; and an independent OpenAI "examiner" reviews every AI output for made-up facts and alerts you if it finds any. Typical cost: well under a rupee per enquiry. If you skip this, the core system still works — you just lose the backup brain and the examiner.

---

## Step 3 — Import the workflows and connect your accounts (~15 minutes)

The SalesGenie package contains **14 workflow files** (they end in `.json`) in its `n8n/workflows/` folder. Each one is a department of the back office: reception, the reader, the scorer, the recommender, the drafter-with-approval, the weekly report, and so on.

1. **First, fix the addresses — before importing anything.** Jump to point 4 below, run
   the one command, and come back. It rewrites the package for *your* n8n address. Doing
   it afterwards means editing 20 places by hand, five of them hidden.

2. Now, in n8n, choose **Import from file** and import all 14 — **from the
   `n8n/workflows-retargeted/` folder the script just produced**, not the original
   `n8n/workflows/`. Don't worry about red warning marks yet; they just mean the
   workflows can't see your accounts yet.

3. Create the accounts ("credentials") the workflows expect. In n8n's **Credentials**
   section, create each of these, with exactly these names:

| Credential to create | n8n credential type | What to fill in |
|---|---|---|
| `Capstone-Postgres` | Postgres | Your Supabase host, port, database, user, password from Step 1 |
| `Google Gemini(PaLM) Api account` | Google Gemini (PaLM) API | Your Gemini key from Step 2 |
| `OpenAI account` | OpenAI | Your OpenAI key (skip if you skipped OpenAI) |
| `Capstone-SMTP` | SMTP | Your mailbox's outgoing-mail settings (for Gmail: an "app password", not your normal password) |
| `Capstone-IMA` | IMAP | Your mailbox's incoming-mail settings (same app password) |
| `Capstone-MCP-Bearer` | Bearer Auth | Invent another long random phrase — this protects your chat controls (Step 6) |

4. Open each imported workflow once. Wherever a step shows a credential warning, click it and select the matching credential you just created. (n8n remembers your choice per credential name, so this goes quickly after the first few.)
5. **The address fix — this is the command point 1 sent you to.**

   The package was built on a private machine where n8n answered at
   `http://localhost:5678`. That address appears **20 times across 5 workflows**, and
   five of those are hidden inside database queries and code steps where you would
   never find them by looking at the obvious places. Miss them and the damage is
   quiet: the chat tools in Step 6 will run and simply reach nothing.

   On a computer with the package downloaded and Node installed, run:

   ```bash
   node scripts/retarget-host.js --base https://your-team.app.n8n.cloud \
        --langfuse https://cloud.langfuse.com \
        --reviewer you@yourbusiness.com
   ```

   It writes corrected copies into `n8n/workflows-retargeted/` — **import those**
   instead of the originals. It also stamps each workflow with the id the others
   reference, so n8n links the departments together on import and there is nothing
   for you to re-point by hand. Point 6 is just a confirmation that it worked.

   *(`--langfuse` is only useful if you did Step 8; without it the "Ship LF" steps
   keep pointing at a dashboard that isn't there and fail silently and harmlessly.
   `--reviewer` sets who gets error alerts.)*

   **Use the address n8n itself can reach, not just the one your browser uses.**
   Twelve of those URLs are the chat tools, and n8n calls them from inside its own
   process — server to server. For hosted n8n they are the same thing, so your
   `https://your-team.app.n8n.cloud` address is correct and you can ignore this. It
   only bites if you run n8n locally in Docker on a non-standard port: the port you
   type in your browser is not the port n8n listens on inside its container, and the
   chat tools would fail quietly. The script warns you if it spots that case.

6. **Check two things after importing.** The script stamps the workflows with the
   ids they reference, so n8n links them up on arrival and you should have nothing to
   fix. Confirm it worked: open any workflow, and

   - Settings → Error Workflow should read `VaibhavCapstone-00-ErrorHandler`.
   - Steps named "Call …" or "Resume Parked …" should name the workflow they call,
     not show an unresolved id.

   If either looks wrong, select the right one by hand — those links are what pass an
   enquiry from one department to the next, and without them enquiries stop after the
   first step.

---

## Step 4 — Switch on, in the right order (~5 minutes)

Some departments call other departments, so the inner ones must be switched on first. Activate (toggle on) the workflows in this order:

**00 → 06 → 05 → 04 → 03 → 10 → 01 → 02 → 07 → 08 → 09 → 11 → 12 → 13**

(That's: error-catcher first, then the assembly line from the end backwards, then the doors, then the report, chat controls, the nudger, the examiner, and the AI-to-AI door.)

---

## Step 5 — The two-minute smoke test

Let's prove it's alive before onboarding your real business. In n8n, open workflow **…09-MCPOperations** — but the simplest test is from Step 6's chat, so if you're impatient, skip ahead. Prefer a direct test? Any tool or teammate who can send a web request can POST a test enquiry to:

```
https://your-team.app.n8n.cloud/webhook/vaibhavcapstone-intake
```

Either way, the proof of life is the same: within about a minute, an email titled **"[Approval needed] …"** arrives in the reviewer mailbox you'll configure next. (If you test before onboarding a business, the enquiry will politely be refused with "unknown business" — that's correct behavior! The system never guesses who an enquiry belongs to.)

---

## Step 6 — Onboard your business, by talking

Here's the part that makes SalesGenie different: there is no settings screen. You set up your business by *chatting* — in Claude Desktop or any AI chat app that supports connecting tools (the standard is called **MCP**; think of it as a wall socket that lets your chat app safely operate SalesGenie).

Connect your chat app to these two addresses (it will ask for the secret — that's your `Capstone-MCP-Bearer` phrase):

```
https://your-team.app.n8n.cloud/mcp/vaibhavcapstone-onboarding
https://your-team.app.n8n.cloud/mcp/vaibhavcapstone-operations
```

Then just talk. A real first conversation looks like this:

> **You:** Set up my business: Terracotta Tales, a pottery studio in Jaipur. Our tone is warm and artisanal. Currency INR.
> **You:** What do I still need before going live?
> *(It answers plainly: no product list yet, no reviewer named.)*
> **You:** Here's my catalog: *(paste your product list — even a simple list of name, price and stock works)*
> **You:** I'm the reviewer — myname@mybusiness.com. Replies should come from "Terracotta Tales &lt;hello@…&gt;".

Three things worth knowing:

- **You can't break it by going out of order.** If an enquiry arrives before your setup is complete, it isn't lost and doesn't error — it *parks*, with a note about what's missing, and finishes its journey automatically the moment you complete setup. Try it on purpose; it's the platform's best party trick: *"Send a test lead: I'd like 20 dinner plates, budget Rs. 30,000."*
- **The catalog is law.** SalesGenie will only ever recommend products from your list that are marked in stock — it double-checks against the database at the moment of recommending. If nothing fits, it says so to *you*, and drafts nothing misleading to the customer.
- **The reviewer is the gate.** No reply reaches a customer without that person clicking Approve — in the approval email, or right in the chat: *"What's pending?" → "Approve the first one."* This is built into the machinery, not a setting you could accidentally turn off.

From now on, enquiries to your mailbox flow through automatically, and every Monday your report arrives: funnel, lead quality, response speed, best-selling interests — plus exactly what the AI cost you that week, to the fraction of a rupee.

---

## Step 7 — The door you didn't know you had

Your business is now also reachable by *other companies' AI assistants*. More and more purchasing departments let an AI do their supplier shopping; when one of them comes looking, your "AI business card" is at:

```
https://your-team.app.n8n.cloud/webhook/a2a-agent-card?business_id=YOUR_BUSINESS_ID
```

Their AI can read it, send an enquiry, and track progress — it will even see, honestly, "a human reviewer is checking the proposed offer" while you decide. You approve exactly as always; their AI receives your approved offer in a form its own systems can process. You've just become sellable to robots, with a human hand still on the pen.

---

## Step 8 (optional) — A dashboard for every AI call

Want to *see* the AI working — every call, its speed, its exact token cost, and the examiner's quality marks, per enquiry? Langfuse offers a hosted free tier:

1. Sign up at **cloud.langfuse.com** (free plan), create a project, and copy its two keys (public + secret).
2. In n8n, create a credential named `Capstone-Langfuse` of type **Header Auth**: name `Authorization`, value `Basic ` followed by the two keys joined by a colon and base64-encoded (any "base64 encode" web page can do this: encode `pk-lf-xxx:sk-lf-xxx`).
3. In each workflow that has steps starting with **"Ship LF"**, open those steps and change the address to `https://cloud.langfuse.com/api/public/ingestion`, and select the credential.

Skip this entirely and nothing is lost — your Monday report already includes AI cost and quality, computed from your own database.

---

## If something looks stuck

- **An enquiry seems to have vanished** → it hasn't. Ask in chat: *"What's the status of lead …?"* — you'll get its full, timestamped story.
- **Status says NEEDS_REVIEW** → the system chose to hand this one to a human: the AI wasn't confident, or no product could be honestly recommended. That's it working as designed.
- **Status says AWAITING_SETUP** → it's parked, waiting for a missing piece of your setup. Ask *"What do I still need?"* and complete it — the enquiry resumes on its own.
- **No approval emails arriving** → check the `Capstone-SMTP` credential (for Gmail, it must be an app password) and that a reviewer email is set for your business.
- **Something truly broke** → the error-catcher will have quarantined the enquiry and emailed the operator with its tracking number. Nothing is ever silently lost.
