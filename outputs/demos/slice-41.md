# Slice 41 demo: a shared password for the conference (#41)

Recorded 2026-09-25 on the **production URL https://ddd-coach.netlify.app**. Deploy `6ab6998e…`, built from `968f7ed`. The session was `agent-browser --session verifier` (v0.23.0), starting from a fresh profile with no cookie. The hosted model comes from `OPENROUTER_MODEL` in the Netlify env, which the client never sees. The deployer has the value.

The password was read from the team-lead's mode-600 scratch file only inside `fill "$(cat …)"` and a `json.dumps` in a subshell. It was never printed, and it isn't in any caption, frame, file name or this report. A probe showed that `fill` prints only "✓ Done" and doesn't echo the value, and agent-browser keeps no argument log under `~/.agent-browser`. `grep -F -f <pass file> outputs/demos/` → 0 hits.

## Files

| File | Size |
|---|---|
| `slice-41.mp4` (2 min 54 s, H.264, yuv420p, 1280×578, three takes joined) | 2.0 MB |
| `slice-41.png` (1280×800, fresh browser: the gate) | 51 KB |
| `slice-41-app.png` (1280×800, unlocked: OK / Maersk exchange, message box focused, overlays hidden) | 71 KB |

No GIF (team rule). The blue top banner is the step caption. The yellow panel on the right is a fetch spy that shows method, path, status and time only. It never shows request bodies, so the password can't appear in it.

## Demo steps (captioned in video; times approximate)

| Time | Take | Step | What it shows |
|---|---|---|---|
| 0:00 | 1 | – | Intro: slice 41, hosted URL, fresh browser |
| 0:07 | 1 | 1 | The gate: purpose line, data-flow notice and one "Conference password" field with Enter. No message box (`textarea` absent) |
| 0:15 | 1 | 2 | `not-the-password` typed, then Enter → spy `POST /api/unlock → 401 (0.23 s)`. Alert: "That password isn't right. Check the slide and try again." The field keeps 16 dots and is `aria-invalid="true"` and focused. No `coach_access` cookie. No chat call |
| 0:32 | 1 | 3 | The right password is filled from the file, then Enter → `POST /api/unlock → 204 (0.22 s)`. The gate is gone and the focus is on the message `TEXTAREA` |
| 0:45 | 1 | 4 | "Nonce 09:59:27. My company is Eazy Freight; our carrier is Maersk. Reply only OK." → `POST /api/chat → 200 (2.48 s)`, reply **OK** |
| 1:00 | 1 | 4 | "Which carrier? One word." → `200 (3.70 s)`, reply **Maersk** (the signed history works behind the gate) |
| 1:30 | 2 | 5 | **New take (the reload):** `record start … <url>` reloads in the same browser → straight to the app, no gate, message box focused. `GET /api/session → 204 (0.30 s)`. "Nonce 11:12:26. Reply only OK." → `POST /api/chat → 200 (6.72 s)` |
| 2:07 | 3 | bonus | **Mid-conversation expiry:** `cookies clear` in the app, then Send → `POST /api/chat → 401 (3.69 s)`. The entry shows ACCESS_REQUIRED with "Copy the conversation" and "Start a new one" and **no Retry**. The password form appears inline above the composer, focused, and the prompt is back in the draft |
| 2:30 | 3 | bonus | The password is entered inline → `unlock 204 (0.17 s)`, and the focus goes back to the message box with the draft intact. Send → `chat 200 (1.85 s)`. No reload needed |

Take notes: the recording was split at each reload (the recorder stops capturing on a reload). Takes 2 and 3 were started with `record start <path> <url>`, which gives the page load on camera. The step 5 reload is the first frame of take 2, so the gate never flashes. The optional offline state was **not** recorded: `network route …/api/session --abort` was set on the pre-recording context, and `record start <url>` opens a new context that doesn't inherit routes. So the session check passed, and that take was thrown away. The offline "Can't reach the coach / Try again" path is covered by the builder's acceptance test (d07c68c).

## Acceptance criteria (hosted)

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | First visit: purpose line, notice, "Conference password" + Enter, no message box | **PASS** | Video 0:07, `slice-41.png` |
| 2 | Wrong password: inline alert, value kept, `aria-invalid`, focus; no cookie | **PASS** | Video 0:15. The DOM check gives `{alert: "That password isn't right…", kept: true, invalid: "true", focused: true}`. `curl` unlock with the wrong value → 401, `cache-control: no-store`, **no `set-cookie`** |
| 3 | Right password: 204 + cookie attributes; message box focused; reload → app | **PASS** | Video 0:32 and 1:30. `curl` unlock → **204**, `set-cookie: coach_access=<redacted>; Max-Age=7776000; Path=/api; HttpOnly; Secure; SameSite=Lax` (90 days). The deployer found the same |
| 4 | Chat without a valid cookie → 401 ACCESS_REQUIRED before the body is read or a coach is created | **PASS** | `curl` without a cookie → **401 in 0.62 s**. Forged `coach_access=9999999999.AAAA…` → **401 in 0.23 s**. A 40,000-char message (over the 24k message cap, which would be 413 with a cookie) without a cookie → **401 in 0.54 s, not 413**, so the message isn't validated first. It's under `MAX_BODY_BYTES`, so the strict body-not-read proof stays with handler test 16. The deployer saw the same: fast, no model call. Handler test 16 proves the order |
| 4b | With a valid cookie, chat is unchanged | **PASS** | Video: four chat 200s, including the signed follow-up recalling Maersk |
| 5 | Chat 401 in the UI: ACCESS_REQUIRED, no Retry, prompt back in the draft | **PASS** (plus the inline form from 9520203) | Video 2:07. `{draft: "Which word do Ops and Finance use differently?", retry: false}` |
| 6 | Unlock rate limit 30/min → 429 | not run | The burst was skipped: the demo password is live, and a 429 burst from this IP would block the team for about 60 s. Deployer or the owner can run it last |
| 7 | Missing `ACCESS_PASSWORD` → 500, UI stays on the gate | not run here | Part B (local restart) is out of this task's scope. Covered by tests (17) |
| 8 | Rotation invalidates old cookies | pending | Needs the owner's real password and a redeploy (env steps 4–6) |
| 9 | No secret in `dist/` | **PASS** (deployer) | Deployer: no leaks, headers present |
| 10 | Session and unlock carry `Cache-Control: no-store` | **PASS** | `curl`: session without a cookie → 401 `no-store`, with a cookie → 204 `no-store`. Unlock 401 and 204 → `no-store` |

## Off-video curl (verifier, 11:13)

```
POST /api/chat, no cookie              → 401 0.62 s {"error":"Your access has expired. Enter the conference password below, then send your message again."}
POST /api/chat, forged cookie          → 401 0.23 s (same body)
POST /api/chat, 40 KB body, no cookie  → 401 0.54 s (same body; not the 413 message-cap refusal)
GET  /api/session, no cookie           → 401, cache-control: no-store
POST /api/unlock, wrong                → 401, cache-control: no-store, no set-cookie
POST /api/unlock, right                → 204, cache-control: no-store, set-cookie: coach_access=<redacted>; Max-Age=7776000; Path=/api; HttpOnly; Secure; SameSite=Lax
GET  /api/session, with that cookie    → 204, cache-control: no-store
```

The temporary cookie jar was deleted right after.

## Findings

1. **The plan text is stale against the shipped scope.** `slice-41-plan.md` still says a 7-day cookie (`Max-Age=604800`, AC3, captions "Remembered for 7 days"), and its ACCESS_REQUIRED copy is "Copy the conversation, then reload…". It also lists "a live return to the gate" as out of scope. The code ships 90 days (4f038cf), an inline password form mid-conversation, and "Enter the conference password below…" (9520203). The demo follows the code. Update the plan, or the issue body if it still says 7 days.
2. **The first 401 in a new take took 3.69 s** (`chat` with no cookie in take 3), against 0.23–0.62 s by `curl`. This looks like a function cold start, not body reading: the 40,000-char no-cookie request was 0.54 s. Harmless.
3. **Prompt behaviour, not the gate:** after the reload, "Nonce … Reply only OK." got "I'm here to help analyze a business work thread; paste the material you want…" instead of OK. The same instruction got "OK" in take 1, so replies are inconsistent on non-thread input. This is relevant to #73 (prompt v5).
4. **The ACCESS_REQUIRED copy on a plain 401** reads "Your access has expired" even for someone who never had access (a `curl` or scripted client). It's fine for the UI, because the gate catches first-timers before any chat.
5. **Tooling:** `network route` doesn't survive `record start <url>`, because that opens a new context. To record the offline state, set the route *after* `record start` and reach the state without a reload. For example, start the take on a page, route, then trigger the session recheck in the app. Or accept an off-video screenshot.
6. Still open: AC6 (unlock 429 burst, run last), AC8 (rotation after the owner sets the real password) and Part B (fail closed locally).
