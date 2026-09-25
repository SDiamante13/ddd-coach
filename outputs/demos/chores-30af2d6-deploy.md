# Deploy: #83, #48, #14, #12, #13, #47 + docs #22, #49 (2026-09-25)

- Commit: `30af2d6`, built from a pinned detached worktree (removed afterwards)
- Site: `ddd-coach` (`40f5c583-82ea-47fa-b007-65f2cf19cac2`), https://ddd-coach.netlify.app
- Deploy id: `6ab6c2e5fb745b21721e07f9` (state `ready`, context `production`)
- Log: https://app.netlify.com/projects/ddd-coach/deploys/6ab6c2e5fb745b21721e07f9
- Command: `netlify deploy --prod --site <id>` (Netlify CLI 27.9.0), exit 0
- Live `/` serves `index-BpeCsq4r.js`, the same hash as the worktree build and the deploy permalink

Contents: 402 mapped by `limit_source` (#83), effort defaults to `none` (#48), timeout logging (#14), focus after Send/Retry (#12), whitespace-only draft cleared (#13), self-hosted Bricolage variable font (#47), docs (#22, #49).

## Pre-deploy

| Check | Result |
|---|---|
| `npm ci` + `bin/check.sh` in worktree | pass |
| Shell had no `OPENROUTER_*` vars, so the paid smoke test was skipped | pass |
| `OPENROUTER_MODEL` == `openai/gpt-5.6-terra` (production) | true |
| `OPENROUTER_REASONING_EFFORT` == `none` | true |
| `OPENROUTER_API_KEY`, `COACH_SIGNING_KEY`, `ACCESS_PASSWORD` | set |
| `COACH_TIMEOUT_MS`, `DDD_COACH_PROBE` | absent |

Env was read with a filtered `env:list --json` that prints booleans only. No env var was changed.

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
| Bundle contains "Try an example thread" | present | pass |
| Font URLs in deployed CSS are same-origin | all `/assets/…` | pass (49 of 49; 26 woff2, all 200) |
| `fonts.googleapis` / `fonts.gstatic` in deployed HTML, CSS, JS | 0 | pass (0 / 0 / 0) |
| Bricolage variable woff2 served | 200 `font/woff2` | pass: `bricolage-grotesque-{latin,latin-ext,vietnamese}-opsz-normal-*.woff2`; CSS declares `Bricolage Grotesque Variable` |

## Notes

- Nothing was unlocked and no paid chat call ran. One bogus-password POST to unlock was sent, well under the 30/min limit.
- The CLI deployed functions from its bundling cache. The CDN diff uploaded 1 function (chat), and the local `chat.zip` contains `limit_source` (#83). Session and unlock were unchanged.
- The chat 401 still carries Netlify's default `no-cache` rather than an explicit `no-store`. It's harmless and unchanged since the slice 63 deploy.
