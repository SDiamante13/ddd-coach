# Synthetic interview 04a: Priya Raman, after slice 50 (paste box) + Exploration 04

*Synthetic interview. Treat every point as a hypothesis until a real practitioner confirms it.*

Tuesday 13 October 2026, four days after interview 04b. The paste-box slice (#50, #51, #54, #57, plus #61 and #62) went live the week before, and she was sent the link on Friday. On Sunday 11 October, at home, she re-ran the thread from her failed Sunday in 03b on the hosted site. This interview walks through that re-run, then shows Exploration 04, "Paste box" (`p1-first-visit` → `p5-phone-too-long`), as a concept, not built. The interviewer typed nothing into the live app. A headless screenshot of the live first screen was used to check the notice.

Live facts behind the probes. A purpose line: "Paste a messy thread or meeting notes about your domain, line breaks and all, and talk it through with a DDD coach." A two-line placeholder: "e.g. Ops: a booking exists the moment the customer submits / Finance: not for us, it's a booking once it's invoiceable". A multiline box that keeps line breaks. The per-message cap is **still 8,000** on this deploy, and the conversation cap is 24,000; #4 raises both, but that isn't deployed. Over the limit: a count, "N characters over the 8,000 limit. Your text stays here. Trim it to send.", and Send disabled. A refused turn puts the message back in the box, with [Copy the conversation] [Start a new one] and no Retry. The clear dialog reads "Clear this conversation? The log and history go; your draft stays." with [Copy first] [Clear] [Keep]. Long messages collapse with Show more. The notice's wording and its muted small type are unchanged since 03b (#55 not shipped). The coaching prompt (#4) isn't deployed, so replies are still generic and come back as raw markdown.

## Part A: since last time

**Q:** Last time Maya was about to join the reviewer list and Dana was leaving on the 15th. What's happened since Friday?

**Priya:** Maya started on Monday, and her first comment was on my two ops rows. She's fine with "Ops, current practice: same booking, REBOOKED", but she wants "since the 2024 portal release" on it. And she wants the Dana's-sheet row gone: "nobody has used that sheet since the portal." Dana leaves Thursday. The glossary has eight rows now. I renamed Status to Source myself on Saturday, and I added the Code row with a link to `rebook!`. Finance review is still the 27th.

**Q:** Where did Maya's answer differ from Dana's, and how did you record it? *(03a question)*

**Priya:** They don't disagree about what happens. They disagree about whether it's right. Dana says a lane change is a new booking because that's what the carrier contract means. Maya says it's REBOOKED because that's what the screen lets her team do. I kept both rows, and I added an open question: "ops lead and finance controller, at the 27 Oct review." <mark>I'm not deleting Dana's row two days before she leaves because the person replacing her finds it untidy.</mark> I told Maya that in a reply, more politely.

**Q:** What have you done about the questions only Dana can answer?

**Priya:** Three yes/no lines, drafted yesterday, going to her tomorrow morning. Same format as last time, because it worked. Anything after Thursday goes into the open questions list with a role, not a name.

## Part B: the Sunday replay

**Q:** In 03b you said that once the box kept line breaks, you'd re-run the same sanitized thread and check two things. Did you? Walk me through it. *(03b question)*

**Priya:** Sunday night, laptop, same text file as last time: 12,040 characters, sanitized. I opened the page, read the line under the title, and noticed the grey example in the box was shaped like my thread, "Ops:" on one line and "Finance:" on the next. I selected everything in the file, copied, pasted. The box grew to about a third of the screen and scrolled, and every line was still a line. <mark>That's the first time your app has shown my thread as a thread.</mark>

**Q:** And then?

**Priya:** Before I touched Send, a red box under the text: "4,040 characters over the 8,000 limit. Your text stays here. Trim it to send." Send was greyed out, and there was a counter saying "12,040 / 8,000". Nothing was sent. Last time I found out after pressing Send, in a tenth of a second, and my box was empty. This time I found out before, and I had the number I asked you for. So I knew it was a third, not a sliver.

**Q:** Did "Your text stays here" change what you did compared with last time?

**Priya:** "Stays here" less than you'd think, because I keep the file anyway. The number is what changed things. Last time I cut blind and cut the wrong part, the bit where ops explains REBOOKED against AMENDED. <mark>This time I knew I had eight thousand, so I cut on purpose.</mark>

**Q:** So you trimmed. How, and how long did it take?

**Priya:** I started in your box and gave up after about two minutes. Drag-selecting forty messages in a box that scrolls inside a page that scrolls is miserable. So I went back to the text file. I deleted the "+1"s, the "following", the original question, and then the carrier team's side-thread about the EDI tender. I pasted it back, the counter said 8,310, I cut two more messages and it went green. About twelve minutes, so roughly what it took last time. The difference is I knew when to stop.

**Q:** What did the cut cost you this time?

**Priya:** The carriers. Last time I lost the ops explanation. This time I kept it and dropped the carrier team, and they're the third meaning of "booking": they call the tender a booking. <mark>The limit still makes me pick which team to leave out of a tool whose job is to find where teams disagree.</mark> I didn't think about that until the reply came back with two meanings instead of three.

**Q:** After you sent it, did your card look right? Were the speaker lines intact?

**Priya:** Yes. Four lines, then "…" and Show more. I pressed it once to check the end was there and it was: every name on its own line, "Tom" with his message under it. Collapsing it is right. I know what I pasted, and I don't want to scroll past eight thousand characters every time.

**Q:** Now the reply. Were the speakers right this time? Did it find REBOOKED versus AMENDED without you pointing?

**Priya:** Speakers right: yes. It said finance treats a booking as existing once it's invoiceable, and that's Tom, and Tom is finance. <mark>The one thing it got wrong last time, it got right, because you stopped gluing the lines together.</mark> REBOOKED versus AMENDED: it listed both, under "Key statuses", with asterisks round the words. But it just repeated the ops explanation back to me. It never noticed that finance cancels and recreates on a rebook while ops keeps the same booking, and that's the whole fight. Then "Recommendations", with "align on a shared booking lifecycle" again. And its one question was "Would you like me to draft a glossary of these terms?"

**Q:** How did you read that question?

**Priya:** That's a waiter, not a facilitator. It's offering me more output, and it isn't asking me anything about my domain. Oh, and paragraph three said to "consider modelling Ops Booking and Finance Booking as separate bounded contexts." <mark>Not an aggregate, so technically I'm still here.</mark> Same kind of advice, different noun.

**Q:** Last time you went straight to company Claude. Did you this time? What decides it?

**Priya:** No, but not because yours was better. I already had Claude's summary from the week before, and yours said the same thing with the speakers right. That's the problem: it matched. Company Claude takes the whole twelve thousand, the raw eighteen if I want, since it's approved. It keeps my history and doesn't show me asterisks. <mark>When the answers tie, I use the tool I already have.</mark> What decides it is one question I wouldn't have thought of, from the whole thread, carriers included. Until then there's no reason to open your tab first.

**Q:** Total time, compared with the forty minutes last time?

**Priya:** About thirty, with the follow-ups, and I lost nothing, and nothing came out wrong. So it stopped costing me. It hasn't started paying me yet.

## Part C: the first visit

**Q:** When the page opened, did the purpose line and the example tell you what to do?

**Priya:** Yes, in about five seconds. "Line breaks and all" is my Sunday in four words, so somebody listened. The placeholder does more than the sentence, though, because it shows the shape: a team, a colon, what they said. The weak part is "talk it through with a DDD coach". "Talk it through" says chat, so Ravi types a question. And "DDD" still loses Aisha before she's read the rest.

**Q:** Here's the concept's line: "The coach finds the words people use differently, puts the events in order, and asks what to check next." Better?

**Priya:** That's the line I'd want, and it's a promise your coach doesn't keep today. If that sentence had been on the page on Sunday, I'd have been angrier at the reply, because it did none of those three things. <mark>Ship that line the day the coach does it. Until then, yours is vaguer but true.</mark>

**Q:** The concept also has a "Try an example thread" button. Would you click it?

**Priya:** Me, no, I came with my own thread. Ravi, yes. It's the only thing he'd click. But think about what he gets: today the example gets the same generic summary mine did, so it's a demo of the thing that makes him go back to Claude. <mark>An example that shows a generic reply is an advert for the generic.</mark> Put it in when the reply to the example looks like your mockup.

**Q:** In 03b you called an empty box a thirty-second tool. Still?

**Priya:** Not for me. I knew what to do before I'd finished reading. For a cold colleague, I honestly don't know, and I haven't tested it: I haven't forwarded the link to anyone. I don't forward a tool before it's given me one win, and it hasn't yet.

## Part D: the notice

*(Shown the live first screen: the purpose line in body-size ink, then the notice unchanged, "Your messages are sent to OpenRouter, an AI model provider, to generate replies. Nothing is stored on our server. Don't paste customer names or rates.", in small muted type in a grey box. Then `p1-first-visit.png`: "Where your text goes" with a lock, full ink, three bullets naming OpenRouter, [MODEL COMPANY] and [OPERATOR], and a line of retention and training links. Then `p2b` and `p3`, where it collapses to "Where your text goes · show".)*

**Q:** Does the live notice read as content now, or as a banner?

**Priya:** Nothing changed. Same words, same grey type in a grey box. And now there's a big dark sentence right above it telling me what to do, which makes the notice look even more like the small print. <mark>Instructions in big type, terms in small type. That's every checkout page I've ever used.</mark> I read it on Sunday only because I knew it hadn't changed and wanted to check.

**Q:** Let's go through your checklist against the live notice: the processing company, retention, training with a link, a page to forward, and the operator named.

**Priya:** Still one and a half. OpenRouter is named, but "an AI model provider" is still wrong. And you told me the model's changed since 03b, from terra to luna. <mark>The notice didn't notice.</mark> Retention: only "our server". Training and a link: nothing. A page to forward: nothing. Operator: nothing. The concept's first screen would get me to about three and a half if you filled in the brackets. It names the model company and the operator, and it has links. But your next three stills fold it to "show" again, which I told you on Friday is a cookie banner I have to open.

**Q:** In 03b you asked for "Built for sanitized text." If the notice said that, would you sanitize differently? Show me the last thing you sanitized. *(03b question)*

**Priya:** The last thing was Sunday's thread, and I reused last week's file. "Built for sanitized text" wouldn't change anything, because I already do it. What did change it was your concept's line, "customer names, rates, lanes or contract terms". I went looking and found two lane pairs still in my file, Chicago to Dallas with a date next to "Customer A". <mark>That's a customer if you know our book, so I took them out before pasting.</mark> Name the things, not the category.

## Part E: trim, or send in two parts

*(Shown `p3-too-long.png`: "1,412 characters over the 8,000 limit. Your text stays here. Trim it, or send it in two parts." with a "Send in two parts" button, and `p4-two-parts.png`: "Part 2 of 2" in the log after a coach reply reading "Got part 1. Waiting for part 2 before I answer.")*

**Q:** On Sunday you trimmed. With this button, would you have sent it in two parts?

**Priya:** Probably not. In August I tried exactly that with company Claude: "I'll paste this in two parts, don't answer until I say done." It answered part one at length anyway, and then treated part two like a follow-up question. So "Got part 1. Waiting for part 2" is the model promising to wait, and I've seen that movie. <mark>If your app holds part one and sends both together, I'd trust it. If the model says it's waiting, I don't.</mark>

**Q:** Does splitting use up the conversation?

**Priya:** It must. Twelve thousand goes in at once, plus the coach's "waiting" reply, and every follow-up sends all of it again. On Sunday, at eight thousand, I hit the conversation wall on my sixth message. With twelve I'd hit it after two or three. <mark>Two parts doesn't fix the limit. It moves it from the box to the conversation.</mark>

**Q:** Your team is raising the per-message limit toward 24,000 in the next slice. Does the button matter then?

**Priya:** Then no. My thread fits and I don't need a button. Don't build a feature for a limit you're about to raise. And raising it fixes the thing I actually lost on Sunday, which was the carriers, not the time.

## Part F: refusals, Copy the conversation, and Clear

**Q:** Did you hit a refusal on Sunday?

**Priya:** Yes, on the sixth message. After the thread I asked three follow-ups, then pasted `rebook!` and the enum to ask which meaning the code matches. The next one came back amber: "This conversation is too long for the coach. Copy the conversation, then start a new one." My question was back in the box. The two buttons were underneath the message bar, and I didn't see them at first. I had to scroll down to find them.

**Q:** What did you press, and what did "Copy the conversation" give you?

**Priya:** Copy the conversation, first, because it told me to and because since March I copy before anything that clears. It gave me plain text, "You:" and "Coach:" all the way down, asterisks included. I pasted it into my text file under "11 Oct coach run". Not Confluence. Nobody reads a transcript, and I'd never paste one into an RFC. <mark>"Copy the conversation" is an undo button, not an export.</mark> And that's fine, it's what I needed at that moment.

**Q:** Then Start a new one: "Clear this conversation? The log and history go; your draft stays." Copy first, Clear, Keep.

**Priya:** That dialog is right. It says what goes, and Copy first is where it should be, even though I'd already copied. I pressed Clear. Then I was sitting in an empty page with my question in the box, "so which of these does the code agree with?", about a thread the coach no longer had. <mark>You kept my draft. My draft was the least valuable thing on the page.</mark> So I pasted the thread again, with the question under it, and that used up a fresh conversation in one go. Keep the paste, squash the chat. I said that in 03b.

**Q:** Does this stop you throwing away work? *(Also told: the slice 37 message she flagged on Friday now reads "That message couldn't be checked, so it was skipped. Send it again. If it keeps happening, copy the conversation and start a new one.")*

**Priya:** Yes. That's the first time a limit in your app didn't cost me anything. Nothing wiped, and the dialog told me the truth. And the new wording on the other one has no reload in it. That was the thing I'd have obeyed and regretted, so good. The cost moved: it isn't lost work any more, it's setting the thread up again.

## Part G: raw markdown

**Q:** The replies show `**booking**` with the asterisks, and dashes for bullets. Does that matter?

**Priya:** For reading, barely. I write Slack with asterisks, so my eyes skip them. It matters twice, though. First, it's the one thing on the screen that says nobody read a reply before shipping it. Second, it comes along when I copy. In my text file I don't care, but if a line of it ever went to Maya with asterisks round "booking", she'd think I'd been sloppy, and she'd be right.

**Q:** Would you rather it rendered the bold and the lists, or wrote plain text?

**Priya:** Plain text, short. <mark>A coach that writes headings is writing a report. I want three lines and a question.</mark> Whether you render the asterisks or stop it writing them, I don't care, as long as I never see them.

## Part H: close

**Q:** If you could have only one thing in the next month, what is it now?

**Priya:** On Friday I said the table. But I built the table by hand on Saturday: eight rows, Source, a Code row. It's done, and fourteen days out it isn't getting rebuilt. <mark>So now it's the whole thread in, carriers included, and one question back that I'd take to Maya or finance before the 27th.</mark> The box is fixed. Now the coach has to be worth the paste. I know that's a different answer from Friday.

**Q:** Would you use it this week? For what?

**Priya:** Once, on Thursday evening, for something small. Maya's comment thread on the two ops rows plus the rows themselves, about two thousand characters, and I'll ask what finance will push back on. It fits the box and has no customer data. If the coaching prompt ships before then, I'll re-run the big thread a third time. <mark>If it still asks me whether I'd like a glossary, that's the last run before the review.</mark>

**Q:** Anything we should have asked and didn't?

**Priya:** Ask me what I cut, every time. On both Sundays, what I cut decided the answer more than your coach did.

---

## Interviewer notes (out of character)

### Key insights

1. **The paste box stopped the loss, but the 8k cap now decides which team the coach hears.** Past behavior on the live app (Sun 11 Oct): the 12,040-char thread kept its line breaks, the over-limit box showed "4,040 over" before sending, Send was disabled, and nothing was wiped. Trimming still took about 12 minutes, and this time she dropped the carrier team's messages, the third meaning of "booking". "The limit still makes me pick which team to leave out of a tool whose job is to find where teams disagree." [strong signal: past behavior] [supports #50, #51; makes #4's cap raise (24k per message) the fix, not "Send in two parts"]
2. **The number mattered more than "Your text stays here".** She keeps the thread in a file, so the kept draft was reassurance. The count ("12,040 / 8,000") changed the cut from blind to deliberate, and she kept the REBOOKED/AMENDED explanation she lost in 03b. [strong signal] [supports #51's count; neutral on the draft-kept wording]
3. **Speakers are right now, and the reply is still a summary, so it ties with company Claude.** Tom's line went to finance. It listed REBOOKED/AMENDED without flagging the finance-vs-ops conflict, then gave "Recommendations", a "bounded contexts" suggestion, and one waiter question ("Would you like me to draft a glossary?"). She didn't switch this time only because she already had Claude's answer, and it matched. "When the answers tie, I use the tool I already have." [strong signal: past behavior] [supports #4 as the gate; 03b's two-check test: 1 of 2 passed]
4. **The purpose line works because it's modest; the concept's line promises what the coach doesn't do yet.** The placeholder's "Ops: / Finance:" shape did more than the sentence. "Talk it through" reads as chat. "Try an example" would only advertise the generic reply today. [strong for her; weak for colleagues (untested, she hasn't forwarded it)] [supports #57 as shipped; gate #63 on #4]
5. **After a refusal and Clear, she kept the draft and lost the thread.** The cleared page held her follow-up question and not the paste it referred to, so she re-pasted 7.9k, which filled a fresh conversation at once. "You kept my draft. My draft was the least valuable thing on the page." [strong signal: past behavior] [refines #62/#7 (B38): carry the first paste, not only the draft]
6. **"Copy the conversation" is an undo, not an export, and the buttons sat under the composer.** She pasted plain "You:/Coach:" text (asterisks included) into her text file, never Confluence. She had to scroll to find the buttons, as the slice 50 demo found. [strong signal] [supports #61/#62; supports #66 auto-scroll; #6 is still the export]
7. **The notice didn't move: still 1.5/5, and the purpose line demoted it further.** "Instructions in big type, terms in small type." The model changed (terra → luna) and the notice didn't. The concept's p1 would reach about 3.5 once the brackets are filled, but p2–p4 fold it to "show" again. The concept's specific list ("rates, lanes or contract terms") made her remove two lane pairs she'd missed. [strong signal: past behavior on the lanes] [contradicts #55 still open while #57 shipped; supports naming items over "Built for sanitized text"]
8. **Two parts: she trusts the app to wait, not the model.** August anchor: company Claude answered part one anyway. Splitting moves the limit into the 24k conversation cap. If #4 raises the per-message cap, cut the button. [weak-to-strong: the anchor is real, the counterfactual is hypothetical] [cut the p4 "Send in two parts" if #4 ships 24k]

### What changed since 03b and 04b

- **Fixed by the build:** line breaks kept, speakers right, no instant 413, draft kept, the limit stated before sending, and a purpose line plus placeholder. The 04b reload copy is gone (`COACH_UNVERIFIED` now says "copy the conversation and start a new one"). The session went from about 40 minutes with a wrong speaker to about 30 minutes with nothing lost.
- **Unchanged:** the notice (wording and weight), generic replies, and the 8,000 cap. She still sanitizes, and #34 stays sanitized-only.
- **New:** the carriers dropped by the cut (the cap now shapes the model of the domain). Her waiter-question label. The re-paste after Clear. Maya's Monday pushback (wants Dana's row removed; Priya kept it). Two lane pairs she'd missed while sanitizing. Raw markdown as a copy-out problem.
- **Self-contradiction:** her one thing moved from "the table" (04b) to "the whole thread in, one question out", because she built the table by hand on Saturday. The window for the table as a tool output is closing on her calendar.
- **Company Claude:** she didn't switch this time, but only because she already had its answer. The switch condition is now explicit: a tie goes to the tool she already has.

### Sunday replay scorecard (03b failure steps → now)

| Step in 03b | Now | Quote |
|---|---|---|
| One-line box flattened the 12k thread | **Fixed** (#50) | "That's the first time your app has shown my thread as a thread." |
| Instant 413 after Send, draft wiped | **Fixed** (#51) | "This time I found out before, and I had the number I asked you for." |
| No limit stated, so she guessed a cut | **Fixed** (#51) | "This time I knew I had eight thousand, so I cut on purpose." |
| Cutting 4k took about 10 minutes | **Partly** (8k cap, #4 not deployed) | "About twelve minutes, so roughly what it took last time. The difference is I knew when to stop." |
| The cut removed what mattered | **Partly** (the ops explanation is kept, the carriers are dropped) | "The limit still makes me pick which team to leave out." |
| Speaker lines lost in her card | **Fixed** (#50, collapse with Show more) | "Every name on its own line, 'Tom' with his message under it." |
| Tom's finance line given to ops | **Fixed** | "The one thing it got wrong last time, it got right." |
| Generic reply, no question, missed REBOOKED/AMENDED | **Still broken** (#4 not deployed) | "That's a waiter, not a facilitator." |
| Nothing to make her stay, so she went to company Claude | **Still broken** (a tie, not a loss) | "When the answers tie, I use the tool I already have." |
| About 40 minutes lost | **Partly** (about 30, nothing lost, no win) | "It stopped costing me. It hasn't started paying me yet." |

5 fixed, 3 partly, 2 still broken. Every remaining failure waits on #4 (the cap raise and the coaching prompt).

### Notice checklist status (live, 13 Oct)

| Item | 03b | Now | Note |
|---|---|---|---|
| Company that processes the text | half | **half** | OpenRouter named; "an AI model provider" still wrong; the model changed (terra → luna) and the notice didn't |
| Retention at OpenRouter and the provider | missing | **missing** | "Nothing is stored on our server" only |
| Training use, with a link | missing | **missing** | no link anywhere |
| A page to forward to security | missing | **missing** | — |
| Operator named | missing | **missing** | — |
| (Not on the list) "don't paste" line | yes | **yes** | the concept's longer list ("lanes, contract terms") changed her behavior |

**1.5 / 5, unchanged.** The weight also got relatively worse: the #57 purpose line sits above it at body size in ink, and the notice stays small and muted. The Exploration 04 p1 notice would reach about 3.5/5 with the brackets filled (company, operator, links; still no forwardable page).

### Built vs concept (Exploration 04)

**Keep (built matches the concept, or does better)**
- Multiline box, line breaks kept, grows then scrolls. "Every line was still a line."
- The count plus "N over the 8,000 limit. Your text stays here." before sending, with Send disabled. "I had the number I asked you for."
- Long messages collapse with Show more. "Collapsing it is right."
- The placeholder example in "Team: what they said" form. "The placeholder does more than the sentence."
- The built purpose line (modest, true) over the concept's (promises too much for today). "Yours is vaguer but true."
- Refusal with Copy first, and the clear dialog saying what goes. "That dialog is right."

**Change**
- Notice: take p1's content (model company, operator, links, "rates, lanes or contract terms") at p1's weight, and never fold it to "show" (p2–p4 still do, which contradicts the handoff's own compact-line rule). "Instructions in big type, terms in small type."
- Swap in the concept's purpose line when #4 ships, not before. "Ship that line the day the coach does it."
- After Clear, offer the first paste back, not only the draft. "My draft was the least valuable thing on the page."
- Scroll a new refusal's buttons into view (#66). "I had to scroll down to find them."
- Name the items in the don't-paste line (the concept's list). "Name the things, not the category."

**Cut (or defer)**
- "Send in two parts" (p3/p4), if #4 raises the per-message cap. "Don't build a feature for a limit you're about to raise."
- The model-side "Got part 1. Waiting for part 2" reply. "I've seen that movie."
- "Try an example thread" (#63) until the example's reply shows coaching. "An example that shows a generic reply is an advert for the generic."

### Roadmap assumptions this interview challenges

B-IDs from GitHub issue titles: #7 = B38, #35 = B40, #36 = B41, #10 = B05.

- **#51 / B40 (#35): keeping the draft and stating the limit fixes the too-long paste.** It fixes the loss. It doesn't fix the cut: 8k made her drop the carrier team. The per-message raise in #4 (220fd06, not deployed) is the real fix. Deploy it ahead of the rest of slice 3 if it can go alone.
- **#4: speakers intact would make replies useful.** Attribution is fixed; usefulness isn't. Without the coaching prompt the reply ties with company Claude, and a tie loses. 03b's second check (find REBOOKED vs AMENDED unprompted) still fails. #4 is now the only gate between her and a second use.
- **#57: a purpose line should say what the coach does.** The concept's line would over-promise until #4 ships. The shipped modest line passed her 5-second test. Update the copy with #4.
- **#63: "Try an example thread" helps first-timers.** Only if the example's reply shows coaching. Gate on #4.
- **#55: the notice's weight can wait until after #57.** #57 shipped a body-size line above a small muted notice, so the notice is now visually the small print. Still 1.5/5. The model swap (terra → luna) proves again that the company must come from config.
- **#61/#62: keeping the draft keeps her work.** After Clear the draft is a follow-up question; the valuable part is the first paste. Offer "start again with your first paste" (a narrow cut of #7 / B38 and #5).
- **#6: "Copy the conversation" is a step toward export.** She treats it as undo only; a transcript never goes into the RFC. #6 is still the export, and the markdown asterisks in the copy are a reason to strip them (#64).
- **#7 (B38): trim or summarise instead of a dead end.** Her refusal came on message 6 with an 8k paste. Two parts or a raised per-message cap brings it sooner. The 64k conversation cap in #4 (7598919) matters as much as the per-message one.
- **#34: sanitized-only.** Unchanged, and reinforced: a concrete list caught lanes she'd missed. Name items in the notice.
- **#58: citations raise trust.** Not tested here. But the reply's "consider separate bounded contexts" as unprompted advice is exactly the generic rule #58 and #4 must stop.
- **#5: persistence.** Not asked for this time. The copy-first habit plus #62 covered her. She still re-pastes after every clear.

### Small suggestions

1. **Ship the per-message cap raise on its own.** (#4, narrowest cut; commits 220fd06 and 7598919)
   - *Smallest result:* the deploy accepts 24,000 per message and 64,000 per conversation, and the count and alert read the new limit.
   - *Acceptance:* paste a 12,040-character, 3-team, 200-line thread. There's no over-limit alert, the request `message` has 199 `\n`, and it returns 200. Four follow-ups of 300 chars each return 200 with no refusal.
2. **Start again with your first paste.** (#62 follow-up, a thin cut of #7 / B38)
   - *Smallest result:* the clear dialog, when reached from a refusal, adds "Start again with your first message", which clears the log and puts the first prompt, then a blank line, then the current draft in the box.
   - *Acceptance:* after a refusal on turn 6, choose it. The log has 0 entries, the box starts with the first prompt byte for byte and ends with the refused question, and the count shows the combined length.
3. **Bring a new entry's buttons into view.** (#66, the refusal only)
   - *Smallest result:* when a turn is refused, the page scrolls so its [Copy the conversation] [Start a new one] sit above the composer.
   - *Acceptance:* at 1280×800 with the box at max height, after a refusal the buttons' bottom edge is ≤ the composer's top, and `elementFromPoint` at Copy's centre is Copy, with no manual scroll.
4. **Notice at body weight, with the named list.** (#55, the narrowest cut)
   - *Smallest result:* notice text in ink at body size (not muted 14 px), the company taken from the configured model prefix, and "Don't paste customer names, rates, lanes or contract terms."
   - *Acceptance:* the computed colour equals `--color-ink` and the font size equals the purpose line's. With `openai/gpt-5.6-luna` configured it names OpenAI, and after a config swap it names the new company. "an AI model provider" appears 0 times.

### Questions for interview 05

- After the coaching prompt ships: re-run the whole thread, carriers included. Does its question match one you'd take to Maya or finance? Did it find the rebook conflict unprompted?
- On Thursday's small run (Maya's comments plus the two rows): what did it ask, and did you use it?
- After the 27 Oct review: did finance argue about facts or the word? Did anyone ask where the Code row came from?
- What did you cut the next time you pasted? What did the cut change in the answer?
- Did you forward the link to anyone? What did they paste or type first? (Real Ravi or Aisha, cold.)
- The next time a refusal came up, where did the copied conversation end up?
- (A real practitioner) What does a 2-part paste look like in your own tools today, and did the model wait?
