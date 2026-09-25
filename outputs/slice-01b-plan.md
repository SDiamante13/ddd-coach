# Slice 1b: hardening the connection test

This slice fixes the slice 1 findings before multi-turn. The coach must never look hung: replies are capped in length, slow calls fail with a clear message before the platform kills the function, Retry can't start a second request while one is pending, and an empty reply becomes a failure with Retry.

## Goal fit

| Goal | How slice 1b contributes |
|---|---|
| Maximize learning | Timeout, retry and empty-reply handling carry over to multi-turn (2a) and hosting. Learn how the SDK retries before building on it |
| Fun | A coach that never hangs silently |
| Solve real DDD problems | None directly. Unblocks slice 2a hosting |

## Facts (verified)

**SDK 1.3.27 `.d.ts`** (the README is stale):
- Length cap field: `chatRequest.maxCompletionTokens?: number | null` (`models/chatrequest.d.ts:139`). `maxTokens` is marked deprecated. Use `maxCompletionTokens`.
- `chat.send(request, options?: RequestOptions)`. `RequestOptions = { timeoutMs?, retries?, retryCodes?, … } & Omit<RequestInit,"method"|"body">`, so `signal` is accepted too (`lib/sdks.d.ts:8-34`).
- **Hidden retry loop.** With no `retries` option, `chatSend.js:46-59` defaults to `backoff` with `maxElapsedTime: 3600000`, `retryConnectionErrors: true` and `retryCodes: ["5XX"]`. `timeoutMs` and `AbortSignal.timeout` both raise a `TimeoutError`, which `retries.js` treats as retryable. So an SDK timeout alone does **not** bound the call: a provider 5xx or timeout is retried silently until the function dies. That is the likely cause of some "hangs". Fix: pass `{ retries: { strategy: "none" } }` and bound the call with our own deadline.

**Netlify function timeouts:**
- Hosted synchronous function: **60 s**, not configurable (docs.netlify.com/build/functions/configuration, "Default values" table). The old 10 s default (26 s via support) is outdated. Streaming functions also get 60 s. Re-check this at slice 2a; the limit may depend on the plan.
- `netlify dev` kills at 30 s and returns a plain-text 500 stack trace (slice 1 known issue).
- **Recommended server deadline: 25 s by default**, overridable by the `COACH_TIMEOUT_MS` env var (a positive integer; anything else uses the default). 25 s sits below both limits, so local and hosted behave the same. The env var also makes the timeout demo instant (`COACH_TIMEOUT_MS=1`).

**Current code:**
- `ExchangeOutcome` doesn't receive `busy`.
- `useExchanges.retryFailed` asks unconditionally.
- `extractText` returns `""` and the handler returns 200 `{reply:""}`.
- `replyFrom` swallows errors.
- `askCoach` maps any non-JSON non-2xx body to "Unexpected response from the coach."

## Acceptance criteria

1. Given any request, when the server calls OpenRouter, then the request carries `maxCompletionTokens: 600` and SDK auto-retries are off.
2. Given the coach hasn't answered within the deadline (default 25 s, `COACH_TIMEOUT_MS` overrides), then the server returns 504 `{error:"The coach took too long. Try a shorter question or Retry."}` and the entry shows that message with Retry.
3. Given the server (or platform) returns a non-2xx response whose body is not JSON `{error}`, then the entry shows the timeout message for 504 and "The coach is unavailable. Try again." for other statuses, never "Unexpected response". "Unexpected response" stays only for a 2xx response with a malformed body.
4. Given one exchange is pending and another has failed, then that Retry is disabled, and a retry attempt starts no request (the domain guard holds even if the button is clicked). When the pending exchange settles, Retry is enabled again.
5. Given the provider reply is empty or whitespace-only, then the server returns 502 `{error:"The coach sent an empty reply. Try again."}` and the entry shows it with Retry.
6. (Optional) Given the coach throws, then the server logs the error's `name` and HTTP status code only (no message, no key). The response is unchanged: a generic 502.

## Test order (outside-in, each red → green)

UI (RTL, `fetch` stub with deferred promises):
1. A failed entry plus a pending entry: Retry is disabled and `fetch` is called once. Settle the pending entry, and Retry is enabled again (criterion 4).

Server handler (real `Request`/`Response`, fake `Coach`, deadline injected):
2. The coach never resolves and `deadlineMs: 10` → 504 with the timeout body (criterion 2). Clear the timer in `finally`.
3. The coach resolves `"  "` → 502 with the empty-reply body (criterion 5).
4. (Optional) The coach throws `Error("… sk-or-test-key")` with `name`/`statusCode` → the injected `log` spy is called with `{ name, statusCode }`, and the serialized log args don't contain the key (criterion 6).

Adapter:
5. Update the existing request assertion: `chatRequest` includes `maxCompletionTokens: 600`, and `send` gets a second argument, `{ retries: { strategy: "none" } }` (criterion 1). `ChatClient.send` gains the `options` parameter.

Units:
6. `canRetry(exchanges, id)`: failed with nothing pending → true; failed while another is pending → false; a pending or replied target → false. `useExchanges.retryFailed` returns early when it's false.
7. `readTimeoutMs(env)`: unset → 25000; `"5000"` → 5000; blank, `"abc"`, `"0"` or `"-1"` → 25000.
8. `askCoach`: 504 with a text body → timeout message; 500 with a text body → unavailable message; 200 with a malformed body → unexpected (existing test).

## Design notes

- The deadline lives in the handler as `Promise.race(coach.reply, timer)`. It doesn't depend on the adapter, so any `Coach` is bounded and the test uses a never-resolving fake. `ChatHandlerDeps` gains `deadlineMs: number` (and optionally `log`). `chat.mts` wires in `readTimeoutMs(process.env)`.
- The empty-reply check belongs in the handler, next to the timeout: the server is the anti-corruption boundary. The adapter keeps returning `""`, so its existing test stays.
- `canRetry` sits beside `isBusy` in `src/domain/exchange.ts`. It is pure and takes `(readonly Exchange[], ExchangeId)`. The UI passes `busy` down only to disable the button; the guard itself lives in the domain.
- The in-flight SDK fetch isn't cancelled after a 504. That's acceptable: once `retries` is `none`, it ends on its own or dies with the function. Forwarding an `AbortSignal` is a possible later addition.

## Files touched

```
server/openRouterCoach.ts(+test)  maxCompletionTokens, retries none, ChatClient options param
server/chatHandler.ts(+test)      deadline race → 504, empty reply → 502, optional log dep
server/config.ts(+test)           readTimeoutMs(env)
netlify/functions/chat.mts        wire deadlineMs (+ console.error log)
src/domain/exchange.ts(+test)     canRetry
src/ui/useExchanges.ts            guard retry with canRetry
src/ui/ConnectionTest.tsx, ExchangeEntry.tsx, ExchangeOutcome.tsx   pass busy, disable Retry
src/api/askCoach.ts(+test)        status-based messages for non-JSON errors
src/App.test.tsx                  test 1
.env.example                      COACH_TIMEOUT_MS= (commented, optional)
```

## Out of scope

- Streaming (backlog, before 2a).
- Multi-turn.
- Focus quirks.
- Whitespace draft not clearing.
- Model switching (the user edits `.env`).
- Styling.
- Cancelling the in-flight provider fetch.
- A truncation notice when `finishReason: "length"`.
- Making the max-tokens value configurable.
- Hardening `MessageForm.handleSubmit` against busy (slice 1 finding 4), unless builder adds a one-line guard in the hook's `send` alongside `canRetry`.

## Demo script (verifier)

`agent-browser --session verifier record start outputs/demos/slice-01b.webm`, with an injected caption banner for each step.

Part A: the existing dev server on :8888 (normal `.env`):
1. Open http://localhost:8888. Caption: "Slice 1b: hardening. Input ready."
2. `set offline on`, then send "First message". It shows "Could not reach the coach." with Retry. `set offline off`.
3. Send "In one sentence: what is a bounded context at Eazy Freight?" While it's pending, Retry on "First message" is disabled, and clicking it does nothing. Caption: "Retry blocked while another exchange is pending." Confirm one POST via `network requests` or a `fetch` counter. After the reply, Retry is enabled. Click it: one reply, no duplicate.
4. Send "Write a 3000-word essay on aggregates." One reply arrives within the deadline, capped (it's visibly cut short). Caption: "Length capped at 600 tokens, so no 30 s platform kill."
5. A one-shot `window.fetch` stub returns 500 `text/plain`. Send "Stub test". It shows "The coach is unavailable. Try again." Caption: "A non-JSON server error gets a clear message."

Part B: restart the dev server with an instant deadline (`COACH_TIMEOUT_MS=1 npm run dev`; the shell env overrides `.env`, so `.env` stays unread and unedited):
6. Send "Hello coach". It shows "The coach took too long. Try a shorter question or Retry." with Retry. Caption: "Server deadline → clear 504, not a stack trace." Off-video: `curl -si` shows `504` with `Content-Type: application/json`.
7. Restart the dev server normally (`npm run dev`) so the server is left as it was found.

The empty reply can't be forced reliably from the real provider. It is covered by handler test 3; state that in the demo md. Screenshot at 1280×800: step 3, the pending entry plus a disabled Retry.

## Risks

- **Reasoning models:** reasoning tokens count toward `maxCompletionTokens`, so 600 can yield empty content with `finishReason: "length"`. The empty-reply path catches this as a failure, but repeated failures would mean the model or cap is wrong. If step 4 shows the empty-reply error, flag the model choice.
- 600 tokens can still take more than 25 s on a slow model. The deadline catches that, and streaming (backlog) is the real fix.
- Turning SDK retries off means a single transient provider 5xx now shows as an immediate 502 with Retry. That's intended: the user sees it instead of a silent hang.
- Part B restarts the shared :8888 server. Navigator should confirm that no other agent is using it.
- Hosted timeout (60 s) comes from the docs and hasn't been measured. Verify at 2a.
