# Synthetic interview 09: Priya Raman, on Exploration 08 (Words lane, drift on the board)

*SYNTHETIC interview. Everything below is a hypothesis generated from a fictional persona. It is not customer evidence. Promote nothing until a real practitioner confirms it (#70).*

It's Wednesday 4 November 2026, a week after interview 07. The Booking RFC went out on Friday 30 October, and its glossary section is a Confluence table she built by hand. Carrier integrations opened a "tender" rename thread on Monday. The session was a 25-minute video call at lunchtime, with Priya on her personal laptop. Interview 08 (the #85 demo) hasn't run yet. This is a **concept-only** round on a new concept, so it follows the README rule: no repeat rounds on the table (#6 stays frozen), and the #70 questions stay reserved for a real practitioner.

What she saw, from `outputs/design/explore-08/` (`glossary-board.html ?state=1–5`, stills `g1`–`g5`) and issue #109:
- **g1:** a Words lane under the timeline. It holds three term cards ("booking", "rebook", "late"), one row per team, and each row has a dated source and a chip (Settled · date, Open · review 27 Oct, or Retired). The lane header reads "3 terms · 7 rows · 5 settled · 2 open". The dock says: "Your glossary is kept in this browser and sent swapped with every thread, so the coach checks new threads against it."
- **g2:** a #night-desk export (14 Oct, 2,180 characters) is pasted. Three events land, the third a dashed GUESS ("Finance invoices both rows?"), and the coach shows "Checking against 7 kept rows…".
- **g3:** a dashed red **≠ row** appears inside "rebook": "Ops, night desk · DRIFT · NOT KEPT · Rebook also covers a lane change · Slack #night-desk, 14 Oct 2026 · this thread · Differs from 'Ops, current practice', settled 8 Oct". The coach says "3 events placed. Checked against your 7 kept rows: **1 drift · 5 settled · not re-asked**" and offers Raise at the review / Update the kept row / Not a change. The question card quotes two lines: "rebooked 48877 onto the Laredo lane, same ref" (#night-desk, 14 Oct) and "Same booking, marked REBOOKED" (kept 8 Oct).
- **g4:** she picks Raise. The chip turns "OPEN · RAISE 27 OCT" and the coach says "The settled row is unchanged."
- **g5:** "Copy for your RFC" gives a "4. Glossary, as of 14 Oct 2026" table (Term, Team, Meaning, Source, Status) with the retired row struck, plus two open questions, the drift first.

The dates in the mock (14 Oct thread, 27 Oct review) sit before her real 27 Oct review. The interviewer said so up front, and she read it as "my October, replayed". No paid calls, and nothing of hers was pasted.

## Part A: since interview 07

**Q:** The RFC went out Friday. Where does the glossary live now?

**Priya:** Section 4 of the Confluence page. It's a table I typed: term, team, meaning, and a source column, because Marcus asked for one. Eleven rows. Maya has already edited two of them in the page, on Monday, and didn't tell me. I found out because I checked the page history. <mark>It's been right for four days, and I'm already not the only one editing it.</mark>

**Q:** Any other copies?

**Priya:** My text file on the work laptop, which is now behind Confluence by Maya's two edits. The Claude chat from September, which is behind by about a month. That's the same as in September, when it was right in two places and wrong in two. The difference is that now there's one I trust, the Confluence page, because it has history.

**Q:** And the tender thread?

**Priya:** It's started. Carrier integrations want "tender" to mean the EDI 204 we send, and ops use it for the phone call to the carrier too. It's the same shape as booking. I haven't pasted it anywhere, because it's a fresh sanitizing job.

## Part B: the board at rest (g1)

*(She read g1 for about ninety seconds without speaking.)*

**Q:** What is this screen to you?

**Priya:** My section 4, on the board. Term cards, one row per team, a date and a source on every row. <mark>Every row has a source. That's the first glossary tool I've seen that does that without me asking.</mark> "late" isn't ours, though. Account team, contract §4: that's your example thread. I'll ignore it.

**Q:** Anything you'd check first?

**Priya:** "Ops, Dana's sheet, retired 8 Oct". Retired by whom? The day desk still works off Dana's sheet. They did on the 28th, when I read your three replies. And "A new booking for any change" isn't what Dana said. She told me at the end of September that a same-carrier date change is AMENDED and only a lane change is a new booking. <mark>That's Dana misquoted and then struck through, on the same line.</mark> If that went into the RFC, the day desk would read it as their sheet being wrong, and it isn't even their sheet.

**Q:** And "Ops, current practice"?

**Priya:** That's the night desk. Maya wrote it, and Maya runs nights. Calling it "current practice" makes it sound like all of Ops. <mark>It's view B with a nicer name.</mark> Last time I asked you for "Ops, night desk" instead of letters. This is the same problem again, a label that hides which desk.

**Q:** "Kept in this browser"?

**Priya:** Which browser? This is my personal laptop. I wiped every sanitized copy off it on the 22nd. The real glossary is in Confluence, and Maya edits it. <mark>So this is a fifth copy, and it goes stale the first time Maya touches the page.</mark> The per-card "Kept 8 Oct" date helps: I can see how old it is. But nothing tells me it's older than Confluence.

## Part C: probe 1, the "≠" drift row (g3)

**Q:** First impression of the row with the ≠. Don't read it closely yet.

**Priya:** Red, dashed, "not kept". <mark>My first read was that it failed to save.</mark> Dashed red is what our Retool screens do for a validation error. "Not kept" reads like "we couldn't keep this". The ≠ I didn't see as "not equal" at first. It looked like an icon for "blocked".

**Q:** Now read it.

**Priya:** "Differs from 'Ops, current practice', settled 8 Oct". OK, that line turns it around. It's a finding: this thread says something that my settled row doesn't. And the question card has both lines under it, the new one and the kept one. <mark>That's what I asked for last time: the two lines, printed under the question.</mark> I'd check them in ten seconds.

**Q:** Check them.

*(She read the two quotes, then the settled row, then the retired row.)*

**Priya:** It doesn't hold. The night desk line says "rebooked 48877 onto the Laredo lane, same ref". The settled row says "Same booking, marked REBOOKED". <mark>Same ref, same booking. Those two agree.</mark> The settled row never says what changes it covers: dates, lanes, carriers. So there's nothing about a lane change for it to differ from. What the night desk line really contradicts is Dana's rule, that a lane change is a new booking, and that's the row you've struck out. The coach's question knows this. "Or is that a new booking under current practice?" But the row it points at doesn't say it.

**Q:** So finding or error?

**Priya:** A finding, but not the one it's labelled as. The real finding is that my settled row is missing its scope. That's worth knowing before the 27th, because Tom would have found it in the room. But I only got there by reading line by line, and the arrow points at the wrong row. <mark>If I'd trusted the ≠, I'd have raised it as nights breaking Maya's rule, and Maya would have said "that's what I wrote".</mark>

**Q:** What would make it read as a finding at a glance?

**Priya:** Three things. Don't make it red like an error. The open chips are pink, so make it look like an open question, which is what it is. Say "new in this thread, not in your glossary yet" instead of "not kept". And make "Differs from" quote the words it differs from, not the row's name. If there are no words to quote, say "your row doesn't cover lane changes". That's still a finding, and it's the true one.

## Part D: probe 2, "5 settled · not re-asked"

**Q:** "1 drift · 5 settled · not re-asked". Does that make you trust it more?

**Priya:** The idea, yes. The best thing about the 27th was that nobody asked what a booking is. Something that won't reopen a settled word is something I'd want. What I've dreaded since July is a tool that re-asks the same question every Sunday. <mark>"Not re-asked" is the right promise.</mark>

**Q:** And the chip itself?

*(She counted the green chips on g3.)*

**Priya:** Four. Finance and Ops under booking, current practice and Code under rebook. The header says five settled and so does the coach. <mark>The fifth is Dana's retired row, counted as settled.</mark> So the first number I checked is wrong. That's the whole problem with a count. I can't click it, so I count by hand, and it's off by one.

**Q:** Suppose the count were right.

**Priya:** Then I'd want to know what "not re-asked" means. Did it check finance's row and find it holds, or did it not look? The third sticky is "Finance invoices both rows?", which is finance's "booking = invoiceable" row sitting right there, and the chip says it wasn't re-asked. Was that a check, or a skip? <mark>"Not re-asked" is a claim about something that didn't happen, and I can't check an absence.</mark> It's the summary problem again. Show me the board, not a summary of it.

**Q:** What would build trust?

**Priya:** Let me open it, with one line per row. "Holds: thread line 22:14 says invoiceable at POD." Or "Not in this thread." Two words each. Then "5 settled" means something, because I can see which kind of five it is. Five holds is great. Five not-mentioned is just silence. <mark>Two words a row, and I'd stop counting.</mark>

## Part E: deciding and exporting (g4, g5)

**Q:** The three buttons. Which would you press?

**Priya:** Not the blue one. "Raise at the review" puts nights' practice in front of finance before I've asked Maya about it. It's her desk. I'd DM her first. Half the time the answer is "yes, Laredo's a special case" and it never needs a room. There's no button for "ask the owner first". <mark>The default button is the one that embarrasses Maya.</mark>

**Q:** "Update the kept row"?

**Priya:** One click that rewrites a row Maya wrote, with no source for the new version? No. If I update it, the new row needs its own source and date, and the old one should be struck the way Dana's is, not overwritten. "Not a change" worries me too. If I press it, will the next thread flag the same thing again? It should remember, and say so.

**Q:** The export.

**Priya:** It's the table I typed by hand, as a real table, with dates and sources in every row. <mark>That's forty minutes of my Friday.</mark> Three things stop me pasting it as is. The rebook row still says "Settled" with no date, while open question 1 says nights disagree. By the rule from 15 October, one check has to update the cell, the question and the line. Here the question changed and the cell didn't, so the cell is stale the moment I paste it. It should read "Settled 8 Oct · raised 14 Oct". Second, the board said "Settled · 8 Oct" and the export dropped the date, which is the part Marcus reads. Third, the retired row's source is now "Retired 8 Oct 2026". Where it came from has been replaced by when it died. I'd want both.

**Q:** The struck-through row in the RFC?

**Priya:** For history, I like it. But not with Dana's name on a meaning she didn't hold, in a doc the day desk reads. Put the history under the table, with the right quote.

## Part F: close

**Q:** Would a Words lane like this change what you do with the tender thread?

**Priya:** If it could start from my Confluence section 4, yes. I'd paste the table in, as of today, then the tender thread, and see what drifts. That's the one job nothing else does. Company Claude would happily re-answer "what is a booking" every time. What it won't do is tell me that nights now use tender for the phone call when my table says EDI. <mark>The drift check is the part I'd come back for. The kept copy in a browser is the part I don't trust.</mark>

**Q:** The one thing to change?

**Priya:** Make every claim openable: the ≠ quotes the words it differs from, and "5 settled" opens to five rows with two words each. I check line by line anyway. Give me the lines.

---

## Interviewer notes (out of character)

Checked against the exploration source (`glossary-board.html`):
- **Settled count.** The `TERMS` data has 4 rows with `chip: "settled"` (booking/Finance, booking/Ops, rebook/current practice, rebook/Code), 1 `retired` and 2 `open`, which is 7 rows. The lane header and the coach line both say "5 settled", so the retired row is counted as settled. Her count is right.
- **Drift row.** The kept row reads "Same booking, marked REBOOKED — since the 2024 portal release", with no scope. The drift quote is "rebooked 48877 onto the Laredo lane, same ref". Word for word they agree on "same booking/ref". The contradiction lives in the question text ("or is that a new booking under current practice?") and in the struck Dana row, not in the linked row.
- **Dana's sheet.** Her past behaviour (03b, 07): Dana's rule is "same-carrier date change = AMENDED, lane change = new booking". In 07 the day desk still works from it ("view A"). The mock's retired row says "A new booking for any change". That is a misquote, and the "retired" status contradicts her 28 Oct reading.
- **"Ops, current practice".** Sourced to Maya, who runs nights (07). So it's a desk-hiding label, the #77 failure mode under a new name.
- **Export.** Status loses its date ("Settled"), the rebook row stays "Settled" beside open question 1, the retired row's source becomes its retirement date, and the GUESS sticky ("Finance invoices both rows?") isn't carried into the export.
- **Colour.** The drift chip uses `--color-alert` with a dashed border, while the open chips use `--color-card-question`, so drift is styled as an alert, not as an open question.
- Her Confluence page history, Maya's edits and the tender thread are synthetic continuations of 07.

### Key insights

1. **The ≠ row reads as an error at a glance and as a finding once read. Line by line, it points at the wrong row.** Red dashed + "not kept" read as "failed to save". The line "Differs from … settled 8 Oct" and the two quotes under the question turned it into a finding within seconds. Checking the quotes, the new line agrees with the linked row ("same ref" = "same booking"). The real finding is that the settled row has no scope, and the conflict is with Dana's rule. [synthetic; strong within the mock: verifiable from the source] [#109, #100 drift gate]
2. **"5 settled · not re-asked" is the right promise, stated as a claim she can't check, with a wrong count.** She wants "don't reopen settled words" (the 27 Oct win was that nobody asked what a booking is). She counted 4 green chips against "5", because the retired row is counted as settled. "Not re-asked" can't tell *checked and holds* from *not in this thread*, and the GUESS sticky touches finance's settled row. Trust needs an openable per-row line: "holds · line" or "not in this thread". [synthetic; count error verified] [#109, #100, #90]
3. **The labels relapse into desk-hiding.** "Ops, current practice" is nights (Maya). "Ops, Dana's sheet" is the day desk's live practice, misquoted and marked retired. It's #77 in a new form: a name that sounds like all of Ops. [synthetic; grounded in 03b and 07] [#77, #109]
4. **Default action is socially wrong.** "Raise at the review" (primary) puts a desk's practice in front of finance before its owner is asked. She'd DM Maya first. "Update the kept row" must take a source and strike the old row, not overwrite it, and "Not a change" must be remembered and say so. [synthetic; consistent with JTBD 4 and 04b "Ops is split"] [#90, #109]
5. **The export is her Friday, minus three stale bits.** A rich table with sources is the long-standing ask (02, 03a). But Status drops its date, the drifted row stays "Settled" beside the open question that challenges it (it breaks 05c's "one check updates the cell, the question and the line"), and the retired row loses its source. [synthetic; grounded in 02, 05c, M1] [#6 frozen, #109]
6. **The kept copy competes with Confluence.** "Kept in this browser" is a fifth copy on the laptop she wiped, and Maya already edits the Confluence table. She'd use the lane if it started from a pasted section 4 "as of today". The moat is the drift check against *her* table, not storage. [synthetic; grounded in 03a "right in two, wrong in two" and 07 wipe] [#91, #100]

### Probe verdicts

| Probe | Verdict | Why |
|---|---|---|
| (1) "≠" row: finding or error? | **Error at a glance → finding when read → mislinked when checked** | "Not kept" + alert red = save failure. "Differs from … settled 8 Oct" + two quotes = finding. The quotes agree with the linked row, so the true finding is the missing scope |
| (2) "5 settled · not re-asked" builds trust? | **No as shipped. Yes if openable and correct** | Count is off by one (retired counted). "Not re-asked" hides whether a row was checked or absent. A per-row "holds · line / not in this thread" would fix it |

### Misreads and distrust in Exploration 08

| Where | What she'd misread or distrust | Suggested change |
|---|---|---|
| Drift chip "DRIFT · NOT KEPT", alert red dashed | Save failure / validation error | Style as an open question, not an alert. Copy: "New in this thread · not in your glossary yet" |
| ≠ glyph | "Blocked" icon | Keep ≠ but pair it with words: "differs from" |
| "Differs from 'Ops, current practice'" | Names a row, not the words it contradicts. Here the quoted words agree | Quote the contradicted clause, or say "your row doesn't cover lane changes" |
| "5 settled" (lane header + coach) | Count wrong (4 settled + 1 retired) | Count retired separately. Make the chip open a per-row list |
| "not re-asked" | Can't tell checked-and-holds from not-mentioned | Per row: "holds · <line>" or "not in this thread" |
| "Ops, current practice" | Reads as all of Ops. It's nights | Desk name: "Ops, nights (Maya)" |
| "Ops, Dana's sheet · Retired · A new booking for any change" | Misquotes Dana, and marks the day desk's live practice retired | Quote Dana's actual rule. "Retired" needs who and why |
| "Settled · 29 Sep" with source "Slack, 22 Sep" | A Slack line isn't a settlement. Who settled it? | "Settled by <owner>, <date>" (Marcus: owned + dated) |
| "Kept in this browser" | Fifth copy, goes stale vs Confluence | "As of" plus paste-in from her Confluence table. Show when last compared |
| Primary "Raise at the review" | Embarrasses the desk owner | Add "Ask the owner first". Don't make the review the default |
| "Update the kept row" | Overwrites Maya's row without a source | Require a source, and strike the old row rather than replace it |
| "Not a change" | Will it re-flag next thread? | Say "won't flag again for this line" |
| Export Status "Settled" (no date) | Drops what Marcus reads | "Settled 8 Oct · raised 14 Oct" |
| Export: drifted row still "Settled" | Stale beside open question 1 | Update the cell with the question (05c rule) |
| Export: retired row source → "Retired 8 Oct 2026" | Provenance lost | Keep the source and add the retirement date |
| "late" term | Not her domain: the example thread's | Use her words in the mock, or label it example |

### Roadmap implications

- **#109 (Words lane):** keep the ≠-inside-the-term pattern and the two quotes under the question. Before build:
  - restyle drift as an open question and rename "not kept";
  - require "Differs from" to quote a clause;
  - fix the settled count and make it openable, one line per row.
  - Add an acceptance check that the settled count equals the settled chips.
- **#100 drift gate:** add a case where the new line agrees with the linked row's words but breaks its unstated scope. The expected output is "row doesn't cover X", not "differs from". Also a "not in this thread" versus "holds" split for each settled row.
- **#90 (row status and actions):** add "Ask the owner first". "Update" requires a source and strikes the old row. "Not a change" is remembered and said so. "Settled" carries an owner.
- **#77:** "current practice" is a new desk-hiding label. Group names must be desk names in the kept glossary too.
- **#6 (frozen):** her export notes are logged but not acted on. When #6 unfreezes, Status carries a date, a raised row updates its cell, and retired rows keep their source.
- **#91 moat:** the pull is the drift check against *her* Confluence table, with paste-in "as of" as the entry point. Browser storage alone reads as another stale copy.

### Questions for the next interview

- (If #109 ships with openable "settled") Does she still count chips by hand? How long does opening the list take?
- (Tender thread) Pasting her Confluence section 4 plus the tender thread: is the first drift flag true when checked line by line?
- Does "Ask the owner first" get used, and does Maya accept a flagged row in a DM?
- (Kept for #70) With a real practitioner: "Here's your glossary and a new thread. Which flag would you check first, and did it hold?"
