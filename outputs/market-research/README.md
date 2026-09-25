# Market research: synthetic ICP interviews

After each completed slice, the loop runs one synthetic interview with the [ICP avatar](icp-avatar.md). A slice counts as complete when a new `outputs/demos/slice-NN.md` is committed.

Each interview ships as a transcript `.md` plus a styled `.html` page (EventStorming sticky palette; reuse interview-01 as the template).

**Rule (2026-09-25, agreed with PO, #70):** synthetic interviews test only new concepts or deployed slices, never repeat rounds on the same concept. The table design (#6) is frozen until one real-practitioner session after #4 and #6 ship.

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
| 5c | concept: Exploration 03c, before #6 | [md](interviews/interview-05c-explore-03c.md) · [html](interviews/interview-05c-explore-03c.html) | 6 ok / 7 stale / 5 missing; retyping ~7 min (from 8), but now hunting wrong content; split row → two credited rows with loads; one check must update the cell, the question and Dana's line |
| 6 | 03 (#4 paste → disagreements) + Explorations 06, 05b | [md](interviews/interview-06-after-slice-03.md) · [html](interviews/interview-06-after-slice-03.html) | Win condition partly met: run 1 asked a question she'd missed, run 2 proposed an answer; tie with Claude broken for the question only ('one tab, one job'); reused the move unprompted but can't name it; view A/B unstable; notice still 1.5/5; #68 not fixed |
| 6b | 41 (conference password gate) | [md](interviews/interview-06b-after-slice-41.md) · [html](interviews/interview-06b-after-slice-41.html) | A slide password is 'a room key, not an account'; nobody has a thread at a meetup, so 'Try an example' (#63) is now a yes; rotating the password after the conference breaks the 90-day promise; hitting the spend limit shows a generic error |
| 7 | 63 (prompt v8, 3 real replies, 'Try an example') | [md](interviews/interview-07-after-slice-63.md) · [html](interviews/interview-07-after-slice-63.html) | #73 partly fixed: views stable 3/3, win condition 2/3 (run 2 is a ruling); #77 in 1/3, medium impact; 'if the question hasn't got a load in it, it's the wrong run'; #63 yes as a free sample |

Last interviewed demos: `slice-02a.md`, `slice-42.md`, `slice-37.md`, `slice-50.md`, `slice-03.md`, `slice-41.md`, `slice-63.md`

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

## Queued for interview 08 (trigger: the #85 / prompt v11 slice demo)

- **#77 group-named views (U2), from real replies.** Does the plain "Ops" ambiguity go away? Are the group names in her words?
- **#85:** the question shows its two source lines. Does that make it checkable, and does it change what she copies?
- The new hard checks: does every real run's question name a concrete case? Does any "should X or Y" ruling slip through?
- Build order after #77 (from the PO): #56 sanitizing → #64 structured reply → #6 export → #58 knowledge base → #8 streaming. Test each deployed slice with the solo ICP.
- **The PO's option-B probe:** in a real reply where Ops is split on some words, a plain "Ops" line appears where the groups genuinely agree (e.g. booking = the portal submission). Does she read it correctly as all of Ops, or does it confuse her next to the named groups? This decides prompt option B (always name the groups once a team is split). Use a real reply if one exists; otherwise note that it was constructed.
- **#56 swaps (live):** does the swap list cut her ~15 minutes of sanitizing? Is it built from past behavior on her real thread?
- **#66 scroll fix (live):** after sending, a reply or a failed-send alert with Retry comes into view.
- **Length check:** on a 400+ word v8 reply, ask "Where did you stop reading?" and "Where's the question?" Interview 06 says length is fine without advice, but it was never probed directly.
- #70 (a real practitioner with a real thread) remains the top research ask. Don't spend its questions on the persona.
