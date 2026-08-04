# 🎬 Hero Demo Runbook — "A business is born, protected, and proven — live"

> **Presenting? Use [demo-deck.html](demo-deck.html) instead** — it contains this
> entire script as click-to-expand panels behind story slides. This file is the
> prose archive.
>
> **Recording a video instead of presenting live?** See
> [video-assets/](video-assets/) — an AI-narrated, AI-edited short cut built
> from this same script, for GitHub + LinkedIn.

*Built 2026-08-01 from the learning sessions; every scene below was executed
successfully on the live system before being scripted here (Lumen Candles
lifecycle 31s end-to-end, out-of-stock grounding replay, insights URL, A2A buyer
demo with mid-poll approval).*

**One-sentence story:** watch a furniture business go from non-existent to
serving customers — AI does the work, humans hold the only pen that signs, and
every number leaves a receipt.

**Core time: ~12 minutes.** Props: **Claude Desktop** (left screen) and a
browser with **n8n + Gmail** tabs (right screen). Terminal only for the finale.

---

## 🧰 Stage setup — 15 minutes before

1. **Stack:** Docker Desktop → n8n, postgres, langfuse containers green.
   http://localhost:5678 logged in.
2. **MCP preflight (never skip):** `node scripts/verify-desktop-mcp.js` — all
   PASS. Then in Claude Desktop ask "what's the setup status of Oak & Ember?" to
   warm-verify the tools.
3. **Tabs pre-opened, in order:** n8n Executions list · canvas of
   `VaibhavCapstone-05-Recommender` · Gmail inbox · one blank tab.
4. **LearningLab-Replay** open in an n8n tab (lead injector; rewrites
   external_id to `lab-*` so evals stay clean).
5. **Inbox hygiene:** archive old `[SalesGenie]` / `[Weekly Insights]` mails.
6. **Shop name for the live run: one NEVER used before** (create_business
   re-uses the id for a repeated name). Script says **"Aurora Lamps"** —
   rehearse with other names, save Aurora for the day.
7. Zoom: n8n 125% · terminal 150% · Gmail 125%.

---

## Scene 1 — The map (1 min, no clicking)

Show the n8n workflow list (14 `VaibhavCapstone-*` workflows).

> "Fourteen workflows, one per employee of a back office: a front desk, a
> reader, an appraiser, a stockroom clerk, a letter-writer, a Monday reporter, a
> night auditor. They serve every business on the platform — nothing in them
> mentions any specific shop. Everything a shop IS lives in one database row.
> Let me prove that by creating a business, live, by talking."

## Scene 2 — A business born in conversation (4 min, Claude Desktop)

1. **"Create a new business on SalesGenie: Aurora Lamps, a lighting boutique.
   Warm, helpful tone, INR."** → new `biz_...` id + intake address.
2. **"What's Aurora Lamps' setup status?"** → profile ✓, catalog ✗, reviewer ✗.
   *"The system knows the shop is half-built. Watch what it does about it."*
3. **"Send Aurora Lamps a test lead: someone furnishing a café who needs 12
   pendant lamps, budget ₹40,000."** While it runs (~15s) flip to n8n
   **Executions** — workflows lighting up in sequence.
4. **"What's the status of that lead?"** → `AWAITING_SETUP`, missing: catalog,
   resume_from: recommend.
   > "Not an error. A promise: the moment the shelves exist, this file resumes —
   > exactly where it stopped. No AI was allowed to invent lamps for an empty
   > catalog."
5. **"Upload this catalog for Aurora Lamps: Brass Pendant Lamp, lamps, 2999,
   30 in stock; Rattan Hanging Light, lamps, 1899, 45; Smoked Glass Globe,
   lamps, 3499, 12."** Immediately: **"And what's that lead's status now?"**
   → woke within ~1 second, got real recommendations, parked again —
   missing: reviewer. *"It got exactly as far as the shop's setup allows."*
6. **"Set Aurora Lamps' reviewer to vaibhav0904@gmail.com."** → status →
   **PENDING_APPROVAL**.
7. **"Show me what's waiting for approval for Aurora Lamps."** Read the draft
   aloud — warm tone (4 minutes old), recommending only the three lamps
   (12 seconds old). Then: **"Approve it."**
8. Flip to Gmail: the customer reply arrives, subject stamped `[DEMO -> ...]`.
   > "A business went from non-existent to serving a customer — parked twice,
   > self-resumed twice, human-approved once — in about half a minute. And I
   > never opened the engine room."

## Scene 3 — Try to make it lie (2.5 min, LearningLab-Replay on Oak & Ember)

1. `email_number: 6`, Execute. *"This customer wants the Rosewood King Bed she
   saw in the showroom. It's out of stock — planted that way. An ordinary AI
   would promise it anyway."*
2. During the run, show the **Recommender canvas** — point at the two locks:
   pre-approved in-stock tray for the AI; shelf re-check at the moment of
   saving.
3. Result (approval email / `get_lead_status`): the draft offers the in-stock
   **Oakhaven Queen Bed** — the Rosewood appears nowhere.
   > "It never lies about the shelf. The AI is never asked 'what should we
   > recommend?' — only 'which of these real items fits?'"
4. Rapid-fire: `email_number: 9` (lottery spam) → discarded in seconds.
   *"And the noise never reaches a human."*

## Scene 4 — The honest Monday report (1.5 min, browser)

Open `http://localhost:5678/webhook/vaibhavcapstone-insights-latest?business_id=biz_oakember`

> "Every Monday each shop gets this. Funnel, hot-lead mix, approval rate — and
> the AI-health box: cost per lead (~$0.0074, ₹0.62), answer speed, and this line —
> a DIFFERENT company's AI re-reads every piece of work checking for invented
> facts: average ~5 out of 5, zero violations, across hundreds of checks.
> House rule: if a number can't be traced back to database rows, it doesn't
> ship."

## Scene 5 — Finale: a robot customer (3 min, terminal + Claude Desktop)

1. Run `node scripts/buyer-agent-demo.js biz_oakember`.
   *"Another company's procurement robot. It reads the shop's public business
   card — which literally says 'every offer is reviewed by a human before
   release' — sends an enquiry, and polls."*
2. States print: `working... working...` then **`input-required`** — freeze:
   > "My favorite moment in the system. The robot has just been told, in
   > protocol language: A HUMAN IS DECIDING. No approval, no offer. The rule
   > survives even when the customer is a machine."
3. In Claude Desktop: **"Anything pending for Oak & Ember? Approve the chairs
   one."** → terminal flips to `completed` and prints the artifact: prose offer
   + three real SKUs with prices.
   > "Robot-to-robot commerce — same pipeline, same locks, same human
   > signature. There is no second door."

## Scene 6 — Close (30 s)

> "Every enquiry is in exactly one of seven places — moving, sent, discarded,
> rejected, parked-and-nagged, parked-and-promised, or dead-lettered with an
> alert. That last drawer currently holds: zero. There is no eighth place.
> That's the product: AI speed, human authority, receipts for everything."

---

## ⏱ 5–6 minute version

Scene 2 (skip step 2) + Scene 3 (bed only) + Scene 5. Drop 1, 4, spam.

## 🛟 Break-glass playbook

- **Claude Desktop tools dead** → n8n-only Plan B: LearningLab-Replay to
  inject, Gmail approve/reject buttons, LearningLab-Data for statuses. Same
  story, different props.
- **Gemini hiccups mid-demo** → it's a feature: show the `llm_calls` receipt
  with `fallback_used = true` — "Google went down and OpenAI silently covered;
  the pipeline never noticed."
- **Pipeline feels slow** → never wait in silence: show the Recommender canvas
  or the Executions tab while narrating.
- **Shop-name collision** → same name = same business id (upsert); the live
  run uses a never-rehearsed name.

## 📣 One-liners (verbatim)

1. "Nothing about any shop lives in the workflows — a shop is a database row."
2. "Not an error — a promise." (AWAITING_SETUP)
3. "The AI is never asked what to recommend — only which of these real items fits."
4. "Two doors, one lock." (inbox + chat approval)
5. "A human is deciding — and the robot was told so, in protocol."
6. "If a number can't be traced to rows, it doesn't ship."
7. "There is no eighth place."
