# BUG-007: Claude Desktop reports "MCP tools are not available"

**Severity:** critical (demo-blocking) — the entire MCP onboarding story (Scene 2 of the demo video, epic E8) is unreachable from chat. Nothing on the platform is broken; the client can't reach it.

## Symptom
Onboarding a business through Claude Desktop fails every time with "the MCP tools are not available". Persists in a fresh chat, in incognito, and with memory off — because none of those touch the cause.

## What was ruled out
The platform side is healthy. Verified 2026-07-29:

- `VaibhavCapstone-08-MCPOnboarding` and `-09-MCPOperations` are both **active**, on paths `vaibhavcapstone-onboarding` / `vaibhavcapstone-operations`, auth `bearerAuth`.
- A direct handshake against both endpoints returns HTTP 200 with a session id and the full **6 + 6 tools**.
- The trigger answers **every** MCP protocol version — `2024-11-05`, `2025-03-26`, `2025-06-18`, `2025-11-25` — in under 40ms, so this is not the protocol-version bump in newer Desktop builds.

## Root cause
`claude_desktop_config.json` launched all three MCP servers with `npx -y`:

```
npx -y mcp-remote http://localhost:5678/mcp/vaibhavcapstone-onboarding --header "Authorization: Bearer …"
npx -y mcp-remote http://localhost:5678/mcp/vaibhavcapstone-operations --header "Authorization: Bearer …"
npx -y dotenv-cli -e <path> -- npx -y n8n-mcp
```

`npx -y` re-resolves the package against the npm registry on **every** launch. Claude Desktop starts all three at the same instant against one shared npm cache, and gives each **60 seconds** to answer `initialize`. From the Desktop logs, all three hit that deadline to the second:

```
01:47:46.338 [salesgenie-onboarding] initialize id=0
01:48:46.353 [salesgenie-onboarding] notifications/cancelled     ← exactly 60.0s
01:47:46.421 [salesgenie-operations] initialize id=0
01:48:46.440 [salesgenie-operations] notifications/cancelled     ← exactly 60.0s
01:47:46.422 [n8n]                   initialize id=0
01:48:46.449 [n8n]                   notifications/cancelled     ← exactly 60.0s
```

The cache contention is visible in the n8n server's log, where npx could not even unpack its own package:

```
npm error code EBUSY
npm error EBUSY: resource busy or locked, rename '…/n8n-mcp/data/nodes.db' -> '…/.n8n-mcp-SaSfU2Lm/data/nodes.db'
```

Two aggravating factors in the same file:

1. **The `n8n` server's `.env` path had lost every backslash** — `C:UsersVaibhavSarafOneDrive - …salesgenie-version2.env` — so `dotenv-cli` could never have found it. A single-backslash Windows path was written into JSON, where `\U`, `\D`, `\C` are not valid escapes.
2. Driving `npx -y mcp-remote` by hand, *alone and with a warm cache*, still took **12s** to reach `initialize`. Three at once from cold is comfortably over 60s.

An earlier failure mode in the same log — `SSE stream disconnected: TypeError: terminated`, repeated dozens of times — is the same fragility: the proxy losing its long-lived stream and re-resolving through npx to recover.

## Fix
Take package resolution out of the startup path entirely. Install the three packages globally once, then point Desktop at concrete files with `node` — no `npx`, no `.cmd` shims (which spawn an extra `cmd.exe` on Windows):

```
npm install -g mcp-remote@0.1.37 n8n-mcp dotenv-cli
```

```json
"salesgenie-onboarding": {
  "command": "node",
  "args": ["C:\\Users\\…\\npm\\node_modules\\mcp-remote\\dist\\proxy.js",
           "http://localhost:5678/mcp/vaibhavcapstone-onboarding",
           "--header", "Authorization: Bearer …"]
}
```

`mcp-remote` is **pinned to 0.1.37**, the build proven working here; `npx -y` silently floated to whatever was newest, so the rig could change under the demo without a single edit.

The corrupted `.env` path is corrected in the same pass, and the bearer token was carried across programmatically from the old entry rather than retyped.

## Verification
All three servers launched simultaneously from the rewritten config — a cold-start simulation — driven with Claude Desktop's exact `initialize` (protocol `2025-11-25`, its UI-extension capability block), measured to `tools/list`:

```
PASS  n8n                     4.5s  24 tools
PASS  salesgenie-onboarding   2.9s   6 tools: get_intake_endpoint, get_setup_status,
                                             upload_catalog, set_reviewer,
                                             update_business_config, create_business
PASS  salesgenie-operations   2.8s   6 tools: send_test_lead, get_insights, reject_draft,
                                             approve_draft, list_pending_approvals,
                                             get_lead_status
```

Three consecutive runs: 2.8–4.6s against a 60s deadline, roughly a 15× margin. Config assertions confirmed only `mcpServers` changed; `preferences` and every other key are untouched. Previous config saved as `claude_desktop_config.backup-2026-07-29.json`.

**Still requires the user to fully quit Claude Desktop from the system tray and relaunch** — the config is read once at startup, so a running instance keeps the old broken entries.

## Note for the deck
This is a client-rig failure, not an architecture failure, and worth saying plainly if asked: the MCP server answered correctly throughout. What broke was package resolution on the client's launch path. It is also a fair argument for pinning every dependency that sits in a live demo's critical path.
