# Slice 94 (#94, roadmap 4a): the coach's events become event cards on one growing board

The spec is issue #94's body. Its follow-ups are #95 (4b, correct and undo), #96 (4c, connect) and #97 (4d, hotspot question). The direction is "Minimum useful generative UI" in `outputs/generative-coach-direction.md`. The design is DESIGNER's board system: `system-Components.png` and `system-Presence.png`.

**Two parts:**
- **Part A (layout-independent) starts now.** It's the board as a pure domain model, with its unit and property tests.
- **Part B (layout) waits** for DESIGNER's unconventional layouts and Steven's pick. It holds the constraints, the visual spec, the UI acceptance criteria and the demo, plus three layout ideas to set beside DESIGNER's.

The branch `modeling/4a-event-board` was cut from `77cb4e9`. Main has since gained #6 (`1b067b4`), so **rebase onto main before the builder starts**, and again before handoff.

**Steven's decisions (folded in):**
- 4a is "paste → cards". The one-sentence loop, "describe one event, get one card", becomes its own later slice (a prompt change, A/B tested under #78).
- One growing board. New events are added, and exact repeats collapse by stable ID.
- Layout: "think outside the box". Both "board above the chat" and "board left, chat right" are rejected. DESIGNER is exploring alternatives.

## Why now, and goal fit

- **Why now:** after slice 3 the work went to gates, evals, swaps and polish, and 4a–4d never started. The board value object and its typed actions are the seam #95, #96 and #97 build on, and none of that depends on where the board sits. That's why Part A can start now.
- **Learning:** a value object, stable identity, and a pure fold that makes undo (#95) free: replay every action except the last.
- **Fun:** EventStorming colours and a board that grows as you paste.
- **Real DDD problems:** a big-picture timeline, where a guess never passes for agreement (interview 02: "put 'guess' at the front").
- **Honest limit (interviews 02 and 06):** Priya values the term table and the question most, and her RFC "has events already". 4a serves the modeling direction and Steven's goals more than her RFC. "A board beats a list" is tested at #97.
- **DDD proportionality:** a browser-side value object. It's not an aggregate, and there's no repository, service or event-sourcing library.

## Verified facts

- **The parser** is `parseReply` in `src/domain/replyBlocks.ts` (#64). It yields `{ kind: "events", items: Claim[] }` with `Claim = { source: "From thread" | "Guess"; text }`, and a question block with `sources` (#85). `src/shared/replyLayout.ts` is the older eval parser. Don't build on it.
- **Restored names:** `ReplyView` renders `parseReply(restoreNames(reply).text)`. `restoreNames` is `composer.box.restoreNames`, which applies `restoreSwaps` (`src/domain/swaps.ts`, #86).
- **An event's source is its label.** v11 writes up to 5 lines of the form `N. From thread|Guess: <sentence>`, as the thread's own sentences, often in present tense. Only the question has quoted source lines.
- **Where state lives:** the exchanges are in React state in `useExchanges`. Nothing is persisted, and `clear()` empties them. `ExchangeId` is a branded string (`src/domain/exchange.ts`).
- **Test data:** `src/test/v10Replies.ts` holds `V11_REPLY_WITH_SOURCES`, a real v11 reply with 5 events, all "From thread". The fast-check dev dependency is already installed.

---

## Part A — the board as a domain model (layout-independent, start now)

**A-D1. Board value object** (`src/domain/board.ts`, pure, no React)
```ts
type CardId = string & { readonly __brand: "CardId" };        // "event:customer submits a bkg on the portal"
type Provenance = "thread" | "guess";                         // from Claim.source "From thread" | "Guess"
type EventCard = { id: CardId; kind: "event"; text: string; provenance: Provenance; placedBy: ExchangeId; changedBy: ExchangeId };
type Board = { readonly cards: readonly EventCard[]; readonly latest: ExchangeId | null }; // array order = timeline order
type BoardAction = { type: "addEvent"; id: CardId; text: string; provenance: Provenance; by: ExchangeId };
type CardChange = "added" | "updated" | null;

emptyBoard: Board
cardIdOf(kind, text): CardId          // kind + ":" + lower-cased, whitespace collapsed, trailing ".!?" stripped
applyAction(board, action): Board     // new id → append; same id + same provenance → cards unchanged;
                                      // same id + new provenance → updated in place (same index), changedBy = by
changeOf(board, card): CardChange     // placedBy === latest → "added"; changedBy === latest → "updated"; else null
PROVENANCE_LABEL: Record<Provenance, "FROM THREAD" | "GUESS">
```
- **Stable ID = the normalised event text.** It's deterministic and readable, and exact repeats collapse to one card (Steven's answer). A reworded restatement is a new card until #95's rename and merge. #95's `renameCard` changes `text` and keeps `id`.
- **Provenance is data, not style.** `provenance` is set from the claim's label. `PROVENANCE_LABEL` gives the words every card shows. Colour and the dashed border (Part B) only repeat them.
- **Just added is data, not a timer.** Every action sets `latest`, even a no-op. `changeOf` says whether a card was added or updated by the latest reply, so a reply that only repeats events leaves no card marked. The fade after 3 s is purely visual (Part B).
- **Reversible by construction.** The board is only ever `actions.reduce(applyAction, emptyBoard)`, and nothing is mutated or lost. #95's undo replays every action except the last.
- **Later actions are recorded as shapes only (YAGNI):**
  - `renameCard { id, text }` (#95);
  - `connectCards { from, to }` (#96);
  - `addQuestion { id, text, about?: CardId }` (#97).

**A-D2. Reply → actions → board** (`src/domain/boardFromReplies.ts`, pure)
- `eventActionsOf(reply, by): BoardAction[]` takes every item of every `events` block in `parseReply(reply)`, in order.
- `boardOf(exchanges): Board` folds over the **replied** exchanges in log order. Pending and failed exchanges add nothing.
- **The board is derived, never stored.** Part B's mount will call `useMemo(() => boardOf(exchanges), [exchanges])`. There's no drift, "Start a new one" clears it, and when #5 persists the conversation the board comes back with it.
- **IDs come from the raw reply, and names are restored at render (Part B).** Adding a swap later never re-keys or duplicates a card.

**A-D3. Persistence: none** (see A-D2).

**Part A acceptance criteria** (Given/When/Then on the pure functions)
- **A1 — events become cards in order.** Given the real v11 reply, when `boardOf` folds it, then the board has 5 event cards in the reply's order, each `provenance: "thread"`, all `changeOf === "added"`.
- **A2 — provenance is kept and labelled.** Given one "Guess:" event and one "From thread:" event, then their cards are `guess` and `thread`, and their labels are `GUESS` and `FROM THREAD`.
- **A3 — exact repeats collapse.** Given a board from reply 1, when reply 2 repeats one event (differing only in case, spacing or the final full stop) and adds two new ones:
  - the board has 1 card for the repeat, at its original index;
  - the 2 new cards are appended, marked `"added"`;
  - reply 1's cards are unmarked.
- **A4 — a restated event updates in place.** Given a `guess` card, when a later reply restates it as "From thread", then the same ID at the same index is `thread` and marked `"updated"`. The count is unchanged.
- **A5 — only replied exchanges count.** Given a greeting, a prose follow-up, a pending exchange or a failed one, then `boardOf` returns an empty board. A cut reply keeps the events it has.
- **A6 — a no-op reply clears the marks.** Given a reply that only repeats known events, then no card is marked.

**Part A tests** (`tdd` skill, one failure per turn, driven from the domain inward, since there's no UI yet)
1. `src/test/boardReplies.ts`: the fixtures.
   - `V11_REPLY_WITH_SOURCES`, re-exported;
   - a **hand-written**, v11-shaped second reply, labelled as such, that repeats event 1 and adds `From thread: The carrier rejects the booking.` and `Guess: Ops chooses another carrier and resubmits the booking.`;
   - a hand-written third reply that restates that guess as "From thread".
2. `src/domain/boardFromReplies.test.ts`: A1, then A5, A3, A4 and A6 through `boardOf`.
3. `src/domain/board.test.ts`: `cardIdOf` normalisation, append, the identical-board no-op, update in place, `changeOf` and `PROVENANCE_LABEL`.
4. **fast-check properties** over generated action lists:
   - applying an action twice equals applying it once;
   - card IDs are unique;
   - card order is the order of first appearance;
   - folding a prefix gives the earlier board (reversibility);
   - `cardIdOf` is invariant under case, spacing and a trailing full stop.
5. Run `bin/check.sh` green. Part A ships no UI, and `src/` changes only by addition.

**Part A commits (estimate: 2):** `feat` for the board value object and properties, then `feat` for the reply → board fold with fixtures. Sweeper ACN commits follow.

---

## Part B — layout and look (TBD: waits for Steven's pick among the layouts)

**Constraints any layout must meet**
- **Desktop-first (#26):** built for a laptop on a Zoom call at 1280 wide. Phone width keeps working, with no page-level horizontal scroll at 390 px.
- **Never cover the question card.** Checked in the browser: the board's rect never intersects the question card or the composer.
- **At most one mount point beside `ReplyView`:** zero edits to `ReplyView.tsx` if the layout allows, and never more than one mount. The #6 team owns that file.
- **At 1280×577 and 1280×800,** a tall reply still lands on its start (#89's scroll-follow). The board never calls `scrollIntoView` on the page, only on its own scroller.
- **Additive:** new `src/ui/EventBoard.tsx` and `src/styles/board.css`. `base.css` is untouched. The only shared edits are the mount point and one token.
- **Render safety:** card text renders only as React text nodes, with names restored through `restoreNames` (#86).

**DESIGNER's visual spec** (from the Board components and Coach presence sheets)
- **The card:** `EVENT` top-left, provenance top-right, with the title below.
  - **From thread:** solid `--color-card-event` with `--color-card-ink` and `--shadow-card`, labelled `FROM THREAD`.
  - **Guess:** the "Coach's idea" style, a paler fill with a dashed `--color-warn` border and no shadow, labelled `GUESS`.
- **Timeline:** left to right in parsed order, joined by plain ink "Then" arrows with arrowheads. They're decorative, and the `<ol>` carries the order for assistive tech.
- **Just added:** a dashed `--color-coach` ring and a `JUST ADDED` tag. It fades after about 3 s with pure CSS (`animation: settle 300ms 3s forwards`, ending at `visibility: hidden`).
  - **Reduced motion:** a 0 s fade. The ring and tag still show, then go.
  - No confirmation dialogs.
- **`UPDATED` tag:** the same treatment. It's **proposed, pending DESIGNER sign-off**, since the sheet has no source-changed state.
- **Type:**
  - titles: Bricolage (`--font-display`) at weight 600, 17 px, line-height 1.18;
  - labels: Plex Mono (`--font-label`) at weight 500, 11 px, uppercase, `--tracking-label`.
- **Tokens:** reuse the live `--color-card-*` names in `src/styles/tokens.css` (the source of truth), and add only `--color-card-event-guess: #f9d4ae`.
- **Title tense:** titles show the coach's sentences as written. Past tense arrives with the one-sentence prompt slice.

**Part B acceptance criteria** (finalised once the layout is chosen)
- **B1:** an "Event board" region with an `<ol aria-label="Events on the board">` renders the board.
  - Each `<li data-card-id data-source data-change>` shows `EVENT`, its provenance label and its restored title.
  - With no cards there's no region.
- **B2:** a second reply keeps each existing card as **the same DOM element**, checked with `toBe`.
- **B3:** the swap "Acme" → "Customer B" makes a card read "Acme", and the next request's `history` still carries the reply verbatim.
- **B4:** "Start a new one" removes the board.
- **B5:** `structuredReply.test.tsx` and `rfcCopy.test.tsx` pass unedited.
- **B6 (in the browser):** the timeline and arrows, the guess styling, the fade and reduced motion, the no-cover check at 1280×577 and 1280×800, and no page scroll at 390 px.
- **B7:** fixture mode never ships.

**Demo ($0, local): fixture mode, served in dev only**
- **`dev/fixtureApi.ts`** is a Vite plugin with `apply: "serve"`. It answers `/api/session` with 204, and each `/api/chat` with the next Part A fixture as `{ reply, signature: "board-demo-fixture" }`.
- **Enabled only** when `COACH_FIXTURES=1` is set in `vite.config.ts`.
- **`package.json`:** `"demo:board": "COACH_FIXTURES=1 vite --port 5190 --strictPort"`. Add `"dev"` to the tsconfig `include`.
- **It can't ship, for three reasons:**
  1. `apply: "serve"`: Vite never runs it during a build.
  2. It lives outside `src/`, so it's unreachable from the bundle.
  3. The verifier runs `npm run build && ! grep -rq "board-demo-fixture" dist/`.
- **No `.env`, no paid call.**
- **Script:**
  1. "Try an example", then Send: 5 `FROM THREAD` cards, ringed.
  2. Second send: 7 cards, not 8, with 2 ringed, one of them a `GUESS`.
  3. Third send: the guess turns solid, `FROM THREAD` and `UPDATED`, in place.
  4. The B6 checks, then `outputs/demos/slice-94.{mp4,png,md}`.

**Part B commits (estimate: 3):** `EventBoard` and its mount (B1–B5), the look and layout (B6), and the fixture mode (B7).

**Handoff:** rebase onto main, run `bin/check.sh` green on the branch, then the local demo. The Orchestrator's git-agent merges, and its deployer and verifier take it from there.

### Three unconventional layout ideas (pathfinder's, to sit beside DESIGNER's)

1. **The board is the page, and the conversation is a dock on it.** The dotted board fills the viewport.
   - The composer and the latest reply sit in a floating dock at the bottom edge, like the Coach presence sheet's dock.
   - Earlier exchanges fold into the optional transcript drawer (the direction doc's "closed by default").
   - The reply's question card leaves the chat and pins to the board as a pink `QUESTION` card. That makes "never cover the question card" true by construction, and it previews #97.
   - *Cost:* the largest. It reworks `ConnectionTest` and the composer reserve.
   - *Fit:* the closest to "the evolving model is the primary interface".
2. **A scroll-linked flipbook.** The board is a sticky backdrop band, and the conversation scrolls over it.
   - As each reply scrolls into view (IntersectionObserver), the board shows **the board as it was after that reply**: `boardOf(exchanges.slice(0, i + 1))`, with that reply's changes ringed.
   - Scrolling back through the chat scrubs the model's history. That's free from the Part A fold, and it rehearses #95's undo visually.
   - *Cost:* medium. It needs one observer per entry, and has to be checked against #89's follow.
   - *Fit:* the most "learning". You watch the model grow turn by turn.
3. **The timeline lives in the composer dock.** A slim, one-row strip of cards sits inside the sticky composer, above the message box, where the eye returns every turn. Pressing it expands the dock into a full board sheet, and closing it returns you to the chat.
   - #89's ResizeObserver already measures `--composer-reserve`, so the log automatically makes room and nothing is covered.
   - *Cost:* the smallest. It adds one mount inside `ComposerForm` and touches no reply code.
   - *Fit:* the most additive. It's easy to ship first and graduate to idea 1 later.

## Out of scope

- The one-sentence loop and past-tense titles (their own later slice, via #78's A/B).
- #95 (select, rename, undo), #96 (connectors beyond "Then"), #97 (question card, except as layout idea 1's placement).
- Coach pointing, the presence states, and "Follow".
- Dragging cards.
- Voice.
- Persistence (#5).
- Board export.
- Deploying: the Orchestrator owns it.

## Risks

- **Reworded events look new.** Only exact repeats (after normalisation) collapse, so two pastes can leave near-duplicates until #95's rename and merge. Steven accepted "keep adding".
- **Layout churn:** Part B waits on a design decision. Part A's API (`boardOf`, `changeOf`, `PROVENANCE_LABEL`) is written to serve all five candidate layouts unchanged.
- **The `UPDATED` state** needs DESIGNER sign-off before Part B.
- **The provenance wording** defaults to DESIGNER's `FROM THREAD`, which matches the reply chips and the RFC export. `YOU SAID` wasn't chosen.
- **Rebase friction:** low. Part A adds new files only.
