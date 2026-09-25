# Chores demo on 30af2d6: #47, #13, #12, #83

Recorded 2026-09-25 on the **production URL https://ddd-coach.netlify.app**: deploy `6ab6c2e5fb745b21721e07f9`, built from `30af2d6` (see the `9fd3ac0` deploy record). The session was `agent-browser --session verifier`, starting each take in a fresh recording context with no cookie.

**Password handling:** the password was read from the team-lead's mode-600 scratch file only through a `fill 'input[type=password]' "$(cat …)"` substitution, with output sent to `/dev/null`. It was never printed, and it isn't in any caption, frame, file name or this report. Running `grep -rFi -f <pass file> outputs/demos/` gives 0 hits.

## Files

| File | Size |
|---|---|
| `chores-30af2d6.mp4` (1 min 18 s, H.264, yuv420p, 1280×578, two takes joined) | 1.7 MB |
| `chores-30af2d6.png` (1280×800: unlocked, h1 font facts, an aborted send showing "Could not reach the coach." + Retry, focus on the entry after Retry) | 112 KB |

There's no GIF (team rule). The blue top banner is the step caption. The yellow panel on the right is a fetch spy that shows method, path, status and time only, never request bodies, plus a "facts" list written by `eval`.

## Video

| Time | Take | Step | What it shows |
|---|---|---|---|
| 0:03 | 1 | 1 | The gate on the hosted URL, fresh context |
| 0:07 | 1 | 1 | Unlocked. Spy: `POST /api/unlock → 204 (0.19 s)` |
| 0:10 | 1 | 2 (#47) | Facts: h1 `font-family: "Bricolage Grotesque Variable"`, `document.fonts.check` true. Font requests are all `ddd-coach.netlify.app` woff2 files, including `bricolage-grotesque-latin-opsz-normal-*.woff2`. There are no Google font requests |
| 0:17 | 1 | 3 (#13) | Five spaces typed. Facts: `draft before: "     "` |
| 0:21 | 1 | 3 (#13) | After a Send click: `draft ""`, `/api/chat calls 0`, `entries 0`. The spy has no `/api/chat` |
| 0:25 | 1 | 4 (#12) | "What is a bounded context, in one sentence?" → Send click (**paid call 1**) |
| 0:27 | 1 | 4 (#12) | Facts: `activeElement: textarea#_r_1_-box`, so focus is back in the box after clicking Send. Spy: `POST /api/chat → 200 (2.25 s)`, and the reply shows |
| 0:34 | 1 | 5 (#12) | `network route …/api/chat --abort` (set after `record start`), then "And an aggregate?" → Send |
| 0:36 | 1 | 5 (#12) | Spy: `POST /api/chat → failed: TypeError (0.01 s)`. Facts: `entry 2: Could not reach the coach. + Retry`. **The alert and Retry are hidden under the sticky composer on screen** (finding 1) |
| 0:40 | 1 | 5 (#12) | Route removed. `focus` Retry + Enter (**paid call 2**). Facts: `activeElement: li (entry 2)` |
| 0:43 | 1 | 5 (#12) | Spy: `POST /api/chat → 200 (2.25 s)`. The answer replaces the failure, and focus is still `li (entry 2)` (focus ring on the entry) |
| 0:48 | 1 | 6 (#83) | Caption: the 402 split is server-side and can't be triggered on prod for free, so it's covered by tests |
| 0:55 | 2 | 5 | Take 2 (no paid calls): a fresh context, unlocked again |
| 0:58 | 2 | 5 | Route aborts `/api/chat`, then "What is a bounded context?" → Enter |
| 1:00 | 2 | finding 1 | Facts: `Retry y 463-507, composer top 407 → COVERED`. Only the top edge of the alert peeks out above the composer |
| 1:07 | 2 | 5 | Scrolled by hand: `Retry y 261-305, composer top 391 → visible`. Shows "Could not reach the coach." + Retry |
| 1:13 | 2 | 5 | Retry with the route still aborting (free) fails again and Retry is offered again. Facts: `activeElement: li (entry 1)` |

## Result per issue

| Issue | Check | Result | Evidence |
|---|---|---|---|
| #47 | The h1 renders in the self-hosted Bricolage variable font, with no Google font requests | **PASS** | Video 0:10 (computed family, `fonts.check` true, the only font hosts are `ddd-coach.netlify.app`). PNG facts |
| #13 | A whitespace-only Send clears the draft and sends nothing | **PASS** | Video 0:17–0:21: `draft ""`, 0 chat calls, 0 entries. The spy lists only the unlock |
| #12 | After Send, focus returns to the message box | **PASS** | Video 0:27: `activeElement: textarea` right after a mouse click on Send |
| #12 | After Retry, focus lands on the entry, not the page | **PASS** | Video 0:40–0:43 (paid Retry, answered) and 1:13 (free Retry, failed again). Both give `activeElement: li`. PNG |
| #83 | An in-flight/unknown 402 shows Retry, while a key-limit/credits 402 shows out-of-credit | **Not run live (tests only)** | The split happens in `server/openRouterCoach.ts` on OpenRouter's `error.metadata.limit_source`. The browser only ever sees the server's 502 or 503. A fetch spy could fake those responses, but that would test only the client's older 502/503 rendering, not #83, so it was skipped. Covered by the adapter's 402 tests (`c2692c5`, `159bbf2`) |

**Paid calls: 2** (question 1 and one Retry). The aborted sends never left the browser. There was no nonce and no 429 burst.

## Findings

1. **After a failed send, the alert and Retry sit under the sticky composer, and the page doesn't scroll to them** (1280×578: Retry at y 463–507 vs composer top 407, video 1:00. It was reproduced off-video with 1–3 aborted entries, where Retry's bottom edge is always below the composer top). A visitor sees their message with nothing under it, as if it's still waiting, until they scroll. `scroll-padding-bottom` only helps when something is focused or scrolled into view, and nothing is on failure. This isn't a regression in 30af2d6, but #12's Retry flow depends on it. Suggest scrolling the newest outcome into view (or keeping the log's end above the composer reserve). It's worth an issue.
2. **#83 is still unproven live.** Whether a spent key limit arrives as 402 with `limit_source: openrouter_key_limit` is known only from the adapter tests built on OpenRouter's documented body shape (same open question as slice-63 U6).
3. **Tooling:**
   - `agent-browser network route <full URL> --abort` inside the `record start` context works: the in-page fetch rejects with `TypeError` in about 0.01 s. `unroute <url>` restores it at once.
   - In take 1, the step 2 frame has the h1 scrolled above the caption bar (the recording viewport is 578 px tall), so the font evidence is the facts panel, not the glyphs. In the PNG the h1 is also partly under the caption.
