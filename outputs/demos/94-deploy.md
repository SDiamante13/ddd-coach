# Deploy: the event board, chat failure reason codes and the start-over thread offer (2026-09-26)

- Commit: `681a1d1`, built from a pinned detached worktree outside the repo (removed afterwards). The main tree's uncommitted v14 prompt work was not in the build.
- Site: `ddd-coach` (`40f5c583-82ea-47fa-b007-65f2cf19cac2`), https://ddd-coach.netlify.app
- Deploy id: `6ab77f6ec7e6dcd552e6a295` (state `ready`, context `production`). It replaces `6ccdf26` (deploy `6ab75a320c34123a85881de8`).
- Log: https://app.netlify.com/projects/ddd-coach/deploys/6ab77f6ec7e6dcd552e6a295
- Command: `npx netlify deploy --prod --site <id>` (Netlify CLI 27.9.0 from the worktree's `node_modules`), exit 0
- Live `/` serves `index-BeMnnO8U.js` and `index-uz2tOb8C.css`. The hash matches the worktree build, and both files are byte-identical to it. The live HTML differs from `dist/index.html` only by Netlify's injected "hosted on Netlify" comment.

Contents:
- #94: the event board. From 1024 px it uses layout B, with a pinned "Current question", the closest-line note and the "← N new on the board" chip (plus " · M already there"). The `npm run demo:board` fixture API is dev-only and not in the build.
- #74: every chat failure carries a `reason` code, and a busy coach's Retry-After comes through as `retryAfterSeconds`. This changes the chat API contract, so the client and server ship together in this deploy.
- #68: the start-over offer brings back the pasted thread.
- Unchanged: `GLOSSARY_ENABLED` is `false` and the instructions are still v13.

## Pre-deploy

| Check | Result |
|---|---|
| `LIVE_INSTRUCTIONS_VERSION` and `COACH_INSTRUCTIONS_VERSION` at `681a1d1` | 13 and 13 |
| `GLOSSARY_ENABLED` in `src/shared/features.ts` | `false` |
| Fixture plugin gated on `COACH_FIXTURES === "1"` in `vite.config.ts` | yes |
| `npm ci` + `bin/check.sh` in the worktree | pass on the first run |
| Shell had no `OPENROUTER_*` vars, so the paid smoke test was skipped | pass |
| `OPENROUTER_MODEL` starts with `openai/` | true |
| `OPENROUTER_MODEL` == `openai/gpt-5.6-terra` (production) | true |
| `OPENROUTER_REASONING_EFFORT` == `none` | true |
| `OPENROUTER_API_KEY`, `COACH_SIGNING_KEY`, `ACCESS_PASSWORD` | set |
| `COACH_TIMEOUT_MS`, `DDD_COACH_PROBE`, `GLOSSARY_ENABLED`, `COACH_FIXTURES` env | absent |
| Free key check (`GET /api/v1/key` with the local `.env` key) | **401 "User not found."**: the local key is dead (see Notes) |
| Live `/api/health` before the deploy (checks the prod key) | 200 `ok` |

Env was read with a filtered `env:list --json` that prints booleans only. No env var was changed.

## After the deploy

| Check | Expected | Result |
|---|---|---|
| `GET /api/health` | 200 `{"ok":true,"status":"ok"}` | pass: 200 `{"ok":true,"status":"ok","detail":null}`, and the same again after the worktree was removed |
| `POST /api/health` | 405 | pass |
| `GET /data` | 200 app shell | pass: 200 `text/html`, byte-identical to `/`, with nosniff, Referrer-Policy and CSP. It renders the same headings as before, plus "Policies" |
| `POST /api/chat` without a cookie | 401 JSON with `reason`, `no-store` | pass: 401 `{"error": string, "reason": "access_expired"}`, `content-type: application/json`, `cache-control: no-store` |
| "new on the board", "Current question", "already there" in the bundle | present | pass (1 / 1 / 1) |
| `access_expired` and the Retry-After handling in the bundle | present | pass (2; 5 `retryAfter`/Retry-After hits) |
| `board-demo-fixture`, `fixtureApi`, `COACH_FIXTURES`, `BOARD_DEMO` in the JS, CSS and HTML, anywhere in `dist/`, and in the function zips | 0 | pass (0 everywhere) |
| `/dev/fixtureApi.ts` served | 404 | pass |
| "Keep these words" in the bundle and on the rendered `/` | 0 | pass |
| "routes them to OpenAI" on the rendered `/`, and `/` links to `/data` | present | pass |
| Deployed function sizes match the local zips (`available_functions`) | equal | pass: `chat` 1,774,663, `health` 1,172,031, `session` 1,172,107, `unlock` 1,172,633 |

## Hosted checks

| Check | Expected | Result |
|---|---|---|
| `/` headers | nosniff, Referrer-Policy, CSP | pass |
| `GET /api/chat` | 405 | pass |
| `GET /api/session` without a cookie | 401 `no-store` | pass |
| `GET /api/unlock` | 405 `Allow: POST`, `no-store` | pass |
| `/.env`, `/src/main.tsx`, `/server/config.ts`, `/server/healthHandler.ts`, `/netlify.toml` | 404 | pass |
| `sk-or` / `OPENROUTER` in the deployed HTML, JS and CSS | 0 | pass |
| `sk-or` in the `chat`, `health`, `session` and `unlock` zips | 0 | pass |
| `OPENROUTER` in the function zips | env var names only | pass: `process.env` names and the SDK's own names; no values |
| `.env` or `.map` in the function zips; `.map` in `dist/`; the served `*.js.map` | none; 404 | pass |
| Earlier features still bundled: "Copy for your RFC", "What's sent", "Names restored in this browser", "CC BY 4.0", "Where your text goes", "New conversation" | present | pass |
| Font URLs in the deployed CSS are same-origin | all `/assets/…` | pass (49 of 49; 26 woff2, all 200) |
| `fonts.googleapis` / `fonts.gstatic` in the deployed HTML, CSS and JS | 0 | pass |
| Fonts loaded in the browser | self-hosted families | pass: `Bricolage Grotesque Variable`, `IBM Plex Sans`, `IBM Plex Mono` |

## Notes

- **The local `.env` OpenRouter key is dead.** The free key check got 401 "User not found." The prod secret is a different, working key: `/api/health` is `ok` both before and after the deploy, and it is `ok` only when the key is valid. The local key still needs replacing before any local paid run or eval.
- No hosted chat call ran. The password file is missing, so there was no unlock and no paid call. The chat path is covered by the cookieless `POST /api/chat` (401 with `reason`) and by `/api/health`.
- The chat 401 now sends an explicit `Cache-Control: no-store` (#74), which closes the `no-cache` note from the last two deploys.
- The board, pinned question, chip and start-over thread offer all sit behind the gate, so this deploy only verified their strings in the bundle. The verifier owns the demo.
