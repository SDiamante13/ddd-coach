# Deploy: names restored (#86) + composer and reveal fixes (#89) + Copy for your RFC (#6) (2026-09-25)

- Commit: `8522f16`, built from a pinned detached worktree outside the repo (removed afterwards). The main tree's staged log-follow work was not in the build.
- Site: `ddd-coach` (`40f5c583-82ea-47fa-b007-65f2cf19cac2`), https://ddd-coach.netlify.app
- Deploy id: `6ab703cacdaaa0d6d2c5f60c` (state `ready`, context `production`)
- Log: https://app.netlify.com/projects/ddd-coach/deploys/6ab703cacdaaa0d6d2c5f60c
- Command: `npx netlify deploy --prod --site <id>` (Netlify CLI 27.9.0 from the worktree's `node_modules`), exit 0
- Live `/` serves `index-CjKoZJZ3.js` and `index-BWVcIh5N.css`. The hash matches the worktree build and the deploy permalink, and both files are byte-identical to the build. The live HTML differs from `dist/index.html` only by Netlify's injected "hosted on Netlify" comment.

Contents: the prompt stays v11. Names restored in the browser (#86). The swaps panel closes on send, its heading reads "What's sent", `--composer-reserve` is measured, a tall reply lands on its start, and the log ignores its own reveal scroll until `scrollend` or 1 s (#89). "Copy for your RFC", with HTML and Markdown escaping (#6).

## Pre-deploy

| Check | Result |
|---|---|
| `LIVE_INSTRUCTIONS_VERSION` and `COACH_INSTRUCTIONS_VERSION` at `8522f16` | 11 and 11 |
| `npm ci` + `bin/check.sh` in worktree | pass on the first run (load average 17) |
| Shell had no `OPENROUTER_*` vars, so the paid smoke test was skipped | pass |
| `OPENROUTER_MODEL` == `openai/gpt-5.6-terra` (production) | true |
| `OPENROUTER_REASONING_EFFORT` == `none` | true |
| `OPENROUTER_API_KEY`, `COACH_SIGNING_KEY`, `ACCESS_PASSWORD` | set |
| `COACH_TIMEOUT_MS`, `DDD_COACH_PROBE` | absent |

Env was read with a filtered `env:list --json` that prints booleans only. No env var was changed.

## v11 in the deployed chat function

| Check | Result |
|---|---|
| v11-only phrases in the unzipped `chat.zip`: "write the two lines it draws on", "online ones stay pending till we ring them back", "we only bill a visit once it has happened", "Stop after the question's two source lines", "Two From thread:" | pass (5 of 5 present) |
| v10-only wording absent: "Stop after the question." and "nothing follows the question" | pass (0 / 0) |
| Deployed `chat` size matches the local `chat.zip` (`available_functions`) | pass: 1,741,120 bytes both, the same as the v11 deploy |

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
| `sk-or` / `OPENROUTER` in deployed HTML, JS, CSS | 0 | pass (0 / 0 in each) |
| `sk-or` in `chat`, `unlock`, `session` zips | 0 | pass |
| `OPENROUTER` in the function zips | env var names only | pass: `process.env` names such as `OPENROUTER_API_KEY` and the SDK's `OPENROUTER_BASE_URL`; no values |
| `.env` or `.map` in the function zips | none | pass |
| `.map` in `dist/`, or served `*.map` | none, 404 | pass |
| Bundle contains "Copy for your RFC" (#6) | present | pass |
| Bundle contains "Names restored in this browser" (#86) | present | pass |
| Bundle contains "What's sent" (#89) and `composer-reserve` in JS and CSS | present | pass |
| Bundle contains "Your swaps", "Show what's sent", "Clear swaps", "Try an example thread", "New reply", "Events, in order" and "Question for " | present | pass |
| Font URLs in deployed CSS are same-origin | all `/assets/…` | pass (49 of 49; 26 woff2, all 200) |
| `fonts.googleapis` / `fonts.gstatic` in deployed HTML, CSS, JS | 0 | pass (0 / 0 / 0) |
| Bricolage woff2 served | 200 `font/woff2` | pass; CSS declares `Bricolage Grotesque Variable` |

## Notes

- Nothing was unlocked and no paid chat call ran. One bogus-password POST to unlock was sent, well under the 30/min limit.
- The verifier owns the demo: names restored after a reload, the swaps panel closing on send, a tall reply revealed from its start, and the RFC copy on a real reply.
- The chat 401 still carries Netlify's default `no-cache` rather than an explicit `no-store`. It's harmless and unchanged since the slice 63 deploy.
