# Synthetic interview 05: Priya Raman, explorations 03b, 02b and 05

*Synthetic interview. Treat every point as a hypothesis until a real practitioner confirms it.*

Wednesday 14 October 2026, five days after interview 04b. Dana's last day before her leave is tomorrow. Shown, in order: Exploration 03b, "Leave with a table" v2 (`c1` → `c5`, clicked through `table-v2.html` once, with Copy table pasted into a scratch Confluence page on her own laptop); four stills of Exploration 02b, "Honest limits" v2, revised after 04b (`b1`, `b5`, `b6`, `b7`); Exploration 05, "Why this question?" (`w1` → `w4`, used live in `why.html`). Told plainly that all three are concepts, not built, and that the rows come from a demo thread, not her real one. Also told, in one sentence, that #58 will cite Evans's *DDD Reference* in the coach's replies. The paste box, the Sunday replay, the notice work and #61 are held for interview 04a.

## Part A: since last time

**Q:** It's been five days. What's moved on the RFC?

**Priya:** Maya joined the reviewers on Monday, as planned. On Saturday I renamed Status to Source in my own table by hand and added links. That took eleven minutes, not five, because Slack search for a July thread is bad. The glossary has nine rows now, with the two ops rows and the Code row. Marcus still hasn't opened it.

**Q:** What did Maya do with the two ops rows?

**Priya:** She changed one thing. "Ops, current practice" became "Ops, current practice (since the 2024 portal change)." She left "Dana's 2019 sheet" alone and didn't mention Dana at all. <mark>She corrected a date, not the framing. That's the best review comment I've had on this RFC.</mark>

**Q:** And Dana?

**Priya:** Her last day is tomorrow. On Monday I sent her three yes/no lines, including the TONU one on 48213, and she answered all three by lunch. So from Thursday, anything marked "for Dana" is a question for nobody. Ops questions go to Maya, and Maya answers the rebook question the other way.

## Part B: Exploration 03b, "Leave with a table" v2 (concept, not built)

*(Shown `c1` swaps → `c2` preview → `c3` table → `c4` next step and yes/no lines → `c5` pasted into the RFC. She clicked through `table-v2.html`, pressed Copy table, and pasted into a blank Confluence page.)*

**Q:** Last time you gave us a list of verdicts on the table. Did 03b apply them?

**Priya:** It applied every verdict about the columns and none about the cells. Source is there, "Code" is a Team value, one date sits above the table, there are no URLs anywhere, and there's no DDD word in it. That's five for five on structure, and in September I'd have taken that. Then I read the rows.

**Q:** Run your own test on c3 and c4: nothing missing, nothing stale.

**Priya:** Stale first. The first yes/no line for Dana is "A rebook to a new carrier keeps the same booking." Your own table says that row was "Checked with Dana 29 Sep." <mark>So the tool asks Dana to confirm the one thing it says she already confirmed, and it doesn't ask the thing that's open, which is lane changes.</mark> Then every "Slack #booking-split, Tue" goes stale next week. It's copied from "rejected tue" in the thread, so it's a relative day. Missing: the second ops row. The split is still a red chip under one row, not two rows.

**Q:** Last time you said the red split chip was fine in the tool.

**Priya:** In the tool, yes. Look at c5. In the doc it landed as "(ops is split on lane changes)", lowercase, in brackets, after the meaning. That's the exact thing I flagged last time. Maya would read it on Monday as "Priya thinks my team is wrong." <mark>Two rows credit a practice. A bracket credits a complaint.</mark>

**Q:** The Code row. Is it right?

**Priya:** It's right, and that's what bothers me. "The screen keeps the booking; the database writes a new one" is what I found in `rebook!` last Tuesday. But look at what c2 says was sent: five lines of Slack and no code. So where did "booking.rb" come from? <mark>If I didn't paste it, it's a guess, and a correct guess with no "Guess" label is worse than a wrong one, because I stop checking.</mark> It's also the row Marcus opens first.

**Q:** You pasted Copy table into Confluence. Would c5 survive the 27 Oct review as it is? What would you retype?

**Priya:** No. Two things didn't come with the paste at all: the "Settle by 27 Oct" line and the open questions. The mock RFC in c5 shows the date line, but the clipboard only had the table, so I'd type both. Then the four "Tue" cells become real dates, the Rebook ops row becomes two rows with "Checked with Dana, 8 Oct", and I'd fix the TONU source. About eight minutes, against ten last time. <mark>The minutes are in the cells now, and 03b didn't touch the cells.</mark>

**Q:** What's wrong with the TONU source?

**Priya:** After I click "I checked", it says "Load 48213, checked by you · Dana to confirm." In a doc, "you" is whoever's reading it. And Dana is out from tomorrow, so that's a name on a job nobody will do. I'd write "Load 48213, invoice lines, checked 2 Oct." What I liked is that clicking "I checked" replaced the cell. <mark>That's the mechanism I asked for. It works on one cell. Do it for everything I type.</mark>

**Q:** The open questions now say who settles each one, as a role. Is that what you asked for?

**Priya:** It's what I said, and it turns out I was wrong about why it would work. "Is a rebook the same booking? · Ops lead." Since Monday, the ops lead is Maya. <mark>A role with one person in it is a name.</mark> It hands Maya the definition, which is the thing I was trying to avoid. The third question gets it right with "Engineering, with finance." The first two need the same shape: "Ops lead and finance controller, at the 27 Oct review."

**Q:** Anything about the next-step card or the swaps?

**Priya:** The card is marked for me, not Dana, which is what I asked for, and "without spending Dana's time" is the right reason. But there's one button, "I checked: yes, a truck was sent." What if the answer's no? Then it's the bug finance is afraid of, which is the more important answer. And the swap chip "Maya → Ops" now wipes out the only difference the table needs. I'd make it "Maya → Ops, current practice" myself, so that's fine.

## Part C: Exploration 02b, "Honest limits" v2 (concept, not built; quick check)

*(Shown `b1` the cut with Continue, `b5` "This conversation is full", `b6` the carried board, `b7` the previous conversation, read-only. Told it was revised after 04b.)*

**Q:** Quick check on b6. Did the carried board keep everything?

**Priya:** Three questions went in and three came out, plus a fourth from the enum paste, "AMENDED: Dana's sheet vs the code." The 48102 one is there, marked "for you to check," which is right. And the AMENDED note is gone. <mark>But it's gone because you took it out of my notes, not because the carry-over dropped it.</mark> In b7 my old note now reads "RB = same bkg, new carrier." I never wrote that on the 22nd. The concept never has a correction replace a note, so it can't pass or fail that test.

**Q:** Anything else?

**Priya:** The "full" box on b5 still says the board carries over "word for word," and the carried header says it again. That's the promise I told you was the wrong test. Say "the latest version of each row," and mean it. The notice is back in plain view, which is better than "show." But this one says "Nothing is stored on our server" and the 03b one says "Kept in this browser only." <mark>If two screens say two different things, I believe neither.</mark> And "for Dana" on two questions goes stale tomorrow. I'd want to change who a question is for without retyping it.

## Part D: Exploration 05, "Why this question?" (concept, not built)

**Q:** Before the screens: when did you last learn a technique in the middle of real work, and from what?

**Priya:** Last year our DBA left a comment on one of my migrations: "Use a partial index here, only 3% of rows are active," with a link to the Postgres docs. One line of what and one line of why, on my own code. I've used partial indexes four times since. The one that didn't stick was a half-day BDD workshop in 2022 with coloured index cards. I remember the colours and nothing else, because the example was a coffee shop. <mark>What stuck came on my problem, on the day I needed it, in two lines.</mark>

*(Shown `w1`: "Three questions for your 30-minute slot, each on one real load," each with a "Why ask it this way?" link, and a "Show technique names" checkbox, off. Asked to use it the way she would.)*

**Q:** Here are three questions for Dana. Would you open "why" at all?

**Priya:** Not on the first one. "Load 48213, same booking or a new one": I know why, I've asked questions like that since September, and Dana answered it on the 29th. I'd open the third, because it surprised me. Why is "had the first carrier already sent a truck" a question for Dana? I checked that myself. So I'd open "why" when something surprises me, and only then.

**Q:** What did the "why" on question 3 say?

**Priya:** "You may not need Dana for this. Check the load yourself first." That's right. Then I pressed copy on w4, and it copied question 3 into my Dana prep anyway. <mark>The why was right and the copy ignored it.</mark> If the move says it's for me, it can't be on Dana's list.

**Q:** Open the "why" on question 2 and read it out.

**Priya:** "Ask what made the difference, not what the words mean. The difference is where the rule hides." Okay. That one's new to me. My note on the 22nd was a rule, "lane or date change means AMEND," and it was wrong for a week. Dana fixed it with two loads, not with a definition. I didn't know that was a move. I thought she was just being Dana.

**Q:** Would you have opened that one on your own?

**Priya:** No. It looked like a normal question, so I'd have copied it and moved on. <mark>The one I learned from is the one I'd have skipped.</mark> That's a problem for you, not for me.

**Q:** Turn on technique names (w3). What do you see?

**Priya:** Question 1 says "Example Mapping." Oh. That's the coffee shop workshop with the coloured cards. I hadn't connected them until now, so the name did one useful thing: it tied a move I already use to something I half-learned and dropped. Question 2 says "EventStorming hotspot: mark where two sources disagree and resolve it with the person who knows." That's not how Brandolini describes it in the talks I watched. A hotspot parks the argument so the session keeps moving; you don't resolve it on the spot. <mark>So that was one of my two spot checks, and it failed.</mark> Question 3, "Collaborative modeling: bring evidence, not opinions," is advice with a book title on it. I can't check it, so to me it's noise.

**Q:** Would you show technique names when you're alone and hide them when Marcus might see your screen?

**Priya:** Marcus never sees my screen. He sees Confluence, the night before the review. The only time anyone sees this tool is if I show the team after it's worked for me once, and by then I'd want the names showing, because the names are what they can search. <mark>The toggle solves a problem I don't have.</mark> If I opened "why," I asked. Don't make me ask twice.

**Q:** Dana's out from tomorrow, and Maya answers ops questions now. Without the coach, write the next question you'd send Maya. Use one of the moves you just saw, if one fits.

*(She typed into a Slack draft on her own screen, with the concept closed. It took about two minutes. The interviewer said nothing between drafts.)*

**Priya:** First try: "When does your team use REBOOKED vs AMENDED?" No. That's asking what the words mean. It's the one it just told me not to ask, and it's exactly what I'd have sent last week. Second try: "Load 48213 went to a new carrier on the same lane and shows REBOOKED. Load 46771's pickup date moved in August and it shows AMENDED. When the lane changes, which one does your team use, and what decides it?" The last sentence is still half abstract. I need a third load where the lane actually changed, and I'd look one up in the console before I send it. That's ten minutes.

**Q:** Which move did you use? Can you name it?

**Priya:** Take two loads that went different ways and ask what made the difference. Plus "look it up yourself first" for the third load. The technique name? Hotspot? No, that's the one I said was wrong. I don't know. <mark>I kept the move and lost the name within five minutes, and I'm fine with that.</mark>

**Q:** Would you have written it that way last month?

**Priya:** Last month I'd have sent the first draft. The real-load part I already had. You've been showing me that since interview 02, and Dana taught it to me before you did. The "what made the difference" part is new. I'll know whether it worked if Maya answers in one line instead of a paragraph, so ask me next time.

## Part E: #58 citations and the technique toggle

**Q:** #58 puts Evans citations in the coach's replies. Exploration 05 hides technique names and their sources behind a toggle that's off by default. Should citations follow the same toggle?

**Priya:** No. They do different jobs. A citation backs a claim. If the coach states a rule, the source is how I catch August again, the "you should have a Booking aggregate" thing. If it's behind an off-by-default box, I never do my two spot checks, and the protection is gone. A technique name is a label on a move, and that can live inside "why."

**Q:** Is a toggle one setting too many? What should the default be?

**Priya:** Yes, drop it. It doesn't break "no settings before the first reply," because it's not in front of the first reply. But I'd never touch it, so it's just one more thing that can be in the wrong state. Put the name inside "why," with its source, and show the move in one visible line the first time it comes up, then keep it folded. Citations show in replies whenever the coach states a DDD rule. Neither goes into anything I copy. <mark>And the source on a technique is a citation too. The hotspot line has to pass the same test as Evans.</mark>

## Part F: close

**Q:** If you could have only one thing in the next month, what is it?

**Priya:** The table with the cells right, before the 27th. My corrections replace old rows, dates are real dates instead of "Tue," the split is two ops rows, and the date line and open questions come with the table on the clipboard. Everything in "why" is for after the review. <mark>It's the first thing you've shown me that's for me and not for the RFC, and I'd use it on the next one.</mark>

**Q:** Anything we should have asked but didn't?

**Priya:** Ask Maya whether she'd answer a yes/no line that she knows came from a tool. Dana would, because she's known me for four years. Maya has known me as a reviewer for four days.

---

## Interviewer notes (out of character)

### Key insights

1. **03b fixed the columns, not the cells.** All five structural verdicts from 04b landed: Source, Code as a Team value, one settle-by date, plain-text references with no URLs, and no untyped DDD words. The cells still fail "nothing stale": "Checked with Dana 29 Sep" (she re-checked on 8 Oct), relative "Tue" sources, and the split in brackets in the export. Retyping drops only from about 10 to about 8 minutes. [strong signal: direct test + real paste] [refines #6, #4]
2. **Copy table leaves out the date line and the open questions.** The c5 mock RFC shows "Settle by 27 Oct", but the clipboard held only the table (confirmed in `table-v2.html`: `tableHtml()` returns the `<table>` only). She'd retype both. [strong signal: tested in Confluence + code] [#6]
3. **The concept asks the expert to confirm what its own table says she confirmed, and skips the open question.** The yes/no line re-asks "rebook keeps the same booking" (Source: checked with Dana) and never asks about lane changes. Freshness applies to questions, not just rows. [strong signal: internal inconsistency in the concept] [#4, B22 #19]
4. **A role with one person in it is a name.** "Ops lead" means Maya since Monday, which hands her the definition. She now wants joint roles plus the forum, "Ops lead and finance controller, at the 27 Oct review", the shape 03b already used for the third question. This reverses part of her own 04b verdict. [medium signal: reasoning from a real org change] [#6]
5. **A correct row with no source is worse than a wrong one.** The Code row matches what she found in `rebook!`, but no code was sent in c2. With no "Guess" label she'd stop checking, and it's the row Marcus opens first. [strong on principle] [#4, #58]
6. **02b passes "nothing missing"; "nothing stale" was never tested.** All 3 questions plus 1 new one carried, and TONU/48102 is marked for her. But the stale AMENDED note vanished because the fixture rewrote her 22 Sep note, not because a correction replaced it. The copy still promises "word for word." [strong signal: fixture evidence] [#7 B38]
7. **Learning happened, prompted, from a "why" she wouldn't have opened.** She opens "why" only on surprise. The move she learned ("ask what made the difference") sat under an ordinary-looking question. When prompted, she caught her own abstract draft and rewrote it on her own data. She kept the move and lost the technique name. [weak signal: prompted, recall within minutes] [learning goal; #26]
8. **Citations and technique names do different jobs.** A citation backs a claim and must stay visible for her two spot checks. A technique name labels a move and can sit inside "why." Technique sources are citations too: the hotspot paraphrase failed her spot check. Drop the toggle. [medium signal: one checkable failure + consistent with 04b] [#58, #59]

### What changed since 04b

- **Confirmed by past behavior:** yes/no lines work again (Dana answered 3 of 3 on Monday). Crediting a practice, not a person, survived the ops reviewer: Maya corrected a date and kept the framing. Links took 11 minutes, not the 5 she predicted.
- **New:** Dana is out from 15 Oct, so every "for Dana" label goes stale. The glossary has 9 rows. The split is now inside ops (Dana's sheet vs Maya's practice), and the "Maya → Ops" swap flattens it.
- **Strengthened:** "nothing missing, nothing stale" as the test. It caught two concepts this time. Copy first, and no book in the export.
- **Weakened:** "roles, not names" works only when a role has more than one holder. "Word for word" is weaker again.
- **Unchanged:** Marcus hasn't opened the RFC. Sanitized-only use (#34). She'd still retype some cells.

### Design feedback: Exploration 03b

**Keep**
- The Source column with plain-text references and no generated URLs. "Five for five on structure."
- "Code" as a Team value. It's the row Marcus opens first.
- One "Settle by 27 Oct (finance review)" line above the table.
- The next step marked for her, with the reason. "Without spending Dana's time is the right reason."
- "I checked" replacing the cell. "That's the mechanism I asked for."
- Copy as a real rich-text table.

**Change**
- In the export, an internal split becomes two rows credited to a practice or a document. "Two rows credit a practice. A bracket credits a complaint."
- A Source says where a meaning came from: "from code you pasted", or "Guess:". "Where did booking.rb come from?"
- Relative days ("Tue") become the date she gives, or a blank for her to fill. "It's copied from 'rejected tue'."
- Yes/no lines skip rows whose Source says checked, and ask the open question (lane change). "Asks Dana to confirm the one thing it says she already confirmed."
- Who settles: joint roles plus the forum. "A role with one person in it is a name."
- "Checked by you · Dana to confirm" becomes "checked <date>". "In a doc, 'you' is whoever's reading it."
- "I checked" needs a "no" path. "What if the answer's no?"
- Copy table carries the date line and the open questions.

**Cut**
- "(ops is split …)" in brackets in the exported cell.
- Any named "to confirm" owner in an exported cell.

### Design feedback: Exploration 02b

**Keep**
- Every open question carried, plus new ones from later turns. The fact question is marked "for you to check."
- The notice back in plain view.
- "Edit anything wrong" on the carried board, and the read-only previous conversation.

**Change**
- The fixture must include a correction (her real 22 Sep note, then Dana's fix) so "nothing stale" is actually tested. "You took it out of my notes."
- Notice text must match across concepts. "If two screens say two different things, I believe neither."
- Let her reassign "for Dana" without retyping.

**Cut**
- "Word for word" in the "full" box and the carried header. Say "the latest version of each row."

### Design feedback: Exploration 05

**Keep**
- "Why ask it this way?" on each question, with the move in plain words and what it unblocks in her table.
- "Explanations stay here. They never go into your copied table." Copy gives plain questions only.
- Moves tied to her own mess (her 22 Sep rule vs Dana's two loads).

**Change**
- Copy obeys the move: a "check it yourself first" question never lands on the expert's list. "The why was right and the copy ignored it."
- Show the move in one visible line the first time it appears, then fold it. "The one I learned from is the one I'd have skipped."
- Technique names sit inside "why" with their source, and pass #58's integrity check. The hotspot line failed hers.
- "Your 30-minute slot" and "for Dana" follow who's actually available.

**Cut**
- The "Show technique names" checkbox. "The toggle solves a problem I don't have."
- "Collaborative modeling: bring evidence, not opinions" as a technique label. "Advice with a book title on it."

### Learning check

**Result: prompted, reused well, name not retained.** [supports learning goal] (weak signal)

- **Prompted, not spontaneous.** The interviewer asked her to write a question for Maya using a move. She would not have opened the "why" that taught her the move (Q "Would you have opened that one on your own?": "No"). [challenges learning goal]
- **Quality: good.** Her first draft was the abstract anti-pattern ("When does your team use REBOOKED vs AMENDED?"). She caught it herself within seconds, citing the move, with no interviewer help. Her rewrite contrasts two real loads from her own data (48213 REBOOKED, 46771 AMENDED), not the fixture's 47990. She then spotted that her last clause was still abstract and planned a lookup, which is a second move ("check it yourself first") applied unasked.
- **Named in her words, not by technique:** "Take two loads that went different ways and ask what made the difference." She couldn't recall "EventStorming hotspot" and guessed wrong.
- **Novelty:** 1 of 3 moves was new to her. She already used the real-case move (since interview 02) and the look-it-up move (the 48213 console lookup, 03a). The learning value sits in the move she didn't know, and that one was hidden. [challenges learning goal]
- **Retention: untested.** The recall came within minutes. Check in 06 whether she used the move again unprompted, and whether Maya answered in one line.

### #58 citation-toggle recommendation

- **No toggle.** Remove "Show technique names" from Exploration 05 before it becomes a slice.
- **Citations for DDD claims always show in replies** (as #58 plans), never in anything copied. They're her guard against August-style made-up rules, and she only spot-checks what she can see.
- **Technique names and their sources live inside the opened "why"**, next to the move. Opening "why" is the opt-in.
- **Show the move line visibly the first time it's used**, then fold it. This is "teach once" from 04b, applied to moves.
- **Technique sources fall under #58's citation-integrity rule.** Each named technique and its one-line definition must match text in the corpus, or the name is omitted. "Hotspot … resolve it with the person who knows" fails this.

### Roadmap assumptions this interview challenges

- **#6: the right columns make the table pasteable.** The columns now pass. The cells and the clipboard don't: relative dates, stale checks, a bracketed split, and no date line or open questions on the clipboard. Acceptance must test cell freshness and clipboard contents, not headers.
- **#4 (slice 3): a Source records where a line came from.** It copied "Tue" from the thread and gave the Code row a file with no pasted code. Sources need absolute dates or blanks, plus "from code you pasted" or "Guess:". Yes/no lines must not re-ask checked rows.
- **#7 (B38): 02b now carries without loss.** "Nothing missing" passes. "Nothing stale" is untested because the fixture edited her note. The "word for word" copy still contradicts her test.
- **B05 (#10): disagreement is between teams.** The live split is inside ops (a practice against a document). Default team-level swaps ("Maya → Ops") erase it.
- **B22 (#19): an Example Map is the unit to deliver.** The name "Example Mapping" reconnected her to a workshop that didn't stick. The move, inside a real question, is what she kept. Consider shipping B22 as a move in the questions before a separate map view.
- **#58: citations can be optional.** A citation she can't see can't be checked. Technique sources are citations too.
- **#59: which sources the knowledge base may include.** Exploration 05 cites a Cucumber guide, Brandolini's book and *Collaborative Software Design*. If #59 doesn't admit them to the corpus, the coach is citing from memory, which is the phantom-citation risk #58 exists to stop. Either #59 admits them, or our own notes define the moves and the technique names are dropped.
- **#26: target is early-practice practitioners.** Supported: she learned one new move on real work. But the "why" she needed was one she'd skip, so a disclosure-only design undercuts the learning goal for exactly this user.
- **#55: one accurate notice.** 02b and 03b state data handling differently.

### Small suggestions

1. **Copy table carries the date line and open questions.** (#6)
   - *Smallest result:* Copy table puts the "Settle by" line, the table and the open-questions list on the clipboard, in both formats.
   - *Acceptance:* the `text/html` and `text/plain` payloads each contain "Settle by 27 Oct" and all 3 open questions. The `text/html` payload has exactly 1 `<table>`.
2. **No relative dates, no stale questions.** (#4, #6)
   - *Smallest result:* a Source never holds a relative day. It holds a date she typed, or "date?" for her to fill in. A yes/no line is never drafted for a row whose Source starts with "Checked".
   - *Acceptance:* from a thread containing "tue", no Source cell matches `/\b(mon|tue|wed|thu|fri|yesterday)\b/i`. With the Rebook ops row sourced "Checked with Dana, 8 Oct", 0 drafted lines restate it, and 1 line asks about lane changes.
3. **Copy obeys the move.** (Exploration 05)
   - *Smallest result:* questions whose move is "check it yourself first" go to her own list, not the expert copy.
   - *Acceptance:* in the w4 state, "Copy the questions for my Dana prep" yields 2 lines and 0 lines containing "48102".
4. **No technique toggle; the move shows once.** (Exploration 05, #58)
   - *Smallest result:* no checkbox. The first question using a move shows its one-line move visibly. Later uses fold it under "why", with the technique name and source inside.
   - *Acceptance:* 0 checkboxes on the page. The move line is visible for the first use and hidden for repeats. Every technique source string exists in the corpus, or no name is shown.

### Questions for interview 06

- Did Maya answer the two-loads question in one line or in a paragraph? Did it settle the lane-change case?
- Since today, have you used "what made the difference" again without being asked? Where?
- After the 27 Oct review: what did finance change in the table? Did people argue about facts or about the word?
- Did anyone click a Source link? Which one?
- When the coach cited a section in a reply, did you check it? What did you find?
- (A real Maya-type ops lead) Would you answer a yes/no line you knew came from a tool?
- (A real early-practice practitioner) Would you open "why" on a question that looks ordinary?
