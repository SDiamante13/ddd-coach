# Redeploy after OpenRouter key rotation (2026-09-26)

Incident: production chat returned 502 "coach unavailable" because the OpenRouter key had expired. The owner put a new `OPENROUTER_API_KEY` into Netlify (production). Functions only read env at deploy time, so the live commit was redeployed unchanged.

- Commit: `4da6864`, the commit already live (deploy `6ab70d870c34127c79881de8`). Main was not deployed because it holds unreleased #100 work.
- Built from a pinned detached worktree outside the repo, removed afterwards.
- Site: `ddd-coach` (`40f5c583-82ea-47fa-b007-65f2cf19cac2`), https://ddd-coach.netlify.app
- Deploy id: `6ab73e494255641bb569702b`
- Log: https://app.netlify.com/projects/ddd-coach/deploys/6ab73e494255641bb569702b
- Command: `npx netlify deploy --prod --site <id>` (Netlify CLI 27.9.0), exit 0
- Live `/` serves `index-CnFqFwBp.js` and `index-jkSHQ-P_.css`, the same as the worktree build and the previous deploy.

## Pre-deploy

| Check | Result |
|---|---|
| `npm ci` + `bin/check.sh` in worktree | pass |
| Shell had no `OPENROUTER_*` vars, so the paid smoke test was skipped | pass |
| `OPENROUTER_API_KEY` set (production) | true |
| `OPENROUTER_MODEL` == `openai/gpt-5.6-terra` | true |
| `OPENROUTER_REASONING_EFFORT` == `none` | true |
| `COACH_SIGNING_KEY`, `ACCESS_PASSWORD` | set |
| `COACH_TIMEOUT_MS`, `DDD_COACH_PROBE` | absent |

Env was read with a filtered `env:list --json` that prints booleans only. No env var was changed.

## Hosted verification (one paid call)

| Check | Result |
|---|---|
| `POST /api/unlock` with the pass file (body built by python, never printed) | 204 |
| `POST /api/chat` `{"message":"hi","history":[]}` at 2026-09-26T03:39:46Z | **200** in 6.56 s |
| Reply | non-empty (165 chars); keys `reply`, `signature`. Text not recorded |

The cookie jar and response file were deleted right after.

## Hosted checks

| Check | Expected | Result |
|---|---|---|
| `/` headers | nosniff, Referrer-Policy, CSP | pass |
| `GET /api/chat` | 405 | pass |
| `POST /api/chat` without cookie | 401 | pass |
| `GET /api/session` without cookie | 401 `no-store` | pass |
| `GET /api/unlock` | 405 `Allow: POST` | pass |
| `/.env`, `/src/main.tsx`, `/server/config.ts`, `/assets/index-CnFqFwBp.js.map` | 404 | pass |
| `sk-or` / `OPENROUTER` in deployed HTML, JS, CSS | 0 | pass (0 / 0 in each) |
| `sk-or` in `chat`, `session`, `unlock` zips | 0 | pass; sizes 1,772,297 / 1,172,031 / 1,172,561 bytes, the same as the `4da6864` deploy |

## Notes

- The function logs weren't needed: the first call after the deploy returned 200.
- Lesson: an expired key gives 502 "coach unavailable" with no code change. Rotating the key needs a redeploy, and the only way to verify prod is one hosted call, because the CLI can't read the secret back (see the Deploy checklist).
