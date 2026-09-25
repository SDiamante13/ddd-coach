# Slice 86 (#86): restore real names from the swap list, in the browser only

The spec is issue #86's body, cut from #56's D4. It ships before #6.

In one line: a reply that mentions "Customer A" shows "Acme Foods", restored in this browser from the visitor's swap list and labelled, and Copy the conversation copies the restored text. The history sent back to the server keeps the placeholders, so real names never leave and the signed turns stay valid.

## Goal fit
- **ICP:** without restore, her RFC table (#6) carries placeholders and she reverse-swaps by hand, which undoes the time #56 saved.
- **Honesty:** the network still only ever sees placeholders. The restore is local, marked, and never guesses.
- **DDD proportionality:** one pure domain function next to `applySwaps` and a display seam. No server, contract or prompt change.

## Verified facts (main at `77ccc76`)
- `src/domain/swaps.ts`: `applySwaps(list, text) → {text, spans}` is whole-word (Unicode lookarounds), case-insensitive, longest first and single-pass.
- `useComposer` owns `useSwaps()` and `outgoing = applySwaps(...)`. `conversation = () => conversationText(exchanges)` feeds Copy the conversation (refusals and the clear confirmation's "Copy first").
- `Exchange.prompt` and `.reply` hold the sent and received text, which are signed. `turnsOf(exchanges)` builds history from them.
- `ExchangeOutcome` renders `<ReplyView reply={exchange.reply} />` (#64). `PromptText` renders the "You" text as sent.
- **No prompt, server or eval change.** The model only ever sees placeholders, as today.

## Decisions
- **D1. `restoreSwaps(list, text) → {text, spans}`** in `src/domain/swaps.ts`: the exact inverse of `applySwaps`.
  - Each placeholder `to` maps back to its `from`, as the visitor typed it.
  - Whole-word, longest placeholder first, one pass, so a restored name is never restored again.
  - **Case-sensitive (U4):** it matches the placeholder exactly as typed.
  - **Ambiguous placeholders (U3) stay as sent:** two swaps sharing one placeholder ("Acme Foods" and "Acme" both → "Customer A").
  - A placeholder no longer in the list stays as sent (no guessing).
- **D2. One display seam:** `useComposer` exposes `restore = (text) => restoreSwaps(swaps, text)`.
  - `ExchangeLog` → `ExchangeOutcome` → `ReplyView` parses and renders `restore(reply).text`.
  - `conversationText(exchanges, restore)` restores both prompts and replies for Copy the conversation (U5).
  - `Exchange` data and `turnsOf` are untouched, so history keeps the placeholders.
- **D3. Marker (U2):** when a reply had at least one placeholder restored, a quiet line under it reads "Names restored in this browser from your swaps." With no restore, nothing is shown.
- **D4. The "You" bubble stays as sent (U1)**, which matches #56's "Show what's sent" proof of what left.

## Acceptance criteria
1. With the swap Acme Foods → Customer A:
   - the visitor sends "Acme Foods wants the lane re-rated.";
   - a reply "Customer A is split on rebook." shows "Acme Foods is split on rebook." with the marker;
   - the "You" bubble shows the sent "Customer A wants the lane re-rated.".
2. **Structured replies too:** a table row whose meaning names "Customer A" shows "Acme Foods", and so do the question and its source lines.
3. **History unchanged:** the next request's `history[0].reply` contains "Customer A" and not "Acme Foods", byte-identical to the model's reply.
4. **Copy the conversation** carries "Acme Foods" in both the prompt and the reply.
5. **No guessing:**
   - after the swap is removed, the reply shows "Customer A" with no marker;
   - an ambiguous placeholder stays as sent;
   - "customer a" in a different case stays as sent.
6. **No chaining, and whole words only:** with the swaps Acme → Customer A and Beta → Customer AB, "Customer AB" restores to "Beta", never "Acmeb". "Customer Al" isn't touched.
7. **Round trip (property, fast-check):** for texts whose list words are written as typed and whose placeholders are unique and absent from the text, `restoreSwaps(list, applySwaps(list, text).text).text === text`.
8. `bin/check.sh` is green. The existing #56 suites are untouched.

## Test order (outside-in; one failure per turn)
1. Acceptance (`src/acceptance/restoredNames.test.tsx`, through the swap panel and the fetch stub): AC 1's reply shows "Acme Foods". This drives `restoreSwaps` (a unit red → green: the minimum, then triangulating on AC 5 and 6), then the seam into `ReplyView`.
2. The marker, then the "You" bubble as sent (a guard), then history byte-identical (a guard, mutation-checked).
3. Structured replies (AC 2).
4. Copy the conversation (AC 4): `conversationText` gains `restore`.
5. The AC 5 cases (removed swap, ambiguity, case) and the AC 7 property.

## Hosted demo (verifier, about $0.01)
1. Add the swaps Acme Foods → Customer A and Laredo → Lane 1.
2. Paste a short fictional thread naming Acme Foods and Laredo, then send.
3. The reply shows the real names with the marker, while the "You" bubble and "Show what's sent" show placeholders. The fetch spy shows the placeholders in both requests.
4. Copy the conversation into a text area: real names.
5. Remove a swap: that name reverts to its placeholder, with no marker if none are left.

## Out of scope
- #6 export. It'll take the same `restore` seam.
- Highlighting each restored word.
- Restoring inside the "You" bubble (U1).
- Case-insensitive restore.

## Decisions (recommended defaults marked)
- **U1: the "You" bubble.** **Recommended: as sent (placeholders)**, which proves what left. The alternative restores it too, which reads better but hides what left.
- **U2: the marker.** **Recommended: one quiet line under a restored reply**, "Names restored in this browser from your swaps.". The alternatives are highlighting each restored word (noisier, and it needs span mapping through the parser) or no marker (which hides that the text differs from what the model wrote).
- **U3: an ambiguous placeholder.** **Recommended: left as sent.** The alternative picks the longest `from`, which is a guess.
- **U4: case.** **Recommended: exact case.** A placeholder the model re-cased stays as sent. The alternative is case-insensitive, which risks restoring the thread's own words.
- **U5: Copy the conversation.** **Recommended: prompts and replies both restored**, since it's her document. The alternative restores replies only, which mixes placeholders and names.
