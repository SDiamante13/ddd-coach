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

Last interviewed demos: `slice-02a.md`, `slice-42.md`

## Queued for interview 04

Split it like 03: **04a** covers the built paste-box slice with Exploration 04 and the Sunday replay. **04b** covers Explorations 03 and 02b. The trigger is the paste-box slice demo.

- The "questions for interview 04" sections in 03a and 03b.
- **Design Exploration 03, "Leave with a table"** (`outputs/design/explore-03/`: stills t1-what-leaves → t2-table → t3-next-step → t4-in-rfc, `explore-03-2.5x.mp4`, `table.html`). Probes:
  1. Would the table survive Dana's and finance's review as-is? What would she retype? Anchor: the last table she pasted into the RFC.
  2. Is "Status" the right column name, or does it confuse people reading the doc?
  3. Does "Ops is split" feel safe to put in a doc that Ops will read?
  4. Does "Show what's sent" together with her own swap list change what she pastes?
- Any 02b, notice-weight or too-long-paste concepts the DESIGNER delivers before the next demo.
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
