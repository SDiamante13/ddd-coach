# Slice 1 demo: connection test

Recorded 2026-09-24 against the live dev server (http://localhost:8888, `.env` key and model set, real OpenRouter replies).

## Files

| File | Size |
|---|---|
| `slice-01.mp4` (90 s, H.264) | 456 KB |
| `slice-01.gif` (8 fps, 900 px wide) | 199 KB |
| `slice-01-1-ready.png` | 16 KB |
| `slice-01-2-pending.png` | 24 KB |
| `slice-01-3-failure.png` | 41 KB |
| `slice-01-4-html-as-text.png` | 93 KB |

## Demo steps (captioned in video)

1. App ready: empty log, input focused.
2. Real Eazy Freight question, "In one sentence: what is a domain event at Eazy Freight?". It shows pending with "Coach is thinking…", then exactly one real reply.
3. Browser offline → "Second message" → inline "Could not reach the coach." + Retry → back online → Retry → one reply; "Second message" appears once.
4. Enter pressed twice while pending → one log entry, one `POST /api/chat` (confirmed via `network requests`).
5. Spaces only, via Enter and Send → no request captured, log unchanged.
6. `<b>x</b>` in the prompt, with the model asked to echo it → prompt and reply both render as literal text; 0 `<b>` elements in the log.

Part A of the plan's script (blank key) was dropped because the key is set. Criterion 9 is covered by unit tests instead.

## Acceptance criteria

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | Input focused, log empty on load | PASS | `activeElement` = input, 0 `li` in log; screenshot 1 |
| 2 | Message once + "Coach is thinking…", input clears, Send disabled | PASS | eval: `input:""`, `sendDisabled:true`; screenshot 2. Enter and Send paths both checked |
| 3 | Blank/whitespace → no request, no entry | PASS | `network requests`: none captured; item count unchanged |
| 4 | Enter/Send while pending → nothing added, 1 fetch | PASS | Double Enter, plus typing new text + Enter + clicking Send while pending → 1 entry, 1 POST |
| 5 | Exactly one reply, pending clears | PASS | Real replies, one per entry |
| 6 | Non-2xx or network failure → inline error + Retry | PASS | Network failure: `set offline on` → "Could not reach the coach." + Retry (video, screenshot 3). Non-2xx: one-shot `fetch` stub returning 502 `{error}` → inline error + Retry (off-video) |
| 7 | Retry → same entry pending, same text resent, one message, one reply | PASS | Final state: 4 entries, no duplicate prompts; retry POST 200 |
| 8 | `<b>x</b>` in reply is literal text | PASS | innerHTML `&lt;b&gt;x&lt;/b&gt;`, 0 `b` elements; screenshot 4 |
| 9 | Missing/blank key or model → 500 naming var, no provider call; key not leaked | PASS (tests + grep) | `server/chatHandler.test.ts` "fails with the missing variable's name without creating a coach", "hides provider failure details behind a generic 502"; `server/config.test.ts` missing key / blank model. `dist/` grep clean |

## Checks

- `bin/check.sh` (test, typecheck, build): exit 0
- `npm run build` → `grep -rl "sk-or" dist`: no matches; `grep -rl OPENROUTER dist`: no matches

## Tooling note

`agent-browser network route` (v0.23.0) did not intercept `fetch('/api/chat')` with any pattern tried (`**/api/chat`, the full URL, `*/api/chat`, `**`), with or without `--abort` or `--body`, before or after a reload. The real server answered every time. The demo used `set offline on/off` for the network failure and a one-shot `window.fetch` stub for the 502.

## Bugs / findings (ranked, not fixed)

1. **Retry ignores single-flight.** Retry stays enabled while another exchange is pending (`src/ui/ExchangeOutcome.tsx:15`; busy isn't passed down). Reproduced: send a message, then click Retry on an older failed entry, and two POSTs are in flight at once. Criterion 4 covers only Enter/Send, so this is a spec gap, not a failed criterion.
2. **An empty reply looks like a hang.** `extractText` returns `""` for missing or empty content (`server/openRouterCoach.ts:29-31`, tested as "treats missing content as empty text"), the handler returns 200 `{reply:""}`, and the UI renders an empty `<p>`. The user sees the message with nothing under it and no Retry.
3. **The server is blind to provider failures.** `chatHandler.ts:42` swallows the error without logging. A bad model id or quota error shows only as a generic 502, with nothing in the function log to diagnose it. Safe for key leakage, but hard to operate.
4. **The busy guard lives in HTML semantics.** `MessageForm.handleSubmit` doesn't check `busy`. It relies on the browser skipping implicit submission when the default button is disabled. Verified OK in Chromium, and the test passes, but it's fragile if the button markup changes.

## Known issue: `netlify dev` 30s function timeout

The demo avoids this by keeping prompts short (one-sentence answers, each reply in a few seconds). The timeout was reproduced off-video with `curl` and a long-essay prompt:

- `HTTP 500` after 30.12s, with no `Content-Type`
- Plain-text body: `TimeoutError: Task timed out after 30.00 seconds` followed by a stack trace from `node_modules/lambda-local/...`, which includes absolute local paths
- Client: the body isn't JSON, so `askCoach` returns "Unexpected response from the coach." with Retry. Retrying the same long prompt times out again.

Not fixed. Candidates for a later slice:
- a response length cap (`max_tokens`)
- a faster model
- streaming (out of scope for slice 1)

The stack trace leaking in the response is a local-dev issue in `netlify dev`. Production timeout behaviour is unverified.

## Known quirks

- After clicking Send, focus stays on the (now disabled) Send button, not the input. Keyboard users must refocus.
- After clicking Retry, the button unmounts and focus drops to `body`.
- A whitespace-only draft stays in the input after rejection. It isn't cleared.
- Markdown in replies shows raw (`**Shipment**`), as expected since markdown rendering is out of scope.
- No multi-turn context: the model says "this is the first message I'm seeing", as expected since that's out of scope.
