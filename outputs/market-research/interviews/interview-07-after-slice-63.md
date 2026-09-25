# Synthetic interview 07: Priya Raman, after slice 63 (prompt v8, real replies)

*Synthetic interview. Treat every point as a hypothesis until a real practitioner confirms it.*

It's Wednesday 28 October 2026, the day after the 27 Oct finance review and nine days after interview 06. The session was a 30-minute video call at lunchtime, with Priya on her personal laptop. Per `outputs/market-research/README.md` it tests only deployed things, for the solo-prep ICP. It has no conference-visitor probes, and the #70 questions stay reserved for a real practitioner. The #73 retest uses **real replies from the production prompt**, not planted slips.

Live facts behind the probes, from `outputs/demos/slice-63.md`, `slice-63-deploy.md`, `slice-63.png`, `outputs/evals/slice-03/summary.md` and the repo:
- Production is deploy `6ab6be0b…`, built from `6d9c354`. It runs `openai/gpt-5.6-terra` at effort `none` with coaching prompt **v8**.
- #73 is closed. #63 "Try an example thread" is live: it fills the box with a 3,492-character fictional #late-loads thread and sends nothing, and it's hidden once a conversation exists.
- #75 is live. Refusal actions now depend on the cause. Unverifiable or conversation too long shows Copy + Start a new one. Message too long or access expired shows Copy only, and the password form appears inline with the draft kept. There's also a "This browser stays unlocked for 90 days." line.
- #77 (split labels inconsistent) is open. So are #76 (two words, one meaning), #68, #5, #6 and #70.

**The replies she read.** She read the three runs of the v8 full eval on fixture F1, `booking-split` (`2026-09-25-openai-gpt-5-6-terra-v8.json`). All three had the same input: 20,000 characters, `promptSha256 84fd7864…`. They took 8.4 s, 7.3 s and 7.5 s, and the eval used the production prompt assembly with no nonce. F1 is the fixture closest to her situation. It's a fictional, sanitized #booking-split channel export with booking, rebook, hold, booking count, the day desk and night desk, clause-7.3-style contract talk, a dashboard query, and the "Tue 27 Oct booking-split RFC review" as the forum. It is **not her 12,040-character thread**. It's longer, it ends with the night desk's two Customer B rebooks, and it contains a character named Priya who asks the booking-count question at 11:20. Nothing of hers was pasted anywhere. The reply texts below are verbatim, with nothing reworded. She read them one at a time, with no hints, and had the fixture open with search. No paid calls were made for this interview.

## Part A: since interview 06

**Q:** Yesterday was the finance review. What happened in the room?

**Priya:** It was booked for an hour and took forty-five minutes: Tom, Maya, Ravi, me, and Marcus for the last twenty. The pre-read had my two loads, 47356 and 46771, plus one fact line from Ravi. The loads took ten minutes. Finance agreed 47356 is a second invoice, because clause 7.3 makes a carrier change a new tender, and that 46771 should never have had one. <mark>Nobody asked what a booking is. First meeting since July.</mark> What's left to fight about is the count, not the word.

**Q:** The question the coach gave you on the 18th, the tender-ID one. Did it land?

**Priya:** Not as a question. I sent it to Ravi on the Monday, like I said. He didn't know either, and he had to go and look. The ledger import reads the booking ref and nothing else, and the new tender ID only lives in the EDI log, so the second carrier invoice on 47356 got matched to the old booking by hand in finance. That went into the pre-read as one line. In the room Tom said his team hand-matches about a dozen of those a month and hadn't tied them to rebooks. <mark>That line got more attention than my two loads. It turned the rebook argument into hours on his team.</mark>

**Q:** So is that the coach's win?

**Priya:** Half of one. The coach found the gap and Ravi found the answer, and I'd have gone in without either. It also passes your Ravi test from last time: he didn't say "obviously", he went and checked, so I wasn't the only one who'd missed it. But what landed in the room was a fact, not a question, and the coach didn't write the fact. <mark>The question got me to the answer a week early. That's what it's for.</mark>

**Q:** What have you run through the coach since the 19th?

**Priya:** Once. On Wednesday the 21st I pasted finance's pre-read comments with Maya's thread, about four thousand characters. Its question was about 46771, which was already in the pre-read, so I didn't bother with a second run. On Thursday I deleted every sanitized copy off the personal laptop, as I told you. Nothing since, because anything I paste now means sanitizing from scratch. <mark>The review made the next paste more likely, and the sanitizing didn't get any cheaper.</mark>

**Q:** What's still open after the review?

**Priya:** Two things, both for Friday's RFC. The first is the count. The dashboard counts both rows of a rebook, the night desk subtracts them in their heads, and finance counts invoiceable loads from the ledger. Tom wants "booking count" to mean finance's number, and Maya needs a shift-plan number that isn't that. The second is that the night desk will keep using REBOOKED for date-only changes until Ravi's amend-sync fix ships, so the RFC has to say what the count does in the meantime. That's my action item.

## Part B: three real replies to the same thread

*(The interviewer shared the F1 fixture and said: "The team runs every prompt version against this thread. It's fictional and built around your situation. Here are three replies the live prompt gave to it, one at a time." She skimmed it for about six minutes with search open.)*

**Q:** Before the replies: what is this thread to you?

**Priya:** It's us, with some of the names changed and some not. There's a Priya in it asking my count question at 11:20, "same word, three numbers", which is flattering and a bit creepy. Dana's still in it, and Dana left. It's twenty thousand characters against my twelve, and it ends with the night desk's Customer B rebooks, which mine doesn't have. <mark>Close enough to judge the coach. Not close enough to judge whether the question surprises me.</mark> If it hands my count question back to me, that's no surprise, because someone put it in there.

*(Reply 1, verbatim, v8 full eval, `booking-split 1`, 8.4 s, 422 words:*

```
Events, in order
1. From thread: Customer submits on the portal and Ops starts working the request.
2. From thread: Ops tenders to a carrier, and the carrier accepts through CARRIER_ACK.
3. From thread: For a same-carrier date change, night dispatch uses Rebook because Amend does not sync the new date to the carrier portal.
4. From thread: Rebook sets the old row to REBOOKED, creates a new row and ref, and can make the carrier see a cancelled load and new tender.
5. From thread: A booking becomes invoiceable at delivery when proof of delivery closes it.

Words that don't match
"booking"
- From thread: Ops (view A) means the customer's submitted request that the desk starts working.
- From thread: Ops (view B) means the item night dispatch rebooks when dates, carriers, or other load details change.
- From thread: Finance means an invoiceable item counted from the ledger export.
- From thread: Carriers mean a load or tender, not a booking.
- From thread: Code creates a booking row on submit and creates another row on rebook.

"rebook"
- From thread: Ops (view A) means a new booking when the carrier or lane changes; a same-carrier date or window change is AMENDED.
- From thread: Ops (view B) means the action used for date changes, carrier drops, and lane changes because it reaches the carrier portal.
- From thread: Finance means a new booking with a separate invoice while the old one is voided.
- From thread: Carriers mean cancelling the original load and sending a new tender, which can trigger a TONU.
- From thread: Code means marking the old row REBOOKED and inserting a new row with a new ref.

"booking count"
- From thread: Ops means every non-CANCELLED row in the dashboard, with night dispatch subtracting rebooks manually.
- From thread: Finance means invoiceable bookings in the ledger export.
- From thread: Code counts every row whose status is not CANCELLED, including both rows from a rebook.

"hold"
- From thread: Ops (view A) means waiting on customer.
- From thread: Ops (view B) means a booking waiting on the customer.
- From thread: Finance means a credit hold on the account that stops shipment.

Question for the ops lead and the finance controller, at the Tue 27 Oct booking-split RFC review: For the Customer B same-carrier date change that night dispatch rebooked after the truck was already rolling, which count should include the original REBOOKED row, the new row, or neither before proof of delivery?
```
*)*

**Q:** Reply 1. Read it the way you'd read it on a Sunday.

**Priya:** I've read the letters first since the 19th. I went down every "(view A)" and searched the thread. Under "booking" and "rebook", view A is the day desk: Dana's 2019 sheet, "same booking, same ref". View B is the night desk. Under "hold" it's the same: the day desk says "waiting on customer" and the night shift started saying hold. <mark>Same group under every word. First reply I've checked that holds.</mark> No shift turns up as a holder, and "night dispatch" sits inside the meaning, where it belongs. But the two "hold" lines say the same thing twice. Dana's 3:50 line says the day desk doesn't use the word at all, so it isn't a split. It's the night desk borrowing finance's word, and the reply hides that.

**Q:** The question. Does it ask or propose? Would you have thought of it?

**Priya:** It asks: three options and no favourite, about one load, the second Customer B change with the truck already rolling. The count half isn't new to me. The Priya in the thread asks it at 11:20, and it's been my action item since yesterday. The rolling truck I hadn't joined to it. That old REBOOKED row isn't nothing: a truck moved and the carrier bills a TONU, and finance's "invoiceable" has nowhere to put a row that costs money and earns none. <mark>It's my question, with a load on it that I hadn't picked.</mark> I'd cut "before proof of delivery", though. Finance answers that part with "neither" and goes home.

**Q:** Any offers? And would you paste a block of it into the RFC glossary?

**Priya:** No offers, same as on the 18th. The "rebook" block would go in almost as it is, with "view A" and "view B" swapped for "day desk" and "night desk" by hand. "Booking count" too: dashboard, ledger, code, my three numbers. "Hold" I'd rewrite as one line. <mark>Two blocks usable and one to fix, and the fix is one I can see.</mark> The date's in capitals now, which I noticed because last time it wasn't.

*(Reply 2, verbatim, `booking-split 2`, 7.3 s, 422 words:*

```
Events, in order
1. From thread: Customer submits a request on the portal and Ops starts working it.
2. From thread: Ops tenders the load, the carrier accepts, then pickup and delivery occur.
3. From thread: A same-carrier date change can be AMENDED in place, but AMENDED does not currently sync to the carrier portal.
4. From thread: Night dispatch uses REBOOKED for date changes, creating a new ref, and the carrier sees a cancelled load plus a new tender.
5. From thread: Finance treats a booking as invoiceable only after proof of delivery.

Words that don't match
"booking"
- From thread: Ops (view A) means the customer's submitted request that the desk starts working.
- From thread: Ops (view B) means the work item night dispatch rebooks when a date changes or a carrier drops the load.
- From thread: Finance means an invoiceable shipment after proof of delivery.
- From thread: Carriers mean a load or tender, not a booking.
- From thread: Code creates a booking row on submit; rebook! creates another row with a new ref.
"rebook"
- From thread: Ops (view A) means a new booking for a carrier change or lane change, while a same-carrier date or window change is AMENDED.
- From thread: Ops (view B) means REBOOKED for date changes, carrier drops, and other changes because it reaches the carrier portal.
- From thread: Finance means a separate booking with its own invoice while the old one is voided.
- From thread: Carriers mean cancelling the original load and sending a new tender, which can trigger a TONU.
- From thread: Code marks the old row REBOOKED and inserts a new row with a new ref.
"booking count"
- From thread: Ops means dashboard rows that are not CANCELLED, including both rows of a rebook.
- From thread: Finance means invoiceable bookings from the ledger export.
- From thread: Ops (view B) means the dashboard total less rebooks manually subtracted during the night shift.
"hold"
- From thread: Ops (view B) means a booking waiting on the customer.
- From thread: Finance means a credit hold on the account that stops shipment.
- From thread: Ops (view A) says “waiting on customer,” not hold.

Question for the ops lead and the finance controller, at the Tue 27 Oct booking-split RFC review: For the same-carrier date change that occurs after CARRIER_ACK, should the working item remain one booking and be AMENDED, or become a new booking through REBOOKED while finance counts only the delivered replacement?
```
*)*

**Q:** Reply 2.

**Priya:** I read the question first this time, because I've learned where the trouble lives. "Should the working item remain one booking and be AMENDED, or become a new booking through REBOOKED while finance counts only the delivered replacement?" <mark>That's my run 2 from the 18th again, nearly word for word.</mark> It's a ruling. It asks us to pick a side in the fight we had in July, and the second option arrives with finance's answer attached. There's no load, no customer and no date in it. It has an "or" in it, so it looks like a question, but I wouldn't take it into a room.

**Q:** And the labels in this one?

**Priya:** The letters hold again: A is the day desk everywhere and B the night desk. Under "hold" it finally says the day desk "says 'waiting on customer,' not hold", which is the line reply 1 got wrong. Then "booking count" has a plain "Ops", then Finance, then "Ops (view B)". <mark>A view B with no view A.</mark> I read the plain line as Ops as a whole and view B as the night desk's exception. That's how it would have gone into the RFC.

**Q:** Whose is the plain "Ops" line? Check it against the thread.

*(She searched "dashboard" and read for about a minute.)*

**Priya:** It's 11:26 and 11:30. "Rows that are not CANCELLED, including both rows" is Sam's sentence about the query, and Dana says the day desk uses that number for the shift plan. So the plain line is view A with its letter missing, plus the code's definition with Ops's name on it. There's no Code line in that block at all. In the RFC it would read as Ops counting dashboard rows, with the night desk as a footnote. <mark>Maya runs ops now, and it's her desk that would be the footnote.</mark> It's less bad than the 19th, because nobody gets credited with something they didn't say. A missing letter I can see once I look. A swapped letter I couldn't.

*(Reply 3, verbatim, `booking-split 3`, 7.5 s, 383 words:*

```
Events, in order
1. From thread: Customer submits on the portal and Ops starts working the request.
2. From thread: Ops tenders the load and the carrier accepts it as CARRIER_ACK.
3. From thread: A same-carrier date change can be AMENDED or REBOOKED before or after carrier acceptance.
4. From thread: REBOOKED cancels the original load for the carrier and creates a new tender, which can trigger a TONU after dispatch.
5. From thread: Proof of delivery makes the load invoiceable.

Words that don't match
"booking"
- From thread: Ops (view A) means the customer's submitted request that the desk works from its booking ref.
- From thread: Ops (view B) means the work night dispatch rebooks when a date changes or a carrier drops the load.
- From thread: Finance means an invoiceable load counted from the ledger export after proof of delivery.
- From thread: Code creates a booking row on submit, and rebook! creates another row with a new ref.
"rebook"
- From thread: Ops (view A) means a carrier or lane change creates a new booking; a same-carrier date change is AMENDED.
- From thread: Ops (view B) means any date change or carrier drop uses REBOOKED because Amend does not reach the carrier portal.
- From thread: Finance means a new booking with its own invoice while the old booking is voided.
- From thread: Carriers mean cancel the original load and send a new tender.
"booking count"
- From thread: Ops means the dashboard count used for the shift plan, including rows that are not CANCELLED.
- From thread: Finance means invoiceable bookings from the ledger export.
- From thread: Code counts every row whose status is not CANCELLED, so a rebooked shipment counts twice.
"hold"
- From thread: Ops (view A) means “waiting on customer.”
- From thread: Ops (view B) means a booking waiting on the customer.
- From thread: Finance means a credit hold on the account that stops shipments.

Question for the ops lead and the finance controller, at the Tue 27 Oct booking-split RFC review: For the second Customer B same-carrier date change, where the truck was already rolling and night dispatch used Rebook, which booking count should include the old REBOOKED row, the new row, or neither before proof of delivery?
```
*)*

**Q:** Reply 3.

**Priya:** It's the same question as reply 1, nearly word for word: second Customer B change, rolling truck, old row, new row, or neither. The letters hold, A day desk and B night desk, under every word. It has the same "hold" pair saying the same thing twice. Carriers have dropped out of "booking", but they're still under "rebook", so I don't mind. <mark>If I'd run it once and got this one, I'd have taken it.</mark>

**Q:** Across the three: do you get the same quality every time?

**Priya:** Two out of three, and those two are the same question. That's new. On the 18th I got two different questions from two runs. And the bad one has a tell: no load, no customer, no date. <mark>If the question hasn't got a load in it, it's the wrong run.</mark> I can spot that in five seconds without opening the thread.

**Q:** Would you trust it to run once?

**Priya:** No. I'd run it twice. If both have a load and they match, I'm done. If one hasn't, I take the other. I told you last time that if I have to run it twice and pick, I'm the coach. <mark>Picking a question with a load over a ruling isn't coaching, it's triage.</mark> So I've half changed my mind: twice is fine if the pick takes five seconds. At three runs I'm back to being the facilitator.

**Q:** Go back to "booking count" in replies 1 and 3. Anything now?

*(She reread both blocks.)*

**Priya:** Reply 3 has a Code line and one Ops line, "for the shift plan", which is the day desk. The night desk's subtraction isn't there at all. Reply 1 has one Ops line with "night dispatch subtracting rebooks manually" in it: both desks in one sentence, no split. I read both as fine the first time. <mark>Three replies, three ways to write the Ops side of one block, and only one of them has a label wrong.</mark> The letters are stable now wherever they appear. Whether they appear at all is still luck.

## Part C: "Try an example thread" (#63), solo

*(She opened the live app on her personal laptop. The browser was still unlocked from 22 Oct. She clicked "Try an example thread" in the empty app: the box filled with "Example thread (fictional). #late-loads at a made-up freight broker…", 3,492 characters, focus in the box, and nothing was sent. She didn't send it. The interviewer then played the demo's recorded production reply from 25 Sep (video 1:36). Its question: "Question for the account lead and the billing lead, at Friday's service review: For Customer D's load 7731, which result belongs in the Q3 on-time % and decides the service credit: delivered 40 minutes before the appointment or picked up 3 hours after the pickup window?" The demo's caption names the two lines it joins, "Mon 08:11" and "Thu 09:30". The reply itself doesn't.)*

**Q:** Think back to your first Sunday, the one with the 8k cap. Would this button have helped?

**Priya:** That Sunday, no. I came with my file, and I was annoyed about the cap, not wondering what the tool does. Where it would have helped is before that Sunday. I spent fifteen minutes sanitizing twelve thousand characters on the strength of your purpose line. <mark>The example is the free sample before the fifteen minutes.</mark> One click, nothing sent, and I'd know whether the paste was worth it.

**Q:** Does the example's question show you the value?

**Priya:** Yes. It picks one load, 7731, and sets a Monday rule against a Thursday credit. That's my move, on someone else's thread, in about seven seconds. I found the two lines, 08:11 and 09:30, in under a minute, because the example has timestamps and desk names. The reply doesn't show them, so I had to go looking. <mark>Your video caption did the work the reply should.</mark> At the meetup I said the example has to prove the question. It does, if you go looking.

**Q:** Would it make you paste your own thread?

**Priya:** It'd make me sanitize one, and that's the real ask. There's a catch, though. In the example the speakers are "Ops day desk" and "Ops night desk", so view A and view B check themselves. My thread has people's names, the reply strips them, and I have to map Maya to the night desk myself. <mark>The example makes the letters look easier than they are on a real thread.</mark> Still, it's the right first screen for someone who hasn't got a file open.

## Part D: refusals (#75), brief

**Q:** If a message is too long, you now get Copy only, with no "Start a new one". Does anything in that change matter to you?

**Priya:** Copy only is right. Starting over doesn't make my paste shorter, and a button that pretends it does wastes a click. The one I care about is access. If my ninety days run out in the middle of a paste, the password box comes up in place and my draft stays. <mark>That draft is fifteen minutes of sanitizing. Keep it and I'll forgive the password.</mark> I haven't hit either of them; twelve thousand characters in a twenty-four-thousand box won't.

## Part E: close

**Q:** After yesterday, do you still need the tool?

**Priya:** For the RFC, no. Friday's work is rows, loads and commit hashes, and I have the questions I need. The rest is writing, which is company Claude's job or mine. For the next thread, yes. Carrier integrations want to rename "tender" in November, and that's the same mess with a different word. <mark>The tool's for the week before a meeting, not the week after.</mark>

**Q:** What from today goes into the RFC by Friday?

**Priya:** The shape of reply 1's question, with our own load in it. Customer B isn't ours, but Ravi says we had two rolling-truck rebooks in September, so I'll use one of those, drop "before proof of delivery", and make it the RFC's one open question with a settle-by date. Plus the "rebook" block's layout, with desk names where the letters are. <mark>The coach's question, our load.</mark> Nothing from reply 2.

**Q:** The one thing for the next month?

**Priya:** Say whose view it is: "Ops, night desk", not "Ops (view B)". The letters held this time, and I still spent more time mapping letters to desks than reading the question, and the one bad label was a letter that went missing. <mark>A name can't go missing the way a letter does, and it's the name I paste.</mark> After that, the two lines the question came from, printed under it.

**Q:** Anything we should have asked and didn't?

**Priya:** Ask Maya whether "night desk" is even the name she'd use. They call themselves "nights". If the tool picks the name, it had better pick theirs.

---

## Interviewer notes (out of character)

Checked against the repo:
- The three replies are the verbatim `reply` fields of `booking-split 1–3` in `outputs/evals/slice-03/2026-09-25-openai-gpt-5-6-terra-v8.json`, with the same `promptSha256` for all three.
- Eval flags:
  - run 1: hard `same meaning not split`; soft `questionSpansThread: true`.
  - run 2: hard `split labels` + `same meaning not split`; soft `questionSpansThread: false`.
  - run 3: hard `same meaning not split`; soft `questionSpansThread: true`.
- The v8 eval says "Ships: no" by the strict n=3 bar. v8 shipped under #78's paired A/B rule for its non-thread gain (summary.md, "Decision: v8 ships").
- The view-group mapping was checked against `server/eval/fixtures/booking-split.key.json` markers ("same ref", "2019", "sheet", "shift plan" = day desk; "at night", "subtract", "reliably" = night shift) and the thread (11:26 Sam's query line, 11:30 Dana's shift plan line, 3:50 PM "day desk says 'waiting on customer', not hold").
- The example question and the "Mon 08:11 … Thu 09:30" caption come from `outputs/demos/slice-63.md` AC5 run 1 (production, browser). The example text is `src/shared/exampleThread.ts`.
- The fixture contains a character called Priya who asks the count question at 11:20. That biases her novelty judgement down for the count half of the question.
- Her review outcome and the Ravi answer are synthetic continuations of 06/06b.

### Key insights

1. **The 06 view slips are gone on real replies.** In all three replies, view A is the day desk and view B the night desk under every word where they appear. No shift or desk name appears as a holder: "night dispatch" appears only inside meanings. She checked the letters first (a habit since 06) and confirmed it unprompted. "Same group under every word. First reply I've checked that holds." [strong signal: verified against the fixture key, 3/3] [supports #73]
2. **The question is consistent 2/3, and the bad run has a visible tell.** Runs 1 and 3 ask nearly the same question: one load (the rolling Customer B rebook), three options, no favourite. Run 2 is the ruling she got on 18 Oct ("should … remain one booking … or become a new booking … while finance counts only the delivered replacement"). She triages by "no load, no customer, no date" in five seconds and now accepts running twice: "Picking a question with a load over a ruling isn't coaching, it's triage." [strong signal: 3 real runs, same input; contradicts her 06 stance] [#73, #78]
3. **The eval's `questionAsks` passes the ruling; her tell matches `questionSpansThread`.** Run 2 has an "or", so `questionAsks` passes, but `questionSpansThread` is false in the same run and in no other. Her "has it got a load?" test is a cheaper proxy that an eval check can copy. [medium: n=3, one fixture] [#73 eval, #78]
4. **#77's failure mode appeared once in three, and she saw the label but misread the meaning.** Run 2 has plain "Ops" plus "Ops (view B)" under "booking count", with no Code line. She noticed "a view B with no view A" unprompted. She then read the plain line as "Ops as a whole" and would have written that into the RFC, until asked to check (it's the day desk's number plus Sam's query definition). Impact is medium: it makes the ops lead's own desk the footnote, but it doesn't credit anyone with words they didn't say. [strong: behaviour on a real reply] [#77, #6]
5. **Letters are stable but expensive, and she wants names.** Even with 3/3 stable labels, she spent more time mapping A/B to desks than reading the question. She pastes desk names, not letters. The one label error was a missing letter, and "a name can't go missing the way a letter does". The example thread hides this cost, because its speakers are already labelled by desk. [medium: stated + her copy-out plan] [#77 U2, #76, #6]
6. **#63 is a solo aid before the sanitizing cost, not after it.** On her first real Sunday she'd have skipped it (she came with a file). It would have helped the evening she decided whether 15 minutes of sanitizing was worth it: "the free sample before the fifteen minutes." The example's question proves the move, but the reply doesn't show the two lines it joined, so she had to find them. [medium: stated, consistent with 06b] [#63, #34]
7. **The coach's value landed a week early, as an answer, not a question.** The 18 Oct tender-ID question went to Ravi. He had to check, so it wasn't obvious to him either (06's Ravi test passes). His answer went into the pre-read as one fact line and shifted the review from "what is a booking" to hours of hand-matching on Tom's team. "The tool's for the week before a meeting, not the week after." [medium: synthetic past behaviour across 06 → 07] [#4 value, #70]

### #73 verdict from real replies

Same input for all three: F1 `booking-split`, 20,000 chars, v8, terra, effort none, no nonce.

**Reply 1** (`booking-split 1`, 8.4 s)

| Check | Result | Evidence |
|---|---|---|
| Asks or proposes | **Asks** | "which count should include the original REBOOKED row, the new row, or neither before proof of delivery?" Three options, one load, no favourite |
| Novel to her | **Yes (partly)** | The count half is her 11:20 question and her action item. The rolling truck + TONU'd old row is new: "a row that costs money and earns none" |
| Views stable across words | **Yes** | A = day desk, B = night shift under booking, rebook, hold |
| Shift/desk as holder | **No** | "night dispatch" only inside meanings |
| #77 label issue | **No** (check passes) | "Booking count" has one plain Ops line that merges both desks. Missed on first read, noticed when asked |
| Offers | None | |
| Other | "hold" split into A/B lines that say the same thing (#76) | Noticed unprompted |

**Reply 2** (`booking-split 2`, 7.3 s)

| Check | Result | Evidence |
|---|---|---|
| Asks or proposes | **Proposes (ruling)** | "should the working item remain one booking and be AMENDED, or become a new booking through REBOOKED while finance counts only the delivered replacement?" No case, and the second option carries finance's answer. `questionAsks` passes it; `questionSpansThread` false |
| Novel to her | **No** | "That's my run 2 from the 18th again, nearly word for word." |
| Views stable across words | **Yes** | A = day desk, B = night under booking, rebook, hold (hold is correct here: "Ops (view A) says 'waiting on customer,' not hold") |
| Shift/desk as holder | **No** | |
| #77 label issue | **Yes** | "Booking count": plain "Ops" + "Ops (view B)", no Code line. The plain line is the day desk's number with the query's definition |
| Offers | None | |

**Reply 3** (`booking-split 3`, 7.5 s)

| Check | Result | Evidence |
|---|---|---|
| Asks or proposes | **Asks** | Same question as reply 1: "the old REBOOKED row, the new row, or neither" |
| Novel to her | **Yes (partly)** | As reply 1 |
| Views stable across words | **Yes** | A = day desk, B = night under booking, rebook, hold |
| Shift/desk as holder | **No** | |
| #77 label issue | **No** | "Booking count" has one Ops line (the day desk's shift plan). The night desk's subtraction is dropped. Missed on first read, noticed when asked |
| Offers | None | |
| Other | "hold" same-meaning split again (#76); Carriers missing from "booking" | Noticed unprompted, and she didn't mind |

**Overall: PARTLY FIXED.**

| #73 aim | 06 (planted, from the demo) | 07 (real v8 replies) |
|---|---|---|
| Views keep the same group | flip missed, caught when asked | **fixed: 3/3** |
| No shift/desk as holder | "Night dispatch" caught | **fixed: 3/3** |
| The question asks, not proposes | 1/2 | **2/3** by her read (3/3 by `questionAsks`) |
| Consistent runs | 2 different questions | **2/3 identical, 1 ruling** with a visible tell |
| Split labels (#77) | n/a | **1/3** plain Ops + view B |

### #77 sizing

- **Occurrence:** 1/3 on F1 in the v8 full eval (run 2), and 1/3 on F2 in the v8 A/B (`rebook-notes` r3), with no nonce in either. So the nonce wasn't the whole cause.
- **Noticed?** The **label** was noticed unprompted ("a view B with no view A"). The **meaning** was misread: she took the plain line for "Ops as a whole" and would have pasted it that way, and corrected it only when asked to check (about a minute).
- **Impact if pasted into the RFC glossary: medium.** The row would give "Ops" the dashboard definition (the day desk's number with Sam's query text, and no Code row) and make the night desk, which the ops lead now runs, the exception. Unlike 06's flip, no one is credited with words they didn't say. She rates it below the 06 flip: "A missing letter I can see once I look. A swapped letter I couldn't."
- **Related, not caught by the check:** replies 1 and 3 also write the Ops side of "booking count" differently (merged in one line, or the night desk dropped). The check passes both. She missed both on the first read.
- **Her fix:** group names instead of letters ("Ops, night desk"), which is #77's U2 fallback. It removes the "missing letter" mode and matches what she pastes.
- **Keep #77 open at P1.** Size it as a prompt change (group names) plus the eval's split-labels check extended to "every word that has an Ops line".

### Win condition across 3 real runs

**2/3.** Runs 1 and 3 give one question that asks about one real case, drawn from two distant parts of the thread (the 11:20 count exchange and the 11:55 PM rolling-truck rebook), with no offers, joint roles and the right forum. It's partly novel to her: new link, known topic. Run 2 is a ruling with no case, and she'd not take it into a room. Measured against 06 (1/2), and with a tell she can apply in five seconds, she now accepts "run twice, pick the one with a load". The same n=3 caveat as #78 applies: 2/3 is not a rate.

### #63 solo verdict

**Yes, as a first-visit aid, with one gap.** It's worth having for the solo ICP before she has invested in sanitizing: "the free sample before the fifteen minutes." It wouldn't have changed her first real Sunday, because she came with a file. The example's question (load 7731, Mon 08:11 rule vs Thu 09:30 credit) shows the move in about seven seconds.
- **Gap:** the reply doesn't show the two lines it joined. The demo caption does. She found them herself because the example has timestamps.
- **Caveat:** the example's speakers are labelled by desk, so view A/B look easier to check than on a real thread with names.
- **Effect on her:** it won't bring her back by itself. The next real thread will ("tender" in November).

### Planted-slip control

**Not run.** The real replies weren't clean. Reply 2 has the #77 label mix, and replies 1 and 3 have the #76 same-meaning split plus uneven Ops lines under "booking count". Real slips gave the detection data, so no plant was needed.

### Roadmap implications

- **#73 (closed):** the closure holds for views and holders (3/3 each on real replies). It holds only partly for "asks, not proposes" and consistency (2/3). The remaining miss is the ruling that `questionAsks` passes.
  - Add a soft `questionNamesCase` check: the question contains an identifier from the thread, such as a load number, "Customer X" or a message time. Runs 1 and 3 pass it and run 2 fails.
  - Consider promoting `questionSpansThread` failures to a re-run trigger in #78's rule.
- **#77 (open, P1):** confirmed on real replies at 1/3 without a nonce. Medium impact. Her fix, and #77's U2, is group names instead of letters. Extend the split-labels check to catch an Ops side that merges or drops a group under a word where the split exists elsewhere.
- **#76 (open):** "hold" is still split into two identical-meaning views in 2/3. She noticed and would rewrite it, so the impact is low, but it's the block she'd paste into the glossary. Run 2 shows the right shape: "Ops (view A) says 'waiting on customer,' not hold."
- **#6 (frozen):** her copy-out is the "rebook" block with letters retyped as desk names, plus the question with her own load. A future Team column needs group names, not letters. The table stays frozen until #70.
- **#26 (learning):** her "put a load on it" move has become her quality check on the coach ("If the question hasn't got a load in it, it's the wrong run"). That's a transfer of the move, but it's still a move that predates the coach (06).
- **#63 (closed):** keep it. Next small cut: print the two lines the question joins, which helps the example and real threads alike. Don't add a canned reply.
- **#70 (open, top research ask):**
  - The fixture has a "Priya" in it, so this interview can't judge novelty cleanly.
  - Whether "no load = wrong run" holds on someone else's real thread is a real-practitioner question.
  - So is whether "run twice, pick in five seconds" is tolerable.
- **#78:** 2/3 on n=3 is the same noise #78 describes. Don't treat it as a win rate.
- **#68 / #34:** running twice is now her standard, so #68 (last paste back after starting over) turns the second run into one click. Sanitizing (#34) is still the cost that decides whether a thread reaches the coach at all.

### Questions for the next interview

- (After her November "tender" thread) She pastes her own sanitized thread twice on the live coach. Does the "no load = wrong run" tell hold on her thread? How long does the pick take?
- (If #77 ships group names) Does she paste a word block into the RFC unchanged? Which name does the reply give the night desk, and does Maya accept it?
- Did the count question, with her own September load, get answered at RFC sign-off? By whom?
- (If the reply prints the two joined lines) Does she still search the thread before believing the question?
- (If #68 ships) Is the second run one click?
- (Kept for #70) the real-practitioner questions in interview 06, plus: "Run it twice. Which one would you take, and how did you choose?"
