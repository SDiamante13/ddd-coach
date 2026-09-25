# Deploy: coaching prompt v10 (#77) + #66 log follow (2026-09-25)

- Commit: `9a13b6f`, built from a pinned detached worktree (removed afterwards)
- Site: `ddd-coach` (`40f5c583-82ea-47fa-b007-65f2cf19cac2`), https://ddd-coach.netlify.app
- Deploy id: `6ab6caf76c39225a0d5e96f7` (state `ready`, context `production`)
- Log: https://app.netlify.com/projects/ddd-coach/deploys/6ab6caf76c39225a0d5e96f7
- Command: `netlify deploy --prod --site <id>` (Netlify CLI 27.9.0), exit 0
- Live `/` serves `index-CXLUCQ87.js`, the same hash as the worktree build and the deploy permalink

Contents: coaching prompt v10 (#77), shipped under the #78 A/B rule; the log follows new content, so Retry is no longer hidden under the composer, plus a "New reply ↓" pill (#66); eval-only changes.

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

## v10 in the deployed chat function

| Check | Result |
|---|---|
| v10-only phrases from `server/__snapshots__/coach-instructions.v10.txt` in the unzipped `chat.zip` (not in v8): "Front desk (evening desk) means any online request", "patient 4471", "never as teams of their own" | pass (all 3 present) |
| Deployed `chat` size matches the local `chat.zip` (`available_functions`) | pass: 1,740,886 bytes both |

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
| Bundle contains "New reply" (#66) | present | pass |
| Font URLs in deployed CSS are same-origin | all `/assets/…` | pass (49 of 49; 26 woff2, all 200) |
| `fonts.googleapis` / `fonts.gstatic` in deployed HTML, CSS, JS | 0 | pass (0 / 0 / 0) |
| Bricolage variable woff2 served | 200 `font/woff2` | pass; CSS declares `Bricolage Grotesque Variable` |

## Notes

- Nothing was unlocked and no paid chat call ran. One bogus-password POST to unlock was sent, well under the 30/min limit.
- The CLI bundled the functions fresh in the worktree, then reported "Deploying functions from cache". The CDN diff uploaded 4 files and 1 function (chat). Session and unlock were unchanged.
- The chat 401 still carries Netlify's default `no-cache` rather than an explicit `no-store`. It's harmless and unchanged since the slice 63 deploy.
