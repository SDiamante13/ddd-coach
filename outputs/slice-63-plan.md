# Slice 63 (#63 + #75, P1): conference readiness: a try-an-example button and a friendlier gate

Two issues ship together before the conference. Both come from interview 06b (`outputs/market-research/interviews/interview-06b-after-slice-41.md`).
- **#63 "Try an example thread".** A real button fills the empty composer with a long, messy, fictional thread. Nothing is sent until the visitor presses Send. The reply's question joins two far-apart lines that the thread plants on purpose. At a meetup nobody has their own thread with them, and three lines typed from memory can't show the value.
- **#75 gate polish:**
  - (a) the password match ignores case;
  - (b) the wrong-password copy no longer depends on the slide;
  - (c) a success line says the browser stays unlocked for 90 days;
  - (d) a spent OpenRouter credit limit gets its own message, with no Retry.

Spec: the bodies of issues #63 and #75. This plan adds decisions and the test order.

## Goal fit

| Goal | How slice 63 contributes |
|---|---|
| Maximize learning | Unicode normalization (NFKC) before a constant-time compare. What a MAC input change does to cookies already issued. Mapping a provider's error into the port's own error type (hexagonal: the handler never sees the SDK). Designing test data so an LLM's output can be checked (planted anchors + `questionSpansThread`) |
| Fun | The founder says "click Try an example" from the stage, and the room sees the coach join Monday's rule to Thursday's credit |
| Solve real DDD problems | The example shows the core move: the same word ("late") means three things, and the contract, the report and the code each pick a different one |

## Verified facts (2026-09-25)

**Gate (from slice 41 as built):**
- `server/accessPass.ts`:
  - `passwordMatches(given, expected)` = `timingSafeEqual(sha256(given.trim()), sha256(expected))`;
  - `createAccessPass(key, password)` MACs `JSON.stringify(["ddd-coach/access/v1", exp, password])`, where `password` is the configured value, trimmed by `present()`;
  - `ACCESS_MAX_AGE_S = 7_776_000` (90 days) lives here, in a module that imports `node:crypto`, so `src/` can't import it (slice 41 AC9).
- `server/accessHandlers.ts`: unlock returns 204 plus `Set-Cookie`, or 401 `ACCESS_WRONG_PASSWORD`.
- `src/shared/accessContract.ts`: `ACCESS_WRONG_PASSWORD = "That password isn't right. Check the slide and try again."`
- `useAccess.tryUnlock` sets `access = "open"`, and `App` swaps the gate for `ConnectionTest`. Nothing on screen mentions the 90 days.
- The inline gate (after a mid-conversation 401) goes through `useAccessRecovery.unlockAgain` → the same `unlock`.

**Provider failures:**
- `createChatHandler` catches any error from `coach.reply`, logs `{name, statusCode}` and returns 502 `COACH_UNAVAILABLE`.
- `askCoach` treats 502 as retryable, so today a spent credit limit shows "The coach is unavailable. Try again." with Retry.
- `@openrouter/sdk` **1.3.27** (read from `node_modules`):
  - `chatSend` maps `M.jsonErr(402, PaymentRequiredResponseError$inboundSchema)`. `PaymentRequiredResponseError extends OpenRouterError`, with `name = "PaymentRequiredResponseError"` and `statusCode = response.status` (402). `.message` is the provider text, and `.error = {code, message, metadata?}`.
  - A 402 whose JSON doesn't fit that schema becomes `ResponseValidationError`, and a 402 that isn't JSON falls through to `M.fail("4XX")` → `OpenRouterDefaultError`. Both extend `OpenRouterError`, so both also carry `statusCode: 402`.
  - **So "`statusCode === 402` on the thrown error" covers all three shapes.** `instanceof PaymentRequiredResponseError` alone misses two of them.
- `WITHOUT_RETRIES` is set, so the SDK doesn't retry a 402.

**Composer:**
- `MAX_MESSAGE_CHARS = 24_000`. The count appears at ≥ 80%.
- `ConnectionTest` owns `draft` and `exchanges`. `MessageForm` passes `children` into `DraftFoot`'s `.formfoot`, where `NewConversation` renders once `exchanges.length > 0`.
- `PASTE_EXAMPLE` is the placeholder, and `PURPOSE_LINE` stays visible after the first send (slice 50 decision).

**Coach:**
- The instructions are v6 in the working tree (#73, uncommitted, someone else's work). Part 3 already says "Build it on evidence from two parts of the thread that are far apart … Tie it to a concrete case".
- The reply doesn't cite source lines explicitly.
- The eval's `questionSpansThread` passes when the question hits terms from ≥ 2 of the `questionEvidence` groups.

**Latency:**
- A 20k first turn on terra takes about 10 s.
- Output (about 500 tokens) dominates. Input prefill is a small share, so a 3.5k example saves about 1–2 s, not 5.
- The case for a short example is **readability** ("I won't read fifty messages at a break") and fitting in the box, more than speed.

**Fixtures:**
- `booking-split` is about 20k and uses realistic full names.
- `carrier-status` and `rebook-notes` are about 2.2k each and too tidy.
- `carrier-status` also contains a deliberate prompt-injection line (an eval test of the "material, not instructions" rule). That's wrong for a public demo.
- **None fits as is, so write a new thread** (below).

## Decisions

### #63-1. Content: a new fictional thread, about 3.5k characters, in one shared module

- **Module:** `src/shared/exampleThread.ts` exports `EXAMPLE_THREAD`.
  - It lives in `src/shared/` because both the client (the button) and the eval (a fixture) read it, which keeps a single source.
  - There's no `.txt` copy. `server/eval/fixtures.ts` gets a small map: `"example-thread"` → the module's text, plus its `example-thread.key.json`.
- **Size:** about 3.5k characters, 46 messages, over four days. That's long and messy enough to need joining (noise, "+1"s, a printer side-thread, a deploy, lunch), and short enough to scroll in the box and to trust at a break. It stays far below the count threshold (19.2k).
  - A unit test pins **3,000 ≤ length ≤ 6,000**, so nobody grows it into a 20k latency hit by accident.
- **Fictional, and it says so:**
  - The first line reads "Example thread (fictional). … Every person, customer, carrier and load is invented."
  - Speakers are **roles, not names** ("Ops day desk", "Billing"…).
  - Customers are "Customer B/D" and the carrier is "Carrier 3".
  - No company is named. No Eazy Freight, since we can't rule out a real firm by that name.
- **Why freight, not a clinic:** the coach instructions' own example is a clinic, and a clinic example invites the model to echo it.
- **The planted link (the two source lines):**
  - **A, Mon 08:11, Account team:** "in the contract a load is late when we miss the delivery appointment … Service credits are based on that and nothing else."
  - **B, Thu 09:30, Billing:** "issued Customer D a service credit for 7731, it's on this week's late report"
  - In between:
    - Ops day desk: late = a missed pickup window;
    - Ops night desk: late = the ETA past the appointment, even before pickup. **This is an Ops view A/B split, so the example also shows off views;**
    - Dev pastes the query: `late = actual_pickup_at > pickup_window_end`, with the appointment unused;
    - Wed: 7731 is picked up 3 h late and delivered 40 min early.
  - A good question joins A and B, e.g. *"Question for the account manager and the billing lead, at Friday's service review: For load 7731, picked up late but delivered before the appointment, which decides the service credit: the missed pickup window or the delivery appointment?"*
- **"Points to its two source lines":** the coach cites no line numbers. The thread gives each planted line a **unique anchor** that a good question naturally names: "delivery appointment"/"contract" for A and "7731" for B. A visitor can find both lines with Ctrl-F.
  - Explicit citations ("from Mon 08:11 and Thu 09:30") would need a Part 3 change to the instructions, and so another eval round. **That's out of scope** (decision U2).
- **Checked like any fixture:** `example-thread.key.json` with:
  - `teams` [Ops, Carrier desk, Account team, Billing, Code];
  - `people` [] (roles only);
  - `views` Ops: day desk markers ["end of the window", "pickup window", "forecast"], night desk markers ["ETA", "before pickup", "nights"];
  - `codeLine` / `codeShown` true;
  - `forum` ["Friday", "service review"];
  - `questionEvidence` `[["delivery appointment", "contract"], ["7731"]]`. It has exactly two groups, so a pass means the question hits **both** planted lines.

The text (the builder copies it verbatim into the module; Steven may edit the wording):

```
Example thread (fictional). #late-loads at a made-up freight broker. Every person, customer, carrier and load is invented.

Mon 08:02  Ops day desk: morning. dock 4 scanner is down again, using the handhelds till facilities shows up
Mon 08:05  Carrier desk: +1, dock 2 too
Mon 08:11  Account team: before Friday's service review, one thing for everyone: in the contract a load is late when we miss the delivery appointment the customer booked. Service credits are based on that and nothing else.
Mon 08:12  Ops day desk: 👍
Mon 08:12  Billing: 👍
Mon 08:30  Dev: deploying the tracking page at 10, about 5 min of downtime
Mon 08:31  Billing: not during the invoice run please
Mon 08:33  Dev: moved to 11
Mon 09:02  Carrier desk: anyone seen the new rate sheet from Carrier 3? the one in the drive is from June
Mon 09:05  Billing: it's in the finance folder, I'll move it
Mon 09:40  Ops day desk: for us late is simpler. truck not at the pickup by the end of the window = late. that's what we chase carriers on
Mon 09:44  Carrier desk: and carriers only pay a late fee for a missed pickup. once it's rolling the delivery is on them, we don't track the appointment
Mon 10:02  Ops night desk: nights mark a load late as soon as the ETA slips past the delivery appointment, even before pickup. otherwise the customer hears it from the driver first
Mon 10:05  Ops day desk: that's a forecast, not late
Mon 10:06  Ops night desk: tell that to Customer B at 3am
Mon 10:07  Carrier desk: 😅
Mon 11:15  Billing: who owns the weekly late report now? it used to be the analyst who left
Mon 11:20  Dev: it's the late_loads query. from the repo:
    late = actual_pickup_at > pickup_window_end
    -- delivery_appointment isn't used: it's nullable and about half the loads don't have one
Mon 11:21  Billing: ok so the report is pickup
Mon 11:22  Dev: yes
Mon 12:30  Carrier desk: lunch? the taco place
Mon 12:31  Ops day desk: +1
Mon 12:31  Dev: +1
Tue 09:05  Account team: Customer D wants their Q3 on-time % for their board pack. I'll use the weekly report numbers
Tue 09:10  Ops day desk: fine by me
Tue 11:40  Ops night desk: handover: 7690 and 7702 still waiting on PODs
Tue 13:48  Dev: 2nd floor printer is jammed again
Tue 13:50  Billing: it's always the 2nd floor one
Tue 13:52  Carrier desk: there's a ticket, 3 weeks old
Wed 07:55  Ops night desk: load 7731 (Customer D): carrier got to the pickup 3h after the window, dock 4 queue. marked late
Wed 08:10  Carrier desk: charged Carrier 3 the late pickup fee on 7731
Wed 08:11  Ops day desk: 👍
Wed 14:00  Dev: tracking page is fine after the deploy, the map tiles were cached
Wed 16:20  Ops day desk: 7731 delivered 40 min before the appointment. driver made it up on the road
Wed 16:22  Carrier desk: nice
Thu 08:50  Ops day desk: dock 4 scanner fixed 🎉
Thu 08:51  Carrier desk: +1
Thu 09:30  Billing: issued Customer D a service credit for 7731, it's on this week's late report
Thu 09:31  Account team: wait, wasn't 7731 on time for them?
Thu 09:40  Billing: the report says late
Thu 09:41  Dev: report = pickup, see Monday
Thu 09:45  Ops night desk: heads up, 7802 will be late, ETA is already past the appointment. marking it late now so nobody promises otherwise
Thu 09:47  Ops day desk: it hasn't even been picked up
Thu 11:00  Account team: taking this to Friday's service review. I need one number before Customer D's Q3 on-time % goes out
Thu 11:02  Billing: does the credit on 7731 stand until then?
Thu 11:03  Carrier desk: following
```

### #63-2. The button: in the composer foot, only while the conversation and the draft are empty

- **Place:** `.formfoot`, in the slot `NewConversation` takes once a conversation exists. The rendering becomes: `exchanges.length > 0` → `NewConversation`; else if the draft is blank → `TryExampleButton`. A small `ComposerActions` component keeps `ConnectionTest` short.
  - It sits right under the box, next to the placeholder it upgrades.
  - explore-04 put it under the purpose line, but `App` doesn't know about `exchanges`. Lifting `useExchanges` just for this is the reason slice 50 kept the purpose line always visible.
- **Hidden once the conversation starts** (#63 AC). It comes back after "Start a new one" clears the log, which is the empty state again.
- **Hidden while the draft has text,** so one click can never overwrite what the visitor typed or pasted. It never needs a confirm.
- **Markup:** `<button type="button" className="example">Try an example thread</button>`. `type="button"` is required because the button is inside the composer `<form>`, and a submit would send.
- **On click:**
  - `setDraft(EXAMPLE_THREAD)`;
  - focus moves to the Message box (the button unmounts, so without this focus would drop to `<body>`);
  - the caret goes to 0 and `scrollTop = 0`, so the "(fictional)" line and Monday are what's visible.
  - **No request is made.**
- **Accessibility:** a real button, so keyboard and SR work for free, reusing the existing button tokens. The focus move lands on "Message, edit text" with the thread as its value. There's no new live region (a region mounted with its text isn't reliably announced, and the focus move already says enough).
- **Live reply only.** There's no canned reply (#63: "Default: a live reply"), so the demo is never better than the product.
- The example goes through the normal send path, so the log clamps the long prompt to 4 lines with "Show more" (#51), and Copy conversation includes it.

### #75a. Case-insensitive password: normalize both sides before hashing; the MAC uses the normalized form

```ts
export function canonicalPassword(text: string): string {
  return text.normalize("NFKC").trim().toLowerCase();
}
passwordMatches(given, expected) = timingSafeEqual(sha256(canonical(given)), sha256(canonical(expected)))
createAccessPass(key, password) → MAC input JSON.stringify([ACCESS_TAG, exp, canonicalPassword(password)])
```

- **Order:**
  1. NFKC first: full-width `ＰＷ` → `PW`, and a ligature → its letters. Phone keyboards and photo-OCR paste produce these;
  2. then trim;
  3. then `toLowerCase()`, which is locale-independent in JS, so a Turkish-locale phone doesn't break `I`.
- The function is idempotent, so normalizing an already canonical configured value is harmless.
- **Still constant time:** both sides are hashed to 32 bytes before `timingSafeEqual`. Normalization runs on both sides, so its cost doesn't depend on the match.
- **The MAC uses the canonical form (decided).** The pass then binds the password *as the gate understands it*. Changing only the case of `ACCESS_PASSWORD` isn't a rotation (both values unlock the same set of inputs), so it shouldn't sign anyone out. Changing the words still does.
- **Existing cookies:**
  - If the production `ACCESS_PASSWORD` is already canonical (lowercase ASCII words and hyphens, per slice 41's passphrase advice), then `canonical(p) === p`, the MAC input is byte-identical, and **every issued pass keeps working**. A unit test pins this: for a lowercase password, `issue` equals an HMAC computed by hand over the old input.
  - If the value has any capital or non-NFKC character, every current pass fails once. The browser shows the gate on reload, or the inline form mid-conversation, and one unlock fixes it. The conference hasn't happened yet (06b is synthetic, dated 22 Oct), so today's passes are Steven's and the agents' test browsers only. **Recommend accepting it.** Nobody checks the value, since agents never read it.
- The tag stays `ddd-coach/access/v1`. A bump would sign everyone out even with a canonical password, for nothing.
- **Security cost:** none worth counting. A three-word lowercase passphrase loses no entropy. A mixed-case one loses about 1 bit per capital letter, against a 30/min limiter.

### #75b. Wrong-password copy

`ACCESS_WRONG_PASSWORD = "That password isn't right. Try again, or ask the organizer for it."`
- It doesn't depend on a slide still being up, and there's no "check the capitals", since case no longer matters.
- It's American spelling, like the rest of the UI copy (U4).

### #75c. Success line derived from `ACCESS_MAX_AGE_S`

- **r commit:** move `ACCESS_MAX_AGE_S` from `server/accessPass.ts` to `src/shared/accessContract.ts`. It's a plain number with no crypto, so `src/` may import it, and slice 41 AC9 still holds because `src/` still never imports `server/accessPass.ts`. `accessPass.ts` imports it back.
- `accessContract.ts`:
  ```ts
  const SECONDS_PER_DAY = 86_400;
  export const UNLOCKED_FOR = `This browser stays unlocked for ${Math.floor(ACCESS_MAX_AGE_S / SECONDS_PER_DAY)} days.`;
  ```
- **When:** only right after a successful unlock in this page load, whether through the first-visit gate or the inline recovery gate.
  - A reload with a valid cookie shows nothing. The visitor didn't just unlock, and a permanent line is noise.
  - `useAccess` gains `justUnlocked` (set in `tryUnlock` on ok) and passes it to `ConnectionTest`.
- **Where:** `<p role="status" className="unlocked">` just above the composer. Focus lands in the box after unlock, so the line is next to where the eye is, in both flows. It stays until reload. It's short, and "Start a new one" doesn't need to clear it.
- Optional (U3): the same sentence as a hint under the password field on the gate, which is where 06b's Priya decided whether the photo was worth keeping.

### #75d. Credit exhausted: its own port error, 503 `COACH_OUT_OF_CREDIT`, no Retry

- **Adapter owns the translation (hexagonal):**
  - `server/coach.ts` exports `class CoachOutOfCredit extends Error { name = "CoachOutOfCredit"; statusCode = 402 }`.
  - `createOpenRouterCoach` wraps `chat.send(...)`: if the thrown error has `statusCode === 402` (duck-typed, which covers all three SDK shapes above), it throws `new CoachOutOfCredit()`; otherwise it rethrows the original.
  - **The provider's message is dropped here,** so it can't be forwarded.
  - `chatHandler` never imports the SDK.
- **Handler:** in `replyFrom`'s catch, log `failureOf(error)` as today (`{name: "CoachOutOfCredit", statusCode: 402}`, so the function logs show the cause). Then `error instanceof CoachOutOfCredit ? outOfCredit() : coachUnavailable()`.
- **Contract** (`src/shared/chatContract.ts`): `COACH_OUT_OF_CREDIT = "The coach is paused: its usage budget is used up. Tell the organizer."`
  - Status **503**: it's our service, paused, not a bad gateway.
  - There's no promise of "tomorrow", because the OpenRouter key limit may not reset on a schedule (U5).
- **Client:** `askCoach` `NOT_WORTH_RETRYING` becomes `[400, 413, 503]`.
  - Only a 503 **with a JSON `error`** is non-retryable.
  - A platform 503 with a plain-text or HTML body still falls through to `UNAVAILABLE` (retryable), as today.
  - The refusal path puts the prompt back into the draft, so nothing typed is lost, and it shows Copy conversation.
- **Known wrinkle:** refusals also show "Start a new one", which doesn't help here but does no harm. Changing it would mean turning the `accessLost` flag into a failure `reason` union across the domain types. Deferred.
- **Also 402:** OpenRouter returns 402 when the remaining credit can't cover `max_tokens` for this request, so a long example can hit it just before tiny prompts do. The message is still honest.

### Rotation policy (changed by the PO, recorded here)

- **Don't rotate `ACCESS_PASSWORD` after the conference.** It would break the "stays unlocked for 90 days" promise to exactly the people who come back later (06b finding 4).
- Rotate only on **abuse**: a usage alert or a leaked password being misused. The OpenRouter credit limit (#72) is the spend bound, not the calendar.
- To rotate: change the value in the Netlify UI, then redeploy. Every pass fails at once, because the canonical password is in the MAC.
- Slice 41's plan already carries this note.
- **PO:** update the #72 issue body so it no longer schedules a rotation.

### DDD proportionality

- Both issues are infrastructure and UI.
- `EXAMPLE_THREAD` is content, not domain.
- `CoachOutOfCredit` is a port-level error, the one new type the handler needs.
- There are no new `src/domain` types.

## File layout

```
src/shared/exampleThread.ts          EXAMPLE_THREAD
src/shared/accessContract.ts         + ACCESS_MAX_AGE_S (moved), UNLOCKED_FOR; ACCESS_WRONG_PASSWORD reworded
src/shared/chatContract.ts           + COACH_OUT_OF_CREDIT
src/ui/TryExampleButton.tsx          the button (type="button", onTry)
src/ui/ComposerActions.tsx           NewConversation | TryExampleButton | nothing
src/ui/ConnectionTest.tsx            onTry: setDraft + focus/caret/scroll; renders UNLOCKED_FOR when justUnlocked
src/ui/useAccess.ts                  + justUnlocked
src/App.tsx                          pass justUnlocked to ConnectionTest
src/api/askCoach.ts                  NOT_WORTH_RETRYING + 503
server/accessPass.ts                 canonicalPassword; passwordMatches + MAC use it; imports ACCESS_MAX_AGE_S
server/coach.ts                      + CoachOutOfCredit
server/openRouterCoach.ts            402 → CoachOutOfCredit
server/chatHandler.ts                CoachOutOfCredit → 503 COACH_OUT_OF_CREDIT
server/eval/fixtures.ts              "example-thread" from the module; FIXTURE_NAMES (see U1)
server/eval/fixtures/example-thread.key.json
src/styles/base.css                  .example (explore-04: align-self flex-start), .unlocked (muted, --text-sm)
```

## Acceptance criteria

**#63**
1. Given an unlocked, empty app, a "Try an example thread" button shows under the Message box. Pressing it fills the box with `EXAMPLE_THREAD`, which starts "Example thread (fictional)". Focus goes to the box, with the top of the thread in view, and **no `/api/chat` request** is made.
2. The thread is sent only by Send (or Enter on desktop), as the normal message body.
3. The button isn't shown once the conversation has an exchange, or while the draft has any text. It shows again after "Start a new one".
4. `EXAMPLE_THREAD` is 3,000–6,000 characters and lives in one module. It names no people (roles only) and no real company.
5. **Live check:** in **3/3 runs on the production model** (terra, with the instructions version live at ship), the reply's question:
   - passes `questionSpansThread` with both groups (the delivery appointment/contract **and** 7731);
   - passes `questionAsks`;
   - names the Friday service review.

   The reply time is recorded.

**#75**

6. `"PW"`, `"  pw "`, `"Pw"` and full-width `"ｐｗ"` all unlock `ACCESS_PASSWORD=pw`. `"pw2"` doesn't. The compare stays constant time (hash first).
7. For a canonical configured password, a pass issued before this slice still admits (golden MAC test). A pass issued under `Tidal-Lantern` admits under `tidal-lantern`.
8. A wrong password shows "That password isn't right. Try again, or ask the organizer for it." There's no mention of a slide, and the field keeps its value, `aria-invalid` and focus, as before.
9. After a successful unlock (gate or inline), "This browser stays unlocked for 90 days." is visible above the composer. The number comes from `ACCESS_MAX_AGE_S`. A reload with a valid pass doesn't show it.
10. When OpenRouter answers 402 (typed, schema-mismatched or plain), chat returns **503** `{error: COACH_OUT_OF_CREDIT}` and never the provider's text. The log records `{name: "CoachOutOfCredit", statusCode: 402}`. The entry shows the message with **no Retry**, and the prompt returns to the draft.
11. Other provider failures are unchanged: 502 `COACH_UNAVAILABLE` with Retry. A plain-text 503 from the platform stays retryable.

## Test order (outside-in; each red → green, predict the failure first)

**r commits first** (behaviour-preserving):
- **r1:** move `ACCESS_MAX_AGE_S` to `src/shared/accessContract.ts`, with `accessPass.ts` importing it. The existing accessPass tests stay green.
- **r2:** extract `ComposerActions` from `ConnectionTest` (NewConversation or nothing). The acceptance suite stays green.

**#75a, server first (no UI):**
1. `server/accessHandlers.test.ts`: move the `"the password in another case"` row (`TEST_ACCESS_PASSWORD.toUpperCase()`, line 60) out of the "refuses" table into a new "unlocks" table with full-width and padded variants → 204 + `Set-Cookie`. Red: 401.
2. `server/accessPass.test.ts`:
   - `passwordMatches` true for case, NFKC and trim variants, false for `pw2` and for different lengths, without throwing;
   - **golden:** for `"tidal-lantern"`, `issue(now)`'s MAC equals `createHmac(sha256, key).update(JSON.stringify(["ddd-coach/access/v1", exp, "tidal-lantern"]))` (existing passes survive);
   - `createAccessPass(key, "Tidal-Lantern").issue` is admitted by `createAccessPass(key, "tidal-lantern")`.
   - The existing "different password doesn't admit" test stays. Remove the `"the password in another case"` row from the `passwordMatches` "does not match" table (line 85); it becomes a "matches" row.
3. Mutation (verifier): drop `canonicalPassword` from the MAC → the cross-case admit test fails. Drop it from `passwordMatches` → test 1 fails.

**#75b / #75c, acceptance** (`src/acceptance/accessGate.test.tsx`):

4. Wrong password: the server stub replies 401 `{error: ACCESS_WRONG_PASSWORD}`. Assert the new text via the constant, plus a unit assertion that the constant doesn't match `/slide/i`.
5. The right password (204) → `getByRole("status")` has `UNLOCKED_FOR`, and `UNLOCKED_FOR` contains "90 days". Red: no status.
6. Session 204 on load → `queryByText(UNLOCKED_FOR)` is null.
7. Inline recovery: chat 401 → inline gate → unlock 204 → `UNLOCKED_FOR` is visible.

**#75d:**

8. Acceptance (`src/acceptance/refusals.test.tsx`): chat 503 `{error: COACH_OUT_OF_CREDIT}` → alert text, no "Retry" button, and the draft holds the prompt. Red: Retry is shown.
9. `src/api/askCoach.test.ts`: 503 with an error → `retryable: false`; 503 plain text → `UNAVAILABLE`, retryable.
10. `server/chatHandler.test.ts`: the coach rejects with `new CoachOutOfCredit()` → 503 `COACH_OUT_OF_CREDIT`, and the log gets `{name: "CoachOutOfCredit", statusCode: 402}`. A generic `Error` → 502, unchanged.
11. `server/openRouterCoach.test.ts`, with a fake `chat.send` that rejects with:
    - a real `PaymentRequiredResponseError` built from the SDK class (`{error: {code: 402, message: "Insufficient credits <secret-ish text>"}}` + a `Response` with status 402);
    - an `OpenRouterDefaultError` with a 402 response.

    Both → `CoachOutOfCredit`, whose `message` doesn't contain the provider text. A 502 SDK error is rethrown as is.

**#63:**

12. Acceptance (`src/acceptance/exampleThread.test.tsx`, new):
    - The empty app shows the button, and clicking it gives `input()` the value `EXAMPLE_THREAD`, focus on the box and `server.pendingCount() === 0`. Red: no button.
    - Then Send → `bodyOf(0).message === EXAMPLE_THREAD.trim()`.
    - After the reply, the button is gone.
    - Typing "x" into an empty box hides it, and clearing the box shows it again.
    - After "Start a new one" + confirm, it shows again.
13. `src/shared/exampleThread.test.ts`: the length is in [3000, 6000]; it starts with "Example thread (fictional)"; it contains both anchors ("delivery appointment", "7731").
14. Eval: `example-thread.key.json` + the loader entry. A `server/eval` unit test loads the fixture from the module. The live run is the verifier's (AC5).

**Commits** (through committer):
- `r` shared max age;
- `r` ComposerActions;
- `feat` case-insensitive password (#75);
- `feat` gate copy + 90-day line (#75);
- `feat` out-of-credit message (#75);
- `feat` try an example thread (#63);
- `feat` example-thread eval fixture (#63).

## Demo script (verifier, hosted URL)

Prereq: deployed with `bin/check.sh` green. The password is read from the private scratch file team-lead named (`$PASS_FILE`).
- **Never `cat` it to the terminal. Never echo it or put the value in a command line.**
- Only use `"$(...)"` substitution inside the fill command.
- Check that the first `agent-browser fill` output doesn't echo the value (slice 41 rule). If it does, stop and tell team-lead.

Use `agent-browser --session verifier` with a fresh profile, a caption per step, and record `outputs/demos/slice-63.webm`.

1. Open `https://ddd-coach.netlify.app`: the gate. Caption: "Slice 63 (#63 + #75): conference readiness."
2. Fill `not-the-password`, Enter → "That password isn't right. Try again, or ask the organizer for it." Caption: "No slide needed."
3. **Case-insensitivity, value never shown:**
   - Off camera, first check that the transform changes something, without printing either value: `[ "$(tr '[:lower:]' '[:upper:]' < "$PASS_FILE")" != "$(cat "$PASS_FILE")" ] && echo transform-differs`. If it prints nothing, use `tr '[:upper:]' '[:lower:]'`, i.e. the case the file doesn't use.
   - Then `agent-browser fill @field "$(tr '[:lower:]' '[:upper:]' < "$PASS_FILE")"` and Enter.
   - Caption: "Typed in UPPER CASE: case doesn't matter."
4. "This browser stays unlocked for 90 days." is visible above the composer. Caption: "Remembered, and it says so."
5. Click "Try an example thread" → the box fills, and the network log shows **no `/api/chat` call** (check with `network requests`). **Screenshot at 1280×800 → `outputs/demos/slice-63.png`** (outside the recording). Caption: "A fictional, messy thread. Nothing sent yet."
6. Send, wait for the reply, and record the seconds. Scroll to the question. Caption quoting the two lines it joins: "Mon 08:11: late = missed delivery appointment · Thu 09:30: credit issued for 7731."
7. The button is gone. Reload → no gate, no 90-day line. Caption: "Remembered on reload."
8. `record stop`.

Off-video, record in `outputs/demos/slice-63.md`:
- Two more live example runs by `curl` with the cookie from step 3 (three in all with step 6). For each: seconds, the question text, and `questionSpansThread`/`questionAsks` via `server/eval/checkReply.ts example-thread <reply.txt>`. **3/3 must pass** (AC5).
- A `curl` unlock with the UPPER CASE body built by substitution → 204 + `Set-Cookie`. Mixed case → 204. `wrong` → 401 with the new copy.
- **Out of credit (Part B, local):** this can't be triggered on production without spending the budget.
  - **Skipped for this slice (U6: no key).** Tests 8–11 are the proof. If Steven later provides a throwaway OpenRouter key with a $0 limit, the deployer puts it into `.env` for one `netlify dev` run (append/replace by key, never print), and then restores it.
  - Send → the entry shows `COACH_OUT_OF_CREDIT` with no Retry, and the function log shows `CoachOutOfCredit 402`. That run also **proves OpenRouter returns 402, not 403, for a spent key limit.**
  - Without that key, tests 8–11 are the proof; note it in the demo report.

## Out of scope

- Explicit source-line citations in the reply (a Part 3 change → a new eval round; U2).
- A canned or prepared example reply.
- Several examples, or a picker.
- Showing the example in the log as "example" rather than as the visitor's message.
- Changing the refusal actions per cause (e.g. hiding "Start a new one" for out-of-credit).
- A server-side spend cap.
- Automatic recovery when credit returns.
- A logout, a per-day cookie, collapsing internal whitespace in passwords.
- Updating #72's body (PO).

## Risks

- **Model variance on the example.** One of three runs may propose instead of ask, or miss 7731. AC5 is gated on 3/3. If it fails, tune the thread first (make B's anchor sharper), not the instructions; this slice doesn't own v6/#73.
- **Dependency on #73's uncommitted v6.** Adding `example-thread` to `FIXTURE_NAMES` makes it part of the ship bar. Land it after v6 is committed, so #73's recorded runs stay comparable (U1).
- **A non-canonical production password** means one re-unlock for current test browsers. Harmless before the conference, and nobody reads the value to check.
- **Key-limit exhaustion might surface as 403, not 402.** It's unverified without U6. The handler logs `statusCode` either way, so the first real exhaustion reveals it. The fix would be one more status in the adapter, but only if 403 isn't also moderation.
- **Example cost:** about 3.5k characters ≈ 1.2k tokens in and about 500 out, well under $0.01 a run. 100 visitors × 2 runs is under $1.
- **The button unmounts on click.** Focus must move to the box in the same handler. Test 12 asserts focus.
- **Venue fairness:** everyone clicking the example sends identical first turns. The replies vary anyway, and there's no caching across users (no shared history), so it's fine.

## Decisions (approved 2026-09-25, team-lead on the recommendations)

1. **U1:** add `example-thread` to `FIXTURE_NAMES` (the ship bar), **after #73's prompt ships**.
2. **U2:** the question names the unique anchors ("delivery appointment"/"contract" and "7731"). No prompt change, and no explicit citations.
3. **U3:** the 90-day line shows **after unlock only** (gate or inline), not as a hint on the gate.
4. **U4:** the copy stands, with "organizer" (US spelling): "That password isn't right. Try again, or ask the organizer for it." and "The coach is paused: its usage budget is used up. Tell the organizer."
5. **U5:** a hard OpenRouter credit limit that doesn't reset, and no "tomorrow" or "until …" in the copy.
6. **U6:** there's **no throwaway $0-limit key for now.**
   - Tests 8–11 (acceptance, `askCoach`, `chatHandler`, the `openRouterCoach` adapter with real SDK error classes) are the only proof of the out-of-credit path.
   - The demo skips Part B, and the demo report says so.
   - Whether a spent key limit returns 402 or 403 stays unverified, and it stays in Risks. Steven can run the live check later with such a key. The function log's `statusCode` also shows it at the first real exhaustion.
7. **U7:** accept the possible one-time re-unlock. The MAC uses the canonical password.
