# Market research: synthetic ICP interviews

After each completed slice, the loop runs one synthetic interview with the [ICP avatar](icp-avatar.md). A slice counts as complete when a new `outputs/demos/slice-NN.md` is committed.

Each interview ships as a transcript `.md` plus a styled `.html` page (EventStorming sticky palette; reuse interview-01 as the template).

Synthetic interviews generate hypotheses, not evidence. Promote an insight only after a real practitioner confirms it.

## Log

| # | After slice | Interview | Top takeaway |
|---|---|---|---|
| 1 | 01 (slice 2 code landed, no demo yet) | [md](interviews/interview-01-after-slice-01.md) · [html](interviews/interview-01-after-slice-01.html) | Value = facilitator questions + disagreement surfacing from pasted mess; needs persistence across reload, export, data-flow notice; voice-at-desk doubtful |
| 2 | 02 + Design Exploration 01 | [md](interviews/interview-02-after-slice-02.md) · [html](interviews/interview-02-after-slice-02.html) | Slice 2 moved none of her asks; AI policy (Claude Enterprise + Copilot only) blocks OpenRouter for real work; term map = RFC glossary; "Dana said" risks misquoting the expert |
| 3a | 02a + Explorations 01b, 02 | [md](interviews/interview-03a-design-explorations.md) · [html](interviews/interview-03a-design-explorations.html) | 01b fixed 13/15; rich-text table copy still missing; anonymising ≠ policy fix; carry the board, not a summary; team labels hide disagreement within a team |
| 3b | 02a (hosted) + #42 restyle | [md](interviews/interview-03b-after-slice-02a.md) · [html](interviews/interview-03b-after-slice-02a.html) | Notice meets 1.5/5 checklist items; 8k cap + one-line box break her first paste; BYO key impossible (chat-only Enterprise, keys in Vault); restyle makes notice look like cookie small print; fit paste + table beat persistence this month |
| M1 | stakeholder (influencer/blocker, not ICP) | [md](interviews/interview-m01-marcus-influencer.md) · [html](interviews/interview-m01-marcus-influencer.html) | Wants checkable sources per row (ticket/load/permalink); doubt labels are credible if owned + dated; Evans backs definitions only; rejects 'ubiquitous language', 'context map' |
| 4b | 37 + Explorations 03, 02b, #58, Marcus claims | [md](interviews/interview-04b-after-slice-37.md) · [html](interviews/interview-04b-after-slice-37.html) | Table cuts fix-up time from ~25 to ~10 min; rename Status → Source; a stale correction resurfaces; carried board dropped TONU again; 'Reload to start a new one' error would make her throw away her work; no books in the export |
| 4a | 50 (paste box, #50/#51/#57/#61/#62) | [md](interviews/interview-04a-after-slice-50.md) · [html](interviews/interview-04a-after-slice-50.html) | Sunday replay: 5 fixed / 3 partly / 2 broken, all waiting on #4; nothing lost but the 8k cap picks which team the coach hears; reply 'a waiter, not a facilitator'; Clear kept the follow-up, not the thread; notice still 1.5/5 |
| 5 | concepts: Explorations 03b, 02b, 05 + #58 citation toggle | [md](interviews/interview-05-concepts-03b-02b-05.md) · [html](interviews/interview-05-concepts-03b-02b-05.html) | 03b fixed columns, not stale cells; Copy table drops the settle-by line and open questions; learning check passed when prompted (weak); drop the citation toggle: citations always in replies, never in copies |

Last interviewed demos: `slice-02a.md`, `slice-42.md`, `slice-37.md`, `slice-50.md`

## Queued for interview 04

Split it like 03: **04a** covers the built paste-box slice with Exploration 04 and the Sunday replay. **04b** covers Explorations 03 and 02b, #58 and the Marcus claims; it is concept-only, so it ran early on the slice 37 demo. **04a** still waits for the paste-box demo.

- The "questions for interview 04" sections in 03a and 03b.
- **Design Exploration 03, "Leave with a table"** (`outputs/design/explore-03/`: stills t1-what-leaves → t2-table → t3-next-step → t4-in-rfc, `explore-03-2.5x.mp4`, `table.html`). Probes:
  1. Would the table survive Dana's and finance's review as-is? What would she retype? Anchor: the last table she pasted into the RFC.
  2. Is "Status" the right column name, or does it confuse people reading the doc?
  3. Does "Ops is split" feel safe to put in a doc that Ops will read?
  4. Does "Show what's sent" together with her own swap list change what she pastes?
- Any 02b, notice-weight or too-long-paste concepts the DESIGNER delivers before the next demo.
- **#61, the new error copy** ("Copy the conversation", then "Start a new one"), shipping with the paste box. Does it stop her throwing away her work?
- **The PO's test: replay her Sunday attempt end to end** on the paste-box slice. Paste the 12k sanitized thread (multiline, speaker lines intact), hit the limit, and see whether the draft is kept and the limit stated. Does the reply attribute Tom's line to finance? Is there a purpose line and placeholder (#57)? Would she still switch to company Claude?
- **Design Exploration 04, "Paste box"** (`outputs/design/explore-04/`: stills p1-first-visit → p2b-replied → p3-too-long → p4-two-parts, p5-phone, `explore-04-2.5x.mp4`, `pastebox.html`). Pair it with the Sunday replay. Probes:
  1. Does the notice now read as content, not a banner? Which of her 5 checklist items does it meet?
  2. At "Your text stays here · 1,412 over": trim, or send in two parts? Does she trust that the coach waits for part 2 before replying, and that two parts don't use up the conversation cap?
  3. Is the example placeholder enough, or does she click "Try an example"?
- **For 04b: the #58 DDD knowledge base, grounded in real sources.** The PO's probes:
  - (a) Does a citation like "Evans, DDD Reference: Bounded Context" raise her trust, or is it noise? Anchor: the last time she cited a book in a doc or meeting. She said "bounded context" in planning and got "so, a folder?"
  - (b) Which source would Marcus (the skeptical staff engineer) respect?
  - (c) Should the coach teach DDD terms, or stay in her words? This is in tension with "no jargon." Does the answer change between her prep and the exported doc?
- For 04b, test Marcus's claims with Priya: a link per row, a "what the code does" row, and who settles a split and by when. Marcus is not the ICP, so only Priya's answers re-rank anything.

## Queued for interview 05

- **Exploration 03b** (DESIGNER, in progress): Source column with plain-text references, "Code" as a Team value, one "settle by 27 Oct" date, corrections replacing old notes everywhere, no DDD terms she didn't type. Check it passes "nothing missing, nothing stale".
- **02b, revised after 04b** (`outputs/design/explore-02b/limits-v2.html`): TONU kept, stale AMENDED note removed, notice visible. Quick check only: did the carried board keep everything?
- Stills are ready. 02b: `outputs/design/explore-02b/b1.png` → `b7.png` plus `explore-02b-steps.mp4`. 03b: `outputs/design/explore-03b/c1.png` → `c5.png` plus `explore-03b-steps.mp4`. Each state reproduces with `?state=N`, served from the repo root.
- **Design Exploration 05, "Why this question?"** (`outputs/design/explore-05/`: why.html, stills w1 → w4, explore-05-steps.mp4). The first test of the project's **learning** goal. Probes:
  1. When did she last learn a technique in the middle of real work, and from what?
  2. Would she open "why" at all, or only when a question surprises her?
  3. Would she show technique names when working alone and hide them when Marcus might see her screen?
  4. After using it, can she name or reuse one move herself? This is a light check that learning actually happened, not just a preference.
- Tooling: `agent-browser` and headed Chrome screenshots hang on this machine. Use `npx -y playwright@1.63.0 screenshot --channel chrome …` (headless) over `python3 -m http.server`.

## Queued for interview 06 (trigger: the slice 3 / #4 demo)

- **The win-condition test for #4:** she pastes her whole 12k thread (no trimming, once the cap is raised). Does the coach ask ONE question she wouldn't have thought of, drawn from the whole thread, with no "would you like me to…" offers? Compare directly with her company Claude's answer. Does the tie break?
- #68: after starting over, is her last pasted thread restored?
- #66: are the refusal buttons visible without scrolling?
- The model changes to gpt-6-luna at this deploy. Note it, but judge the reply, not the model.
- The "questions for interview 05" sections in 04a and 05.
- **The learning metric (#26): "reuses a move unprompted".** Watch the transcript for her using a coaching move on her own, without being asked. Record yes or no with the quote.
- **Design Exploration 06, "Structured reply"** (`outputs/design/explore-06/structured.html`, stills s1–s3; #64): slice 3's fixed reply layout shown as real lists and a table. A quick look alongside the #4 demo.
- **Design Exploration 05b, "Why this question?" v2** (`outputs/design/explore-05b/why-v2.html` ?state=1..3, stills v1–v3, `explore-05b-steps.mp4`): each move shown once in a visible line, an always-visible source line on the coach's DDD claim, technique names only inside "why", no toggle, the hotspot paraphrase corrected. **Learning retest (delayed recall):** open by asking, without showing the line, whether she can name or apply "ask about one real case" from interview 05. Then check the corrected source line against her spot-check.
