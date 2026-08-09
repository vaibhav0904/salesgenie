# Scripts

## verify-desktop-mcp.js — can Claude Desktop actually reach the MCP tools?

Run this **before any demo or recording** that uses MCP from chat.

```
node scripts/verify-desktop-mcp.js
```

It reads `%APPDATA%\Claude\claude_desktop_config.json`, launches every server
defined there **simultaneously** (the same cold start Desktop does), speaks
Desktop's exact `initialize` handshake, and times each one to `tools/list`:

```
PASS  n8n                     4.5s  24 tools
PASS  salesgenie-onboarding   2.9s   6 tools: get_intake_endpoint, …
PASS  salesgenie-operations   2.8s   6 tools: send_test_lead, …
```

Claude Desktop cancels any server that hasn't answered `initialize` within
**60 seconds**, and reports it to you only as "the MCP tools are not available" —
which looks identical to a platform outage but isn't one. This script separates
the two: if it passes, the tools work and the problem is elsewhere.

Servers must be launched as `node <absolute path>`, **never `npx -y`** — `npx`
re-resolves from the registry on every launch and blows the 60s budget when
several servers contend for one npm cache. See
`stories/done/BUG-007-mcp-tools-unavailable-npx-startup-timeout.md`.

Config changes take effect only after a **full quit from the system tray**.

## buyer-agent-demo.js — an external agent doing business over A2A

Plays the role of another organization's procurement agent transacting with a
SalesGenie tenant via the A2A protocol (see `docs/adr/0011-a2a-at-the-boundary.md`):

1. fetches the tenant's **Agent Card** (unauthenticated discovery),
2. submits a natural-language enquiry with `message/send` → gets a task id,
3. polls `tasks/get`, narrating every state transition — including
   **`input-required`** while a human reviewer at the seller approves the draft,
4. prints the final artifact: the approved reply + structured `recommended_products`.

### Usage

```
node scripts/buyer-agent-demo.js [business_id] ["enquiry text"]
```

Defaults: tenant `biz_oakember`, a 25-chair procurement enquiry. Examples:

```
node scripts/buyer-agent-demo.js
node scripts/buyer-agent-demo.js biz_pagebindbooks "We need 40 hardcover notebooks for a conference, budget Rs. 20,000, next month. Contact: events@acme.example"
```

While the script sits at `input-required`, the tenant's reviewer receives the
normal approval email — click **Approve** (or reject) there; the script sees the
outcome on its next poll.

### Configuration (env)

| Variable | Default | Meaning |
|---|---|---|
| `MCP_BEARER_TOKEN` | read from `../.env` | bearer for the RPC endpoint (demo posture: shared token; production: per-tenant keys) |
| `A2A_BASE_URL` | `http://localhost:5678/webhook` | n8n webhook base |
| `A2A_BUSINESS_ID` | `biz_oakember` | tenant (arg 1 overrides) |
| `A2A_ENQUIRY` | 25-chair enquiry | enquiry text (arg 2 overrides) |
| `A2A_AGENT_NAME` | `Northwind Procurement Agent (demo)` | how the buyer identifies itself |
| `A2A_POLL_SECONDS` / `A2A_MAX_MINUTES` | 10 / 30 | poll cadence / give-up window |

No dependencies — plain Node ≥ 18 (global `fetch`).

## preflight-publish.js — what would a stranger get if this repo went public?

```
node scripts/preflight-publish.js
```

Exits non-zero on anything that needs a decision. Four checks, because a secret hides in
four different places:

1. **Live values** — every secret-bearing variable in your real `.env`, searched for
   literally across tracked files. Stronger than pattern matching: not "does this look
   like a key" but "is THE key here". Config variables (hosts, ports, usernames, database
   names) are deliberately excluded — an early version flagged 40 files for containing
   "salesgenie", and a scanner that reports the database name as a leak teaches you to
   skim past the real one.
2. **Key-shaped strings** — OpenAI, Google, Langfuse, GitHub, Slack, AWS, JWTs, private
   key blocks, Postgres URLs with inline passwords. Documentation placeholders are
   recognised and skipped.
3. **Files that should never ship** — real `.env`, course PDFs, archives, video, keys.
4. **Anything ever committed** — the one people skip. `git rm` removes a file from the
   tree and leaves it perfectly readable in every clone of the history.

It also reports the author emails in commit metadata, which is the disclosure most easily
forgotten: scrubbing an address out of five markdown files while every commit carries it
in its author field achieves nothing.

What it cannot judge, and says so: screenshots, video frames, and real names in seed data.
