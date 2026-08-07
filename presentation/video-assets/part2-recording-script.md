# Part 2 — recording script (live capture in Claude Desktop)

Part 2 of the demo ("a business born by chat") is recorded **live**: you type
each prompt below into Claude Desktop on camera and let the real response come
back. Nine prompts, in order, split across presenter slides 6 and 7.

Take cuts freely between prompts — Part 2 does not have to be one continuous
take. Cutting while a response streams is normal and reads fine.

## Before you start

- Claude Desktop fully quit and reopened (picks up MCP tools fresh).
- New chat. Confirm the tools icon lists `salesgenie-onboarding` and
  `salesgenie-operations`.
- **"Aurora Lamps" must still be unused.** `create_business` re-uses the id for
  a repeated name, so the *first* time you say it is the only clean take. If
  you want to rehearse the whole sequence end to end, rehearse with a throwaway
  name (e.g. "Lumen Candles") and save Aurora Lamps for the real recording.
- Frame the capture on the chat panel — the question and Claude's full response.

## The nine prompts

| # | Slide | Type this | What the response should show |
|---|---|---|---|
| 1 | 6 | `Create a new business on SalesGenie: Aurora Lamps, a lighting boutique. Warm, helpful tone, INR.` | New `biz_...` id + intake webhook address |
| 2 | 6 | `What's Aurora Lamps' setup status?` | profile ✓, catalog ✗, reviewer ✗ |
| 3 | 6 | `Send Aurora Lamps a test lead: someone furnishing a café who needs 12 pendant lamps, budget ₹40,000.` | Lead accepted, processing |
| 4 | 6 | `What's the status of that lead?` | `AWAITING_SETUP`, missing: catalog |
| 5 | 7 | `Upload this catalog for Aurora Lamps: Brass Pendant Lamp, lamps, 2999, 30 in stock; Rattan Hanging Light, lamps, 1899, 45; Smoked Glass Globe, lamps, 3499, 12.` | Catalog accepted, 3 products loaded |
| 6 | 7 | (same chat, straight after) `And what's that lead's status now?` | Woke on its own, real recommendations, parked again — missing: reviewer |
| 7 | 7 | `Set Aurora Lamps' reviewer to vaibhav0904@gmail.com.` | Reviewer set, status → `PENDING_APPROVAL` |
| 8 | 7 | `Show me what's waiting for approval for Aurora Lamps.` | The drafted reply, in Aurora Lamps' warm tone |
| 9 | 7 | `Approve it.` | Confirmation the draft was approved/sent |

Let each response finish before typing the next — prompts 4 and 6 are the whole
point of the segment (parked, then self-resumed), so give them room.

## If a response doesn't match

Claude Desktop is non-deterministic. If step 4 or 6 reports the lead further
along than expected, or the wording differs from the table, that is not a
failure — the narration on slides 6–7 is written loosely enough to fit. Say
what is actually on screen rather than the scripted line, or retake that one
prompt. Tell me if a response contradicts the script and I'll adjust the deck.

Prompt 7 sets the reviewer to your real Gmail, so Aurora Lamps' approval mail
lands in your inbox — the same address Oak & Ember now uses.
