# Synthetic interview 03b: Priya Raman, after slice 2a (hosted) + #42 restyle

*Synthetic interview. Treat every point as a hypothesis until a real practitioner confirms it.*

Early October 2026, about two weeks after interview 02. Since then Priya has had a third hour with Dana, and she has tried the hosted app once herself. This session covers policy and trust against the live app at https://ddd-coach.netlify.app, and it counts as covering both slice 2a and the #42 restyle.

Shown: the live page after the #42 restyle (deploy `6ab5fef3`: tokens, self-hosted fonts, small-caps labels), the #42 demo shots `slice-42-light.png`, `slice-42-failed.png` and `slice-42-phone.png`, and the 413 step of the slice 2a demo. Priya's own attempt on Sunday was on the pre-restyle page. The interviewer didn't type anything into the live app. Live facts behind the probes: the input is a single-line `<input type="text">`, so pasted newlines get flattened (#50); a first visit shows only a title, the notice and a "Message" box, with no purpose line and no example; one message over 8,000 characters is rejected with a 413 that clears the draft; and on a phone the Netlify badge covers part of Send (#52).

## Part A: since last time

**Q:** Last time the RFC was due end of October and Dana was about to be away for three weeks. Where are you now?

**Priya:** Four weeks out, and Dana leaves on the 15th. I had my third session with her last Wednesday, so I have one more, next Thursday, and then I'm on my own until the RFC review. Finance sent me the two double-invoice incident write-ups, which helped. The glossary section of the RFC has six terms in it now. Last time it had zero. That's the progress.

**Q:** You had the link to the hosted app. Did you open it?

**Priya:** Twice. Saturday on my phone, on the sofa: I read the notice, saw a text box, and closed it. Then Sunday night on the laptop. First I spent twenty minutes reading OpenRouter's privacy page, then I actually tried it with the sanitized thread. <mark>So the first thing your hosted app made me do was research your vendor.</mark>

**Q:** What did you find on that page?

**Priya:** If I read it right, OpenRouter doesn't keep prompts unless the account turns logging on, and then each model provider behind it has its own policy, and some keep things for a while for abuse checks. So the honest answer to "is my text stored?" is "it depends on settings the operator chose, which I can't see." That's not a gotcha. It's just what I'd need you to tell me.

## Part B: her first real attempt

**Q:** What did you try to paste first, and what broke? Walk me through Sunday step by step.

**Priya:** The sanitized Slack thread, from the text file where I keep it. Customer names are "Customer A," rates are gone, and it's about twelve thousand characters. I opened your page, and there's the title, the notice, the word "Message" and a box about as wide as a URL bar. I selected all in the text file, copied, clicked the box and pasted. The box showed the tail end of the last message and nothing else. I didn't think about it. I pressed Send.

**Q:** When did you notice the line breaks were gone?

**Priya:** After Send. My message showed up in the log as one enormous paragraph: "Customer A booked 10:14 ops creates it on submit Tom 10:16 no finance only counts it when…". The names, timestamps and messages all ran together into one line. <mark>A Slack thread without line breaks isn't a thread any more. It's a wall, and you can't tell who's talking.</mark> Then, under it, in about a tenth of a second: "This message is too long for the coach. Shorten it and send it again."

**Q:** Then what did you do?

**Priya:** The box was empty. My text was only in the log, as that wall, so I went back to the text file instead. I didn't know the limit, so I guessed. I deleted the first forty-odd messages, the "following" and "+1" and the original question, and kept the argument. It came to about seven thousand. That was another ten minutes. I pasted that and it went through. The reply came back in a couple of seconds.

**Q:** What did the reply say?

**Priya:** A tidy summary: "The thread discusses differing definitions of when a booking is created," then some advice to "align on a shared booking lifecycle and document status transitions." No question for me at all. It never mentioned REBOOKED versus AMENDED, because the part where ops explains it was in what I'd cut. And it said *ops* thinks a booking starts when it's invoiceable. That's Tom's line, and Tom is finance. <mark>With the line breaks gone it glued Tom's sentence onto the ops person before him, so the one thing it attributed, it got wrong.</mark> That's the wrong-label problem I told you about last time, except this time it's real, not a mockup.

**Q:** How long did that take all together? What did you do next?

**Priya:** About forty minutes, with the sanitizing. Then I did what I always do. I pasted the same thread, with its line breaks, into our company Claude, which is allowed because it's sanitized anyway. I got a better summary, with the speakers right, and still no questions. I closed your tab. I haven't been back since.

**Q:** Before Sunday, when was the last time a tool rejected your input for length? What did you do?

**Priya:** August, our company Claude. I'd attached the Rails model and the enum and a chunk of the callbacks, and after a few turns it said the conversation was too long and to start a new chat. I started a new chat, pasted the half I thought mattered, and lost the connection between the callbacks and the statuses. That's one of the forty chats called "Booking notes." <mark>What I did was retry once, cut, and then stop trusting the answer, because I knew it hadn't seen everything.</mark> Sunday went exactly the same way. Cut once, and I didn't trust the answer.

**Q:** What would you want the message to say?

**Priya:** The number. "Your message is 12,040 characters; the limit is 8,000." Then I know it's a 35% cut and not a 5% one. And leave my text in the box. Honestly, though, I'd rather it just took the thread, line breaks and all. The thread is the input. Everything I type after that is a sentence or two.

**Q:** If you did get the thread in, a few turns later you'd hit the 24k conversation limit. One idea is to trim or summarize older turns automatically. How would that land?

**Priya:** Depends what "older" means. In my case the oldest turn is the thread, and everything after it is me asking about it. If you summarize my thread to make room for my chat, you've kept the wrong half. <mark>Keep the paste, squash the chat.</mark> And tell me you did it, in one line, beside the reply.

## Part C: the first visit

**Q:** When you landed on Saturday, what told you what the tool was for and what to paste?

**Priya:** Nothing on the page. There's "DDD Coach," a paragraph about where my data goes, and a box that says "Message." The only instruction on the whole screen is what *not* to paste. I knew to paste the thread because I've done two interviews with you. If a colleague had sent me the link, I'd have typed "what is a bounded context?", which, funnily enough, is exactly what your own demo screenshot shows.

**Q:** The last time you opened a new tool from a link with nobody explaining it, what happened?

**Priya:** August, a context-mapping tool someone posted on Bluesky. It opened on an empty canvas with a toolbar. I gave it maybe thirty seconds, couldn't see what I was supposed to do first, and closed it. I've never been back, and I couldn't tell you its name now. <mark>An empty box with no hint is a thirty-second tool.</mark>

**Q:** And if you forwarded this link to Aisha or Ravi without a word?

**Priya:** Ravi would type a textbook question, get a textbook sentence, and decide it's ChatGPT with a nicer font. Aisha wouldn't open it, because it says "DDD" and she doesn't know what that is. Neither of them would paste a thread, because nothing tells them that's the point.

**Q:** What would have told you?

**Priya:** One line, not a tutorial. Something like "Paste a messy Slack thread or meeting notes. I'll show where people use the same word differently and what to ask your expert." And a grey example inside the box, like "Paste the thread nobody could settle…", the way your mockup had it. That tells me what to do and why in five seconds. And please don't make it a tour I have to click through.

## Part D: the notice as shipped

*(The notice reads: "Your messages are sent to OpenRouter, an AI model provider, to generate replies. Nothing is stored on our server. Don't paste customer names or rates.")*

**Q:** That's the real wording now. Would you paste real work material?

**Priya:** No, and for the same reason as last time: OpenRouter isn't on our approved list, and no sentence fixes that. For sanitized text, it's slightly better than what you showed me in September, because of the last line. <mark>"Don't paste customer names or rates" is the first thing on this page that sounds like it's read a policy like mine.</mark> But "OpenRouter, an AI model provider" is wrong. OpenRouter is a router. It passes my text to somebody else's model. That's the part I asked you to name.

**Q:** Last time you gave us a checklist. Let's go through it. First item: the company that processes the text.

**Priya:** Half there. You named OpenRouter, which is new. The September draft named a model slug. This one names nobody behind the router. Which model is it today?

**Q:** Today it's an OpenAI model, `gpt-5.6-terra`, served through OpenRouter.

**Priya:** OK, so not even Anthropic. That's fine for sanitized text, I honestly don't care which lab reads "Customer A." But it proves my point. <mark>The notice was true in September with a Claude model, and it's still word-for-word true today with an OpenAI one, which means it tells me nothing about who processes my text.</mark> If you swap models, the notice should change.

**Q:** Second and third: retention at OpenRouter and the provider, and training use with a link.

**Priya:** Missing, both. "Nothing is stored on our server" is the only retention sentence, and it's about the one party I was least worried about. My guess is most people read it as "nothing is stored," full stop. I did, for a second. There's no training line and no link anywhere on the page. You don't even need a new decision for the links. OpenRouter's privacy page exists today, and so does OpenAI's.

**Q:** Fourth and fifth: a page you can forward to security, and the operator named.

**Priya:** No page. No link at all, actually, apart from the Netlify bubble in the corner. And "our server": still whose? There's no name, no About link, nothing on the page. The only company logo on the screen is Netlify's. <mark>If anyone at work asked me who runs it, my honest answer is "a guy who interviews me."</mark>

**Q:** So, overall: which items moved?

**Priya:** One and a half out of five. OpenRouter is named, and there's a "don't paste" line I didn't have on the list but asked for. Everything that would let me defend using it is still missing. I pasted the sanitized thread with this notice on Sunday. I'd have pasted the sanitized thread without it, too.

## Part E: bring your own key, and self-hosting

**Q:** One option on the table: a field where you paste your own Anthropic API key, so your text goes to Anthropic under your company's terms. Is that acceptable?

**Priya:** For me, it doesn't matter, because I can't get one. Our Claude Enterprise is the chat workspace. There's no API key in it for me to copy. API access is a separate account the platform team runs.

**Q:** How do you know that? Has anyone on your team tried?

**Priya:** Ravi, in July. He wanted to run a script that summarized Jira tickets. He filed a ticket with platform, had to name the service and an owner, and the key went into Vault. He's never seen the key itself. The script reads it at runtime. <mark>Nobody at my company holds a personal Anthropic key, and if they did, they wouldn't be allowed to paste it into a website.</mark>

**Q:** Say you had one. What would security say about pasting it into a third-party web app?

**Priya:** Our secrets policy is one line: credentials never go into third-party sites. A key is worse than the thread. If your page leaks it, anyone can spend on our bill, and anything sent with it goes out under our contract. Then they'd ask the question I'd ask: does the key go to your server? If it does, you're still a vendor, just one that's holding our key now. If it goes straight from my browser to Anthropic, that's better, but they'd still want to read the code, and the code is on your site, not in our repo.

**Q:** Would a key field break "no settings before the first reply" for you?

**Priya:** If it's optional and folded away, like "Use your own Anthropic key," I'd ignore it, and it wouldn't bother me. If it's required, it's the account gate with a different name, and I'd bounce on the first visit. But the bigger point is: an optional field I can't fill in doesn't build anything for me. It's for somebody else. A consultant with a personal Anthropic account, maybe.

**Q:** What about self-hosting: the code as a repo you run locally or inside your company, pointed at your company's key?

**Priya:** That's the only version that could be legal for real material. If it runs on my laptop or in our infra and calls Anthropic with a key from Vault, it's an internal tool, not a vendor. Same path as Ravi's script: a platform ticket and a code review. That took him about two weeks. But I'm not doing that for a tool I haven't had one win with, and not four weeks before an RFC. <mark>Self-hosting is what I'd do after it's already saved me a week, not to find out whether it can.</mark>

**Q:** So if we had to pick one: key field, self-host, or say plainly "this is for sanitized text"?

**Priya:** For this month, say it plainly. I'm already sanitizing. Tell me the tool is built for that, tell me what to strip, and fill in the rest of the notice. Self-host is a later conversation, and it only happens if the sanitized version wins first. The key field I'd skip. It costs you a setting and it doesn't unlock me.

## Part F: the look, and the phone

*(Shown the live restyled page, plus the #42 demo shots: desktop with a reply, the failed state with Retry, and the phone at 390 px. It has warm paper with a dot grid, a bold title, small-caps "You" and "Coach" cards, and a docked message bar with a blue Send button. The notice is now 14 px muted grey in a grey box, against 16 px body text. On the phone, the Netlify badge covers the bottom of Send.)*

**Q:** This is the restyled screen, live now. Would it look trustworthy enough to show Dana?

**Priya:** I'm not showing Dana the app. I said that in the first interview, and nothing's changed. I prep alone, and what Dana sees is the output: three questions in a Slack DM, or a table in Confluence. So the look matters for me, and a little for Marcus if I screenshot something. It's nicer. It doesn't read "someone's weekend project" any more. But look what happened to the notice. On Sunday it was the only real text on the page. Now it's small grey type in a grey box, <mark>which is exactly what cookie banners and terms of service look like, the stuff I've trained myself not to read.</mark> And the message box is still one line, so Sunday would go exactly the same way, just in a nicer font. A nicer-looking page from a name I don't know is still a stranger.

**Q:** Anything on these screens you'd call trustworthy?

**Priya:** The failed one, actually. Red box, "Could not reach the coach," Retry right there. It admits it broke, and it doesn't pretend. That's the kind of honest I'd want everywhere. The cards are fine. "You" and "Coach" are clear, and the example on it is a textbook question again.

**Q:** When was the last time you showed Dana a tool? How did she react?

**Priya:** April. The carrier team had built a booking-status timeline in Retool, and I shared my screen to ask if it matched what ops sees. Dana looked at it for about ten seconds and said, "CARRIER_ACK isn't a thing ops cares about. Why is that purple?" Then she asked if I could export it to Excel. She's never opened Retool since. <mark>She judged it on one wrong word in ten seconds, and the styling only made her ask about the colour.</mark>

**Q:** So what would make something trustworthy enough for Dana?

**Priya:** Her words, and her format. If the three questions use "rebook" and "TONU" and a real load number, she answers them. If they say "BookingReassigned" she's gone. And it has to arrive somewhere she already is, which is Slack or Excel. Whatever tool made it is irrelevant to her, as long as it doesn't pretend she said something she didn't. Sunday's reply put Tom's words in ops' mouth. If that reached Dana, she'd be done with it.

**Q:** Would you open it on your phone at all, say right after a Dana call?

**Priya:** No. Dana's calls are Zoom on the laptop, and the second she hangs up I'm typing into the text file on the same laptop, because that's where my notes already are. My phone was for Saturday on the sofa, to look, not to work. The only time I'm on the phone after a call is walking to get coffee, and then I'd rather talk than type. I told you last time I've never actually done that. And look at your phone screenshot: the Netlify badge sits on top of Send. <mark>The one time I'd type on the phone, I'd hit Netlify's ad instead of Send.</mark> So fix the badge, but don't build anything for the phone on my account.

## Part G: leftovers from last time

**Q:** Last time you said to ask who approves a new AI vendor. Who does, and what happened the last time someone asked?

**Priya:** Security, which is three people, plus procurement if it costs money. The last one I know of was April. Design wanted an AI meeting-notes tool. Security sent a questionnaire: data processing agreement, SOC 2 report, subprocessor list, retention, training use, SSO. It took six weeks, and the answer was "use the one built into Zoom that we already pay for." <mark>A side project with no company behind it doesn't get a questionnaire. It gets a no.</mark>

**Q:** Last time you said a page you could forward to security was "how anything gets approved here." Does that still hold?

**Priya:** I overstated it. The page doesn't get you approved. You'd need a company and a DPA for that, and you don't have either. What the page does is cover me. If someone asks why I used it, I forward the page, and it shows I checked, I sanitized, and I read the retention terms. That's still worth something to me. It just isn't the door.

**Q:** Last time Dana corrected your notes, what did you do with the correction? Where does it live now?

**Priya:** Last Wednesday. I read my notes back to her on the rebook question, and she corrected one: a date change with the same carrier is AMENDED, but a lane change is always a new booking, even though the code sets REBOOKED. After the call I sent her a Slack DM with my three answers and "did I get this right?", which is the thing I told you your tool should do. She replied with a thumbs-up and one fix. So now the correction lives in my text file, a comment on the Confluence table, and that DM. <mark>Three places, and none of them is the RFC yet.</mark>

**Q:** After your last paste into the RFC, what did you retype by hand?

**Priya:** The glossary, again. I pasted my Dana summary from the text file, and the table came through as pipes, so I rebuilt six rows with the table button. About twenty-five minutes. Same as last time. That hasn't changed, because nothing I use has changed.

## Part H: close

**Q:** If you could only have one thing in the next month, what is it now?

**Priya:** Take my twelve-thousand-character sanitized thread in one go, with its line breaks, and give me the words that don't match as a table I can paste into the glossary. Before the 30th. Last time I said "and it's still there when I come back," and I still want that in general. But I have one Dana session left, so this month, <mark>the paste has to fit and the table has to paste. That's more urgent than persistence now.</mark> I know that's different from what I said before.

**Q:** Would you use it this week? For what?

**Priya:** I already tried it this week, and it cost me forty minutes and got a speaker wrong. As it is today, no. The box is one line, it takes eight thousand characters, and it doesn't untangle anything. It's a chat. When the box keeps line breaks, I'll re-run the same sanitized thread once, at home, and check two things. Does it get the speakers right? Does it find the REBOOKED versus AMENDED split without me pointing at it? That's a twenty-minute test, not using it. <mark>If it tells me to make a Booking aggregate, I won't be back.</mark>

---

## Interviewer notes (out of character)

### Key insights

1. **Her first real attempt failed twice before any coaching happened.** She pasted a 12k sanitized thread into the one-line box, and the newlines were flattened. She pressed Send and got a 413 in about 0.1 s, with the draft cleared. She cut the thread by guesswork to about 7k (10 more minutes). The reply was generic, asked no question, and gave Tom's (finance) line to ops, because the flattened text had lost speaker boundaries. She then took the same thread to company Claude, which got the speakers right, and hasn't come back. It cost about 40 minutes. [strong signal: past behavior on the live app] [supports #50 as urgent now, not only "before slice 3"; supports #51; contradicts #4's "1–5k chars" and B40 #35's 8k cap for her input]
2. **A first visit doesn't say what the tool is for.** The only instruction on the page is what *not* to paste. She knew to paste a thread only because of the interviews. Past anchor: a Bluesky context-mapping tool that opened on an empty canvas got 30 seconds and was never reopened. Her guess about colleagues: Ravi types a textbook question, and Aisha doesn't open it. She wants one line plus a placeholder example, and no tour. [strong signal for her own anchor; weak for colleagues (secondhand guess)] [contradicts the backlog friction check "a first-time visitor can understand the next action from the main screen"; supports 2a fresh-eyes 3 and #4]
3. **The shipped notice meets 1.5 of her 5 checklist items, and the restyle demoted it.** OpenRouter is named, but the company behind it isn't, and "an AI model provider" is inaccurate. Nothing on retention beyond "our server," no training line, no link, no operator. The notice read the same with a Claude model as with an OpenAI one. The "don't paste" line was the only trust gain. The #42 restyle sets the notice at 14 px muted grey against 16 px body text: "exactly what cookie banners … look like." [strong signal] [contradicts #2 closed as done, and #42's notice treatment; #34's comment defers links that could be added today]
4. **A forwardable page protects her. It doesn't get the tool approved.** Security's April review required a DPA, SOC 2, subprocessors, retention, training use and SSO. It took six weeks and ended in "use what we pay for." A side project gets a flat no. She walked back her interview-02 claim. [strong signal: past behavior, secondhand] [contradicts disclosure as a route to work use (#2, #34)]
5. **Bring-your-own key doesn't unlock her. Self-hosting is the only work-legal path, and only after a solo win.** She has no personal API keys: they're per service, owned by platform and held in Vault (Ravi, July). The secrets policy forbids pasting credentials into sites, and a key relayed through the server still makes the app a vendor. An optional folded field would be tolerated; a required one is "the account gate with a different name." Self-hosting with a Vault key would be reviewed like an internal tool (about 2 weeks, secondhand), but "after it's already saved me a week." [strong on "no keys"; weak on self-host intent] [contradicts the #34 BYO-key option; contradicts icebox #33 "B10/B19/B20 blocked by ICP AI policy"]
6. **Trimming has to keep the paste.** The oldest turn is her source. "Keep the paste, squash the chat," with a visible note. [strong signal: follows from her flow and Sunday's cut] [refines B38 #7]
7. **The restyle doesn't earn Dana's trust, and the phone isn't her device.** Dana sees only output (Slack, Excel, Confluence). In April she dismissed a Retool view over one wrong term. The failed state (red box plus Retry) is the one screen Priya called trustworthy. After a Dana call she's already typing on the laptop. She used the phone once, to look. On the phone the Netlify badge covers Send: "I'd hit Netlify's ad instead of Send." [strong signal on Dana and the post-call laptop; weak on phone use] [neutral on #42; supports #52 as a fix but argues against any phone-first work]
8. **The expert confirmation loop already exists, by hand, in Slack, and her priorities shifted this month.** She sent Dana a "did I get this right?" DM, and Dana corrected one answer. The correction lives in three places, none of them the RFC. She rebuilt the glossary table by hand again (about 25 min). With one Dana session left, paste capacity and a pasteable table beat persistence. [strong signal: past behavior; the priority shift is a self-contradiction] [supports #6, B22 #19; reorders #5 vs #50/#4 for her calendar]

### What changed since interview 02

- **Confirmed:** OpenRouter blocks real material ("no sentence fixes that"), so she'll use sanitized text only. Confluence still pastes tables as pipes. "Wrong labels kill trust" is now real: the live app misattributed a speaker.
- **Strengthened:** the length and paste problem went from a worry to past behavior. On Sunday she hit the flattening, then the 413, then a guessed cut, then a wrong answer, then left for company Claude. The "don't paste" line held up as the only trust gain.
- **Weakened:** "a page I can forward to security is how anything gets approved": now it covers her but won't pass review. The notice placement: still no dialog, but #42 made it small print. Persistence as *this month's* one thing: one Dana session left. Phone or voice right after a call: she's on the laptop.
- **New:** her first real attempt (about 40 minutes, a speaker misattributed, then company Claude). No purpose line (the Bluesky thirty-second anchor). The hosted model is OpenAI's, and the notice doesn't say so. No personal API keys, and a secrets rule against pasting keys. Self-hosting as a later path. Security's April bar. The Retool anecdote. The expert-confirmation DM done by hand. The Netlify badge over Send on the phone.
- **Interview-02 asks vs what shipped:** of her five checklist items, one is partly met. Her "don't paste" line shipped. Persistence and the untangle haven't shipped.

### Decision input for #34 (provider path)

**Recommendation from this interview: explicitly accept "sanitized input only" for the hosted app now. Don't build a BYO key field. Keep self-hosting with a company key as the one later path, gated on a solo win.**

| Option | Unlocks real material for Priya? | Evidence |
|---|---|---|
| BYO Anthropic key field | No | No personal keys exist: Enterprise is chat only, and API keys are per service in Vault (Ravi, July). The secrets policy forbids pasting credentials into third-party sites. If the key passes through the app's server, the app is still a vendor. An optional folded field is tolerated but builds nothing for her; a required one makes her bounce. |
| Accept sanitized-only (say so) | No, but it matches what she already does | She already sanitized and pasted on Sunday (about 15 min). "Tell me the tool is built for that, tell me what to strip, and fill in the rest of the notice." The "don't paste" line was the only trust gain. |
| Self-host / local with company key | Yes, later | "Internal tool, not a vendor." About a 2-week platform review (secondhand). "What I'd do after it's already saved me a week." Keep the `Coach` port provider-agnostic so an Anthropic adapter stays cheap. |
| Hosted Anthropic path (operator's key) | No | Still an unapproved vendor (the operator). She said "not even Anthropic… that's fine for sanitized text", so which model runs doesn't change her decision. |

What would reopen BYO key: a real practitioner at a company that issues personal API keys *and* allows browser use. Ask a real platform or security engineer (interview 04 questions).

### Roadmap assumptions this interview challenges

B-IDs verified against GitHub issue titles and the icebox (#33). `outputs/ddd-coach-backlog.md` is a pointer and lists no B-IDs itself.

- **The single-line input can wait until slice 3** (#50, "do before #4"). It's already costing the live app: the flattened thread lost speaker boundaries, and the reply misattributed Tom's line. It's the first thing a paste-first visitor hits.
- **A first-time visitor can understand the next action from the main screen** (backlog friction check; slice 3 briefing, #4). The page says only what not to paste. Her anchor for an unexplained tool is a 30-second visit.
- **Pastes run 1–5k characters** (#4 acceptance; #7 "pastes run 1–5k"). Her real thread is 18k (12k sanitized). The 8k per-message cap (B40, #35) rejected it on Sunday.
- **A 413 without Retry is enough recovery** (B41, #36). No Retry is right, but the cleared draft (#51) and the missing limit number forced a guessed cut, and the cut removed the part that mattered.
- **Trim or summarise older turns** (B38, #7). For a paste-first user the oldest turn is the source. Pin the first paste and shorten the chat.
- **The data-flow notice is done** (#2, closed). 1.5 of 5 items are met, and "an AI model provider" mislabels OpenRouter. The links can be added today.
- **The restyle raises trust** (#42, live). It demoted the notice to muted small print, and it doesn't change the one-line input that broke Sunday. Dana never sees the app anyway.
- **The Netlify badge is a P2 cosmetic** (#52). It covers Send on phones. She won't work on the phone, so P2 is fair for her, but it's the first thing any phone visitor taps.
- **BYO key is a viable #34 option** (#34). Not for this ICP.
- **Local and private sources are blocked by the AI policy** (B10/B19/B20, icebox #33). They're blocked only while inference goes through OpenRouter. Self-hosting with a company key could be work-legal.
- **Persistence is her top ask** (#5). Still wanted, but this month paste capacity (#50, #35) and a pasteable table (#6) rank higher. This is a self-contradiction, so confirm it with a real practitioner.
- **Export is Markdown into Confluence and Miro** (#6). This is the second hand-rebuilt glossary table. Rich-text table first; Miro is gone.

### Small slice suggestions

1. **Keep the paste intact: a multiline box plus a draft that survives a 413.** #50 plus #51, now rather than "before slice 3".
   - *Smallest result:* a full-width textarea keeps pasted line breaks. On a message over 8,000 characters the draft stays in the box, and the message reads "Your message is N characters; the limit is 8,000." There's still no Retry.
   - *Acceptance:* paste a 12,040-character, 200-line Slack export and send. The box still holds all 12,040 characters with line breaks, both numbers show, and there are 0 buttons in the entry. Paste a 3-line thread and send: the request body contains 2 `\n`s. Works at 390 px, and the Netlify badge doesn't overlap Send (#52).
2. **One purpose line and an example placeholder on first visit.** A thin slice of #4's briefing.
   - *Smallest result:* under the title, one line: "Paste a messy thread or meeting notes. I'll show where people use the same word differently and what to ask your expert." The empty box shows a grey placeholder example. No tour, no dialog.
   - *Acceptance:* at 400 px and 1280 px the purpose line, the notice and the box all fit above the fold. The placeholder vanishes on input. A 5-second test with someone who has never seen the app gets "paste a thread" as the answer to "what do you do here?"
3. **Complete the notice with a linked data page.** Reopen #2, or a #34 follow-up.
   - *Smallest result:* the notice names the company behind the model (from server config), says "Built for sanitized text" and links "Data & retention" to one static page. That page names the operator, OpenRouter and the provider, and links each one's privacy and training policy plus the OpenRouter logging setting.
   - *Acceptance:* the notice is body size and full ink colour, not #42's muted 14 px. Changing the configured model changes the named company. Every retention or training claim links to that vendor's own policy, or it isn't shown. OpenRouter is no longer called "an AI model provider." Each of her five checklist items maps to a line on the page.
4. **Pin the first paste when the conversation fills up.** A B38 (#7) variant, after suggestion 1.
   - *Smallest result:* when the 24k budget runs out, the first pasted message stays verbatim, later chat turns are shortened, and a one-line note under the reply says so.
   - *Acceptance:* paste a 12,000-character thread, then chat until the budget is hit. The next reply quotes a detail from the paste, the note says what was shortened, and there's no 413.

### Questions for interview 04

- Once #50 lands, re-run Sunday's thread. Are the speakers right? Does it find REBOOKED vs AMENDED without a hint?
- (Ravi or Aisha, cold) Here's the link with no explanation. What do you type first?
- (A real platform engineer) Can an engineer at your company get a personal Anthropic API key? What would they be allowed to paste it into?
- (A real security reviewer) Here's a self-hosted repo that calls Anthropic with your company key. What's the review, and how long does it take?
- After Dana leaves on the 15th, what did you do with the questions only she can answer?
- Where did Dana's Slack-DM correction end up in the RFC? Who else read it?
- If the notice said "Built for sanitized text," would you sanitize differently? Show me the last thing you sanitized.
