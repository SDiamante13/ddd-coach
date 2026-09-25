# Synthetic interview 06: Priya Raman, after slice 3 (#4) + Explorations 06 and 05b

*Synthetic interview. Treat every point as a hypothesis until a real practitioner confirms it.*

Monday 19 October 2026, four days after interview 05c. Slice 3 (#4) and #69 went live on Friday 16 October, and she was sent the link that afternoon with one sentence: "the coach now replies in three parts and the paste limit is 24,000". On Sunday 18 October, at home, she pasted her whole sanitized thread into the live coach, untrimmed, then asked her company Claude the same thing. The interview opens with a delayed-recall learning retest before anything is shown, then walks through Sunday, the notice, two checks (#68, #66), and two concepts: Exploration 06, "Structured reply" (`s1`–`s3`, #64), and Exploration 05b, "Why this question?" v2 (`v1`–`v3`). The interviewer typed nothing into the live app. A headless screenshot of the live first screen was used for the notice.

Live facts behind the probes (from `outputs/demos/slice-03.md`, `outputs/evals/slice-03/summary.md` and the live screenshot). The per-message cap is 24,000 and the conversation cap 64,000. The purpose line reads "Paste a messy thread or meeting notes. The coach puts the events in order, shows which words each team uses differently, and gives you one question for your expert." The reply is plain text in three parts: "Events, in order" (1–5 numbered events), "Words that don't match" (each meaning credited to a team, with "Ops (view A)/(view B)" for a split inside ops and a "Code" line), and one "Question for <roles>, at <forum>: …". Every claim starts "From thread:" or "Guess:". No people's names, no DDD jargon, no offers. Hosted first-turn latency on a 20k thread: median 9.8 s (8.7–13.4 s). The #69 notice is now ink text at body size with a border and a blue left edge, and reads "Your messages are sent to OpenRouter, an AI model provider, to generate replies. Nothing is stored on our server. Don't paste customer names, rates, lanes or contract terms." The production model is `openai/gpt-5.6-terra`, not the `gpt-6-luna` the research queue expected; she was told in 04a that the model had moved to luna. #66 (auto-scroll) and #68 (starting over offers the last paste back) are still open issues, not deployed.

## Part A: learning retest (before anything is shown)

**Q:** Before I show you anything. Write the question you'll put in the pre-read for the 27 Oct finance review, the one you most need answered in the room. Take the time you'd actually take.

*(She typed into her own notes file, about three minutes. The interviewer said nothing.)*

**Priya:** "Load 47356 changed carrier on the same lane and shows REBOOKED. Load 46771 changed pickup date and shows AMENDED. Finance: which of these should produce a second invoice, and who voids the first?" That's what goes in the pre-read. I wrote "is a rebook one booking or two?" first and deleted it before I finished the line, because finance will spend twenty minutes on that and leave with nothing.

**Q:** Why that shape?

**Priya:** Because Maya answered the three-load version in one line on Thursday, and the abstract version had been going round since July. A load number stops people arguing about what the word should mean and makes them say what happened. <mark>Put a load on it, or you get a philosophy seminar.</mark> Finance likes loads anyway, because loads have invoices.

**Q:** Is that a move you learned somewhere? Can you name it?

**Priya:** "Put a load on it" is what I call it. You'll want me to say the phrase from your screen last week and I can't; something about one real example. And honestly, Dana did this to me in September before your tool did. The other one you showed me, the "what made them different" one, I thought I'd used here. Reading it back, I haven't. <mark>Last week I asked what made the difference. This week I asked them to pick a winner.</mark> "Which should produce a second invoice" is a ruling, and finance will rule for finance. I'd change it to "what's different about 47356 that made it a second invoice", except I don't know that it did. I'd have to check first.

**Q:** Since Thursday, have you asked anyone a question that way without thinking about it?

**Priya:** Friday, a PR review. Ravi's change to the carrier-drop handler, and my first comment was going to be "does this handle lane changes?". I wrote "what happens to 47356 with this change?" instead, and he ran it and found it created a second tender. I didn't notice I'd done it until you asked. So yes, once, in a PR, on my own. That counts for more than the pre-read question, because nobody was watching me write the PR comment.

## Part B: since last time

**Q:** Four days since 05c. What's moved?

**Priya:** Dana left on Thursday. The coffee was at three, and she answered my contract question at noon. Maya's one-line answer went into the RFC as the "Ops, current practice" row, with her portal wording. The pre-read goes out this Thursday, the 22nd. Finance review is still Tuesday the 27th, and the RFC's due on the 30th. On Thursday evening I did the small run I promised, Maya's comments and the two rows, on the old coach. It asked whether I'd like a table of the terms. I said that would be the last run, and then you sent the link on Friday.

**Q:** What did Dana's answer say?

**Priya:** Clause 7.3 of our standard carrier agreement: "a change of carrier or lane constitutes a new tender." Tender, not booking. <mark>So Dana's side of the split is the carriers' word in an ops mouth.</mark> She read "new tender" as "new booking" for four years, and so did her sheet. The row now says "Dana's 2019 sheet, reading clause 7.3 (new tender)". I haven't decided whether that settles the split or makes it worse.

**Q:** Has Marcus opened the RFC?

**Priya:** Friday night. One comment, on the Code row: "which commit?" Exactly what he said he'd ask. I added the hash. He hasn't said anything about the rest, which from Marcus is approval.

## Part C: the whole thread, and company Claude (the #4 test)

**Q:** You said in 04a you'd re-run the whole thread, carriers included, if the coaching prompt shipped. Walk me through Sunday.

**Priya:** Sunday evening, same laptop, same file: 12,040 characters, sanitized, lanes taken out last time. I didn't trim anything this time, not even the "+1"s. I pasted, the counter said "12,040 / 24,000", no red box, and I sent it. <mark>First Sunday in three where I didn't choose which team to leave out.</mark> The carrier side-thread about the EDI tender was in.

**Q:** How long did the reply take, and did the wait bother you?

**Priya:** About eleven seconds, "Coach is thinking…" and then the whole thing at once. The second run was nine. That's fine. Company Claude takes longer than that on the same thread, and I watch it type, which isn't faster, it just feels busier. Eleven seconds for something I'd otherwise spend twenty minutes on is not the problem. If it were thirty I'd open another tab and forget it.

*(The reply on screen, as she read it back from her notes file, lightly abbreviated:*

```
Events, in order
1. From thread: The customer submits a booking on the portal and Ops starts working it.
2. From thread: Ops tenders the load to a carrier, and the carrier accepts the tender.
3. From thread: The carrier drops the load or the lane changes, and Ops rebooks it.
4. From thread: The carrier team's EDI job cancels the first tender and sends a new tender with a new tender ID.
5. From thread: Finance invoices the load after proof of delivery.

Words that don't match
"booking"
- From thread: Ops means the customer's portal submission that the desk starts working.
- From thread: Finance means an invoiceable load, after proof of delivery.
- From thread: Carriers mean a tender, not a booking.
- From thread: Night dispatch means a load once a carrier has accepted it, because that's when it shows on their board.
"rebook"
- From thread: Ops (view A) means a carrier or lane change creates a new booking under the carrier contract.
- From thread: Ops (view B) means REBOOKED whenever the carrier changes, lane or not, because AMENDED doesn't reach the carrier portal overnight.
- From thread: Finance means the old invoice is voided and a new one is raised.
- From thread: Code sends a cancel and a new tender with a new ID.
"tender"
- From thread: Carriers mean the offer they accept or reject, keyed by tender ID.
- From thread: Ops means the moment the desk sends the load out.
"hold"
- From thread: Ops (view A) means a load waiting on the customer.
- From thread: Ops (view B) means a load waiting on the carrier to accept.
- From thread: Finance means a credit hold on the account, so nothing ships.

Question for the finance controller and the carrier team lead, at the 27 Oct RFC review: For the load in the thread that got two carrier invoices after a rebook, was the second invoice matched to the original booking ref or to the new tender ID?
```

*About 340 words, no names, no offers. Two slips planted from the slice 3 demo's findings (#73), not pointed out to her: the ops views swap between words (under "rebook" view B is the night desk's practice; under "hold" the night handover notes' meaning is view A), and a shift, "Night dispatch", appears once as a holder under "booking".)*

**Q:** First read. What did you notice?

**Priya:** That it was short enough to read, and I did, all of it, in about three minutes. In 04a I told you I wanted three lines and a question. This is thirty lines and a question and I didn't mind, because every line was about my thread and none of it was advice. <mark>No "consider", no "recommendations", no bounded contexts. First time.</mark> Then I went straight to the bottom, because the question is what I came for.

**Q:** The question. Would you have thought of it?

**Priya:** No. I've spent three weeks treating the carriers as the third meaning of a word. It treated them as where the second invoice comes from. Tom's line about matching invoices is near the top, and the EDI message about the new tender ID is two-thirds of the way down, in the part I cut in 04a. <mark>The question came out of the part I cut last time.</mark> And it asks about one load, not about what a booking is. So it did the thing I did to Maya, to me.

**Q:** Did you check it before believing it?

**Priya:** Of course. I searched the thread for "tender id" and found the carrier team's message, and Tom's "we match carrier invoices to the booking" is there too, so the premise is real. Then I opened the ledger export this morning to answer it myself before asking anyone. It has no tender ID column, so I can't. That's the best kind of question: true premise, real gap, and I don't know the answer. But look who it's for: the carrier team lead isn't at the 27th, it's a finance review. <mark>Right question, wrong room.</mark> It goes to Ravi today, because he read the EDI code, and only the answer goes in the pre-read.

**Q:** Now company Claude. What did you ask it, and what came back?

**Priya:** To be fair to it, I pasted the same file and typed your purpose line as the prompt: put the events in order, show which words each team uses differently, give me one question for my expert. It gave me eleven events, which is better than five, and a proper rendered table of words, about as good as yours. It kept names: "Tom (finance) says…", "Dana says…". Its question was "What is the canonical definition of a booking that both Ops and Finance can agree on?" <mark>That's the question I'd have written in September.</mark> Then "Would you like me to draft a proposal for a unified booking lifecycle?" I pushed it once: "Give me one question I wouldn't have thought of, from the whole thread." It came back with "Who owns the booking record after handoff from ops to finance?", which is fine and generic, and it could be about any company. I could probably write a prompt that gets Claude there. That's an evening I don't have, and I didn't know what to ask for until I'd seen yours.

**Q:** So side by side: did the tie break?

**Priya:** For the question, yes. Events: Claude wins, eleven against five, and my RFC has events already, so I don't care much. Words: a tie, except Claude's has names I'd have to strip and yours doesn't. <mark>The question: yours, and it isn't close.</mark> Next thread, I open your tab first, get the question, then take everything else to Claude, because Claude has my history and drafts the invite. So yes, you've got one job in my week. One tab, one job.

**Q:** You said you ran it twice.

**Priya:** Because I don't trust anything that surprises me once. I pressed New conversation, cleared, pasted the same file again. The second question was "Question for the ops lead and the finance controller, at the 27 oct booking-split RFC review: For a same-lane carrier change, should Ops keep one booking and send AMENDED so Finance issues one invoice?" <mark>That's advice dressed as a question.</mark> It proposes the answer, it's the fight I already knew about, and it's "27 oct" in lowercase, which I'd have to fix before it went in an invite. If that had been my first run, we'd be having the 04a conversation again. So now I'd run it twice every time and pick. Which means I'm the facilitator again, choosing between two coaches. <mark>A question I have to run twice to trust is half a question.</mark> The good one came from the whole thread; the bad one came from the loudest part of it.

**Q:** Every line starts "From thread:". Useful, or noise?

**Priya:** Noise after the third line, useful as a promise. Eighteen lines that all say "From thread" tell me nothing line by line. What it tells me is that when a line doesn't say it, I should look, and there were no "Guess" lines on Sunday, so I never saw the contrast. When I checked the question I searched the thread myself, and a message time would have saved me the two minutes. And when I copied the rebook block into my notes I deleted "From thread: " four times by hand, same as I said about citations: in the reply, never in the copy.

**Q:** Is there anything in the reply you'd correct before you used it?

**Priya:** Two things. "Code" is Ravi reading the EDI job in Slack, not code; "From thread" is literally true, but "Code" as the holder makes it sound like someone pasted code. And "Night dispatch" turns up once under "booking" as if it were a team. It's a shift in Maya's team, and it's the only line in the reply with a shift instead of a team, so it jumped out. <mark>I'd fold it into Ops, current practice, and I did.</mark> Missing: nothing I'd blame it for. Dana's sheet and clause 7.3 aren't in the thread, so it didn't make them up, which is what I asked for in 05c. The two blocks I used were "rebook" and "hold". "Hold" went into the RFC draft this morning, because finance's credit hold next to our "hold" is exactly the collision the review is for. View A is Dana's sheet, view B is current practice, same as in the rebook block.

**Q:** Under "rebook", view A is the contract reading. Under "hold", whose line is "waiting on the customer"? Check it against the thread.

*(She searched her file for "waiting on" and read for about a minute.)*

**Priya:** It's the night handover notes. That's Maya's night desk, which is view B under "rebook". <mark>View A changed teams between two words, and I didn't see it, and I read every line.</mark> So the row I wrote this morning says "Ops, Dana's 2019 sheet: hold means waiting on the customer", and Dana's sheet doesn't mention hold at all. That was going out in Thursday's pre-read. Finance would have read that the contract side uses "hold" for the customer, next to their credit hold, and asked who owns it, and the answer on that row is someone who left last Thursday. That's the P2 again: a disagreement with the wrong owner. <mark>Night dispatch I caught because it looked wrong. The flip I missed because it looked right.</mark> Letters are only safe if they mean the same group all the way down. Otherwise give me the names from the thread, "night handover notes", and I'll rename them myself.

## Part D: the notice (#69)

*(Shown the live first screen: the purpose line, then the notice in ink at body size in a bordered box with a blue left edge. Then `v1.png` from Exploration 05b, whose notice reads "Where your text goes: OpenRouter routes it to OpenAI (openai/gpt-5.6-terra). Nothing is stored on our server. Don't paste customer names, rates, lanes or contract terms.")*

**Q:** Does the notice still read as small print?

**Priya:** No. It's the same size as the purpose line, it's dark, and it has a box with an edge, so I read it on Sunday without meaning to. And the named list is there: "rates, lanes or contract terms". That's the one I asked for, and it's the one that caught my lanes in 04a. <mark>It's not small print any more. It's large print of the same small print.</mark>

**Q:** Your checklist, then: the processing company, retention, training with a link, a page to forward, the operator named.

**Priya:** One and a half, same as before. OpenRouter is named and "an AI model provider" is still wrong, because OpenRouter routes it to someone else and that someone isn't named. You told me in 04a it had moved to luna; your own concept's notice says terra. So it changed twice and the notice noticed neither time. Retention is only "our server", there's no training line and no link, no page to forward, no operator. Your 05b concept gets the company right, "routes it to OpenAI", so that's two out of five on paper. For our security review it's still zero, because there's nothing to forward.

## Part E: starting over and refusals (#68, #66)

**Q:** When you pressed New conversation for the second run, what was in the box after you cleared?

**Priya:** Nothing. My draft was empty, so the box was empty, and the thread was gone with the log. I pasted it again from the file, which took ten seconds because I had the file open. <mark>It's the 04a thing, only this time I cleared on purpose, to check the coach, and it still made me re-paste.</mark> If the tool wants me to trust its question, it should make the second run one click, not a hunt for the file.

**Q:** Did you hit a refusal this time? Were the buttons visible?

**Priya:** No refusal. Twelve thousand and three follow-ups didn't come near it. So I can't tell you about the buttons; I never saw them. In 04a I had to scroll to find them. If that's not fixed, it's not fixed, I just didn't get there.

## Part F: Exploration 06, "Structured reply" (concept, not built)

*(Shown `s1`: the same three parts rendered as a numbered list with FROM THREAD / GUESS chips, a Word · Team · Meaning · Source table, and the question in its own bordered box. Then `s2`, cut at the length limit with a note, and `s3`, where stray markup stays as plain text. Told the table layout itself is not up for redesign.)*

**Q:** Would this change what you copy out of a reply?

**Priya:** Not much. On Sunday I copied two things: the question, and the "rebook" block into my notes. The question in its own box is easier to select, so yes, that's a small win. The rest I read here and retype in the RFC, because the RFC's rows have load numbers and names of practices that the coach can't know. <mark>It changes how it reads, not what I take.</mark> Raw text was fine on Sunday. I've stopped seeing asterisks because there aren't any.

**Q:** Anything in the stills that worries you?

**Priya:** Two things. Your mock-up has "Ops" once per word. My reply has "Ops (view A)" and "Ops (view B)". Where does that go in a Team column? If it turns into two rows both saying "Ops" with different meanings, it looks like a typo, not a split. And the question box says "Question for the ops lead". Since 12 October that's one person; Sunday's reply said the finance controller and a second role, with a meeting. Don't lose that to make the box tidy. The chip in every Source cell is the "From thread" problem in a different font.

## Part G: Exploration 05b, "Why this question?" v2 (concept, not built)

*(Shown `v1`: three questions for "your 30-minute slot", each with a visible MOVE line and a "Why ask it this way?" link, and a source line under the coach's opening claim: "Source: Evans, Domain-Driven Design Reference (2015), 'Ubiquitous Language' and 'Bounded Context'." Then `v2`, the opened "why" on question 2 with the hotspot definition and a Brandolini source. Then `v3`, "Copy the questions for my Dana prep".)*

**Q:** Now you've seen it: the first move line reads "Ask about one real case, not the general rule". Is that your "put a load on it"?

**Priya:** That's the phrase I couldn't find this morning. Yes, same move. <mark>I'd kept the move and lost the words, and seeing the words didn't add anything to the move.</mark> Useful for Ravi, maybe, who doesn't have the move yet.

**Q:** Do the visible move lines teach, or are they noise?

**Priya:** One line per question is fine; I'd read it the way I read a code-review comment. Question 1's line is noise for me. Question 2's, "Ask what made the difference, not what the words mean", is the one I skipped in 05 because it was folded, and now I can't miss it. That's the fix I asked for. And it's also the one I just failed to use in my pre-read question. So a visible line got me to read it, twice now. It didn't get me to do it on my own, yet.

**Q:** Spot-check the source line on the opening claim.

**Priya:** I have the DDD Reference PDF, it's free. The Bounded Context section backs the second half: the same word meaning different things in different parts of a big system is normal and expected. "Settle what the word means before splitting the code" is your advice, not Evans's, and the source line sits under both halves as if he said both. <mark>Half the sentence passes. The half that tells me what to do is yours.</mark> Put the source after the part it backs. The hotspot one is right now, "to come back to", that's how Brandolini says it in the talks. I don't own the book, so "Introducing EventStorming, on hotspots" I'd take on trust.

**Q:** And the copy in v3?

**Priya:** It still copies question 3, "had the first carrier already sent a truck", onto the list for Dana. Its own move line says "check it yourself first". I told you that in 05. <mark>The why is right and the copy still ignores it.</mark> And Dana left on Thursday. A concept that says "your 30-minute slot" with Dana four days after she's gone is a concept nobody's reread.

## Part H: close

**Q:** Would you use it this week for real prep? For what?

**Priya:** Yes, Wednesday evening, once. Finance's pre-read comments come in tomorrow; I'll sanitize them with Maya's thread, about four thousand characters, and take its question to the review if it passes the same check: true premise, and I don't know the answer. Sanitizing takes me fifteen minutes each time, and that's now the real cost. <mark>The coach is worth the paste now. The paste is the expensive part.</mark> I'll run it twice. I'd rather not have to.

**Q:** If you could have only one thing in the next month?

**Priya:** The good question the first time. Not a better question: Sunday's first one was good enough. The same quality on every run, asking about a case and not handing me an answer. <mark>If I have to run it twice and pick, I'm the coach.</mark> After that, I'd want to paste the thread unsanitized at work, and I know that's a different conversation.

**Q:** Anything we should have asked and didn't?

**Priya:** Ask Ravi what he makes of the tender-ID question when I send it today. If he says "obviously the new tender ID, everyone knows that", then it was a question only I wouldn't have thought of, and that's a smaller win than it felt like on Sunday.

---

## Interviewer notes (out of character)

Checked against the repo. Live notice text = `src/ui/DataFlowNotice.tsx` (OpenRouter named, "an AI model provider", no model company, no links). Production model `openai/gpt-5.6-terra` (demo, eval summary), not `gpt-6-luna` as the research queue expected. #66 and #68 are open issues; `ExchangeOutcome.tsx` has no scroll behaviour, and `restoredDraft` only runs on a refused turn, so a Clear keeps the draft and drops the first paste. Exploration 06's parser (`structured.html`, `parse`) splits a meaning line on the first word with `(\S+) (?:say )?(.+)`, so the shipped format "Ops (view A) means …" renders Team "Ops" and Meaning "(view A) means …", and "Finance means …" renders Meaning "Means …". Its samples use "say" instead of "means" and have no view labels. Exploration 05b's copy (`why-v2.html`) still includes question 3 (48102) in "Copy the questions for my Dana prep". The reply in Part C is adapted to her thread from the demo's F1 replies and the eval's terra v4 shape; the second-run question is modelled on the demo's off-video run 3. Two #73 slips (a view A/B swap between "rebook" and "hold", and "Night dispatch" as a holder) were planted from the demo's findings 1 and 2 and not pointed out.

### Key insights

1. **With the whole thread in, the coach asked a question she wouldn't have asked, from the part she cut last time.** The tender-ID question joins Tom's invoice-matching line (early) and the carrier team's EDI message (late, dropped by the 8k cut in 04a). She checked the premise in the thread and couldn't answer it from the ledger. "The question came out of the part I cut last time." [strong signal: past behavior, Sun 18 Oct + Mon check] [supports #4: the cap raise was necessary for the win, not just the prompt]
2. **The question isn't stable across runs.** Run 2 on the same file gave a leading question ("should Ops keep one booking and send AMENDED…?") that proposes the answer and restates the fight she already knew. She now plans to run it twice and pick. "A question I have to run twice to trust is half a question." [strong signal: past behavior, 2 runs] [challenges #4's ship bar: the eval checks that the question spans the thread, not that it asks rather than proposes]
3. **The tie with company Claude broke on the question, and only there.** Same file, same prompt (our purpose line): Claude gave 11 events (better), a comparable rendered word table with names, and the abstract question she'd have written in September plus an offer. Pushed once, it gave a generic ownership question. Next thread: our tab first for the question, Claude for everything else. "One tab, one job." [strong signal: side-by-side past behavior] [supports #4; limits the win to one job]
4. **Delayed recall: the real-case move is reused unprompted; the new move decayed.** Her pre-read question anchors on loads 47356 and 46771 unprompted, and on Friday she used the move in a PR comment without noticing. But she can't name it in the coach's words, the move predates the coach (Dana, September), and the move that was new in 05 ("what made the difference") turned into a ruling question. [medium signal: one unobserved past instance + one observed draft] [#26]
5. **The view-label flip got past her and into her RFC draft (#73).** Under "rebook" view A is the contract reading; under "hold" view A is the night desk. She read every line, didn't notice, and carried the rebook mapping into a "hold" row for Thursday's pre-read, crediting Dana's sheet with a meaning it doesn't contain. She caught the "Night dispatch" holder unprompted. "Night dispatch I caught because it looked wrong. The flip I missed because it looked right." [strong signal: past behavior, a draft row she wrote] [#73, #4 prompt + eval, #64]
6. **#69 fixed the weight, not the content: still 1.5/5.** She read it without meaning to ("It's not small print any more. It's large print of the same small print."). The model changed again (luna → terra, as far as she knows) and the notice named neither. 05b's notice ("routes it to OpenAI (openai/gpt-5.6-terra)") would take her to 2/5; the security review needs a page to forward. [strong signal] [#55 still open; #69 closed]
7. **The paste is now the cost.** With a question worth having, the 15-minute sanitizing step per thread (#34) is what decides whether she uses it on a thread at all. "The coach is worth the paste now. The paste is the expensive part." [medium signal: stated, consistent with 02–04a behavior] [#34]
8. **Structure changes reading, not copying.** She copied the question and one word block; the rest is retyped into the RFC with loads and practice names. The question box helps; chips in every Source cell repeat the "From thread" noise; the mock drops view labels and joint roles. [medium signal: Sunday's real copy-out + concept] [#64; #6 untouched]

### #73 watch item: view labels flip, sub-team as holder

Planted in the reply she read (adapted from the slice 3 demo's findings 1 and 2), not pointed out first.

| Slip | Result | Evidence |
|---|---|---|
| Ops view A/B swap between "rebook" (night desk = B) and "hold" (night notes = A) | **Not noticed unprompted. Noticed when asked**, after checking the thread | She listed corrections (Code, Night dispatch) and said "View A is Dana's sheet, view B is current practice, same as in the rebook block." Asked, she found it in about a minute. |
| "Night dispatch" as a holder under "booking" | **Noticed unprompted** | "It's the only line in the reply with a shift instead of a team, so it jumped out." She folded it into "Ops, current practice". |

**Impact: high.** The flip is worse than the sub-team because it looks consistent. She had already written "Ops, Dana's 2019 sheet: hold means waiting on the customer" into the RFC draft due in Thursday's pre-read. Dana's sheet doesn't mention hold. Finance would have seen the contract side's "hold" next to their credit hold, with an owner who left on 15 Oct: "the P2 again: a disagreement with the wrong owner." **Sizing for #73:** fix before anyone pastes replies into a doc. The eval's split check covers "rebook" only, so this passes the ship bar today. A visible slip (sub-team) gets caught; a consistent-looking one gets copied. Her fix: stable letters across the whole reply, or source names ("night handover notes") she can rename herself.

### Win-condition verdict (GitHub #4)

**Partly met: met on the first run, not met on the second.**

| Criterion | Run 1 (Sun, 11 s) | Run 2 (Sun, 9 s, same file) |
|---|---|---|
| Whole thread in, untrimmed | yes: 12,040 / 24,000, carriers included | yes |
| ONE question | yes | yes |
| She wouldn't have thought of it | **yes**: "No. I've spent three weeks treating the carriers as the third meaning of a word." | **no**: "the fight I already knew about" |
| Drawn from the whole thread | yes: Tom's invoice line (early) + carrier EDI message (late) | no: the loudest part (the rebook argument) |
| Asks rather than proposes | yes: "matched to the original ref or the new tender ID?" | no: "should Ops keep one booking and send AMENDED…?" ("advice dressed as a question") |
| No "would you like me to…" offers | yes | yes |
| Joint roles + forum | yes, but the wrong room ("the carrier team lead isn't at the 27th") | yes, forum lowercased ("27 oct") |

**Tie-break result: broken, for one job.** Company Claude (same file, our purpose line as the prompt) produced the September question ("canonical definition of a booking") plus an offer; pushed once, a generic ownership question. She now opens the coach first on a new thread for the question, then takes the rest to company Claude (history, drafting, events). She has not yet used the coach's question in the room; Ravi gets it today. Risk to the tie-break: run variance, and her own caveat that Ravi may find the question obvious.

### Learning retest (#26 metric, delayed recall, 4 days after 05c)

- **Unprompted reuse: YES.** [supports learning goal] Before anything was shown, her pre-read question used the real-case move: "Load 47356 changed carrier on the same lane and shows REBOOKED. Load 46771 changed pickup date and shows AMENDED. Finance: which of these should produce a second invoice, and who voids the first?" She deleted the abstract draft ("is a rebook one booking or two?") herself. Past behavior outside the product: Friday's PR comment to Ravi, "what happens to 47356 with this change?", which she didn't notice as a move until asked. On Monday she also applied "check it yourself first" to the coach's own question (ledger export before asking anyone).
- **Named: NO.** [challenges learning goal] Her words: "Put a load on it." She couldn't recall "ask about one real case" or any technique name; recognised it on sight in 05b ("seeing the words didn't add anything to the move").
- **Caveats.** [challenges learning goal] The reused move predates the coach (Dana, September; interview 02). The one move that was new in 05, "ask what made the difference", decayed into a ruling question: "Last week I asked what made the difference. This week I asked them to pick a winner." So the metric is met for a move she already had; the coach's new teaching isn't retained unprompted.

### Notice checklist status (live, 19 Oct)

| Item | 04a | Now | Note |
|---|---|---|---|
| Company that processes the text | half | **half** | OpenRouter named; "an AI model provider" still wrong; OpenAI not named; model changed and the notice didn't say |
| Retention at OpenRouter and the provider | missing | **missing** | "Nothing is stored on our server" only |
| Training use, with a link | missing | **missing** | no link |
| A page to forward to security | missing | **missing** | "For our security review it's still zero" |
| Operator named | missing | **missing** | — |
| (Not on the list) named "don't paste" list | concept only | **yes (live)** | "rates, lanes or contract terms" shipped with #69 |
| (Not on the list) visual weight | small, muted | **fixed** | ink, body size, border, blue edge: "not small print any more" |

**1.5 / 5 on content, unchanged.** Weight fixed by #69. Exploration 05b's notice would reach 2/5 (company). A forwardable page is the item that matters to her security review.

### Checks: #68 and #66

- **#68 (after starting over, is her last pasted thread restored?): No. Verified by her run.** She pressed New conversation → Clear for the second run and the box was empty (her draft was empty); she re-pasted from the file. Consistent with the code (`restoredDraft` only after a refusal) and the open issue. New reason for #68: re-running the same thread to check the coach. "If the tool wants me to trust its question, it should make the second run one click."
- **#66 (refusal buttons visible without scrolling): Not verifiable.** No refusal in her session (12k + 3 follow-ups is far under the 64k conversation cap), and the demo never triggers one on video. The issue is open and `ExchangeOutcome` doesn't scroll, so 04a's finding presumably stands. With a 24k/64k cap, she's less likely to reach a refusal at all.

### Exploration 06, "Structured reply": keep, change, cut

**Keep**
- The question in its own box: it's the one thing she copies. "The question in its own box is easier to select."
- Stray markup stays plain text (`s3`), and the cut note (`s2`).
- Guess styled differently from From thread (the contrast is the point).

**Change**
- Keep "(view A)/(view B)" in the Team cell. Today's parser would put "(view A) means …" in Meaning and "Means …" in every row. "If it turns into two rows both saying 'Ops'… it looks like a typo."
- Keep joint roles and the forum in the question box; the mock's "Question for the ops lead" is single-holder.
- Show a chip only for Guess, not "From thread" in every row. "The 'From thread' problem in a different font."

**Cut**
- Nothing structural. Defer it: "Raw text was fine on Sunday." (#64 is lower priority than the question's stability.)

### Exploration 05b, "Why this question?" v2: keep, change, cut

**Keep**
- One visible move line per question. "One line per question is fine." The folded move from 05 is now read.
- No technique toggle; technique names inside "why".
- The corrected hotspot line ("to come back to"). Passes her spot check against the talks.
- The notice wording naming OpenAI and the model.

**Change**
- Put the Evans source after the half it backs. "Half the sentence passes. The half that tells me what to do is yours." (#58)
- Copy obeys the move: a "check it yourself first" question never lands on the expert list. Flagged in 05, still unfixed. "The why is right and the copy still ignores it."
- Refresh the fixture: Dana left on 15 Oct. "A concept nobody's reread."

**Cut**
- The "30-minute slot with Dana" framing and every "for Dana" label.

### Roadmap assumptions this interview challenges

- **#4: the ship bar (question spans two distant parts of the thread) means a non-obvious question.** Run 1 passed; run 2 spanned less and proposed the answer. Stability is the new gate, and "asks rather than proposes" isn't checked. The view A/B split is only checked on "rebook", so the swap under "hold" passes the eval.
- **#73 / #4: view labels are a cosmetic slip.** The flip reached her RFC draft and would have misled finance on Thursday; the sub-team she caught. Consistent-looking errors are the dangerous ones. Size #73 as a fix before paste-into-doc use, with an eval check across every word.
- **#4: the cap raise is plumbing; the prompt is the product.** The win question came from text the 8k cap made her cut in 04a. The raise was half the win.
- **#26: learning happens through the "why".** The reused move predates the coach; the move the coach taught decayed in 4 days. Visible move lines got her to read it twice, not to do it alone. The metric "reuses a move unprompted" needs a novelty qualifier (a move she didn't have before).
- **#34: sanitized-only is a one-time cost.** It's a per-thread cost (about 15 minutes), and now that the reply is worth having, it's the cost that decides use. Her next unsanitized thread still goes to company Claude.
- **#55 / #69: visual weight fixes the notice.** It fixed reading, not trust: 1.5/5. The model changed and the notice didn't. #55's content is what the security review needs.
- **#58: a source line makes a claim checkable.** Only if it sits on the part the source backs. The 05b Evans line covers the coach's advice too.
- **#64: structure makes replies more useful.** It changes reading, not copy-out, and the mock's parser loses the view labels and joint roles the prompt fought for.
- **#6: the export is the table.** Unchanged (frozen). Her Sunday copy-out was one question and one word block; she deleted "From thread:" by hand. Labels stay out of anything copied.
- **#68: starting over is for refusals.** She started over to re-run and check the coach. Variance makes #68 more valuable.
- **#66: refusals are a daily path.** Not reached at 12k with a 64k cap. Lower urgency for her; still open.
- **#7 (B38): the conversation cap is the next wall.** Not reached this time. Lower urgency now.
- **#70: synthetic interviews are enough to judge the question.** Whether the tender-ID question is non-obvious depends on what Ravi already knows. Only a real team can say.

### Small suggestions

1. **Question asks, never proposes.** (#4 eval)
   - *Smallest result:* a soft check `questionAsks` fails when the question contains "should … instead of", "so Finance/Ops …", or offers the answer as one option with a reason; add it to the ship bar at 3/3 per fixture.
   - *Acceptance:* the demo's run 3 question ("should it remain one booking for Finance while Ops sends an AMENDED carrier update instead of…") fails; the video question and F2's question pass; terra v4 re-run scores 3/3 on F1.
2. **View labels keep the same group across the whole reply.** (#73, #4 prompt + eval)
   - *Smallest result:* one prompt line ("view A and view B keep the same group for every word; if a group has no view on a word, leave it out") and extend the split check from "rebook" to every word block.
   - *Acceptance:* on F1, every "Ops (view A)" line across all words matches the day-desk key and every "(view B)" the night key, in 3/3 runs, and 0 holders are a shift or desk name ("Night dispatch", "day desk").
3. **Run it again with the same paste.** (#68, narrow cut)
   - *Smallest result:* after Clear, if the log had a first message, the box offers "Paste your last thread again" and fills the first prompt exactly.
   - *Acceptance:* paste 12,040 chars, get a reply, New conversation → Clear → choose it: the box holds the first prompt byte for byte, count 12,040 / 24,000, log 0 entries, one click.
4. **Exploration 06 keeps the view label and joint roles.** (#64, before it's built)
   - *Smallest result:* the parser reads "<Team>[ (view X)] means <meaning>" and the question's full role string.
   - *Acceptance:* parsing the demo's F1 reply gives Team "Ops (view A)" and "Ops (view B)"; 0 Meaning cells start with "(view" or "Means"; the question box reads "Question for the ops lead and the finance controller, at the …".

### Questions for the real-practitioner session (#70)

What this synthetic series can't settle:

- Paste your own messy thread twice. Is the question the same both times? Which one would you take to a meeting? (Variance is the biggest risk to #4, and a synthetic persona can't feel it.)
- Show the question to a colleague who knows the system. Is it non-obvious to them, or only to you? (Priya's Ravi test.)
- Ask your approved AI tool the same thing with the same prompt. Which answer would you act on first, and why? (The tie-break, with a real tool and real stakes.)
- Four days later, without the tool open, write the question you'd bring to your next review. Which move did you use? Did you have it before the coach? (#26, with a novelty baseline.)
- What would you have to strip from your thread before pasting it here, and how long does that take? (#34 cost, measured.)
- Read the "Ops (view A)/(view B)" lines across two words. Who are A and B in each? Would you have caught a swap before copying a row into a doc? (#73: one synthetic miss isn't a rate.)
- Would your security team accept this notice, or what would they ask for? (#55: a real reviewer, not Priya's checklist.)
