# E17-S2-public-setup-guide: Setup instructions any business can follow

**As** a business person with an n8n Cloud account
**I want** step-by-step free setup (Supabase database, own AI keys, import, chat onboarding)
**So that** my business runs SalesGenie without paying anyone or writing code

## Acceptance criteria
- [ ] Super simple English; every technical term introduced with a plain-words aside or absent.
- [ ] Every concept fully explained with a concrete example — nothing abrupt.
- [ ] Republished at the SAME artifact URL; repo file updated.

## Eval gate
- jargon sweep + fact cross-check in outcome note

## Outcome (2026-07-27)
Done. Guide rewritten for the public: primary path = n8n Cloud + Supabase free tier (browser SQL editor, no terminal), bring-your-own Gemini key (free) + optional OpenAI key (backup brain + examiner). Covers: DB creation + the 5 setup scripts + a2a_bearer insert; AI keys; importing the 14 workflows with the exact credential names the exports expect (Capstone-Postgres, Google Gemini(PaLM) Api account, OpenAI account, Capstone-SMTP, Capstone-IMA, Capstone-MCP-Bearer); the localhost→cloud address fixes (WF-02/09/13) and the harmless Ship-LF nodes; the dependency-ordered activation sequence (00→06→05→04→03→10→01→02→07…13); smoke test; the chat onboarding conversation with park/auto-resume; the A2A card; optional Langfuse Cloud (Step 8); plain-language troubleshooting. Republished at the same artifact URL.
