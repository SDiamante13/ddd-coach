# Deploy: word swaps + "Show what's sent" (#56), #64 parser, #85 eval check (2026-09-25)

- Commit: `69b5d02`, built from a pinned detached worktree outside the repo (removed afterwards). The main tree's uncommitted v11 prompt was not in the build.
- Site: `ddd-coach` (`40f5c583-82ea-47fa-b007-65f2cf19cac2`), https://ddd-coach.netlify.app
- Deploy id: `6ab6fc288a010dab72a15c3e` (state `ready`, context `production`)
- Log: https://app.netlify.com/projects/ddd-coach/deploys/6ab6fc288a010dab72a15c3e
- Command: `npx netlify deploy --prod --site <id>` (Netlify CLI 27.9.0 from the worktree's `node_modules`), exit 0
- Live `/` serves `index-Bl4ku2g3.js` and `index-D_HtyoNY.css`. The hash matches the worktree build and the deploy permalink, and both files are byte-identical to the build.

Contents: browser-side word swaps with "Your swaps", "Show what's sent" and "Clear swaps" (#56); the pure `parseReply` in `src/shared`, not rendered yet (#64); the question sources eval check (#85). The coaching prompt stays v10.

## Pre-deploy

| Check | Result |
|---|---|
| `LIVE_INSTRUCTIONS_VERSION` and `COACH_INSTRUCTIONS_VERSION` at `69b5d02` | 10 and 10; no v11 snapshot in the commit |
| `npm ci` + `bin/check.sh` in worktree | pass on the second run (see Notes) |
| Shell had no `OPENROUTER_*` vars, so the paid smoke test was skipped | pass |
| `OPENROUTER_MODEL` == `openai/gpt-5.6-terra` (production) | true |
| `OPENROUTER_REASONING_EFFORT` == `none` | true |
| `OPENROUTER_API_KEY`, `COACH_SIGNING_KEY`, `ACCESS_PASSWORD` | set |
| `COACH_TIMEOUT_MS`, `DDD_COACH_PROBE` | absent |

Env was read with a filtered `env:list --json` that prints booleans only. No env var was changed.

## v10 in the deployed chat function

| Check | Result |
|---|---|
| v10-only phrases from `coach-instructions.v10.txt` in the unzipped `chat.zip` (none of them in v8): "Front desk (evening desk) means any online request", "patient 4471", "never as teams of their own" | pass (all 3 present) |
| v11-only phrases absent from `chat.zip`: "write the two lines it draws on", "online ones stay pending till we ring them back" | pass (0 / 0) |
| Deployed `chat` size matches the local `chat.zip` (`available_functions`) | pass: 1,740,886 bytes both, the same as the v10 deploy |

## Hosted checks

| Check | Expected | Result |
|---|---|---|
| `/` headers | nosniff, Referrer-Policy, CSP | pass |
| `GET /api/chat` | 405 | pass |
| `POST /api/chat` without cookie | 401 + Cache-Control | pass: 401 JSON, `cache-control: no-cache` |
| `GET /api/session` without cookie | 401 `no-store` | pass |
| `GET /api/unlock` | 405 `Allow: POST`, `no-store` | pass |
| `POST /api/unlock` with a bogus password | 401 "That password isn't right. Try again, or ask the organizer for it." | pass |
| `/.env`, `/src/main.tsx`, `/server/config.ts` | 404 | pass |
| `sk-or` / `OPENROUTER` in deployed HTML, JS, CSS | 0 | pass (0 / 0) |
| `sk-or` in `chat`, `unlock`, `session` zips | 0 | pass |
| `.env` or `.map` in the function zips | none | pass |
| `.map` in `dist/`, or served `*.map` | none, 404 | pass |
| Bundle contains "Your swaps", "Show what's sent" and "Clear swaps" (#56) | present | pass |
| Bundle contains "Try an example thread" and "New reply" | present | pass |
| Font URLs in deployed CSS are same-origin | all `/assets/…` | pass (49 of 49; 26 woff2, all 200) |
| `fonts.googleapis` / `fonts.gstatic` in deployed HTML, CSS, JS | 0 | pass (0 / 0 / 0) |
| Bricolage variable woff2 served | 200 `font/woff2` | pass; CSS declares `Bricolage Grotesque Variable` |

## Notes

- Nothing was unlocked and no paid chat call ran. One bogus-password POST to unlock was sent, well under the 30/min limit.
- The first `bin/check.sh` run failed 2 of the 21 tests in `src/acceptance/swaps.test.tsx`: one hit the 5 s timeout, and the next saw a garbled draft ("gaiacme …"), most likely typing left over from the timed-out test. Load average was 56 at the time. The file alone passed 21/21 in 2.9 s, and the full gate then passed. This looks like a load flake in a `userEvent`-heavy file. Consider a longer per-test timeout, or less typing in those two tests.
- The homebrew `netlify` on PATH is 23.9.1, which has no `--site` on `env:list`. The worktree's `npx netlify` (27.9.0) was used throughout.
- The chat function size is unchanged from the v10 deploy because #56 and #64 are client-side or shared-only, and #85 is eval-only.
- The chat 401 still carries Netlify's default `no-cache` rather than an explicit `no-store`. It's harmless and unchanged since the slice 63 deploy.
