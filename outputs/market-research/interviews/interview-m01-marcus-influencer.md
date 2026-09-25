# Synthetic stakeholder interview M01: Marcus, staff engineer (influencer / blocker)

*Synthetic interview. Treat every point as a hypothesis until a real staff engineer confirms it.*

> **Influencer / blocker, not the ICP.** Marcus is the reviewer Priya has to convince, not the person the product is built for. His answers can shape how the exported artifact reads, what it cites and what it must never do. **They never re-rank the backlog on their own.** Any change he suggests needs a matching signal from Priya (the ICP) before it moves an issue.

Thursday 8 October 2026, three days after Priya's interview 03a. Her Booking-split RFC is due 30 October. Marcus hasn't opened it yet. Shown: Exploration 03 stills `t2-table.png` (the "Words that don't match" table with a Status column) and `t4-in-rfc.png` (the same table pasted into an RFC's "4. Glossary" section). Told plainly that they are a concept, not built, and that this is roughly what Priya might paste into her RFC. Also told, in one sentence, that the coach may be grounded in Evans's *DDD Reference* (2015, CC BY 4.0) and cite it by section.

**Marcus, as built for this interview:** staff engineer, about 15 years in. Owns the reliability of the Rails monolith and sits on architecture review. He's watched two microservice splits fail: an order-service split at a previous job (2017) that ended as twelve services on one database, and the carrier-integrations extraction here (2020), merged back into the monolith in 2022 after every carrier change needed two deploys. Known from Priya: he said "so, a folder?" when she said "bounded context"; he calls DDD "enterprise astronaut stuff"; the last-ten-tickets spreadsheet is the one thing that moved him.

## Transcript

**Q:** Think of the last design doc from someone else that you dismissed quickly. What made you stop reading?

**Marcus:** The notifications RFC from platform, back in August. Page one was a box-and-arrow diagram with "Notification Context" and "Customer Context" and an anti-corruption layer between them, and no number anywhere. I scrolled for the part that says what breaks today, didn't find it, left one comment asking "What incident does this prevent?" and closed the tab. That was maybe three minutes. <mark>If a doc can't tell me what hurts now, the diagram is decoration.</mark>

**Q:** And the last one that changed your mind. What was in it?

**Marcus:** Priya's spreadsheet, honestly. She took the last ten Jira tickets that touched booking and marked which tables and which team's code each one changed. Eight stayed inside the line she'd drawn, and the two that didn't were both rebook tickets, which were also our two double-invoice P2s. She had a "not sure" column with two rows in it. <mark>The "not sure" column is why I believed the other eight.</mark> I went in thinking "don't split," and I came out thinking "maybe split, but not where I assumed."

**Q:** Which sources or citations would you respect in a doc Priya shares? Evans's *DDD Reference*, say, against Fowler's bliki, against our own incident data.

**Marcus:** Incident data first, then tickets, then the code, then everything else a long way behind. I've linked Fowler's "MonolithFirst" and "Microservice Premium" posts in reviews myself, twice this year, because they argue about the cost of splitting. Evans I've half-read, years ago. The first half was good, and people mostly quote the second half. A footnote like "Evans, DDD Reference: Bounded Context" is fine if it's defining a word. <mark>If it's there to tell me where our boundary goes, it hurts, because a book can't know our invoice table.</mark>

**Q:** Does a citation like that help or hurt if the tool wrote it?

**Marcus:** It depends whether the section exists. The first thing I'd do is open the PDF and check. If the tool cites a section that isn't there, or paraphrases Evans into saying something he didn't, I'm done with the tool, and a bit done with the doc. If it's accurate and it only defines the word, it costs me ten seconds and I move on.

*(Shown `t2-table.png`, then `t4-in-rfc.png`.)*

**Q:** Here's what Priya might paste into her RFC. What would make you dismiss this in ten seconds?

**Marcus:** It passes the first ten seconds, which surprised me. It's called "Glossary," not "Ubiquitous Language," and it's a table, not a map. What nearly lost me is "From thread" in the Status column. Which thread? <mark>"From thread" with no link is "trust me" with better formatting.</mark> If every row said "confirmed," I'd have dismissed it, because nothing about booking is confirmed.

**Q:** What in it would you actually read, and what would you check?

**Marcus:** The Rebook rows, because those are our P2s. I think the rebook code sets REBOOKED on the old row and inserts a new booking, which would make finance's "cancel plus a new booking" what the code actually does, and ops's version what ops believes. I'd have to look; I haven't read that method in a year. <mark>If that's true, it's the most important finding here, and the table doesn't have a row for "what the code does."</mark> TONU I'd check straight away, because it names load 48213 and I can open that in two minutes. That's also why I trust that row more than the "From thread" ones.

**Q:** Some DDD words. For each, tell me accept, accept if defined, or reject, and why: bounded context, ubiquitous language, aggregate, domain event, context map, anti-corruption layer.

**Marcus:** "Aggregate" I accept. It's a consistency boundary, what gets locked in one transaction, and I use it myself, though people misuse it to mean "big class." "Domain event" I accept, because we have Kafka and an event is an event. "Bounded context" only if the next sentence says which code, which tables and which team, because otherwise it really is a folder. "Anti-corruption layer" only if defined: it's an adapter, I've written three, and the name sounds like a verdict on the other team. <mark>"Ubiquitous language" I reject; call it a glossary, because nothing here is ubiquitous, and that's the whole problem.</mark> "Context map" I reject too; it's the diagram I stopped reading at in August, so draw who calls whom and call it a dependency graph.

**Q:** If the table says "Status: unconfirmed" or "Ops is split," is that a strength or a weakness?

**Marcus:** A strength, and it's the most believable cell on the page. It's the "not sure" column again. It turns into a weakness if half the rows say it three weeks before the decision, because then it's a research plan, not a design, and the RFC should say so. <mark>What I'd want next to "Ops is split" is who breaks the tie and by when.</mark> "Dana to confirm" is close, but Priya tells me Dana's out from mid-month.

**Q:** What would an AI-assisted artifact need to show for you not to discount it as "ChatGPT output"?

**Marcus:** I'll assume AI helped anyway; most docs I review now had some. Last month I bounced a PR whose description said "adds tests for the retry path," and there were no tests, which is exactly the kind of thing a model writes. <mark>ChatGPT output is never wrong in a way I can check. So give me things I can check: a ticket, a permalink, a load, a line of code, on every row.</mark> And I want to see what Priya changed. If she tells me a tool helped, fine; if I find out afterwards, I reread everything.

**Q:** What would make you ask Priya to keep going with this approach?

**Marcus:** Run the spreadsheet again on the next ten booking tickets, after the glossary's done. If the terms predict which team's code each ticket touches, I'll stop calling it a folder, and I'll say so in review. Second, the finance review of the RFC. If finance and ops read the Rebook rows and the argument is about the facts rather than the word, the glossary did its job. <mark>And if the answer turns out to be "don't split, rename three things," I want the tool to be able to say that.</mark>

**Q:** Anything else?

**Marcus:** A few things. In architecture review, the first thing I'd ask isn't about DDD. It's where our Slack went, because our policy says approved vendors only, and I'd ask that before I read a single row. Second, don't build this for me. <mark>I'm the one who says no, not the one who does the work, and a tool built for me would be a spreadsheet generator.</mark> And if it gets decided, the decision goes in the repo as a Markdown ADR, not in Confluence; I merged the last two.

---

## Interviewer notes (out of character)

> **Reminder: influencer / blocker, not ICP.** None of these insights re-ranks an issue by itself. Each one names what to check with Priya before it can.

### Key insights

1. **Evidence he can open beats any authority, and "From thread" with no link reads as "trust me."** Past behavior: he closed the notifications RFC after three minutes for having no number; Priya's ten-ticket spreadsheet moved him. The TONU row, which names load 48213, is the one he trusts, because he can check it in two minutes. [influencer signal] [strong]
2. **Visible uncertainty is the most credible part of the table, if it names who resolves it and by when.** The spreadsheet's "not sure" column is why he believed the other eight rows (past behavior). "Ops is split" is a strength; "Dana to confirm" is weak once Dana is away from mid-October. Many rows marked unconfirmed close to the decision would mean a research plan, not a design. [influencer signal] [strong]
3. **Evans citations help only as definitions, and a wrong citation is fatal.** He'd open the PDF to check the section. A citation that seems to decide *their* boundary hurts. He respects Fowler's bliki more, because it argues about the cost of splitting, and he has linked those posts in reviews twice this year (past behavior). [influencer signal] [weak: the Evans reaction is hypothetical; the Fowler links are past behavior]
4. **The table lacks a row for "what the code does," and that may be the real finding.** He believes the rebook code inserts a new booking, which would match finance and not ops. He says he'd have to check. An artifact that places code next to team meanings would speak directly to him. [influencer signal] [weak: unverified recollection, hypothetical use]
5. **He'll assume AI helped, and he discounts anything he can't verify.** Past behavior: he bounced an LLM-written PR description that claimed tests that didn't exist. His bar is a checkable source on every row, plus visibility of what the human changed. Undisclosed AI use makes him reread everything. [influencer signal] [strong]
6. **In review, his first question is where the data went, not the jargon.** Approved vendors only (Claude Enterprise and Copilot, per Priya). This is the same vendor block Priya hit, now coming from the reviewer's side. [influencer signal] [weak: hypothetical, but consistent with Priya's policy facts]

### Touches #58 / #59 / #6

**#58 (knowledge base grounded in Evans's DDD Reference)**
- Citations belong in the coach's replies to Priya, where they guard against hallucinated rules. Keep them out of the exported table by default. Marcus reads "Evans says" in an RFC as an appeal to authority.
- Two kinds of claims need two kinds of source. A definition ("bounded context means…") cites Evans by section. A claim about *their* system ("rebook creates a new booking") must cite her evidence: a ticket, a permalink, a load or code. It must never cite Evans.
- Add an acceptance check: every cited section title exists verbatim in the Reference text in `server/knowledge/`. One phantom section loses the reviewer for good.
- The existing "say so when the sources don't cover it" criterion matches what Marcus respects. Keep it.
- Out of scope for #58, and not a re-rank: he'd trust a coach that can conclude "don't split." Check with Priya whether that's a prompt stance she wants.

**#59 (copyright: CC BY sources plus our own paraphrased notes)**
- Nothing Marcus said argues for chasing permission for paid books. He's half-read Evans and doesn't cite Khononov, Vernon or Brandolini. The PO recommendation stands.
- The source he does respect, Fowler's bliki, isn't CC BY, as far as we know. It can't go in the knowledge-base text. It can go in *our own paraphrased notes*, cited by title with a link, especially the cost-of-splitting counterweight ("MonolithFirst," "Microservice Premium"). That keeps the coach from reading as a DDD cheerleader. Verify the bliki's license before any quote.
- The notes should include a "when not to split" section written by us, so the rule "only CC BY plus our notes" doesn't produce a one-sided coach.

**#6 (export: rich-text table plus Markdown fallback)**
- The Status column needs a *link*, not just a label. "From thread" should carry a Slack permalink or a ticket ID that survives the paste as a hyperlink in rich text and as `[text](url)` in Markdown. Check with Priya that she has permalinks to give.
- Headings and labels stay plain: "Glossary," "Words that don't match." No DDD term in the table's header, title or first row.
- The Markdown fallback has a second audience. Decided designs land as Markdown ADRs in the monolith repo, so the fallback must be a clean GitHub-flavored table with links intact, not just "good enough for a plain-text editor."
- "Ops is split" and "unconfirmed" must survive the export (t4 already folds "split" into the Meaning cell). Consider an optional "resolves by / who" note beside them.
- Idea, not a re-rank: a "Code" row or team, meaning "what the code does." Only if Priya says she'd fill it.

### Jargon verdict

| Term | Verdict | Why (his words, condensed) |
|---|---|---|
| Aggregate | Accept | "A consistency boundary, what gets locked in one transaction." Warns it's misused as "big class." |
| Domain event | Accept | "We have Kafka and an event is an event." |
| Bounded context | Define first | Only if the next sentence names the code, tables and team. "Otherwise it really is a folder." |
| Anti-corruption layer | Define first | "It's an adapter, I've written three." The name "sounds like a verdict on the other team." |
| Ubiquitous language | Reject | "Call it a glossary. Nothing here is ubiquitous, and that's the whole problem." |
| Context map | Reject | "The diagram I stopped reading at." Say "dependency graph: who calls whom." |

### 10-second dismissal triggers

- A DDD term as a heading or in the first screen ("Ubiquitous Language," "Context Map," "Bounded Context").
- A box-and-arrow diagram before any incident, ticket or number.
- No statement of what breaks today.
- Status or source cells that can't be opened ("From thread" with no link).
- Every row "confirmed," with no visible uncertainty.
- A book citation used to justify *their* boundary.
- A citation to a section that doesn't exist, or a paraphrase the source doesn't support.
- A conclusion of "split" before the evidence, with no room for "don't split."
- AI help he discovers afterwards rather than being told.

### Questions to test with Priya next

- When you showed Marcus the ten-ticket spreadsheet, how did you send it (link, paste, screenshot), and what did he reply to first?
- Your "From thread" rows: could you give each one a Slack permalink or ticket ID today? How long would it take?
- Have you ever cited a book or a blog post in an RFC? Which one, and did anyone react?
- Where do decided RFCs end up: Confluence only, or an ADR in the repo? Who writes the ADR?
- Would you add a "what the code does" row? Have you already checked the rebook code path?
- Has anyone raised the AI policy in architecture review yet, for any doc?
- (A real staff engineer) Show t4 cold. Ten-second reaction, then: what would you open first?
