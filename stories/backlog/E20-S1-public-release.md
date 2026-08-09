# E20-S1: Flip the repo public — as a stranger, not as the author

**As** a PM/engineer who found `github.com/vaibhav0904/salesgenie` cold,
**I want** the README quickstart to actually work on a machine that has never seen this project,
**so that** the public repo is evidence of the system, not just a description of it.

**Status:** **unblocked** (2026-08-08) — the demo video is recorded, cut, and published as
release `demo-v1`; the rig has been cleaned down (demo leads and Aurora Lamps removed,
scheduled workflows deactivated), so it is free to be disturbed now. Repo is **private**
until every box below is ticked.

## Acceptance criteria — all must pass before `--visibility public`

1. **Fresh-install smoke test, seedless.** Throwaway n8n + Postgres on alternate ports / own volumes (never touching the demo stack). Execute the README quickstart *verbatim*: migrations 001+003+004+005 (no 002), import per `n8n/workflows/README.md`, create a business over the tool webhooks (Route B), upload a catalogue (`stock_qty` header), set a reviewer, POST a lead → reaches `PENDING_APPROVAL`. Any instruction that fails gets fixed in the doc, not worked around. (Same discipline that caught BUG-009: the only catalogue path ever exercised before rehearsal was `items[]` — the CSV path in the docs had never been run.)
2. **Seed decision executed.** Seeds are already fictional + `.example`-scrubbed, so they are *safe* to keep as optional demo data; owner's stated preference is to remove them post-demo. Either way: `db/002`, `data/seed-emails/`, `evals/datasets` stay mutually consistent, and the eval section of the README still describes something a stranger can run.
3. **Numbers audit.** `grep -rn "98.4\|zero invented" README.md docs/ presentation/ evals/` returns nothing unannotated; every quoted metric traces to a file in `evals/results/`. (Story cards in `stories/done/` keep their as-reported historical figures — BUG-010 is the correction record beside them; ADR-0013 carries an inline annotation.)
4. **Secret scan** (`preflight-publish.js` pattern + live-value scan against `.env`) clean on the final tree; `git ls-files` contains no `.env`, no course PDF, no zip.
5. **Flip and verify:** `gh repo edit vaibhav0904/salesgenie --visibility public`, then in a logged-out/incognito browser: README renders, quickstart legible, no sensitive file reachable.

6. **Demo video privacy pass.** Release `demo-v1` becomes public the moment the repo does.
   The recording shows a real Gmail window during Part 1 (~2:45–3:53) and Part 3
   (~7:30–8:00): the account address, unread counts (Inbox 8,275, Promotions 2,691,
   Spam 180), folder/label names, and "1 of 10,556". No third-party message content was
   visible in the frames sampled during editing, but the full 12 minutes were not audited.
   Watch both passages before flipping, and re-cut or blur if anything personal is legible.
   The master is `presentation/video-assets/raw/full-take.mp4` (gitignored), so a re-cut
   costs nothing but time.

---

## Audit run 2026-08-09 — gates 3, 4 and 6

**Gate 1 (fresh-install smoke test): PASS**, by E20-S2's TC14–TC18 — 7 credentials and 14
workflows into a clean instance, business created over the tool webhooks, catalogue
uploaded, reviewer set, lead → `PENDING_APPROVAL` in ~30s, plus the A2A card and a weekly
report on that instance's own data. An unknown `business_id` was refused rather than
guessed.

**Gate 3 (numbers audit): PASS.** Four hits, all annotated: README:201 states the
hallucination exception inline, README:206 annotates the 98.4% figure, ADR-0013 carries
its historical-figure note, and `evals/results/2026-07-30-…` *is* the correction record.
Nothing in `presentation/`.

**Gate 4 (secret scan): the scanner did not exist.** `preflight-publish.js` was cited in
the criterion as though it did. Written; it asks four questions — live `.env` values in
tracked files, key-shaped strings, files that should never ship, and *files that were ever
committed*, since `git rm` hides a file from the tree while leaving it readable in every
clone.

- **Fixed:** `docs/06_Official_Presentation_Template.pdf` was tracked. `.gitignore`
  excluded its sibling (file 05) by exact filename, so the intent was never in doubt —
  file 06 was simply never added to the list. Untracked; the rule is now a pattern.
  `docs/presentation-template.md` now states the source is not redistributed.
- **No secret found.** No live `.env` value, no key-shaped string, nothing in `git ls-files`
  that shouldn't ship.

**Gate 6 (video privacy): audited the published cut, frame by frame** — 49 frames at 12s
intervals across all 9:47, with full-resolution zooms on every window that wasn't a slide.

- **Gmail, two passages (~2:55–3:10 and ~6:15–6:30 in the published cut).** Legible:
  `Inbox 8,275 · Drafts 5 · Purchases 415 · Social 92 · Updates 5,248 · Forums 754 ·
  Promotions 2,691 · Spam 180`, `1 of 10,556`, and the label names
  `[Gmail]/Trash/shopping …`, `[Imap]/Sent`, `[Imap]/Trash`. **No third-party message
  content is visible in either** — both frames show a single open message, which is
  SalesGenie's own generated reply, never the inbox list. The card's concern was correct
  and is now measured rather than sampled.
- **NOT anticipated by this card — the terminal prompt.** Part 5 (~7:15–8:25, roughly 70
  seconds) shows, sharp and readable:
  `PS <your project folder>\…`
  That is the Windows username and the **employer's OneDrive tenant name**.
- **It correlates with the commit metadata**, which is the same disclosure by another
  route: `<work email address>` on 25 commits (<employer> runs the
  National Entrepreneurship Network) and `vaibhav0904@gmail.com` on 2. Publishing a repo
  publishes its metadata.

### Open decisions — none of these are mine to make

1. **Employer disclosure.** The video's terminal path and the commit author email both
   name where you work. Fine if intended; if not, the video needs a re-cut or a blur over
   the prompt line, and the commits need rewriting.
2. **History rewrite, or not.** The course PDF is untracked but still in history, as is
   every author email. Removing either means rewriting every commit — which changes all
   SHAs and orphans the `demo-v1` release tag. Accepting them is entirely reasonable;
   what is not reasonable is scrubbing the five doc mentions of the gmail address and
   *calling* it removed while history carries it.
3. **Gate 2, the seed decision**, is still unmade: keep `db/002` as optional demo data
   (the docs already describe it that way and the compose loads it), or remove it.

## Also before any public screenshot / on-camera n8n screen
- Deactivate or delete `ZZ-TEMP-Dispatch03` (leftover test workflow, webhook-only, still Active).
  — done 2026-08-07, confirmed still inactive 2026-08-08.

## Non-goals
- BUG-009 product fix (CSV header aliases + reporting ignored columns) — separate card, may land before or after the flip.
- E19-S2 Code→Set conversions — after the video, unrelated to visibility.
