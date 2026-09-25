# Synthetic interview 04b: Priya Raman, after slice 37 + explorations 03, 02b

*Synthetic interview. Treat every point as a hypothesis until a real practitioner confirms it.*

Friday 9 October 2026, four days after interview 03a and one day after Marcus's stakeholder interview (M01). Dana's last session before her leave happened yesterday. Shown, in order: the slice 37 refusal (`slice-37.png`, plus one sentence on what signing does); the Exploration 03 stills `t1-what-leaves` → `t4-in-rfc`, clicked through once in `table.html`; four screenshots of Exploration 02b, `limits-v2.html` (the cut with Continue, the warning before a big paste, "This conversation is full", the board carried into a fresh conversation). Told plainly that 03 and 02b are concepts, not built. The reviewer claims were introduced as coming from "a reviewer like Marcus", and she was told she could disagree. The paste box, the Sunday replay and Exploration 04 are held for interview 04a.

## Part A: since last time

**Q:** Last time Dana had one session left before her leave. Did it happen? Where's the RFC?

**Priya:** It happened yesterday, not on the 13th. Dana moved it up because she's handing over ops work before she goes on the 15th. From Monday, anything ops goes to Maya, who is now on the RFC's reviewer list. Finance booked the review for Tuesday the 27th, so my real deadline moved up three days. The glossary has seven rows. Marcus still hasn't opened it. He's a reviewer, so he'll open it the night before.

**Q:** What did you bring to Dana yesterday, and what did you do with her answers in the first 24 hours?

**Priya:** Yes/no lines, like I told you. I sent her five in Slack on Tuesday, a day before the call. She answered four with a plain yes or no before we even talked, which never happens with bullets. The fifth, "a lane change makes it a new booking," got "depends, let's talk." On the call it turned out Dana still says yes. But since she left ops, Maya's team has been rebooking lane changes as REBOOKED for two years. <mark>So the split isn't ops against finance any more. It's Dana against Maya, and both of them are ops.</mark> I fixed the text file and the Confluence table the same night. This time I deleted the old Claude chat instead of correcting it.

**Q:** What's the last thing you put into the RFC table, and how?

**Priya:** On Tuesday, finance left a comment on the glossary: "What does the system actually do today?" Fair question. So I read `Booking#rebook!` for the first time in a year. It sets the old row to REBOOKED and inserts a new booking row pointing back at the old one, and the customer portal keeps showing the old reference. <mark>So the database agrees with finance and the screen agrees with ops.</mark> I typed that in as two rows by hand and linked the method on GitHub. That took about fifteen minutes, and it's the third time I've built rows in that table by hand.

## Part B: slice 37, the coach only trusts its own words

*(Shown `slice-37.png`: three turns, then a red box reading "This conversation can't be verified. Reload the page to start a new one.", with no Retry. Told: every coach reply now comes back signed, and if the history sent back has been edited, the coach refuses before it reads anything. An honest user would mainly see this if the site is updated while their tab is open. Also told that in the demo, the next message after the refusal still worked.)*

**Q:** Does "the coach only trusts its own words" matter to you? Would it matter to someone like Marcus?

**Priya:** To me, not really. I'm never going to edit what the coach said to trick it, and until today I didn't know anyone could. My worry has always gone the other way: the coach putting words in someone's mouth, like Sunday, when it gave Tom's line to ops. <mark>Signing its own words doesn't stop it misquoting mine.</mark> For Marcus, it's one line on a data page at most. His first question is where our Slack went, not whether someone tampered with a transcript. It's the right kind of security for me, though: I never see it.

**Q:** Say you do see it, because the site was updated mid-session. You read "Reload the page to start a new one." What do you do?

**Priya:** I reload, because it tells me to. Then everything's gone, because you still don't keep anything across a reload. I told you in interview 02 that the reload line on the length cap was the same loss, and on Sunday the 413 cleared my box and cost me ten minutes. And "can't be verified" reads like I did something wrong, or our proxy mangled something. <mark>You've got a red box telling me to press the button that deletes my work, with no warning, and I'd press it.</mark> Since the re-image in March I copy everything before I reload anything. But I only do that when I'm expecting trouble. When a screen tells me exactly what to do, I just do it.

**Q:** In the demo, the next message after that error worked fine.

**Priya:** Then it's telling me to throw away something that works. That's worse than a wrong answer. It's a wrong instruction.

**Q:** What should it say or do instead?

**Priya:** Say what happened in words I understand: "The coach was updated while this page was open, so it can't use your earlier replies." Then two buttons, in the order you already got right in the limits concept: "Copy the conversation" first, then "Start a new one", which says out loud that the old one goes. And if my next message would work anyway, don't mention reloading at all. <mark>Until you keep things across a reload, anything that says "reload" needs a copy button right next to it.</mark>

## Part C: Exploration 03, "Leave with a table" (concept, not built)

*(Shown t1–t4 in order: the swap chips with "Show what's sent", the "Words that don't match" table with a Status column, the "One next step" card with yes/no lines for Dana, and the table pasted into an RFC's "4. Glossary". Clicked through `table.html` once, including Copy table.)*

**Q:** Last time you pasted a table into the RFC, you rebuilt six rows. Would this one survive Dana's and finance's review as it is? What would you retype?

**Priya:** It pastes as a table, which is the first time anything you've shown me does. Finance would read it as is. I'd retype three things. First, the Rebook ops row. "Checked with Dana 29 Sep" is a week stale, and "ops is split on lane changes" came through as a lowercase aside in brackets, so it reads like a footnote. Second, every "From thread", because finance will ask which thread. Third, not the table itself but it's on the same screen: the second Dana line says "A change of lane or date makes it AMENDED." <mark>That's my wrong note from the 22nd, and Dana corrected it twice. Your concept would have sent my mistake back to her as a question.</mark> About ten minutes of fixing instead of twenty-five. That's the first time that number went down.

**Q:** What would finance do with it?

**Priya:** Read their two rows and nothing else. They'll edit "rate locked" to their own word, because "locked" means something specific in their system. Which is fine. That's why it has to paste as text and not as an image.

**Q:** The last column is "Status". Right name for the people reading the doc?

**Priya:** No, and it's worse in my RFC than in general. Section 3 of my RFC is the booking status enum, 23 values. <mark>Put "Status: From thread" two scrolls below REBOOKED and AMENDED and someone will think "From thread" is a status.</mark> What the column really says is where each meaning came from and whether anyone checked it. Call it "Source". "Slack thread, July" is a source. "Checked with Dana, 8 Oct" is a source too. One column is enough.

**Q:** "Ops is split." Does that feel safe in a doc Ops will read?

**Priya:** Safe to say, but not like that. Maya reviews from Monday, and she'll read "Ops is split" as "Priya thinks Maya's wrong." In July the only real message she wrote in that thread was a correction of how I'd described ops, so I know she reads anything with "ops" in it. What's true is that there are two practices inside ops. So write two rows: "Ops, current practice: same booking, REBOOKED" and "Ops, Dana's 2019 sheet: new booking if the lane changes." <mark>That credits a practice and a document, not a person.</mark> It's what Dana asked for with "put it in as ops, not as mine." In the tool, the red "split" chip is fine. It just can't be the thing that lands in the doc.

**Q:** "Show what's sent" plus your own swap list. Does it change what you paste?

**Priya:** It answers my question from last time, "swapped where?": in my browser, and I can see it. It changes how long sanitizing takes, maybe fifteen minutes down to five, since it's the same six customers every time. It doesn't change what I paste, because the vendor's still not approved and your own note says rates and lanes aren't caught. Honestly, the risk is it makes me lazy: I'd paste the raw export and trust the list, and the week a seventh customer shows up, it goes out.

**Q:** The preview still shows "load 48213". Would you add it to your swaps?

**Priya:** No, and this is a real conflict. If I swap 48213 to "Load 1", the coach's best question, "look up load 48213 in your own system", becomes "look up Load 1", and I can't. <mark>The swap breaks the one next step I said was facilitation.</mark> Unless you swap it back in the replies I see. Also, the preview says "Ops (ops):" on every line, which looks broken. Swap the name and drop the duplicate.

## Part D: claims from a reviewer like Marcus

*(Told: "Three suggestions come from a staff engineer who reviews docs like yours. He's not the person we build for. Disagree freely.")*

**Q:** First claim: every row should have something he can open, like a ticket, a Slack permalink or a load. His words were that "From thread" with no link is "trust me with better formatting."

**Priya:** That's Marcus, whether or not it's him. And he's right about the idea: my ten-ticket spreadsheet had a Jira key on every row, and that's why it worked. But your tool can't give me those links. It only ever sees my sanitized paste, so it's never seen a Slack URL. <mark>A link on every row, yes. A link your tool made up, never.</mark> I'd add them myself in Confluence. The tool should keep the reference as plain text, like "thread, 14 Jul", "load 48213" or "Dana's sheet, row 12", so I know what to link.

**Q:** Could you give each "From thread" row a permalink today? How long would it take?

**Priya:** About five minutes. It's one thread, so four rows get one link. Tom's message has its own permalink, and I'd use that for finance's row. That does put Tom's name one click from the definition everyone thinks is wrong. I've decided I'm fine with it: he said it in a public channel. The problem was his name on the page, not his name behind a link. The load goes to our admin page, which is fine in an internal doc.

**Q:** Second claim: the term map should have a row for "what the code does."

**Priya:** He's right. I'll say that here, not to him before the review. I did exactly that on Tuesday by hand, because finance asked, and it's the most important row in the table: the code agrees with finance. It's missing from your concept because the table is about teams, and code isn't a team. <mark>Put "Code" in the Team column, with a link to the method, and it's the row I should have written in July.</mark> If the coach fills it in, it has to say it came from code I pasted. If it's a guess, it has to say "Guess".

**Q:** Would you actually fill that row in, or is it a nice idea?

**Priya:** I already did, on Tuesday. And it's the row Marcus will check first, because it's the one he can check in two minutes. So it'd better be right.

**Q:** Third claim: next to "split" or "unconfirmed", say who settles it and by when.

**Priya:** "By when", yes, but it's the same date for every row: the review on the 27th. So say it once, above the table. "Who" is the actual fight. Nobody's job is to break ties between ops and finance. If I write "Maya to settle", I've just handed Maya the rebook definition, and finance will object in the comments. "Dana to confirm" was right until yesterday. Now it's stale, which proves his point about dates. <mark>Put a date on it, yes. Put a name on it, and I'm back to Tom's name next to the wrong definition.</mark> So it goes in the open questions list as a role, like "ops lead and finance controller, at the 27 Oct review", and your tool shouldn't guess it, because it doesn't know our org.

## Part E: Exploration 02b, "Honest limits" v2 (concept, not built)

*(Shown four screenshots of `limits-v2.html`: 1, a reply cut mid-question with "Cut short at the reply length limit · Continue" right under the last word; 2, after Continue, a "continued" tag in the text, and a warning over the message box: "This paste would use 9,400 of the 11,340 characters left in this conversation. After it, there's room for about one short reply." with "Send anyway" and "Copy everything first"; 3, "This conversation is full" with "Copy everything" as the blue button; 4, "Started fresh with your board": the term table carried over, statuses matched by name, open questions, and a "Previous conversation (read-only)" button.)*

**Q:** Did it fix what you flagged last time: the marker at the cut, Continue only appending, Copy first, carrying the board?

**Priya:** All four, yes. The marker sits right at the cut, and I saw it without scrolling this time. Continue added text after a "continued" tag and didn't touch questions one and two. Copy everything is blue. It carries a table and not a paragraph, the statuses are listed by name, and the old conversation stays readable. The percentage is gone too. I went looking for what you missed again, and that part's clean.

**Q:** Look at the carried board. What would you check?

**Priya:** What's missing and what's stale, and both happened. There were three questions before the cut, and the carried list has two. The load 48102 one, about the two invoices, is gone, replaced by a "for you to check" item. <mark>That's the TONU question, which is exactly what the Claude summary dropped in September.</mark> And the Rebook ops row carries "unless lane or date changes · unconfirmed". That's my wrong note, word for word, after Dana corrected it. Word for word is what I asked for, and it carried my mistake word for word. So the test isn't "word for word". It's nothing missing and nothing stale.

**Q:** The warning before a big paste. Is that the one you asked for?

**Priya:** Close. I'd skip "9,400 of 11,340". "Room for about one short reply" is the sentence I'd actually read. What's missing is the button I'd press, "I'll cut it down", but the paste stays in my box, so I can cut it myself. That's fine.

**Q:** Anything else wrong?

**Priya:** Two things. The notice is now "Where your text goes · show". In 03b I said your notice looked like cookie small print. <mark>Now it's a cookie banner I have to open.</mark> On Sunday it was the only thing on the page I read, and I wouldn't have clicked "show". Second, the finished question 3 now asks, "Was the first carrier's truck already on its way?" That's better than giving the answer. But it's a fact I can look up myself in fifteen minutes, so it's a question for me, not for Dana. And question 2 lumps "lane or date" together again.

## Part F: the knowledge base (#58)

*(Told: the coach may soon be grounded in real sources, starting with Evans's* DDD Reference *(free, CC BY), and may cite them by section, for example "Evans, DDD Reference: Bounded Context".)*

**Q:** When did you last cite a book in a doc or a meeting? How did it go?

**Priya:** In the Quotes RFC in 2024 I linked Fowler's strangler fig post in the migration section. Nobody commented, and I doubt anyone clicked. It was fine because everyone already knew the pattern. The "bounded context" moment in planning had no citation at all, and a citation wouldn't have saved me. <mark>Marcus wasn't asking what Evans meant. He was asking what it meant in our code.</mark> The laugh was about that.

**Q:** So does a citation like "Evans, DDD Reference: Bounded Context" raise your trust, or is it noise?

**Priya:** In the coach's replies to me, it raises it. What burned me in August was "you should have a Booking aggregate", said like a rule. If it had said where that came from, I'd have seen it was generic. I'd check the first two citations against the PDF, and if they're real I'd stop checking. That's honest, and it's also why one fake section would finish it for me. In the doc, it's noise at best.

**Q:** Which source would Marcus respect?

**Priya:** Incidents, then tickets, then the code. Not a book.

**Q:** That matches him closely. He said incident data, tickets, code, then Fowler's posts on the cost of splitting, and Evans only to define a word.

**Priya:** The Fowler part is funny: he linked "MonolithFirst" on my Quotes RFC. He respects the posts that agree with him. I'd disagree on Evans, though. I wouldn't give him Evans even for a definition, because he'll read it as me hiding behind a book. <mark>I'd define it in our own nouns: the rebook code, the booking rows, ops's screens.</mark> Then the only thing left to argue about is facts.

**Q:** Should the coach teach you DDD terms, or stay in your words? Is that different in your prep and in the exported doc?

**Priya:** Different, yes. In my prep, teach me. I read half the Blue Book, and I want to get better at this, which is the only reason I'd use a coach and not just Claude. But teach once, tied to my mess, like "what you're describing is what Evans calls a bounded context; here that's ops's booking versus finance's", and then go back to my words. If Marcus asks me "is this a bounded context?", I want to know the answer without being the first to say the word. <mark>In the export: zero DDD words, and never one I didn't type.</mark>

**Q:** That reviewer also said he'd want a coach that can conclude "don't split, rename three things." Would you?

**Priya:** Privately, yes. The VP asked for a split, so the RFC can't say "don't". But if the ten tickets come back eight inside the line again, "split later, fix the words now" is a real option. A coach that only reads DDD books will always find contexts, so give it something from the other side.

## Part G: close

**Q:** If you could have only one thing in the next month, what is it?

**Priya:** The table, pasting clean, with a Source column I can link and a Code row. Before the 27th now, not the 30th. Signing, citations and the limits work are for the next RFC. <mark>But fix the reload message before anyone sees it. That's an afternoon, and it's the only thing today that would actively lose my work.</mark>

**Q:** Anything we should have asked but didn't?

**Priya:** Ask me after the 27th whether finance argued about the facts or about the word, because that's how I'll know the table worked. And ask Maya. After Monday she's "Ops", and she hasn't seen any of this.

---

## Interviewer notes (out of character)

### Key insights

1. **The Exploration 03 table nearly survives the review, but "Status" collides with her RFC's booking status enum.** Retyping drops from about 25 to about 10 minutes (anchor: rows rebuilt by hand three times). "Status: From thread" sits two scrolls below REBOOKED/AMENDED. Rename it "Source". One column holds both origin and check ("Checked with Dana, 8 Oct"). [strong signal: past behavior + RFC structure] [supports #6; changes its column spec]
2. **Both concepts re-inject a note Dana already corrected.** The Exploration 03 yes/no line and 02b's carried Rebook row and question 2 all carry "lane or date → AMENDED", her 22 Sep shorthand that Dana corrected twice. The board has to take corrections before anything is carried, exported or sent to the expert. [strong signal] [contradicts #7's "word for word" as enough; refines #4, #6]
3. **02b's carry-over dropped one of three open questions: the TONU one, the same item the Claude summary dropped in September.** "Nothing missing and nothing stale" is her test, not "word for word". [strong signal: mockup evidence + past behavior] [contradicts #7 as designed]
4. **"What the code does" is the finding, and she already built it by hand.** On Tuesday finance asked what the system does. She read `Booking#rebook!`: the old row goes to REBOOKED and a new row is inserted, while the portal shows the old reference. Database = finance, screen = ops. She wants "Code" as a Team value with a method link. [strong signal: past behavior] [PROMOTE for #6 and #4]
5. **Links: yes per source, supplied by her, never generated.** The tool only sees sanitized text, so it can't know URLs, and a made-up link ends trust. It should keep plain-text references ("thread, 14 Jul", "load 48213") she can link in five minutes. A name behind a link is fine; a name on the page isn't. [strong on the "never generated" rule; weak on the five-minute estimate] [MODIFY for #6]
6. **Slice 37 is invisible and fine; its copy is the only thing today that would actively lose her work.** "Reload" deletes everything while #5 is unbuilt, she'd obey the instruction, "verified" reads like blame, and in the demo the conversation still worked. She wants Copy first, then "Start a new one", and no reload line when the next message would work. [strong signal: anchors in 02 (reload on the cap) and 03b (413 cleared draft)] [contradicts slice 37 copy; raises #5's cost]
7. **Citations: trust in prep, noise in the doc, and she goes further than Marcus.** In replies, citations guard against made-up rules; she'd check two, then stop. In the export, no book, not even for definitions: "define it in our own nouns". Teach a term once, tied to her mess, then use her words. [weak signal: hypothetical] [supports #58's citation-integrity rules; adds "no DDD word she didn't type" to #6]
8. **Swaps save time, not policy, and they fight the case-based questions.** Sanitizing drops from about 15 to 5 minutes, and she admits it would make her lazy. Swapping load IDs would break "look up load 48213", unless replies swap back. [weak signal: self-contradiction risk] [refines #4; #34 unchanged]

### What changed since 03a and 03b

- **Confirmed by past behavior:** yes/no lines work. Dana answered 4 of 5 in Slack before the call, against a thumbs-up for bullets. Rows built by hand again (a third time), so the table export still matters. Split inside a team is real and now ranks above ops against finance: Dana against Maya's two-year practice.
- **New:** she read the rebook code (it agrees with finance). Finance review on 27 Oct, three days before the RFC deadline. Maya on the reviewer list from Monday. "Status" collides with the enum section. Swaps conflict with case questions. Her disagreement with Marcus on Evans for definitions.
- **Strengthened:** team, practice or document labels over names (she extends Dana's "ops, not mine" to two ops rows). Copy-first as the default escape hatch, now for the slice 37 error too.
- **Weakened:** "carry the board" as a complete answer. 02b did exactly that and still lost a question and kept a stale note.
- **Unchanged:** sanitized-only use (#34). Notice weight (#55), and 02b moved it the wrong way.
- **03a flags vs 02b:** 4 of 4 fixed (marker, append, copy-first, board), plus no percentage and a readable old conversation. New issues: a question dropped, a stale note carried, the notice collapsed.

### Reviewer claims verdict (for #6 and #4)

Marcus is not the ICP. These verdicts rest on Priya's answers only.

| Claim (M01) | Verdict | What changes | Priya's quote |
|---|---|---|---|
| A clickable link (ticket / permalink / load) on every row | **MODIFY** | One link per *source*, not per row. The tool keeps a plain-text reference in the Source cell ("thread, 14 Jul", "load 48213", "Dana's sheet, row 12"). She adds URLs in Confluence. The tool never generates a URL. #6: Source cell link-ready; rich-text keeps any link she adds. | "A link on every row, yes. A link your tool made up, never." |
| A "what the code does" row in the term map | **PROMOTE** | "Code" becomes a Team value with a method link. When the coach fills it from pasted code, it says so; otherwise "Guess:". #6 table spec; #4 treats pasted code/enum as a holder of a meaning. | "Put 'Code' in the Team column, with a link to the method, and it's the row I should have written in July." |
| Doubt labels that say who settles and by when | **MODIFY** | "By when": one date above the table (review, 27 Oct), not per row. "Who": a role, in the open-questions list, not in the glossary cell. The tool never guesses who settles. | "Put a date on it, yes. Put a name on it, and I'm back to Tom's name next to the wrong definition." |

None dropped. The nearest to a drop is "who, per row", which she rejects inside the table.

### Design feedback: Exploration 03

**Keep**
- Copy table as a real rich-text table. "It pastes as a table, which is the first time anything you've shown me does."
- Swaps running in the browser, and "Show what's sent". "It answers my question from last time, 'swapped where?'"
- The honest line under the swaps (they don't make an unapproved vendor approved, and they won't catch rates or lanes). She quoted it back.
- One next step that costs Dana nothing ("look up load 48213"). It stays her definition of facilitation.
- Yes/no lines she sends herself. Past behavior: 4 of 5 answered before the call.
- The "split" chip *inside the tool*. "In the tool, the red 'split' chip is fine."

**Change**
- "Status" → "Source". "Someone will think 'From thread' is a status."
- An internal split becomes two rows credited to a practice or a document ("Ops, current practice" / "Ops, Dana's 2019 sheet"), not "Ops is split" in brackets. "That credits a practice and a document, not a person."
- Add "Code" as a Team value with a link. "The row I should have written in July."
- Source cells keep a plain-text reference she can link. "A link your tool made up, never."
- Yes/no lines and table rows must use the latest correction. "Your concept would have sent my mistake back to her as a question."
- Swap back in the replies, or don't offer load-ID swaps. "The swap breaks the one next step I said was facilitation."
- Drop the doubled team in the preview ("Ops (ops):"). "Looks broken."

**Cut**
- The "split" wording in the exported cell. "It just can't be the thing that lands in the doc."
- Per-row "checked with Dana <date>" once Dana is away: it goes stale. It moves into Source with the date she actually confirmed.

### Design feedback: Exploration 02b

**Keep**
- The marker at the cut, visible without scrolling. "I saw it without scrolling this time."
- Continue appends after a "continued" tag and leaves questions 1–2 untouched.
- "Copy everything" as the primary button when the conversation is full.
- The board carried as a table, with statuses named, not counted.
- The previous conversation, read-only.
- No always-on percentage.
- "Room for about one short reply." "The sentence I'd actually read."

**Change**
- Carry-over must include every open question. "The load 48102 one … is gone."
- Carry-over must apply corrections first. "It carried my mistake word for word."
- The paste warning: lead with the sentence, drop the character counts. "I'd skip '9,400 of 11,340.'"
- Fact questions she can answer herself are marked for her, not Dana ("Was the first carrier's truck already on its way?").
- Question 2 mustn't lump "lane or date" together.

**Cut**
- The collapsed notice, "Where your text goes · show". "Now it's a cookie banner I have to open."

### #58 implications (citations, teaching vs her words)

- **Citations belong in the coach's replies to her, never in the export.** This matches #58's citation-integrity rules. She'll verify two, then trust, so one phantom section is fatal. Keep "every cited section title exists word for word in the source text" as a hard acceptance test.
- **She goes further than Marcus on definitions.** She wouldn't cite Evans in the doc even to define a word. For the export: no book citations and no DDD terms she didn't type. Definitions are written in the team's own nouns (code, tables, screens).
- **Teach once, in context, then use her words.** In prep, the coach may introduce a term once, tied to her case ("what Evans calls a bounded context; here, ops's booking vs finance's"), then speaks in her words. Add an acceptance check: after the first mention, the coach's next replies use her nouns, not the DDD term.
- **Claims about her system never cite a book.** Already in #58. Her Marcus anchor ("what it meant in our code") confirms it.
- **#59:** she wants a coach that can say "split later, fix the words now". Our own paraphrased notes should include a "when not to split" section, cited by title and link (e.g. Fowler's "MonolithFirst"), so a CC-BY-only DDD corpus doesn't produce a coach that always finds contexts.

### Slice 37 implication (error copy vs #5)

The refusal copy tells an honest user to take the one action that loses everything, while #5 (persistence) is unbuilt. In the demo, the conversation kept working after the refusal. Recommendation: before any #5 work, change the copy in a small follow-up. Say what happened in plain words ("The coach was updated while this page was open…"). Offer "Copy the conversation" first, then "Start a new one" (which states the old one is cleared). Don't mention reloading when the next message would succeed. This is independent of #60's hardening, which she doesn't care about.

### Roadmap assumptions this interview challenges

- **#6: "Term | Team | Meaning | Status" is the right table.** "Status" collides with the booking-status section. It should be "Source", link-ready, and "Code" should be a Team value. An internal split should be two rows credited to a practice or document, not "Ops (view A)/(view B)" and not "Ops is split". The deadline she cares about is now 27 Oct.
- **#6's pending M01 note, "a real link per source cell".** Resolved as MODIFY: she supplies the links, the tool keeps references, and the tool never generates a URL.
- **#7: carrying the board "word for word" preserves her work.** 02b dropped one of three questions and carried a superseded note. Acceptance should test that nothing is missing and nothing is stale, not verbatim text.
- **#4: slice 3's term map is about teams only.** Pasted code or an enum is a holder of a meaning ("Code"). Case-based questions must not reintroduce notes she has corrected. Swaps and load-ID questions conflict.
- **#5: persistence can wait while the error copy says "reload".** Slice 37 added a second path (after the 24k cap) where the tool itself tells her to discard her work.
- **#34: swaps ease the policy problem.** They cut her sanitizing time. They don't change the vendor answer, and they may make her careless. Sanitized-only stands.
- **#55: the notice gets visual weight.** 02b collapses it behind "show", the opposite direction. Carry #55's rule into every exploration.
- **#57: the first visit says what the tool is for.** Neither 03 nor 02b shows a purpose line. 03's header, "Eazy Freight · what is a booking?", is the closest thing to one.
- **#58: Evans citations are fine in the export for definitions** (M01's position). She disagrees: none in the export. Citations stay in replies.
- **#59: CC BY sources plus our notes are enough.** Only if our notes include the "when not to split" counterweight.

### Small suggestions

1. **Rename Status to Source, keep a reference she can link, add "Code".** (#6, narrowest cut)
   - *Smallest result:* the table columns are Term | Team | Meaning | Source. Source holds a plain-text reference ("Slack thread, 14 Jul" / "Checked with Dana, 8 Oct" / "load 48213"). "Code" is allowed as a Team value. Neither format ever contains a generated URL.
   - *Acceptance:* paste into Confluence Cloud. The header reads "Source", with no cell labeled "Status". A "Code" row survives. Both the `text/html` and `text/plain` payloads contain 0 `http` strings unless the user typed one.
2. **Refusal copy with Copy first.** (slice 37 follow-up, before #5)
   - *Smallest result:* on `COACH_UNVERIFIED`, the entry reads "The coach was updated while this page was open, so it can't use your earlier replies." It has two buttons: "Copy the conversation" (primary) and "Start a new one", which clears the log. The words "reload" and "verified" don't appear.
   - *Acceptance:* after a forged turn, the entry has exactly those 2 buttons and no Retry. Copy puts every prior prompt and reply on the clipboard. "Start a new one" leaves 0 entries, and the next request carries `history: []`.
3. **Carry nothing missing, nothing stale.** (#7)
   - *Smallest result:* the carried board lists every open question from the last reply that has them, and any row the user corrected shows the corrected meaning with its new source.
   - *Acceptance:* with 3 open questions and one corrected Rebook note in the conversation, the carried board has 3 questions (including the TONU/48102 one) and no text matching "lane or date".
4. **Swap back in replies.** (#4)
   - *Smallest result:* swaps apply to the outgoing text and are reversed in the displayed reply, so "Load 1" shows as "load 48213" on her screen only.
   - *Acceptance:* with `48213 → Load 1`, the `/api/chat` body contains no "48213", and the displayed reply's next step contains "48213".

### Questions for interview 05

- After the 27 Oct finance review: what did finance change in the table? Did people argue about facts or about the word?
- When Maya reviewed the two ops rows, what did she say or change?
- Did you add links to the Source cells? How many, and how long did it take? Did anyone click one?
- If you saw "The coach was updated…" in real use, what did you do first?
- The first time the coach cited a section, did you check it? What did you find?
- After the coach introduced a DDD term once, did you use it yourself afterwards, in prep or out loud?
- (A real Marcus-type reviewer) Shown the table with a Code row and Source links: what do you open first?
- (A real Maya-type domain lead) "Ops, current practice" vs "Ops, Dana's 2019 sheet" in a doc: comfortable?
