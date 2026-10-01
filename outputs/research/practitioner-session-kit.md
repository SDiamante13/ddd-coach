# Practitioner session kit (#70)

Everything the owner needs to run one real session: one message, one 30-minute call, one follow-up a week later. Spec: #136. What the session must prove: [app-assessment.md](../app-assessment.md), "What remains unproved".

**What #70 measures**

1. **Used:** did they take the coach's question (or their edit of it) to a domain expert?
2. **Corrected:** what did they have to fix before they'd use it (rows, holders, guesses, the question's wording)?
3. **Came back:** did they open the coach again on their own, with the expert's answer or a new thread?

Synthetic interviews (Priya, Marcus) are hypotheses. This session confirms or kills them; don't steer it toward them.

**State of the hosted app** (check again on the day; this is true once #133 is live)

- Live: paste a thread, word swaps with a "What's sent" preview, events on the board, the Words lane ("Words that don't match"), the question card with the expert's lines, "I checked" (Yes, it holds / No, it's wrong / Couldn't tell, with "Where?"), Settle by, "Copy for your RFC", "Copy for your repo", `/data`.
- Live with #133: **Who's who**, for Slack- or notes-style pastes where speakers are people and rows are teams. When most rows have no source line, a one-time callout offers "Who's who · N people" or "Not now". The visitor puts each speaker on a team once ("Apply · find source lines" or "Skip"); rows then find their lines, and the strip collapses to "Who's who · N people [Edit]". It's kept in this browser until deleted (like "Your swaps"), never sent, and reused on later pastes.
- Off in production: the kept glossary (`GLOSSARY_ENABLED = false`, #100), so no "Keep these words", drift rows or "settled · not re-asked". Board corrections (`CORRECTIONS_ENABLED = false`, #95).
- Real threads can still get "Team unclear" rows and missing sources (#99). Expect it, and note what they do about it.

## 1. Outreach message

The target communities punish AI-written posts. Use this as a skeleton and rewrite it in your own words. Send it as a direct message, not a public reply. Never put the password in a public place.

> Hi, I saw your post about [the thing in their thread, e.g. ops and finance meaning different things by "booking"]. I've been building a small tool for exactly that spot: you paste a messy thread (Slack, an RFC comment chain), and it lays out the events, lists the words people use differently, and drafts one question to take to whoever knows the business.
>
> I'd like to watch one real person use it on a real problem. It's 30 minutes on a call, you share your screen, and I mostly stay quiet. You'd paste a thread from your own work with names swapped out (the tool does the swapping in your browser). You keep whatever it produces.
>
> Honest limits: it's an early prototype behind a password, it sends text to an OpenAI model through OpenRouter, and it may get things wrong. If your company's AI policy rules that out, we can use a made-up version of the thread instead.
>
> Up for it? Any time in the next two weeks works for me.

If they say yes, reply with: the link (`https://ddd-coach.netlify.app`), the data page (`https://ddd-coach.netlify.app/data`), section 2 below, and a time. Send the password in its own message right before the call, not with the link.

## 2. Consent and data (send before the call)

> **What happens in the session.** You share your screen for about 30 minutes and use the coach on a thread from your work. I take notes on what you do and what you say. I won't record unless you say yes now. I'll message you once, a week later, with a few questions. You can stop at any point, and you don't have to explain why.
>
> **What I keep.** My notes, with no company or people names. If I quote you in the project's notes, I'll quote words, not names, and you can ask me to remove anything.
>
> **Where your text goes** (full version at /data):
> - Your browser sends your message, with your swaps applied, to our server, which passes it to OpenRouter, which sends it only to OpenAI's API. No fallback to another provider.
> - OpenAI may keep messages and replies for up to 30 days in abuse-monitoring logs. OpenAI doesn't train on API data by default. OpenRouter doesn't store messages unless the account opts in, and ours doesn't.
> - Our server saves nothing you type. Its logs hold only error names and status codes.
> - Your browser keeps the conversation, the board, your swaps (with the real names) and Who's who (which team each person in your thread is on) until you clear them. Who's who is never sent either. That's also why a return visit needs the same browser.
>
> **Swap names before you paste.** Open "Your swaps" and add a swap for each real name: people, teams if they identify the company, customers, carriers, products, the company itself. Example: `[a colleague's name] → Ops lead`, `[a customer's name] → Customer A`. The coach sees the placeholders; your browser puts the real words back into the reply. Before you press Send, open **What's sent** and read it: that's exactly what leaves your browser.
>
> Swaps hide only the words you list. Rates, load or order IDs, contract terms and anything else you didn't list still go. Edit those out of the text itself.
>
> **Don't paste:** passwords, keys, tokens or URLs with credentials; customer personal data; contract figures or pricing; anything under NDA; code you're not allowed to share.
>
> **Your company's AI policy.** Many companies only allow approved AI tools for work material, and OpenRouter or OpenAI may not be on your list. Swapping names doesn't change that. If your policy rules it out, or you're not sure, use a fallback instead:
> 1. **Rewrite the thread from memory** with invented names and numbers. Keep the disagreement exactly as it was, since that's the part that matters.
> 2. **A public thread** from your field (a forum post or issue with the same kind of argument).
>
> Either is fine. Tell me which you'll use so I can note it.

Note for the owner: record which input they used (real sanitized / rewritten / public). A rewritten thread still tests the question; a public one barely tests "used with an expert". The app's "Try an example" is a last resort and doesn't count toward #70.

## 3. Session script (30 min)

Rules for the owner: don't pitch, don't explain the UI unless they're stuck for more than a minute, don't defend a wrong answer. When they ask "should I click this?", answer "What would you expect it to do?" Silence is fine. Read the prompts as written.

| Time | Step | What you say |
|---|---|---|
| 0–3 | **Setup** | "Thanks for doing this. I built it, so you won't hurt my feelings; the rough parts are what I need to see. Please think out loud as you go, even half-thoughts. Is it OK if I take notes? [Recording, only if they agreed in writing.]" Confirm which input they're using. |
| 3–7 | **Warm-up** | "Tell me about the thread you picked. Who's in it, and what's the disagreement?" · "The last time a thread like this didn't get settled, what happened next?" |
| 7–11 | **Swaps and paste** | "Here's the link and the password. Set it up the way you would if I weren't here." If they skip swaps on real material: "Before you send, is there anything in there you'd want hidden?" (Once. Then let them decide.) |
| 11–20 | **Read the reply** | Say nothing while they read. Then, only as needed: "What are you looking at now?" · "What do you make of that?" · "Anything there you'd disagree with?" · "What would you do next?" |
| 20–24 | **The key moment** | "If this were a normal workday, what, if anything, would you do with what's on the screen?" Then wait. If they mention the question: "What would you do with it? Would you change anything first?" If they don't: don't bring it up. Note that. |
| 24–28 | **Their own docs** | "Where, if anywhere, would any of this normally end up?" Only if they name a place: "Go ahead and put it there, the way you normally would." Watch "Copy for your RFC" into their real Confluence (or doc), and "Copy for your repo". If something on the board is already settled for them: "Is any of this something you already know the answer to?" (that's where "I checked" may come up; don't point at it). |
| 28–30 | **Close** | "When you need an answer from someone who knows the business, how does that usually go?" · "What was the most useful part, if any? What would stop you using it?" · "Can I message you in a week to ask what happened next?" Thank them. Stop. |

**After the main task only, if there's time**, ask from this list (one or two, neutral wording). Skip any that depend on a feature that's off on the day.

- "Where does your team keep meanings it has agreed on today? How, if at all, would that fit with this?" (#6, #113 round-trip)
- "When you talk to the expert, how do you usually capture what they say?" (#112: typing vs dictating)
- Glossary probes (drift row as a finding, "settled · not re-asked" as trust) only if `GLOSSARY_ENABLED` is on in production that day. Otherwise skip them; don't show the Exploration 08 mockups during the session.

**Don't say:** "Isn't the question useful?", "Would you take this to your expert?", "Did you notice the Words lane?", "Did you see the question?", "Try Copy for your RFC", "Who's who" or "map the speakers" (let them find it or not), "Most people like…", naming any on-screen control before they do, or any explanation of what DDD says they should do.

## 4. Observation sheet

Copy this per session. Note times from the call start. Write what they do and say, not what you think it means; interpret afterwards.

**Session:** date · input (real sanitized / rewritten / public) · role and domain (no names) · recorded? (y/n)

| Watch for | Notes |
|---|---|
| Time to first Send (from link) | |
| Swaps: how many, which kinds, did they open "What's sent"? | |
| Anything sensitive that went out anyway (note the kind, not the content) | |
| Did they read the whole reply, or skim to one part? Which part first? | |
| Where they hesitated (time, what was on screen, what they said) | |
| What they said was wrong: rows, holders ("Team unclear"), guesses, missing sources | |
| What they changed in the question before using it (quote the before/after) | |
| What they copied, and where they pasted it (RFC, Confluence, repo, Slack) | |
| Did the pasted result need fixing in their doc? What? | |
| "I checked": used unprompted? Which answer? | |
| Who's who: did the callout show? Opened, "Not now", or ignored? Teams they picked; source lines found | |
| Questions they asked you | |
| Exact quotes worth keeping (no names) | |

**Signals for #70** (fill after the call, then after the follow-up)

| Measure | Strong | Weak | Kill |
|---|---|---|---|
| **Used** | Took the question to an expert within a week, unprompted at the call | Said they would, didn't yet | Said the question wasn't one worth asking, or they already knew it |
| **Corrected** | Fixed 0–2 things and used it | Rewrote the question substantially, then used it | Too wrong to use, or they stopped reading |
| **Came back** | Opened it again with the expert's answer or a new thread | Opened it once to look | Didn't, and didn't plan to |

Record the counts too: corrections made, items copied, minutes to first useful reaction (their words, not yours).

## 5. One-week follow-up

Send it 7 days after the call, by the same channel. Keep it short; they owe you nothing.

> Hi, thanks again for last week. Four quick questions, answer any or none:
>
> 1. Since the call, did you take that question (or something like it) to anyone? What happened?
> 2. If you did: what did they say, and how did you capture it?
> 3. Did you open the coach again? What for?
> 4. Is anything from the session in a doc, RFC or the repo now? Did it need fixing?
>
> If you didn't do any of that, that's a useful answer too.

If they answer 1 with "yes", ask one more: "Was it the coach's question, your edit of it, or a different question?" Record answers against the signals table above. Then write a short result note in `outputs/research/` and comment on #70 with the outcome per measure.
