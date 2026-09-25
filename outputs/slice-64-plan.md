# Slice 64 (#64): render the coach's events, words and question as real structure

The spec is issue #64's body plus the designer's comment: `outputs/design/specs-64-66-68.md` "#64", with the prototype `outputs/design/explore-06/structured.html` (stills s1 complete, s2 cut at the cap, s3 off-layout lines and markup). This plan adds the verified facts, the decisions, the test order and the demo. **Build waits for #56 to land** (#56 touches `src/ui` MessageForm and the swaps panel).

In one line: a coach reply in the fixed layout shows as an ordered events list with source chips, a Word | Team | Meaning | Source table, and the question as a card set apart at the end. Everything is parsed line by line from the text the model already writes and rendered as text nodes only. Any line the parser doesn't recognise stays, in order, as plain text.

## Goal fit

- **Real DDD problem (ICP):** Priya's domain expert "would skip to the questions and ignore the rest" (02/06). She copies the word table into her RFC (#6), and interview 07 has her triaging runs by the question alone. A question card and a real table serve skimming without cutting words.
- **One model, three uses:** the parsed structure (`ReplyBlocks`) is the domain type that #6 export and #7 carry-over will consume. This slice builds it and renders it. Export and carry-over stay in their own issues.
- **Safety:** no markdown or HTML rendering, so pasted `<img onerror>` or `**bold**` stays literal text (the spec's s3).
- **Learning:** a pure, total parser (every input line lands in exactly one block) with a discriminated-union type, plus a property test that nothing is dropped.
- **DDD proportionality:** one pure domain module and a few presentational components. No server, contract or prompt change.

## Verified facts (main at `9a13b6f`, 2026-09-25)

**The reply today**
- `ExchangeOutcome` renders a replied exchange as `<p>{exchange.reply}</p>`: React text, `white-space: pre-wrap` (`base.css:78–83`).
- The "Coach" label is CSS on `ol[role="log"] > li > p:nth-child(2)::before` (`base.css:93–111`). A structured reply no longer sits in that `<p>`, so the label needs its own element (D4).
- A cut reply ends with `CUT_SHORT_NOTE` = `(Cut short at the length limit. Say "continue" for the rest.)`, appended by `server/replyEnding.ts` after trimming to the last complete line (`src/shared/chatContract.ts:15`).
- The history and signature use `exchange.reply` verbatim, and so does Copy conversation (`conversationText`). Rendering must never change the stored text.

**The layout and its parser**
- Prompt v10 (live after the current deploy) writes:
  - `Events, in order`, then `N. From thread|Guess: …`;
  - `Words that don't match`, then `"word"` lines, then `- From thread|Guess: <Holder> means …` lines. Holders are a team, `Team (group name)`, `Code` or `Team unclear`. Code lines use other verbs ("Code counts every row…");
  - `Question for <roles>[, at <forum>]: <question>?`.
- Non-thread replies (greeting, DDD question, short note) and follow-ups are plain prose with no layout.
- The only parser is `server/eval/replyLayout.ts`: `parseLayout` and `parseCoachReply`, plus the shared regexes `EVENTS_HEADING`, `WORDS_HEADING`, `QUESTION`, `QUOTED_WORD` and `SOURCE_LABEL`.
  - It lives under `server/eval/`, so `src/` can't import it without crossing the client/server line.
  - `parseCoachReply` returns `null` for anything out of order and drops off-layout lines. That's right for scoring and wrong for display.
- The recorded v10 replies (`outputs/evals/slice-03/ab-2026-09-25-openai-gpt-5-6-terra-v8-v10.json`, 42 per arm) are real inputs for $0 parser checks.

**Design:** the spec and prototype in `outputs/design/`:
- events as an `<ol>` with source chips;
- "Guess" chips dashed, in `--color-warn`;
- a Word / Team / Meaning / Source table, with the word on its first row only and a heavier rule between words;
- a question card with "Question for …" in small caps;
- a dashed cut-short note.

## Decisions

### D1. Make the change easy: move the layout vocabulary to `src/shared` (`r` commit)
- Move `server/eval/replyLayout.ts` to `src/shared/replyLayout.ts` unchanged, and point the eval imports at it. It's pure, with no secrets, like `chatContract.ts`.
- **Guard:** `rescore` of the v8-v10 A/B JSON and of the v8 full eval gives byte-identical output before and after. All tests stay green.

### D2. `ReplyBlocks`, a pure, total parser (`src/domain/replyBlocks.ts`)
- **Types:**
  ```ts
  type Source = "From thread" | "Guess";
  type Claim = { source: Source; text: string };
  type Meaning = { source: Source; holder: string; meaning: string };
  type ReplyBlock =
    | { kind: "events"; items: Claim[] }
    | { kind: "words"; rows: { word: string; meanings: Meaning[] }[] }
    | { kind: "question"; roles: string; text: string }
    | { kind: "cut" }
    | { kind: "text"; text: string };
  parseReply(reply: string): ReplyBlock[]
  ```
- **Line by line:**
  - a heading opens its section;
  - lines that match the section's pattern join it;
  - any other non-blank line becomes a `text` block, in place;
  - blank lines separate `text` paragraphs;
  - the question line becomes a `question` block wherever it appears;
  - a line equal to `CUT_SHORT_NOTE` becomes `cut`.
- **Total:** every non-blank input line appears in exactly one block. That's a property test: concatenating the lines a block list was parsed from reproduces the input's non-blank lines in order.
- **Meaning split (U3):**
  - `holder` is the text before the first " means " or " mean " within the first six words, so "Ops (night shift)", "Carriers" and "Team unclear" come out right;
  - otherwise, a leading "Code" or "Team unclear" is the holder and the rest is the meaning ("Code counts every row…" becomes holder "Code", meaning "Counts every row…");
  - otherwise the holder is empty and the whole claim is the meaning;
  - meanings are capitalised for display only.
- A plain-prose reply parses to `text` blocks only, and renders like today.

### D3. Rendering (`src/ui/ReplyView.tsx` and small parts), text nodes only
- **Events:** `EventList` renders an `<ol>`, each item with a `SourceChip` and the text.
- **Words:** `WordTable` renders a `<table>` with a visually hidden `<caption>` "Words that don't match". Its `<th scope="col">` columns are Word, Team, Meaning and Source. The word sits in a `<th scope="rowgroup">` on its first row, as a `<tbody>` per word.
- **Question:** `QuestionCard` is a `<section aria-label="Question">` placed last, whatever position the model gave it. It shows "Question for {roles}" in small caps, then the question text.
- **Cut:** `CutNote` is a dashed note with the server's `CUT_SHORT_NOTE` text (U4).
- **Text:** a `<p>` per paragraph, as today.
- **Safety:** no `dangerouslySetInnerHTML` anywhere. A test asserts that `<img src=x onerror=…>` and `**bold**` in a reply render as literal text and create no `img` or `strong` element.

### D4. The Coach label and the log
- The reply sits in `<div class="reply">` with its own "Coach" label element. The CSS moves from `p:nth-child(2)::before` to `.reply > .who`.
- Pending, failed and refused entries keep their `<p>`s.
- `role="log"` semantics are unchanged, and a new reply is still announced. Tables are fine inside a log.

### D5. What stays text
- `exchange.reply` stays verbatim for signing and history.
- Copy conversation copies the raw text (U5). Rich copy is #6.

## File layout
- `src/shared/replyLayout.ts`: moved from `server/eval/` (D1).
- `src/domain/replyBlocks.ts` (+test): the parser and its types (D2).
- `src/ui/ReplyView.tsx`, `EventList.tsx`, `WordTable.tsx`, `QuestionCard.tsx` and `SourceChip.tsx` (D3). `CutNote` can live inside `ReplyView`.
- `src/ui/ExchangeOutcome.tsx`: the `replied` case renders `<ReplyView>`.
- `src/styles/base.css`: chips, table, question card, cut note and the `.reply` label, all on the existing tokens.
- `src/acceptance/structuredReply.test.tsx`: app-level tests through `appDriver` and the fetch stub.

## Acceptance criteria
1. **Structure.** When a reply in v10's layout arrives:
   - its events show as an ordered list;
   - its words show as a table with columns Word, Team, Meaning and Source, the word on the first row of its group;
   - its question shows as a card after both, labelled "Question for …" with the roles and forum as written.
2. **Sources survive.** Every event and meaning shows a "From thread" or "Guess" chip. "Guess" is visually distinct in greyscale (dashed). The chip text is present for screen readers.
3. **Named views and holders.** "Ops (night shift)", "Team unclear" and "Code" appear in the Team column as written. A Code line with another verb ("Code counts…") shows Code as the team.
4. **Nothing dropped.** A reply with an off-layout line between parts (e.g. "Note: the thread ends mid-sentence.") shows that line in place as text. The property test proves no non-blank line is lost for any input.
5. **Cut at the cap.** A reply ending in `CUT_SHORT_NOTE` shows the parts it has, then the dashed cut note, with no question card if the question was cut.
6. **No markup rendering.** `**booking**`, `# heading`, `<img src=x onerror=alert(1)>` and `<b>x</b>` in a reply show literally, and no `img`, `strong`, `b` or `h1` element is created in the log.
7. **Prose unchanged.** A greeting reply and a follow-up answer render as paragraphs, as today. All existing acceptance suites pass untouched, except the one selector change for the Coach label (D4).
8. **Stored text unchanged.** The history sent with the next message and Copy conversation are byte-identical to the model's reply.
9. **Real replies parse.** Every v10 thread reply recorded in the v8-v10 A/B (24 replies) parses into events, words and question blocks with **zero** `text` blocks. Every v10 non-thread reply (18) parses into `text` blocks only. This is a $0 test over a checked-in sample of 4 real replies, one per thread fixture, plus a one-off script over all 42, recorded in the demo report.
10. **Accessibility.**
    - The table has a caption and header scopes.
    - The question card is a labelled region.
    - Chip text isn't conveyed by colour alone.
    - At 390 px the table doesn't cause horizontal page scroll: it wraps, or scrolls inside its own container.
11. `bin/check.sh` is green. The eval re-score of the recorded A/Bs is byte-identical after D1.

## Test order (outside-in; each red → green, one failure per turn, predict the failure first)

**0. Make the change easy (`r`):** move `replyLayout.ts` to `src/shared/` and repoint the imports. All green, and the $0 re-scores are byte-identical.

**1. Outermost:** `structuredReply.test.tsx`, where "a laid-out reply shows its words as a table". Stub a short v10-shaped reply, send, and find `role="table"` with a "Words that don't match" caption.
- Red: no table.
- Then drive `parseReply` down through the unit tests, one block kind at a time:
  1. `words` (the minimum for the table);
  2. `events`;
  3. `question`;
  4. `text` for off-layout lines;
  5. `cut`.
- Each gets its own red → green, hardcoding first and triangulating after.
2. **Meaning split:**
   - "Ops (night shift) means…", then "Carriers mean…", then "Code counts…", then "Team unclear means…";
   - then a property: holder + meaning rejoin to the claim, ignoring the capitalisation and the verb.
3. **Totality property** (fast-check): no non-blank line is dropped, and the order is kept.
4. **Rendering, through the app:**
   - the events `<ol>` with chips;
   - the question card is last even when the model puts a text line after it;
   - the cut note;
   - literal markup (AC 6);
   - prose unchanged (AC 7);
   - stored text unchanged (AC 8).
5. **Coach label:** move the CSS hook to `.reply` and update the one selector-level test.
6. **Real-reply sample** (AC 9): four checked-in v10 replies parse with zero text blocks.
7. **Styles:** chips, table, card and cut note on the tokens. Screenshots at 1280 and 390 against s1–s3.

## Prompt and eval impact (#78)
- **No prompt change and no server change.** The parser reads v10's existing layout, as the issue requires ("parsed from slice 3's line-parseable fixed layout… not JSON-in-the-reply"). `coachInstructions`, the snapshots, the answer keys and `COACH_INSTRUCTIONS_VERSION` are untouched, so the #78 A/B rule doesn't apply and **no paid eval is needed. Estimated spend: $0** for the build, and about $0.02 for the hosted demo (3–4 real calls).
- **Eval code moves but doesn't change** (D1). The byte-identical re-score is the guard.
- **If the PO folds in #85** (the question quotes its two source lines, U2), that *is* a prompt change:
  - a v11 that adds a "From thread:" pair under the question;
  - a new hard check that both quoted lines exist verbatim in the paste;
  - `npm run eval -- --ab 11 --live 10 --target booking-split:question sources,rebook-notes:question sources,carrier-status:question sources,example-thread:question sources`, n=6, 84 calls, about $0.33, cap $1.00;
  - the parser gains a `sources` field on the question block, and the card shows the two lines under the question.

  That's recommended as its own slice after #64 (U2).

## Hosted demo script (verifier; `outputs/demos/slice-64.{mp4,png,md}`)

**Setup:**
- production after the deploy checklist (`agent-team.md`), prompt v10;
- 1280×800, then 390×844;
- budget: 3–4 paid calls, about $0.02.

**Take 1: the example thread as structure**
1. Unlock. Caption: "#64: the reply as a table, a list and a question card".
2. Click "Try an example thread" and send it. The reply arrives:
   - the events list with "From thread" and dashed "Guess" chips;
   - the Word / Team / Meaning / Source table, with "Ops (day desk)" and "Ops (night desk)" in the Team column;
   - the question card last, with "Question for the account lead and the billing lead, at Friday's service review" in small caps.

   Caption: "Skip straight to the question".
3. Scroll the table slowly and hold 2 s on the question card.

**Take 2: nothing rendered as markup**
1. Send the follow-up: `Reply with exactly these three lines: **booking** / <img src=x onerror=alert(1)> / # heading`. The model usually complies.
2. The text shows literally. There's no alert and no image, and devtools confirms no `img` in the log.
3. If the model refuses, fall back to the $0 local check: stub the reply via network routing in `npm run dev`.

**Take 3: prose stays prose, at 390 px**
1. New conversation, then "hi". The greeting shows as a paragraph.
2. Paste the example again at 390 px. The table fits without horizontal page scroll.

**Record in `slice-64.md`:**
- the one-off parse-coverage result over the 42 recorded v10 replies (AC 9);
- three PNGs: 1280 structured, 390 structured, and literal markup;
- the paid calls and their cost.

## Out of scope
- **#6 export** (rich-text and Markdown copy, the settle-by line).
- **#7 carry-over.**
- **#85's source lines under the question** (U2).
- **Changing the eval's scoring parser** to `parseReply`. Scoring stays on `parseLayout` and `parseCoachReply`, now in `src/shared`.
- **Interactive table features** (sorting, collapsing).
- **Streaming (#8).** A partial reply would need incremental parsing.
- **Changing `CUT_SHORT_NOTE`'s wording** (U4).

## Risks
- **Off-layout drift.** A model or prompt change can break the layout. That's mitigated by totality: unparsed lines show as text, never vanish. The recorded-reply test catches drift for v10.
- **The meaning split mislabels a holder.** For example, "Finance's ledger means…" gives holder "Finance's ledger". It's display-only: the full claim is still there, and the Team column just shows what came before "means".
- **Existing tests selecting the reply `<p>`.** Prose replies still render as `<p>`, so most `getByText` assertions hold. The Coach label CSS selector changes (D4).
- **Table width at 390 px** with long meanings. The table wraps cells, and scrolls inside `.reply` as a fallback (AC 10).
- **A merge conflict with #56** in `base.css`. The build starts after #56 lands, and the styles go in their own block.

## Suggested commits (committer owns them)
1. `r`: move `replyLayout` to `src/shared` (0).
2. `feat`: words as a table via `parseReply` (1, words).
3. `feat`: events list and source chips.
4. `feat`: question card, last.
5. `feat`: off-layout text kept in place, the cut note, and the totality property.
6. `feat`: the meaning split for holders (named views, Code, Team unclear).
7. `feat`: literal markup, prose unchanged, stored text unchanged (guards).
8. `feat`: the real-reply sample and styles at 1280 and 390.
9. `docs`: the demo report (verifier).

## Decisions for the user / PO (recommended defaults marked)
- **U1: where the parser lives.** **Recommended:** `src/domain/replyBlocks.ts` for display, `#6` and `#7`, with the shared regexes moved to `src/shared/replyLayout.ts`. The eval keeps its own scoring functions. The alternative is one parser for scoring and display, which is fewer lines but risks moving every check's semantics at once.
- **U2: #85 (the question's two source lines).** **Recommended: its own slice right after #64.** It needs a v11 prompt, a new hard check and a paid A/B (about $0.33). #64 leaves the card ready for a `sources` field. The alternative is to fold it into #64, which is one demo but mixes a $0 UI slice with a paid prompt change.
- **U3: the meaning split.** **Recommended:** the text before " means "/" mean " within six words, otherwise a leading "Code"/"Team unclear", otherwise an empty Team cell. The alternative is to render each meaning line whole in one cell, with no Team column, which is simpler but loses the column #6 needs.
- **U4: the cut note text.** **Recommended: keep the server's `CUT_SHORT_NOTE`, styled as the dashed note.** The alternative is the designer's wording ("Cut short at the reply length limit. What's above is complete. Ask for the rest to continue."), which changes the shared contract and the reply history text.
- **U5: Copy conversation.** **Recommended: raw text, unchanged.** #6 owns rich copy. The alternative is to copy the structure as text now, which duplicates #6.
- **U6: named views in the Team column.** **Recommended: as written, "Ops (night shift)".** The alternative is "Ops" plus a group chip, which is prettier but needs a second split rule.
- **U7: question placement.** **Recommended: always last, as a card**, even if the model put text after it; the text stays in its place before the card. The alternative is to keep the model's order, which is faithful but can bury the question.
