# Slice 56 (#56, P1): swap sensitive words in the browser and preview what's sent

The spec is issue #56's body. The PO's comment bumps it to P1: about 15 minutes of sanitizing per thread now decides whether the ICP uses the coach at all (interview 06). This plan adds the verified facts, the decisions, the test order and the demo.

In one line: the visitor keeps a list like "Acme Foods → Customer A" in this browser. Every message is swapped **in the browser before it's sent**, "Show what's sent" shows the exact outgoing text, and a note says swaps don't make an unapproved vendor approved.

## Goal fit

- **Real DDD problem (ICP):** in interview 03a Priya says "it's the same six customers every time". She wants her own swaps, kept, and to see the exact text before it leaves, because "if it's the model, the checkbox is theatre". Interview 06 adds that "the paste is the expensive part". A kept list turns the per-thread scrub of customer names and lanes into one pass per new name.
- **Honesty (#34, sanitized input only):** the swap happens client-side, and the preview is built by the same function as the request body. So what she sees is what leaves, by construction. The note keeps it from being oversold: it doesn't touch rates, load IDs or the vendor block (03b).
- **Learning:**
  - a pure value object (`SwapList`) with simultaneous, whole-word, case-insensitive replacement;
  - localStorage as a fallible outer-shell port;
  - a single-source-of-truth seam between the preview and the network.
- **Fun:** watching "Acme Foods" light up as "Customer A" in the preview.
- **DDD proportionality:** one small domain value object (`src/domain/swaps.ts`) and one storage hook. No server, contract or prompt change. No aggregates.

## Verified facts (main at `54ecd99`, 2026-09-25)

**Send path**
- `MessageForm.handleSubmit`:
  1. `parsePrompt(draft)` (trims, and returns null when blank);
  2. clears the draft;
  3. `onSend(prompt)`.

  It refuses while busy or `over`, and `over` comes from `draftLimit(messageLength(draft), MAX_MESSAGE_CHARS)`, computed on the **draft**.
- `ConnectionTest.sendFromBox` calls `useExchanges.send(prompt)`. That builds an exchange `{prompt}` and calls `askCoach({history: turnsOf(exchanges), prompt})`, which POSTs `{message: prompt, history}`.
- The server signs `{prompt, reply}` on the text it **received**. History turns must match exactly or the request gets 400 `COACH_UNVERIFIED`. So the stored `Exchange.prompt` must be the **sent** (swapped) text.
- **Other paths that send or restore a prompt:**
  - `retry` resends `failed.prompt` (already the sent text);
  - on a refusal, `onRefused(prompt)` puts `restoredDraft(current, prompt)` back into the composer (the sent text);
  - `conversationText` (Copy conversation) uses `exchange.prompt` and `exchange.reply`;
  - `tryExample` fills the draft with `EXAMPLE_THREAD`, which is fictional and already uses placeholders ("Customer B", "Carrier 3").

**UI and copy**
- `DataFlowNotice` says: "Your messages are sent to OpenRouter, an AI model provider, to generate replies. Nothing is stored on our server. Don't paste customer names, rates, lanes or contract terms."
- The composer foot (`DraftFoot` → `.formfoot`) holds `ComposerActions`:
  - "Try an example thread" when there's no conversation and the draft is blank;
  - otherwise New conversation.

  After those come the key hint and the count.
- `PromptText` shows a long "You" prompt collapsed to 4 lines / 320 characters, with Show more.
- **Nothing in `src/` uses `localStorage` or `sessionStorage` today.** This slice is the first browser persistence (#5 "saved sessions" stays separate).

**Design and research**
- Exploration 03 (`outputs/design/explore-03/table.html`, step "1 What leaves") is the reference:
  - a "Your swaps" panel headed "BEFORE ANYTHING IS SENT";
  - chips, and an Add field taking "Acme Foods → Customer A";
  - a **"Show what's sent"** button that highlights swapped words with `<mark>`;
  - the note "Swaps hide the words you list. They don't make an unapproved vendor approved, and they won't catch rates, lanes or load IDs you haven't listed."

  It uses `split/join` (case-sensitive, not whole-word). That's a hypothesis, not the spec.
- Interviews:
  - **03a:** her 15 minutes go on customer names, rates and lanes; load IDs and contract terms are borderline.
  - **03b:** anonymising leaves rates, lanes, contract terms and load IDs, so this helps sanitizing but doesn't unblock real material.
  - **07:** the draft is "fifteen minutes of sanitizing", so keep it.

**Server and eval:** untouched. The model sees placeholders ("Customer A"), which it already sees in her hand-sanitized threads and in `EXAMPLE_THREAD`.

## Decisions (design; the open ones are U1… below)

### D1. `SwapList`, a pure value object (`src/domain/swaps.ts`)
- **The type:** `type Swap = { from: string; to: string }`, and `SwapList` is a readonly array of them. Functions return new lists.
- **Pure functions:**
  - `addSwap(list, from, to) → SwapResult`, either `{ok: true, list}` or `{ok: false, reason}`. It trims both sides, and **replaces** an existing entry with the same `from` (ignoring case). It rejects:
    - an empty `from` or `to`;
    - a `from` shorter than 2 characters;
    - `to` equal to `from` (ignoring case);
    - more than 50 entries (U7).
  - `removeSwap(list, from)`.
  - `applySwaps(list, text) → { text, spans: {start, end}[] }`. `spans` are the positions of the replacements in the **output**, which the preview highlights.
  - `restoreSwaps(list, text) → string`, used for display only (D4).
- **Matching rules for `applySwaps`:**
  - **Simultaneous:** one alternation regex, so a placeholder is never re-swapped by a later rule. With "A Co → B Co" and "B Co → C Co", "A Co" becomes "B Co", never "C Co".
  - **Longest `from` first,** so "Acme Foods" wins over "Acme".
  - **Case-insensitive** (U2): "ACME" and "acme" both become the placeholder, exactly as the visitor typed it.
  - **Whole word:** Unicode lookarounds `(?<![\p{L}\p{N}_])…(?![\p{L}\p{N}_])` with the `u` flag. "Tom" doesn't match "Tomorrow". "Acme's", "acme.com" and "@Acme" do match.
  - Every `from` is regex-escaped.
- `applySwaps(emptyList, text)` returns the text unchanged. That is the identity the refactor step relies on.

### D2. One outgoing seam (make the change easy first)
- `MessageForm` gets a prop `outgoing: (draft: string) => string`, defaulting to identity. Both the **length check** and the **submit** use `outgoing(draft)`. So the counter, the over-limit alert and the server's 24k cap all measure what is actually sent (U4).
- `ConnectionTest` passes `(draft) => applySwaps(swaps, draft).text`.
- The preview renders `applySwaps(swaps, draft)` from the same list and the same function, so it can't differ from the body (AC 3).

### D3. Storage (`src/ui/useSwaps.ts`, the outer shell)
- The localStorage key is `ddd-coach.swaps.v1` and the value is `[{from, to}]` as JSON.
- Every read and write is wrapped in try/catch. If storage is unavailable or throws, or the JSON is corrupt or the wrong shape, the list is empty and the app works. The list lives in React state either way, and a failed write shows no error (U6).
- The hook exposes `{ swaps, add(from, to) → SwapResult, remove(from) }`.
- Nothing about swaps ever goes to the server. There's no new endpoint or header.

### D4. What the log shows (U3)
- **"You" bubble:** the **sent** text, placeholders and all. The log itself then proves what left, and it's what's signed and replayed as history.
- **Coach reply:** shown **restored** through `restoreSwaps`, so "Customer A" reads as "Acme Foods" again. It maps placeholders back with whole-word, case-sensitive matching.
  - A placeholder shared by two `from`s (Maya → Ops and Dana → Ops) is **not** restored, because it's ambiguous.
  - A small "Shown with your swaps restored" label sits under the reply whenever something was restored.
- **Copy conversation:** copies what's displayed: the prompt as sent and the reply as restored.
- **The cut line:** D4's restore step is the last test group. If it runs long, ship with replies as sent and move restore to a follow-up issue. The issue says "if cheap".

### D5. UI
- **Disclosure:** a `<details className="swaps">` whose `<summary>` reads "Your swaps (N)". It sits in the composer foot after `ComposerActions`, closed by default, so the first screen stays as #63 left it (U1). It holds:
  - one chip per swap, "Acme Foods → Customer A", each with a remove button labelled "Remove swap Acme Foods";
  - an add row: two labelled inputs, "Replace" and "With", and an "Add swap" button. Enter in either input adds. A rejection shows as inline text tied to the field with `aria-describedby`, and the field keeps its value;
  - the note: "Swaps run in this browser before anything is sent. They hide only the words you list: rates, load IDs and contract terms you haven't listed still go. They don't make an unapproved vendor approved."
- **"Show what's sent":** a toggle button in the composer foot, with `aria-expanded` and `aria-controls`, shown whenever the draft isn't blank. It opens a read-only region labelled "What's sent" under the composer. The region shows `applySwaps(swaps, draft).text`, with each span wrapped in `<mark>`, plus a line "N swaps applied" or "No swaps applied". It updates live as the draft or the list changes.
  - When the draft is blank it closes.
- **The notice:** `DataFlowNotice` gains one sentence (U5): "Add swaps below to replace names before sending."

## File layout

| File | Change |
|---|---|
| `src/domain/swaps.ts` (+ test) | new: `Swap`, `SwapList`, `addSwap`, `removeSwap`, `applySwaps`, `restoreSwaps` |
| `src/ui/useSwaps.ts` (+ test) | new: the localStorage-backed hook |
| `src/ui/SwapPanel.tsx` | new: the disclosure, chips, add row and note |
| `src/ui/SentPreview.tsx` | new: the toggle and the marked, read-only region |
| `src/ui/MessageForm.tsx` | the `outgoing` prop (D2) |
| `src/ui/ConnectionTest.tsx` | wires `useSwaps`, `outgoing`, the panel, the preview and reply restore |
| `src/ui/ExchangeOutcome.tsx`, `conversationText.ts` | the restored reply and its label; copy uses the displayed text (D4) |
| `src/ui/DataFlowNotice.tsx` | one sentence (U5) |
| `src/styles/base.css` | `.swaps`, chips, `mark` in the preview (tokens only) |
| `src/test/setup.ts` | `localStorage.clear()` after each test |
| `src/acceptance/swaps.test.tsx` | new, one file for this feature |
| server, `netlify/`, `src/shared/`, `src/api/` | **no change** |

`ConnectionTest.tsx` is already the widest component. If the wiring pushes any function past 25 lines, extract a `useComposer` hook for the draft, swaps and outgoing text (sweeper).

## Acceptance criteria

1. **A kept swap list.**
   - Given an unlocked visitor who opens "Your swaps" and adds "Acme Foods" → "Customer A", the chip appears and the summary reads "Your swaps (1)".
   - After a reload the chip is still there.
   - Removing it removes it, and it stays removed after a reload.
   - The list is only in this browser's localStorage. No request carries it.
2. **Swapped before sending.** When the visitor sends "Acme Foods wants the Laredo lane re-rated. ACME is late again." with swaps Acme Foods → Customer A, Acme → Customer A and Laredo → Lane 1:
   - the request body's `message` is "Customer A wants the Lane 1 lane re-rated. Customer A is late again.";
   - no original word appears anywhere in the request;
   - the "You" bubble shows the same sent text.
3. **Show what's sent.**
   - With a non-blank draft, "Show what's sent" opens a "What's sent" region whose text **equals the next request's `message`**, with each swapped word marked and a count line.
   - Editing the draft or the list updates the region.
   - With no swaps it says "No swaps applied" and shows the draft as-is.
4. **The note.** "Your swaps" shows the vendor note verbatim (D5), whether the list is empty or not.
5. **Matching.**
   - Whole words only: "Tom → Finance" leaves "Tomorrow" alone.
   - Any case matches.
   - The longest match wins.
   - Swaps never chain.
   - Regex characters in `from` are literal ("C++ team", "A.B. Freight").
6. **Validation.** An empty field, a `from` under 2 characters, `to` equal to `from`, or a 51st entry is refused with inline text, and the list is unchanged. Re-adding an existing `from` updates its placeholder.
7. **History stays valid.**
   - A second message after a swapped first one verifies on the server: history carries the sent text and its signature.
   - Retry resends the sent text.
   - A refused message restores the sent text into an empty composer.
8. **The limit counts what's sent.** A draft under 24,000 characters that goes over after swaps shows the over-limit alert and disables Send. No 413 round-trip.
9. **Replies restored (cut line, D4).**
   - A reply mentioning "Customer A" displays "Acme Foods" with the "Shown with your swaps restored" label.
   - An ambiguous placeholder stays as sent.
   - Copy conversation copies the displayed text.
10. **Storage failure is harmless.** If localStorage throws on read and write, the app loads, swaps work for the session and nothing shows an error.
11. **Nothing else changes.** Existing acceptance suites pass untouched: sending, retry, refusals, history, the example thread, access and new conversation. With an empty list, the request body is byte-identical to today's.
12. **Accessibility.**
   - Every control has an accessible name.
   - The preview toggle has `aria-expanded` and `aria-controls`.
   - Rejection text is tied to its field with `aria-describedby`.
   - "Your swaps" works by keyboard alone.
13. `bin/check.sh` is green. At 400 px and 1280 px, the purpose line, the notice and the box stay above the fold with "Your swaps" closed.

## Test order (outside-in; each red → green, one failure per turn, predict the failure first)

**0. Make the change easy** (refactor, `r` commit, no visible behavior change)
- **0a.** `MessageForm` takes `outgoing` (default identity). `handleSubmit` and the length check use `outgoing(draft)`. All suites stay green.
- **0b.** `setup.ts` clears `localStorage` after each test, so later tests can't leak state. No-op today.

**1. Thin first slice: one swap reaches the wire**
1. **Acceptance (`swaps.test.tsx`):** "sends the placeholder instead of a swapped word". Open "Your swaps", add Acme → Customer A, send "Acme is late", and expect `server.bodyOf(0)` to equal `{message: "Customer A is late", history: []}`. Red: there's no "Your swaps" control.
2. That drives the domain in `swaps.test.ts`, one case per turn:
   - `applySwaps` of one entry;
   - whole-word;
   - case-insensitive;
   - longest first;
   - simultaneous (no chaining);
   - regex characters;
   - `spans` positions in the output;
   - the empty list is identity (property: for any text, `applySwaps([], t).text === t`, using fast-check if it's already a dev dependency, otherwise 20 table cases).
3. It also drives `SwapPanel` plus a `useSwaps` hook with in-memory state (storage comes in step 3), and the `outgoing` wiring in `ConnectionTest`.

**2. The preview**
4. **Acceptance:** "Show what's sent shows the exact next request". Given a draft and two swaps, open the preview: its text equals the next `bodyOf(0).message` after sending, and each placeholder sits inside a `mark`. Red: no toggle.
5. **Acceptance:** typing in the draft updates the preview. "No swaps applied" shows with an empty list. The toggle hides while the draft is blank, and `aria-expanded` flips.

**3. Kept in this browser**
6. **`useSwaps.test.ts`:**
   - an add is written to `ddd-coach.swaps.v1`;
   - a fresh render reads it back;
   - corrupt JSON gives an empty list;
   - a wrong-shape value gives an empty list;
   - `getItem` or `setItem` throwing leaves the app working (AC 10).

   Red: nothing is written.
7. **Acceptance:** add a swap, unmount, re-render `<App />` and the chip is still there. Removing it stays removed across a re-render.

**4. Rules and copy**
8. **Acceptance:** the vendor note shows inside "Your swaps" (AC 4). `DataFlowNotice`'s sentence (U5) is asserted in the existing notice test.
9. `addSwap` validation, each case alone (AC 6). Then acceptance for one rejection: the inline text is tied by `aria-describedby`, the field keeps its value and the list is unchanged.
10. **Acceptance:** re-adding the same `from` in a different case replaces the placeholder, so the chip count is unchanged.

**5. Sent text through history, retry, refusal and the limit**
11. **Acceptance:** with a swap, send two messages. `bodyOf(1).history[0].prompt` is the sent text. Expected green through D2, so mutation-verify it: make `ConnectionTest` pass the raw draft to `send` and see it go red.
12. **Acceptance:** Retry resends the sent text (`bodyOf(1)` equals `bodyOf(0)`). A 413 refusal restores the sent text into an empty composer.
13. **Acceptance (AC 8):** a 23,995-character draft with a +6-character swap shows the over-limit alert, and Send is disabled.
14. **Regression:** with an empty list, the existing `sending.test.tsx` bodies stay byte-identical (the suite passing covers it).

**6. Replies restored (the cut line)**
15. `restoreSwaps` in the domain:
    - one entry;
    - case-sensitive;
    - whole-word;
    - an ambiguous placeholder is left alone;
    - longest first.
16. **Acceptance:** with a swap, a reply "Ask Customer A's account team." displays "Ask Acme Foods's account team." with the "Shown with your swaps restored" label. A reply with no placeholder gets no label.
17. **Acceptance:** Copy conversation (a clipboard stub, as the existing copy test does) contains the sent prompt and the restored reply.

**7. Mutation checks (verifier, `retroactive-test-check`)**
- Drop the whole-word lookarounds: step 2's "Tomorrow" case goes red.
- Apply swaps sequentially: the chaining case goes red.
- Build the preview from a second code path, e.g. `draft.replaceAll`: step 4 goes red on case or whole-word.
- Count the raw draft instead of `outgoing`: step 13 goes red.

## Verifying without paid calls (builder and verifier)

- **Everything runs in jsdom with the existing `stubFetch`.** `server.bodyOf(i)` is the network truth for "what's sent". There's no server change, so no handler tests change.
- `localStorage` comes from jsdom and is cleared per test (0b). Storage failure is simulated with `vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw … })`.
- **Local real-app check at $0:** in `npm run dev` with the dev server on :8888, open the app, add swaps, open the preview, then send with `network route` fulfilling `/api/chat` (full URL) with a canned `{reply, signature: ""}`. An in-page fetch spy shows the body. Reload between recordings, never during one, to prove persistence.
- `bin/check.sh` is green.

## Prompt and eval impact (#78)

- **No prompt change and no server change.** `coachInstructions`, the snapshots, the answer keys and `COACH_INSTRUCTIONS_VERSION` are untouched, so the #78 A/B ship rule doesn't apply.
- **What the model sees changes only in which placeholders appear.** The visitor chooses them. Her hand-sanitized threads already use "Customer A", and `EXAMPLE_THREAD` uses "Customer B/D" and "Carrier 3", so this is inside the eval fixtures' distribution.
- **Watch item, not in scope:** placeholders that collide with the thread's own words, e.g. "Maya → Ops" in a thread that already has an "Ops" team. That could blur attribution in the reply (#73's slip class). The panel doesn't prevent it. If the verifier or an interview sees it, the PO opens an issue for a collision warning, and any coach-side hint would go through the #78 A/B.

## Hosted demo script (verifier; `outputs/demos/slice-56.{mp4,png,md}`)

**Setup**
- Production after the deploy checklist (`agent-team.md`).
- A fictional thread of about 600 characters in the demo notes. Every name is invented:
  - "Acme Foods wants the Laredo lane re-rated…";
  - "Maya (night desk): …";
  - "Tom (Finance): …";
  - "ACME's rep says…".
- An in-page fetch spy panel in the right-hand column (`pointer-events:none`) prints the outgoing `message` of each `/api/chat` POST, plus a line "originals found in body: 0" computed against the demo's list.
- Budget: 2 paid calls, about $0.01.

**Take 1: build the list, preview, send**
1. Unlock and caption: "#56: swap names before anything leaves".
2. Open "Your swaps". Add Acme Foods → Customer A, Acme → Customer A, Laredo → Lane 1, Maya → Night desk and Tom → Finance. Caption: "The same six customers every time. Kept in this browser".
3. Show the vendor note, holding on it for 2 s.
4. Paste the thread and click "Show what's sent". The marked placeholders appear, including the all-caps "ACME's" → "Customer A's". Caption: "The exact text that leaves".
5. Send. The spy shows the body with placeholders and "originals found in body: 0". The "You" bubble shows the sent text.
6. The reply shows restored names with the "Shown with your swaps restored" label (if D4 shipped).

`record stop`.

**Take 2: kept across a visit** (a separate recording, since reloads stop the recorder)
1. `record start` after a reload. "Your swaps (5)" is still there.
2. Send a follow-up. The spy shows history carrying the sent text, and the reply arrives, which proves the signed history verified.

**Take 3: storage off** (optional, $0)
- In a context with site data blocked, the app loads and swaps work for the session with no error.

**Record in `slice-56.md`:**
- the two request bodies as the spy showed them, with the originals count;
- the two paid replies' first lines;
- a 1280×800 PNG of take 1 step 4, with the preview open and the marks visible.

## Out of scope

- **Patterns for rates, load IDs and contract terms**, e.g. "$ amounts → [rate]" or "5-digit numbers → [load]". 03a and 03b say these remain. It's a follow-up if the PO wants it, and the note says plainly that they still go.
- **Suggested swaps**, i.e. auto-detecting names in the draft.
- **Export and import of the list**, and syncing across machines. 03a notes the home and work split. It pairs with #5 and #6.
- **Swapping inside earlier history** after the list changes.
- **A collision warning** (see the eval watch item).
- **Server-side swapping**, or any server knowledge of swaps.
- **Changing `EXAMPLE_THREAD`.**

## Risks

- **False sense of safety.** A visitor may think the swap covers everything. Mitigation: the note is verbatim (AC 4), it names what isn't covered and the vendor block, and the preview makes misses visible before sending.
- **Whole-word misses a variant.** "Acme's" and "Acme-owned" match "Acme", but "Acmes" and "AcmeCorp" don't: they're one token. The preview shows the miss, the visitor adds the variant, and the note already says swaps hide "only the words you list".
- **Case-insensitive over-matching.** A short, common `from` such as "Ops → Team 1" would swap every "ops". The 2-character minimum and whole-word matching limit it, and the preview shows the result. It's an accepted trade-off (U2).
- **Restore mislabels.** If the model writes a placeholder in a different case, or the thread already contained the placeholder text ("Customer A" was real text), restore may map it wrongly. Mitigations: case-sensitive restore, ambiguous placeholders skipped, the label shown, and the "You" bubble always as sent. If this proves shaky, D4 is the cut line.
- **List edited mid-conversation.** Earlier replies are restored with the current list, so a removed swap makes an old reply show its placeholder again. It's display-only and the history is unaffected. Accepted.
- **localStorage is per browser.** An IT re-image wipes it (03a), and home and work laptops differ. This is out of scope and stated in the panel ("in this browser").
- **The count moves when a swap is added** (U4). A draft near 24k can tip over after adding a swap. The alert says so, and the text stays.
- **ConnectionTest growth** could push a function past 25 lines. The sweeper extracts `useComposer`.

## Suggested commits (committer owns them)

1. `r`: the `outgoing` seam in `MessageForm`, and localStorage cleared in test setup (0a, 0b).
2. `feat`: one swap is applied before sending, via the domain `SwapList` and the panel (1–3).
3. `feat`: "Show what's sent" preview with marks and a count (4–5).
4. `feat`: swaps kept in this browser, safe when storage fails (6–7).
5. `feat`: the vendor note, validation and replace-on-re-add (8–10).
6. `feat`: sent text through history, retry, refusal and the limit (11–14).
7. `feat`: replies restored for display and copy, the cut line (15–17).
8. `docs`: the demo report and screenshot (verifier).

The sweeper then does its ACN pass.

## Decisions for the user / PO (recommended defaults marked)

- **U1: where "Your swaps" lives.** **Recommended: a closed disclosure in the composer foot, "Your swaps (N)".** The first screen stays as #63 and 03b's above-the-fold rule left it, and the count shows the list is active. The alternative is Exploration 03's always-open panel, which is more visible but pushes the box down at 400 px.
- **U2: case matching.** **Recommended: case-insensitive, whole-word.** Sanitizing must catch "ACME" and "acme", while "Tom" must not eat "Tomorrow". The alternative is exact case, which is more predictable but misses variants, and a miss is a leak.
- **U3: what the log shows.** **Recommended: "You" as sent; replies restored, with a label.** The log proves what left, and replies read in her real names. The alternatives are everything as sent (simplest, and restore is dropped) or everything restored (hides what left).
- **U4: what the counter measures.** **Recommended: the sent text** (`outgoing(draft)`), so the 24k rule can't fail server-side after a swap. The alternative is the draft, which is familiar but can 413 on send.
- **U5: the notice.** **Recommended: add one sentence**, "Add swaps below to replace names before sending", and keep the rest verbatim. The alternative leaves the notice alone, so the swaps are only discoverable through the disclosure.
- **U6: a storage failure.** **Recommended: silent, session-only list.** The alternative is a quiet line in the panel, "Swaps won't be kept in this browser", which is more honest but is copy we'd need to test in a blocked-storage context.
- **U7: list size.** **Recommended: 50 entries.** She cites 6 customers plus lanes and colleagues, and 50 bounds the regex. The alternative is no limit.
- **U8: restore scope (D4 cut line).** **Recommended: in this slice, as the last droppable group.** The alternative is to ship without restore and file it as a follow-up, which the issue allows ("if cheap").
- **FYI #34:** this slice supports "sanitized input only" and doesn't change the provider decision. The note says so.
- **FYI #5 and #6:** exporting and importing the list across machines is left for those issues.
