# LinkedIn post

Upload the video natively — LinkedIn shows native video to more people than a link to one.
Put the links in your **own first comment**; posts with external links in the body get
throttled.

---

## The post

> I'm a product manager. I can't read a stack trace at speed, and I'm not going to pretend
> otherwise.
>
> That one fact decided how I built this.
>
> AI writes decent code now. I could have had it generate a service and it probably would
> have run. But the first time something broke at 11pm, I'd be staring at a log I didn't
> really understand, asking the model to explain its own bug back to me.
>
> So I built it as visual workflows in n8n instead, with Claude Code driving them over MCP.
> Fourteen of them. When an enquiry arrives I can watch it move — read, scored, matched
> against stock, drafted — and when a step fails I can open that step, see exactly what went
> in and what came out, and fix it myself.
>
> Slower to build. But it's the version I can stand behind.
>
> What it does: reads an enquiry, scores it, recommends only what's actually in stock,
> drafts a reply in the business's voice — then stops and waits for a human to click
> Approve. The send step cannot be reached any other way.
>
> Two doors I'm glad I built.
>
> A business sets itself up by talking to it. "Set up my pottery studio in Jaipur, warm and
> artisanal." Paste the product list. Say who approves replies. There is no settings screen
> anywhere in the system. That runs on MCP — the standard that lets a chat app safely
> operate other software.
>
> The second was an experiment: another company's AI can send an enquiry and follow it all
> the way to a quote, over an authenticated channel, seeing only the status of its own
> request and nothing about how the shop works inside. While a person is reviewing, the
> other agent is simply told a human is reviewing. That felt like the right shape for
> agents dealing with each other — useful, and fenced in.
>
> I measured three things, and the why matters more than the number:
>
> **Is it actually right?** 10 labelled emails, written before I'd tuned a single prompt,
> with a rule in the file saying never edit them to match the output. Classification 10/10
> across five runs. Extraction median 95.3%. It invented a fact once in five runs — on a
> gibberish email that had already been routed to a human — and I published that run too.
> I also had a second AI, from a different vendor, grade the first one's work. A model
> marking its own homework isn't marking.
>
> **How long does it take?** Under 30 seconds from enquiry to a draft waiting for approval.
> I don't know what your team's number is today. That's exactly why the system measures it.
>
> **What does it cost?** Well under a cent per lead, counted from the provider's own token
> usage. My first estimate was 36 times too low — these models think silently before they
> answer, and you're billed for the thinking.
>
> None of this replaces anyone. It takes the transactional half — reading, matching, typing
> the first draft — and leaves the judgement with the person who should be making it.

---

## First comment

> Code, architecture and the eval results — including the run where it did invent
> something: github.com/vaibhav0904/salesgenie
>
> The five-run eval table:
> github.com/vaibhav0904/salesgenie/blob/main/evals/results/2026-07-30-extraction-spread.md

---

## Every number in the post, and where it comes from

| Claim | Source |
|---|---|
| 10 labelled emails, labels written before prompts, never edited to match output | `evals/datasets/seed-emails-labeled.json` (the rule is in the file's own header) |
| Classification 10/10 across five runs | `evals/results/2026-07-30-extraction-spread.md` |
| Extraction median 95.3% | same — range 92.2–96.9% over five full replays |
| Invented a fact once in five runs, on gibberish already routed to a human | same — run 4, marked FAIL |
| A second AI from a different vendor grades the work | `n8n/workflows/VaibhavCapstone-12-LLMJudge.json` — OpenAI gpt-4o grading Gemini 2.5 Flash |
| A business sets itself up by chatting; no settings screen exists | `n8n/workflows/VaibhavCapstone-08-MCPOnboarding.json` — six onboarding tools over MCP |
| Another AI sees only its request's status, never the internals | `n8n/workflows/VaibhavCapstone-13-A2AServer.json` — bearer-authenticated; the buyer polls task states only. the demo client narrates it as *"the seller's internals are opaque to me — I only see task states"* (`scripts/buyer-agent-demo.js:91`), and a live run against a fresh install reached `input-required` exactly as designed |
| While a human reviews, the other agent is told exactly that | same — the approval gate surfaces as the protocol state `input-required` |
| Under 30 seconds to a draft awaiting approval | every measured run in the repo: 22s, ~30s, 31s, 37s |
| Well under a cent per lead | exact token accounting, `docs/adr/0012-observability-backend.md` |
| 36 times too low | same ADR — character-count estimates couldn't see Gemini's thinking tokens |

## Deliberately not claimed

- **No "humans take X hours" comparison.** There is no measured human baseline in this
  repo; `docs/metrics.md` calls its own figures "illustrative… to be replaced by real
  Week-0 data". The post turns this into the point instead — the system measures response
  time so a business can find its own number.
- **Not "19 seconds."** That figure is a single run, and the presenter deck itself says to
  quote the number you actually see. Every measured run clears 30 seconds.
- **No precise cost figure.** Observed cost per lead across the repo spans $0.00346 to
  $0.026, and one deck slide contradicts itself. "Well under a cent" survives the whole
  range; the 36× story is the stronger material anyway.
- **Not "4.9" for the judge's reasons score.** The source record says 4.82; 4.9 is a
  rounding that spread into the decks. The post gives no decimal at all.

## If you want a longer version

Material that didn't fit but is strong, in rough order of impact:

1. **The tamper test.** Five fabrications planted in a draft — invented discount, delivery
   promise, warranty, product, expiry pressure. The judge caught all five, quoted them back
   verbatim, scored it 1/5 and fired an alert.
2. **Why the judge has no backup model.** Every other AI step falls back to a second vendor
   if the first is down. The judge deliberately doesn't, because its only fallback would be
   Gemini grading Gemini. Your line for it: *"I'd rather the marking pause for an hour than
   be marked by the student."*
3. **BUG-010.** The published accuracy figure was 98.4% until it turned out the harness was
   grading a random one of four identical-timestamped replays. The honest spread replaced
   it everywhere. From the bug card: *"A metric that changes when you re-measure it was
   never a metric."*
