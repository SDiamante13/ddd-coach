# Slice 2a demo: the app and `/api/chat` hosted on Netlify

Recorded 2026-09-24 on the **production URL https://ddd-coach.netlify.app**. Deploy `6ab5fa29…`, built from HEAD `50151b3`. Model `openai/gpt-5.6-terra`, `OPENROUTER_REASONING_EFFORT=none`. The session was `agent-browser --session verifier` (v0.23.0).

## Files

| File | Size |
|---|---|
| `slice-02a.mp4` (1 min 50 s, H.264, 1280×578) | 1.9 MB |
| `slice-02a.gif` (10 fps, 800 px wide) | 3.5 MB |
| `slice-02a.png` (1280×800, hosted: Maersk recalled in turn 2) | 37 KB |

The top banner is the step caption. The yellow panel at the bottom is a pass-through fetch spy. It prints each `POST /api/chat` body (`message` and `history`), then the status and the time it took, and calls the real `fetch`.

## Demo steps (captioned in video)

| Time | Step | What it shows |
|---|---|---|
| 0:00 | Intro | "Slice 2a: DDD Coach, hosted at ddd-coach.netlify.app" |
| 0:06 | a | The data-flow notice is outlined: "Your messages are sent to OpenRouter, an AI model provider, to generate replies. Nothing is stored on our server. Don't paste customer names or rates." |
| 0:15 | b | Turn 1: "…our carrier is called Maersk. Reply only OK." → `OK`. Spy: `history: 0 turn(s)`, 200 in 1,280 ms |
| 0:24 | b | Turn 2: "Which carrier did I name? Answer in one word." → **`Maersk`**. Spy: `history: 1 turn(s)`, 200 in 1,064 ms |
| 0:36 | c | `set offline on` → "Correction: the carrier is actually MSC." → "Could not reach the coach." + Retry. Spy: `network error: Failed to fetch` |
| 0:45 | c | `set offline off` → Retry → `OK`, 200 in 2,317 ms. The log has 3 entries, and the correction appears once. The retry body carries the 2 turns before it |
| 1:01 | d | A 9,000-char pasted message → 413 in 130 ms → "This message is too long for the coach. Shorten it and send it again." **No Retry button** (0 buttons in the entry) |
| 1:10 | — | Resource list: `/assets/index-*.js`, `/.netlify/scripts/hud`, `/favicon.ico`, `/api/chat`. The browser never contacts OpenRouter |
| 1:21 | e | A terminal burst of 30 `POST {}` from this IP: 400 ×27, then 429 ×3 |
| 1:30 | e | The browser sends while rate-limited → 429 in 46 ms → "The coach is unavailable. Try again." + Retry |

Editing notes:
- The video joins three takes; each `record start` opens a fresh browser context. Take 1 (steps a–c) is trimmed to 0:07–1:08. In the first take of (d) and (e), the result was hidden under the spy panel, and the spy panel was intercepting clicks on Send, so those steps were re-recorded in clean contexts. Take 2 is (d) and take 3 is (e).
- **The plan's hosted server-504 step was skipped** (team-lead decision). Drafts don't get the production secret, and a `--prod` deploy with `COACH_TIMEOUT_MS=1` would break production. The 504 JSON path was demoed locally in slice 2 (`slice-02.md`, video 1:52, plus `curl -si` → 504 `application/json`).
- The screenshot was taken after recording, in a fresh page at 1280×800, with no caption or spy.

Off-video captures:
- Turn 2 body: `{"message":"Which carrier did I name? Answer in one word.","history":[{"prompt":"My company is Eazy Freight. Remember: our carrier is called Maersk. Reply only OK.","reply":"OK"}]}`
- Retry body: `{"message":"Correction: the carrier is actually MSC. Reply only OK.","history":[T1/OK, T2/Maersk]}`. `__bodies` has 4 entries (T1, T2, the failed send, the retry), and the log has 3.
- The first 429 response: `HTTP/2 429`, `server: Netlify`, `content-length: 0`, HSTS present.

## Latency seen (hosted, real model)

| Request | Time |
|---|---|
| Replied turns | 1.06–1.28 s (4 samples: 1,280, 1,064, 1,186, 1,153 ms) |
| Retry after reconnecting | 2.3 s |
| 413 message too long | 130–166 ms |
| 429 rate-limited | 46–135 ms |
| Deployer's two-turn curl | about 1.3 s |

## Acceptance criteria

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | Hosted follow-up uses the turn-1 detail; the second request carries 1 history turn | **PASS** | Video 0:24; the spy and turn 2 body above; `slice-02a.png`. The deployer's two-turn curl gave the same result (about 1.3 s) |
| 2 | Failure → inline error + Retry; Retry resends the same prompt and history; one reply, no duplicate | **PASS** (network path) | Video 0:36–0:55; the retry body above; 3 log entries. The server-504 variant wasn't run on the hosted site (see editing notes); it was covered locally in slice 2 |
| 3 | No `sk-or` in `dist`, the deployed JS or the function zip; no `OPENROUTER` in static assets; `/.env`, `/src/main.tsx`, `/server/config.ts` → 404; no `.map` | **PASS** (deployer) | The deployer's bundle, zip and deployed-JS grep, and its 404 checks. Video 1:10 shows the browser fetches only same-origin assets and `/api/chat` |
| 4 | Body over 128 KiB → 413, coach not called; a maximal legitimate conversation is accepted | **PASS, wording changed** | Deployer: a 129 KiB body → 413. The body now carries `COACH_MESSAGE_TOO_LONG` ("…Shorten it…"), not `COACH_TOO_LONG` as the AC says (commit 9293198). The guard test covers the maximal conversation. The AC text needs updating |
| 5 | More than 20 POSTs/min from one IP → 429; the UI shows "The coach is unavailable. Try again." | **PASS, with a caveat** | Video 1:21–1:50. Bursts gave 400 ×24 then 429 (first run), 400 ×25 with no 429 (second run, about 3 min later), 400 ×28 then 429 ×2, and 400 ×27 then 429 ×3. **The limit is soft: 24–28 requests got through, not 20** |
| 6 | `/` has nosniff, Referrer-Policy, CSP `frame-ancestors 'none'`, HSTS | **PASS** | Deployer's check; re-checked with `curl -sI`: all four present |
| 7 | Platform timeout measured and recorded; hosted handler 504 is JSON | **PARTIAL** | Deployer's probe: Netlify cuts off at **about 30.4 s** with an **HTML 504**, not the documented 60 s. The hosted handler 504 was not run (no secret on drafts); it's JSON locally (slice 2) |
| 8 | Role-shaped history → 400; 51 turns or more than 24,000 chars → 413 "…Reload the page" | **PASS** (deployer) | The deployer's validation curls |
| 9 | Message over 8,000 chars → 413 shorten message, coach not called | **PASS** | Video 1:01 (9,000 chars → 413 in 130 ms, too fast for a model call); deployer's curls |
| 10 | Any 413 → no Retry; other failures keep Retry | **PASS** | Video 1:04 (413, 0 buttons); 0:36 (network) and 1:30 (429) show Retry |

## Known issues

1. **Only 5 s of margin between the platform timeout and our deadline.** Netlify returned an HTML 504 at about 30.4 s (deployer's probe), not after the documented 60 s. Our server deadline is 25 s, so it should still fire first, but a slow cold start plus the deadline could let the platform's HTML 504 through. `askCoach` still maps a non-JSON 504 to the timeout message, so the UI copy stays clean.
2. **The AC4 wording is out of date.** A body over 128 KiB now shows "This message is too long… Shorten it", not the "conversation… Reload the page" text of `COACH_TOO_LONG` that the AC names. The behavior is arguably better; the plan text should be updated.
3. **Function responses don't get the toml `Referrer-Policy` and CSP** (deployer: `/api/chat` responses lack them). `/` has them. The risk is low for JSON.
4. **Drafts lack the production secret**, so no hosted check of the handler's 504 is possible without breaking production.
5. **The rate limit is soft.** 24–28 requests got through before the 429s, and one 25-request burst got none. It is approximate per-IP throttling, not a spend cap. The OpenRouter credit limit is still the real bound.

## Fresh-eyes UX pass (hosted; not fixed)

Ranked by severity:

1. **Medium: single-line input for a coach that invites pasting specs.** `<input type="text">` flattens pasted newlines: `"line one\nline two"` became `"line one line two"`. The input is also about 150 px wide on desktop. Pasted domain docs lose their structure.
2. **Medium: the shorten message loses the draft.** The form clears on send. After "Shorten it and send it again", the only copy is the 9,000-char text rendered in full in the log, which takes up several screens. The user has to scroll and select it by hand.
3. **Medium: nothing on first visit says what to ask.** The page is an h1, the notice, and a bare "Message" field with Send. There's no purpose line, example question, or mention of DDD or Eazy Freight. The notice is the only prose, and it's about data handling. (Slice 3's prompt and briefing is the natural fix.)
4. **Low–medium: Netlify injects a "Powered by Netlify" badge and HUD script.** A fixed badge covers the bottom-right corner, over the latest content on mobile once the log grows. It loads `/.netlify/scripts/hud` plus an iframe, and adds a marketing HTML comment to `index.html`. It can probably be turned off in site settings; worth checking against the "nothing stored" and privacy framing.
5. **Low: "Nothing is stored on our server" can be read as a promise about OpenRouter too.** OpenRouter and the upstream provider may log or retain prompts under their own policies. Consider "…we don't store your messages; OpenRouter's data policy applies".
6. **Low: the 429 copy offers Retry, which fails again for about 60 s.** "The coach is unavailable. Try again." doesn't say to wait. That's fine for a human pace, but a "wait a minute" hint would help anyone who hits it.
7. **Low: unstyled page.** Browser-default serif and a tight "Message[input]Send" row. It's readable at 390 px, with no horizontal scroll.

No blunders found in the error mapping: every failure (offline, 413, 429) showed plain copy, with no stack trace or raw status.

## Tooling notes

- **Fixed overlays intercept clicks.** The spy panel covered the Send button, so `click` hit the panel and nothing was sent. Give injected panels `pointer-events:none` and bottom padding. The first take's refs also went stale after the Retry button disappeared. Use CSS selectors (`input`, `form.requestSubmit()`) instead of `@eN` refs mid-script.
- **`wait --fn` can hang** past the 120 s tool timeout when its condition never becomes true. Prefer `wait <ms>` plus an `eval` check.
- **Your own rate-limit burst lasts past the step.** A later 9,000-char POST got 429, not 413, because the limit applies at the edge before the function runs. Wait about 60 s, until `GET /api/chat` → 405, before re-recording other steps.
- `agent-browser screenshot <relative path>` resolves against the daemon's cwd (the repo root), not the shell's. Use absolute paths.

## Follow-ups (navigator to triage)

- Update the AC4 text in `slice-02a-plan.md` to "413 with `COACH_MESSAGE_TOO_LONG`".
- Consider lowering the server deadline, or recording the 30 s platform limit in the plan (it currently says 60 s).
- Apply `Referrer-Policy` and CSP to function responses (set them in `chatHandler`), or accept and document the gap.
- Multi-line `<textarea>` input with Enter/Shift-Enter (fresh-eyes 1). Keep the draft on a 413, or restore it (fresh-eyes 2).
- Turn off the Netlify badge and HUD if the site settings allow it (fresh-eyes 4).
- Tighten the notice copy (fresh-eyes 5).
- Rate limit: if abuse appears, lower `windowLimit`, since the edge lets about 25% more through.
- A hosted 504 check needs either a production secret in the deploy-preview context or an accepted short production outage. Otherwise the local slice 2 demo remains the evidence.
