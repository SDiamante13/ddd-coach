# Deploy: slice #63 + #75 + coaching prompt v8 (2026-09-25)

- Commit: `6d9c354`, built from a pinned detached worktree (removed afterwards)
- Site: `ddd-coach` (`40f5c583-82ea-47fa-b007-65f2cf19cac2`), https://ddd-coach.netlify.app
- Deploy id: `6ab6be0b6c3922ec875e9550`
- Log: https://app.netlify.com/projects/ddd-coach/deploys/6ab6be0b6c3922ec875e9550
- Command: `netlify deploy --prod --site <id>` (Netlify CLI 27.9.0), exit 0
- Live `/` serves `index-Cyv7DOJe.js`, the same hash as the worktree build and the deploy permalink

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
| `POST /api/chat` without cookie | 401 + Cache-Control | pass: 401 JSON, `cache-control: no-cache` (see Notes) |
| `GET /api/session` without cookie | 401 `no-store` | pass |
| `GET /api/unlock` | 405 `Allow: POST`, `no-store` | pass |
| `POST /api/unlock` with a bogus password | 401 "That password isn't right. Try again, or ask the organizer for it." | pass |
| `/.env`, `/src/main.tsx`, `/server/config.ts` | 404 | pass |
| `sk-or` / `OPENROUTER` in deployed HTML, JS, CSS | 0 | pass (0 / 0) |
| `sk-or` in `chat`, `unlock`, `session` zips | 0 | pass |
| `.env` or `.map` in the function zips | none | pass |
| `.map` in `dist/`, or served `*.map` | none, 404 | pass |
| Bundle contains "Try an example thread" | present | pass |

## Notes

- The wrong-password copy lives in the `unlock` function (`src/shared/accessContract.ts`), not in the client bundle. It was confirmed with one bogus-password POST, well under the 30/min limit. Nothing was unlocked and no paid chat call ran.
- The chat 401 carries `no-cache`, which is Netlify's default. `chatHandler` sets no Cache-Control. The slice 41 `no-store` rule covers only session and unlock. It's harmless, since the response holds no secret, but chat has no explicit `no-store` of its own.
- The function zips contain `OPENROUTER_*` names only (config plus the SDK's own names), as the slice 2a plan expects. They hold no values.
