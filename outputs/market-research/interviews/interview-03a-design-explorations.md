# Synthetic interview 03a: Priya Raman, design explorations 01b + 02

*Synthetic interview. Treat every point as a hypothesis until a real practitioner confirms it.*

Monday 5 October 2026, eleven days after interview 02. Since then Priya has had one more hour with Dana (Tuesday 29 September). Shown: the Exploration 01b stills in order (`v2-1-paste` → `v2-5-notes`), then the Exploration 02 stills in order (`s1-cut` → `s4-restored`). Told plainly that both are concepts and not built. The live hosted app, the real #2 notice and "bring your own key" are held for interview 03b.

## Part A: since last time

**Q:** Last time the RFC was due at the end of October and Dana was out from mid-October. What's happened since?

**Priya:** Four weeks to go. I had one more hour with Dana last Tuesday, the 29th, and I get one more on the 13th before she's out. The glossary section has real rows now. I typed Booking and Rebook in by hand on Friday: eight rows, about forty minutes including the fight with the table button. Finance asked to review the RFC, so the rebook definition will be read by the people who think it's cancel plus new. Marcus hasn't opened it.

**Q:** Walk me through the session on the 29th. What did you bring, and what did you leave with?

**Priya:** I tried the thing I told you about: three questions, each on a real load. Two were on 48213, and one was on an August load where the pickup date moved. Dana answered the first two in about five minutes total, which never happens. Then she corrected me. My note from the 22nd said "RB = same bkg unless lane/date chg → AMEND." It turns out a lane change is a new booking and only a date change is an amend. So my own shorthand was wrong for a week, and I'd already put it in the fourth column. <mark>Concrete questions worked. My notes didn't.</mark>

**Q:** What did you do with the correction? Where does it live now?

**Priya:** I fixed the text file that night and the Confluence column on Friday. The Slack thread still has Maya's version and my Claude chat still has the old one, so it's right in two places and wrong in two. Then I DMed Dana three bullets asking "did I get this right?" She thumbs-upped it in under a minute. <mark>A thumbs-up in forty seconds isn't a confirmation.</mark> It means she saw a message from me.

**Q:** Did Dana's 2019 sheet make it into the RFC?

**Priya:** I asked if I could attach it as an appendix. She said yes, but "put it in as ops, not as mine, half of it's Maya's anyway." That's the most she's ever said about being named. She's not worried about my notes quoting her. <mark>She's worried about her name on a page the finance director reads.</mark>

## Part B: Exploration 01b, "Untangle a thread" v2 (concept, not built)

*(Shown stills 1–5 in order: the paste screen with "Replace people's names with their team" ticked, the untangled board, the source popover on "Carrier confirmed, rate locked", the welcome-back banner, and the notes matched to the questions. Told it's a revision built from her interview-02 feedback.)*

**Q:** First pass. Did we fix what you flagged?

**Priya:** Mostly, yes. I'll admit I went looking for what you missed. It uses teams instead of names, Rebook is on the board, and "Guess:" is at the front. The invoiceable card now says "From thread," and I can click it and see finance's line. There are three questions, each with a load, and the "which moment should booking mean" one is gone. The welcome back is a banner, and there's no Talk toggle, no Miro and no Thursday button. What you missed is the one I'd use first: <mark>the button still says "Copy prep sheet (Markdown)."</mark> I told you Markdown tables arrive in Confluence as pipes. That cost me forty minutes on Friday.

**Q:** Anything new that's wrong?

**Priya:** Two small things. TONU sits under "Rebook" like a third meaning of rebook. It isn't. It's a fee, so it's its own word. And the pink sticky on the board, "Rebook: same booking or new?", is question one again. I read it as a fourth question until I looked twice. Also, all three questions are on 48213. Three questions on one load is really one case. On Tuesday the August load did more work than my second 48213 question.

**Q:** Still 1. Replacing names with teams is on by default. Your policy covers the vendor, and also customer names, rates and contract terms. Does this move you from sanitized text to real material?

**Priya:** No. On by default is right, because if I had to remember to tick it, I wouldn't. But it swaps the part of the scrub I wasn't doing. In August the fifteen minutes went on customer names, rates and lanes. I left colleague names in, as I admitted last time. This thread happens to have no customer in it, but the real ones do: "Acme wants the Laredo lane re-rated" is a normal line. <mark>And none of it touches the vendor, which is the actual no.</mark>

**Q:** So what does it save you?

**Priya:** Maybe two minutes, and some guilt. Two things would make it worth more. First, let me add my own swaps, like "Acme" → "Customer A," and keep the list, because it's the same six customers every time. Second, show me the exact text before it leaves. The caption says "names swapped for teams before sending." Swapped where? In my browser, or by your model after it has already read them? <mark>If it's the model, the checkbox is theatre.</mark>

**Q:** The thread still says "load 48213." Does your policy cover load numbers?

**Priya:** Honestly, I don't know. A load ID isn't a customer name, but anyone with admin access finds the customer in one click. Security would probably say yes, and I'd probably leave it in anyway. That tells you how the policy actually works for me. I scrub what I know is on the list and don't think too hard about the rest.

**Q:** Still 5. Your answers are labeled "My notes from Dana · 22 Sep · unconfirmed." Does that stop Dana worrying about being quoted?

**Priya:** In the tool, yes. They're my notes, it says so, and "unconfirmed" turned out to be exactly right, because my lane/date note was wrong for a week. But Dana's worry isn't this screen. It's the RFC. <mark>If "my notes from Dana" is what lands in Confluence, her name is still on it, right next to finance's definition.</mark> For the export I'd want the team: "Ops, checked with Dana 29 Sep" once she's confirmed it, and "Ops, unconfirmed" before that. Her name stays in my copy.

**Q:** And the "Ask Dana: did I get this right?" button?

**Priya:** It depends on what it does. If it sends Dana anything, no. She doesn't know your tool, and a message from a stranger's app is worse than no message. If it gives me text to paste into Slack, yes, but make it yes/no lines, like "Lane change means new booking: yes or no?" She'll answer that properly. Three paraphrased bullets get a thumbs-up.

**Q:** The coach says: "Before we change anything, let's test it with 48213. Had the first carrier already sent a truck?" Facilitation or homework?

**Priya:** Facilitation, and I know because I did it. The Friday after we last talked, I looked 48213 up in the Rails console. The second invoice has a TONU charge line, so yes, the truck showed up and finance's second invoice was legitimate. It took fifteen minutes because the invoice join is weird. That one question would have killed the "it's a bug" argument that the old concept got wrong. <mark>It's facilitation when I can answer it myself in fifteen minutes. It's homework when only Dana can answer it and it doesn't go on Dana's list.</mark>

**Q:** Anything about how it's asked?

**Priya:** There are two next steps at once. The caption asks me about the truck, and the big button says "Ask Dana." Which one? I'd do the truck first, because I can do it tonight, and if it answers the question I don't spend Dana's hour on it. So give me one next step, and the one that doesn't cost Dana's time comes first.

**Q:** Still 5 also shows your shorthand matched to the three questions. Does the matching look right?

**Priya:** It split my one note across two questions, correctly, and put "…" in front of the second half. Show me the whole line once, with the part it used highlighted, because I'll want to check it didn't invent the split. Still, <mark>matching my shorthand to the questions is the best thing in either concept.</mark> That hasn't changed.

**Q:** "Dictate instead" for post-call notes. Last time you said you'd dictate right after a Dana call. Have you?

**Priya:** Once. After the 29th I recorded a voice memo on my phone walking to the kitchen, about three minutes, because of what I told you. I never played it back, and the transcript said "Tony fee." That evening I cleaned up the notes I'd typed during the call instead, because I type while Dana talks, and that's already the record. <mark>So I said I'd dictate, tried it once, and went back to typing.</mark>

**Q:** Would you click it?

**Priya:** Once, to see. Where does the audio go? If it's OpenRouter again, that's the same vendor review with a microphone on it. Keep the notes box. If Dictate costs you a week, I'd rather have the table.

## Part C: Exploration 02, "Honest limits" (concept, not built)

*(Shown stills in order: s1 a reply cut short, with the room meter at 22%; s1b after Continue; s2 nearly full at 88%; s3 "This conversation is full"; s3b a fresh conversation from a carried-over summary; s4 after a reload.)*

**Q:** s1 and s1b. The reply stops with "Cut short at the reply length limit" and a Continue button. Does that restore trust, or does any cut-off still taint the first two questions?

**Priya:** First thing: in s1 I didn't see the marker. I saw a reply ending in "When does a load get" and a progress bar. The marker was below the scroll, so on the screen that matters it looked exactly like what I complained about last time. Once I can see it, yes, a label right at the cut is the minimum. <mark>Saying "cut short" out loud is better than a reply that just stops.</mark> I don't distrust the first two because it was cut. I'd distrust them if Continue changed them.

**Q:** What does Continue have to do for you to trust the first two?

**Priya:** Pick up exactly where it stopped and not touch anything above. In Claude I've typed "continue" on a long code answer and it restarted the block with different lines, so now I diff them by eye. If question 1 changes when I press Continue, I trust neither version. And honestly, three questions shouldn't hit a limit. Make the answer fit, and keep the marker for when it doesn't.

**Q:** Anything in the continued text?

**Priya:** Question 3 got finished as "for example a fee when the first carrier already sent a truck?" That's the answer inside the question, and Dana will just say yes. Maybe the coach knows freight, but it's leading her. <mark>It's my answer, not hers.</mark> Ask it plainly: "Is the second one ever legitimate?"

**Q:** s2, the room meter at 88% with "Nearly full." Useful, or does it make you anxious?

**Priya:** Both. I've hit Claude's "conversation is too long" wall twice in my Booking notes chat with no warning at all, so a warning beats a wall. But a percentage on screen all the time, I'd watch like a phone battery. <mark>The scary bit is the jump: one paste of the enum took it from 46 to 88, and nothing told me it would.</mark> Tell me before I send: "This paste fills most of what's left." Then I can trim it.

**Q:** If you could have only one, the always-on bar or the warning before sending?

**Priya:** The warning. Although, to be honest, I'd check the bar before pasting Dana's sheet, so I just argued against something I'd use. Hide it until it's past half, and say it in pastes, not percent. "Room for about one more paste like the last one" I understand. 88% of what?

**Q:** The notice at the top of 02 is different from the one in 01b. Anything?

**Priya:** Two concepts, two notices. 01b says "Not an approved vendor for you? Paste a sanitized copy," which is the most honest line you've written. 02 says "Don't paste customer names or rates," which I asked for. You need both in one notice, and add contract terms. <mark>Look at the draft in s2: "the carrier contract says rejections within 2h are free." Your own demo breaks the rule your notice forgot.</mark> The company name and retention I'll save for next time.

**Q:** s3, "This conversation is full." Would you trust the editable carried-over summary, or copy everything out first?

**Priya:** Copy first, every time. In September my Booking notes chat in Claude hit the limit, and I asked it to summarize everything for a new chat. The summary merged REBOOKED and AMENDED into "rebook/amend" and dropped TONU. I found out on the 29th, when Dana said TONU and my summary didn't have it. <mark>Since then I paste the whole chat into my text file before I trust any summary.</mark> So "Copy everything first" should be the blue button, not the grey one.

**Q:** s3b. What would you check in the carried-over summary?

**Priya:** What's missing, and I can't edit what's missing. Then three things. The meanings, not the counts: "'Booking' has 3 meanings" is a pointer, not a summary. Which 7 statuses are matched? "7 of 23" is useless when I'm checking against Dana's sheet. And every open question still has its label, "unconfirmed" especially, because that's the word summaries drop first. Actually, the thing that should carry over is the board from the other concept: terms, questions, events. <mark>Carry the board, not a paragraph about it.</mark>

**Q:** s3 says "Nothing here is deleted until you choose." After the reload in s4, only the summary is there.

**Priya:** So when I pressed "Start fresh," that was me choosing? Then the old conversation is gone, and I didn't know that was the choice. Keep it readable somewhere, even read-only. The draft surviving is good, though. I've lost a typed message to an error before, and it's small things like that that make me trust the rest.

**Q:** The notice says the conversation is "kept in this browser." Does that change what you'd paste? Where do you keep sensitive work notes today?

**Priya:** Plain text files in a folder on my work laptop. It syncs to the company OneDrive, because IT forces Documents to sync. Anything half-shareable goes in Confluence drafts, and nothing about work lives on my own laptop except the made-up version from August. "Kept in this browser" doesn't change what I paste, because that's decided by where it's sent. It changes what I'd leave there overnight. <mark>And in March IT re-imaged my laptop and Chrome lost everything local. My text files survived because of OneDrive.</mark>

**Q:** So is browser storage good or bad for you?

**Priya:** It's the right default for a stranger's app. I'd rather it sit in my browser than on your server. But there's a catch nobody's mentioned. If my policy means I use this at home with sanitized text, the board lives on my home laptop and the RFC lives on my work laptop. <mark>So I'll copy it out anyway.</mark> That's why the table export matters more to me than the storage.

## Part D: close

**Q:** If you could have only one thing from either concept in the next month, what is it?

**Priya:** Four weeks to the RFC, and Dana's out after the 13th, so anything that ships after the 30th is for the next RFC, not this one. For this one, it's the words-that-don't-match table, copied into Confluence as a real table. That's the glossary section, and finance is going to read it. Keeping my stuff is still the gate for using the tool at all, and I haven't changed my mind on that. <mark>But if you ask what I'd use this month, it's the table.</mark>

**Q:** What would you cut from either concept?

**Priya:** From 01b, Dictate, and the pink sticky that repeats question one. From 02, the always-on percentage, and the answer tucked inside question 3. I'd also demote "Start fresh from a summary." Actually no, keep both buttons. Just swap which one is blue.

**Q:** Anything we should have asked but didn't?

**Priya:** Ask who answers when Dana's out. It's Maya, the ops lead, and Maya is "Ops" on your term map. Maya says a rebook is never a new booking, and Dana says it is when the lane changes. <mark>Team labels hid the one disagreement that's inside a team.</mark> After the 13th, "Ops" will mean Maya's version, and nobody reading the table will know. Ask me again after I've actually talked to her.

---

## Interviewer notes (out of character)

### Key insights

1. **01b fixed almost every interview-02 flag except the export format, which is the thing she'd use first.** Teams, "Guess:" prefix, click-to-source, Rebook on the board, three case-based questions, banner, shorthand matching and "unconfirmed" all landed. "Copy prep sheet (Markdown)" did not, and it's her one thing for the RFC due 30 Oct. [strong signal] [contradicts roadmap: #6 rich-text copy sits at P2 and after #4/#5]
2. **Name-to-team swapping saves the part of the scrub she skipped, not the part that takes time, and it doesn't touch the vendor block.** Her 15 minutes go on customer names, rates and lanes. Contract terms and load IDs are borderline and unhandled. She wants her own swap list and a preview of the exact outgoing text, and she asks whether the swap happens before the model reads anything. [strong signal] [supports #34 as the only lever for real material; refines #4]
3. **"Unconfirmed" earns its place, but the label must change on export, and a thumbs-up isn't confirmation.** Her own lane/date note was wrong for a week. Dana wants "ops, not mine" in documents: past behavior, the appendix request. Dana confirmed a three-bullet DM with a thumbs-up in under a minute, so confirmation needs yes/no lines Priya sends herself. [strong signal] [supports #19 B22; refines #4, #6]
4. **The coach's test is facilitation when Priya can answer it herself, and homework when only the expert can answer and it isn't queued for her.** Past behavior: she looked up 48213 in the Rails console in 15 minutes, and it settled the TONU question. She wants one next step, with the step that doesn't cost Dana's time first. [strong signal] [supports #19 B22]
5. **Summaries lose things. She copies everything out before trusting one.** Past behavior: a Claude summary merged REBOOKED/AMENDED and dropped TONU. Counts ("7 of 23", "3 meanings") aren't a summary. What should carry over is the structured board, and the old conversation must stay readable. [strong signal] [contradicts #7 B38 "summarise" as the default path]
6. **A cut marker helps only if it's visible at the cut and Continue appends without rewriting.** In s1 the marker was below the scroll. Past behavior: Claude's "continue" rewrote code she then diffed by eye. The continued Q3 leads the witness. [strong signal] [supports #44; refines B35 #8]
7. **Browser-only storage doesn't change what she pastes, and her policy splits the work across two machines.** Sanitized use at home puts the board on the home laptop while the RFC is on the work laptop. An IT re-image wiped local Chrome data in March. Export is her backup. [strong signal] [contradicts #5 as sufficient without #6]
8. **The room meter: yes to a warning before a big paste, no to an always-on percentage.** One enum paste jumped it from 46% to 88% with no warning. She contradicts herself: she'd check the bar before pasting Dana's sheet. [weak signal: she contradicts herself] [refines #7 B38]

### What changed since interview 02

- **Confirmed by past behavior:** concrete-case questions work (Dana answered two in about five minutes on 29 Sep); "unconfirmed" is necessary (her own note was wrong); a testable example beats a conclusion (the 48213 lookup settled TONU).
- **Strengthened:** export as a rich-text table. It's now her single "next month" item, since she typed the glossary rows by hand on Friday (about 40 minutes). Attribution by team: Dana herself asked to be credited as "ops, not mine."
- **Weakened:** voice for the debrief. She tried a work voice memo once after interview 02, never replayed it, and went back to typed notes. "Dictate" drops to cut.
- **Shifted:** persistence is still "the gate," but for this RFC she ranks the table above it. Browser storage alone doesn't help if policy pushes her to a home machine.
- **New:** summaries dropping terms (past behavior); team labels hiding disagreement inside a team (Dana vs Maya on lane-change rebooks); load IDs and contract terms as unhandled policy categories; confirmation quality (thumbs-up vs yes/no); the two concepts show two different notices; the meter's jump is the anxiety, not the meter itself.
- **Interview-02 asks vs 01b:** 13 of 15 Keep/Change/Cut items addressed. Missed: rich-text table export, and the lock-line facts (company, retention, training, link), which are held for 03b.

### Design feedback: Exploration 01b

**Keep**
- Name-to-team swap on by default. "If I had to remember to tick it, I wouldn't."
- Click a source label to see the line. The invoiceable card now says "From thread," and she can check finance's line.
- Three questions, each on a real load. "Dana answered the first two in about five minutes total, which never happens."
- Pasted shorthand matched to questions. "Matching my shorthand to the questions is the best thing in either concept."
- "My notes from Dana · 22 Sep · unconfirmed" in the tool. "'Unconfirmed' turned out to be exactly right."
- The coach tests with an example before changing anything. "That one question would have killed the 'it's a bug' argument."
- Welcome back as a banner (shown, not objected to). "Mostly, yes."

**Change**
- "Copy prep sheet (Markdown)" becomes a rich-text table. "The button still says 'Copy prep sheet (Markdown).'"
- Export label: the team, not Dana's name ("Ops, checked with Dana <date>" / "Ops, unconfirmed"). "Her name is still on it, right next to finance's definition."
- "Ask Dana" produces yes/no lines she pastes into Slack herself. "Three paraphrased bullets get a thumbs-up."
- One next step, and the one that doesn't cost Dana's time goes first. "The caption asks me about the truck, and the big button says 'Ask Dana.' Which one?"
- TONU becomes its own term, not a meaning of Rebook. "It's a fee, so it's its own word."
- Vary the cases: not three questions on one load. "Three questions on one load is really one case."
- Show the outgoing text, and let her add her own swaps. "If it's the model, the checkbox is theatre."
- Show her whole note with the matched part highlighted, not "…" fragments. "I'll want to check it didn't invent the split."

**Cut**
- "Dictate instead." "I said I'd dictate, tried it once, and went back to typing."
- The board's question sticky that repeats question 1. "I read it as a fourth question until I looked twice."

### Design feedback: Exploration 02

**Keep**
- A visible "Cut short" marker. "Saying 'cut short' out loud is better than a reply that just stops."
- "Copy everything first" when full. "Since then I paste the whole chat into my text file before I trust any summary."
- An editable carried-over summary, as a second option. "Keep both buttons. Just swap which one is blue."
- The draft surviving full and reload. "It's small things like that that make me trust the rest."
- "Don't paste customer names or rates." "Which I asked for."
- Kept in the browser, not on the server. "The right default for a stranger's app."

**Change**
- Put the marker at the cut and make it visible without scrolling. "In s1 I didn't see the marker."
- Continue appends and never rewrites what's above. "If question 1 changes when I press Continue, I trust neither version."
- Warn before a paste that fills the room, and measure in pastes. "Tell me before I send: 'This paste fills most of what's left.'"
- Make "Copy everything first" the primary button. "It should be the blue button, not the grey one."
- Carry the board (meanings, which statuses, labels), not counts. "Carry the board, not a paragraph about it."
- Keep the old conversation readable after "Start fresh." "I didn't know that was the choice."
- One notice across both concepts, with contract terms added. "Your own demo breaks the rule your notice forgot."

**Cut**
- The always-on percentage. "I'd watch it like a phone battery."
- The suggested answer inside question 3. "It's my answer, not hers."

### Roadmap assumptions this interview challenges

- **Rich-text export can follow paste and persistence** (#6 at P2; #4 and #5 at P1). For the RFC due 30 Oct, the table is the one thing she'd use. It's the only interview-02 export ask that 01b still misses.
- **Summarising is the way past the conversation cap** (#7 B38 "Trim or summarise long conversations"). Her past behavior says summaries drop terms and labels. Carry the structured board, make copy-out the default, and keep the old conversation readable.
- **Browser-only persistence answers "don't lose my stuff"** (#5). It covers reload, but not a policy that pushes her to a home machine while the RFC lives at work, or an IT re-image. #5 needs #6 as its backup.
- **Anonymising at paste time eases the policy problem** (#4 slice 3 paste → disagreements; the 01b checkbox). It removes colleague names only. Customers, rates, lanes, contract terms and load IDs remain, and the vendor block is untouched. Only #34 (provider path) moves her to real material.
- **The data-flow notice is settled** (#2, closed). The two concepts show two different notices, neither lists contract terms, and 02's own demo draft pastes one. Revisit the wording in 03b against the live app.
- **Attributing disagreement by team is safe** (B05 #10, as refined in interview 02). It's safe for exports, but it hides disagreement inside a team (Dana vs Maya, both ops), and once Dana is away "Ops" silently switches to Maya.
- **A cut marker is enough** (#44; B35 #8). It must sit at the cut, stay visible, and Continue must append. The better fix is a reply shape that fits.
- **Voice has a debrief job** (slice 12; #27). The one real try was never replayed. Treat Dictate as unproven, and it needs its own vendor answer.

### Small suggestions

1. **Copy the term table as rich text** (narrowest cut of #6).
   - *Smallest result:* a "Copy table" action puts "Words that don't match" on the clipboard as an HTML table (Term, Team, Meaning), with a Markdown fallback as `text/plain`. No title, no coach lines. TONU is its own row.
   - *Acceptance:* paste into Confluence Cloud. You get a real 3-column table with 3 Booking rows, 2 Rebook rows and 1 TONU row. Pasting into a plain-text editor gives a valid Markdown table. Nothing needs deleting.
2. **Show what leaves, and let her add swaps** (#4, slice 3).
   - *Smallest result:* the name-to-team swap runs in the browser before sending. A user-editable swap list (e.g. `Acme → Customer A`) is kept in this browser. "Show what's sent" reveals the outgoing text with the swaps highlighted.
   - *Acceptance:* with `Maya → Ops` and `Acme → Customer A`, the `/api/chat` request body contains neither "Maya" nor "Acme". The list survives a reload. The preview matches the request body byte for byte.
3. **When the conversation is full, copy first and carry the board** (#7 B38).
   - *Smallest result:* "Copy everything" is the primary action. "Start fresh" carries every term meaning, the open questions with their status labels verbatim, and matched statuses by name. The old conversation stays readable, read-only.
   - *Acceptance:* fill a conversation with the 01b thread plus the shorthand notes, then start fresh. The carried text contains "TONU", "unconfirmed", all 3 questions and all 5 meanings. It uses no bare counts. The old log opens after a reload.
4. **Put the cut marker at the cut, and make Continue append only** (#44).
   - *Smallest result:* on a capped reply, the log scrolls so that "Cut short · Continue" sits right after the last word. Continue appends to the same entry.
   - *Acceptance:* force a cap mid-question at 400px and 1280px. The marker is visible without scrolling. After Continue, the text before the cut is byte-identical. The continuation carries no suggested answer.

### Questions for interview 04

- After the 13 Oct session (Dana's last before leave), what did you do with her answers in the first 24 hours?
- When Maya covered for Dana, where did her answers differ from Dana's, and how did you record it?
- The last time a summary (from a person or an AI) dropped something important, how did you find out?
- What did the RFC glossary look like on the 30th? What did you paste, and what did you retype?
- What did finance challenge in the rebook definition during review?
- (A real Dana) Here's "Ops, checked with Dana 29 Sep" in a doc. Comfortable? What label would you want?
- (A real security reviewer) Is a load ID customer data under a policy like hers? Are contract terms?
