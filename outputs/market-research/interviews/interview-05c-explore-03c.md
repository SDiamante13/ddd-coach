# Synthetic interview 05c: Priya Raman, Exploration 03c before #6

*Synthetic interview. Treat every point as a hypothesis until a real practitioner confirms it.*

Thursday 15 October 2026, the morning after interview 05. It's Dana's last day. Shown Exploration 03c, "Leave with a table" v3: `d1` the swaps, `d2` what gets sent, `d3` the table, `d4` the next step and the lines for Dana, and `d5` the paste into the RFC. She clicked through `table-v3.html` (`?state=1` to `5`), pressed Copy table, then pasted into a scratch Confluence page and into her plain-text notes file. She was told it's a concept, not built, and that the rows come from a five-line demo thread. Changes since 05: absolute dates in every source, the ops lane-change split as its own open row, the Code row labelled Guess, a joint role plus the forum on the lane-change question, only open items for Dana, and Copy carrying the settle-by date, the table, the open questions and the events. This is a short interview of 11 questions, to inform #6 (copy the table) before it's built.

## Part A: since yesterday

**Q:** It's been a day. What's happened?

**Priya:** Last night I found a third load, 47356, where the lane actually changed, and sent Maya the question with all three. She answered in one line: "REBOOKED if the carrier changes, lane or not." That's what ops does, and it still isn't what Dana's sheet says the contract means, so the split stands. Today is Dana's last day, and her leaving coffee is at three. The RFC hasn't moved since yesterday: nine rows, and Marcus still hasn't opened it.

## Part B: nothing missing, nothing stale

**Q:** Run your test on d3 and d5, cell by cell. Start with what's missing.

**Priya:** Not much is missing now. The date line and the open questions came with the paste, and that was yesterday's biggest miss. The missing piece is the second ops row: the split is one row that says "one view says rebook, another says amend", so neither view has a name on it. I also pasted into my text file, and got one line: "| Term | Team | Meaning | Status |". <mark>It says "Plain-text editors get Markdown." They get a header, with the column name I got rid of last week.</mark>

**Q:** And stale?

**Priya:** The dates are the right shape now, but three of them are wrong. "Slack #booking-split, 22 Sep 2026" appears three times. The five lines you sent have no date, the thread is from July, and 22 Sep is the day of my Dana notes. <mark>I could see that "Tue" was wrong, but I can't see a wrong date in the right format.</mark> The Rebook ops row says "Confirmed by Dana, 29 Sep", but I re-checked with her on 8 Oct, and Maya's "(since the 2024 portal change)" isn't there. And the header still says gpt-5.6-terra and "Kept in this browser only", so the notice didn't notice, again.

**Q:** After you clicked "I checked" on d4, what changed?

**Priya:** The cell, and only the cell. It now says "Load 48213, checked by you 25 Sep 2026 · Dana to confirm". That's "you" again, Dana's name on a job she won't be here to do after today, and a date I didn't check it on, since I checked on 2 Oct. Open question three still asks whether 48213 was a TONU fee, settled by "ops lead", which means Maya alone again, and Dana's list still has the TONU line. <mark>One click, three places it should land, and it landed in one.</mark> And there's still only a yes button.

**Q:** What would you still retype before the 27 Oct review, and how long would it take?

**Priya:** The three 22 Sep sources take two minutes, because it's Slack search for July. Splitting the row into two credited rows with a load each takes two more, since I have the loads from Maya's question. The Rebook date and Maya's wording, the TONU source, the Code row's source and deleting question three come to about two minutes together, and cutting the events takes thirty seconds. That's about seven minutes, against eight yesterday and ten before that. <mark>Yesterday's eight were formatting I'd spot anyway. Today's seven are content, and I only find those by reading every cell against my notes.</mark>

**Q:** Look at d5, the paste. Is that how you'd put it in the RFC? What order, and what's missing?

**Priya:** Settle-by, then the table, then the open questions is the order the section reads on the 27th: the deadline, what we've written down, and what we need from the room. The events don't belong in the glossary, because my RFC has them in section 3. So last is right, since that's the part I cut and move. What's missing is an "as of" date. <mark>"Settle by" tells finance when it's due, not when it was true, and they'll read it twelve days after I paste it.</mark> And "Guess: The tender goes to another carrier" can't go into section 3 as it is.

## Part C: the split row

**Q:** "Ops is split on lane changes… to settle at the 27 Oct review." Is that row safe to show finance? When did finance last see an internal disagreement in a doc, and what happened?

**Priya:** The last time was the May write-up of our second double-invoice P2. It had one line, "Ops and engineering disagree on whether a rebook keeps the invoice", and the finance controller's only comment was "Who decides, and by when?" Nobody answered for three weeks, so finance added a manual check on every rebooked load's invoice, and Maya's team still does about forty a week. <mark>Finance doesn't mind a disagreement. It minds one with no owner, and it fixes that with a control.</mark> This row has the when and the where, which the P2 line didn't, so it's safer than that, and much safer than yesterday's bracket.

**Q:** Does Maya's new role change that?

**Priya:** Yes: from today, Dana's side has nobody in the room on the 27th, and Maya is both one view and half the pair that settles it. I'd still keep the pair, because the controller is in it and it happens in a room, not a DM. "One view says rebook, another says amend" is also wrong: Dana's sheet says a lane change is a new booking, and "amend" was my 22 Sep note, the one Dana corrected. <mark>After today the only thing that speaks for Dana's side is the document, so the row has to name it.</mark> I'd make it two rows, each with one load: "Ops, current practice (since the 2024 portal change)" and "Dana's 2019 sheet, carrier contract reading". And "Split, to settle at the 27 Oct review" is a status, not a source, because nothing in your five lines mentions a lane.

## Part D: the Guess label

**Q:** The Code row says "Guess". Will you check it? Does "Guess" read as honest or as sloppy to finance, or to Marcus?

**Priya:** I already have. I read `rebook!` on 6 Oct, and the guess is right, so on my screen "Guess" did its job: I stopped and compared instead of nodding. Marcus would be fine with it, since earlier this year his only questions on my ticket spreadsheet were about the two rows in the "not sure" column. Finance is different: "Guess" on the one row about the code behind the double invoices reads as "engineering doesn't know its own code", which is the P2 again. <mark>"Guess" is honest on my screen and sloppy in their doc.</mark> Give me the TONU button on it, "I checked: `rebook!`, 6 Oct", and if I copy with a guess still in, tell me how many are left.

## Part E: the lines for Dana

**Q:** Dana gets a neutral "rebook or amendment?" and the TONU check. Are those the right two? Would she answer them by Slack DM?

**Priya:** Neither. She answered the TONU question on Monday, and it's in Slack: "yes, truck was there, that's TONU." "Rebook or amendment?" isn't neutral: it gives her two answers and hers is neither, and after today it's a question for the 27th, not for her. What I need from Dana today is the one thing nobody can give me tomorrow: which clause of the carrier contract makes a lane change a new booking. She'd answer that by DM before lunch, because she's answered my short lines for four years and it's her side of the split. <mark>For someone who's leaving, ask for sources, not opinions.</mark>

## Part F: close

**Q:** What's the one change that would make you paste this without touching it?

**Priya:** Let it write only what I gave it. A date that isn't in my paste becomes "date?", a meaning from code I didn't send says Guess, and when I fill a blank, it changes everywhere: the cell, the question and the line for Dana. <mark>Then the seven minutes go on filling blanks it shows me, instead of hunting for mistakes it hides.</mark> I'd still ask for the split rows and the plain-text copy, but that's the change that stops me reading every cell.

---

## Interviewer notes (out of character)

Checked against `table-v3.html`. `THREAD` has no dates, only "tue" on line 4. `ROWS` hard-codes "22 Sep 2026" and "Confirmed by Dana, 29 Sep 2026". The `done` handler writes "checked by you 25 Sep 2026 · Dana to confirm" and changes nothing else, and `QUESTIONS` and the Dana lines are static. The `text/plain` blob is the single string `| Term | Team | Meaning | Status |`. The header notice names `openai/gpt-5.6-terra`, but the live model is luna (04a).

### Key insights

1. **03c fixed the format of dates, but not where they come from.** There's no "Tue" anywhere, but three Source cells carry "22 Sep 2026" when the input has no date, and the check stamps a hard-coded "25 Sep 2026". "I can't see a wrong date in the right format." Retyping drops from 8 to about 7 minutes, but the work moved from formatting she'd spot to content she has to hunt for. [strong signal: code-verified] [#6, #4]
2. **A check lands in one place.** "I checked" rewrote the TONU cell but left open question 3 and Dana's TONU line. The cell still says "by you" and "Dana to confirm", and there's still no "no" path. "One click, three places it should land, and it landed in one." [strong signal: in-concept behavior + code] [#6, #4]
3. **A split is safe for finance only with an owner, a date, and credited positions.** Anchor: the May P2 write-up had a disagreement with no owner, and finance answered with a manual check her ops team still runs (about 40 a week). The 03c row has a date and a forum (better than the bracket), but its positions are anonymous, and "amend" brings back her corrected 22 Sep note. From today Dana's side has nobody in the room, so the row must name the document. [medium signal: one real anchor] [#6, B05 #10]
4. **"Guess" is honest on her screen and sloppy in finance's doc.** It worked: she stopped and compared (she read `rebook!` on 6 Oct). Marcus reads doubt as a sign the rest was checked (his "not sure" questions). Finance reads "Guess" on the double-invoice code as engineering not knowing its own code. She wants a check that replaces the guess, and a count of guesses left at copy time. [medium signal: past behavior for Marcus, reasoning for finance] [#6, #4, #58]
5. **For a departing expert, ask for sources, not opinions.** Both Dana lines are wrong. She answered TONU on Monday, and "rebook or amendment?" leaves out her actual answer (a new booking) and belongs to the 27 Oct forum. The useful line is the carrier-contract clause, which nobody can give after today. [medium signal: Monday's answers + reasoning] [#4, B22 #19]
6. **The plain-text copy is only a header row, and it uses the old column name.** "Plain-text editors get Markdown" is untrue in the concept: her text file got `| Term | Team | Meaning | Status |`. [strong signal: pasted + code] [#6]

### "Nothing missing, nothing stale" scorecard (d3–d5, as of Thu 15 Oct)

| Item | Result | Quote |
|---|---|---|
| Settle-by line on the clipboard | **ok** | "The date line and the open questions came with the paste, and that was yesterday's biggest miss." |
| Open questions on the clipboard; Q1 with a joint role plus the forum | **ok** | "I'd still keep the pair, because the controller is in it and it happens in a room, not a DM." |
| Split as its own row with a forum, not a bracket | **ok** | "It's safer than that, and much safer than yesterday's bracket." |
| Code row labelled Guess (in the tool) | **ok** | "On my screen 'Guess' did its job: I stopped and compared instead of nodding." |
| Absolute date format, no relative days | **ok** | "The dates are the right shape now." |
| Events last, with the guess marked | **ok** | "Last is right, since that's the part I cut and move." |
| "Slack #booking-split, 22 Sep 2026" ×3 (no date in the input) | **stale** | "I can't see a wrong date in the right format." |
| Rebook ops: "Confirmed by Dana, 29 Sep" (re-checked 8 Oct; Maya's wording missing) | **stale** | "I re-checked with her on 8 Oct, and Maya's '(since the 2024 portal change)' isn't there." |
| TONU after the check: "checked by you 25 Sep 2026 · Dana to confirm" | **stale** | "That's 'you' again, Dana's name on a job she won't be here to do after today, and a date I didn't check it on." |
| Open Q3 on TONU after the check, settled by "ops lead" alone | **stale** | "One click, three places it should land, and it landed in one." |
| Split wording: "one view says rebook, another says amend" | **stale** | "'Amend' was my 22 Sep note, the one Dana corrected." |
| Dana lines: TONU (answered 12 Oct), "rebook or amendment?" | **stale** | "It gives her two answers and hers is neither." |
| Notice: gpt-5.6-terra, "Kept in this browser only" | **stale** | "The notice didn't notice, again." |
| Split as two rows credited to a practice and a document, with one load each | **missing** | "After today the only thing that speaks for Dana's side is the document, so the row has to name it." |
| Plain-text clipboard contents | **missing** | "They get a header, with the column name I got rid of last week." |
| An "as of" date on the paste | **missing** | "'Settle by' tells finance when it's due, not when it was true." |
| A line asking Dana for the contract clause before she leaves | **missing** | "For someone who's leaving, ask for sources, not opinions." |
| A "no" path on "I checked" | **missing** | "And there's still only a yes button." |

**6 ok, 7 stale, 5 missing.** The structure passes. Every stale item is a cell or line whose content the tool made up or didn't update after a check.

### Exploration 03c: keep, change, cut

**Keep**
- Copy carries settle-by, the table, open questions and events, in that order. "The order the section reads on the 27th."
- A joint role plus the forum on the lane-change question. "The controller is in it and it happens in a room."
- The split as its own row with a date and a forum. "Much safer than yesterday's bracket."
- The Guess label in the tool. "I stopped and compared instead of nodding."
- Absolute dates, and "I checked" replacing the cell.
- Only open items go to the expert (the principle; the execution is wrong).

**Change**
- A date appears only if it's in the input or she typed it; otherwise "date?". "I can't see a wrong date in the right format."
- A check updates the cell, removes the matching open question and drops the matching expert line. "It landed in one."
- A split becomes two rows, each credited to a practice or a document, with one load each. The Source says where the split came from, not when it settles.
- A Guess row gets "I checked: <what>, <date>", and Copy warns "N rows are still guesses".
- The plain-text payload carries everything the HTML does, with "Source". Add an "As of <date>" line.
- Every open question gets a joint role or a forum. Q3's "ops lead" alone fails.
- For a departing expert, ask for sources. "FOR DANA" should follow who's actually available.
- "I checked" gets a no path. The notice takes the model from config and uses one wording.

**Cut**
- "Dana to confirm" and "by you" in any cell.
- "One view … another" wording, and "amend" as a lane-change option.
- An expert line for anything already answered or checked.
- "Guess:" repeated in both Meaning and Source on the same row.
- Unresolved "Guess" text in the pasted doc, unless she chooses to keep it.

### #6 implications (acceptance-ready)

1. **The clipboard carries the whole section in both formats.** Pressing Copy table writes a `text/html` and a `text/plain` payload. Each contains, in order, "Settle by 27 Oct 2026", "As of <today>", the table, all open questions and the events. `text/html` has exactly 1 `<table>`. `text/plain` has a header row containing "Source" (0 occurrences of "Status") plus one row per on-screen row.
2. **No made-up dates in Source.** Given the five-line demo thread (no dates), 0 Source cells contain a date the user didn't type, and relative days render as "date?". After she types "2 Oct 2026" on the TONU row, that date appears exactly once, in that cell. *(Depends on #4 for the cell content; #6 must not add dates while formatting.)*
3. **A check updates everything that depends on it.** After "I checked" on load 48213 with date 2 Oct 2026, the TONU Source reads "Load 48213, checked 2 Oct 2026". It contains neither "you" nor "to confirm", 0 open questions mention 48213, and 0 expert lines mention TONU. A "no" choice records "checked 2 Oct 2026: no truck sent" and adds 1 open question.
4. **A split exports as credited rows.** An open split exports as at least 2 rows under the same term. Each has a Team value naming a practice or a document, and a load ID. 0 cells contain "one view" or "another". The matching open question names at least 2 roles and a forum.
5. **Guesses are counted before they leave.** With at least 1 Guess row, Copy shows "N rows are still guesses" before writing to the clipboard. After the Code row is checked, the payload contains 0 occurrences of "Guess".
6. **No single-holder owners.** Every open question's "who settles" names at least 2 roles, or 1 role plus a forum. "ops lead, before 27 Oct" fails.

### Questions for interview 06

- Did Dana send the contract clause before she left? Did it make it into her row?
- On 27 Oct, what did finance do with the two ops rows: settle it, ask for an owner, or add a control?
- Did anyone read the "as of" date or a Source date, or ask where a date came from?
- Did Marcus open the Code row? What did he ask?
- Tonight's small run on Maya's comments: what did the coach ask, and did you use it?
- (A real finance controller) When an RFC shows two definitions with a review date, what do you do before the meeting?
- (A real practitioner) When a tool fills in a date for you, do you check it?
