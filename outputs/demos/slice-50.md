# Slice 50 demo: paste box (#50, #51, #54, #57) plus #61 and #62

Recorded 2026-09-25 on the **production URL https://ddd-coach.netlify.app**. Deploy `6ab67e34…`, built from `edafbb0`, model `openai/gpt-5.6-luna`. The session was `agent-browser --session verifier` (v0.23.0). The per-message cap on this deploy is **8,000** (read from the page; `220fd06` raises it to 24,000 but isn't deployed).

## Files

| File | Size |
|---|---|
| `slice-50.mp4` (1 min 43 s, H.264, yuv420p, 1280×578, one take) | 2.7 MB |
| `slice-50.png` (1280×800, hosted: purpose line, collapsed 14-line thread with Show more, 3-line draft in the box) | 92 KB |
| `slice-50-first-visit.png` (1280×800, fresh page: purpose line, placeholder, box focused) | 56 KB |
| `slice-50-phone.png` (390×844: collapsed 8,000-char single-line refused entry, amber refusal, 12,000-char over-limit draft) | 40 KB |

No GIF (team rule). The blue top banner is the step caption. The yellow panel on the right is a pass-through fetch spy (`window.__bodies`): for each `POST /api/chat` it prints the message length, line count and `\n` count, the history length, then the status and time, or `⚠ STUB → 413` when the one-shot stub answered.

Compare with DESIGNER's stills: `outputs/design/explore-04/` `p1-first-visit.png` ↔ `slice-50-first-visit.png`, `p5` ↔ `slice-50-phone.png`.

## Demo steps (captioned in video)

| Time | Step | What it shows |
|---|---|---|
| 0:00 | – | Intro caption: slice 50 + #61/#62, live URL |
| 0:04 | 1 | First visit, no clicks: purpose line "Paste a messy thread or meeting notes about your domain, line breaks and all, and talk it through with a DDD coach." under the h1; placeholder "e.g. Ops: … / Finance: …" on two lines; the box has focus |
| 0:08 | 2 | `fill` a 14-line #booking-split thread (Ops / Finance / Carriers / Tom (Finance), 1,111 chars). Eval: 14 lines, box at max (217 of 219 px = 38vh at the recorder's 578 px height), `scrollHeight` 596 → scrolls internally |
| 0:12 | 3 | Shift+Enter adds a line, type "What's a booking here?", Enter sends. Spy: `1134 chars, 15 line(s), 14 \n`, 200 in 4,382 ms. The You card shows 4 lines, "…" and **Show more** (`aria-expanded="false"`) |
| 0:23 | 4 | Show more → full thread, "Show less", `aria-expanded="true"`; Show less collapses it. The reply is raw markdown (`**booking**`), see findings |
| 0:30 | 5 | Draft at 85% of the cap (length read from the page's "Up to 8,000 characters.") → count "6,800 / 8,000 characters" |
| 0:34 | 6 | Draft at cap + 1,412 → alert "1,412 characters over the 8,000 limit. Your text stays here. Trim it to send.", Send disabled, `aria-invalid="true"`, red tint, count "9,412 / 8,000 characters". Enter → requests still 1, entries still 1, draft still 9,412 |
| 0:42 | 7 | One-shot stub → 413 `COACH_TOO_LONG` for "And who owns the booking number once credit fails?". Entry `data-status="refused"`, amber notice, buttons **[Copy the conversation] [Start a new one]**, no Retry; **the message is back in the box** |
| 0:51 | 8 | Focus Start a new one + Enter → "Clear this conversation? The log and history go; your draft stays." **[Copy first] [Clear] [Keep]**, Clear red, **focus on Keep** |
| 0:58 | 9 | Clear → 0 entries, the draft ("And who owns…") kept, focus back in the box |
| 1:04 | 10 | `set offline on`, Enter → "Could not reach the coach." + Retry, box empty (retryable failure doesn't restore). Online: three short turns → OK ×3 (915–2,723 ms) |
| 1:17 | 11 | Box filled with 40 lines + over the cap (8,311 chars): box at max, over box showing, form 365 px tall. Scrolled so Retry sits under the composer (Retry bottom 517 > form top 196) |
| 1:21 | 12 | `focus` Retry → Retry bottom 113 ≤ form top 196; `elementFromPoint` at its centre is Retry |
| 1:26 | 13 | Hidden again, focus the box, **Shift+Tab** → Retry focused, bottom 113 ≤ 196, hit test Retry |
| 1:33 | 14 | Clear the box, click Retry → reply; all 4 entries `replied`, 0 failed |

Take notes: one take, no reload. `record start <url>` gave the fresh context; Clear (step 9) resets the log instead of the plan's second take. The recorder ignores `set viewport`, so the video is 1280×578 and the 38vh box is 219 px there (304 px at 800).

## Acceptance criteria

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | Purpose line on load, no dialog/tour/click, box focused | **PASS** | Video 0:04; eval `activeElement` = TEXTAREA; `slice-50-first-visit.png`; deployer: styled page + purpose line |
| 2 | Placeholder = `PASTE_EXAMPLE`, name still "Message" | **PASS** | Video 0:04; eval placeholder matches the constant exactly; the builder's acceptance test covers the name |
| 3 | Multiline paste keeps breaks; You card shows separate lines; request keeps `\n` | **PASS** | Video 0:08–0:23: 14 lines in the box, spy 14 `\n` in `message`; deployer: multi-line paste byte-identical |
| 4 | Keys (Enter / Shift+Enter / pending / over) | **PASS** (browser: Enter, Shift+Enter, over-limit Enter; rest by tests) | Video 0:12, 0:34. Ctrl/Cmd+Enter, IME, coarse pointer and blank drafts: builder's tests. Key hint visible at 1280, `display:none` at 390 |
| 5 | Auto-grow to 38vh (30vh ≤480), then scroll | **PASS** | 1280×800: max 304 px (38vh), `scrollHeight` 596 > 302. 390×844: max 253.2 px (30vh). Send beside the box at both widths |
| 6 | Near/over count, alert, `aria-invalid`, Send disabled, numbers from the constant | **PASS** | Video 0:30–0:42; count shows at 6,800 (85%); "1,412 characters over the 8,000 limit…" |
| 7 | Over-limit Enter sends nothing, no entry, draft kept | **PASS** | Video 0:34: requests 1 → 1, entries 1 → 1, draft 9,412 → 9,412; deployer: over-limit disables Send |
| 8 | Refused → draft back in an empty box, no Retry; retryable failure → empty box + Retry | **PASS** (stubbed 413) | Video 0:42 (stub: `COACH_TOO_LONG`, real 413 path not reachable without ~24k of model calls); video 1:04 (offline → box empty, Retry). "Typed before the refusal is kept": builder's test only |
| 9 | Collapse > 4 lines / 320 chars, Show more/less real button | **PASS** | Video 0:12–0:30; `slice-50.png`; 8,000-char single line collapsed at 390 (`slice-50-phone.png`) |
| 10 | Retry never hidden at 1280 and 390, box at max + over box | **PASS** | 1280×578 (video): 517 → 113 ≤ 196 by focus and by Shift+Tab, hit test Retry. 1280×800 (dry run): 544 → 182 ≤ 334, both ways. 390×844: 514 → 221 ≤ 407 by focus, hit test Retry |
| 11 | 390 px: no horizontal scroll with a long single-line message in log and box | **PASS** | `scrollWidth` 390 = `clientWidth` 390 (html and body) with an 8,000-char single line in the log (refused, collapsed) and 12,000 chars in the box. The log copy is 8,000, not 12,000: the pre-check blocks anything over the cap. Deployer: no horizontal scroll at 390 |
| 12 | Nothing regressed | **PASS** (by the committer's gate + hosted run) | Memory still works (turns 2–4 carried 1–2 history turns, 200); deployer: memory on luna ~1–1.7 s, no secrets, headers |

#61 / #62 on the hosted site:

| Item | Result | Evidence |
|---|---|---|
| Refused turn marked `refused`, amber (warn) tone, not the red failure tone | **PASS** | Video 0:42, `slice-50-phone.png` (notice background `rgb(58,46,24)` vs failure red) |
| Refusal offers [Copy the conversation] [Start a new one], outside the alert | **PASS** | Video 0:42 |
| Start a new one opens the shared clear question, focus on Keep | **PASS** | Video 0:51 |
| Question text "Clear this conversation? The log and history go; your draft stays." | **PASS** | Video 0:51 |
| [Copy first] first, Clear red, 44 px targets | **PASS** | Button order Copy first, Clear, Keep; Clear has red text and border; computed height 44 px |
| Clear → empty log, draft kept, focus to box | **PASS** | Video 0:58 |

## Measurements

| Viewport | Box max | Composer (box at max + over box) | `scroll-padding-bottom` (`--composer-reserve`) | Share of screen |
|---|---|---|---|---|
| 1280×800 | 304 px (38vh) | 450 px | 480 px | 56% |
| 1280×578 (recorder) | 219 px | 365 px | – | 63% |
| 390×844 | 253 px (30vh) | 421 px | 445 px | 50% |

The reserve exceeds the composer at both measured widths, so focus lands above it (the checks above).

## Keyboard-only pass (390×844, over-limit draft)

Tab order: box → New conversation (Send is skipped while disabled) → Retry → Show more → Copy the conversation → Start a new one → box. Every stop matched `:focus-visible` with the box-shadow ring, and every one outside the form landed above the composer (bottoms 201–366 px vs form top 392–407 px). The `role="alert"` over box's chattiness with a screen reader was not tested (no screen reader in this run).

## Deployer checks (hosted, via `curl`/eval; cited, not repeated)

- Styled page and purpose line.
- Memory on luna, about 1–1.7 s per turn.
- A multi-line paste arrives byte-identical.
- Over the limit disables Send.
- No secrets in the bundle; security headers present.
- No horizontal scroll at 390.

## Findings

Ranked by severity:

1. **Medium: luna replies in raw markdown.** `**booking**`, `- **Ops:**` and numbered lists show as literal asterisks (video 0:12–0:30). Slice 3's prompt fixes this (deployer flag).
2. **Medium: at 390 px an over-limit draft makes the composer cover half the screen or more.** Measured 421 of 844 px (50%) with the box at 30vh and the over box showing; the deployer saw it cover most of the screen with an 8k draft. The log is readable only in the top ~390 px. Desktop is similar in share (56% at 1280×800). Candidate for the #55 / fixed-layout work.
3. **Low–medium: a new entry's buttons appear under the composer.** The page doesn't follow new entries (auto-scroll is out of scope), so right after the refusal its [Copy the conversation] [Start a new one] sat at y 750–794 behind the composer (top 632). In a dry run, a pointer click at the button's position hit the composer and blurred the box. Keyboard focus is fine (scroll padding moves it up). A mouse user must scroll first.
4. **Low: the 320-char preview isn't 4 lines at phone width.** An unbroken 8,000-char line collapses to about 9 wrapped lines at 390 px (`slice-50-phone.png`); the cut is by characters, not visual lines. On desktop the 14-line thread cut mid-line 4 ("so it has t…"), as specified.
5. **Low: with the clear question open, the key hint wraps to two lines** in the foot at 1280 (dry-run screenshot); cosmetic.
6. **Chromium only.** `field-sizing` auto-grow and `scroll-padding` on focus were checked in Chromium (agent-browser). Firefox gets 2 fixed rows plus scroll (no JS fallback, by plan). No Safari check.
7. **Plan text drift.** Step 7's real conversation cap would need ~24k of model calls; team-lead chose the stub, as the plan allows. AC11's "12k in the log" can't happen while the pre-check blocks > 8,000; tested with 8,000.

## Tooling notes

- Screenshots didn't hang after `agent-browser --session verifier close`; every command ran under `timeout 60`.
- agent-browser's `click` doesn't check what's on top at the target point, so a covered button gets a click on the covering element. Use `focus` + `press Enter` (which also exercises the scroll padding) or scroll first.
- The recorder's viewport is 1280×578 regardless of `set viewport 1280 800`; vh-based sizes in the video are smaller than in the PNGs.
- Draft setting for React: native `HTMLTextAreaElement.prototype.value` setter + `input` event (`window.__setDraft`).
