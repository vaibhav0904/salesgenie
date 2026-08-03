# Publishing the demo video — ready-to-use copy

Fill in after `exports/salesgenie-demo-full.mp4` and the teaser exist and
you've uploaded the full cut somewhere with a stable link (LinkedIn post, or
YouTube unlisted as a more embeddable mirror — your call).

---

## 1. README.md snippet

Paste this near the top of `README.md`, right after the intro paragraph
(before "## Three doors, one pipeline"). Replace `<FULL_VIDEO_URL>` with your
LinkedIn post link (or a YouTube link if you mirror it there).

```markdown
## See it work (90 seconds)

![SalesGenie demo](presentation/video-assets/exports/salesgenie-demo-teaser.gif)

▶ [Watch the full 4-minute demo](<FULL_VIDEO_URL>) — a business onboards by
chat, an enquiry self-resumes after setup completes, and another company's AI
buys from ours with a human still holding the approval.
```

Commit only the small teaser (`exports/salesgenie-demo-teaser.gif` and/or
`.mp4`) — both are gitignore-exempt since they live under `exports/`, not
`raw/`/`work/`/`audio/`. Confirm size stays under ~10MB before committing;
if the GIF is heavier than expected, drop its fps/scale in `assemble.js`'s
teaser step and re-run.

---

## 2. LinkedIn post copy

```
I built a sales platform that any business can join just by talking to it —
no forms, no admin screens, no code per tenant.

Watch it: a business onboards in one sentence, a customer enquiry parks
itself when the shop isn't ready yet (and un-parks itself the moment it is),
a reply only ever goes out after a human clicks Approve, and — my favourite
part — another company's own AI agent buys from it while still respecting
that same human gate.

Every number in this video is measured from the system's own database, not
estimated: 95.3% extraction accuracy, 100% of recommendations grounded in
real in-stock products, and AI cost tracked to the token.

Built on n8n, Postgres, Gemini + GPT-4o, fully local and free-tier.
Code + architecture docs: <GITHUB_REPO_URL>

#AI #AgenticAI #ProductManagement #Automation
```

Native-upload the mp4 to LinkedIn (don't post it as a link) — LinkedIn's
algorithm favors native video substantially over external links. Upload
`exports/salesgenie-demo-full.mp4` directly.

---

## 3. Cross-links (already added elsewhere in the repo)

- `learning/README.md` — points here for the video assets.
- `presentation/hero-demo-runbook.md` — points here as the video companion
  to the live-demo runbook.
