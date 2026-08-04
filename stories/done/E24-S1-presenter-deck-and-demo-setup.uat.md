# UAT: E24-S1 Presenter companion deck + screenshot prep + verified demo environment

1. Open `presentation/demo-deck.html` and `presentation/demo-deck-for-presenter.html`
   side by side. Step through both with → — confirm slide N always matches
   slide N, and the presenter copy's banner ("DO NOT SCREEN-SHARE") is
   clearly visible.
2. Read every slide's READ block aloud once, silently to yourself — confirm
   it sounds like something you'd actually say, not stilted copy. Flag any
   line that doesn't sound like you.
3. Read every THEN SHOW block — confirm each live step matches what you
   remember of the real system (LearningLab-Replay's email numbers, the
   buyer-agent-demo.js command, the insights URL). Flag anything that
   looks wrong before you're mid-recording.
4. Open `presentation/video-assets/screenshot-shot-list.md` — this is your
   next actual task before recording Part 2: run the 9 prompts in Claude
   Desktop for real, save the 9 screenshots into
   `presentation/video-assets/screenshots/` with the exact filenames
   listed. The presenter file already references these filenames.
5. Optional spot-check: confirm n8n shows 14 `VaibhavCapstone-*` workflows
   Active and `ZZ-TEMP-Dispatch03` no longer Active.

Sign-off: reply "UAT passed" (or tell me what's wrong) before this promotes
to `stories/done/` and gets committed.
