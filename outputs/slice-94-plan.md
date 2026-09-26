# Slice 94 (#94, roadmap 4a): the board is the page; the coach's events become event cards on it

The spec is issue #94's body. Its follow-ups are #95 (4b, correct and undo), #96 (4c, connect) and #97 (4d, hotspot question). The direction is "Minimum useful generative UI" in `outputs/generative-coach-direction.md`.

The design:
- DESIGNER's board system: `system-Components.png` and `system-Presence.png`.
- **Layout B, "the board is the page"**, which Steven picked from `outputs/design/explore-07/`: `board-layouts.html?layout=B&state=1-4`, `explore07.mp4`, `B3.png` and `B4.png`.

**Status:**
- **Part A is done** on `modeling/4a-event-board`: `5ddc226`, `4ff0250`, `fdd2041` and `af01385`, rebased onto main `3af9bf1`. The plan's own commit is `ff221e2`.
- **Part B below is final.**
- The branch now includes #86, #89, #6, #58 and #100's glossary work. **Rebase again before handoff.**
- **#100 claims neither the App shell nor the right margin.** Both belong to this slice.
- **`src/domain/entityId.ts` and its tests are FROZEN.** #100 copied them byte for byte from `63e938b`, so neither branch may change them.

**Steven's decisions:**
- 4a is "paste → cards". The one-sentence loop becomes its own later slice (a prompt change, A/B tested under #78).
- One growing board, where exact repeats collapse by stable ID.
- Layout B.

## Goal fit

- **Learning:** a value object, stable identity, and a pure fold that makes #95's undo a replay.
- **Fun:** the page becomes a modeling board, the first time the app feels like a whiteboard.
- **Real DDD problems:** an EventStorming timeline, where a guess never passes for agreement. Clicking a card takes you back to the thread line behind it, which is interview 02's "click THREAD and see the line it came from".
- **Honest limit (interviews 02 and 06):** Priya values the term table and the question most, and her RFC "has events already". Layout B helps there too: the question is pinned and never scrolls away, and the words table stays in the margin.
- **DDD proportionality:** browser-side value objects and pure functions. No aggregate, repository, service or library.

## Part A — the board domain (done)

**What's built:**
- `src/domain/board.ts`:
  - the types `Board`, `EventCard` (`id`, `text`, `previousText?`, `provenance`, `placedBy`, `changedBy`), `BoardAction` (`addEvent`), `Provenance` and `CardChange`;
  - `applyAction`, `changeOf`, `previousTextOf` and `PROVENANCE_LABEL`;
  - the later actions (`renameCard`, `connectCards`, `addQuestion`) as types only.
- `src/domain/boardFromReplies.ts`: `boardOf(exchanges)` and `eventActionsOf(reply, by)`, built on #64's `parseReply`.
- `src/domain/entityId.ts` (frozen): `entityId(kind, text)`, which normalises case, spacing, curly quotes and trailing punctuation.

**Behaviour covered by tests:**
- exact repeats collapse;
- a restated guess becomes FROM THREAD in place;
- a reworded restatement keeps `previousText` for the struck-through UPDATED state;
- greetings, prose, pending and failed exchanges add nothing;
- fast-check properties: idempotence, unique IDs, first-appearance order, and replay.

## Part B — layout B, "the board is the page" (final)

### Verified facts on main (`3af9bf1`)

- **The mount points.** `App` renders `<main>` (h1, `PurposeLine`, `DataFlowNotice`, `AccessView`), then `<Attribution/>`, the CC BY credit (#58). `ConnectionTest` renders `ExchangeLog`, the gate, the status line and `ComposerForm` (with `GlossaryPanel`, `SwapPanel` and `SentPreview`). The exchanges live in `useComposer`, so **the board's shell mount is `ConnectionTest`, next to `ExchangeLog`**.
- **What `ReplyView` renders now:**
  - events via `EventList`, words, the question via `QuestionCard` (`<section aria-label="Question">`);
  - `citation` and `unsourced` lines;
  - `RfcCopyButton` and `KeepButton`.
- **Follow (#89/#66) is window-scroll based.**
  - `useLogFollow` listens to `window` scroll.
  - `logFollow.ts`: `fitsAbove` assumes the free space starts at viewport top plus 16 px, and `inView` requires `top >= 0`.
  - `useComposerReserve` writes `--composer-reserve` from a ResizeObserver, and `html` uses it as `scroll-padding-bottom`.
- **Prompts are stored as sent (swapped).** `exchange.prompt` is `outgoing(draft)`, so events (raw, from the model) and prompts share the same name space.
- **Long prompts collapse.** `PromptText` shows a preview with a "Show more" toggle.
- **Real reply for the example thread:** `src/test/v10Replies.ts` has `V11_EXAMPLE_REPLY`, a real v11 reply to `EXAMPLE_THREAD` ("Try an example").

### Decisions

**B-D1. Page structure: the window keeps scrolling the conversation, so #89 keeps working.**
- From 1024 px, `body:has(.event-board)` switches to layout B:
  - **The board** is `position: fixed; inset: 0 var(--margin-width) 0 0`, which is the page. It holds its own horizontal scroller.
  - **The margin:** `main` and the footer take the right-hand `--margin-width: 360px` column in normal flow, and the **window** scrolls it.
  - Because of that, `scrollIntoView`, `scroll-padding` and #89's window listeners all keep working unchanged.
  - The h1 "DDD Coach" sits top-left on the board (`position: fixed`), and the DOM order is unchanged.
  - `PurposeLine` and `DataFlowNotice` (#69 must stay in plain view) sit at the top of the margin. The CC BY footer ends the margin, still reachable.
- **Below 1024 px:** the board sits in flow at the top, full width and panning, with the conversation below it. It's a fallback: desktop-first (#26), with no page-level horizontal scroll at 390 px.
- **The access gate and unreachable states** keep today's layout, since `:has(.event-board)` only matches once `ConnectionTest` renders.
- **Styles** live in a new `src/styles/board.css`, imported by `EventBoard.tsx`. `base.css` is untouched.
- **The composer and all its panels fit the 360 px margin.** That covers "Your swaps" (#56/#89), "What's sent", the "Glossary (N)" panel and the "Keep these words" button in each reply (#100).
  - `base.css` applies its phone rules at `@media (max-width: 480px)`, which the viewport never matches at 1280. So `board.css` repeats the composer and table rules that matter under `body:has(.event-board)`:
    - no key hint;
    - the textarea's `max-height`;
    - the compact table padding.
  - It also adds `overflow-wrap: anywhere` and `min-width: 0` to the panels' rows, so the swap inputs and the What's-sent text wrap instead of scrolling.
  - The composer's `max-height` is `calc(100dvh - var(--pinned-reserve) - 2 * var(--space-4))` with internal `overflow-y: auto`. An open panel therefore grows the composer only up to the pinned question's bottom, and never over it. #89's ResizeObserver keeps `--composer-reserve` true as it grows.

**B-D2. The board** (`src/ui/EventBoard.tsx`, mounted once in `ConnectionTest` next to `ExchangeLog`)
- **Structure:** a `<section aria-label="Event board">` holding:
  - the header "TIMELINE · EVENTS", with the summary "5 events · 1 guess" from a pure `boardSummary(board)`;
  - an `<ol aria-label="Events on the board">` in **one lane, left to right, never wrapping**. From about 5 cards it pans horizontally inside its scroller (`overflow-x: auto`, keyboard-focusable).
- **The states, per explore-07:**
  1. **Empty:** a dashed placeholder, "Events from your paste land here, left to right, in order."
  2. **Thinking:** while the newest exchange is pending, 3 `aria-hidden` dashed ghost slots with ghost arrows follow the existing cards.
  3. **Cards.**
- **Derived:** `ConnectionTest` computes `useMemo(() => boardOf(composer.exchanges), [composer.exchanges])`. There's no stored state, and "Start a new one" returns the board to empty.
- **After a reply adds or updates cards,** the board scrolls **its own scroller** to the first marked card (instant under reduced motion). It never scrolls the window.

**B-D3. The card** (DESIGNER's sheet)
- **Markup:** `<li data-card-id data-source data-change>` holding a `<button aria-pressed>`, with:
  - `EVENT` top-left, and provenance top-right from `PROVENANCE_LABEL`;
  - the title, which is the restored text (`restoreNames(card.text).text`, #86).
- **Provenance:**
  - **From thread:** solid `--color-card-event` with `--color-card-ink` and `--shadow-card`.
  - **Guess:** "Coach's idea", a paler `--color-card-event-guess` fill (the one new token, `#f9d4ae`), a dashed `--color-warn` border, no shadow and the label `GUESS`. A guess never passes for agreement.
- **"Then" arrows:** ink, with an arrowhead, drawn in CSS (`li + li::before`). They're decorative, and the `<ol>` carries the order.
- **JUST ADDED:** `changeOf === "added"` gives a dashed `--color-coach` ring and a `JUST ADDED` tag.
- **UPDATED:** `changeOf === "updated"` gives the same treatment with an `UPDATED` tag. When `previousTextOf` is set, the old words show struck through under the new title (`<del>`), matching the sheet's "Renamed" state.
- **The fade:** both marks fade after about 3 s in pure CSS (`animation: settle 300ms 3s forwards`, ending at `visibility: hidden`).
- **Reduced motion:** no fade and no smooth scroll. The marks still show, then go.
- **Selected:** the sheet's ink ring (B-D6).
- **Type:**
  - titles: `--font-display` at weight 600, 17 px, line-height 1.18;
  - labels and tags: `--font-label` at weight 500, 11 px, uppercase, `--tracking-label`.

**B-D4. ReplyView: one tiny swap only.** `ReplyView` is crowded already: the table, the question card, #102's Source and General-practice footer, and perhaps #100's drift list. So this slice changes one import and one `case` line, and nothing else. In `ReplyPart`, `case "events"` returns `<EventsOnBoard count={block.items.length} />` instead of `<EventList …/>`.
- That's a button reading "← 5 events placed on the board" ("1 event" when there's one). It moves focus to the board's list.
- `EventList.tsx` is deleted, since `ReplyView` was its only user.
- The words table, question card, citations, RFC copy and Keep are all untouched.
- **Test impact:** the single `structuredReply.test.tsx` case "lists the events in order, each with its source" moves to `eventBoard.test.tsx` as the chip plus the cards. `rfcCopy.test.tsx` and `keptGlossary.test.tsx` pass unedited, because RFC copy still exports the events.

**B-D5. The question is pinned at the top of the margin, never covered and never scrolled away.**
- **`PinnedQuestion`** (`src/ui/PinnedQuestion.tsx`) renders the **latest** replied exchange's question block, restored (via a pure `latestQuestionOf(exchanges)`). It's `position: sticky; top: 0` in the margin.
  - It's an `<aside aria-label="Current question">`, deliberately not "Question", so existing `region "Question"` queries still find exactly one.
  - It has `max-height: 40vh` with internal scroll, so at 577 px it can't eat the margin.
  - There's none before the first question.
- **Its height** goes into `--pinned-reserve` through a ResizeObserver (same pattern as `useComposerReserve`), which `html` uses as `scroll-padding-top`.
- **#89 follow:** `fitsAbove` and `inView` in `logFollow.ts` gain an optional `topInset` (default 0, so every existing test passes). `useLogFollow` passes the pinned card's bottom, so a tall reply lands on its start **below** the pinned question and above the composer.
- **The latest reply's own question card stays in the reply,** so earlier questions stay in the history. The duplication is for the latest question only. DESIGNER should confirm it.

**B-D6. Click a card → the source popover, and the margin scrolls to the line, highlighted.**
- **Selection:** at most one card, held in `useBoardSelection()` in `ConnectionTest`. A card toggles on click, Enter or Space, and Escape clears it. The selected card gets the sheet's "Selected" ink ring.
- **The popover** (non-modal, next to the card, `role="note"`, linked with `aria-describedby`) shows, depending on the match:
  - **FROM THREAD with a match:** "CLOSEST LINE IN YOUR PASTE", the line verbatim, then "Shown in your paste on the right →".
  - **GUESS:** "The coach's guess: no line in your paste says this."
  - **No close line:** "No line in your paste matches closely."
- **Honesty:** the model doesn't cite a line per event (v11 and v13 only quote under the question), so the line is **found locally** and labelled "closest line", never "source". A per-event quote needs a prompt change (open question 1).
- **Matching** is a pure `closestLine(eventText, prompts)` in `src/domain/sourceLine.ts`, working in swapped space against the placing exchange's prompt and then earlier prompts.
  - **Tokens:** lower-cased words of 3 or more letters, plus numbers, minus a short stop list.
  - **Score:** the share of the event's tokens found in the line.
  - **Threshold:** at least 0.5 and at least 2 shared tokens. A tie goes to the placing prompt, then the earliest line.
  - **Output:** `{ exchangeId, start, end }` or `null`.
- **Highlight:** `ExchangeLog` → `ExchangeEntry` → `PromptText` gain an optional `highlight` prop (three one-line threads). `PromptText` then shows the prompt expanded, with `<mark>` around `[start, end)`.
- **Scroll:** `mark.scrollIntoView({ block: "center" })` scrolls the window, which is the margin. That counts as the visitor scrolling away, so #89 shows "New reply" later as usual.

**B-D7. Persistence: none.** The board is derived from the exchanges.

**B-D8. $0 demo: fixture mode, served in dev only**
- **`dev/fixtureApi.ts`** is a Vite plugin with `apply: "serve"`. It answers `GET /api/session` with 204, and each `POST /api/chat` with the next canned reply as `{ reply, signature: "board-demo-fixture" }`.
- **The canned replies:**
  1. `V11_EXAMPLE_REPLY`: real v11, to "Try an example".
  2. A **hand-written**, v11-shaped reply on the same example thread: it repeats one event, adds one `From thread:` event and one `Guess:` event, and asks a new question.
  3. A hand-written reply that restates that guess as `From thread:` in different words, to show `UPDATED` with struck-through old words.

  They live in `src/test/boardDemoReplies.ts`, each labelled.
- **`vite.config.ts`:** the plugin is included only when `COACH_FIXTURES === "1"`.
- **`package.json`:** `"demo:board": "COACH_FIXTURES=1 vite --port 5190 --strictPort"`. Add `"dev"` to the tsconfig `include`.
- **It can't ship, for three reasons:**
  1. `apply: "serve"`.
  2. It lives outside `src/`.
  3. The verifier runs `npm run build && ! grep -rq "board-demo-fixture" dist/`.
- **No `.env`, no paid call.**

### Acceptance criteria (Given/When/Then)

- **B1 — the empty board is the page.** Given access is open and nothing has been sent, then an "Event board" region shows "Events from your paste land here, left to right, in order.", and the conversation margin shows the purpose line, the data-flow notice and the composer.
- **B2 — thinking.** Given a sent message awaiting its reply, then the board shows its existing cards plus ghost slots that aren't in the accessibility tree.
- **B3 — events become cards.** Given a reply with N events, G of them guesses:
  - there are N cards in one lane, in order;
  - each shows `EVENT`, then `FROM THREAD` or `GUESS`, then its restored title;
  - each is marked `JUST ADDED`;
  - the header reads "N events · G guess" (plural "guesses").
- **B4 — the board is stable.** Given a board, when a later reply repeats one event, adds two and restates a guess from the thread in new words, then:
  - every existing card is **the same DOM element** (checked with `toBe`);
  - the repeat is still one card;
  - the new ones are marked `JUST ADDED`;
  - the restated card reads `FROM THREAD`, is marked `UPDATED`, and shows its old words struck through.
- **B5 — the chip replaces the list.** Given a laid-out reply, then it shows "← N events placed on the board" and no events list, and pressing the chip focuses the board. The words table, question card, RFC copy and Keep still render, and `rfcCopy` and `keptGlossary` pass unedited.
- **B6 — the question is pinned.** Given two laid-out replies, then "Current question" shows the second reply's question at the top of the margin, and each reply still holds its own question card.
- **B7 — click to the source line.**
  - Given the example thread and its reply, when the visitor presses a FROM THREAD card whose words appear on one thread line, then:
    - the card is `aria-pressed="true"`;
    - the popover shows "CLOSEST LINE IN YOUR PASTE" and that line;
    - the paste in the margin is expanded, with exactly that line in a `<mark>`.
  - Pressing again, or Escape, closes the popover and clears the mark.
  - A GUESS card's popover says "The coach's guess: no line in your paste says this."
- **B8 — names restored.** Given the swap "Acme" → "Customer B", then a card mentioning "Customer B" reads "Acme", and the next request's `history` is verbatim.
- **B9 — a new conversation.** Given a board, when the visitor confirms "Start a new one", then the board returns to its empty state and the pinned question is gone.
- **B10 — layout, checked in the browser at 1280×800 and 1280×577:**
  - the board fills the left and the margin is 360 px on the right;
  - the pinned question stays at the margin's top while the margin scrolls, and its rect never intersects the composer or any card popover;
  - after a tall reply, the reply's start is visible below the pinned question and above the composer (#89);
  - with more than 5 cards, the lane pans horizontally inside the board and never wraps, and the window has no horizontal scroll;
  - at 390 px the fallback stack has no page-level horizontal scroll.
- **B11 — motion, checked in the browser.** The marks fade after about 3 s. With `agent-browser set media light reduced-motion`, there's no fade and no smooth scroll, and the marks still appear and then go.
- **B12 — fixture mode never ships.** `npm run demo:board` answers three sends, and `dist/` has 0 occurrences of `board-demo-fixture`.

### Test order (outside-in, `tdd`, one failure per turn)

1. **Acceptance** in `src/acceptance/eventBoard.test.tsx`, through `startConversation()` in `src/test/appDriver.tsx`, in the order B1, B3, B5, B4, B2, B8, B9, B6, B7. Each one is red first, and drives its units:
   - `src/domain/sourceLine.test.ts`: exact line, reworded line, below threshold, a guess never matched, a tie goes to the placing prompt. Plus fast-check properties: the result is always a slice of a prompt (`prompt.slice(start, end)` is one whole line), matching is deterministic, and a line identical to the event always matches.
   - `boardSummary`, `latestQuestionOf`;
   - `logFollow.test.ts` gains `topInset` cases, and the existing cases stay unchanged.
2. **Styles:** `board.css` and the one token. B10 and B11 go to the verifier in the browser, since jsdom can't check layout.
3. **Fixture mode last** (B12).
4. **Before handoff:** rebase onto main, then run `bin/check.sh` green. The slice ends here. The Orchestrator's git-agent rebases and fast-forward merges, then its deployer and verifier take over.

### Demo (modeling-team verifier, local, $0)

1. In tmux, run `npm run demo:board` (the app is on http://localhost:5190). Start recording `outputs/demos/slice-94.webm` with `agent-browser --session verifier`, with a caption banner per step (`pointer-events:none`).
2. **Empty board.** Click "Try an example", then Send. The ghost slots show, then 5 cards with JUST ADDED rings, the chip in the reply, and the question pinned. The rings fade.
3. **Click a card.** The popover shows the closest line, and the margin scrolls to it, highlighted. Press Escape.
4. **Second send** ("Wed 07:10 Carrier desk: Carrier 3 rejected the 7731 rebook"):
   - there's one card more for each new event, and the repeat didn't duplicate;
   - one card is a dashed GUESS;
   - the board pans to the new cards;
   - the pinned question changes.
5. **Third send.** The guess turns FROM THREAD and UPDATED, with its old words struck through.
6. **Layout checks at 1280×577 and 1280×800** (B10), run with `eval` over the `getBoundingClientRect`s during the take. Check 390 px too.
7. **Reduced motion, outside the recording** (B11).
8. **Output:**
   - `outputs/demos/slice-94.mp4`;
   - `slice-94.png` at 1280×800 during step 4;
   - `slice-94.md` with the B10 and B11 numbers and the B12 grep.

### Out of scope

- The one-sentence loop, past-tense titles and per-event quotes: a later prompt slice under #78.
- A's peel animation for the first reply.
- #95 (manual rename, remove, undo), #96 (connectors beyond "Then"), #97 (question card on the board).
- Coach pointing, the presence states, and the "Follow" marker.
- Dragging cards.
- Persistence (#5).
- Deploying: the Orchestrator owns it.

### Risks

- **A local match can mislead.** "If one label about where a sticky came from is wrong, I stop trusting all the labels" (interview 02). Mitigations:
  - the label says "closest line", never "source";
  - the high threshold says "no close line" rather than guessing;
  - a guess is never matched;
  - the demo checks B7 against the real example thread.
- **A pinned question at 577 px plus the composer** leaves a short margin. `max-height: 40vh`, plus `topInset` in `logFollow`, keeps "lands on its start" true. B10 checks it.
- **`logFollow.ts` and `useLogFollow.ts` belong to #89.** The change is an optional parameter defaulting to 0, and every existing test stays unedited.
- **Rebase friction:** `ReplyView.tsx` has a one-line swap, and `ExchangeLog`, `ExchangeEntry` and `PromptText` each gain one optional prop. Rebase first, and keep each edit one line where possible.
- **`entityId.ts` is frozen.** Any need to change IDs goes to the Orchestrator, never into this branch.
- **Card, popover and highlighted text are user material.** They render only as React text nodes.

### Open questions for Steven

1. **The source line:** ship a local "closest line in your paste" match (this plan, $0), or wait for per-event quotes from the model (a prompt change under #78, paid)?
2. **The latest question** shows twice, pinned and in its reply. Keep that, or hide the latest reply's card while it's pinned (a second `ReplyView` edit)?
3. **Below 1024 px:** is the stacked fallback enough, or should narrow widths get layout B's margin as a drawer?

### Builder commits (Part B estimate: 5, plus sweeper ACN commits)

1. `feat`: `EventBoard` beside `ExchangeLog`, with the empty, thinking and card states, the summary, stable DOM, JUST ADDED and UPDATED with struck-through words, the `ReplyView` chip swap, restored names, and a new conversation (B1–B5, B8, B9).
2. `feat`: the pinned current question, with `--pinned-reserve` and the `logFollow` `topInset` (B6).
3. `feat`: selecting a card opens the closest-line popover and highlights the line in the paste (B7).
4. `feat`: the layout B page and motion (B10, B11).
5. `chore`: dev-only fixture mode `npm run demo:board` (B12).
