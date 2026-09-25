# Synthetic interview 01: Priya Raman, after slice 1 (slice 2 code landed)

*Synthetic interview. Treat every point as a hypothesis until a real practitioner confirms it.*

## Part A: past behavior

**Q:** Tell me about the last time you tried to figure out the boundaries or vocabulary of a messy part of your system. What happened, step by step?

**Priya:** That was July, so about ten weeks ago. Our VP asked for a rough plan to pull Booking out of the Rails monolith by Q1. I started where I always start, in the code. `Booking` is a Rails model with something like 140 columns and a `status` enum with 23 values, and three of those values are commented "DO NOT USE." I wrote a Confluence page called "What is a Booking?" and pinged ops, finance and the carrier-integrations team in Slack. The thread got to about 60 messages. Ops thinks a booking exists once the customer submits. Finance thinks it exists once it's invoiceable. The carrier team calls the tender a booking. Then it died, because everyone had real work. The Confluence page still has a table with three columns that don't agree.

**Q:** What did you use during that? What did it cost you?

**Priya:** Confluence, Slack, the Rails console, and a lot of `git blame`. Maybe fifteen hours of my own time over three weeks, mostly reading code and chasing people. Two 45-minute calls with Dana, our ex-ops lead, and one of those went to her explaining rebooking versus amendment, which honestly was the most useful hour of the whole thing. The reputation cost is what bugs me. In planning I said "bounded context" once and Marcus, our staff engineer, said "so, a folder?" and people laughed. After that I stopped using the words and just said "the part that ops owns."

**Q:** When you used an AI chat for DDD help, what was the last concrete thing you asked and what did you do with the answer?

**Priya:** In August I pasted a sanitized version of the status enum and a few model callbacks into Claude and asked it to "propose bounded contexts for booking." It gave me Booking, Carrier Management, Billing and Customer Portal, which you could guess from our org chart. I kept one thing. It had listed the status transitions as past-tense events, like "Booking Tendered" and "Tender Rejected," and I pasted that list into the Confluence page. Everything about the contexts I threw away. It never asked me anything. It didn't know rebooking exists, and it never would have, because it doesn't ask.

**Q:** What happened after the fizzled EventStorming session? Did anything come out of it that you still use?

**Priya:** That was March, on Miro. A consultant friend of our director ran it for free as a favor, which tells you the level of commitment. We had orange stickies everywhere for about an hour, then an argument about whether "Quote Accepted" is part of booking, and then people's cameras went off. Nobody owned the board afterwards. What I still use is honestly just the pink "hotspot" stickies. Three of them are still true and still unresolved. I screenshot that corner of the board into docs when I want to make a point. The rest is soup.

**Q:** How do you currently know if a model or boundary you drew is any good?

**Priya:** I don't, really. That's the honest answer. My proxies: does Dana nod or frown when I explain it back to her? And when I look at the last ten Jira tickets that touched booking, would they have stayed inside one boundary? I did that exercise once with a spreadsheet and it was the most convincing thing I showed Marcus. Otherwise you find out in production, eighteen months later.

## Part B: reaction to what exists today

*(Shown slice-01-1-ready.png and slice-01-2-pending.png. Told that slice 2 adds same-session memory and a reload forgets it.)*

**Q:** First honest reaction to this screen. Would you use it over just opening ChatGPT or Claude?

**Priya:** It's a text box and a Send button with Times New Roman, so right now it's ChatGPT with fewer features. No, I wouldn't use it over Claude today. Claude already remembers the conversation, lets me attach files, and keeps my history, and this forgets on reload. The only reason I'd switch is if it behaves differently, meaning it asks me questions instead of handing me four contexts. I can't tell that from this screen. The question in the screenshot ("what is a domain event at Eazy Freight") is something I'd never type. I'd paste the Slack thread.

**Q:** What would have to be true in the next 2–3 releases for you to try it on the Booking split for real?

**Priya:** Three things. First, I paste something messy, like that Slack thread or the enum, and it tells me where people disagree and asks me the question I should take to Dana. Second, I don't lose it. If I close the tab on Tuesday and come back Thursday after my hour with Dana, my stuff is still there. Third, one sentence telling me where my text goes. If it runs through some router to a model I've never heard of, I'm not pasting our carrier rules into it. And no account, or I bounce.

## Part C: reaction to the vision (voice plus auto-built board)

**Q:** The coach talks with you and builds stickies and a timeline as you speak. Where does this help, and where does it annoy or worry you?

**Priya:** The sticky part is the first thing you've said that ChatGPT doesn't do. If I say "the carrier can reject it" and a sticky shows up in the right place, that's great, because the output from the chat was always the part I had to rebuild in Miro by hand. Voice at my desk, though? We're in an open-plan office three days a week. I'm not narrating our booking flow out loud next to the sales team. At home, maybe. Actually, walking the dog I might, so I don't know, don't take the "no" too literally. The bigger worry: if it adds a sticky that's slightly wrong, I'll spend the session correcting the AI instead of thinking about the domain. And it has to get into Miro or Confluence. If the board lives only in your app, it's a dead end, because nobody at my company will open another tool.

**Q:** Who else would need to be in the session? Would you bring the domain expert into it? What would make them trust it?

**Priya:** The real session is me and Dana. Maybe the PM, never Marcus, not in the first one. But I wouldn't bring Dana in first. I get one hour a week from her, and if the tool embarrasses me in front of her I've burned it. I'd use it solo to prep: figure out what I don't know and what to ask her. If Dana ever did join, the stickies would have to use her words. She says "rebook," not "BookingReassigned." She'd also have to be able to say "no, that's wrong" and see it change right away. And the tool shouldn't lecture her about methodology. Oh, and it can't talk over her. If it asks Dana a question that I should be asking, that's weird.

**Q:** What would make you stop using it after the first session?

**Priya:** Four things. It tells me "you should have a Booking aggregate" in the first five minutes. I lose the board. The board gets bigger than what we actually agreed on, and it looks finished when it isn't. That's worse than the soup, because I'd take a wrong-but-tidy picture into planning. Or it makes me do its method in its order. I already tried Context Mapper and quit over the ceremony.

**Q:** Would you pay? Who pays, how much, and what would you compare it against?

**Priya:** For this text box, no. For the board version that exports and remembers, I might pay ten bucks a month personally for a couple of months while I'm doing the split, then cancel. Company money above twenty a seat goes through my manager, and she'd ask why not Miro plus our existing Claude seats. Those are the real comparison, and they're already paid for. The other comparison is a consultant, around $2k a day, and we've never gotten budget for that either. Honestly? I'd probably use the free tier until it ran out and then decide. I'm not sure I'd upgrade.

## Part D: close

**Q:** If you could only have one thing from this product in the next month, what is it?

**Priya:** Paste in the messy thread and get back three things: the terms people use differently, marked by who uses which meaning; a short list of events in order; and the questions I should ask Dana. As text I can paste into Confluence. No board, no voice. That alone would have saved me a week in July.

**Q:** Anything I should have asked but didn't?

**Priya:** What happens after the session. The model isn't the deliverable. What I need is a design doc and a set of tickets, plus something that convinces Marcus. You also didn't ask about the week between my calls with Dana, which is where everything falls apart. And ask me what our AI policy says. We have one as of June, and "approved vendors only" is going to matter for your router thing.

---

## Interviewer notes (out of character)

### Key insights

1. **The value is facilitator-style questions and surfacing disagreement, not answers.** She reused only the event list from the AI chat and threw away the proposed contexts. [strong signal] [supports roadmap: slice 3 "Ask like a DDD coach", B05 disagreeing sources]
2. **Her real input is messy pasted text (Slack threads, enum dumps, notes), not typed questions.** Her first action would be a paste. [strong signal] [supports roadmap: B01/B02, though it argues for paste before file drop]
3. **Losing the work on reload kills trust.** Her work spans weeks, in gaps between hour-long calls with the domain expert. The same-session memory from slice 2 doesn't cover that, and B12 is parked in "later ideas." [strong signal] [contradicts roadmap]
4. **The output has to leave the tool (Confluence or Miro).** A board that only lives in the app is a dead end in her company. [strong signal] [contradicts roadmap: slice 13 only makes the recap "available to inspect"; no export anywhere]
5. **Voice at a desk is doubtful.** Open office for voice. She wavers (the dog walk), and she plans to type while prepping. [weak signal: she contradicts herself] [contradicts roadmap: slice 12 removes the text composer]
6. **Her first real use is solo prep for the domain-expert session, not the session itself.** She won't risk the expert's hour on an untested tool. [strong signal] [reframes the voice-with-a-person vision; B14 stays later]
7. **She needs to know where her data goes before she pastes anything proprietary.** Company AI policy is "approved vendors only," and OpenRouter's routing is opaque to her. [strong signal] [roadmap has no item for this]
8. **Paying is weak.** She compares against Miro plus existing Claude seats, which are already paid for. A consultant is the aspirational comparison. [weak signal] [neutral]

### Roadmap assumptions this interview challenges

- **"Voice is the final surface; remove the text composer"** (slice 12; backlog: "the final voice experience has no text composer"). The ICP types and pastes and works in an open office. Keep text or paste as a first-class input.
- **"The board is the primary interface"** (generative-coach-direction.md). She values the board only if it exports. Its fidelity inside the app matters less than getting it out.
- **Saved sessions deferred until "repeat visits need prior context"** (B12). This interview says the ICP's workflow is repeat visits by nature.
- **Solo visitor, one person per session** (slice 4 notes; B14 later). This fits her prep use. But the vision's "pairing with a domain expert" story is not where adoption starts.
- **No privacy or data-flow statement before hosting** (slice 2a publishes publicly). Pasting proprietary workflows is the main use, and she is blocked on it.
- **Starting input is a typed question** (the slice 1 demo prompt). Her real input is a paste of 1–5k characters, which also hits the slice 2 24k-char cap and B38 sooner.

### Small backlog and slice suggestions

1. **Keep the session across reload (local only).** Precede slice 2a; promote the smallest part of B12.
   - *Smallest result:* the conversation log and history survive a reload in the same browser. A "New session" control clears them.
   - *Acceptance:* send 3 turns and reload. All 3 show, and the 4th reply uses a detail from turn 1. "New session" leaves the log empty and the next request carries no history. No account, no server storage.
2. **Data-flow notice.** Part of 2a.
   - *Smallest result:* one visible line near the input: "Your text goes to OpenRouter and the <model> provider; this app stores nothing on its server."
   - *Acceptance:* visible on first load without scrolling, with the model name taken from server config. A grep of `server/` confirms there's no persistence or logging of bodies.
3. **Start from pasted notes.** Modify the slice 3 check, or insert as a B02 variant before B01.
   - *Smallest result:* pasting a long block into the text box gets a reply with ≤5 ordered candidate events, the terms used with conflicting meanings (with who uses which), and one question for the domain expert.
   - *Acceptance:* paste an Eazy Freight Slack thread where ops and finance mean different things by "booking." The reply names both meanings and who holds each. It doesn't propose aggregates or contexts, and it ends with exactly one question.
4. **Copy the board as Markdown.** New B-ID after 4d, before slice 5.
   - *Smallest result:* a "Copy as Markdown" action puts events in timeline order plus the open questions on the clipboard.
   - *Acceptance:* after the 4a–4d demo, paste into Confluence or a Markdown preview. Event order matches the board and each open question is labeled. No card is missing or duplicated.

### Questions for the next interview

- Walk me through the last time you prepared for a meeting with a domain expert. What did you bring in, and what did you leave with?
- What did the last design doc for a service split contain? Where did the model or diagram actually end up?
- What does your company's AI or data policy allow you to paste, and into which tools?
- When did you last talk to a tool out loud at work (dictation, voice assistant)? Where were you?
- Between two sessions a week apart, what did you lose or forget?
- For a more experienced practitioner (near the anti-ICP edge): would you ever let a tool place stickies for you? What would it have to get right?
- Interview the skeptic (a "Marcus"-type staff engineer): what artifact would convince you a boundary is right?
