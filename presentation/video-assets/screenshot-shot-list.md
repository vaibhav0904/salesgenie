# Part 2 screenshot shot list — do this once, off-camera, before recording

Part 2 of the demo ("a business born by chat") uses screenshots instead of
live typing in Claude Desktop — decided because Claude Desktop's response
timing/ordering isn't reliable enough for a scripted take (see
`demo-deck-for-presenter.html` slides 6–7). This is the one prep task
before you can record those two slides.

**Save every screenshot into `presentation/video-assets/screenshots/`**
with the exact filename listed — the presenter file references them by
name.

## Before you start
- Fully quit and reopen Claude Desktop (picks up MCP tools fresh).
- New chat. Confirm the tools icon shows `salesgenie-onboarding` and
  `salesgenie-operations`.
- The demo database is already reset to just Oak & Ember (done via
  `scripts/reset-demo-db.js`) — `Aurora Lamps` does not exist yet, so this
  will genuinely create it.
- Crop/frame each screenshot to just the chat panel (question + Claude's
  full response) — no need to include your whole desktop.

## The 9 screenshots

| # | Type this | Screenshot the response as | What the response should show |
|---|---|---|---|
| 1 | `Create a new business on SalesGenie: Aurora Lamps, a lighting boutique. Warm, helpful tone, INR.` | `part2-01.png` | New `biz_...` id + intake webhook address |
| 2 | `What's Aurora Lamps' setup status?` | `part2-02.png` | profile ✓, catalog ✗, reviewer ✗ |
| 3 | `Send Aurora Lamps a test lead: someone furnishing a café who needs 12 pendant lamps, budget ₹40,000.` | `part2-03.png` | Lead accepted, processing |
| 4 | `What's the status of that lead?` | `part2-04.png` | `AWAITING_SETUP`, missing: catalog |
| 5 | `Upload this catalog for Aurora Lamps: Brass Pendant Lamp, lamps, 2999, 30 in stock; Rattan Hanging Light, lamps, 1899, 45; Smoked Glass Globe, lamps, 3499, 12.` | `part2-05.png` | Catalog accepted, 3 products loaded |
| 6 | (immediately after, same chat) `And what's that lead's status now?` | `part2-06.png` | Woke up on its own, real recommendations, parked again — missing: reviewer |
| 7 | `Set Aurora Lamps' reviewer to vaibhav0904@gmail.com.` | `part2-07.png` | Reviewer set, status → `PENDING_APPROVAL` |
| 8 | `Show me what's waiting for approval for Aurora Lamps.` | `part2-08.png` | The drafted reply, in Aurora Lamps' warm tone |
| 9 | `Approve it.` | `part2-09.png` | Confirmation the draft was approved/sent |

## After

Drop all 9 PNGs into `presentation/video-assets/screenshots/` and tell me
they're in — `demo-deck-for-presenter.html` slides 6–7 already reference
these exact filenames.

## If a response doesn't match

Claude Desktop is non-deterministic — if step 4's response reports the lead
further along than expected (e.g. it already resumed), or the wording
differs from the table above, that's fine: screenshot what you actually
got, and tell me so the presenter script's narration can be adjusted to
match reality rather than a script that doesn't fit what's on screen.
