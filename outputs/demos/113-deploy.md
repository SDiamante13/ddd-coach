# Deploy: Copy for your repo (GLOSSARY.md and a CLAUDE.md section) and identifier-first meanings kept as written (2026-09-26)

- Commit: `fb287cc`, built from a pinned detached worktree outside the repo (removed afterwards). The main tree's uncommitted v14 prompt work was not in the build.
- Site: `ddd-coach` (`40f5c583-82ea-47fa-b007-65f2cf19cac2`), https://ddd-coach.netlify.app
- Deploy id: `6ab7860a10b8d6f3ebd93cf0` (state `ready`, context `production`). It replaces `1eab7a4` (deploy `6ab7843bd74a192efa6f9da2`).
- Log: https://app.netlify.com/projects/ddd-coach/deploys/6ab7860a10b8d6f3ebd93cf0
- Command: `npx netlify deploy --prod --site <id>` (Netlify CLI 27.9.0 from the worktree's `node_modules`), exit 0
- Live `/` serves `index-BX-iNy7W.js` and `index-Dx6PNLxE.css` (was `index-Bz9pLyeA.js` and `index-D0CxAZ9A.css`). The hash matches the worktree build, and both files are byte-identical to it. The live HTML differs from `dist/index.html` only by Netlify's injected "hosted on Netlify" comment.

Contents:
- #113: "Copy for your repo" under any reply with a term table. It writes a GLOSSARY.md and a stamped CLAUDE.md section of at most 15 lines. The export has the date, the real identifiers, Settled, Unsettled or Guess rows, and "Don't use" lines for same-meaning pairs. It keeps the rule to leave `TODO(glossary)` only at the unsettled point. A term is Unsettled when any open question names it. A term with no letters or digits never matches.
- Parser: a meaning whose first token looks like an identifier (snake_case, `a.b`, `f()`, camelCase) stays as written, so the exports copy `actual_pickup_at` rather than `Actual_pickup_at`.
- Unchanged: `GLOSSARY_ENABLED` is `false` and the instructions are still v13. The server-side diff since `1eab7a4` is two eval fixtures only. The function zips match the last deploy byte for byte in size.

## Pre-deploy

| Check | Result |
|---|---|
| `LIVE_INSTRUCTIONS_VERSION` and `COACH_INSTRUCTIONS_VERSION` at `fb287cc` | 13 and 13 |
| `GLOSSARY_ENABLED` in `src/shared/features.ts` | `false` |
| Fixture plugin gated on `COACH_FIXTURES === "1"` in `vite.config.ts` | yes |
| `npm ci` + `bin/check.sh` in the worktree | pass on the first run |
| Shell had no `OPENROUTER_*` vars, so the paid smoke test was skipped | pass |
| `OPENROUTER_MODEL` starts with `openai/` | true |
| `OPENROUTER_MODEL` == `openai/gpt-5.6-terra` (production) | true |
| `OPENROUTER_REASONING_EFFORT` == `none` | true |
| `OPENROUTER_API_KEY`, `COACH_SIGNING_KEY`, `ACCESS_PASSWORD` | set |
| `COACH_TIMEOUT_MS`, `DDD_COACH_PROBE`, `GLOSSARY_ENABLED`, `COACH_FIXTURES` env | absent |
| Free key check (`GET /api/v1/key` with the local `.env` key) | **401 "User not found."**: the local key is still dead (see Notes) |
| Live `/api/health` before the deploy (checks the prod key) | 200 `ok` |

Env was read with a filtered `env:list --json --context production` that prints booleans only. No env var was changed.

## After the deploy

| Check | Expected | Result |
|---|---|---|
| `GET /api/health` | 200 `{"ok":true,"status":"ok"}` | pass: 200 `{"ok":true,"status":"ok","detail":null}`, and the same again after the worktree was removed |
| `POST /api/health` | 405 | pass |
| `GET /data` | 200 app shell | pass: 200 `text/html`, byte-identical to `/`, with nosniff, Referrer-Policy and CSP. It renders the same 7 headings, ending with "Policies" |
| `POST /api/chat` without a cookie | 401 JSON with `reason`, `no-store` | pass: 401 `{"error": string, "reason": "access_expired"}`, `content-type: application/json`, `cache-control: no-store` |
| #113 strings in the JS: "Copy for your repo", `GLOSSARY.md`, `CLAUDE.md`, `TODO(glossary)`, "Don't use", "Settled", "Unsettled" | present | pass (1 / 8 / 2 / 3 / 2 / 4 / 5) |
| Identifier regex `/_\|\w\.\w\|\(\)\|[a-z][A-Z]/` in the JS | present | pass (1) |
| `board-demo-fixture`, `fixtureApi`, `COACH_FIXTURES`, `BOARD_DEMO` in the JS, CSS and HTML, anywhere in `dist/`, and in the function zips | 0 | pass (0 everywhere) |
| `/dev/fixtureApi.ts` served | 404 | pass |
| "Keep these words" in the bundle and on the rendered `/` | 0 | pass |
| "routes them to OpenAI" on the rendered `/`, and `/` links to `/data` | present | pass |
| Deployed function sizes match the local zips (`available_functions`) | equal | pass: `chat` 1,774,663, `health` 1,172,031, `session` 1,172,107, `unlock` 1,172,633 (unchanged from `1eab7a4`) |

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
| Earlier features still bundled: "Copy for your RFC", "What's sent", "Names restored in this browser", "CC BY 4.0", "Where your text goes", "New conversation", `access_expired`, `question-strip`, `guess-tag` | present | pass |
| Font URLs in the deployed CSS are same-origin | all `/assets/…` | pass (49 of 49; 26 woff2, all 200) |
| `fonts.googleapis` / `fonts.gstatic` in the deployed HTML, CSS and JS | 0 | pass |
| Fonts loaded in the browser | self-hosted families | pass: `Bricolage Grotesque Variable`, `IBM Plex Sans` and `IBM Plex Mono` on `/`, and `Bricolage Grotesque Variable` and `IBM Plex Sans` on `/data` |

## Notes

- **The local `.env` OpenRouter key is still dead** (401 "User not found."). The prod secret is a different, working key: `/api/health` is `ok` before and after the deploy. The local key needs replacing before any local paid run or eval.
- `env:list --json` without `--context production` shows only 3 vars, and the secrets come back as empty strings. Use `--context production` for the boolean check.
- No hosted chat call ran: no unlock and no paid call. The chat path is covered by the cookieless `POST /api/chat` (401 with `reason`) and by `/api/health`.
- "Copy for your repo" only shows under a reply with a term table, behind the gate. So this deploy only verified its strings and the identifier regex in the bundle. The verifier owns the demo.
- Other sessions' worktrees (`…/5933a429…/scratchpad/gate-111demo` and the `.claude/worktrees/agent-*` ones) are still registered. They aren't this deploy's worktrees, so they were left alone.
