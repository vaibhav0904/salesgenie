# E13-S3: A five-minute video script anyone could film

**As the** presenter (Vaibhav)
**I want** a scene-by-scene ~5-minute script with timestamps, exact commands/clicks, on-screen focus, and narration lines
**So that** recording the demo video is a mechanical act, and the film shows all four DNA points live.

## Acceptance criteria
- [ ] `presentation/video-script.md`: 6 scenes (cold open, MCP onboarding + park/resume, email E2E + approval, A2A buyer agent, insights + AI health, close) within ~5:00.
- [ ] Pre-flight checklist: docker/workflow state, tenant states to stage, inbox readiness; fallback notes (approval timing, poll cadence).
- [ ] Every command dry-run verified read-only before the card closes (endpoints respond, files exist, staged states accurate).

## Eval gate
- dry-run log in the outcome note

## Outcome (2026-07-26)
Done. `presentation/video-script.md`: 6 scenes ≈5:00 with pre-flight checklist (incl. staging a never-seen tenant for the onboarding scene), per-scene Screen/Do/Say table, fallback notes, and a post-shoot checklist (both Approve clicks on camera; no secrets on screen).
Dry-run log (read-only): MCP tool names verified against WF-08/09 exports (create_business, get_setup_status, upload_catalog, set_reviewer, send_test_lead, get_lead_status…); seed-email payload format verified and script's curl path corrected (`data/seed-emails/email-01.json`); `insights-latest` GET → 200; A2A agent-card GET → 200; `scripts/buyer-agent-demo.js` present. Insights POST deliberately not fired during verification (state-changing).
