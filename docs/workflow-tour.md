# One email's journey through SalesGenie — the whole system, told as a story

The best way to understand SalesGenie isn't a diagram — it's to follow one enquiry all the way through, and then meet the staff working around it. So here's our traveller:

> **Meera Nair**, operations head at BrightWorks Consulting, emails Oak & Ember Interiors:
> *"Hi, we are BrightWorks Consulting, setting up a new office in Pune for 12 people. We need ergonomic chairs and standing desks, budget around Rs. 2,50,000 total, ideally delivered within a month. Please share recommendations. — Meera Nair, Operations Head"*

Part 1 follows Meera's email start to finish. Part 2 introduces the other characters — the fixer, the nudger, the examiner, the robot door. Everything described is the real system's real behavior; if you're technical and want to poke it yourself, every test command lives in the appendix at the end.

---

# Part 1 · Meera's email, start to finish

## Stage 1 — Arrival: the email gets an identity

**The big picture.** Every enquiry — whether it arrives by email, from a website form, or from another company's AI — comes through one front door and is immediately written into the permanent record book, with a tracking number. From that instant, nothing that happens to it can ever be untraceable, and nothing can be lost: even if the whole system restarted a second later, Meera's enquiry would still be safely on record.

**What happens to Meera's email.** The mailbox watcher notices her unread email, lifts out the sender, subject and text, works out which business it belongs to (Oak & Ember — one mailbox can serve several businesses), and hands it to the front door. The record book now says: *new enquiry, from meera@…, received 10:42:07, tracking number assigned.* One clever safety habit here: the watcher ignores mail sent by the system itself — early in the project the system once caught sight of its own reply and started processing it as a new enquiry, a hall-of-mirrors loop that's now permanently guarded against. (That was Bug #1. It's in the logbook.)

## Stage 2 — Reading: what is this, and what are the facts?

**The big picture.** An AI reads each enquiry and answers two questions. One: is this a genuine customer enquiry, an advertisement, or spam? (Ads and spam are set aside — with a record, never silently.) Two: what are the facts? Name, company, budget, what they want, how urgent, where. The golden rule of this stage: **a blank is better than a guess**. If the email doesn't state a budget, the budget field stays empty. The AI is never allowed to invent a fact — and a separate examiner (you'll meet it in Part 2) checks daily that it never does.

There's also a modesty rule: the AI reports how *confident* it is. Below a set confidence level, it doesn't act on its own reading — the enquiry goes to a human with the original text attached. When one of my test emails was literal gibberish, that's exactly where it went.

**What happens to Meera's email.** In about four seconds, the form comes back: genuine enquiry, confidence very high. Name: *Meera Nair*. Company: *BrightWorks Consulting*. Budget: *₹2,50,000*. Wants: *ergonomic chairs, standing desks*. Urgency: *high — within a month*. Location: *Pune*. Phone number: *(blank — she didn't give one, so it stays blank)*. Nobody typed anything into a spreadsheet.

## Stage 3 — Scoring: how promising is this lead?

**The big picture.** Sales teams triage. SalesGenie scores every enquiry HOT, WARM or COLD — but deliberately *not* by AI intuition. The score is open arithmetic over the facts, with points the business itself can tune: points for a stated budget, more if that budget actually fits what's in the catalog, points for urgency, for asking about specific products, for being a company. The math is visible and repeatable; the AI's only job here is to write two or three plain sentences explaining the score to the sales team — citing only facts from the form, never new ones.

**What happens to Meera's email.** Valid enquiry +15. Named contact +10. Specific products +20. Budget stated +25, and it fits the catalog +15. High urgency +20. Total: **100 — HOT**, the strongest possible signal. The explanation reads like a colleague's note: *"B2B enquiry with a stated ₹2.5L budget that fits our range; urgent one-month timeline suggests a ready buyer."* If the same email had gone to a different business on the platform, it could have scored differently — each business sets its own weights. Same machinery, different judgment. That's the point.

## Stage 4 — Matching: only things that really exist

**The big picture.** This is where AI systems usually embarrass their owners — confidently recommending a product that doesn't exist, or one that sold out last week. SalesGenie makes that structurally impossible, with a two-lock design. Lock one: before the AI is even consulted, the record book is asked, *"what does this business actually stock, matching these needs and this budget?"* — and the AI is shown only that shortlist. It picks the best two or three and writes a reason for each. Lock two: at the moment of saving, every pick is checked against live stock *again*. Anything unverifiable is thrown out. If nothing survives, the honest answer is "we have no suitable product to offer" — a note to a human, and *no* reply drafted to the customer pretending otherwise.

**What happens to Meera's email.** The shortlist comes back with the chairs and desks Oak & Ember really has in stock within range. The AI picks three — the ErgoPro high-back chair (₹18,999) for the main workstations, the Atlas task chair (₹11,999) as the value option to cover twelve seats, and a standing desk — each with a one-line reason tied to Meera's needs. All three survive the second lock. In months of testing, across every enquiry ever processed — including the disaster drills — **every single recommended product, 39 out of 39, verified as real and in stock.**

## Stage 5 — Drafting: the reply, in the shop's own voice

**The big picture.** Now the AI writes the actual reply — in the business's configured tone (the furniture shop chose warm-craftsman; the bookstore that joined later chose playful-bookish, and each gets exactly their voice from the same machinery). The draft may use only the approved facts: the customer's name, the verified products, the real prices. Discounts, delivery promises, stock claims not in the facts? Forbidden — and the examiner checks.

**What happens to Meera's email.** Nineteen seconds after her email arrived, a complete draft exists: a warm greeting to Meera by name, the three products with prices and why each fits a 12-person Pune office, and an invitation to reply or visit. Nobody has written a word by hand.

## Stage 6 — The human gate: everything stops, on purpose

**The big picture.** The draft does not go to the customer. It goes to the business's named reviewer as an approval request — the customer's original message, the proposed reply, the product list, and two buttons: **Approve** and **Reject**. And the system *waits*. Minutes or days, it doesn't matter; the waiting draft sits safely in the record book (a restart changes nothing). Here's the part I'd tattoo on the architecture: **the sending machinery is only connected to the "approved" state.** There is no path — none — by which an unapproved draft can reach a customer. And the approval itself is guarded so that if two people approve simultaneously (or one approves in email while another approves in chat), exactly one action wins; a customer can never receive the reply twice.

**What happens to Meera's email.** The reviewer's phone buzzes at 10:42. They read the draft over coffee, think "good, but I'd have picked the same chairs," and press Approve at 10:51. The reply lands in Meera's inbox nine minutes after she asked — most of which was coffee, not computing. The reviewer's total labor: one read, one click. Rejection is just as real: in testing, one draft *was* rejected, and it went precisely nowhere.

## Stage 7 — Monday morning: the funnel explains itself

**The big picture.** Every Monday at 8:00, each business receives its weekly report by email: enquiries received, replies sent, response speed, the HOT/WARM/COLD mix, daily volume charts, top product interests — and a section most reports don't have: **what the AI itself cost and how well it behaved** (exact cost per enquiry, speed, and the examiner's quality marks). One rule governs the whole report: every number must be re-computable from the record book by anyone. The AI writes the narrative paragraph at the top, but it is handed the numbers — it is never allowed to do the math.

**What happens to Meera's email.** It becomes one tick in several charts: one more enquiry received, one more HOT lead, one more approved reply, response time nine minutes. And in the AI-health section, its four AI steps appear in the week's cost: about ₹0.62 total. The owner reads all of this without asking anyone to prepare anything.

---

# Part 2 · The staff around the assembly line

Six more characters work around Meera's journey. Each exists because of a question any careful owner would ask.

## The receptionist for new businesses — "how do I even join?"

There is no signup form. A business owner joins by *talking*, in a normal AI chat window: "Set up my shop — Page & Bind Books, a bookstore, playful tone." The system registers them and answers honestly about what's still missing ("no product list yet; no reviewer named"). The magic moment: if an enquiry arrives *before* setup is complete, it isn't an error — it **parks**, like a coat at a cloakroom, with a note saying what it's waiting for. The moment the owner pastes in their catalog and names a reviewer, the parked enquiry wakes up by itself, finishes its journey, and appears for approval. This was tested live: an entire bookstore went from non-existent to serving customers in one chat conversation, with zero new code.

## The daily walkie-talkie — "can I run this without opening anything?"

The same chat window runs the day: *"What's waiting for my approval?" · "Approve the first one." · "What's the story of that enquiry from Tuesday?" · "Show me my report now."* Every command works against the same guarded machinery as the email buttons — including the exactly-once approval protection.

## The nudger — "what if a human forgets?"

Some enquiries are deliberately routed to a person (low confidence, or no honest product to offer). The nudger checks a few times an hour and sends the reviewer a note about anything new that's waiting — one note per item, never a flood, never a lost item.

## The examiner — "who checks the AI's homework?"

A few times an hour, a *different company's* AI (OpenAI's, while the work is done by Google's — a student never grades its own homework) reviews every new AI output: were the extracted facts really in the email? Does the draft promise anything untrue? Marks go in the record book; anything scoring 2 out of 5 or below alerts a human instantly. It was tested with a sting: five lies planted in a copy of a draft — fake discount, invented delivery date, false stock claim. The examiner scored it 1/5, quoted all five lies verbatim, and the alert fired. Real marks on real work average 5.0, 5.0 and 4.9 out of 5.

## The robot door — "what if the buyer is an AI?"

Companies increasingly send AI assistants to do their purchasing. Every business on SalesGenie has a public "business card for AIs": another company's assistant can read it, submit an enquiry as a job ticket, and check progress. It even sees — honestly — *"a human reviewer is checking the proposed offer"* while your reviewer decides, and it receives the approved offer as tidy data its own systems can file. Behind this door is the *same assembly line* Meera's email used; every lock still locks. Bonus: while testing this door against the bookstore, the robot customer exposed a real search bug (asking for "journals" couldn't find the "Leather Journal" — plural vs singular). Logged, fixed, re-tested. Best tester on the team.

## The fixer, and the backup brain — "what about the truly bad days?"

If anything genuinely crashes, a dedicated fixer quarantines the affected enquiry (never silently lost), writes an incident entry with the tracking number, and emails a human. And if Google's AI service itself goes down? Every AI step has a **backup brain**: the same instructions are re-sent to an OpenAI model of the same price class, and the line keeps moving — with the record book honestly noting which brain did the work and its actual price. This was fire-drilled for real: with every Google connection deliberately cut, a fresh enquiry travelled the whole line on the backup — read, scored, matched to genuinely in-stock chairs, drafted, delivered for approval. The one exception, on principle: the examiner has no backup, because its only substitute would be Google — and Google must never grade Google.

---

*That's the whole machine: one assembly line, three doors, one human gate, one record book, and a small staff of guardians — all of it running identically for any business that joins by simply asking.*

---

# Appendix — for the technically curious

Everything above can be verified hands-on. Prerequisites: the docker stack running, workflows active, an inbox at hand.

**The chapter ↔ workflow map** (the n8n names, for readers of the actual flows):

| Story character | n8n workflow |
|---|---|
| The front door & record-book entry | VaibhavCapstone-01-Intake |
| The mailbox watcher (+ self-mail guard) | VaibhavCapstone-02-GmailAdapter |
| The reader (classify + extract facts) | VaibhavCapstone-03-ClassifyExtract |
| The scorer | VaibhavCapstone-04-Qualifier |
| The matcher (two-lock recommendations) | VaibhavCapstone-05-Recommender |
| The drafter + human gate | VaibhavCapstone-06-DraftHITL |
| The Monday report | VaibhavCapstone-07-WeeklyInsights |
| The receptionist (chat onboarding) | VaibhavCapstone-08-MCPOnboarding |
| The walkie-talkie (chat operations) | VaibhavCapstone-09-MCPOperations |
| The cloakroom wake-up call (parked leads) | VaibhavCapstone-10-ResumeParked |
| The nudger | VaibhavCapstone-11-NeedsReviewNotify |
| The examiner | VaibhavCapstone-12-LLMJudge |
| The robot door | VaibhavCapstone-13-A2AServer |
| The fixer | VaibhavCapstone-00-ErrorHandler |

**The full-system test — one afternoon, every capability, in order:**

1. **The assembly line end to end:** POST an enquiry and watch it reach your inbox in ~20 s:
```
curl -X POST http://localhost:5678/webhook/vaibhavcapstone-intake -H "Content-Type: application/json" \
  -d '{"business_id":"biz_oakember","channel":"webhook","external_id":"test-1","from_email":"you@example.com","from_name":"You","subject":"Desk enquiry","body":"Need 2 standing desks, budget Rs. 60,000, this month."}'
```
Before clicking Approve, check the AI telemetry (`SELECT call_site, model, latency_ms, cost_usd FROM vaibhavcapstone_llm_calls ORDER BY created_at DESC LIMIT 4;`) and the same trace in Langfuse (http://localhost:3100). Then Approve → the draft goes out.
2. **The mailbox watcher:** email yourself with `[enquiry]` in the subject; a lead appears without the webhook.
3. **Spam armor:** POST a lottery-spam body → set aside with a record; no draft, no email.
4. **The honest no:** POST an enquiry for "gazebos" → no invented product; lead lands in NEEDS_REVIEW; the nudger emails you within 10 minutes (or trigger it: `POST /webhook/…needs-review-run` equivalent — see WF-11's manual webhook).
5. **Birth of a business:** in your MCP chat, create a new tenant → ask what's missing → send a test lead → watch it **park** (`AWAITING_SETUP`) → paste a catalog + set reviewer → watch it **resume**.
6. **Exactly-once approvals:** approve the same draft twice (email + chat) — the second attempt is refused.
7. **The robot door:** `node scripts/buyer-agent-demo.js` → discovery → submitted → working → **input-required** (go click Approve) → completed with the artifact.
8. **The examiner:** `curl -X POST http://localhost:5678/webhook/vaibhavcapstone-judge-sweep` → fresh scores in `vaibhavcapstone_judge_scores` and as badges on Langfuse traces.
9. **The Monday report, now:** `curl -X POST http://localhost:5678/webhook/vaibhavcapstone-insights-run` then open `http://localhost:5678/webhook/vaibhavcapstone-insights-latest?business_id=biz_oakember`; reproduce one AI-health number by SQL.
10. **Fail-safe monitoring:** `docker stop docker-langfuse-web-1` → run a lead → pipeline unaffected → `docker start docker-langfuse-web-1`.

If all ten pass, you have personally verified every claim in this document.
