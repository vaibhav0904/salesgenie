# Session 3 — The Reader (WF-03 ClassifyExtract)

*Taught 2026-07-31. Hands-on + teach-back pending.*

## Core ideas

- One Gemini call answers two questions: real customer? (ENQUIRY/NOT_ENQUIRY/SPAM)
  and what do they want? (entities). Then the answer is inspected before trusting.
- **LLM = brilliant intern, not a function.** Same input ≠ same output. WF-03's
  architecture exists to keep the intern's moods out of the filing cabinet.
- **The LLM Call Quintet** (repeats at 6 call sites): Stamp (stopwatch) → Gemini
  (direct HTTP `generateContent`) → OpenAI fallback on error (different VENDOR,
  logged as itself) → LLM Result (normalize both vendors' shapes; record __model/
  __fallback) → Log LLM (Postgres `llm_calls`) + Ship LF (Langfuse), both fail-safe.
- Entry guards: Validate Envelope (bad routing slip → thrown to the firefighter
  with the file number on it); Fetch Lead `WHERE status='RECEIVED'` = the
  **already-processed stamp**: if the same file is delivered twice, the second
  delivery finds nothing to fetch and quietly stops — doing the job twice causes
  no damage. (Engineers call this "idempotency" — keep the stamp picture.)
- Landing: SPAM → DISCARDED_SPAM · NOT_ENQUIRY → DISCARDED_NOT_ENQUIRY ·
  ENQUIRY below `config.min_confidence` (tenant knob, default 0.6) → NEEDS_REVIEW ·
  else EXTRACTED → envelope → Qualifier. Both attempts invalid → NEEDS_REVIEW with
  `resume_from:'classify'` — AI failure is a product state, never a crash.
- 📌 S1 bookmark resolved: gazebo email (07) lands EXTRACTED on some replays,
  NEEDS_REVIEW on others — LLM confidence wobbles around the threshold.
  Nondeterminism isn't fixed; it's **contained** (validation + threshold + human).

## Q&A: "Why not the Basic LLM Chain node with output parser + fallback?"

Researched 2026-07-31 against the installed n8n 2.28.6 (source inspection in the
container) — recorded honestly, including a correction:

- **Fallback: Vaibhav was right, Claude's first answer was wrong.** ChainLLM in
  2.28.6 supports a fallback model (`fallbackLlm`, LangChain `withFallbacks`), and
  it can be cross-vendor. Not a differentiator.
- **Exact tokens: the real deal-breaker, verified.** The installed
  `@langchain/google-genai` maps `output_tokens = candidatesTokenCount` and never
  reads `thoughtsTokenCount` (grep: zero hits) — Gemini 2.5 Flash thinking tokens
  (billed as output, often the majority) are invisible → the historical 36×
  undercount. AND sub-node usage is unreachable from workflow expressions ("no path
  back to the referenced node" — open n8n feature request; Enterprise log streaming
  cited as only alternative). Direct HTTP returns full usageMetadata as node output
  → written to `llm_calls` as a per-call receipt.
- **Output parser: shape ≠ judgment.** Parser failure = node error; the product
  wants NEEDS_REVIEW + event + nagger (rebuild the landing anyway). Parser can't
  check tenant-config thresholds. Auto-fix mode makes hidden unmetered LLM calls.
- **Bottom line:** chain node could replace ~3 of 5 quintet roles; it cannot give
  thinking-inclusive per-call receipts or per-attempt failure accounting. Keep
  direct HTTP while cost observability is a headline requirement. Possible
  post-submission story: re-evaluate migration.

## Hands-on results (run 2026-07-31, in chat at Vaibhav's request)

Replayed 9/8/10 with lab-s3-* ids. All predictions correct:
- email-9 → SPAM @ 0.95 → DISCARDED_SPAM
- email-8 → NOT_ENQUIRY @ 0.90 → DISCARDED_NOT_ENQUIRY
- email-10 → **ENQUIRY @ 0.4** → NEEDS_REVIEW (below the 0.6 bar → parked for a
  human, not guessed, not discarded — the star result)
Punch-card: all gemini-2.5-flash, 3.8–7.1s, $0.0014–0.0032/call, schema_valid=t,
no fallback. Output tokens 484–1199 ≫ the short JSON answer = the invisible
thinking charges. Whole experiment ≈ half a US cent. The nagger (WF-11) should
email about the parked email-10 lead within 10 minutes.

## Teach-back — answered 2026-07-31, session closed ✅

1. **Double delivery** ✅ — "first run changes the status; second time, no
   operation happens on the lead." Exactly right.
2. **Different-company backup** ✅ — "if Google servers are down, retrying won't
   help; better to rely on another LLM."
3. **Garbage payload** ✅ mostly — right node (Valid Payload? false path) and
   right 400. Missed on first pass: the INTAKE_REJECTED row written to
   vaibhavcapstone_events before responding (covered in review). Also refined:
   TWO fields were missing (business_id and from_email).

Note: full session was re-taught twice for language simplicity (see
[[teaching-language-simplicity]] feedback) — final version delivered entirely
in chat in plain words; this file is the record, not the lesson.
