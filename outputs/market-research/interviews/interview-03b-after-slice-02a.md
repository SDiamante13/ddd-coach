# Synthetic interview 03b: Priya Raman, after slice 2a (hosted) + #42 restyle

*Synthetic interview. Treat every point as a hypothesis until a real practitioner confirms it.*

Early October 2026, about two weeks after interview 02. Since then Priya has had a third hour with Dana. This session covers policy and trust against the live hosted app at https://ddd-coach.netlify.app. Shown: the live page (unstyled at the time it was viewed: notice under the title, one-line "Message" box, "Powered by Netlify" badge), then `slice-02a.png` and the 413 step of the slice 2a demo. The design-tokens restyle (#42) reached production later the same day, so Part E used the #42 demo's production screenshots (`slice-42-light.png`, `slice-42-phone.png`). Nothing was typed into the live app.

## Part A: since last time

**Q:** Last time the RFC was due end of October and Dana was about to be away for three weeks. Where are you now?

**Priya:** Four weeks out, and Dana leaves on the 15th. I had my third session with her last Wednesday, so I have one more, next Thursday, and then I'm on my own until the RFC review. Finance sent me the two double-invoice incident write-ups, which helped. The glossary section of the RFC has six terms in it now. Last time it had zero. That's the progress.

**Q:** You had the link to the hosted app. Did you open it?

**Priya:** Once, Saturday, on my phone. I read the notice, scrolled, saw a text box, and closed it. I didn't paste anything, because I didn't have the sanitized thread on my phone and I wasn't going to sanitize it with my thumbs. Then on Sunday I spent twenty minutes reading OpenRouter's privacy page on the laptop, which is more time than I spent on your app. <mark>So the first thing your hosted app made me do was research your vendor.</mark>

**Q:** What did you find on that page?

**Priya:** If I read it right, OpenRouter doesn't keep prompts unless the account turns logging on, and then each model provider behind it has its own policy, and some keep things for a while for abuse checks. So the honest answer to "is my text stored?" is "it depends on settings the operator chose, which I can't see." That's not a gotcha. It's just what I'd need you to tell me.

## Part B: the notice as shipped

*(Shown the live page. The notice reads: "Your messages are sent to OpenRouter, an AI model provider, to generate replies. Nothing is stored on our server. Don't paste customer names or rates.")*

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

**Priya:** One and a half out of five. OpenRouter is named, and there's a "don't paste" line I didn't have on the list but asked for. The placement is still right: visible, no dialog, doesn't block anything. Everything that would let me defend using it is still missing. I'd paste the sanitized thread with this notice. I'd have pasted the sanitized thread without it, too.

## Part C: the 8,000-character limit

*(Shown the slice 2a demo at 1:01: a 9,000-character message is rejected with "This message is too long for the coach. Shorten it and send it again." There's no Retry button, and the input is cleared.)*

**Q:** Your Slack export was about 18,000 characters. What's it at after sanitizing?

**Priya:** About twelve thousand. Sanitizing removes names and rates, not messages. So even the cleaned-up version fails. And your box is one line. When I paste a Slack thread into a one-line input, the line breaks go and it's one long sentence. You lose who said what, and <mark>who said what is the entire point of that thread.</mark>

**Q:** Say you've pasted the twelve thousand and you get this message. What do you do at that moment?

**Priya:** First I'd look for my text, and it's gone from the box. It's in the log above, all twelve thousand characters of it, so I'd be scrolling and selecting by hand on a laptop trackpad. Then I'd have to guess how much to cut, because the message doesn't say what the limit is. I'd delete the first forty messages, the "following" and "+1" and the original question, and keep the argument. That's maybe seven thousand. Another ten minutes, on top of the fifteen for sanitizing. And the part I'd cut first is where ops explains their definition in their own words, which is the part Dana would care about.

**Q:** When was the last time a tool rejected your input for length? What did you do?

**Priya:** August, our company Claude. I'd attached the Rails model and the enum and a chunk of the callbacks, and after a few turns it said the conversation was too long and to start a new chat. I started a new chat, pasted the half I thought mattered, and lost the connection between the callbacks and the statuses. That's one of the forty chats called "Booking notes." <mark>What I did was retry once, cut, and then stop trusting the answer, because I knew it hadn't seen everything.</mark> I'd do the same here. Cut once. If it rejects me twice, I close the tab.

**Q:** What would you want the message to say?

**Priya:** The number. "Your message is 12,040 characters; the limit is 8,000." Then I know it's a 35% cut and not a 5% one. And leave my text in the box. Honestly, though, I'd rather it just took the thread. The thread is the input. Everything I type after that is a sentence or two.

**Q:** If you did get the thread in, a few turns later you'd hit the 24k conversation limit. One idea is to trim or summarize older turns automatically. How would that land?

**Priya:** Depends what "older" means. In my case the oldest turn is the thread, and everything after it is me asking about it. If you summarize my thread to make room for my chat, you've kept the wrong half. <mark>Keep the paste, squash the chat.</mark> And tell me you did it, in one line, beside the reply.

## Part D: bring your own key, and self-hosting

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

## Part E: the look

*(Shown the restyled production screen from the #42 demo, desktop and phone: a warm paper background with a dot grid, a bold title, "YOU" and "COACH" cards, a docked message bar with a blue Send button, and the notice in a small grey boxed panel. On the phone, the Netlify badge overlaps the Send button.)*

**Q:** This is the restyled screen, live now. Would it look trustworthy enough to show Dana?

**Priya:** I'm not showing Dana the app. I said that in the first interview, and nothing's changed. I prep alone, and what Dana sees is the output: three questions in a Slack DM, or a table in Confluence. So the look matters for me, and a little for Marcus if I screenshot something. It's nicer. It no longer reads "someone's weekend project," apart from the Netlify bubble, which is now sitting on your Send button on the phone. But look what happened to the notice. Before, it was the only real text on the page. Now it's small grey type in a grey box, <mark>which is exactly what cookie banners and terms of service look like, the stuff I've trained myself not to read.</mark> And a nicer-looking page from a name I don't know is still a stranger. The name and a link help me trust it more than the fonts do.

**Q:** When was the last time you showed Dana a tool? How did she react?

**Priya:** April. The carrier team had built a booking-status timeline in Retool, and I shared my screen to ask if it matched what ops sees. Dana looked at it for about ten seconds and said, "CARRIER_ACK isn't a thing ops cares about. Why is that purple?" Then she asked if I could export it to Excel. She's never opened Retool since. <mark>She judged it on one wrong word in ten seconds, and the styling only made her ask about the colour.</mark>

**Q:** So what would make something trustworthy enough for Dana?

**Priya:** Her words, and her format. If the three questions use "rebook" and "TONU" and a real load number, she answers them. If they say "BookingReassigned" she's gone. And it has to arrive somewhere she already is, which is Slack or Excel. Whatever tool made it is irrelevant to her, as long as it doesn't pretend she said something she didn't.

## Part F: leftovers from last time

**Q:** Last time you said to ask who approves a new AI vendor. Who does, and what happened the last time someone asked?

**Priya:** Security, which is three people, plus procurement if it costs money. The last one I know of was April. Design wanted an AI meeting-notes tool. Security sent a questionnaire: data processing agreement, SOC 2 report, subprocessor list, retention, training use, SSO. It took six weeks, and the answer was "use the one built into Zoom that we already pay for." <mark>A side project with no company behind it doesn't get a questionnaire. It gets a no.</mark>

**Q:** Last time you said a page you could forward to security was "how anything gets approved here." Does that still hold?

**Priya:** I overstated it. The page doesn't get you approved. You'd need a company and a DPA for that, and you don't have either. What the page does is cover me. If someone asks why I used it, I forward the page, and it shows I checked, I sanitized, and I read the retention terms. That's still worth something to me. It just isn't the door.

**Q:** Last time Dana corrected your notes, what did you do with the correction? Where does it live now?

**Priya:** Last Wednesday. I read my notes back to her on the rebook question, and she corrected one: a date change with the same carrier is AMENDED, but a lane change is always a new booking, even though the code sets REBOOKED. After the call I sent her a Slack DM with my three answers and "did I get this right?", which is the thing I told you your tool should do. She replied with a thumbs-up and one fix. So now the correction lives in my text file, a comment on the Confluence table, and that DM. <mark>Three places, and none of them is the RFC yet.</mark>

**Q:** After your last paste into the RFC, what did you retype by hand?

**Priya:** The glossary, again. I pasted my Dana summary from the text file, and the table came through as pipes, so I rebuilt six rows with the table button. About twenty-five minutes. Same as last time. That hasn't changed, because nothing I use has changed.

## Part G: close

**Q:** If you could only have one thing in the next month, what is it now?

**Priya:** Take my twelve-thousand-character sanitized thread in one go, and give me the words that don't match as a table I can paste into the glossary. Before the 30th. Last time I said "and it's still there when I come back," and I still want that in general. But I have one Dana session left, so this month, <mark>the paste has to fit and the table has to paste. That's more urgent than persistence now.</mark> I know that's different from what I said before.

**Q:** Would you use it this week? For what?

**Priya:** Honestly, as it is today, no. The box is one line, it takes eight thousand characters, and it doesn't untangle anything. It's a chat. I might try it Saturday at home with the thread cut down to fit, to see one thing: does it find the REBOOKED versus AMENDED split without me pointing at it? Company Claude didn't. That's a twenty-minute test, not using it. If it finds the split, I'll tell you. If it tells me to make a Booking aggregate, I won't be back.

---

## Interviewer notes (out of character)

### Key insights

1. **The shipped notice meets 1.5 of her 5 checklist items.** OpenRouter is named, but the company behind the router isn't. "OpenRouter, an AI model provider" is inaccurate. No retention beyond "our server," no training line, no link, no operator. The notice read the same with a Claude model as with today's OpenAI model, so it can't tell her who processes the text. The "don't paste customer names or rates" line is the only part that raised trust. [strong signal] [contradicts roadmap: #2 closed as done; #34 comment says links "wait on this decision," but OpenRouter's and OpenAI's policy pages exist today]
2. **A forwardable page protects her. It doesn't get the tool approved.** Security's last AI-vendor review (April) required a DPA, SOC 2, subprocessors, retention, training use and SSO. It took six weeks and ended in "use what we pay for." A side project with no legal entity gets a flat no. She walked back her interview-02 claim. [strong signal: past behavior, secondhand] [contradicts roadmap: disclosure as a route to work use (#2, #34)]
3. **Bring-your-own Anthropic key doesn't unlock her.** Her Claude Enterprise workspace has no API keys. API keys are per service, owned by platform and held in Vault (Ravi's July ticket). Security forbids pasting credentials into third-party sites, and a key relayed through the app's server still makes the app a vendor. An optional, folded field wouldn't bother her. A required one is "the account gate with a different name." [strong signal on "no personal keys"; the key mechanics are secondhand] [contradicts #34 option "BYO key"; supports "no settings before first reply"]
4. **Self-hosting with a company key is the only work-legal path, and it comes after a solo win.** Running locally or in company infra with a Vault key would make it an internal tool reviewed like Ravi's script (about two weeks). She won't do it before a win, and not before the RFC. [weak signal: stated intent, secondhand timing] [contradicts icebox #33 "B10/B19/B20 blocked by ICP AI policy", which is true only while inference goes through OpenRouter]
5. **Her real paste doesn't fit, and the 413 makes it worse.** 18k raw, about 12k sanitized. The 8k cap rejects even the cleaned version. The one-line input flattens who-said-what. The 413 clears her draft and doesn't give the limit. Past behavior (August, company Claude "too long"): retried once, cut, then distrusted the answer. Here: "Cut once. If it rejects me twice, I close the tab." [strong signal] [contradicts #4's "1–5k chars"; supports #50, #51; challenges B40 #35's 8k per-message cap]
6. **Trimming has to keep the paste.** In her flow the oldest turn is the source material, so summarizing older turns first keeps the wrong half. "Keep the paste, squash the chat," with a visible note. [strong signal: follows from her flow, not from past behavior] [refines B38 #7]
7. **The restyle won't earn Dana's trust, and it demoted the notice.** She never shows Dana the app; Dana sees output in Slack or Confluence. Past anchor: Dana dismissed a Retool timeline in ten seconds over one wrong term, then asked for Excel. The live restyle fixes the "weekend project" look for Priya and Marcus, but it styles the notice as small grey text in a grey box, "exactly what cookie banners … look like." The Netlify badge covers Send on the phone. "A nicer-looking page from a name I don't know is still a stranger." [strong signal on Dana; weak on styling] [contradicts #42's notice treatment; supports #52 badge removal]
8. **The expert confirmation loop already exists, by hand, in Slack.** She did the "did I get this right?" DM that she asked the tool for in interview 02, and Dana corrected one answer. That correction now lives in three places, none of them the RFC. She rebuilt the glossary table by hand again (about 25 minutes). This month, paste capacity and a pasteable table beat persistence (one Dana session left before she's away). [strong signal: past behavior; the priority shift is a self-contradiction] [supports #6, B22 #19; reorders #5 vs #4/#50 for her calendar]

### What changed since interview 02

- **Confirmed:** OpenRouter blocks real material ("no sentence fixes that"); she'd use it only for sanitized text; the notice placement (visible, no dialog) is right; the Confluence table still pastes as pipes.
- **Strengthened:** the "don't paste" line. She asked for it in interview 02, and it's now the only notice line that raised trust. The length problem also got stronger: she gave a concrete sanitized size (about 12k) and a past length rejection (August).
- **Weakened:** "a page I can forward to security is how anything gets approved." She now says it covers her but won't pass review without a company and a DPA. Persistence as the one thing *this month*: one Dana session left, so paste capacity and the glossary table come first. She still wants persistence in general.
- **New:** she spent more time researching OpenRouter than using the app. The hosted model is OpenAI's, and the notice doesn't say so. She has no personal API key, and there's a secrets rule against pasting keys into sites. Self-hosting is a possible later path. Security's April review is a concrete bar (DPA, SOC 2, subprocessors, retention, training, SSO). The Retool anecdote shows how Dana judges tools. She did the expert-confirmation DM by hand. The one-line input breaks her paste. The live restyle made the notice look like small print.
- **Interview-02 asks vs what shipped:** of her five checklist items, one is partly met (OpenRouter named, no provider). Her "don't paste" line shipped. Persistence and the untangle haven't shipped.

### Decision input for #34 (provider path)

**Recommendation from this interview: explicitly accept "sanitized input only" for the hosted app now. Don't build a BYO key field. Keep self-hosting with a company key as the one later path, gated on a solo win.**

| Option | Unlocks real material for Priya? | Evidence |
|---|---|---|
| BYO Anthropic key field | No | No personal keys exist: Enterprise is chat only, and API keys are per service in Vault (Ravi, July). The secrets policy forbids pasting credentials into third-party sites. If the key passes through the app's server, the app is still a vendor. An optional folded field is tolerated but builds nothing for her; a required one makes her bounce. |
| Accept sanitized-only (say so) | No, but it matches what she already does | She already sanitizes (about 15 min). "Tell me the tool is built for that, tell me what to strip, and fill in the rest of the notice." The "don't paste" line was the only trust gain. |
| Self-host / local with company key | Yes, later | "Internal tool, not a vendor." About a 2-week platform review (secondhand). "What I'd do after it's already saved me a week." Keep the `Coach` port provider-agnostic so an Anthropic adapter stays cheap. |
| Hosted Anthropic path (operator's key) | No | Still an unapproved vendor (the operator). She said "not even Anthropic… that's fine for sanitized text", so which model runs doesn't change her decision. |

What would reopen BYO key: a real practitioner at a company that issues personal API keys *and* allows browser use. Ask a real platform or security engineer (interview 04 questions).

### Roadmap assumptions this interview challenges

B-IDs verified against GitHub issue titles and the icebox (#33). `outputs/ddd-coach-backlog.md` is a pointer and lists no B-IDs itself.

- **The data-flow notice is done** (#2, closed). One and a half of five checklist items are met. "An AI model provider" mislabels OpenRouter. No provider, retention, training, link or operator. The #34 comment defers the links to the provider decision, but the current vendors' policy pages can be linked today.
- **Pastes run 1–5k characters** (#4 acceptance; #7 "pastes run 1–5k"). Her real thread is 18k (about 12k sanitized). The 8k per-message cap (B40, #35) rejects it, and the one-line input (#50) flattens it before it's even sent.
- **A 413 without Retry is enough recovery** (B41, #36). No Retry is right, but the cleared draft (#51) and the missing limit number turn one rejection into a scroll-and-guess. Her past behavior is "cut once, then leave."
- **Trim or summarise older turns** (B38, #7). For a paste-first user the oldest turn is the source. Trimming has to pin the first pasted message and squash the chat.
- **BYO key is a viable #34 option** (#34). Not for this ICP: she has no key, and the policy forbids pasting one.
- **Local folder, private repos and a local companion are blocked by the AI policy** (B10/B19/B20, icebox #33). They're blocked only while inference goes through OpenRouter. A self-hosted build with a company key is the one path she says could be work-legal.
- **The restyle raises trust enough to show the expert** (#42, live). She never shows Dana the app. Dana judges terms and wants Excel or Slack. The restyle helps Priya's own "weekend project" read, but it renders the notice as muted small print, the look she's trained herself to skip. The Netlify badge (#52) now covers Send on the phone. A named operator matters more than any of it.
- **Persistence is her top ask** (#5; interviews 01 and 02). It's still wanted, but for the next four weeks her calendar ranks paste capacity (#50, #35) and a pasteable table (#6) higher. This is a self-contradiction, so confirm it with a real practitioner.
- **Export is Markdown into Confluence and Miro** (#6 acceptance). This is the second time she's rebuilt a pasted table by hand (about 25 min). Rich text table first. Miro is gone (interview 02).

### Small slice suggestions

1. **Complete the notice with a linked data page.** Reopen #2, or a #34 follow-up.
   - *Smallest result:* the notice names the company behind the model (from server config), links "Data & retention" to one static page, and says "Built for sanitized text." The page names the operator, OpenRouter and the provider, and links each one's privacy and training policy, plus the OpenRouter logging setting the operator chose.
   - *Acceptance:* at 400px and 1280px the notice fits without a dialog, and the first reply isn't blocked. The notice text is body size and full ink colour, not the muted small style #42 gave it. Changing the configured model changes the named company. Every retention or training claim on the page links to that vendor's own policy page. Otherwise it isn't shown. "An AI model provider" no longer describes OpenRouter. Each of her five checklist items maps to a line on the page.
2. **A 413 that keeps the draft and names the limit.** Extends #51.
   - *Smallest result:* on a message over 8,000 characters, the draft stays in the input, and the message reads "Your message is N characters; the limit is 8,000." There's still no Retry.
   - *Acceptance:* paste 12,040 characters and send. The input still holds all 12,040 characters, the error shows both numbers, and there are 0 buttons in the entry. The server isn't called (413 in under 300 ms).
3. **Fit a sanitized thread: multiline input plus a pinned first paste.** #50 plus a B38 (#7) variant, before #4.
   - *Smallest result:* a textarea keeps line breaks. The per-message cap rises to fit about 12k within the 24k conversation budget. When the budget runs out, the first pasted message is kept verbatim and the later chat turns are shortened, with a one-line note under the reply.
   - *Acceptance:* paste a 12,000-character multi-line thread. The request body keeps the `\n`s and returns 200. Keep chatting until the budget is hit. The next reply quotes a detail from the first paste, the note says what was shortened, and no 413 appears.

### Questions for interview 04

- (A real platform engineer) Can an engineer at your company get a personal Anthropic API key? What would they be allowed to paste it into?
- (A real security reviewer) Here's a self-hosted repo that calls Anthropic with your company key. What's the review, and how long does it take?
- Did you run the Saturday test? Did it find the REBOOKED vs AMENDED split? What did you cut to make it fit?
- After Dana leaves on the 15th, what did you do with the questions only she can answer?
- Where did Dana's Slack-DM correction end up in the RFC? Who else read it?
- (Aisha, the PM, carried over) What did you prepare before your last finance meeting, and what did you bring back?
- If the notice said "Built for sanitized text," would you sanitize differently, or less? Show me the last thing you sanitized.
