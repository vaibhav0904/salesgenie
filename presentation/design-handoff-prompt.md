# Design handoff — polishing demo-deck.html

Hand the prompt below (as-is, or lightly edited) to a design-focused tool
along with `presentation/demo-deck.html` itself. It's self-contained —
whoever/whatever receives it doesn't need any other context from this
project.

---

## The prompt

> I have a 14-slide HTML/CSS/SVG deck for a product demo video
> (`demo-deck.html`, attached). It's screen-recorded — I read a script
> aloud while this deck is on screen, then cut to a live application for
> parts of it, then cut back. The deck itself needs to look sharp and
> professional; I want you to improve its visual design.
>
> **Format constraints — do not break these:**
> - Must stay a single self-contained HTML file: inline `<style>`, inline
>   SVGs, no external stylesheets, fonts, images, or CDN/network calls of
>   any kind. It has to render correctly fully offline during a live
>   screen recording.
> - Must stay keyboard-navigable exactly as now: → / Space / PageDown
>   advances, ← / PageUp goes back, Home/End jump to first/last slide. The
>   existing JS at the bottom of the file does this — keep the mechanism,
>   restyle around it if you want.
> - Must support both light and dark mode (there's already a
>   `prefers-color-scheme` block and a `[data-theme]` override pattern —
>   keep both working).
> - **Exactly 14 slides, in this order, no additions or removals.** A
>   companion file (`demo-deck-for-presenter.html`) has a matching script
>   for each slide by position — if slide order or count changes, that
>   file breaks. If you think a slide should be split or merged, flag it
>   as a suggestion rather than doing it directly.
>
> **What's fully open to change:** typography, spacing, color refinement
> (keep both light/dark variants), the SVG diagrams' visual craft (they're
> currently fairly basic hand-drawn boxes-and-arrows — redraw them
> properly if you can), layout, subtle motion/transitions between slides
> (as long as they don't depend on anything beyond CSS/vanilla JS), and
> the overall visual identity. Make it look like a professional product
> demo, not a wireframe.
>
> **What must not change:** any of the actual text content — every number
> and claim on these slides has been independently fact-checked against
> the underlying system, so wording can be *restyled* (font, size,
> emphasis) but the substance must stay word-for-word identical. Don't
> paraphrase or "improve" the copy.
>
> **One specific trap on slide 9 (Part 4 — the weekly report).** That slide
> deliberately carries two *different* cost figures, and they are both
> correct:
> - the bar chart reads **$0.0002 vs $0.0074, "36× off"** — a fixed
>   historical finding about estimated vs metered cost. Those three numbers
>   are a matched set; changing any one makes the "36×" wrong.
> - the tile below reads **$0.0066 — "AI cost per enquiry this week"** —
>   the current week's live measurement, which must stay identical to a
>   live report page the viewer sees seconds later in the video.
>
> Do **not** reconcile, average, or unify these. They measure different
> things over different periods. Same for the tiles `4.2 s` and `5.0 / 5` —
> they mirror a live page exactly.
>
> Please return a complete, updated `demo-deck.html`.

---

## Slide inventory (what each of the 14 slides is for)

Useful to paste alongside the prompt — it tells the designer which slides
carry weight and which are quick transitions.

| # | Slide | Content type |
|---|---|---|
| 1 | Title — "A business is born, protected, and proven" | title + pill |
| 2 | The problem — mixed inbox | full-width SVG (before/after) |
| 3 | The idea — 14 workflows | full-width SVG (control room) |
| 4 | Part 1 intro — watch one enquiry | SVG timeline (~19 seconds) |
| 5 | What you just watched — the path | SVG pipeline recap |
| 6 | Part 2 — business born by chat | SVG (Aurora Lamps chat) |
| 7 | Part 2 continued — catalog, self-resume | SVG |
| 8 | Part 3 — trying to make it lie | SVG (out-of-stock + spam) |
| 9 | Part 4 — the weekly report | SVG bar chart **+ 3 number tiles** ⚠ see trap above |
| 10 | Part 5 — another company's AI buys | SVG (A2A handshake) |
| 11 | Why you can trust it — three checks | SVG |
| 12 | The test results — fixed answer key | number-heavy |
| 13 | Close — seven states | SVG / text |
| 14 | Thanks for watching | text only |

Slides 4, 6, 7, 8, 9, 10 are immediately followed in the recording by a cut
to a live application, so they read for only ~15–30 seconds each — they need
to land fast. Slides 2, 3, 11, 12, 13 are held longer while narrating.

Note the bottom-right slide counter and top progress bar **are visible in
the recording**. Restyle them if you like, but they should stay unobtrusive.

## Current visual system (for reference, in case it's useful context)

- Palette (light): paper `#FAF9F7`, ink `#20242B`, muted `#6E6A63`, line
  `#E2DFD9`, ember (accent) `#B4551D`, steel (accent) `#3D6C9E`, good
  (accent) `#2E7D53`.
- Dark-mode equivalents are already defined alongside each.
- Font: system UI stack (`"Segoe UI", Arial, sans-serif`).
- Each slide is a `<section class="slide">`; the active one gets `.on`
  (`display:flex`), everything else `display:none`.

## After the redesign comes back

1. Open it in a browser at roughly 1920×1080 (typical recording
   resolution) and step through all 14 slides with the arrow keys.
2. Check both light and dark mode.
3. Confirm nothing broke the keyboard nav or the slide count.
4. Tell me and I'll re-verify the content didn't drift, then update
   `demo-deck-for-presenter.html` if any visual changes affect the
   "on screen" descriptions presenter-side.
