# E8-S4: A half-configured business parks work instead of breaking

**As an** Operator who hasn't finished setup
**I want** incoming leads to be safely held at the first stage I haven't unlocked, then resume when I finish
**So that** I lose nothing during onboarding and never see a crash.

## Acceptance criteria
- [ ] A lead for a Business missing the catalog runs intake → classify → extract → qualify, then parks AWAITING_SETUP at the Recommender gate with `missing: ["catalog"]` recorded.
- [ ] `get_setup_status` shows the parked count and the unlock action.
- [ ] Completing the missing component (e.g. `upload_catalog`) automatically reprocesses parked leads from the gated stage; they run to completion without re-ingestion.
- [ ] Parked ≠ dead: AWAITING_SETUP leads appear in insights as "waiting on setup", not as errors.

## Depends on
- E8-S2, E8-S3, E5-S1

## Eval gate
- none (Scenario B in E10-S2 is the acceptance test)

## Technical notes
- Reprocess trigger: after any setup-mutating MCP tool succeeds, it invokes a "resume parked leads" sub-workflow for that business.

## Outcome (2026-07-26)
- Setup gates added: WF-05 parks at the catalog gate, WF-06 parks at the reviewer gate; both write AWAITING_SETUP with missing[] + resume_from + parked_at, and a LEAD_PARKED_AWAITING_SETUP event. Never an error, never a lost lead.
- VaibhavCapstone-10-ResumeParked (id wrGgSDQrj6djOd8C) un-parks only leads whose blocking gate is now satisfied and re-enters them at the right stage; called automatically by upload_catalog and set_reviewer.
- FULL LIFECYCLE VERIFIED on tenant B lead (school library bulk order): parked at catalog gate as HOT/100 with extraction+qualification intact -> upload_catalog -> auto-resumed -> grounded book recommendations (KID-004/002/003) -> re-parked at reviewer gate -> set_reviewer -> auto-resumed -> draft in the bookstore voice -> PENDING_APPROVAL. Zero workflow edits between tenants.
