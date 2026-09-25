# Slice 08 (#8, P1): stream replies into the entry

The spec is issue #8's body, rewritten after spike #79. This plan adds the verified facts, the wire format, the decisions, the test order and the demo.

In one line: the coach's reply appears word by word within about 2 s instead of after a 9–21 s blank. A reply that would pass the 25 s budget arrives as a signed partial marked cut short, not a 504.

## Goal fit

- **Real DDD problem (ICP):** a 20k paste on terra takes 13.35 s hosted before anything shows. #58 adds a 25–30k knowledge-base prefix, and the conference (#41) adds concurrent load. A blank screen for 15 s reads as "broken" at a meetup. A partial reply beats a 504 that throws the answer away.
- **Learning:**
  - SSE over a POST with `fetch` + `getReader()`, with frames split across chunks;
  - an `AbortSignal` budget that really stops upstream (today's `Promise.race` doesn't);
  - errors that travel in-band once the 200 headers are out;
  - signing only the final text, so a streamed partial can never become history.
- **Fun:** watching a long untangle type itself out.
- **DDD proportionality:** no new aggregates or services. The domain gains one pure transition (`progress`) on the existing `PendingExchange`. The server gains a small budget type and a stream encoder behind the existing `Coach` port.

## Verified facts (main at `ada0927`, 2026-09-25)

**From spike #79 (closing comment)**
- The Function stream is cut at **~30.3–31.0 s wall clock**, whatever bytes flow. The cut is **silent**: HTTP 200, clean close, `read()` returns `done: true`. Only a missing terminal event shows it.
- Every v2 Function, `/api/chat` included, already runs in invoke mode `stream`. Streaming adds perceived speed, **not time**.
- First byte arrived at 0.7–1.3 s, with no CDN buffering for `text/event-stream` on HTTP/1.1 or HTTP/2.
- 35 s of silence before headers gives a platform 504. 25 s of silence and then `done` completes fine (row k).
- `EventSource` can't POST, so the client uses `fetch` + `getReader()`. Send `Cache-Control: no-cache`.
- `@openrouter/sdk` 1.3.27:
  - `chat.send({ chatRequest: { stream: true } })` returns `EventStream<ChatStreamChunk>`, which is async-iterable.
  - `RequestOptions` takes `signal` (flattened `RequestInit`).
  - `ChatStreamChunk` has an optional `error` field for mid-stream provider errors.

**Server today**
- `chatHandler.ts`, in order:
  1. method;
  2. config, signing key and access password (500);
  3. access cookie (401);
  4. body cap, then parse (413/400);
  5. `verifyConversation` (400 `COACH_UNVERIFIED`);
  6. `replyFrom`.

  All refusals are JSON.
- `replyFrom` uses `withDeadline(coach.reply(…), deadlineMs)`, a `Promise.race` that **does not stop the upstream call**. On timeout it logs `{name: "Timeout"}` and returns 504 `COACH_TIMED_OUT`. Other results:
  - blank reply → 502 "empty reply";
  - `CoachOutOfCredit` → 503;
  - anything else → 502 `COACH_UNAVAILABLE`.

  Logs carry name and statusCode only.
- The deadline starts after body parsing, not at request start. `readTimeoutMs` defaults to 25 000 and accepts **any** positive integer.
- `Coach` port: `reply(conversation): Promise<string>`.
- `openRouterCoach.ts`:
  - sends `stream: false`, `maxCompletionTokens: 1_000` and `retries: none`;
  - applies `endOnCompleteLine` when `finishReason === "length"`;
  - maps a 402 key/credit limit to `CoachOutOfCredit`.
- `ChatClient.send` returns `SendChatCompletionRequestResponse` = `ChatResult | EventStream<ChatStreamChunk>`.
- `endOnCompleteLine(text)` cuts to the last newline or sentence end and appends `CUT_SHORT_NOTE` = '(Cut short at the length limit. Say "continue" for the rest.)'. It returns `""` when no complete line exists.
- The signature is `HMAC(["ddd-coach/turn/v1", prompt, reply])`. Only `{prompt, reply}` is signed.
- `netlify/functions/chat.mts`: `path: "/api/chat"`, `rateLimit: { windowLimit: 300, windowSize: 60, aggregateBy: ["ip","domain"] }`.

**Client today**
- `askCoach` posts JSON and reads a JSON body.
  - Non-2xx goes to `errorFrom`: 401 → access lost, and 400/413/503 aren't retryable. A body that isn't JSON falls back by status: 504 → `COACH_TIMED_OUT`, 413 → message too long, else unavailable.
  - A 200 without `reply` or `signature` gives "Unexpected response from the coach." A throw gives "Could not reach the coach." Both are retryable.
- `useExchanges.ask` awaits `askCoach`, then `settle`s. `turnsOf` sends only `replied` exchanges as history, so an unsigned partial can't leak into history if it stays on `pending`.
- `ExchangeOutcome` renders pending as `<p>Coach is thinking…</p>` and replied as `<p>{reply}</p>`. Styling keys off `li > p:nth-child(2)` (the "Coach" bubble, `white-space: pre-wrap`), so partial text in that same `<p>` keeps the bubble.
- The log is `<ol role="log">`, which is implicitly `aria-live="polite"`. Nothing sets `aria-busy` today, and nothing scrolls entries into view.
- Test surface:
  - `stubFetch().reply(i, 200, {reply, signature})` is used 8 times directly and 21 times via `sendAndReply`;
  - vitest runs under jsdom, with `Response` and `ReadableStream` from Node.

**Eval harness (#78)**
- `measure()` calls `createOpenRouterCoach(config, instructions, recorder.chat).reply(conversation)`.
- `recordingChat` already accepts a stream response: it collects it, records `firstTokenMs`, adds `streamOptions.includeUsage` when `stream` is on, and **returns a collected `ChatResult`** to the coach.
- `latencySpike` runs its non-stream arms with no `stream` override, and its streamed arm with `{stream: true}`.
- `openRouterCoach.smoke.test.ts` calls `.reply()` (runs only with env).

## Wire format (`src/shared/chatStream.ts`, shared by server and client)

Streaming is chosen by the request (U3): the client sends `Accept: text/event-stream`. Any other request gets today's JSON.

**Before the stream (unchanged, JSON):** 405, 500 misconfigured, 401 `ACCESS_REQUIRED`, 400/413 refusals, 400 `COACH_UNVERIFIED`. Plus every failure that happens **before the first text** (U2):
- 503 `COACH_OUT_OF_CREDIT`;
- 502 `COACH_UNAVAILABLE`;
- 502 empty reply;
- 504 `COACH_TIMED_OUT` (budget ran out with zero text).

**The stream:**

```
HTTP/1.1 200
Content-Type: text/event-stream; charset=utf-8
Cache-Control: no-cache

event: delta
data: {"text":"Two meanings of \"late\" are "}

event: delta
data: {"text":"in play.\n\n1. "}

event: done
data: {"reply":"<the final text, exactly as signed>","signature":"<base64url>"}

```

| Event | `data` (one line of JSON) | Meaning |
|---|---|---|
| `delta` | `{"text": string}` | The next piece of text. The client appends it and shows the result. Never signed, never history. |
| `done` | `{"reply": string, "signature": string}` | Terminal. `reply` **replaces** the streamed text (it may be cut and carry a note). It's the only thing that enters history. |
| `error` | `{"error": string}` | Terminal. The same `{error}` shape as the JSON error body, using the contract strings, so #74 adds `reason` in one place for both. |

**Rules**
- Exactly one terminal event (`done` or `error`), then close. A close with no terminal event is a **failure** on the client (U5). That's the platform's silent ~30.3 s cut.
- `data` is always single-line JSON (`JSON.stringify` escapes newlines), so each frame is `event: X\ndata: {…}\n\n`.
- The client ignores unknown event names and `:` comment lines, which leaves room for later `ping`/`meta`. It also ignores anything after a terminal event.
- The parser is a pure `createEventParser()` with `push(chunk: string) → ChatStreamEvent[]`. It buffers partial frames across `read()` chunks, so a frame split mid-JSON or mid-`\n\n` still parses.
- Types: `ChatStreamEvent = {type:"delta", text} | {type:"done", reply, signature} | {type:"error", error}`. The server uses `encodeEvent(event): string`, and both sides test against the same module.

## Decisions (design; the open ones are U1… below)

### D1. The budget replaces the deadline (make the change easy first)
- `server/budget.ts`: `startBudget(ms)` returns `{ signal: AbortSignal, stop(): void }`, built from an AbortController and a timer. `deadline.ts` goes away.
- It starts at **handler entry**, so body read, parse and HMAC count against it. The platform clock starts even earlier (cold start), which is why U1 keeps 25 s.
- The signal goes to `coach.stream(conversation, signal)` and on into `chat.send(…, { ...WITHOUT_RETRIES, signal })`. When the budget fires, the upstream fetch is really aborted, which also stops paying for tokens nobody will see.
- **Classify by the signal, not by the error type.** Any throw or end while `signal.aborted` counts as a budget end. That holds whatever the SDK throws on abort (`AbortError`, `RequestAbortedError`).
- If the visitor disconnects, the response stream's `cancel()` aborts the same controller.
- `readTimeoutMs`: values over **27 000** fall back to the default, like any invalid value today (U1).

### D2. The port: `Coach.stream`
```ts
type CoachEvent = { type: "text"; text: string } | { type: "end"; tokenCap: boolean };
interface Coach { stream(conversation: VerifiedConversation, signal: AbortSignal): Promise<AsyncIterable<CoachEvent>> }
```
- **The promise settles once upstream has accepted the request.** A 402 or 5xx rejects here, before any header goes out, so the credit and unavailable statuses keep working unchanged.
- **The adapter (`openRouterCoach.ts`) only translates:**
  - it requests `stream: true`;
  - it maps `delta.content` to `text`, ignoring reasoning deltas and empty content;
  - it maps `finishReason === "length"` to `end{tokenCap: true}`, and any other finish to `end{tokenCap: false}`;
  - a chunk with `error` throws (a mid-stream provider failure).
- The adapter **also accepts a plain `ChatResult`** and yields one `text` then `end`. `recordingChat` hands back a collected `ChatResult`, and latency runs with `stream: false` do too, so the eval harness needs no rewiring (see "Prompt-eval impact").
- **Narrow `ChatClient.send`'s return type** to `ChatResult | AsyncIterable<ChatStreamChunk>`. The real SDK still satisfies it, and fakes become plain async generators.
- **Endings move out of the adapter** into one pure function in `replyEnding.ts`:
  ```ts
  finalReply(text: string, ending: "complete" | "tokenCap" | "budget"): string
  ```
  - `complete` returns the text;
  - `tokenCap` returns `endOnCompleteLine(text, CUT_SHORT_NOTE)`;
  - `budget` returns `endOnCompleteLine(text, TIME_CUT_NOTE)` (U4).

  `endOnCompleteLine` gains a `note` parameter that defaults to `CUT_SHORT_NOTE`.
- A helper, `collectReply(events, signal) → {text, ending}`, serves the JSON path, `measure()` and the smoke test.

### D3. Handler flow after verification
1. **`coach.stream(...)`.** A reject means JSON 503/502, logged exactly as today.
2. **Wait for the first `text` (U2).** If the budget ends first, return 504 JSON (log `Timeout`). If the stream ends with no text, return 502 empty. If it throws, return 502/503 JSON.
3. **Return a `text/event-stream` Response.** Its `ReadableStream` emits the first `delta`, then a `delta` per text event, and accumulates the text.
4. **At the end**, `finalReply(text, ending)` and then:
   - non-empty: sign `{prompt, reply}` and emit `done`;
   - empty (a budget cut with no complete line, U7): emit `error` `COACH_TIMED_OUT`.
5. **A throw after the first text** that isn't a budget end emits `error` `COACH_UNAVAILABLE` (U6), logged by name and statusCode only. The partial is never signed.
6. **A budget end after the first text** logs `{name: "BudgetCut"}`, so hosted logs can count partials.
7. **`budget.stop()` in `finally`.**

- The handler and `sseResponse` stay separate modules (`server/replyStream.ts`), each with functions of 25 lines or fewer.
- **JSON path (no `Accept`):** the same steps 1–2, then `collectReply` and `finalReply`, returned as JSON `{reply, signature}`. A budget cut is therefore a partial there too, not a 504, which keeps one set of rules for both paths.

### D4. Client
- **`askCoach(conversation, onText?)`:**
  - it sends `Accept: text/event-stream`;
  - non-2xx goes through `errorFrom`, unchanged;
  - a 2xx `text/event-stream` goes through `readStream(body, onText)`. That function feeds the parser, calls `onText(soFar)` after each delta and returns on the terminal event:
    - `done` with a reply and signature → ok;
    - `done` missing a field → `UNEXPECTED`;
    - `error` → `{error, retryable: true}`, since in-band errors are all transient, and #74 later refines it by reason;
    - close with no terminal → `TIMED_OUT` (U5);
    - `read()` throws → `UNREACHABLE`;
  - a 2xx JSON body is still accepted (it costs one branch and guards a proxy that strips `Accept`).
- **Domain (`exchange.ts`):**
  - `PendingExchange` gains `partial: string`, which `submit` sets to `""`;
  - `progress(exchanges, id, partial)` is pure and only touches a matching **pending** exchange, so a cleared or settled one is a no-op;
  - `settle` is unchanged, so the `done` reply replaces the partial. `turnsOf` is unchanged, so partials never reach history.
- **`useExchanges.ask`** passes `(soFar) => setExchanges((c) => progress(c, id, soFar))`. React batches, so no throttle is needed at ~1000 deltas (see Risks).
- **UI:**
  - `ExchangeOutcome` pending shows `partial === "" ? "Coach is thinking…" : partial`, in the same `<p>` position, so the Coach bubble styling holds;
  - `ExchangeEntry` sets `aria-busy="true"` while pending, so screen readers announce the finished reply once instead of every delta.
- **Retry and Send** stay disabled while pending, since the status is still `pending`. A failed stream shows the alert with Retry and discards the partial (U5). The composer draft is untouched.

## File layout

| File | Change |
|---|---|
| `src/shared/chatStream.ts` (+ test) | new: `ChatStreamEvent`, `encodeEvent`, `createEventParser`, `EVENT_STREAM` content type |
| `src/shared/chatContract.ts` | `TIME_CUT_NOTE` (U4) |
| `server/budget.ts` (+ test) | new; replaces `deadline.ts` |
| `server/coach.ts` | `CoachEvent`, `Coach.stream` |
| `server/openRouterCoach.ts` (+ test) | `stream: true`, `signal`, chunk → `CoachEvent`, `ChatResult` fallback, narrowed `ChatClient` |
| `server/replyEnding.ts` (+ test) | `note` parameter, `finalReply` |
| `server/replyStream.ts` (+ test) | new: `collectReply`, `sseResponse`, first-text wait |
| `server/chatHandler.ts` (+ test) | budget at entry, `Accept` branch, D3 |
| `server/config.ts` (+ test) | the 27 000 ceiling |
| `server/test/fakeStreamingChat.ts` | new fake (below) |
| `server/eval/measure.ts`, `openRouterCoach.smoke.test.ts` | call `collectReply(await coach.stream(…))` |
| `server/eval/latencySpike.ts` | the non-stream arms pass `{stream: false}` explicitly |
| `src/api/askCoach.ts` (+ test) | `Accept`, `readStream`, `onText` |
| `src/domain/exchange.ts` (+ test) | `partial`, `progress` |
| `src/ui/useExchanges.ts`, `ExchangeOutcome.tsx`, `ExchangeEntry.tsx` | partial text and `aria-busy` |
| `src/test/fetchStub.ts` | a 200 `{reply, signature}` becomes a `done` frame; `stream(i)` controller |
| `src/acceptance/streaming.test.tsx` | new, one file for this feature |
| `netlify/functions/chat.mts` | **no change** (path, rate limit and wiring stay) |

## Acceptance criteria

1. **Streams into the entry.** Given an unlocked visitor who sends a message, when the coach starts answering, then text appears in that entry's Coach bubble and grows until the reply finishes. Send and Retry stay disabled until then, and "Coach is thinking…" shows only before the first text.
2. **The final reply is the signed one.** When `done` arrives, the entry shows exactly `done.reply`, once. The next request's history carries `done.reply` and `done.signature`, never the streamed text, and the server verifies it.
3. **Budget cut.** When the 25 s total budget (measured from request start) runs out after text has arrived:
   - the upstream call is aborted;
   - the reply is cut to its last complete line plus `TIME_CUT_NOTE`, signed and sent as `done`;
   - it arrives before the platform's ~30.3 s cut;
   - the visitor sees a partial marked cut short, never a 504;
   - "continue" works as the next message, because the partial is valid signed history.
4. **Budget out with zero text** is still 504 JSON `COACH_TIMED_OUT` with Retry.
5. **Token cap.** A reply that hits 1000 tokens ends on its last complete line with `CUT_SHORT_NOTE`, as today. `maxCompletionTokens` stays 1_000.
6. **Silent cut.** A stream that closes with no `done` or `error` shows `COACH_TIMED_OUT` with Retry. The partial is discarded, nothing enters history, and the composer draft is kept.
7. **In-band errors.** A provider failure after the first text shows `COACH_UNAVAILABLE` with Retry. Nothing is signed or stored. Logs carry name and statusCode only.
8. **Nothing else changes.** 405, 500, 401 (access cookie), 400/413 refusals, 400 unverified, 503 credit and 502 unavailable/empty (before any text) keep their JSON bodies, statuses and client handling. `chat.mts`'s path and rate limit are unchanged.
9. **Headers.** A streamed 200 has `Content-Type: text/event-stream; charset=utf-8` and `Cache-Control: no-cache`.
10. **Old tabs keep working.** A request without `Accept: text/event-stream` gets the JSON `{reply, signature}` (U3).
11. **Disconnect stops spend.** Cancelling the response body aborts the upstream call.
12. **Config.** `COACH_TIMEOUT_MS` above 27 000 falls back to 25 000.
13. **Accessibility.** The pending entry has `aria-busy="true"`, which clears when it settles.
14. **Hosted.** Measured on production (terra, effort none), the median first visible text of three 20k first turns is ≤ 2 s (≤ 3 s is acceptable, and anything above is flagged to the PO). The forced budget cut on the draft deploy shows a clean partial (demo).
15. **Eval unaffected.** `measure()` returns the same reply text for a canned response. `npm run eval` needs no new flags, and a $0 `rescore` of the v8 A/B JSON gives the same verdict.
16. `bin/check.sh` is green.

## Test order (outside-in; each red → green, one failure per turn, predict the failure first)

**0. Make the change easy** (refactor commits: no visible behavior change, all tests green before and after)
- **0a.** Add a `note` parameter to `endOnCompleteLine` (default `CUT_SHORT_NOTE`), and add `finalReply(text, ending)` with a test per ending.
- **0b. Handler test helper.** Route every success-body read in `chatHandler.test.ts` through one `repliedWith(response)` helper, so moving to SSE later changes a single function.
- **0c. `Coach.stream` port + `collectReply`.**
  - The adapter moves to `stream: true` behind the narrowed `ChatClient`, keeps its `ChatResult` fallback and moves the length ending out to `finalReply`.
  - The handler, `measure()` and the smoke test use `collectReply`.
  - `echoCoach` becomes a scripted fake coach.
  - Existing handler, adapter and eval tests stay green. The adapter's "ends a reply cut at the token cap" test moves to `finalReply`, and `latencySpike` passes `{stream: false}` explicitly.
- **0d. Budget replaces the deadline.** `startBudget` starts at handler entry and its signal flows into `coach.stream` and `chat.send`. It is still JSON, still 504 on zero text.
  - New test: "aborts the upstream call when the budget runs out". The fake chat sees `options.signal.aborted === true`. Red on today's race.
  - The `readTimeoutMs` ceiling (27 001 → 25 000).

**1. Thin first slice: the wire, `done` only** (the visitor sees the same thing as today, now over SSE)
1. **`chatStream.test.ts`:** `encodeEvent` and then `push` round-trip each event type. Red: the module is missing.
2. Triangulate the parser:
   - a frame split mid-JSON across two pushes;
   - two frames in one push;
   - `:` comments and unknown events are ignored;
   - `\r\n` line endings.
3. **Acceptance (`streaming.test.tsx`):** "shows the reply from a streamed response". `fetchStub.reply(0, 200, {reply, signature})` now writes a `done` frame. Red: "Unexpected response from the coach.", because `askCoach` reads JSON.
   - This drives `askCoach` reading the stream (`askCoach.test`: posts with `Accept: text/event-stream` and returns the `done` payload).
   - All 29 existing success stubs go through the same helper, so the whole acceptance suite now runs on the wire.
4. **Handler:** with `Accept: text/event-stream`, a 200 has the event-stream type, `Cache-Control: no-cache` and a body that parses to one `done` whose signature verifies. Red: `application/json`. `repliedWith` (0b) now parses SSE when streaming.
5. **Handler:** without `Accept`, the same request gets JSON `{reply, signature}` (AC 10). Expected green; mutation-check by forcing SSE.

**2. Deltas**
6. **Acceptance:** "streams text into the pending entry before the reply settles".
   - `server.stream(0)` returns a controller: `delta("Two meanings")`, `delta(" of late.")`, then `done(...)`, then `close()`.
   - After the first delta, the entry shows "Two meanings", "Coach is thinking…" is gone and Send is disabled.
   - After `done`, the reply appears exactly once.
   - Red: the entry still shows "Coach is thinking…". This drives:
     - `exchange.test`: `progress` updates only a matching pending exchange; `submit` starts at `partial: ""`;
     - `askCoach.test`: `onText` gets the accumulated text per delta;
     - `ExchangeOutcome` shows the partial.
7. **Acceptance:** "the settled reply is the signed `done` text, not the streamed text". Deltas "A. B. C" are followed by `done{reply: "A.\n\n(Cut short…)", signature: "sig-9"}`. The entry shows only the `done` reply, and the next send's history is `[{prompt, reply: done.reply, signature: "sig-9"}]`.
8. **Acceptance:** `aria-busy="true"` on the pending entry, removed once it has replied.
9. **Handler:** each coach `text` goes out as a `delta` frame in order, then `done` with the accumulated, signed reply.
10. **Handler:** the signed `done` reply verifies as history in a second request. This adapts the existing "signs a reply cut short…" test to SSE and the token-cap ending.

**3. The budget**
11. **Handler:** the fake chat streams "Line one.\n" and "Line two part", then hangs until the signal aborts, with `deadlineMs: 50`. Expect:
    - the deltas;
    - `done{reply: "Line one.\n\n" + TIME_CUT_NOTE}` with a valid signature;
    - the upstream signal aborted;
    - a `BudgetCut` log.

    Red: the stream hangs or ends with no `done`.
12. **Handler:** a budget end with only an incomplete sentence gives an `error` frame `COACH_TIMED_OUT` and no `done` (U7).
13. **Handler:** a budget end before any text gives 504 JSON `COACH_TIMED_OUT` (the existing test, now through the budget).
14. **Handler:** the budget counts from handler entry. Use fake timers and a request body that resolves after most of the budget. Assert the coach's signal aborts at the entry-relative time.
15. **Handler:** cancelling the response body (`response.body.cancel()`) aborts the upstream signal (AC 11).

**4. Failures**
16. **Acceptance:** "a stream that ends without `done` fails with Retry and keeps the draft". It sends deltas, then `close()`. Expect:
    - the `COACH_TIMED_OUT` alert and a Retry button;
    - the partial gone;
    - a draft typed during streaming still in the composer;
    - after Retry and a `done`, the history holds no partial.
17. **Acceptance:** an in-band `error("The coach is unavailable. Try again.")` shows the alert with Retry.
18. `askCoach.test`, ported and extended:
    - a `done` without a signature gives `UNEXPECTED`;
    - a `read()` rejection gives `UNREACHABLE`;
    - frames after the terminal event are ignored;
    - the existing non-2xx cases stay unchanged.
19. **Handler:** after the first text, the fake chat throws `BadGatewayResponseError`. Expect an `error` frame `COACH_UNAVAILABLE`, no `done` and a log of `{name, statusCode}` only.
20. **Adapter:** a chunk carrying `error` throws, which the handler turns into test 19's outcome. A 402 with a key limit on `send` still gives `CoachOutOfCredit`, a 503 JSON before any header (the existing test).
21. **Handler:** a stream that ends with no text and no abort gives 502 JSON "empty reply" (the existing test).
22. **Regression sweep:** every existing refusal and access test in `chatHandler.test.ts` passes with **and** without `Accept: text/event-stream` (a `describe.each` over both headers). This covers AC 8.

**5. Mutation checks (verifier, `retroactive-test-check`)**
- Remove the signal pass-through: test 0d goes red.
- Sign the streamed text instead of the final: test 7 or 10 goes red.
- Treat a close with no terminal as success: test 16 goes red.
- Drop `aria-busy`: test 8 goes red.

## Verifying without paid calls (builder and verifier)

- **`server/test/fakeStreamingChat.ts`** is a `ChatClient` whose `send(request, options)` returns an async generator of `ChatStreamChunk`s from a script. Options:
  - `chunks: string[]` (each one becomes `choices[0].delta.content`);
  - `finishReason` on the last chunk (`"stop"` or `"length"`);
  - `hang: true`: after the chunks, await `options.signal`'s abort, then throw `new DOMException("aborted", "AbortError")`, the way the fetch body does;
  - `failAfter: Error`: throw after the chunks;
  - `chunkError`: yield a chunk with `error`;
  - `rejectWith: Error`: `send` rejects before any stream (402/5xx).

  It records each request (messages, `stream`, `maxCompletionTokens`) and the `signal` it got. The handler tests use a thin scripted `Coach` built on the same scripts.
- **The client** uses `fetchStub`'s `stream(i)` controller, whose `Response` body is a `ReadableStream` the test pushes frames into. No timers are needed, because the test controls every chunk.
- **Local streaming check:** `npm run dev` with the real key sends one short message, at about $0.001. Optionally, `COACH_TIMEOUT_MS=3000 npm run dev` with the F1 thread forces a local cut. Restore the dev server afterwards in tmux `ddd-coach` (see `agent-team.md`).
- **$0 wiring smoke:** `curl -N -H 'Accept: text/event-stream' -X POST localhost:8888/api/chat` without the cookie returns 401 JSON, and with a GET returns 405. That shows refusals stay JSON on the streaming path.
- `bin/check.sh` is green.

## Prompt-eval impact (#78)

- **No prompt change**, so the #78 ship rule (an A/B for prompt changes) doesn't apply. `COACH_INSTRUCTIONS_VERSION`, the snapshots and the answer keys are all untouched.
- **The request changes only in `stream: true`.** Streaming doesn't change what the model samples. The A/B's production-conditions rule (D2 of slice 78) now means `stream: true` for both arms, and the adapter sets it for both, so pairing stays fair.
- **Harness wiring:**
  - `measure()` switches to `collectReply(await coach.stream(conversation, neverAborted))` (one line);
  - `recordingChat` is unchanged and still returns a collected `ChatResult`, which the adapter's fallback accepts;
  - recorded runs **gain `firstTokenMs` for free**;
  - `rescore.ts` and older JSONs are unaffected (the field is optional);
  - `latencySpike` keeps its non-stream arms by passing `{stream: false}`.
- **One real difference, reported only:** the eval applies **no time budget**, so an eval reply that took over 25 s would have been cut in production. Terra's recorded eval calls run 2–8 s, so no current run is near. See U10.
- **Check:** after 0c, run `node server/eval/rescore.ts` on the recorded v8 A/B JSON at $0. It must give the same verdict (AC 15).

## Hosted demo script (verifier; `outputs/demos/slice-08.{mp4,png,md}`)

**Setup**
- Production after the deploy checklist (`agent-team.md`), plus a **draft deploy** with `COACH_TIMEOUT_MS=6000` for the forced cut (U8).
- Inject an in-page overlay in the right-hand column (`pointer-events:none`). A `MutationObserver` on the newest `li` prints:
  - `sent` at submit;
  - `first text +X.X s` when the Coach `<p>` first has text;
  - `done +Y.Y s` when `data-status` becomes `replied` or `failed`.

  This shows TTFB without depending on the network panel, which is empty in recorded contexts.
- Budget: ≤ 6 paid calls, about $0.10.

**Take 1: production, TTFB and a long reply streaming**
1. Unlock and caption: "Streaming (#8): the reply types itself out".
2. Paste F1 `booking-split.txt` (20k) exactly as a visitor would (no nonce) and press Send. Caption: "20k paste".
3. The overlay shows `first text +~1–2 s`, and the Coach bubble visibly grows. Hold on it for 3–4 s.
4. `done +~13 s`: the reply is complete. Caption: "Signed only when finished".
5. Type "continue" or a follow-up and send. It streams again, which proves the signed history verified.

**Take 2: draft deploy, a forced budget cut (6 s)**
1. Caption: "Forced cut: budget set to 6 s on a draft deploy".
2. Send the F1 thread. Text streams, then at about 6 s the entry settles on a partial ending in '(Cut short at the time limit. Say "continue" for the rest.)'. No error, no 504. The overlay shows `done +~6 s`.
3. Send "continue". The next reply streams and picks up the thread, which shows the partial is valid history.

**Take 3: production, silent-cut handling** (optional, $0)
- Use `network route` on the full `/api/chat` URL to fulfil with a `text/event-stream` body of two `delta` frames and no `done`.
- The entry shows the `COACH_TIMED_OUT` alert with Retry, and a draft typed meanwhile is kept.

**Record in `slice-08.md`:**
- the three hosted TTFB samples (AC 14: median, max);
- the forced-cut reply's last line;
- the draft deploy id;
- confirmation that the draft's env override was removed (or that the draft was deleted) afterwards;
- the 1280×800 PNG of take 1 mid-stream, with a partial bubble and the overlay.

## Out of scope

- **Running past ~30 s.** The Edge Function spike stays parked in #33. Promote it only if #58 plus terra pushes hosted first turns past about 20 s.
- **#44's UI marker and Continue button.** This slice only adds `TIME_CUT_NOTE` text inside the signed reply. #44 stays open.
- **#74 reason codes and Retry-After.** The `error` frame uses the same `{error}` shape, so #74 adds `reason` once for both paths.
- **Stick-to-bottom scrolling while streaming** (U9).
- **Rendering markdown in replies.**
- **A client-side cancel ("Stop") button.**
- **Streaming reasoning text.**
- **Raising the 1000-token cap.**

## Risks

- **Cold start eats budget.** The platform clock starts before our handler. 25 s from handler entry plus a 1–2 s cold start plus the `done` flush stays under 30.3 s. 27 s might not (U1).
- **The 2 s TTFB target on a 20k first turn.** Prefill on terra may take longer than the spike's stub. Take 1 measures it, and AC 14 flags anything over 3 s instead of failing silently. #58's larger prefix makes it worse. Caching helps repeat visitors, not first turns.
- **jsdom streams.** `Response` with a `ReadableStream` body and `getReader()` must behave under vitest's jsdom environment. Test 3 exposes this first. If it breaks, run `askCoach.test` under `// @vitest-environment node` and keep the acceptance tests on a stub whose body is Node's `ReadableStream`.
- **Re-render cost.** About 1000 deltas means 1000 state updates. React 18 batches them, but a long reply on a slow phone may stutter. Mitigation if the demo shows it: coalesce deltas per animation frame in `useExchanges`, with no wire change.
- **Screen readers.** `role="log"` is live. Without `aria-busy`, every delta would be announced (AC 13 guards this).
- **The growing reply below the fold.** The composer is sticky, and nothing scrolls. The visitor may not see the stream on a small screen. The verifier checks this in take 1 at 1280×800 and on a 390 px viewport (U9).
- **Deploy-time stale tabs.** An open tab with the old JS sends no `Accept` and keeps getting JSON (U3). Without U3, it would see "Unexpected response" once.
- **Draft-deploy env scoping.** Whether a CLI draft deploy reads a context-scoped `COACH_TIMEOUT_MS` must be checked as a boolean before take 2. Never touch the production value. Fall back to the local forced cut if it can't be scoped (U8).
- **Mid-stream provider errors.** OpenRouter sends a final chunk with `error` and `finish_reason: "error"`. If the SDK surfaces these differently, test 20's fake may not match reality. The builder checks the SDK's `ChatStreamChunk` handling once against its source.
- **Partial discarded on a silent cut.** The visitor loses text they already read (U5). It should be rare, since the budget cut lands first.

## Suggested commits (committer owns them)

1. `r`: the `note` parameter and `finalReply`; the handler test helper (0a, 0b).
2. `r`: the `Coach.stream` port, `collectReply`, `stream: true` behind the adapter, and the eval and smoke wiring (0c).
3. `feat`: the budget signal aborts upstream, starts at entry, with the 27 s ceiling (0d).
4. `feat`: the shared SSE encoder and parser, and the `done`-only stream end to end (1–5).
5. `feat`: deltas stream into the pending entry, with `aria-busy` (6–10).
6. `feat`: a budget cut sends a signed partial marked cut short (11–15).
7. `feat`: a missing `done`, in-band errors and the regression sweep (16–22).
8. `docs`: the demo report and screenshot (verifier).

The sweeper then does its ACN pass.

## Decisions for the user / PO (recommended defaults marked)

- **U1: budget length.** **Recommended: keep 25 s** from handler entry, and treat `COACH_TIMEOUT_MS` above 27 000 as invalid (fall back to 25 000). That leaves about 5 s for cold start and the `done` flush. The alternative is 27 s, the issue's ceiling, which buys 2 s more text but risks the silent cut on a cold start.
- **U2: when headers go out.** **Recommended: on the first text.** Every zero-text failure then keeps its JSON status and message: 503 credit, 502 unavailable or empty, 504 timeout. Only mid-reply failures go in-band, and the spike's row k shows a 25 s wait before the first byte is safe. The alternative is headers at once, which gives no visible gain (nothing shows before text anyway) and moves every failure in-band.
- **U3: choosing the stream.** **Recommended: stream only for `Accept: text/event-stream`, and give JSON otherwise.** Tabs left open across the deploy keep working, curl and the deploy checklist's probes stay JSON, and existing handler tests are the regression suite. The alternative is to always stream, which means one path but breaks stale tabs once.
- **U4: time-cut note.** **Recommended: a new `TIME_CUT_NOTE` = '(Cut short at the time limit. Say "continue" for the rest.)'**, so the visitor knows why and #44 can tell the two cuts apart. The alternative is reusing `CUT_SHORT_NOTE` ("length limit"), which would be inaccurate.
- **U5: a stream with no `done`.** **Recommended: fail with `COACH_TIMED_OUT` and Retry, and discard the partial**, as the issue says ("treats a stream that ends without done as a failure"). The alternative is keeping the partial visible but unsigned, marked "not saved". That's more honest about what was read, but it's a new UI state.
- **U6: a provider error mid-reply.** **Recommended: in-band `error` `COACH_UNAVAILABLE`, partial discarded.** The alternative is to cut, sign and send the partial as with a budget cut, which saves text but labels a provider failure as a time limit.
- **U7: a budget cut with no complete line yet.** **Recommended: in-band `error` `COACH_TIMED_OUT`.** The alternative is to sign the raw fragment plus the note, which leaves a mid-sentence fragment in history.
- **U8: the hosted forced cut.** **Recommended: a draft deploy (`netlify deploy --alias stream-budget`) with `COACH_TIMEOUT_MS=6000` scoped to that deploy's context**, checked as a boolean. Production env is never touched, and the draft is removed afterwards. The alternative is a local-only forced cut, which is cheaper but doesn't meet the issue's "hosted demo … forced budget-out".
- **U9: keeping the stream in view.** **Recommended: defer.** The verifier checks take 1 at 1280×800 and 390 px. If the growing text hides under the composer, the PO opens a stick-to-bottom issue. The alternative is to add stick-to-bottom here, which is layout logic jsdom can't test.
- **U10: eval runs over the budget.** **Recommended: defer.** Recorded eval calls are 2–8 s. Revisit when #58 lands: a reported-only "would be time-cut" count in the A/B budget line. The alternative is to add that count now.
- **FYI #44:** this slice doesn't close #44. It adds a second cut-short note, and #44 keeps the marker and Continue button.
- **FYI #74:** the in-band `error` frame reuses `{error}`, so #74's reason code and Retry-After land once for JSON and SSE.
