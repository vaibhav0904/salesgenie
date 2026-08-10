# Run SalesGenie for your business — the complete setup guide

SalesGenie is an AI back office for your sales inbox. It reads every enquiry, captures the customer's details perfectly, scores how promising the lead is, recommends only products you actually have in stock, and writes a draft reply in your brand's voice — then **stops and waits for you to click Approve** before anything reaches a customer. Every Monday it emails you a report on how your funnel is doing.

This guide takes you from nothing to your first approved reply. You do not need to be technical.

**What it costs, honestly.** Most of this runs on free plans, but two pieces do not, and
you should know before you start rather than at the checkout page:

- **n8n** — free forever if you install it on your own server, but that is a system
  administrator's job. The easy route, **n8n Cloud**, is free only for a trial period and
  is a paid subscription afterwards.
- **OpenAI** — pay-per-use, no free tier. It is optional here. Typical spend is a fraction
  of a cent per enquiry.

Everything else — the database, the Google AI key, your mailbox, the SalesGenie files —
is genuinely free at the volumes a small business generates.

**What you'll use:**

| Piece | What it does | Cost |
|---|---|---|
| An **n8n** instance with a public web address | Runs the SalesGenie machinery (n8n is a tool where automations run as visual flowcharts). The address must be reachable from the open internet, because your chat app, other companies' AI, and n8n's own internal calls all go to it | n8n Cloud: free trial, then paid. Self-hosted: free, but you run the server |
| A **Supabase** account | Your free database — the permanent record book where enquiries, decisions and reports live | Free plan, no card needed |
| A **Google Gemini key** | The AI that reads, scores and writes | Free tier |
| An **OpenAI key** *(optional but recommended)* | Powers two extras: a backup AI if Google has an outage, and an independent "examiner" AI that checks the quality of every AI output | Pay-per-use, fractions of a cent. No free tier |
| Your **email mailbox** | Where enquiries arrive and approval requests are sent | You have this |
| **The SalesGenie files** | Download the repository from GitHub — the green **Code → Download ZIP** button — and unzip it somewhere you can find | Free |
| **Node.js** | Needed for exactly one command in Step 3. Install from **nodejs.org** (the "LTS" version), then restart your terminal | Free |

**Two mailbox settings to sort out first**, because they take a few minutes and are easy
to hit as a surprise halfway through Step 3:

- **Two-step verification must be switched on** for the Google account whose mailbox you
  use. Not for security theatre — Google will not *offer* you an app password until it is
  on, and an app password is what n8n needs. (Google Account → Security → 2-Step
  Verification, then App passwords.) Other mail providers have their own equivalent.
- **IMAP must be enabled** on that mailbox if you want the email door — the part that
  reads enquiries out of your inbox. In Gmail: Settings → Forwarding and POP/IMAP →
  Enable IMAP. Without it, the other three doors still work fine.

Total setup time: about 45 minutes, once. It is almost all pointing and clicking; there
is **one** command to run, in Step 3, and it is copy-paste.

---

## Step 1 — Create your free database (~5 minutes)

Everything SalesGenie knows lives in a database. Supabase gives you one free, with a browser page where you can paste setup text — no command line needed for this step.

1. Go to **supabase.com**, sign up (free), and click **New project**. Name it `salesgenie`, choose a strong database password, and **save that password** — you'll need it in Step 3.
2. When the project is ready, open **SQL Editor** in the left menu. This is a box where you paste setup text and press **Run**.
3. The SalesGenie package's `db/` folder holds setup files numbered `001` to `005`. Open them one at a time in any text editor, copy the whole content, paste into the SQL Editor, and press **Run** — in number order. Each should finish with a success message. (These create the record book's "pages": leads, products, decisions, reports, AI logs.)

   **Skip `002`.** That one loads a fictional demo furniture shop ("Oak & Ember") with 20 sample products, which is useful for exploring but is not your business. Run `001`, then `003`, `004`, `005`. (Ignore `init_test_db.sql` — it is for the project's own testing.)
4. One more small paste. This sets the secret password that protects the door where other companies' AIs can reach you (Step 7). Replace the middle part with any long random phrase of your own and run:

```sql
INSERT INTO vaibhavcapstone_platform_config (key, value)
VALUES ('a2a_bearer', 'choose-a-long-random-secret-here')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

   **How you know it worked:** Supabase reports *"Success. No rows returned."* That is the
   pass — this statement writes a row, it doesn't read one, so an empty result is correct.
   **Keep the phrase you chose**; Step 7 needs it. If you skip this entirely, everything
   works except the door for other companies' AI, which will refuse every caller.

5. Finally, find your database's connection details: **Project Settings → Database**. Note down the **host**, **port**, **database name**, **user**, and the password from step 1. (Use the "connection pooling" host if offered — it's the more reliable one.)

---

## Step 2 — Get your AI keys (~5 minutes)

**Google Gemini (required, free).** Go to **aistudio.google.com**, sign in with any Google account, and click **Get API key**. Copy it somewhere safe. This key is how SalesGenie's reading-and-writing intelligence works; Google's free tier is generous enough for a small business's daily enquiries.

**OpenAI (optional, strongly recommended).** Go to **platform.openai.com**, create a key under **API keys**. This unlocks two safety features: if Google's AI ever has an outage, an OpenAI model of the same price class automatically takes over mid-enquiry; and an independent OpenAI "examiner" reviews every AI output for made-up facts and alerts you if it finds any. Typical cost: well under a rupee per enquiry. If you skip this, the core system still works — you just lose the backup brain and the examiner.

---

## Step 3 — Import the workflows and connect your accounts (~15 minutes)

The SalesGenie package contains **14 workflow files** (they end in `.json`) in its `n8n/workflows/` folder. Each one is a department of the back office: reception, the reader, the scorer, the recommender, the drafter-with-approval, the weekly report, and so on.

1. **First, fix the addresses — before importing anything.** Jump to **point 5** below,
   run the one command there, and come back. It rewrites the package for *your* n8n
   address. Doing it afterwards means editing 20 places by hand, five of them hidden.

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
| `Capstone-Langfuse` *(only if you do Step 8)* | Header Auth | Leave this until Step 8, which tells you what to put in it. Skip it and the steps named "Ship LF" show a warning mark you can safely ignore — they only send viewing data to an optional dashboard |

**`Capstone-IMA` is not a typo — do not "fix" it.** The name really is stored without the
final `P`. n8n matches credentials to workflows **by name, character for character**, so
naming it `Capstone-IMAP` means the email door never finds it.

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

**How you know it worked.** Your workflow list should show all 14 marked **Active**, with
no toggle that refused to stay on. If one springs back to off with a complaint about a
workflow it calls, that department's target isn't switched on yet — switch that one on
first and come back. Step 5 is the real proof.

*(If you imported from a command line rather than through the n8n screen, restart n8n
before Step 5. Command-line activation records the workflows as on, but the running
program doesn't start listening at their web addresses until it restarts — every address
answers "not registered" until then. Importing through the screen has no such problem.)*

---

## Step 5 — The two-minute smoke test

Before setting up your real business, let's confirm the front door is answering. Run this
(replace the address with yours):

```bash
curl -X POST https://your-team.app.n8n.cloud/webhook/vaibhavcapstone-intake \
  -H "Content-Type: application/json" \
  -d '{"business_id":"not_a_real_business","channel":"webhook","external_id":"t1","from_email":"t@example.com","from_name":"T","subject":"test","body":"test"}'
```

**What you want to see:**

```json
{"ok":false,"error":"unknown business_id: not_a_real_business"}
```

That refusal *is* the pass. It proves the door is open, the database is connected, and
the system will not invent an owner for an enquiry it cannot place. If you instead get
"webhook is not registered", the workflows are imported but not switched on — go back to
Step 4. If you get nothing at all, check the address.

You will send a real enquiry — and get a real approval email — at the end of Step 6,
once your business actually exists.

---

## Step 6 — Onboard your business, by talking

Here's the part that makes SalesGenie different: there is no settings screen. You set up your business by *chatting* — in Claude Desktop or any AI chat app that supports connecting tools (the standard is called **MCP**; think of it as a wall socket that lets your chat app safely operate SalesGenie).

Connect your chat app to these two addresses (it will ask for the secret — that's your `Capstone-MCP-Bearer` phrase):

```
https://your-team.app.n8n.cloud/mcp/vaibhavcapstone-onboarding
https://your-team.app.n8n.cloud/mcp/vaibhavcapstone-operations
```

**Claude Desktop needs a helper to reach a remote address like this.** It cannot simply
be given a URL. Install the bridge once with `npm install -g mcp-remote`, then add both
servers to its config file, launching them with `node <full path to mcp-remote>` — **not**
`npx -y`, which is slow enough that Claude Desktop gives up before the tools appear.
`scripts/verify-desktop-mcp.js` in the package checks the connection for you and tells you
whether it succeeded.

**Don't want to set up a chat client at all? You don't have to.** Every one of these tools
is also a plain web address, so you can do the whole of this step with `curl` instead:

```bash
# create your business
curl -X POST https://your-team.app.n8n.cloud/webhook/vaibhavcapstone-tool-create-business \
  -H "Content-Type: application/json" \
  -d '{"name":"Terracotta Tales","industry":"pottery","tone":"warm and artisanal","currency":"INR"}'

# ask what is still missing  (use the business_id the previous call returned)
curl -X POST https://your-team.app.n8n.cloud/webhook/vaibhavcapstone-tool-setup-status \
  -H "Content-Type: application/json" -d '{"business_id":"biz_terracottata"}'
```

The same pattern works for `-tool-upload-catalog`, `-tool-set-reviewer`,
`-tool-pending-approvals` and `-tool-approve-draft`. Every address is listed in
`docs/workflows-reference.md`. The chat route is friendlier; this one is always available.

Then just talk. A real first conversation looks like this:

> **You:** Set up my business: Terracotta Tales, a pottery studio in Jaipur. Our tone is warm and artisanal. Currency INR.
> **You:** What do I still need before going live?
> *(It answers plainly: no product list yet, no reviewer named.)*
> **You:** Here's my catalog: *(paste your product list — name, category, price, and how many you have)*

> **You:** I'm the reviewer — myname@mybusiness.com. Replies should come from "Terracotta Tales &lt;hello@…&gt;".

**If you paste a spreadsheet or CSV, head the stock column any sensible way** — `stock_qty`,
`stock`, `qty`, `quantity`, `available` and `units` are all understood. The reply tells you
which one it used, names any column it did not recognise, and warns you outright if every
product ended up with zero stock, since that means nothing can be recommended yet. Listing
your products in plain sentences works too.

Three things worth knowing:

- **You can't break it by going out of order.** If an enquiry arrives before your setup is complete, it isn't lost and doesn't error — it *parks*, with a note about what's missing, and finishes its journey automatically the moment you complete setup. Try it on purpose; it's the platform's best party trick: *"Send a test lead: I'd like 20 dinner plates, budget Rs. 30,000."*
- **The catalog is law.** SalesGenie will only ever recommend products from your list that are marked in stock — it double-checks against the database at the moment of recommending. If nothing fits, it says so to *you*, and drafts nothing misleading to the customer.
- **The reviewer is the gate.** No reply reaches a customer without that person clicking Approve — in the approval email, or right in the chat: *"What's pending?" → "Approve the first one."* This is built into the machinery, not a setting you could accidentally turn off.

From now on you can send enquiries in from anywhere — the test-lead command above, your
website's contact form, another company's AI — and every Monday your report arrives:
funnel, lead quality, response speed, best-selling interests, plus exactly what the AI
cost you that week, to the fraction of a rupee.

**Two things are still not what you'd assume**, and both are below before you go on:
approved replies are not yet reaching customers, and your actual mailbox is not yet
being read.

### ⚠ Until you say otherwise, approved replies come back to *you* — not to the customer

This is deliberate, and it is the single most important thing to know before you trust
this with real enquiries.

When you named a reviewer, SalesGenie also switched on a safety net: every approved
reply is delivered to the **reviewer's** inbox instead of the customer's, with the real
recipient shown in the subject like `[DEMO -> priya@herbusiness.com] Re: your enquiry`.
The point is that you can practise on real-looking enquiries — approve things, get them
wrong, approve again — without a single stranger receiving anything.

It also means that **while it is on, no customer ever hears from you.** You will see
replies arriving in your own inbox and it can look like everything is working.

When you are ready for real customers, say this in chat:

> **You:** Turn off the customer email redirect for my business — send approved replies straight to the customer.

(Under the hood it clears one setting, `customer_email_redirect`. If your chat client
asks for exact wording, the tool is `update_business_config` and the change is
`{"customer_email_redirect": null}`.)

Check it worked by approving one more draft: the subject should no longer start with
`[DEMO -> …]`, and it should land with the customer rather than with you.

To switch the safety net back on later — say, while you are trying something new —
set it to your own address the same way.

### Opening the email door (~2 minutes)

Reading enquiries straight out of your inbox is the door most people want most, and it is
the one that does **not** switch itself on. Two things are missing, and both fail quietly
— mail simply sits in your inbox and nothing happens.

**1. Tell SalesGenie which mailbox is yours.** One mailbox-watcher serves every business
on the platform, so it decides who an email belongs to by looking at the address it was
sent *to*. Until your business claims an address, no email can be matched to it. Say in
chat:

> **You:** The address my customers write to is sales@mybusiness.com.

(The tool is `update_business_config`; the setting is `intake_email`. By `curl`:)

```bash
curl -X POST https://your-team.app.n8n.cloud/webhook/vaibhavcapstone-tool-update-config \
  -H "Content-Type: application/json" \
  -d '{"business_id":"biz_yourbusiness","config":{"intake_email":"sales@mybusiness.com"}}'
```

This must be an address that arrives in the **same mailbox** you gave the `Capstone-IMA`
credential in Step 3. If your enquiries land at `sales@` but n8n is watching `hello@`,
nothing matches. A plus-address like `you+enquiries@gmail.com` works well and is free.

**2. Know about the subject tag.** Out of the box the watcher only picks up unread mail
with **`[enquiry]` in the subject line**. That is a deliberate guard so that switching
this on does not tip your entire inbox — newsletters, invoices, your mother — into the
sales pipeline on day one.

So the first email you send yourself to test it must be subject-tagged, for example
`[enquiry] Do you make dining tables?`. If you later want *every* unread message treated
as a possible enquiry, open `VaibhavCapstone-02-GmailAdapter`, click **Email Trigger
(IMAP)** → Options → Custom Email Config, and change it to `[["UNSEEN"]]`. Think before
you do: everything unread then goes to the AI, which costs a little and generates noise.
(Gmail's own subject search is loose rather than exact, so treat the tag as a strong
filter, not a perfect one.)

**How you know it worked.** Send yourself a tagged email from a *different* address, wait
about a minute, then ask in chat *"What's pending?"* or check your leads table — a new
enquiry should be there. Nothing arriving? Ask in chat for recent activity: an email that
reached the mailbox but matched no business is recorded as `ADAPTER_UNMAPPED_MAILBOX`,
which means step 1 above is wrong or the tag was missing. **Mail that can't be placed is
never guessed at and never attached to the nearest business.**

**Why the email must come from a different address:** the door deliberately ignores mail
sent *from* your own reply address or intake address. Without that, SalesGenie's own
approved replies would land back in the mailbox it watches and be read as fresh enquiries
— a loop that feeds on itself. That was a real bug found in testing, not a theory.

---

## Step 7 — The door you didn't know you had

Your business is now also reachable by *other companies' AI assistants*. More and more purchasing departments let an AI do their supplier shopping; when one of them comes looking, your "AI business card" is at:

```
https://your-team.app.n8n.cloud/webhook/a2a-agent-card?business_id=YOUR_BUSINESS_ID
```

Open that address in a browser. You should get a page of settings describing your business
by name — that page *is* the business card, and the fact that it answers means the door is
open. It needs no password, exactly like a business card.

Their AI can read it, send an enquiry, and track progress — it will even see, honestly, "a human reviewer is checking the proposed offer" while you decide. You approve exactly as always; their AI receives your approved offer in a form its own systems can process. You've just become sellable to robots, with a human hand still on the pen.

**Try it yourself — play the other company's AI.** The package includes a small program
that does exactly what a buying agent would: reads your card, sends an enquiry, then waits
and watches while you decide.

```bash
A2A_BASE_URL=https://your-team.app.n8n.cloud/webhook \
A2A_BEARER_TOKEN=the-phrase-you-chose-in-step-1 \
node scripts/buyer-agent-demo.js biz_yourbusiness
```

The secret is the one you invented for the `a2a_bearer` row in Step 1 — **not** your chat
password from Step 3. They are two different secrets, and using the wrong one gets you a
flat "unauthorized" with no further explanation.

**What you want to see:** it prints your business's name from the card, sends its enquiry,
and then reports the state `input-required` — meaning *waiting for the human*. At that
moment an approval email lands with you. Approve it, and within a poll or two the same
program prints your approved offer. That is the whole point of the door in one run: another
company's software transacted with yours, and a person still signed off.

---

## Step 8 (optional) — A dashboard for every AI call

Want to *see* the AI working — every call, its speed, its exact token cost, and the examiner's quality marks, per enquiry? Langfuse offers a hosted free tier:

1. Sign up at **cloud.langfuse.com** (free plan), create a project, and copy its two keys (public + secret).
2. In n8n, create a credential named `Capstone-Langfuse` of type **Header Auth**: name `Authorization`, value `Basic ` followed by the two keys joined by a colon and base64-encoded (any "base64 encode" web page can do this: encode `pk-lf-xxx:sk-lf-xxx`).
3. Open each step starting with **"Ship LF"** and select the `Capstone-Langfuse` credential you just made.

   You do **not** need to change their addresses by hand — if you passed
   `--langfuse https://cloud.langfuse.com` to the script in Step 3, all seven were
   already rewritten. If you skipped that flag, re-run the script with it and re-import
   rather than editing seven steps across six workflows.

Skip this entirely and nothing is lost — your Monday report already includes AI cost and quality, computed from your own database.

---

## If something looks stuck

- **An enquiry seems to have vanished** → it hasn't. Ask in chat: *"What's the status of lead …?"* — you'll get its full, timestamped story.
- **Status says NEEDS_REVIEW** → the system chose to hand this one to a human: the AI wasn't confident, or no product could be honestly recommended. That's it working as designed.
- **Status says AWAITING_SETUP** → it's parked, waiting for a missing piece of your setup. Ask *"What do I still need?"* and complete it — the enquiry resumes on its own.
- **No approval emails arriving** → check the `Capstone-SMTP` credential (for Gmail, it must be an app password) and that a reviewer email is set for your business.
- **Emails to my inbox produce nothing** → four usual causes, in the order worth checking: the subject was missing `[enquiry]`; `intake_email` was never set or doesn't match the address it was sent to; IMAP isn't enabled on the mailbox; or you sent it from your own reply address, which the anti-loop guard ignores on purpose. All four are covered in "Opening the email door" above.
- **Approved replies keep coming back to me, with `[DEMO -> …]` in the subject** → that is the safety net, still on. See the warning section in Step 6 for the one sentence that turns it off.
- **Something truly broke** → the error-catcher will have quarantined the enquiry and emailed the operator with its tracking number. Nothing is ever silently lost.
