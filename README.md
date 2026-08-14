# SalesGenie — an AI back office for your sales inbox

**What it does.** Every enquiry that reaches your business gets read, understood, scored
for how promising it is, matched against products you actually have in stock, and answered
with a draft reply in your own voice — which then **waits for a human to click Approve**
before a word of it reaches the customer. Every Monday you get a report on how the week
went, including what the AI cost you.

**What's unusual about it.** There is no settings screen anywhere. You set your business up
by *talking* to it in a chat app — describe your shop in a sentence, paste your product
list, say who approves replies, and you're running. One installation serves any number of
separate businesses, each seeing only its own data.

## ▶ See it work

**[Watch the 10-minute demo](https://github.com/vaibhav0904/salesgenie/releases/tag/demo-v1)**
— a business created by chat, an enquiry that arrives too early and parks itself until the
shop is ready, two deliberate attempts to make the AI lie (both fail), the weekly cost
report, and another company's AI buying something while a human still holds the pen.

Recorded against the real system. Nothing staged, nothing sped up to hide a wait.

## Run it for your own business

**→ [The complete setup guide](docs/business-onboarding-guide.md)** — about 45 minutes,
written for a business owner rather than an engineer.

You'll need an **n8n account** (n8n is a tool where automations run as visual flowcharts),
a free **Supabase** database, and a free **Google Gemini** key for the AI. The guide walks
through each one. There are three commands to copy and paste; everything else is pointing
and clicking.

*Prefer to run it free on your own machine instead? See [`docker/README.md`](docker/README.md)
— same system, one command, but you look after the server.*

## How it works

Four ways an enquiry can arrive. All of them turn into the same thing before anything else
happens, so nothing downstream knows or cares which door was used.

```
Email      ──▶ 02-GmailAdapter ─┐
Web form   ──────────────────────┼─▶ Intake ─▶ Read it ─▶ Score it ─▶ Recommend ─▶ Draft ─▶ 🧑 approve ─▶ send
Chat app   ──▶ 09-MCPOperations ─┘
Another AI ──▶ 13-A2AServer
```

- **Email** — watches a real mailbox and turns each message into an enquiry.
- **Web form** — a plain web address anything can post to: your contact form, another system.
- **Chat app** — 12 things a chat app can do on your behalf: create the business, upload the
  catalogue, check status, approve replies. The standard that lets a chat app safely operate
  outside software is called **MCP**.
- **Another company's AI** — it reads a public "business card" describing you, sends an
  enquiry, then polls for progress. The standard for software agents transacting with each
  other is called **A2A**, and it has a state meaning *waiting for a human* — which is
  exactly what your approval gate shows, rather than pretending to be autonomous.

## Why you can trust what it sends

Four rules hold by construction, not by convention:

1. **Nothing reaches a customer without a human clicking Approve.** The send step is only
   reachable from an approved record — enforced in the database, not by how the flowchart
   is drawn.
2. **It only ever recommends products you really have.** Every suggestion is checked against
   your catalogue before *and* after the AI picks. If nothing genuinely fits, it says so to
   you and drafts nothing misleading.
3. **Every business's behaviour comes from its own settings.** No step anywhere contains a
   rule about one specific business.
4. **A half-finished setup is a normal state, not an error.** An enquiry arriving before
   you're ready parks itself and resumes on its own once the missing piece lands.

And the numbers are measured, not asserted:

- **Classification:** 10/10 across all 5 replay runs; spam caught every time.
- **Extraction:** 92–97% across 5 runs, median **95.3%**.
- **Invented facts:** none in 4 of 5 runs. The one exception invented an urgency for a
  gibberish email that had already been routed to a human, so nothing downstream used it.
  Counted and reported anyway.

An earlier single-run figure of 98.4% turned out to be a lucky draw from a sampling bug.
The bug, the fix and the honest spread are all in
[`evals/results/`](evals/results/2026-07-30-extraction-spread.md) — the spread is the number.

## For developers

| Path | What's in it |
|---|---|
| [`docs/workflows-reference.md`](docs/workflows-reference.md) | All 14 workflows: what starts each one, its web addresses, credentials, database tables, and how they call each other. Generated from the exports, so it can't drift |
| [`n8n/workflows/`](n8n/workflows/) | The 14 exports (every canvas annotated) + the import guide and the seven credentials to create |
| [`docs/`](docs/) | `architecture.md` · `contracts.md` (message shapes, state machines) · `scoring.md` · `assumptions.md` · `environments.md` · design decisions in `adr/` |
| [`stories/`](stories/) | Every unit of work as a card — including all ten bugs, each with root cause and fix |
| [`evals/`](evals/) | The 10-email labelled dataset, the grading harness, and dated results |
| [`scripts/`](scripts/) | `retarget-host.js` (rewrite the exports for your own address) · `sync-workflows.js` · `preflight-publish.js` · `buyer-agent-demo.js` · `verify-desktop-mcp.js` · database reset helpers |
| [`db/`](db/) | Migrations. `002` is an optional demo shop — skip it for a clean platform |
| [`docker/`](docker/) | Self-contained n8n + Postgres for local development |

**Before importing the workflows into your own n8n**, run
`node scripts/retarget-host.js --base https://your-n8n-address`. The exports were built
against a local address that appears 20 times across 4 files, five of them buried inside
database queries and code steps where find-and-replace misses them. The script rewrites all
of them and prints anything it can't fix.

**Built with:** n8n (14 workflows, authored through its API rather than clicked together) ·
Postgres · Google Gemini 2.5 Flash, with an OpenAI model as backup and a second OpenAI model
as an independent judge · Langfuse for per-call AI tracing · QuickChart for email-safe charts.

## Security posture — stated, not hidden

- Secrets live only in `.env` (never committed; template in `.env.example`). The workflow
  exports contain references to credentials, never their contents.
- The chat and agent doors require a token. **The intake web address does not** — fine for a
  local trial, and the biggest known gap for production, where it needs a key per business.
- Prompts receive only the fields a step needs; chart links carry totals, never personal data.
- The full list, with reasoning: [`docs/assumptions.md`](docs/assumptions.md).

## The brief

Built as a capstone: an AI sales assistant for a furniture retailer — qualify inbound leads,
recommend from the catalogue, draft replies, report weekly. This answers with a *platform*
instead, where the furniture retailer is simply the first tenant. The course brief itself is
summarised rather than redistributed.

## License

MIT — see [LICENSE](LICENSE).
