# E24-S1: Presenter companion deck + screenshot prep + verified demo environment

**As** Vaibhav, presenting SalesGenie for a LinkedIn + GitHub audience
**I want** a presenter-only script/action guide next to the public deck, screenshots for the highest-risk live segment, and a verified-ready demo environment
**So that** I can record the video in cuts without guessing what to say, what to click, or whether the system is actually in a clean state

## Acceptance criteria
- [x] `presentation/demo-deck-for-presenter.html` exists: same 14 slides
      (down from an original 16 — see Outcome)/order/visuals as
      `demo-deck.html`, each with a READ block (spoken script) and, on the
      5 live slides, a THEN SHOW block (numbered live steps, or screenshot
      references for Part 2).
- [x] `presentation/video-assets/screenshot-shot-list.md` exists: exact
      prompts to type into Claude Desktop for Part 2, and exact filenames
      to save each screenshot as.
- [x] `demo-deck.html` reviewed against the reconstructed script for
      drifted facts; any real inconsistency fixed.
- [x] Demo environment verified live: `salesgenie` reset to clean
      (Oak & Ember only) via `scripts/reset-demo-db.js`, `Capstone-Postgres`
      credential confirmed pointed at `salesgenie`, all 14 workflows
      confirmed Active, `scripts/verify-desktop-mcp.js` PASS.
- [x] A never-used business name is confirmed ready for Part 2, checked
      against actual `vaibhavcapstone_businesses` rows.
- [x] Old Sarvam-era video assets (`shot-list.md`, `narration-script.md`,
      `generate-narration.js`, `verify-narration.js`) marked superseded
      with a pointer to the new files.

## Depends on
- -

## Eval gate
- none — documentation/presentation deliverable + one-time environment
  prep, verified via `.tests.md` + Vaibhav's own read-through as UAT

## Technical notes
- Reuse, don't invent: Part 1 = `LearningLab-Replay` default `email_number:
  2` (seed email-02, leather sofa, ₹90k, biz_oakember). Part 3 =
  `email_number: 6` then `9`. Part 5 = `scripts/buyer-agent-demo.js`
  default args. Part 4 = the insights-latest webhook URL. All per
  `hero-demo-runbook.md` and `docs/metrics.md`, not re-derived from
  scratch.
- Part 2 screenshots reuse the already-tested prompt wording from
  `hero-demo-runbook.md` Scene 2 / old `narration-script.md` SEG-01–05.

## Outcome (2026-08-04)
Done. Both decks converged to 14 slides (down from an original 16 —
dropped a live-audience Q&A slide and two live-only backup slides once
Vaibhav clarified this is a solo recorded video, not a live presentation
with contingencies). `demo-deck-for-presenter.html` built fresh with a
READ block on every slide and a THEN SHOW block on the 5 live/screenshot
slides, plus a "Public deck — slide N of 14" badge on every slide after
Vaibhav reported the correspondence was unclear. `screenshot-shot-list.md`
written with exact prompts/filenames for the 9 Part-2 screenshots. Demo
environment verified live: `salesgenie` reset to Oak & Ember only,
`Capstone-Postgres` confirmed pointed at it, all 14 workflows Active (plus
found and deactivated a leftover `ZZ-TEMP-Dispatch03`), MCP servers PASS.
"Aurora Lamps" confirmed as a free business name for Part 2. Old
Sarvam-era assets marked superseded.

Two full-file audit rounds followed Vaibhav's feedback that reactive
single-line patches kept missing things: round 1 removed the
self-contradictory "recording" framing and reframed the close as a CTA;
round 2 (after Vaibhav rejected a GitHub/LinkedIn-specific close) removed
all platform-specific language, a leftover "Press → to begin" navigation
string, a 22s/19s internal inconsistency, and two false "Live" claims on
the screenshot-only Part 2 segment. A final round dropped "link below"
entirely from the closing slide (on-screen and spoken) since the deck
must stay reusable across any platform — Vaibhav will add the actual link
in whatever post he writes per-platform, not in the deck itself.
`presentation/design-handoff-prompt.md` written for a future visual-polish
pass; content/structure are frozen, only styling is open to that pass.

UAT: Vaibhav signed off — script confirmed natural, live-step references
confirmed accurate, slide correspondence confirmed clear. Screenshot
capture (acceptance criterion 2 was the shot list document, not the
screenshots themselves) and the actual recording are Vaibhav's own next
steps, done independently of this story using the finished script.
