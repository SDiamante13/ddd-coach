# Synthetic interview 02: Priya Raman, after slice 2 (+ Design Exploration 01)

*Synthetic interview. Treat every point as a hypothesis until a real practitioner confirms it.*

Late September 2026, about two weeks after interview 01. Since then Priya has had one more hour with Dana. Shown: the slice 2 demo and `slice-02.png`, then the Exploration 01 stills 1→5 in order. Told plainly that Exploration 01 is a concept and not built.

## Part A: since last time

**Q:** Last time the Booking split had a Q1 target and a Confluence page with three columns that didn't agree. What's happened since?

**Priya:** It got real. Our VP turned "rough plan by Q1" into "RFC by end of October," so now there's a date with my name on it. The three-column table is still there, but I've added a fourth column for Dana, and it has more question marks than answers. Nobody else touched the Slack thread. The one new thing is that finance got pulled in, because two of our P2 incidents this year were double invoices after a rebook. So the rebook question isn't academic any more.

**Q:** Walk me through the last time you prepared for a meeting with Dana. What did you bring in, and what did you leave with?

**Priya:** That was Tuesday, two days ago. Monday night I spent about two hours re-reading the Slack thread and my Confluence page and wrote seven questions in a draft page. Dana gave me 55 minutes on Zoom and we got through three. The first one ate twenty minutes, because she shared her screen and showed me an Excel sheet she made in 2019 mapping every status to what ops actually does. <mark>That sheet is the only real documentation of the enum, and nobody knew it existed.</mark> I left with answers to three questions, two new questions, a new term (TONU, "truck ordered not used") and a promise that she'd send the sheet. It arrived this morning.

**Q:** What did you take notes in, and what did those notes look like afterwards?

**Priya:** A plain text file, typing while she talked. It's shorthand, like "RB = same bkg unless lane/date chg → AMEND" and "2nd inv sometimes legit, TONU." Wednesday morning I could still read it. By Thursday I'd have lost half of it.

**Q:** Between two Dana sessions, what did you lose or forget?

**Priya:** Mostly the "why." I had "AMENDED??" in my questions list and couldn't remember why I'd flagged it, so I burned two minutes of Dana's time finding out myself. I also lost track of which question came from whom: was the tender one from Ravi or from me reading the EDI code? And I'd used our company Claude to turn my notes from the first Dana call into a clean list, and I couldn't find that chat again among forty others called "Booking notes" or "Untitled." <mark>So the loss isn't the notes. It's the thread between the notes and the questions.</mark>

**Q:** What did the last design doc for a service split contain? Where did the diagrams end up?

**Priya:** The last one was the Quotes extraction in 2024. It used our RFC template: context, goals and non-goals, proposed architecture, a data-ownership table, a strangler migration plan, rollout and open questions. There was a box diagram in the draw.io plugin in Confluence, and a sequence diagram someone pasted as a PNG. Nobody updated either after review, and the PNG's source is gone. The glossary section said "TBD" and still does. <mark>If I'm honest, the glossary is the section that would have prevented the incidents, and it's the one we skipped.</mark>

**Q:** What's the last thing you actually pasted into a Confluence design doc? What did you have to fix by hand?

**Priya:** Last week, into the Booking RFC draft. First, my seven questions for Dana, copied from a Claude chat. That came through fine, because Claude's copy button gives rich text. Second, a table of the 23 statuses I'd kept as raw Markdown in a text file. Confluence pasted it as pipes and dashes, and I rebuilt it by hand with the table button, which took about twenty minutes. The Quotes data-ownership table came from a Google Sheet, which pastes as a real table. I've never pasted a diagram as anything but a screenshot. <mark>What survives in our Confluence is tables and numbered lists. Everything else gets retyped or screenshotted.</mark>

**Q:** What does your AI policy let you paste, and into which tools?

**Priya:** Approved vendors are our Claude Enterprise workspace and GitHub Copilot. Code and internal docs are fine there. Customer names, rates and anything from a customer contract go nowhere, even there. Anything else needs a vendor review with security, and the last one I heard of took six weeks. <mark>OpenRouter isn't on the list, and "the text goes to OpenRouter and the model provider" is exactly the sentence that triggers a review.</mark> So realistically I'd use your tool with a sanitized thread, like I did in August, or at home with a made-up version.

**Q:** When you sanitize, what do you actually change?

**Priya:** Customer names become "Customer A," and I strip rates and lane details. I leave colleagues' first names in, which, now that I say it out loud, is probably not great either. It takes ten or fifteen minutes for a long thread. That's annoying, but I do it.

## Part B: slice 2 as shipped

*(Shown the slice 2 demo and `slice-02.png`: turn 1 names Maersk, turn 2 recalls it. A reload forgets everything. Replies are capped at about 600 tokens, and the conversation at 24k characters.)*

**Q:** Honest reaction. Did this move toward "I'd use it"?

**Priya:** It remembered Maersk. Claude has done that since before I had this job, so it's table stakes, not a reason to switch. I asked for three things last time: tell me where people disagree, don't lose my stuff, and tell me where my text goes. This does none of them, and <mark>the demo literally shows the reload forgetting, which is the one I said was non-negotiable.</mark> To be fair, the error handling looks honest. "The coach took too long" is better than a spinner forever. But no, it didn't move me.

**Q:** What about the limits: replies cut off at about 600 tokens, and a 24k-character conversation cap?

**Priya:** Short replies are fine. I want short. Cut off mid-sentence is not fine. If I paste the thread and the third question to Dana stops halfway, I don't trust the first two. The cap worries me more. My Slack export was about 18,000 characters before I trimmed it. Paste that, go back and forth three times, and you hit the wall. Then the message says "reload to start a new one," which means throw away the work. <mark>That's the reload problem again, just triggered by the tool instead of by me.</mark>

## Part C: Exploration 01, "Untangle a thread" (concept, not built)

*(Shown stills 1 to 5 in order.)*

**Q:** Still 1, the paste screen. First reaction?

**Priya:** OK, that's basically my Slack thread. Someone listened. "Paste the thread nobody could settle" is a bit cute, but it tells me what to do in one line. The lock line at the top is better than nothing. But "the model provider": which one? And my policy doesn't care whether you're honest about OpenRouter. It cares whether OpenRouter is approved. Also, look: I just pasted Maya, Tom and Ravi's real names into it.

**Q:** That lock line is part of the concept. Here's the exact notice planned for the first hosted version: "Your text is sent to OpenRouter and anthropic/claude-sonnet-4. Nothing is stored on our server." It's always visible on the main screen, with no dialog, and it doesn't block the first reply. Given that, would you paste real work material?

**Priya:** No. It's a good notice: short, visible, no dialog to click through. I'd rather have that than a consent pop-up. But it answers "where does it go," and my question is "is that allowed." The answer is no, because OpenRouter isn't on our list. <mark>No wording turns an unapproved vendor into an approved one.</mark> With this notice I'd paste the sanitized thread, which is what I already do with ChatGPT at home.

**Q:** What exactly would you check, or need to see, before you pasted anything?

**Priya:** Four things, in this order. First, who actually processes it. "anthropic/claude-sonnet-4" is a model name, not a company, and I've read that OpenRouter can serve the same model through more than one cloud, so name the company. Second, retention on their side. <mark>"Nothing is stored on our server" says nothing about OpenRouter's logs or Anthropic's.</mark> Third, one line saying whether it's used for training, linked to the policy that says so. Fourth, a link to one page I can forward to security, because that's how anything gets approved here.

**Q:** What wording would make you paste real material, and what wording keeps you at sanitized text?

**Priya:** Real material takes security's yes, or the words "your company's Claude workspace." Nothing on your screen gets me there on its own. For sanitized text, something like "Sent through OpenRouter to Anthropic. Not used for training. Retention: [link]. This app stores nothing." If the link holds up, I'd paste sanitized text without the guilt, and I'd have something to forward to security. Add one line telling me what not to paste, like customer names and rates. <mark>A tool that tells me what not to paste feels like it's read a policy like mine.</mark> And "our server": whose? There's no company name. From a link on Bluesky, that's a promise from a stranger.

**Q:** Still 2. Is the term map, "words that don't match" with who holds each meaning, the thing you'd screenshot into Confluence?

**Priya:** Yes. The top half, anyway. <mark>That's my three-column table, but readable, and it would go straight into the empty glossary section of the RFC.</mark> Two problems, though. It says "FINANCE · TOM." I'm not putting Tom's name in a doc next to the definition everyone thinks is wrong. Use the team, not the person. And the prep sheet in still 3 lists "Rebook" as a second word that doesn't match, but the board only shows "Booking." The rebook one is the one that caused the incidents, so it's the one I'd want on the screenshot.

**Q:** The last event is labeled "Coach's idea" with a dashed border. Does that read as clearly tentative?

**Priya:** On this screen, yes. Dashed and paler reads as "maybe." But two things. First, it's mislabeled: "Booking became invoiceable" isn't the coach's idea. Tom said "invoiceable" in the thread. <mark>If one label about where a sticky came from is wrong, I stop trusting all the "THREAD" labels too.</mark> Second, tentative doesn't survive the trip. In a screenshot the dashed border is just another sticky, and in the Markdown it's an italic bracket at the end of a line that nobody reads. If it's a guess, put "guess" at the front of the text.

**Q:** Last time you doubted voice at your desk. There's a "Talk" toggle up there. Once paste exists, would you still want voice?

**Priya:** Not for this. Paste is the job here, and I'm not reading a Slack thread out loud. But here's where I'd actually talk. Tuesday, right after the Zoom with Dana, <mark>I'd have happily dictated what she said while it was fresh, instead of decoding "RB = same bkg unless lane/date chg" two days later.</mark> So maybe voice for the debrief, not for the modeling. I'm guessing, though. I've never actually done that with any tool. I use voice memos for groceries.

**Q:** Still 3, the prep sheet. Would it survive Dana's first read?

**Priya:** Dana would skip to the questions and ignore the rest. Question 2, REBOOKED versus AMENDED, she'd love, because she wrote those statuses. Question 3, "which moment should booking mean across teams," she'd bounce straight back at me: "that's your call, not mine." <mark>It's an engineering decision dressed up as a domain question.</mark> What works with Dana is a concrete case. "Load 48213 got rejected Tuesday and we rebooked with another carrier. Same booking?" She answers those in ten seconds. Abstract ones take ten minutes. So: three questions max, each with a real example, and her words, not ours.

**Q:** And the copy options: Markdown for Confluence, image for Miro?

**Priya:** Markdown, mostly. Lists and bold come through when I paste into Confluence. Tables are where it breaks, and I'll get to that. Cut the Miro one for me. They cut Miro seats to ten in August and I lost mine, so the Confluence page is where everything lands now. That's a change from what I told you last time.

**Q:** Say you paste the export into the RFC. What's the minimum format that survives: plain Markdown, a table, headings, Mermaid, an image? Which sections, in what order, and what would you delete by hand?

**Priya:** Rich text on the clipboard, with Markdown as the fallback, because raw Markdown tables arrive as pipes in our Confluence. Three sections, in this order. First, "Words that don't match" as a table with columns for term, team and what they mean, for the glossary. Second, the open questions as a numbered list, each marked open, my notes or confirmed by Dana. Last, the events as a numbered list. No Mermaid, because we don't have the plugin and it would show up as code. No image either, because I can take a screenshot myself, and an image can't be edited when Dana corrects something. By hand, I'd delete the "prep for Dana, Thu" title, the guesses, people's names and any line where the coach explains itself. <mark>If I have to delete more than three things, I'll just retype it, and then the export didn't help.</mark>

**Q:** Still 4, "Welcome back, Thursday. Did you get to ask Dana?"

**Priya:** This is the screen I asked for last time. My board from Tuesday, with counts, and it's still there. But "Yes, add her answers": how? If it's a form with one box per question, I won't fill it in. If I can paste my messy shorthand and it matches the bits to the questions, that's the best thing in the whole concept. Also, this should be a banner, not a modal I have to click through every time.

**Q:** Still 5. Her answer shows as "Dana said: Same booking, new carrier. Finance's second invoice is a bug." Does "Dana said" feel right as a source? Would it make Dana nervous about being quoted?

**Priya:** This one worries me the most. What Dana actually told me on Tuesday is that the second invoice is sometimes legitimate: a TONU fee, when the first carrier had already sent a truck. So <mark>the tool turned my paraphrase into her quote, then turned the quote into a conclusion, "a bug, not a rule," and the conclusion is wrong.</mark> That's my wrong-but-tidy picture from last time, in green. And yes, Dana would be nervous. If "Dana said finance's invoice is a bug" lands in Confluence, the finance director messages her, and I never get another hour. Call it "my notes from Dana, 22 Sep, unconfirmed," and give me a way to send her the three answers and ask "did I get this right?" The coach's last line, "want to test it with an example?", is actually the right move. It should ask that before it decides anything is a bug.

**Q:** What's missing, what's wrong, and what would you cut?

**Priya:** Missing: the enum. I have 23 statuses and Dana's Excel sheet, and I want each status matched to a term or flagged "nobody knows." Also, I want to click "THREAD" on a sticky and see the line it came from. Wrong: people's names instead of teams, "Dana said," the invoice conclusion, and "Rebook" missing from the board. Cut the Talk toggle for now, the "Come back Thursday" button (I don't need a button to leave, just keep my stuff), the Miro image, and question 3. The coach caption covering the question sticky is also annoying, but that's polish.

## Part D: close

**Q:** If you could only have one thing in the next month, what is it now?

**Priya:** Same as last time plus one: paste in, get the words that don't match and three questions for Dana as text, <mark>and it's still there when I come back with her answers.</mark> That's two things, I know. But the second one isn't optional, because the prep is worthless if I can't close the loop after the call. If I had to choose between the pretty board and it being there Thursday, give me plain text that's there Thursday. Dana's out for three weeks from mid-October, so I have maybe two more sessions before the RFC is due.

**Q:** What would make Marcus take it seriously?

**Priya:** Not a diagram. Marcus respects incidents. If the term map said "these two P2s were ops-booking versus finance-booking confusion" and linked the tickets, he'd read it. The last-ten-tickets spreadsheet worked on him for the same reason. And keep the DDD words out of anything he sees. <mark>He'll read "words that don't match." He will never read "ubiquitous language."</mark> The labels in this concept are right on that.

**Q:** Anything we should have asked but didn't?

**Priya:** Ask about Aisha, our PM. She does half the stakeholder chasing and preps her own questions for finance, so she might be the second user before any engineer is. Ask who at my company would have to approve this, because that decides whether I use it at work or only at home. And ask what happens after Dana confirms something. Where does the answer go so it doesn't die in my text file again?

---

## Interviewer notes (out of character)

### Key insights

1. **Persistence is still the gate, and slice 2 didn't move her.** In-tab memory is "table stakes." The demo shows the reload forgetting, the one ask she called non-negotiable. The 24k cap's "reload to start a new one" copy is the same loss, triggered by the tool. [strong signal] [contradicts roadmap: B12 parked; slice 13 "no persistent history"]
2. **Her AI policy blocks work use through OpenRouter.** The only approved vendors are Claude Enterprise and Copilot. A new vendor needs a security review (about six weeks). "No wording turns an unapproved vendor into an approved one." Today she would use it only with sanitized text or at home. [strong signal] [contradicts roadmap: 2a hosting, and the backlog's "OpenRouter configuration belongs to the app operator"]
3. **The planned 2a notice is well placed, but it only unlocks sanitized use, and it leaves out what she checks.** She likes it visible, with no dialog. In order, she checks: which company processes the text (a model slug isn't a company), retention at OpenRouter and at the provider ("nothing stored on our server" covers neither), training use with a policy link, and a page she can forward to security. She also wants the operator named and a "don't paste customer names or rates" line. [strong signal] [supports roadmap: slice 2a notice placement; the wording is insufficient]
4. **Export means a table and numbered lists, pasted as rich text. Term map first.** Past behavior: raw Markdown tables arrived in Confluence as pipes, and she rebuilt 23 rows by hand. The minimum is terms as a table (term, team, meaning), then questions with a status, then events. No Mermaid (no plugin) and no image (can't be edited). If she has to delete more than three things, she'll retype it instead. [strong signal] [contradicts roadmap: slice 4 builds events first; slice 13 has no export; interview-01 suggestion 4 assumed plain Markdown]
5. **"Dana said" is the most dangerous element in the concept.** The concept's answer contradicts what Dana actually said (a TONU fee is a legitimate second invoice). The tool turned a paraphrase into a quote and the quote into a wrong conclusion. Label answers "my notes, unconfirmed," confirm them with the expert, and test with an example before concluding anything. [strong signal] [supports B22 Example Map; contradicts Exploration 01 still 5]
6. **Tentative labels don't survive export, and one wrong label spreads distrust.** "Coach's idea" is mislabeled, since Tom said "invoiceable." A dashed border disappears in a screenshot, and an italic bracket in Markdown gets skipped. Put the source at the front of every item, and use teams, not people's names. [strong signal] [neutral: no roadmap item for provenance; refines B05]
7. **Questions for the expert need concrete cases, three at most, and must not hand the expert engineering decisions.** Dana answers "load 48213, same booking?" in seconds. She'd bounce "which moment should booking mean" back to Priya. [strong signal] [supports slice 3 and B22]
8. **Voice is reframed as post-session debrief capture, not modeling.** She'd dictate Dana's answers right after the call. She admits she has never done that. [weak signal: speculative, no past behavior] [contradicts slice 12 removing the composer; loosely supports slice 7]

### What changed since interview 01

- **Confirmed:** paste-first input, solo prep before the expert session, persistence as the trust gate, output has to reach Confluence, and no DDD jargon in front of Marcus.
- **Strengthened:** data flow. Interview 01 asked for "one sentence telling me where my text goes." Shown the exact 2a sentence, she approved of where it sits but said it only covers sanitized use. Work use needs vendor approval, plus the processor, retention and training facts, and a page she can forward.
- **Weakened:** Miro as a destination. She lost her Miro seat in August, so export means Confluence. "Copy as image for Miro" drops in value. Plain Markdown export (interview 01, suggestion 4) is weaker too: raw Markdown tables break on paste, so she needs rich text with Markdown as the fallback.
- **Shifted:** voice went from "doubtful at a desk, maybe on a dog walk" to "maybe for the debrief right after the expert call." It's still unproven.
- **New:** attribution risk (people's names on definitions, "Dana said" as a quote); the expert confirming or correcting answers; questions built on concrete cases; the enum and Dana's 2019 Excel sheet as a second source; incidents and linked tickets as the evidence Marcus would read (weak, secondhand); the PM (Aisha) as a possible second user; a deadline (RFC due end of October, Dana away three weeks from mid-October).
- **Interview-01 asks vs. what shipped:** slice 2 addressed none of the three (disagreement, keep my stuff, where my text goes). Exploration 01 addresses all three plus export, but only as a concept.

### Design feedback: Exploration 01

**Keep**
- Paste-first start screen. "OK, that's basically my Slack thread. Someone listened."
- The plain label "Words that don't match" and the term map as the lead artifact. "That's my three-column table, but readable, and it would go straight into the empty glossary section of the RFC."
- Questions ranked by what they unblock. She got through 3 of 7 on Tuesday.
- A copy action on the prep sheet. "Markdown, mostly. Lists and bold come through."
- The lock line, visible and never a dialog. "It's a good notice: short, visible, no dialog to click through."
- Welcome back with the saved board. "This is the screen I asked for last time."
- The coach offering to test with an example. "It should ask that before it decides anything is a bug."

**Change**
- Person names become teams. "I'm not putting Tom's name in a doc next to the definition everyone thinks is wrong."
- "Dana said" becomes "My notes from Dana · date · unconfirmed", with a confirm step. "The tool turned my paraphrase into her quote."
- Put the source in front of the text ("Guess:", "From thread:") and fix the mislabeled "Coach's idea." "If one label about where a sticky came from is wrong, I stop trusting all the 'THREAD' labels too."
- Show every mismatched term on the board, including Rebook. "The rebook one is the one that caused the incidents."
- Prep sheet: questions only, three at most, each with a concrete case. "What works with Dana is a concrete case."
- Copy the export as rich text: terms as a table, then questions, then events. "Raw Markdown tables arrive as pipes in our Confluence."
- The lock line names the processing company, retention, training, the operator and a link. "'Nothing is stored on our server' says nothing about OpenRouter's logs or Anthropic's."
- "Add her answers" takes pasted shorthand, not a form. "If it's a form with one box per question, I won't fill it in."
- Welcome back becomes a banner. "This should be a banner, not a modal I have to click through every time."

**Cut**
- The coach's conclusion "a bug, not a rule." "The conclusion is wrong."
- Question 3 ("which moment should booking mean"). "It's an engineering decision dressed up as a domain question."
- "Copy as image for Miro." "They cut Miro seats to ten in August and I lost mine."
- The "prep for Dana, Thu" title and coach commentary in the export. "By hand, I'd delete the 'prep for Dana, Thu' title … and any line where the coach explains itself."
- The "Talk" toggle, for now. "Not for this. Paste is the job here."
- The "Come back Thursday" button. "I don't need a button to leave, just keep my stuff."

### Roadmap assumptions this interview challenges

- **Saved sessions wait for evidence of repeat visits** (B12 in "later ideas"; slice 13 "no persistent history"). This is the second interview where persistence is the gate, and slice 2's demo shows the gap on video.
- **OpenRouter is the operator's concern, with no provider settings in the visitor's path** (backlog "Confirmed product direction"; slice 2a hosting). At companies with an approved-vendor list, a hosted OpenRouter app is blocked for real work no matter how clear the notice is. The target is either sanitized/home use (and should say so) or a path through an approved vendor.
- **One sentence settles data flow** (slice 2a notice: "Your text is sent to OpenRouter and <model>. Nothing is stored on our server."). The placement is right. The content names a model, not a company. It says nothing about retention at OpenRouter or the provider, or about training, and "our" names no operator. Without a link she can't forward it to security.
- **Export can wait, or plain Markdown is enough** (slice 13 "available to inspect"; interview-01 suggestion 4). Her Confluence turns raw Markdown tables into pipes. The minimum export is a rich-text table plus numbered lists, with the term map first.
- **Public GitHub links are leading context candidates** (B17, B18 named "leading" alongside B01–B02). Her monolith is private (B19), and her real second source is a pasted enum and an Excel sheet. Paste beats GitHub for this ICP.
- **The board starts with events** (slice 4, 4a–4d). What she'd actually screenshot and paste is the term map. An events-only board delays the part she values most.
- **The 600-token cap is safe because replies stay short** (slice 1b; B35). A structured untangle (terms, events, questions) that gets cut off costs trust. The cap needs either a shape that fits or a visible "cut short" marker.
- **The 24k cap is an edge case** (B38, B40, B41). One realistic paste of 18k characters plus a few turns reaches it, and the "reload" copy then discards the work.
- **Disagreement is attributed per source** (B05). Attributing by person is socially risky. Attribute by team, and treat the expert's answers as unconfirmed notes.
- **Voice replaces the composer** (slice 12). Voice may have a job in the debrief, alongside text and paste, not instead of them.

### Small slice suggestions

1. **Keep the session across reload (local only).** Before 2a; the smallest part of B12. Carried over from interview 01, now with two interviews behind it.
   - *Smallest result:* the log and history survive a reload in the same browser. A "New session" control clears them.
   - *Acceptance:* send 3 turns, close the tab, reopen. All 3 show, and the 4th reply uses a turn-1 detail. "New session" empties the log and the next request has `history: []`. Nothing is stored server-side.
2. **A data-flow notice that names the processor.** Replaces the planned 2a wording.
   - *Smallest result:* an always-visible line with no dialog: "Sent through OpenRouter to <provider company> (<model>). Training: <per policy>. Retention: <link>. Run by <operator>; this app stores nothing. Don't paste customer names or rates." The link opens one page she can forward to security.
   - *Acceptance:* visible without scrolling at 400px and 1280px, and the first reply isn't blocked. The provider company comes from server config, and OpenRouter provider routing is pinned so no other company can serve the request. Every training or retention claim on the page links to that vendor's own policy, and an unsourced claim isn't shown. A grep of `server/` finds no persistence or logging of request bodies.
3. **Untangle a paste into three sections and copy it as a table.** A slice 3 variant; B05 attributed by team.
   - *Smallest result:* a pasted thread gets back "Words that don't match" (term, team, meaning), up to 3 questions for the expert, each with a concrete case, and up to 5 events, each prefixed "From thread:" or "Guess:". A Copy action puts rich text (HTML) plus a Markdown fallback on the clipboard, in that order, with no title and no coach commentary.
   - *Acceptance:* paste the Exploration 01 Eazy Freight thread. Both "Booking" and "Rebook" appear, holders are teams (not first names), and "Booking became invoiceable" is marked "From thread." There are no aggregates, and no question asks the expert to choose a system-wide definition. The reply ends on a complete sentence within the 600-token cap. Pasting into Confluence Cloud gives a real 3-column table and two numbered lists, with nothing to delete by hand.
4. **Paste notes back as unconfirmed answers.** After suggestion 3; needs suggestion 1 to be useful.
   - *Smallest result:* pasted shorthand notes are matched to the questions and labeled "Your notes from <expert>, unconfirmed." The coach asks for one example before drawing any conclusion.
   - *Acceptance:* paste "RB = same bkg unless lane/date chg → AMEND; 2nd inv sometimes legit, TONU." The reply attributes both notes to the right questions, uses the word "unconfirmed," doesn't call the second invoice a bug, and asks one example question.

Dropped from the shortlist: "Reply cut short" marker (B35-adjacent). It's still worth doing, but suggestion 3's acceptance check already requires replies that don't get cut off.

### Questions for interview 03

- Last time an expert corrected your notes, what did you do with the correction? Where does it live now?
- Who approves a new AI vendor at your company, and what happened the last time someone asked?
- (A real security reviewer) Here's the data-flow page. What would you ask before approving sanitized use? What about real use?
- After your next paste into the RFC, what did you delete or retype by hand?
- Walk me through how the double-invoice P2 was found, written up and linked to a cause.
- (Aisha, the PM) What did you prepare before your last meeting with finance? What did you bring back?
- (Dana, a real domain expert) Here's a prep sheet. Which question would you answer first, and which would you send back?
- The last time you recorded a voice memo about work, what happened to it afterwards?
