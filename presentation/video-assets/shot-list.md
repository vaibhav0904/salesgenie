> **Superseded by [../demo-deck-for-presenter.html](../demo-deck-for-presenter.html)**
> and [screenshot-shot-list.md](screenshot-shot-list.md) — this file was
> built for the AI-narrated/4-take approach, since abandoned in favor of
> self-recording in cuts. Kept for reference (the Take structure/timings
> were real, verified footage plans), not current instructions.

# SalesGenie demo video — shot list (record this)

Narration is already recorded (Sarvam TTS, `audio/SEG-*.wav`) with **exact**
measured durations below. This is the one thing left for a human to do: record
the real system performing each beat, holding roughly the stated duration so
narration and footage line up in editing. I'll do 100% of the cutting, caption
burn-in, narration mix, and export once these raw clips exist in
`raw/` — you only need to record and drop files in.

**How to record:** `Win + Alt + R` starts/stops a full-screen recording via
Windows' built-in Xbox Game Bar — zero install. One raw clip per TAKE below
(4 clips total), not per segment — segments within a take are one continuous
recording. Don't worry about hitting durations exactly; a few seconds of slack
either way is fine, I speed-ramp dead time and trim in editing.

Save each raw clip into: `presentation/video-assets/raw/`
Suggested filenames: `take1.mp4`, `take2.mp4`, `take3.mp4`, `take4.mp4`
(If you'd rather send screenshots for any single beat instead of video, drop
them in the same folder named like `take1-beat3.png` and tell me which beat —
I'll build that portion as a still with a slow pan instead of live motion.)

---

## Pre-flight (same as your live demo — you've done this before)

- Docker green: n8n, Postgres, Langfuse.
- All 14 `VaibhavCapstone-*` workflows Active.
- Claude Desktop relaunched fresh (MCP tool cache).
- Gmail: archive old `[Approval needed]` / `[SalesGenie]` emails so the newest
  one is unambiguous.
- `Green Thumb` must not exist yet (Take 1 creates it — use a name you haven't
  used before if `biz_greenthumb` already exists from an earlier run; I'll
  adjust captions to match whatever name you actually use).
- Reference for exact commands/wording: `presentation/video-script.md` (Takes
  1–4) — this shot list is the condensed, timed version of that.

---

## TAKE 1 — raw/take1.mp4  (target ≈ 71s of action, narration = 55.1s across 5 beats)

| Beat | Seg | Narration (s) | On screen |
|---|---|---|---|
| 1a | SEG-01 | 12.4 | Claude Desktop, empty chat. Type the `create_business` message for the new garden-retail business. Hold on the JSON response ~3s. |
| 1b | SEG-02 | 11.6 | Type the `get_setup_status` question, THEN immediately the `send_test_lead` message with Ananya's planters enquiry (per video-script.md §1.2–1.3). |
| 1c | SEG-03 | 16.4 | Ask "What's the status of Ananya's lead?" — hold on the `AWAITING_SETUP` / extraction detail response ~5s. |
| 1d | SEG-04 | 3.7 | Type the catalog-upload message (the 8-row CSV block) — this is the fast beat, just show it sent + confirmed. |
| 1e | SEG-05 | 15.9 | Type "Set the reviewer..." message, THEN ask "What's the status of Ananya's lead now?" a few seconds later — cut to Gmail showing the new `[Approval needed]` email arriving. |

**Do not click Approve in Take 1** — leave that draft pending; Take 2 uses a
*different* fresh enquiry, and this one stays as visual proof the pipeline
reached the human gate.

---

## TAKE 2 — raw/take2.mp4  (target ≈ 40s, narration = 27.3s across 3 beats)

| Beat | Seg | Narration (s) | On screen |
|---|---|---|---|
| 2a | SEG-06 | 8.6 | Terminal: run the `curl.exe` intake command from video-script.md §2.1 with `demo-video-enquiry.json`. Hold on the instant `RECEIVED` response. |
| 2b | SEG-07 | 9.8 | Re-run the status-poll `psql` one-liner 3–4 times, a few seconds apart (§2.2) — jump-cut between polls in editing, just record all of them here. |
| 2c | SEG-08 | 14.0 | Gmail: open the new approval email, scroll slowly through enquiry → extracted facts → recommended products with prices → drafted reply. |

## TAKE 2b — append to raw/take2.mp4 or its own clip  (SEG-09, 9.8s)

| Beat | Seg | Narration (s) | On screen |
|---|---|---|---|
| 2d | SEG-09 | 9.8 | Same email — **click Approve**, hold a beat on the click, then show the reply landing (prefixed `[DEMO → …]`). |

---

## TAKE 3 — raw/take3.mp4  (target ≈ 37s, narration = 26.2s across 2 beats)

| Beat | Seg | Narration (s) | On screen |
|---|---|---|---|
| 3a | SEG-10 | 12.1 | Terminal: `node scripts/buyer-agent-demo.js`. Let it print through agent-card discovery + `message/send` + first couple of `working` polls. |
| 3b | SEG-11 | 14.1 | Hold on the **`input-required`** line the moment it prints — don't scroll past it, let it sit ~4s. |

## TAKE 3b — append or separate clip  (SEG-12, 12.5s)

| Beat | Seg | Narration (s) | On screen |
|---|---|---|---|
| 3c | SEG-12 | 12.5 | Switch to Gmail, open the new approval email, click Approve. Switch back to terminal — wait for the next poll to print `completed` + the structured product list. |

---

## TAKE 4 — raw/take4.mp4  (target ≈ 17s, narration = 17.4s, one beat)

| Beat | Seg | Narration (s) | On screen |
|---|---|---|---|
| 4a | SEG-13 | 14.0 (report) | Trigger the insights run (`curl.exe -X POST .../vaibhavcapstone-insights-run`), wait ~15-20s, open the report URL. Scroll: funnel → AI-health section, hold there. |

*(SEG-14, the closing stat-card line, needs no footage — I generate that as a
graphic, same as the cold open.)*

---

## What I generate myself (no recording needed)

- **SEG-00** (cold open, 11.2s) — title card, palette-matched to the deck.
- **SEG-14** (close, 17.4s) — evidence/stat card: 10/10 spam, 95.3% extraction,
  100% grounding, cost/lead — pulled from `slides-content.md`'s evidence table.

---

## After you record

Drop `take1.mp4` … `take4.mp4` (or however you split them — exact segment
boundaries don't need to be perfect, I'll find them) into
`presentation/video-assets/raw/` and tell me they're in. I'll handle
everything from there: trimming, speed-ramping dead time, caption burn-in,
narration mixing, title/stat cards, and both final exports (LinkedIn-ready
full cut + GitHub teaser clip).
