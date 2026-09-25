# Slice 2 demo: remember the current conversation (+ slice 1b checks)

Recorded 2026-09-24 against the live dev server (http://localhost:8888, `.env` key and model set, real OpenRouter replies). Code at `0accea8` (slice 2 `feat` 55dab35 + 1f80265, sweep da2c361..0accea8). The demo also covers slice 1b (6ea0482), which had no demo of its own.

## Files

| File | Size |
|---|---|
| `slice-02.mp4` (2 min 1 s, H.264, 1280×578) | 1.3 MB |
| `slice-02.gif` (10 fps, 800 px wide) | 1.0 MB |
| `slice-02.png` (1280×800, Maersk recalled in turn 2) | 25 KB |

The top banner is the step caption. The yellow panel at the bottom is a pass-through fetch spy: it prints every `POST /api/chat` body (`message` + `history`) and then calls the real `fetch`.

## Demo steps (captioned in video)

| Time | Step | What it shows |
|---|---|---|
| 0:00 | Intro | "Slice 2: memory across turns (+ slice 1b checks)" |
| 0:03 | 1 | Turn 1: "…our carrier is called Maersk. Reply only OK." → `OK`. Spy: `history: 0 turn(s) []` |
| 0:10 | 2 | Turn 2: "Which carrier did I name? Answer in one word." → **`Maersk`**. Spy: `history: 1 turn(s)` = turn 1 prompt + reply |
| 0:16 | 3 | `set offline on` → "Correction: the carrier is actually MSC." → "Could not reach the coach." + Retry; back online |
| 0:24 | 4 | Ask again → Retry on the correction is **disabled** while pending. A real mouse click on it sent nothing (request count 4 → 4). Reply: `Maersk`; spy `history: 2 turn(s)`, so the failed correction is left out |
| 0:32 | 5 | Click Retry on the correction → its body carries only the 2 turns before it (not turn 4) → `OK`. Then "Which carrier now?" → **`MSC`**; spy `history: 4 turn(s)` in log order (T1, T2, correction, T4) |
| 0:46 | 6 | "Write a 3000-word essay on aggregates." → one reply, cut off mid-sentence (2,815 chars ≈ 600 tokens) in about 17 s, within the deadline |
| 1:10 | 7 | One-shot `fetch` stub → 500 `text/plain` → "The coach is unavailable. Try again." + Retry (not "Unexpected response") |
| 1:16 | 8 | Fresh session: name Maersk → reload → empty log → "Which carrier did I name?" → the coach doesn't know; spy `history: []` |
| 1:39 | Part B | Dev server restarted with `COACH_TIMEOUT_MS=1` (Vite reloads the page) |
| 1:52 | 9 | "Hello coach" → "The coach took too long. Try a shorter question or Retry." + Retry |

Editing notes, for honesty:
- **The restart wait was cut.** About 54 s of idle frames (the tmux restart) were removed between 1:42 and 1:43.
- **Step 8 is a separate take.** In the main take, `agent-browser reload` froze the screencast (see Tooling), so step 8 was recorded as two clips. The "reload" between them is a fresh browser context load from `record start`, which is at least as strong as a reload. The same reload in the main take gave the same result, captured by eval: `history: []`, and the coach answered "You haven't named a carrier yet…".

Off-video captures from the main take:
- Step 2 body: `{"message":"Which carrier did I name? Answer in one word.","history":[{"prompt":"My company is Eazy Freight. Remember: our carrier is called Maersk. Reply only OK.","reply":"OK"}]}`
- Step 5 retry body: `{"message":"Correction: the carrier is actually MSC. Reply only OK.","history":[T1/OK, T2/Maersk]}`

## Acceptance criteria: slice 2

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | Follow-up carries `history` with turn 1 + new `message`; the reply uses a turn-1 detail | PASS | Video 0:10, where the reply names Maersk; spy + eval body; screenshot. App test "sends a follow-up with the earlier replied turn as history" |
| 2 | Failed/pending exchanges absent from `history`; replied turns keep log order | PASS | Video 0:24 (failed correction excluded) and 0:32 (4 turns in log order). Mutation M1 went red (3 tests) |
| 3 | Retry resends its prompt with only the replied turns before it | PASS | Video 0:32; retry body has T1, T2 only. Mutation M2 went red |
| 4 | Reload → empty log, first request `history: []` | PASS | Video 1:16; eval `li` count 0, body `history: []` |
| 5 | Malformed history → 400, coach not called | PASS | `curl`: role-shaped item → 400 `{"error":"Send a message."}`; missing `history` → 400. Handler `it.each`, 6 cases |
| 6 | > 50 turns or > 24,000 chars → 413 + too-long message, coach not called; shown inline | PASS | `curl`: 51 turns → 413 JSON; 24,001 chars → 413 JSON; 50 turns / 23,999 chars → 200. In the browser, a 24,001-char message shows the too-long message inline. Mutations M3 (boundary) and M4 (413→400) went red |
| 7 | OpenRouter gets user/assistant pairs in order, then the new user message; no system; 600 cap, no retries | PASS (tests) | `openRouterCoach.test.ts` "sends the history as alternating turns…". Mutation M5 (reversed history) went red. Real-model recall on video |
| 8 | Slice 1b still holds | PASS | See below |

## Acceptance criteria: slice 1b

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | `maxCompletionTokens: 600`, SDK retries off | PASS | Adapter test; video 0:46, essay cut off at about 2.8k chars |
| 2 | Deadline → 504 JSON timeout message + Retry | PASS | Video 1:52 with `COACH_TIMEOUT_MS=1`; `curl -si` → `504`, `content-type: application/json`, `{"error":"The coach took too long. Try a shorter question or Retry."}` |
| 3 | Non-JSON non-2xx → status-based message, never "Unexpected response" | PASS | Video 1:10 (500 text/plain → "The coach is unavailable. Try again."); `askCoach.test.ts` 504/other cases |
| 4 | Retry disabled while another exchange is pending; a click starts no request; re-enabled after | PASS | Video 0:24: `disabled: true`, a real mouse click, request count unchanged, Retry usable at 0:32. App test "disables Retry while another exchange is pending…" |
| 5 | Empty/whitespace provider reply → 502 empty-reply message | PASS (test only) | `chatHandler.test.ts` "fails with a 502 when the coach's reply is blank". Not reproducible with the real model on demand |
| 6 | Coach throws → log only `name` + status code | PASS (test only) | `chatHandler.test.ts` "logs only the failure's name and status code, never its message" |

## Checks

- `bin/check.sh` (test, typecheck, build): exit 0. 74 passed, 2 skipped (the smoke tests need the OpenRouter vars in the test env).
- Mutation checks, each reverted with `git checkout -- <file>`:

| ID | Mutation | Result |
|---|---|---|
| M1 | `turnsOf` keeps failed exchanges | 3 red |
| M2 | Retry sends `turnsOf(exchanges)` instead of `historyBefore` | 1 red |
| M3 | Char limit `>` → `>=` | 1 red |
| M4 | 413 mapped to 400 | 1 red |
| M5 | History reversed in `messagesOf` | 1 red |

- `npm run build` → `grep -rl "sk-or" dist`: no matches; `grep -rl OPENROUTER dist`: no matches.

## Findings (ranked, not fixed)

1. **A single oversized message gets misleading 413 copy.** `parseChatRequest` counts the new `message` toward the 24,000-char total (`server/chatRequest.ts:18,26-28`). A 24,001-char first message in an empty log returns 413 "This conversation is too long for the coach. Reload the page to start a new one." (reproduced in the browser). But reloading can't help, because the message itself is too long. It needs its own message, like "This message is too long", or a per-message cap.
2. **Retry on a 413 entry is a dead button.** A too-long entry gets Retry like any failure (`src/ui/ExchangeOutcome.tsx:17`). Retrying resends the same history before it, plus the same prompt, so it can only 413 again. Same with every later message until reload (by design, B38), but the Retry affordance suggests otherwise.
3. **`send` relies on the form for its busy guard.** `useExchanges.send` computes `turnsOf(exchanges)` from render-time state and has no busy check (`src/ui/useExchanges.ts:23-27`). `retryFailed` does check, via `canRetry`. The stale-closure safety noted in the plan's Risks therefore depends on `MessageForm`'s disabled-button semantics (slice 1 finding 4). A guard in `send` would make it hold by construction.
4. **The client owns the assistant turns (info).** The server trusts client-supplied `reply` text as `assistant` messages (`server/openRouterCoach.ts:47-52`). The shape rules out a `system` role, but a user can fabricate prior coach answers. That's harmless now (single user, no system prompt). Worth a note when slice 3 adds the coaching prompt and briefing: forged assistant turns can argue against it.
5. **Test gap (low).** No UI test shows a 413 inline. It's covered only by the generic `errorFrom` mapping and by the browser check above.

No blunders found in the domain functions, the adapter mapping, the handler branching or the contract types.

## Tooling notes

- **`agent-browser record` freezes on reloads.** It (v0.23.0) stops writing new frames after `reload` or `location.reload()`, and sometimes after `open`. Frames resume only on a later navigation, and there's no gap in the timestamps, so the lost section just disappears from the video. Workaround: split around reloads with `record stop` / `record start` (a fresh context), then concat with ffmpeg.
- **The recording ignores the viewport.** The recording context used 1280×578 despite `set viewport 1280 800`. The PNG was taken afterwards, outside the recording.
- **`record stop` can fail** with "ffmpeg wait failed: No child processes" even though the webm is complete. A second `record stop` clears the stale state.
- **The `ddd-coach` tmux session lives on the default tmux socket.** Inside a claude-swarm pane, `$TMUX` points to the swarm socket, so `tmux ls` doesn't show it. Use `tmux -S /private/tmp/tmux-501/default …`.
- **Ctrl-C killed the session.** Its pane ran `zsh -c "npx netlify dev --offline …; exec zsh"`, and Ctrl-C ended the whole session. It was recreated as `ddd-coach` and restored with `npm run dev` (without `--offline`, which works fine). The server is back on :8888.
- **`network route` still doesn't intercept `fetch`.** Failures used `set offline on/off` and a one-shot `window.fetch` stub, as in slice 1.

## Backlog refs

- **B33** Focus after Send/Retry: unchanged, still visible in the demo.
- **B34** Clear a whitespace draft: unchanged.
- **B35** Streaming replies: the essay step shows the 600-token cap is what keeps replies inside the deadline.
- **B36** Log deadline timeouts: the step 9 504 wasn't logged server-side.
- **B37** Cancel the provider call on 504.
- **B38** Trim or summarise long conversations: the 413 dead end (findings 1 and 2 refine its UX).
- **B39** Cap the request body size before parsing: the 413 is decided after the full body is parsed.
