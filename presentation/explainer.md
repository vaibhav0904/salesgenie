> **Superseded by [demo-deck.html](demo-deck.html)** — the markdown twin of
> `deck.html`'s plain-English narrative (E17-S1). Kept in place for history,
> not current presentation material.

SalesGenie v2 — The Full Story, in Plain English

Applied Agentic AI for PMs · Capstone #1 · Vaibhav Saraf · July 2026

# SalesGenie: the full story, in plain English

The assignment asked me to build an AI sales assistant for one furniture company. I built something bigger: a system that any business can join and use — the furniture company just happened to be its first customer. This document explains everything I built, why I built it that way, and what each piece is worth — with real examples all the way through. No jargon without a translation. Take whatever you need for your own slides.

Contents

1. The problem: a sales team drowning in email

2. What I built, in one picture

3. The journey of one enquiry, minute by minute

4. Any business can plug in — the chat-based setup, and why it matters

5. When two companies' AIs do business with each other

6. Watching the AI like a finance team watches spending

7. The AI that checks the AI's work

8. What happens when things go wrong

9. How well it actually works — and how I know

10. What it doesn't do yet, honestly

11. Appendix: where every claim can be checked

## 1 · The problem: a sales team drowning in email

Picture the sales inbox at Oak & Ember Interiors, a furniture retailer. Every day, enquiries arrive: a company wants 25 office chairs, a young couple wants a dining table, someone wants a bed "urgently, this month". Mixed in with these are advertisements, vendor pitches, and plain spam.

Today, a person reads every one of those emails. They decide which ones are real customers. They copy the sender's name and company into a spreadsheet, by hand. They look the person up online. They try to remember which products fit the budget mentioned. Then they write a reply — if the email doesn't get forgotten first.

This is slow (a customer might wait a day to hear back), error-prone (hand-typed spreadsheets are full of typos and duplicates), and inconsistent (which products get recommended depends on which staff member answered). And now the company has cut the sales team by 7%. Fewer people, same inbox.

### What "fixed" has to mean

- Speed: a customer gets a useful reply in minutes, not hours or days.

- No typing: names, budgets, and needs get captured automatically, correctly, every time.

- No made-up products, ever: the reply only offers things that really exist and are really in stock. One wrong promise to a customer costs more than a hundred fast replies earn.

- A human stays in charge: nothing is sent to a customer unless a real person has read it and pressed Approve.

- The boss can see everything: a weekly report shows how the funnel is doing, without anyone building a spreadsheet.

My constraints: everything had to run free of cost, on ordinary tools, with no custom app or website to build — and no scraping people's LinkedIn profiles (it's against LinkedIn's rules and collects personal data we don't need).

## 2 · What I built, in one picture

Think of SalesGenie as a small, very disciplined back office that runs the sales inbox. It has:

- Three doors that enquiries can come through: ordinary email, a chat window (for the business's own staff), and a special door where another company's AI assistant can walk in and do business (more on that magic in chapter 5).

- One assembly line behind all three doors: read the enquiry → pull out the facts → score how promising it is → match it to real, in-stock products → write a draft reply.

- One human gate at the end of the line: the draft stops and waits until a real person approves it. Only then does anything reach a customer.

- One ledger underneath everything: a database (an organized, permanent record book) where every enquiry, every decision, every AI action, and every approval is written down. If it matters, it's in the ledger.

[DIAGRAM: three doors (email / chat / other companies' AIs) into one assembly line with a human approval gate, the chat control room above, the permanent ledger below]

Three design rules shaped everything, and I never broke them:

- One assembly line for every business. When a new business joins, we don't build them anything. Their name, their products, their tone of voice, their scoring preferences — all of it is just settings. The furniture shop and the bookstore run on the exact same machinery. There isn't a single line anywhere that says "if this is Oak & Ember, do something special".

- If it matters, it's in the ledger. The workflow engine I used forgets everything between runs — so anything worth keeping is written to the permanent record book immediately. A nice side effect: even if the whole system restarts, a reply waiting for approval is still waiting for approval. Nothing is ever lost in memory.

- Doors are just doors. The assembly line never knows or cares which door an enquiry came through. That's what made it cheap to add door 3 (other companies' AIs) later — I didn't touch the line at all, I just built another entrance.

Tools, in one breath (feel free to skip): the assembly line runs on n8n, a visual automation tool where you connect steps like flowchart boxes. The ledger is Postgres, a battle-tested free database. The "reading and writing" intelligence is Google's Gemini AI model, with OpenAI's models as the quality-checker and the emergency backup. Everything runs on one ordinary computer, free of cost.

## 3 · The journey of one enquiry, minute by minute

Let's follow a real example from start to finish. Meera, the operations head at a consulting firm, emails Oak & Ember:

— The email that arrives —

"Hi, we are BrightWorks Consulting, setting up a new office in Pune for 12 people. We need ergonomic chairs and standing desks, budget around Rs. 2,50,000 total, ideally delivered within a month. Please share recommendations. — Meera Nair, Operations Head"

Second 0 — arrival. The email is picked up and logged in the ledger. From this moment, Meera's enquiry has an identity — a tracking number that follows it everywhere, like a parcel. Nothing that happens to it can ever be untraceable.

Seconds 1–5 — reading. The AI reads the email and answers two questions. First: is this actually a customer enquiry? (as opposed to spam or a vendor pitch — those get set aside, with a record kept). Second: what are the facts? It fills out a form: name Meera Nair, company BrightWorks Consulting, budget ₹2,50,000, wants ergonomic chairs, standing desks, urgency high — within a month, location Pune. One strict rule here: if a fact isn't in the email, the field stays blank. The AI is never allowed to guess a phone number or invent a company name. An empty field is a correct answer; a made-up one is a firing offence.

Seconds 5–10 — scoring. Now, how promising is this lead? Here I deliberately did not let the AI decide by feel. The score comes from simple, visible arithmetic that the business itself can tune — points for having a stated budget, points if that budget actually fits the catalog, points for urgency, points for being a company rather than a casual browser. Meera ticks almost every box: her enquiry scores 100 and is labelled HOT. The AI's only job at this step is to write two or three sentences explaining the score in plain language for the sales team — and it may only mention facts that are actually on the form.

Seconds 10–15 — matching against real stock. This is the step where most AI systems embarrass themselves, so I built it back-to-front. The AI does not get to browse and suggest whatever sounds nice. Instead, the ledger is asked first: "Which products does this business actually have, in stock, that fit chairs/desks and this budget?" Only that shortlist — real products with real prices — is shown to the AI, which picks the best two or three and explains why each fits Meera. And then, belt and braces: before anything is saved, every picked product is checked again against live stock. A product the AI dreamed up simply cannot survive this. In every test I ran — and I ran the check across every recommendation the system ever made — exactly 100% of recommended products were real and in stock.

Seconds 15–19 — drafting. The AI writes a warm, professional reply in Oak & Ember's own tone of voice (the tone is a setting, remember — a bookstore joining later chose a playful, bookish voice, and gets exactly that). The draft may only use the approved facts: Meera's name, the chosen products, their real prices. It is forbidden to invent discounts, delivery dates, or stock promises.

Second 19 — everything stops. On purpose. The draft does not go to Meera. It goes to a reviewer at Oak & Ember, as an email with the customer's request, the proposed reply, the recommended products — and two buttons: Approve and Reject. The system now waits. Minutes, hours, days — it doesn't matter; the waiting draft is safe in the ledger. This gate is not a setting that can be switched off. The sending machinery is physically connected only to the "approved" state — there is no wire from anywhere else to "send".

The click. The reviewer reads it and clicks Approve. The reply goes to Meera. Total human effort spent: reading one email and one click — instead of reading, researching, typing, and composing. The staff member's job changed from doing the work to checking the work.

Monday morning. Meera's enquiry appears in the weekly report the owner receives: how many enquiries came in, how many got replies, how fast, which product types are hot, plus — unusually — a section on what the AI itself cost and how well it behaved that week (chapters 6 and 7 explain that part).

Why this matters: the pipeline turns a day's delay into a 19-second draft, eliminates hand-typing entirely, and physically cannot make two classes of mistake — inventing a product, and emailing a customer without human sign-off. The people saved by automation aren't replaced; they're promoted to editors.

## 4 · Any business can plug in — the chat-based setup, and why it matters

Here's the twist that takes this beyond the assignment. Everything in chapter 3 was about a furniture shop — but nothing in the system is about furniture. So I made joining the platform a conversation, not a software project.

Plain words for one term: the chat setup works over MCP — think of it as a standard wall-socket that lets a chat app (like Claude, or others) safely operate outside tools. The business owner talks to their normal AI chat app; behind the scenes, the chat app "plugs into" SalesGenie and does the actual setup work. The owner never sees a settings screen, because there isn't one.

### The proof: a bookstore that didn't exist

To prove any business can join, I onboarded a second, completely different company — live, by chatting. Here's how it actually went:

— The owner types, in a normal chat window —

"Set up my business: Page & Bind Books, a bookstore. Our tone is playful and bookish."
SalesGenie answers (via the chat)

"Done — Page & Bind Books is registered. But you're not ready to go live yet: you haven't given me a product list, and no one is named as the reviewer who approves replies."

Notice the honesty: the system doesn't pretend you're ready when you're not. And here's my favorite detail. Suppose an enquiry arrives right now, before the setup is finished? I tested exactly that:

— What happened to the too-early enquiry —

A test customer asked for notebooks. The system read it, pulled out the facts, scored it — and then, reaching the step that needs a product list, it parked the enquiry, with a note: "waiting for this business to add a catalog." Not an error. Not lost. Parked — like a coat checked at a cloakroom.

The owner then pasted their product list into the chat and named a reviewer. The moment the last missing piece arrived, the parked enquiry woke up on its own, finished its journey, and landed in the reviewer's inbox for approval. Nobody had to resend anything.

From that moment, the bookstore had the entire machine: the reading, the scoring, the stock-checked recommendations (in their playful voice, from their shelves), the human gate, the Monday report. Total new code written for them: zero. Their whole existence in the system is one settings record.

The same chat window also runs the daily business: "What's waiting for my approval?" — "Approve the first one" — "What's the story of this enquiry?" — "Show me my weekly report." Every one of those is a real, working command. And approvals are guarded so that if two people (or an email click and a chat command) try to approve the same draft at the same time, exactly one wins and the other is told "already decided" — a customer can never receive the same reply twice.

Why this matters: "any business can join by talking" changes what this is. A sales assistant for one company is a project; a platform where the next thousand businesses onboard themselves is a product. The cost of customer number 2 was zero — that's the whole growth model, built into the architecture instead of promised on a slide.

## 5 · When two companies' AIs do business with each other

This is the most futuristic part, so let me set the scene properly, because it's coming faster than it sounds.

Imagine Windsor Hotels is furnishing a new property. Increasingly, companies like Windsor give their purchasing department an AI assistant: "find us 25 good ergonomic chairs within ₹3,00,000, delivered in 4 weeks." That assistant's job is to go out, find suppliers, ask for quotes, and bring back options. The question is: when Windsor's AI comes knocking, can your business answer? Most businesses today can't — their only doors are a human-read inbox and a website built for human eyes.

Plain words for one term: A2A ("agent-to-agent") is a shared etiquette two companies' AI assistants can use to talk to each other — like the standard forms two companies exchange for a purchase order, but for AIs. One AI can discover another, hand over a task, check on its progress, and receive the result in a structured, machine-readable way.

### What actually happens, step by step

Every business on SalesGenie automatically gets a public business card for AIs — a small page an AI can fetch that says, in machine-readable form: "I am the sales agent for Oak & Ember Interiors. You can send me product enquiries. A human reviews every offer before it's released." That last sentence is on the card on purpose — we advertise the human gate, we don't hide it.

Here is a real exchange from my testing — a pretend "Windsor procurement AI" I wrote, talking to Oak & Ember's sales agent. The left side is what the machines said; read my translation next to each line:

What the machines said | What it means in plain words | 

fetch agent card → "Oak & Ember Interiors Sales Agent" | Windsor's AI reads the business card and knows who it's talking to and what it can ask for. | 

message/send: "We need 25 ergonomic chairs, budget ₹3,00,000, within 4 weeks" → task accepted, state: submitted | The enquiry is handed over like a job ticket. Windsor's AI gets a ticket number to check on. | 

state: working — "progressing through the pipeline" | Behind the scenes this is the exact same assembly line from chapter 3 — reading, scoring, matching real stock. Windsor's AI just sees "being worked on". Our internal machinery stays private. | 

state: input-required — "a human reviewer is checking the proposed reply" | My favorite moment in the whole project. The human gate is visible to the other company's AI. It knows a person is checking the offer — and it waits. No approval, no deal. | 

state: completed — with the approved reply + a structured list: CHR-001 ErgoPro ₹18,999 · CHR-002 Atlas ₹11,999 · CHR-003 Verve ₹6,999 | A real person clicked Approve, and Windsor's AI receives the offer two ways at once: a human-readable letter, and a tidy data list its own purchasing systems can compare, rank, and file — no human on their side had to read anything either. | 

And because door 3 leads to the same assembly line, every safety rule held automatically: the recommended chairs were checked against real stock, the reply was in Oak & Ember's voice, a human approved the send, and the whole exchange is in the ledger.

One more honest detail. I first asked myself whether the system needed this AI-to-AI language internally, between its own steps — and the answer was no: my own steps live in one machine and trust each other; adding diplomatic paperwork between them would be pure overhead. The etiquette earns its keep only at the boundary, where the other party is a stranger — another organization's AI. I wrote that reasoning down as a formal decision, because knowing where not to use a technology is as important as using it.

Why this matters: this is a sales channel that didn't exist before — buyers whose AI does the shopping. When Windsor's assistant shortlists suppliers at 2 a.m., businesses on SalesGenie are open; everyone else's inbox is asleep. And the bonus nobody expected: while testing this door against the bookstore, the demo found a real bug (a search for "journals" couldn't see the product "Leather Journal A5" — plural vs singular). We logged it, fixed it, and re-tested. The robot customer turned out to be our best tester.

## 6 · Watching the AI like a finance team watches spending

The assignment never asked for this chapter. I built it because a real product manager's first three questions about any AI system are: what does it cost, how fast is it, and can I trust its answers? If you can't answer those with numbers, you don't run an AI system — you gamble on one.

So: every single time the AI is called — every read, every score explanation, every product ranking, every draft — the system records, in the ledger: which enquiry it belonged to, which task it was doing, how long it took, exactly how many "tokens" it consumed, and what that cost in money.

Plain words for one term: AI companies charge by the token — roughly a syllable of text. Every word the AI reads and writes is metered, like electricity. Cost control means counting tokens.

### The embarrassing story that proves the point

My first version estimated token counts by measuring text length, because the tool I was using hid the real meter reading. I labelled it clearly as an estimate everywhere. When challenged on it — rightly — I rebuilt the connection so the AI's own bill is read directly. The truth: my estimates had been 36 times too low. Why? Modern AI models "think" before they answer — silent internal reasoning you never see, but every bit of it is metered and billed. My text-length estimate literally could not see the thinking.

The honest, exact number: about ₹0.62 (US $0.0074) per enquiry, all four AI steps included. Both the old estimates and the new exact figures still sit in the ledger, each labelled for what it is — I corrected the record, I didn't rewrite it.

On top of the ledger, every AI call also appears in a professional monitoring dashboard (a free, self-hosted tool called Langfuse). One enquiry = one timeline you can click: all four AI calls, each with its exact duration, token count and price — and the quality scores from chapter 7 pinned right on it. When I presented the "cost per enquiry" number, I could open the dashboard and show the receipts.

I also tested what happens if the dashboard itself dies: I switched it off mid-run, sent an enquiry through, and the assembly line didn't even notice. Monitoring watches the machine; it is never allowed to trip the machine.

Why this matters: finance can budget it ("AI costs ₹0.62 per enquiry — a stamp costs more"), operations can spot drift ("why did cost per enquiry double this week?"), and nobody has to take the AI's efficiency on faith. The 36× correction is the argument in one sentence: estimates lie; meters don't.

## 7 · The AI that checks the AI's work

Speed and cost are measurable by counting. Quality is harder: who checks whether the AI's summaries are faithful and its drafts truthful — at scale, every day? Humans can spot-check, but they can't read everything. So I hired a second AI as the examiner — with one crucial rule: the examiner comes from a different company. The work is done by Google's model; the marking is done by OpenAI's. A student never grades their own homework, and neither does a vendor.

A few times an hour, the examiner reviews every new piece of AI work and marks it 1 to 5 against strict rubrics:

- Faithfulness: is every fact the AI extracted actually in the customer's email? (A blank field is fine. An invented one is an automatic fail.)

- Truthfulness of drafts: does the reply contain any promise we can't keep — invented discounts, made-up delivery dates, stock claims?

- Honesty of explanations: do the lead-score explanations only cite real facts?

Scores go into the ledger and onto the monitoring dashboard. Anything scoring 2 or below fires an alert email to a human immediately.

### Is the examiner actually awake? I tested it.

— The sting operation —

I took a real draft reply, and deliberately planted five lies in a copy: a fake 20% discount, an invented delivery date, a false "in stock" claim, and two more. Then I let the examiner mark it, without telling it anything.

Result: score 1 out of 5, with all five fabrications quoted back word-for-word in its report — and the alert email arrived in the operator's inbox. Then I removed the planted fake from the records. The examiner is not a rubber stamp.

Getting here took honest iteration, and I kept the receipts: my first marking rubric was too harsh (it punished the AI for leaving fields blank — which is exactly what we want it to do), so I rewrote the rubric twice. And the first examiner model I tried — a cheaper one — couldn't follow the final rubric reliably, so I upgraded to a stronger one and wrote down why. On the current setup, the examiner's average marks across all real work: 5.0, 5.0 and 4.9 out of 5.

Why this matters: compliance and legal get a machine that hunts fabrications continuously, before customers ever could. Leadership gets a weekly quality score they didn't have to staff. And when the AI drifts — new model version, changed prompt — the falling score raises its hand on its own.

## 8 · What happens when things go wrong

Any system can demo well on a sunny day. This chapter is about the rainy days, because I built for them deliberately — and tested each one by actually causing the failure.

### "We don't have what you're asking for"

A customer once asked for gazebos — Oak & Ember doesn't sell gazebos. A careless AI would happily invent one. SalesGenie instead files an honest internal note — "no suitable product we can verify" — and hands the enquiry to a human, drafting nothing for the customer. Same story when a customer's budget is genuinely below every matching product in stock: no reply pretending otherwise; a person decides how to handle it. Saying "we can't" honestly is a feature. The system also proves the negative gracefully: two products were deliberately kept out-of-stock in my test catalog, and the AI never offered them — even when a customer asked for one by name (it offered the in-stock alternative instead).

### "The AI gave a garbage answer"

Every AI answer must arrive in an exact expected format. If it doesn't, the system retries once. If it's still wrong, the enquiry goes to a human with the original email intact — the AI never gets a third guess, and never guesses silently.

### "The AI company had an outage" — the backup brain

The whole pipeline thinks with Google's AI. What if Google's service goes down for the morning? I gave every AI step a backup brain: if the Google call fails outright, the very same instructions are re-sent to an OpenAI model of the same price class, and the line keeps moving. The switch is recorded honestly — every ledger entry and dashboard trace names the model that actually did the work and its actual price.

— The fire drill —

I simulated a total outage — cut every single connection to Google's AI — and sent in a fresh enquiry. It travelled the entire line on the backup brain: read correctly, scored correctly, matched to real in-stock chairs (the stock check doesn't care which brain is thinking), drafted, and delivered to the reviewer for approval. Then I restored the connections and confirmed the next enquiry ran on the primary again. One deliberate exception: the examiner from chapter 7 has no backup — its only substitute would be Google's model, which would mean Google grading Google. I'd rather the marking pause for an hour than be marked by the student.

### "Something actually crashed"

A dedicated error-catcher watches every part of the system. If anything truly breaks, the affected enquiry is quarantined — never silently lost — the incident is written to the ledger with its tracking number, and a human is emailed. In months of building and testing, no enquiry has ever vanished.

Why this matters: resilience here isn't a promise, it's a set of drills that were actually run: the honest "no", the format check, the vendor outage, the crash. Each failure mode degrades to something safe and visible — never to a wrong answer sent confidently.

## 9 · How well it actually works — and how I know

Before the AI existed, I wrote the exam it would have to pass. Ten test enquiries, deliberately nasty: a big corporate order, a vague browser, a budget too small for anything in stock, a request for an out-of-stock item, a request for things not sold at all, a vendor pitch, lottery spam, and one email of pure gibberish. For each, I wrote down — by hand, in advance — what a perfect system should conclude. That answer key was locked: through the whole project, the answers were never adjusted to make the AI look better. When the AI missed, the miss went on the record.

The results, in plain words:

Question | Result | What that means | 

Does it recognize what each email is? | 10 out of 10 | Every enquiry, pitch, and spam correctly identified; no spam ever slipped through. | 

Does it pull out the facts correctly? | 92–97% of fields across 5 runs, median 95.3% | Nearly every name, budget and need captured right, measured five times over so the number isn't luck. Zero invented facts in four of five runs; the one exception was on deliberate gibberish the system had already handed to a human. The recurring misses are judgment calls (like "is this urgent or just soon?"), each analyzed and documented. | 

Does it prioritize like the business would? | 6 of 7 match | Lead rankings agreed with my hand-labelled answers in six of seven cases; crucially, it never buried a hot lead. The one miss traces to a single urgent-vs-soon judgment call upstream — documented, not hidden. | 

Does it ever recommend something unreal? | Never — 39 of 39 verified | Every product it ever recommended was re-checked against live stock records. 100%, across every test including the outage drill. | 

Do humans accept its drafts? | 86% approved | Of real approve/reject decisions made by a person, 6 of 7 drafts were approved as-is. High enough to save real time; the rejection proves the gate is real, not a rubber stamp. | 

Two measurement habits worth stealing: first, speed and trust are a pair — the "how much runs automatically" number and the "how often humans approve" number are only meaningful together, because pushing the first up carelessly quietly ruins the second. Second, every number in every report must be re-computable from the ledger by anyone — this rule caught a real discrepancy during the build (a report's own AI call was landing after the report had counted the week's calls — the system observing itself changed the count; found, explained, documented).

## 10 · What it doesn't do yet — honestly

- Reviewers can approve or reject, but not edit. Today, fixing one sentence means rejecting the whole draft. Edit-and-send is the most obviously missing feature and the first thing I'd build next.

- The public enquiry door isn't locked. Fine on a private demo machine; before real deployment each business needs its own key on the door. This is the biggest known gap and it's written at the top of the risk list, not buried.

- Email arrives on a timer. The inbox is checked every few minutes, so email enquiries can wait a few minutes before the 19-second pipeline even sees them. (Enquiries through the other doors skip that wait.)

- The AI-to-AI door uses one shared key and requires the buyer's AI to keep checking back (rather than being notified). Both fine for a demo; both listed for production hardening.

- English only, one enquiry = one customer (two emails from the same person become two records), and no automatic follow-up nurturing of lukewarm leads — all deliberate simplifications, all written down.

### What a pilot would look like

Week zero: the sales team works exactly as today, just noting when each enquiry arrived and when it was answered — that's the honest "before" picture. Then the shadow week: the same inbox flows through SalesGenie with every draft going to a human — which is already how the system works, so the pilot needs no special safety mode. Compare speed, accuracy, and approval rates; watch the cost-per-enquiry meter; expand when the numbers hold.

## 11 · Appendix: where every claim can be checked

A rule I set on day one: nothing goes in this document unless it can be verified from the project's own records. Here's the map.

Claim | Where the proof lives | 

Email recognition 10/10, spam always caught | evals/results/2026-07-26-classification.md | 

Fact extraction 92–97% (median 95.3%), hallucination-free in 4/5 runs | evals/results/2026-07-30-extraction-spread.md (5 independent replay runs) | 

Lead ranking 6/7, no hot lead buried | evals/results/2026-07-26-qualification.md | 

100% of recommendations real & in stock (39/39) | evals/results/2026-07-26-grounding.md + later re-checks in the ledger | 

19-second pipeline; ₹0.62 / $0.0074 per enquiry, exact | the ledger's AI-call records (each row labelled exact vs the old estimates) + the Langfuse dashboard | 

Estimates were 36× too low | decision record ADR-0012 — the before/after rows are both preserved | 

Examiner caught 5/5 planted lies; averages 5.0/5.0/4.9 | the judge-scores ledger + story E11-S3's write-up of the sting | 

Bookstore onboarded by chat; too-early enquiry parked, then auto-resumed | the event ledger for tenant 2 + stories E8/E10 | 

AI-to-AI deals completed on both businesses; human gate visible | the A2A task records + the buyer-agent demo transcript (scripts/) | 

Total-outage drill passed on the backup brain | decision record ADR-0013 + the chaos-test ledger rows (2026-07-27) | 

Every design decision, with reasoning | 13 written decision records (docs/adr/) | 

Every piece of work, including all 3 bugs | 44 story cards in stories/done/ — bugs were filed as cards the moment found | 

Companion documents: the plain-English tour of the whole machine (one enquiry followed end to end) · the public setup guide (how any business can run this on their own accounts) · the concise slide-ready version of this story (presentation/slides-content.md).