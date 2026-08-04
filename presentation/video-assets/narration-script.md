> **Superseded by [../demo-deck-for-presenter.html](../demo-deck-for-presenter.html)**
> — this was the TTS script for the abandoned AI-narration approach. The
> spoken lines were adapted into the presenter file's READ blocks where
> still accurate; kept here for reference, not current instructions.

# SalesGenie demo video — narration script

Fixed, pre-recorded narration (Sarvam TTS, `en-IN`), timed to real measured
footage from `presentation/video-script.md`. Each segment ID maps 1:1 to an
audio file in `audio/` and a beat in `shot-list.md`. Read each line as written —
these are TTS scripts, not talking points.

Numbers are pulled from `presentation/slides-content.md`'s scoreboard/evidence
table and the verified outputs in `video-script.md` (2026-07-29 run).

---

## SEG-00 — Cold open (title card, no live footage)

> "SalesGenie: a sales platform any business can join by talking to it. What
> you're about to see is not a mockup — it's running live, right now, on my
> own machine."

*(target ~9s)*

## SEG-01 — Take 1a: a business is born (Claude Desktop)

> "Watch a business that doesn't exist yet. I describe it in one sentence —
> Green Thumb, a garden retailer in Pune — and it's created. No form, no admin
> screen, no code written for it."

*(target ~11s — hold on the create_business response)*

## SEG-02 — Take 1b: it jumps the gun

> "Before the shop has even stocked its shelves, a real enquiry arrives — an
> office wanting fifteen planters. Watch what the system does with a customer
> it isn't ready to serve yet."

*(target ~9s)*

## SEG-03 — Take 1c: parked, not broken

> "It read everything — the name, the company, the forty-thousand-rupee
> budget, the three-week deadline. Then it stopped. Not an error: it's holding
> the enquiry until the shop is ready, because it refuses to invent products
> that don't exist."

*(target ~13s — hold on the AWAITING_SETUP / extraction detail)*

## SEG-04 — Take 1d: catalog + reviewer added

> "I add eight products and name a reviewer — still just by talking."

*(target ~7s, footage speed-ramped 1.5×)*

## SEG-05 — Take 1e: it wakes itself up

> "And here's the moment that matters: nobody told it to try again. The
> instant the shop was ready, it went back, found the enquiry it had parked,
> matched three real in-stock products to her exact budget, and drafted a
> reply — on its own."

*(target ~14s — wait footage speed-ramped ~2×, cut to the Gmail approval email arriving)*

## SEG-06 — Take 2a: an email, live

> "Now the platform's day-to-day: a real enquiry, forty desks and chairs,
> an eighteen-lakh budget, straight into the intake webhook."

*(target ~8s)*

## SEG-07 — Take 2b: the pipeline moves

> "Read. Facts extracted. Scored on this business's own weights. Matched
> against real stock. Drafted. About thirty-five seconds, start to finish."

*(target ~10s — footage speed-ramped ~3×, jump-cutting between 2-3 status polls)*

## SEG-08 — Take 2c: the stop

> "And then it stops. Everything a reviewer needs, on one screen: the
> enquiry, the extracted facts, the recommended products with prices — every
> one of them checked against live stock before it ever reached this draft."

*(target ~12s)*

## SEG-09 — Take 2d: the click

> "Nothing reaches a customer until a human clicks this. That's not a
> suggestion — the database itself only allows a send from an approved
> record."

*(target ~9s — hold on the Approve click)*

## SEG-10 — Take 3a: another company's AI

> "One more door. This is a different company's own purchasing software —
> it's never seen our system before. It reads our public listing, sends an
> enquiry, and gets a ticket to track."

*(target ~11s)*

## SEG-11 — Take 3b: input-required

> "Watch this status: input-required. That's the other company's AI being
> told, in the protocol itself, that a human has to act before this can go
> further. We don't hide that gate from machines — we advertise it."

*(target ~12s — hold on the input-required line)*

## SEG-12 — Take 3c: completed

> "One approval later, it completes — with a structured list of real products
> the other company's systems can file automatically. Two AI agents did
> business, and a person still held the pen."

*(target ~10s)*

## SEG-13 — Take 4: the report + the one stat that matters

> "Every business also gets this, automatically, every Monday: its funnel,
> its lead quality, and what the AI itself is costing — measured from the
> provider's own token counts, not estimated. Right now, that's a fraction of
> a US cent per enquiry."

*(target ~14s)*

## SEG-14 — Close (stat card, no live footage)

> "Ten out of ten on spam detection. Ninety-five percent extraction accuracy.
> One hundred percent of recommendations grounded in real, in-stock products.
> Every number here traces back to a database row you can query yourself.
> That's SalesGenie."

*(target ~14s)*

---

**Running total target: ~4:23** (263s), inside the 5-minute ceiling with room
for title/end-card padding.
