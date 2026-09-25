# Slice 50: paste box (#50, #51, #54, #57)

A first visit says in one line what the coach is for, and the empty box shows an example of what to paste. The message box takes a pasted thread with its line breaks, grows to a max height and then scrolls. Near the per-message cap it shows a count; over the cap it says by how much and keeps your text. A refused message comes back into the box instead of vanishing. Long messages in the log collapse to 4 lines with "Show more". Focusing Retry never leaves it under the docked composer.

Issues:
- #50: multiline paste textarea.
- #51: keep the draft on a 413, state the limit, collapse long messages. P1.
- #54: the sticky composer covers Retry.
- #57: purpose line and placeholder example. P1; no tour, modal or extra click.

One slice, one demo. **Desktop-first** (ICP): 390 px must work with no horizontal scroll, but nothing is designed phone-first. It builds on main plus #37 (signed turns: `Turn.signature`, `COACH_UNVERIFIED`) and doesn't touch `server/turnSignature.ts`, `server/config.ts`, `server/chatHandler.ts` or `netlify/functions/chat.mts`.

**Visual spec: DESIGNER's `outputs/design/explore-04/`** (`handoff.md`, `pastebox.html` `<style>` block, stills `p1`–`p5`). The builder follows it for visuals, except for the deviations listed under Decisions (layout mode, the two-parts button, the notice redesign).

## Goal fit

| Goal | How this slice contributes |
|---|---|
| Solve real DDD problems | #4's main job is "paste a messy thread". Today it breaks before any coaching: newlines are flattened, so speakers merge and the coach gave Tom's line to ops (03b). A 413 also cleared a 12k draft without saying the limit, Priya cut it by guesswork and left, and nothing on the page said to paste a thread at all. This slice removes those blockers, so #4 can be judged on its coaching |
| Maximize learning | The first client-side rule taken from the shared contract (one cap constant for client and server, so #4 changes it in one place). It also sets a clear draft policy: a *refused* message returns to the box, and a *failed* one gets Retry. And it's a real a11y layout problem, WCAG 2.4.11 Focus Not Obscured, solved in CSS and checked in a browser |
| Fun | Pasting feels right: the text keeps its shape, the box grows, a 12k paste doesn't take over the log, and the first screen invites you in |

## Verified facts (main at `deb0176` plus #37 as committed)

- `src/ui/MessageForm.tsx` owns `draft` in `useState`. It renders `<input type="text" autoFocus>` inside `<label>Message …</label>`, and calls `setDraft("")` before `onSend(prompt)`. `handleSubmit` does **not** check `busy`. Today an Enter while busy is stopped only because implicit submission is blocked while the default button is disabled.
- `parsePrompt` (`src/domain/exchange.ts:45`) trims and rejects blank text. The server measures `prompt.length` **after the trim**, in UTF-16 code units (`server/chatRequest.ts:20`).
- `MAX_MESSAGE_CHARS = 8_000`, `MAX_CONVERSATION_CHARS = 24_000` and `MAX_HISTORY_TURNS = 50` are in `server/chatRequest.ts:8-10`. `chatRequest.test.ts` and `chatHandler.test.ts` import `MAX_MESSAGE_CHARS` from `./chatRequest.ts`. #4 will raise the caps.
- `askCoach` marks 400 and 413 as `retryable: false` (`src/api/askCoach.ts:20`). The refusals behind that are: `COACH_MESSAGE_TOO_LONG` (message cap, or a body over 128 KiB), `COACH_TOO_LONG` (conversation cap), `COACH_UNVERIFIED`, and "Send a message.".
- `DataFlowNotice.tsx` exports `DATA_FLOW_NOTICE` as a constant, and a test asserts its text. `App.tsx` renders `h1`, `DataFlowNotice` and `ConnectionTest` (log + form).
- `base.css`:
  - `main > p` styles the notice as a sunken box, so a purpose `<p>` needs its own rule.
  - `li > p:first-child` is the "You" card, and `li > p:nth-child(2):not([role=alert])` is the "Coach" card.
  - `form` is `position: sticky; bottom: var(--space-4)`. A sticky box keeps its space in flow, so the end of the page is never covered; the overlap happens mid-scroll and when focus scrolls an element to the viewport's bottom edge.
- **Browser check (Chromium via agent-browser, pathfinder scratch page):**
  - With `html { scroll-padding-bottom: 300px }`, both `el.focus()` and a real `Tab` scroll a Retry that sits under a 250 px sticky form to above the form (Retry bottom 260 < form top 534). Without it, Retry stays covered (671 > 534).
  - `scroll-margin` on an ancestor `li` does **not** help here, because the focused button is the scroll target.
  - `CSS.supports("field-sizing", "content")` is `true`. A textarea with `field-sizing: content` and a max height grew 51 → 81 → 126 px, then scrolled internally.
- **explore-04** (DESIGNER, read after it was finished):
  - a textarea with the Send button to its right;
  - the hint "Enter sends · Shift+Enter adds a line";
  - a count at ≥80% of the cap in amber (a literal `#8a5a10`, not a token);
  - over the cap: an alert-tinted box, `aria-invalid`, and Send disabled;
  - "Show more" / "Show less" at a 4-line clamp;
  - a purpose line under the h1;
  - a two-line placeholder example;
  - touch: Enter adds a line.

  Its prototype CSS switches desktop to a fixed-height screen where the log scrolls on its own (`main{height:100dvh}`, `ol[role=log]{overflow-y:auto}`), and uses page scroll at ≤480 px. Its handoff *text* for #54 describes page scroll ("bottom padding plus scroll-margin").

## Decisions

**1. Purpose line (#57), in one constant.**
- `src/ui/PurposeLine.tsx` exports `PURPOSE_LINE`, following `DATA_FLOW_NOTICE`, and renders `<p className="purpose">` under the h1, before the notice. **Softened for honesty (team-lead decision):** "Paste a messy thread or meeting notes about your domain, line breaks and all, and talk it through with a DDD coach." explore-04's line ("…finds the words people use differently, puts the events in order, and asks what to check next") describes #4's behavior. #4 sharpens the constant when that behavior ships.
- Styled as in explore-04: `main > p.purpose`, ink color, `--text-md`, no box.
- **It stays visible after the first send.** explore-04 hides it after the first send to save height in its fixed-height layout. With page scroll (decision 8) it just scrolls away, and hiding it would mean lifting `useExchanges` into `App`. Revisit with #55 and the app shell.
- **Not in this slice:** the "Try an example thread" button (explore-04 marks it optional), moved to #4.

**2. Placeholder example (#57), in one constant.**
- `PASTE_EXAMPLE` (same module): `"e.g. Ops: a booking exists the moment the customer submits\nFinance: not for us, it's a booking once it's invoiceable"`, set as the textarea's `placeholder`.
- The accessible name stays "Message" from the `<label>`. A placeholder is not a label.
- `::placeholder` uses `--color-ink-muted` for contrast.

**3. Textarea, auto-grow in CSS (#50).**
- `<textarea>` inside the existing `<label>` (or `for`/`id` as in explore-04), keeping the name "Message", `autoFocus`, `enterKeyHint="send"` and `rows={2}`.
- `field-sizing: content`, `min-height: calc(2 * 1.45em + 2 * var(--space-2))`, `max-height: 38vh` (30vh at ≤480 px), `overflow-y: auto`, `resize: none`.
- Browsers without `field-sizing` (Firefox, as of writing) keep 2 rows and scroll. **No JS autosize fallback**, although explore-04 suggests one: it's a desktop Chromium/Safari ICP, and JS measuring can't be tested in jsdom. Flagged.
- The composer layout follows explore-04:
  - row 1: the "Message" label;
  - row 2: the textarea (flex 1) with Send to its right, aligned to the bottom;
  - row 3: the over-limit box (only when over);
  - row 4: the foot, with the key hint on the left and the count on the right.
- At ≤480 px the key hint is hidden, as in explore-04.

**4. Keys (#50): Enter sends, Shift+Enter adds a new line; on touch, Enter adds a new line.**
- Enter without Shift calls `form.requestSubmit()`. Cmd/Ctrl+Enter sends as well.
- Nothing is sent while an IME is composing (`event.nativeEvent.isComposing`).
- On `matchMedia("(pointer: coarse)")`, Enter keeps its default (a new line) and the Send button sends, as in explore-04. It's a two-line guard, not phone-first design. When `matchMedia` is missing (jsdom), treat the pointer as fine.
- The hint "Enter sends · Shift+Enter adds a line" is visible and is part of the textarea's `aria-describedby`.
- **`requestSubmit()` fires even while Send is disabled**, so `handleSubmit` must return early when `busy` (keeping the draft) and when over the limit.

**5. Per-message limit from the shared contract (#51).**
- Move `MAX_MESSAGE_CHARS` to `src/shared/chatContract.ts`. `server/chatRequest.ts` imports it and re-exports it, so the server tests don't change. No literal `8000` in `src/ui`.
- `messageLength(text) = text.trim().length` lives next to `parsePrompt`, so client and server count the same way (trimmed, in UTF-16 units; an emoji counts 2).
- A pure `draftLimit(length, max) → "ok" | "near" | "over"`:
  - near when `length ≥ 0.8 × max`;
  - over when `length > max`.
- Numbers are formatted with `Intl.NumberFormat("en-US")`.

**6. Count, over-limit box and Send (#51), per explore-04.**
- Always: the textarea's description includes "Up to 8,000 characters." It isn't visible.
- `near`: the count `6,412 / 8,000 characters` shows in the label font, with the near color.
  - **Token gap:** explore-04 uses a literal `#8a5a10`. Ask DESIGNER for a `--color-warn` light/dark pair in `tokens.css`. Until then, use `--color-ink-muted`. Don't invent the value.
- `over`:
  - the count turns `--color-alert`, and the textarea gets `aria-invalid="true"` and the alert tint;
  - **Send is disabled**, as in explore-04;
  - the over box (`role="alert"`, per explore-04) reads: "1,412 characters over the 8,000 limit. Your text stays here. Trim it to send."
- **"Send in two parts" is not in this slice** (explore-04: "optional, later"), so its copy clause and button are dropped.
- An over-limit submit (Enter, or `requestSubmit` from anywhere) sends nothing and keeps the draft. This is the client-side pre-check that slice 2 left out of scope; it only covers the per-message cap.

**7. Draft policy (#51): clear on accepted send; a refused message returns to the box.**
- The draft clears when a valid message is sent (as today). A message that *fails* (network, 5xx, 504, 429) keeps its Retry in the log, and the draft is not restored, because that would duplicate it.
- A message that is *refused* (`retryable: false`: 400/413, including `COACH_TOO_LONG` and `COACH_UNVERIFIED`) comes back into the box, **only if the box is empty** (don't clobber new typing).
- The refused entry stays in the log with its alert, so the existing tests keep passing.
- explore-04's "never clear the draft on failure" is read as this rule. Restoring on retryable failures would duplicate what Retry already does.
- To do this, lift the draft to `ConnectionTest`:
  - `MessageForm` becomes controlled (`draft`, `onDraftChange`);
  - `useExchanges({ onRefused })` calls back with the prompt;
  - add a pure `restoredDraft(current, prompt)` that returns `prompt` when `current.trim() === ""`, and `current` otherwise.
- The server's 413 text is unchanged. With the pre-check, the only 413 a visitor normally meets is the conversation cap. That shows `COACH_TOO_LONG` in the log and puts the draft back in the box.

**8. Layout and #54: keep page scroll and the sticky composer, and reserve scroll padding.**
- `html { scroll-padding-bottom: var(--composer-reserve) }` in `base.css`, where `--composer-reserve` is at least the composer's max height plus its `bottom` offset: the textarea max (38vh / 30vh), plus label, over box, foot, padding and border. That comes to about `calc(38vh + 12rem)`, and `calc(30vh + 13rem)` at ≤480. The builder measures it with the over box showing and the textarea at max, and rounds up.
- Focus, `scrollIntoView` and Tab then never leave Retry under the composer (checked in Chromium). The end of the log is always reachable, because sticky keeps its space.
- Add explore-04's `ol[role=log] { padding-bottom: var(--space-4) }`. Its `li { scroll-margin-bottom }` isn't used, because it doesn't move a focused button.
- **Deviation from the explore-04 prototype:** its fixed-height desktop layout isn't adopted in this slice. Without #55's collapsed notice (not in this slice), and with the purpose line always visible:
  - at 1280×800, h1 + purpose + notice + gaps take about 330 px;
  - a max-height composer takes about 420 px;
  - that leaves about 50 px of log.

  explore-04's p3 still shows about 110 px even *with* the notice collapsed. Page scroll is what explore-04 already uses at ≤480 and what its #54 handoff text describes. Move to the fixed-height layout together with #55 (notice collapse) if DESIGNER still wants it (team-lead: decided, see Decisions recorded).

**9. Collapse long user messages in the log (#51), 4 lines per explore-04.**
- Replies aren't collapsed. They're capped at 600 tokens.
- Add a pure `previewOf(text) → { preview, hidden }`, with `PREVIEW_LINES = 4` and `PREVIEW_CHARS = 320` (about 4 wrapped lines in the bubble at desktop width) as presentation constants in `src/ui/`. The preview is the first 4 lines, cut at 320 characters; `hidden` counts the characters left out.
- Collapsed: the preview plus "…", then a "Show more" button (`type="button"`, `aria-expanded="false"`, `aria-controls` pointing at the prompt `<p>`'s id). Expanded: the full text plus "Show less".
- The button sits **inside** the prompt `<p>` (explore-04 puts it inside the bubble, below the text, `.more` style: `display: block; margin-top: var(--space-2); min-height: 32px`). Then `li > p:first-child` / `p:nth-child(2)` in `base.css` keep working.
- Truncating the text itself, not explore-04's `-webkit-line-clamp`, keeps it deterministic and testable in jsdom, and a screen reader reads the preview, not 12k characters. It looks the same: 4 lines, an ellipsis, then the pill.

**10. Unchanged, or not in this slice:**
- Server copy and status codes, the `askCoach` mapping, and reply rendering.
- explore-04's **#55 notice redesign** (the `aside`, `details`, and the model/operator lines): that's #55, and it waits on the decisions in #34 and #43. `DATA_FLOW_NOTICE` and its styling stay as they are.

## Acceptance criteria

1. **Purpose line (#57).** On load, one visible line under the heading reads `PURPOSE_LINE` (the text comes from one exported constant). There's no dialog, tour or extra click; the box is focused and usable at once.
2. **Placeholder (#57).** The empty box shows `PASTE_EXAMPLE` as its placeholder. The accessible name is still "Message".
3. **Multiline paste (#50).** Pasting a 12-line text keeps all 12 line breaks in the box. After Send, the "You" card shows separate lines, and the request `message` contains the `\n`s (trimmed at the ends only).
4. **Keys (#50).**
   - Enter sends.
   - Shift+Enter adds a new line and sends nothing.
   - Ctrl/Cmd+Enter sends.
   - Enter during IME composition sends nothing.
   - With a coarse pointer, Enter adds a new line and Send sends.
   - Blank, whitespace-only or newline-only text sends nothing.
   - Enter while a reply is pending sends nothing and keeps the draft.
   - The key hint is visible (≥481 px) and is part of the textarea's description.
5. **Auto-grow (#50)**, in Chromium. The box starts at 2 lines, grows with its content, stops at 38vh (30vh at ≤480), then scrolls internally. Box plus Send span the column width at 1280 and at 390.
6. **Near and over the limit (#51).**
   - Below 80% of `MAX_MESSAGE_CHARS`, no count shows.
   - At ≥80%, the count shows `n / MAX characters`.
   - At `MAX` it isn't flagged.
   - At `MAX + 1`, the count is alert-colored; the textarea is `aria-invalid`; Send is disabled; the alert reads "1 character over the 8,000 limit…" (the builder handles the singular).
   - Every number comes from the constant.
7. **Over-limit not sent (#51).** Enter or `requestSubmit` on an over-limit draft makes no request, adds no log entry, and leaves the draft unchanged.
8. **Refused draft restored (#51).**
   - A non-retryable refusal (413 or 400) puts that message back into an empty box, and the log entry shows the refusal without Retry.
   - Text typed before the refusal arrived is kept.
   - A retryable failure (502, network, 504) leaves the box empty and offers Retry.
9. **Collapse (#51).**
   - A user message over 4 lines or 320 characters shows a preview ending in "…" and a "Show more" button with `aria-expanded="false"`.
   - Activating it (click, Enter or Space) shows the full text, and the button becomes "Show less" with `aria-expanded="true"`.
   - Short messages render as today, with no button.
   - The You and Coach labels still render.
10. **Retry never hidden (#54).** At 1280×800 and 390×844, with the textarea at max height and the over box showing:
    - focusing or tabbing to a Retry that sits under the composer scrolls it fully above the composer (`retry.bottom ≤ form.top`);
    - a scripted click on Retry reaches the button, not the composer.
11. **390 px.** `scrollWidth === clientWidth`, with a 12k-character single-line message in the log (collapsed) and in the box.
12. **Nothing regressed.** The existing tests pass. The textbox query `getByRole("textbox", { name: "Message" })` is unchanged, and `bin/check.sh` is green.

## Test order (outside-in, RTL + user-event, each red → green)

All in `src/App.test.tsx` unless noted. Use `user.click(box)` + `user.paste(text)` for long text.

1. The purpose line is visible on load: `getByText(PURPOSE_LINE)` (criterion 1). Import the constant, as the notice test does.
2. `getByRole("textbox", { name: "Message" })` has `placeholder` `PASTE_EXAMPLE` (criterion 2).
3. Paste `"line one\nline two\nline three"`, then `{Enter}` → `bodyOf(0).message` keeps the `\n`s (criterion 3). This is the first real failure: `<input>` drops them.
4. `user.type(box, "A{Shift>}{Enter}{/Shift}B")` → no fetch, and the value is `"A\nB"`. Then `{Enter}` sends `"A\nB"` (criterion 4).
5. `{Control>}{Enter}{/Control}` sends. A newline-only draft plus `{Enter}` doesn't (criterion 4; extend the existing blank test with `it.each`).
6. The existing "ignores another submit while a reply is pending" stays green after the switch to `requestSubmit`. Add: the box still holds "Again" (criterion 4).
7. `fireEvent.keyDown(box, { key: "Enter", isComposing: true })` → no fetch (criterion 4).
8. Coarse pointer: `vi.stubGlobal("matchMedia", () => ({ matches: true }))`, then `{Enter}` → no fetch, the value ends with `\n`, and a Send click sends (criterion 4).
9. The accessible description contains "Shift+Enter" and "Up to 8,000 characters", built from the constant (criteria 4 and 6).
10. Counter:
    - paste `0.8×MAX − 1` characters → no count;
    - one more character → `n / MAX characters`;
    - at `MAX` → no alert and Send enabled;
    - `MAX + 1` → `aria-invalid="true"`, Send disabled, and `getByRole("alert")` inside the form names "1 character over the 8,000 limit" (criterion 6).
11. Over-limit `{Enter}` → `fetchMock` not called, log empty, value unchanged (criterion 7).
12. Send "Long one" → 413 `COACH_MESSAGE_TOO_LONG` → the box value is "Long one", and the alert shows without Retry. Use `it.each` to add 413 `COACH_TOO_LONG` and 400 `COACH_UNVERIFIED` (criterion 8; extends the existing refusal tests).
13. Send "A" → while it's pending, type "B" → 413 → the box stays "B" (criterion 8).
14. Send "A" → 502 → the box is empty and Retry is present (criterion 8).
15. Send a 10-line message and reply:
    - the "You" card shows lines 1–4 and "…", and line 5 isn't in the document;
    - there's a "Show more" button with `aria-expanded="false"`;
    - click → line 10 is visible, and the button is "Show less", `aria-expanded="true"`;
    - click again → collapsed (criterion 9).
16. A 2-line message → no button, and the text matches exactly (criterion 9).

Units:

17. `messageLength` (`src/domain/exchange.test.ts`): trims, and counts an emoji as 2.
18. `draftLimit` boundaries: `0.8×max − 1`, `0.8×max`, `max`, `max + 1`.
19. `restoredDraft`: empty or whitespace → prompt, otherwise current.
20. `previewOf` (`src/ui/promptPreview.test.ts`): 4 lines → nothing hidden; 5 lines → 4 lines plus the hidden count; 320 vs 321 characters on a single line.

Server: no new tests. Move the constant, keep the re-export, and run the server tests unchanged.

Browser only (verifier): criteria 5, 10 and 11, and the visual parts of 1, 3 and 9.

## Layout and types

```
src/shared/chatContract.ts   + export const MAX_MESSAGE_CHARS = 8_000
server/chatRequest.ts        import from shared; re-export MAX_MESSAGE_CHARS
src/domain/exchange.ts       + messageLength(text)
src/ui/PurposeLine.tsx       PURPOSE_LINE, PASTE_EXAMPLE constants; <PurposeLine/>
src/App.tsx                  h1, <PurposeLine/>, <DataFlowNotice/>, <ConnectionTest/>
src/ui/draftLimit.ts         draftLimit(length, max), restoredDraft(current, prompt) (pure)
src/ui/useExchanges.ts       useExchanges({ onRefused }) — called when result is !ok && !retryable
src/ui/ConnectionTest.tsx    owns draft state; onRefused → setDraft(c => restoredDraft(c, prompt))
src/ui/MessageForm.tsx       controlled textarea, keys, busy/over guards, disabled Send when over
src/ui/DraftFoot.tsx         key hint, count, over box (keeps MessageForm methods ≤ 25 lines)
src/ui/promptPreview.ts      previewOf(text), PREVIEW_LINES = 4, PREVIEW_CHARS = 320 (pure)
src/ui/PromptText.tsx        prompt <p> with the inline Show more / Show less button
src/ui/ExchangeEntry.tsx     <PromptText> instead of <p>{exchange.prompt}</p>
src/styles/base.css          explore-04 rules (purpose, textarea, composer rows, foot, count, over box, .more),
                             html scroll-padding-bottom + --composer-reserve, log padding-bottom.
                             Not the fixed-height-screen block or the notice rules.
```

```ts
type Preview = { preview: string; hidden: number }   // hidden === 0 → render as-is
type DraftLimit = "ok" | "near" | "over"
type MessageFormProps = { busy: boolean; draft: string; onDraftChange: (text: string) => void; onSend: (prompt: Prompt) => void }
```

Refactor first ("make the change easy"): lift `draft` into `ConnectionTest` with a controlled `MessageForm`, and move `MAX_MESSAGE_CHARS` to the shared contract, with no behavior change. Both are structural commits before the first `feat`.

## Out of scope

- Raising the caps and the 20k paste (#4).
- "Try an example thread" (→ #4).
- Purpose copy refinement (#4).
- "Send in two parts" (explore-04, later).
- The #55 notice redesign and collapse, and explore-04's fixed-height desktop layout (with #55).
- A pre-check or meter for the conversation cap, and trimming (B38 #7, explore-02).
- Collapsing coach replies. Auto-scroll to the newest entry.
- A JS autosize fallback for Firefox.
- Server copy changes. Persistence.

## Risks

- **The purpose line stays generic until #4.** It's honest now, but it undersells the product. #4 must update `PURPOSE_LINE`, and its test imports the constant, so only the constant changes.
- **`requestSubmit` bypasses the disabled Send.** Without the busy and over guards, Enter would send while pending or over the cap. Tests 6 and 11 catch it.
- **`--composer-reserve` drifts from the real composer height** when the over box or foot changes. The verifier measures it at both widths. Over-reserving leaves a gap; under-reserving brings the bug back.
- **Only Chromium is verified** for `scroll-padding` on focus and for `field-sizing`. Firefox gets 2 fixed rows plus scroll. There's no Safari check; the demo md says so.
- **Near-limit color token is missing.** `--color-ink-muted` is used until DESIGNER supplies `--color-warn`.
- **Restoring a refused draft duplicates text** (log preview plus box), on purpose. After `COACH_TOO_LONG` the advice is "Reload", which loses the box; the user can copy first. It stays a dead end until #4/B38.
- **Count semantics.** Client and server both use the trimmed `.length`; keep them in sync if either changes.
- **The `base.css` coupling.** The Show more button must sit inside the prompt `<p>`. A wrapper element would break the You/Coach labels.
- **The over box is `role="alert"` (per explore-04), and its number changes as you trim.** Screen readers may re-announce it assertively on every deletion. If the verifier's keyboard pass finds it too chatty, keep `role="alert"` on a static sentence ("Over the 8,000-character limit. Your text stays here.") and move the running number to the non-live count.
- **Demo cost.** Step 7 sends about 24k characters to the real model.

## Demo script (verifier)

Use `agent-browser --session verifier` throughout, against the running dev server at http://localhost:8888. Confirm that `curl -s -o /dev/null -w '%{http_code}' localhost:8888` gives 200; don't start another server. Record with `record start $PWD/outputs/demos/slice-50.webm`, in a desktop-sized context. Inject a caption banner per step (`pointer-events:none`, body padding). Before step 3, install a pass-through fetch spy with `window.__bodies=[]`. Use CSS selectors (`textarea`, `form button[type=submit]`, `li[data-status=failed] button`), not `@eN` refs. Don't reload during a take.

Prepare, in the verifier's scratchpad (not the repo), a sanitized 14-line #booking-split thread of about 1.2k characters, one speaker per line, with team labels as in explore-04 (`Ops: …`, `Finance: …`, `Carriers: …`).

1. Open the page. Caption: "Slice 50: paste box (#50 multiline, #51 limit + draft + collapse, #54 Retry visible, #57 purpose line)."
2. First visit, with no clicks: the purpose line is under the heading, and the empty box shows the "e.g. Ops: …" placeholder. Caption: "First visit: what it's for, and what to paste."
3. `fill textarea "<thread>"`. Check with eval: `value.split("\n").length === 14`, the height grew, and it's capped at 38vh with `scrollHeight > clientHeight` once the text is long. Caption: "Line breaks kept; box grows, then scrolls."
4. `press Shift+Enter`, `type "What's a booking here?"`, `press Enter`. The spy's last `message` contains `\n`. The "You" card shows 4 lines, "…" and **Show more**. Caption: "Shift+Enter = new line, Enter = send; long message collapsed." Wait for the reply.
5. Click Show more → the full thread, "Show less", and `aria-expanded="true"`. Click Show less. Caption: "Show more / Show less, a real button."
6. In eval, fill to 85% of the cap, with the length read from the page's count and not hardcoded. The count appears. Then fill `MAX + 1412`:
   - the over box reads "1,412 characters over the 8,000 limit. Your text stays here. Trim it to send.";
   - Send is disabled and the textarea is red-tinted;
   - `press Enter` → `__bodies.length` is unchanged, no new entry, and the draft is kept.

   Caption: "Over the limit: says by how much; nothing sent; text stays." Clear the box.
7. Refused draft restored, on the real conversation cap:
   - Send `"Reply only OK. " + filler` at about `MAX − 100` characters, twice.
   - Then a third. The server returns 413 "This conversation is too long… Reload the page…". There's no Retry, and **the box holds the third message again** (check it with eval).
   - Caption: "Refused → your text comes back to the box."
   - If #4 has raised the caps by demo time, use a one-shot fetch stub → 413 `COACH_MESSAGE_TOO_LONG` instead, and say so in the md.
8. `record stop`. Start take 2 (fresh context), with captions and spy re-injected.
9. #54, desktop:
   - `set offline on`, send "Offline one", which fails with "Could not reach the coach." + Retry. `set offline off`.
   - Send 3 short messages until the log is taller than the viewport.
   - Fill the box with 40 lines plus over-limit text, so it's at max height with the over box showing.
   - Scroll with eval so Retry is about 60 px above the viewport bottom, under the composer.
   - `focus "li[data-status=failed] button"`; also `press Tab` from the preceding focusable element. Eval `retry.bottom <= form.top` → true both times.
   - Clear the box, click Retry → a reply arrives.
   - Caption: "Focus never hides Retry under the composer."
10. `record stop`.

Off-video:

11. **1280×800 screenshot.** `set viewport 1280 800`. The state: the purpose line; a replied entry with the collapsed 14-line thread ("Show more" visible); and a 3-line draft in the box. Save to `$PWD/outputs/demos/slice-50.png`.
    - Also take a first-visit shot (fresh page, placeholder showing) at `$PWD/outputs/demos/slice-50-first-visit.png`, to compare with explore-04's `p1-first-visit.png`.
12. **390 px.**
    - `set viewport 390 844`, repeat the step-9 focus check, and paste a 12,000-character single-line string (over at 8k).
    - Eval `scrollWidth === clientWidth` → true.
    - Screenshot to `$PWD/outputs/demos/slice-50-phone.png` (compare with explore-04's `p5`).
13. **Keyboard only.** From Show more, Tab to Retry and then to the box. Focus rings are visible, and nothing is obscured. Note the result in the md.
14. Convert: `ffmpeg` concat → `slice-50.mp4` (h264 yuv420p) and a `.gif` (fps 10, 800 px). Write `outputs/demos/slice-50.md` with:
    - the criteria table and timestamps;
    - the measured box heights and the `--composer-reserve` value;
    - the "Chromium only" note;
    - side-by-side links to the explore-04 stills.

## Decisions recorded (team-lead, 2026-09-24; defaults, not waiting on Steven)

1. **Keys.**
   - Desktop: Enter sends, Shift+Enter adds a new line, and Cmd/Ctrl+Enter also sends.
   - `pointer: coarse`: Enter adds a new line, and the Send button sends (DESIGNER).
2. **#54 layout.** Keep the sticky composer plus `scroll-padding-bottom`, which serves as DESIGNER's "scroll-margin". It's set on the root scroller, so it covers every focusable, including Retry and Show more. `ol[role=log]` gets `padding-bottom`. The fixed-height desktop layout with the log scrolling on its own (explore-02/04) waits for #55 and #4/B38.
3. **Where the limit is stated.** "How far over" is shown in the composer before sending (count plus alert), with Send disabled. The server's 413 text is unchanged. A refusal never clears the draft: a 413 or 400 puts it back in an empty box.
4. **The purpose line is softened** until #4 ships the behavior explore-04's line describes. The wording lives in `PURPOSE_LINE`.
5. **DESIGNER wins where the specs differ:**
   - textarea max 38vh (30vh at ≤480);
   - the count at ≥80%;
   - `aria-invalid`, disabled Send and `role="alert"` with the exact overage;
   - a 4-line clamp with "Show more".
6. **Not in this slice:**
   - "Send in two parts";
   - #55 (the notice redesign, which waits on #34/#43);
   - "Try an example thread" (→ #4).
7. **Designer ask:** team-lead relays the `--color-warn` token request to DESIGNER. Until it lands, use `--color-ink-muted`.
