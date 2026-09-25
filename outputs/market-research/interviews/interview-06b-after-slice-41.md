# Synthetic interview 06b: Priya Raman, after slice 41 (the conference gate)

*Synthetic interview. Treat every point as a hypothesis until a real practitioner confirms it.*

Thursday 22 October 2026, evening. Priya went to a local DDD meetup with two talks. In the first, the founder demoed DDD Coach and put the URL and the password on a slide. She had her personal laptop (her company laptop can't run unapproved tools), the meetup Wi-Fi, and about five minutes before the second talk. Her sanitized thread was not on the laptop. The interview was a 20-minute call on her walk home, at 21:40. It is short, per the rule in `outputs/market-research/README.md`: it tests only the deployed slice (#41). The #73 retest waits for interview 07, and the #70 questions are kept for a real practitioner.

Live facts behind the probes (from `outputs/demos/slice-41.md`, `slice-41.png`, `slice-41-app.png` and the repo). A first visit shows the purpose line, the unchanged data-flow notice and one "Conference password" field with Enter, and no message box. A wrong password shows "That password isn't right. Check the slide and try again." and keeps the field. The right one sets an HttpOnly cookie for 90 days. Nothing on screen says the browser is remembered. If the cookie expires mid-conversation, the form appears inline and the draft is kept. After unlock the app is the slice 3 coach on `gpt-5.6-terra`, with the two-line placeholder "e.g. Ops: … / Finance: …". There is no "Try an example" (#63 is open), and a reload still clears the conversation (#5 is open). When the model provider fails, including a spent credit limit, the UI shows "The coach is unavailable. Try again." (`COACH_UNAVAILABLE`). #72 asks the owner to set a hard credit limit and to rotate `ACCESS_PASSWORD` after the conference. #41 says rotation invalidates every 90-day cookie. The password itself is not named anywhere in this file.

## Part A: talks and tools

**Q:** The last time you tried a tool live during a talk. What happened, and did you ever go back to it?

**Priya:** Context Mapper, a meetup in spring last year. I installed the VS Code extension during the Q&A, typed the speaker's example from the slide, and had a context map in about ten minutes. I went back once, that Saturday, with our booking model, and quit after an hour over the ceremony. So it worked on their example in the room and died on mine at home. <mark>What I try in a talk gets tried on the speaker's example. The real test is the return visit, and that only happens if I have my own mess that week.</mark>

**Q:** Walk me through tonight's five minutes.

**Priya:** When the URL and password slide came up, I photographed it, like every slide with a link on it. At the break I typed the URL from the photo and got the password screen. My first try was wrong, because in the photo I couldn't tell if one letter was a capital. It said "Check the slide and try again", and by then the slide showed the next speaker's title. I checked my photo instead, typed it the other way, and got in: about a minute and a half gone before I saw a message box.

## Part B: the gate

**Q:** Did the password feel like an account?

**Priya:** No. An account wants my email and a promise that I'll remember something. This is the Wi-Fi password: someone puts it on a slide, everyone types it, and nobody owns it. <mark>A password on a slide is a room key, not an account.</mark> The friction was reading it off a photo, not the gate. And the error told me to check a slide that wasn't there any more.

## Part C: nothing to paste

**Q:** Once you were in, what did you paste?

**Priya:** Nothing, because I had nothing. The pre-read went out this morning, and at lunch I deleted every sanitized copy from the personal laptop. Two weeks of company Slack on a personal machine, names stripped or not, is something I'd have to explain if anyone asked. So I typed three lines from memory, made up to sound like us without being us: "Ops: a rebook is the same booking. Finance: a rebook means a second invoice. Carrier: it's a new tender." It took about eight seconds and gave me my three lines back as events and words. Its question was about one rebooked load and whether finance raised a second invoice, and that's the pre-read question I sent this morning. <mark>It's only as surprising as what you give it, and three lines from memory can't surprise me.</mark>

*(About 150 characters typed. The reply is synthetic, shaped like the slice 3 output: three events, one word ("rebook") with three holders, and one question. Short input gives the coach no second part of a thread to join.)*

**Q:** Would a "Try an example" button have changed those five minutes?

**Priya:** Tonight, yes. I'd have clicked it first. In 04a I said no because I'd come with my own thread, but tonight nobody in that room had theirs, and nobody would paste it on meetup Wi-Fi next to strangers. A three-line example would do what mine did, though: show that it can sort what I said. It has to be long and messy, fifty messages with the "+1"s and a side-thread, with one link hidden between something early and something late, and it has to show me the two lines the question came from, because I won't read fifty messages at a break. <mark>The example has to prove the question, or it's an advert for the three things Claude also does.</mark>

**Q:** Suppose the example's reply were prepared in advance, so it's instant and always the good question.

**Priya:** Fine, if the screen says so. If it's canned and doesn't say, the first person who runs their own thread gets my run 2 from Sunday, the advice dressed as a question, and decides the demo was better than the product. <mark>A demo that's better than the product is the thing I'd tell people about, and not kindly.</mark> Run it live and I'll wait eight seconds.

## Part D: the notice, in a room

**Q:** The notice was on the password screen. Was it enough for you to paste anything there?

**Priya:** I read it, because it was the only thing on the screen apart from the field. It's the same notice, still one and a half out of five. But tonight that didn't matter. The Wi-Fi isn't the problem, because the site is HTTPS. The problem is the man next to me with his elbow on my armrest: whatever I paste at a meetup, the row behind me reads too. <mark>At a meetup the notice isn't what stops me. The room is.</mark>

## Part E: coming back

**Q:** The site remembers this browser for 90 days. Will you come back to it from home, with a real thread?

**Priya:** I didn't know it remembered. Nothing said so, and I assumed I'd need the password again, from a photo buried in two hundred slide photos. I'll be back if Tuesday's finance review leaves a fight, and it will. I'll find the URL through the note I send myself after every talk, "DDD coach, meetup 22 Oct", not through an email from you: <mark>ask for my email and you've built the account with extra steps.</mark> But if the gate asks me for the password on Sunday, I won't dig through photos. I'll give up.

**Q:** The plan is to change the password after the conference. That signs out every browser.

**Priya:** Then the 90 days is a promise you break on Monday. <mark>Change it if someone abuses it, and cap the money, but don't lock out the people who were in the room.</mark> The people who come back a week later are the only ones who matter to you, and they're the ones who'd lose it.

## Part F: telling someone

**Q:** Would you tell a colleague? What would you say, in one line?

**Priya:** It's already gone further than the slide. The man next to me missed it and asked me for the password, and I read it out. For Ravi, tomorrow: "Paste the whole thread, not your summary, go straight to the question at the bottom, and run it twice." Then he'll ask for the password, and I'll have to decide whether it's mine to give, and he'd need his personal laptop, which he won't use on a Friday. <mark>So I'll tell him, and he'll try it in a month, if ever.</mark>

## Part G: close

**Q:** What would have made tonight a waste of your five minutes?

**Priya:** Spending them on the password, which I nearly did. Two rows up, someone typed "what is an aggregate", got something back, and turned the laptop to his friend with a face. I didn't see what it said, but it wasn't what he wanted. And the coach falling over because sixty people hit it in the same break: <mark>a tool that works for the first twenty people is a tool the other forty warn each other about.</mark>

**Q:** The one thing the conference version needs?

**Priya:** An example that finds the question. Long, messy and fictional. One click, not sent until I press Send, and the question shows me the two lines it joined. Everything else tonight was fine, including the password. <mark>Nobody brings their thread to a meetup. Bring one for them.</mark>

---

## Interviewer notes (out of character)

Checked against the repo. The copy is from `src/shared/accessContract.ts` (`ACCESS_WRONG_PASSWORD`, `ACCESS_REQUIRED`). `src/ui/AccessGate.tsx` has a label, a field and an error, with no line about remembering. Cookie `Max-Age=7776000` (the demo's curl). Provider failures map to `COACH_UNAVAILABLE` ("The coach is unavailable. Try again.") in `server/chatHandler.ts`. The handler logs the upstream `statusCode` but doesn't map a spent credit limit (402) to its own copy. The rotate step comes from #72's acceptance ("After the conference: rotate `ACCESS_PASSWORD`") together with #41 ("Rotating it after the conference invalidates every 90-day cookie"). Priya's typed reply is synthetic. The "what is an aggregate" moment is what she saw, not what the coach said. The demo's finding 3 recorded a redirect ("paste the material you want…") on non-thread input, which fits.

### Key insights

1. **At a meetup nobody has a thread, and the room, not the notice, stops the paste.** She had deleted her sanitized copies (a security habit, not a one-off), and she wouldn't paste company text within reach of the row behind her anyway. So the only input in a conference try is something typed from memory or a built-in example. [medium: one evening, behaviour + stated] [supports #63; reverses 04a's "Me, no" for this context]
2. **Short input can't show the win.** Her three typed lines came back as her own pre-read question. The question she wouldn't have thought of needs a long thread with distant parts to join (06: "The question came out of the part I cut last time."). A 5-minute try on a toy input demonstrates sorting, which company Claude also does. [medium: synthetic reply, consistent with 06] [#63 content spec; #4]
3. **The gate isn't an account ("a room key").** The friction was reading a letter's case off a phone photo, and the error copy assumes the slide is still up. About 90 s went on it, from a 5-minute window. [strong: behaviour] [supports #41; small copy fix]
4. **The 90-day memory is invisible, and #72's rotate step breaks it.** Her return depends on a fight at work plus her own note to herself, not an email. If she meets the gate again at home, she gives up. Rotating after the conference signs out exactly the return visitors. [medium: stated intent + a past self-note habit] [#41 × #72 conflict]
5. **The password spreads beyond the slide at once, and word of mouth stalls on it.** She read it out to a neighbour in minutes. Telling Ravi means handing out a password and asking him to use a personal laptop, so "he'll try it in a month, if ever". [weak to medium] [#41, #72 cost bound]
6. **A canned example reply would backfire unless it's labelled.** Given run variance (06, #73), an unlabelled pre-recorded "good question" makes the demo better than the product. [medium] [#63, #73]

### Conference context vs solo-prep context

| | Conference try (Thu evening, meetup) | Solo prep (Sunday at home, 04a–06) | What differs for the product |
|---|---|---|---|
| Input on hand | None. Sanitized copies deleted; typed 3 lines from memory | A 12k sanitized thread in a file | The product must supply the input: #63 |
| Time | ~5 min, ~1.5 min of it at the gate | An evening; 15 min of sanitizing is the cost | Every second before the first reply counts; the gate and the example's length matter |
| What stops a paste | The room (neighbours reading the screen); HTTPS is fine | Company policy and the notice (still 1.5/5) | Notice work (#55) pays off at home, not at the meetup |
| Success looks like | "It found something I couldn't have written in two minutes" | A question she'd take to the review | The example must hide a link that only a long thread has |
| Trust test | One run, often on someone else's example | Runs twice, checks the premise in the thread | Variance is invisible at the meetup, and a canned reply hides it: label it or run live |
| Return trigger | A fight at work that week + her self-note with the URL | Already has the tab | The cookie must still be valid, and she must know it is: #41 copy, #72 rotation |
| Failure she won't forgive | Gate eats the break; the coach is down when 60 people try at once | A reply that proposes or misattributes | Shared-load failure (#72) shows the generic "unavailable, Try again" |
| Who else is there | Neighbours; the password goes by word of mouth | Nobody | The password leaks by design; the budget (#72) is the real bound |

### Implications

- **#41 (gate).** Keep it. A shared password on a slide passes her "no account" rule. Two gaps: (a) the gate doesn't say the browser stays unlocked, so she assumes she'll need the slide again; (b) "Check the slide" assumes the slide is still up. Her mistype was letter case, read off a photo.
- **#63 (Try an example).** The verdict flips for the conference: "Tonight, yes. I'd have clicked it first." It carries conditions: the example is long and messy (a side-thread, "+1"s), it has one early/late link, the question shows the two lines it joined, it isn't auto-sent, and it's live or labelled as prepared. A three-line sample repeats her failed try. The gate on #4 from 04a is met (replies coach); the content spec is new. It needs a fixture in the eval so the example's question is checked, since variance (#73) hits the example too.
- **#55 / #69 (notice).** No change: still 1.5/5, read on the gate screen. At a meetup the room decides, not the notice. The notice's content matters for the return visit from home. Don't count conference use as progress on #55.
- **#72 (cost cap).** A hard limit is right: the password spreads by word of mouth in minutes, so the cookie gate isn't a bound. Two changes follow. (a) When the limit is spent, the UI shows "The coach is unavailable. Try again." and people will hammer Try again. Map a spent limit to honest copy with no Retry. (b) "Rotate after the conference" conflicts with the 90-day memory that return visits depend on. Rotate on abuse (usage alert), not by the calendar, and let the budget be the bound. That's the owner's call.
- **#5 (conversation across reload).** Not a conference need: she'd throw the three-line try away. It stays a solo-prep need (the Tue → Thu gap from 01). The 90-day cookie is the only thing that persists between the meetup and home, and it only needs to keep her unlocked. Don't read conference use as demand for #5.

### Small suggestions

1. **A conference example that proves the question.** (#63)
   - *Smallest result:* a "Try an example thread" link in the empty state fills the box with a fictional, messy thread (30–50 messages, roles not names, one side-thread, "+1"s, ~4–6k chars) in which one early message and one late message together imply a question. Not auto-sent. Hidden once the conversation starts. Add the same thread as an eval fixture.
   - *Acceptance:* one click fills the box, count visible, 0 requests until Send. In 3/3 live runs on the production model, the question references both planted messages and passes `questionAsks` (06 suggestion 1). The purpose line and the notice stay visible above the box.
2. **Say that it remembers, and keep that promise.** (#41 copy, #72 checklist)
   - *Smallest result:* under the field: "This browser stays unlocked for 90 days." The wrong-password copy doesn't depend on the slide: "That password isn't right. Check the capitals and try again." In #72, replace "rotate after the conference" with "rotate if the usage alert shows abuse".
   - *Acceptance:* a fresh profile shows the line on the gate. Wrong password → the new copy, field kept, `aria-invalid`. After unlock, closing and reopening the browser → no gate. The #72 issue body no longer schedules a rotation.
3. **A spent budget says so.** (#72, code)
   - *Smallest result:* an upstream 402 (credit limit) maps to its own error, "The coach has used up its budget for today. Try again tomorrow.", with no Retry button, and is logged with `statusCode: 402`.
   - *Acceptance:* a handler test where the coach throws `statusCode: 402` gets that copy and a non-502 status. The UI entry shows it without Retry, and the draft is kept. Other failures still show `COACH_UNAVAILABLE` with Retry.

### Questions for the next interview

- (After #63 ships) Click the example cold. How long until she finds the question and the two lines it joined? Does it beat what she typed from memory?
- Did she come back from home after the 27 Oct review? Did the gate appear? What did she paste, and how long did sanitizing take?
- Did Ravi try it? On which laptop? Did he get the password from her?
- If the example's reply is labelled "prepared", does she still run it herself to compare?
- (Still queued for 07) the #73 retest on three real replies from the fixed prompt. Don't plant slips.
- (Kept for #70) the real-practitioner questions in interview 06.
