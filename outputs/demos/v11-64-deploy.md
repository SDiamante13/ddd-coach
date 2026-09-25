# Deploy: coaching prompt v11 (#85) + structured reply UI (#64) (2026-09-25)

- Commit: `77ccc76`, built from a pinned detached worktree outside the repo (removed afterwards). The main tree's uncommitted #86 work was not in the build.
- Site: `ddd-coach` (`40f5c583-82ea-47fa-b007-65f2cf19cac2`), https://ddd-coach.netlify.app
- Deploy id: `6ab6ff448a010dbb2ba15c4f` (state `ready`, context `production`)
- Log: https://app.netlify.com/projects/ddd-coach/deploys/6ab6ff448a010dbb2ba15c4f
- Command: `npx netlify deploy --prod --site <id>` (Netlify CLI 27.9.0 from the worktree's `node_modules`), exit 0
- Live `/` serves `index-hzS-4aG0.js` and `index-DlDFVHeb.css`. The hash matches the worktree build and the deploy permalink, and both files are byte-identical to the build.

Contents: coaching prompt v11, where the question is followed by its two `From thread:` source lines (#85). A replied exchange now renders as `parseReply`'s blocks: an events list with source chips, a Word, Team, Meaning and Source table, and a question card that shows the two source lines (#64).

## Pre-deploy

| Check | Result |
|---|---|
| `LIVE_INSTRUCTIONS_VERSION` and `COACH_INSTRUCTIONS_VERSION` at `77ccc76` | 11 and 11 |
| `npm ci` + `bin/check.sh` in worktree | pass on the first run (load average 38) |
| Shell had no `OPENROUTER_*` vars, so the paid smoke test was skipped | pass |
| `OPENROUTER_MODEL` == `openai/gpt-5.6-terra` (production) | true |
| `OPENROUTER_REASONING_EFFORT` == `none` | true |
| `OPENROUTER_API_KEY`, `COACH_SIGNING_KEY`, `ACCESS_PASSWORD` | set |
| `COACH_TIMEOUT_MS`, `DDD_COACH_PROBE` | absent |

Env was read with a filtered `env:list --json` that prints booleans only. No env var was changed.

## v11 in the deployed chat function

| Check | Result |
|---|---|
| v11-only phrases from `coach-instructions.v11.txt` (not in v10) in the unzipped `chat.zip`: "write the two lines it draws on", "online ones stay pending till we ring them back", "we only bill a visit once it has happened", "Stop after the question's two source lines", "Two From thread:" | pass (5 of 5 present) |
| v10-only wording absent: "Stop after the question." and "nothing follows the question" | pass (0 / 0) |
| Deployed `chat` size matches the local `chat.zip` (`available_functions`) | pass: 1,741,120 bytes both (v10 deploy: 1,740,886) |

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
| Bundle contains "Events, in order" (#64) | present | pass |
| Bundle contains the Question region (`aria-label` `Question`, "Question for ", "The thread lines it joins") (#64) | present | pass |
| Bundle contains "Your swaps", "Show what's sent", "Clear swaps", "Try an example thread" and "New reply" | present | pass |
| Font URLs in deployed CSS are same-origin | all `/assets/…` | pass (49 of 49; 26 woff2, all 200) |
| `fonts.googleapis` / `fonts.gstatic` in deployed HTML, CSS, JS | 0 | pass (0 / 0 / 0) |
| Bricolage woff2 served | 200 `font/woff2` | pass; CSS declares `Bricolage Grotesque Variable` |

## Notes

- Nothing was unlocked and no paid chat call ran. One bogus-password POST to unlock was sent, well under the 30/min limit.
- The v11 prompt and the #64 UI went live together. The old v10 behaviour is gone: every reply now ends with two source lines, which the question card renders. The verifier should check that on a real reply.
- The swaps acceptance file passed first time this run. The load flake noted in the #56 deploy did not recur.
- The chat 401 still carries Netlify's default `no-cache` rather than an explicit `no-store`. It's harmless and unchanged since the slice 63 deploy.
