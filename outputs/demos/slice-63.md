# Slice 63 demo: try an example thread (#63) and a friendlier gate (#75)

Recorded 2026-09-25 on the **production URL https://ddd-coach.netlify.app**: deploy `6ab6be0b6c3922ec875e9550`, built from `6d9c354` (see `slice-63-deploy.md`). Production runs `openai/gpt-5.6-terra` with reasoning effort `none` and coaching prompt v8. The session was `agent-browser --session verifier` (v0.23.0), starting from a fresh browser with no cookie.

**Password handling:** the password was read from the team-lead's mode-600 scratch file only through `"$(tr …)"`/`awk` substitution inside `fill`, and in a Python subshell that built the `curl` bodies. It was never printed, and it isn't in any caption, frame, file name or this report. `fill` printed only "✓ Done" (checked with `grep -F -f` on its output). The case-transform check found that the file is lowercase, so `tr '[:lower:]' '[:upper:]'` changes it and the UPPER CASE path is a real test. The `curl` cookie jar was deleted right after the runs. Running `grep -rF -f <pass file> -i outputs/demos/` gives 0 hits.

## Files

| File | Size |
|---|---|
| `slice-63.mp4` (4 min 0 s, H.264, yuv420p, 1280×578, two takes joined) | 3.1 MB |
| `slice-63.png` (1280×800: unlocked, 90-day line, the example thread in the box, focus in the box, caret at 0, nothing sent) | 116 KB |

There's no GIF (team rule). The blue top banner is the step caption. The yellow panel on the right is a fetch spy that shows method, path, status and time only, never request bodies.

## Video

| Time | Take | Step | What it shows |
|---|---|---|---|
| 0:00 | 1 | 1 | The gate on the hosted URL, fresh browser |
| 0:08 | 1 | 2 | `not-the-password` → spy `unlock → 401 (0.29 s)`. Alert: "That password isn't right. Try again, or ask the organizer for it." The DOM check gives `{invalid: "true", focused: password, kept: true}` |
| 0:24 | 1 | 3 | The right password is filled in **UPPER CASE** → `unlock → 204 (0.31 s)`. The gate is gone and the focus is on the message box |
| 0:32 | 1 | 4 | "This browser stays unlocked for 90 days." above the composer, as a `role=status` element |
| 0:40 | 1 | 5 | "Try an example thread" → the box holds 3,492 characters starting "Example thread (fictional).", with focus in the box, caret 0 and `scrollTop` 0. The button is gone, and **the spy shows no `/api/chat`** |
| 0:56 | 1 | 6 | Send → `chat → 200 (6.26 s)`. The reply appears, and the long prompt is clamped with "Show more" |
| 1:36 | 1 | 6 | The question is in view. Caption: "Mon 08:11 (late = missed delivery appointment) and Thu 09:30 (credit issued for 7731)" |
| 1:44 | 1 | 7 | The example button is gone once a conversation exists, and the foot shows "New conversation" |
| 1:52 | 2 | 7 | **Reload** (new take): no gate, no 90-day line, and the example button is back in the empty app |
| 2:08 | 2 | #75 | "hi" → `200 (1.93 s)`: "Hi. Paste a thread, meeting notes, status list, or code from your work and I'll help surface the mismatched meanings and the key question to take back." |
| 2:24 | 2 | #75 | "what is DDD?" → `200 (2.50 s)`: a two-sentence answer about DDD, then "Paste a thread, meeting notes, or code from your work." |
| 2:48 | 2 | #75 | Unverifiable (the spy tampers the history signatures) → `400 (0.16 s)`, COACH_UNVERIFIED → **Copy + Start a new one** |
| 2:56 | 2 | #75 | Conversation too long (the spy injects a 65k-character history) → `413 (0.24 s)`, COACH_TOO_LONG → **Copy + Start a new one** |
| 3:12 | 2 | #75 | Message too long (the spy pads the message past 24k) → `413 (0.20 s)`, COACH_MESSAGE_TOO_LONG → **Copy only** |
| 3:36 | 2 | #75 | Access expired (`cookies clear`) → `401 (0.16 s)`, ACCESS_REQUIRED → **Copy only**. The password form appears inline and focused, and the prompt goes back to the draft |
| 3:44 | 2 | AC9 | The inline unlock, typed in **mixed case** → `unlock 204 (0.24 s)`. The inline form is gone, the focus is on the box with the draft intact, and the 90-day line shows |

The refusals were triggered with no paid calls: the server rejects each one before it creates a coach. The tamper is in the injected fetch spy (`window.__tamper`), not in the app.

## Acceptance criteria

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | The button shows in the empty app. A click fills `EXAMPLE_THREAD`, focus goes to the box with the top in view, and no `/api/chat` call is made | **PASS** | Video 0:40. `{len: 3492, start: "Example thread (fictional).", focused: true, scrollTop: 0, caret: 0}`. The spy shows only the two unlock calls. `slice-63.png` |
| 2 | Only Send sends it, as the normal message | **PASS** | Video 0:56 (`requestSubmit`, one chat POST). The log shows the prompt clamped with "Show more" |
| 3 | Hidden once an exchange exists or while the draft has text. Shows again after a new conversation | **PASS** | Video 1:44 (gone after the reply) and 1:52 (back after the reload). Off-video: after New conversation → Clear, with the refused prompt still in the draft, the button stays hidden, as intended. After the draft is emptied it shows again (the PNG take) |
| 4 | 3,000–6,000 characters, roles only, fictional | **PASS** | 3,492 characters, and the first line says it's fictional. Unit test 13 (builder) |
| 5 | **3/3 live runs on terra**: `questionSpansThread` (both groups), `questionAsks`, names the Friday service review | **PASS 3/3** | See "AC5 runs" below. All three have `hardFailures: []` (which includes `question asks`) and `questionSpansThread`, `forum` and `jointRoles` true |
| 6 | Case/NFKC/trim-insensitive unlock. A wrong password doesn't unlock | **PASS** (case) | UPPER in the video (0:24), mixed case inline (3:44). `curl` UPPER → 204, mixed → 204, `wrong` → 401. Full-width and trim are covered by unit tests only |
| 7 | Passes issued before the slice survive for a canonical password | **PASS** (inferred) | The configured value is lowercase (the transform check), so the MAC input is byte-identical, and the golden MAC test covers it |
| 8 | Wrong-password copy with no slide. Value, `aria-invalid` and focus are kept | **PASS** | Video 0:08. `curl` 401 body: `{"error":"That password isn't right. Try again, or ask the organizer for it."}` |
| 9 | 90-day line after unlock (gate or inline), not after a reload | **PASS** | Gate unlock 0:32, inline unlock 3:44, reload 1:52 (`status: []`, no `.unlocked`) |
| 10 | 402 → 503 COACH_OUT_OF_CREDIT, no Retry | **Not run (U6)** | There's no throwaway $0-limit key, so Part B is skipped. Tests 8–11 are the only proof, and 402 vs 403 for a spent key limit stays unverified |
| 11 | Other failures are unchanged (502 + Retry) | not triggered live | Covered by tests. Nothing on production could cause a 502 without spending the budget |
| #75 | Non-thread replies are natural and invite a thread | **PASS** | Video 2:08 and 2:24 |
| #75 | "Start a new one" only on the refusals a new conversation fixes | **PASS** | Unverifiable and too-long show Copy + Start a new one. Message too long and access expired show Copy only (video 2:48–3:36). Out of credit wasn't triggered |

## AC5 runs (production, terra, no nonce, first turn exactly as the button sends it)

| Run | How | Seconds | Question | Score |
|---|---|---|---|---|
| 1 | Browser (video 0:56) | 6.26 (spy), 7.0 to render | "For Customer D's load 7731, which result belongs in the Q3 on-time % and decides the service credit: delivered 40 minutes before the appointment or picked up 3 hours after the pickup window?" | pass, `hardFailures []` |
| 2 | `curl` | 5.50 | "For load 7731, which missed pickup but delivered 40 minutes before Customer D's appointment, should Customer D's Q3 on-time % and service credit use the delivery appointment or the weekly late report?" | pass, `hardFailures []` |
| 3 | `curl` | 5.24 | "For Customer D's load 7731, which result belongs in the Q3 on-time percentage and service-credit decision: delivery 40 minutes before the appointment or pickup 3 hours after the pickup window?" | pass, `hardFailures []` |

Every question is addressed to "the account lead and the billing lead, at Friday's service review". The scores came from `node server/eval/checkReply.ts example-thread <reply.txt>`, and all soft scores were true in all three runs. **Paid calls in total: 5** (3 example runs, "hi", "what is DDD?"). There was no 429 burst.

## Off-video curl

```
POST /api/unlock  UPPER CASE (built by substitution) → 204, cache-control: no-store,
                  set-cookie: coach_access=<redacted>; Max-Age=7776000; Path=/api; HttpOnly; Secure; SameSite=Lax
POST /api/unlock  mixed case                         → 204, same set-cookie attributes
POST /api/unlock  "wrong"                            → 401 {"error":"That password isn't right. Try again, or ask the organizer for it."}
POST /api/chat    example thread ×2 (UPPER CASE cookie) → 200 in 5.50 s and 5.24 s
```

## Findings (fresh-eyes pass)

1. **The AC5 pass relies on the widened key.** `dca1f1a` added `"appointment"` to the first `questionEvidence` group. Runs 1 and 3 name only "the appointment", not "delivery appointment" or "contract", so under the plan's original key (`[["delivery appointment","contract"],["7731"]]`) they would fail `questionSpansThread`. Only run 2 would pass. Semantically all three questions do join line A (the delivery appointment rule) to line B (the 7731 credit). But a bare "appointment" also matches the night desk line (ETA past the delivery appointment), so the check is looser than the plan says. The plan's #63-1 key text is stale, so update it or record the decision.
2. **Two names for one action.** The composer foot says "New conversation", and the refusal action says "Start a new one". The plan's AC3 says the button "shows again after 'Start a new one'". Both clear the log, but a visitor sees two labels. It's minor, so consider one wording.
3. **Screenshot framing:** at 1280×800 the focus move after the click scrolls the page so the `h1` is half off the top. The thread top is in view as the AC requires. It's cosmetic.
4. **The run 2 question is either/or between a rule and an artifact** ("use the delivery appointment or the weekly late report?"), not between two outcomes. `questionAsks` passes, but it's a weaker question than runs 1 and 3. It's prompt behaviour to watch, not a failure.
5. **Out of credit (AC10) is unproven live** (U6). Whether a spent key limit returns 402 or 403 is still open. The first real exhaustion's function log (`statusCode`) will show it.
6. **Tooling:**
   - `network requests` returned nothing inside the `record start <url>` context, so the "no `/api/chat`" evidence is the fetch spy plus the DOM state.
   - After `record stop`, the session's page was `about:blank` without the recording context's cookie. The PNG needed a fresh unlock.
   - `Control+a`/`Meta+a` + Backspace in the textarea didn't clear a React draft reliably.
