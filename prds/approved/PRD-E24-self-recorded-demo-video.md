# PRD-E24: Self-recorded demo video, in cuts
**Status:** Approved
**Date:** 2026-08-03

## Problem
Vaibhav is recording the SalesGenie demo himself (not AI-narrated — that
approach was paused earlier over Claude Desktop's non-determinism during
scripted recording). He'll screen-share `demo-deck.html`, read each slide's
script, then cut to the live app for that part, then cut back — every
transition is a separate take. `demo-deck.html`'s exact say/do script
existed once as embedded presenter notes but was deliberately stripped out
earlier this session, and was never preserved elsewhere in this deck's
current 16-slide/5-part shape. He needs it reconstructed, plus a way to
avoid live Claude Desktop risk where it bit him before, plus the demo
environment actually readied so he can start recording.

## Goals / Non-goals
**Goals:** a presenter-only companion file with the read-then-show script
per slide; screenshots (not live typing) for the highest-risk segment; the
demo database/workflows/MCP actually verified ready, not just described as
ready.

**Non-goals:** editing/stitching the final cut clips together (out of
scope until real footage exists); changing the deck's narrative (already
built, approved, working); any product/workflow change.

## Who this is for
Vaibhav, presenting SalesGenie for a LinkedIn + GitHub audience.

## Proposed scope → stories
- E24-S1: presenter companion deck + screenshot prep + verified demo
  environment, ready to record.

## Success criteria
Vaibhav can open `demo-deck-for-presenter.html` next to `demo-deck.html`,
follow it slide by slide without needing to ask what a step means, and the
live environment (`salesgenie` demo DB, all 14 workflows, MCP) is
confirmed working right before he starts.

## Open questions
None outstanding — scope was settled in conversation before this PRD was
written (Part 2 = screenshots, Part 1 = LearningLab-Replay, confirmed with
Vaibhav).
