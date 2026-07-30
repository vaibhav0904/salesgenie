# E14-S3: Truth-sync the artifacts, and give them a human voice

**As the** audience of the deck and video
**I want** every artifact updated to the exact-telemetry reality and rewritten as a person telling the story
**So that** nothing claims an estimate that is now exact, and nothing reads like a machine wrote it.

## Acceptance criteria
- [ ] ADR-0012 (dual-write: Postgres system of record, Langfuse the lens; why not LangSmith); ADR-0010 amended; `docs/traceability.md` updated.
- [ ] Deck republished at the SAME artifact URL: estimate caveats gone, Langfuse in slide A2, AI-health recomputed, full copy in first-person presenter voice; `slides-content.md` matches 1:1.
- [ ] `video-script.md` Scene 5 opens Langfuse live; `q1-interventions.md` + `metrics.md` evidence updated.
- [ ] CLAUDE.md: chars/4 gotcha replaced, Langfuse noted, <500 words. Exports refreshed + scanned.

## Depends on
- E14-S2

## Outcome (2026-07-26)
Done. ADR-0012 written (dual-write: Postgres system of record, Langfuse the lens; why not LangSmith); ADR-0010 amended; traceability.md carries the update banner; metrics/q1 evidence updated to exact figures ($0.0074/lead, p50 5.5s/p95 8.9s, judge 5.0/5.0/4.9); CLAUDE.md swapped the chars/4 gotcha for the exact-API + loop-pairing gotchas, added Langfuse to the stack, ~500 words.
Deck fully rewritten in first-person presenter voice and republished at the SAME artifact URL (version label "storyteller-exact-telemetry"): the estimate story became the limitations-slide confession ("estimates were 36× too low"), A2 is now the observability deep-dive with Langfuse and the tamper test told as a story, evidence table gained the swap-neutrality and kill-test rows. slides-content.md matches 1:1. Video script Scene 5 now opens the Langfuse trace UI live, with pre-flight updated.
