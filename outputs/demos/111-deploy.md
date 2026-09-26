# Deploy: the laptop-height question strip, the resting composer, the 3-column margin table and the UPDATED-mark fix (2026-09-26)

- Commit: `1eab7a4`, built from a pinned detached worktree outside the repo (removed afterwards). The main tree's uncommitted v14 prompt work was not in the build.
- Site: `ddd-coach` (`40f5c583-82ea-47fa-b007-65f2cf19cac2`), https://ddd-coach.netlify.app
- Deploy id: `6ab7843bd74a192efa6f9da2` (state `ready`, context `production`). It replaces `681a1d1` (deploy `6ab77f6ec7e6dcd552e6a295`).
- Log: https://app.netlify.com/projects/ddd-coach/deploys/6ab7843bd74a192efa6f9da2
- Command: `npx netlify deploy --prod --site <id>` (Netlify CLI 27.9.0 from the worktree's `node_modules`), exit 0
- Live `/` serves `index-Bz9pLyeA.js` and `index-D0CxAZ9A.css`. The hash matches the worktree build, and both files are byte-identical to it. The live HTML differs from `dist/index.html` only by Netlify's injected "hosted on Netlify" comment.

Contents:
- #111: at 1024 px and wider with a window height of 759 px or less, the pinned question becomes a strip ("Question · roles", the text, and a ▾ "Whole question" toggle). The strip opens by itself for 3 s when the first question arrives and when a reply changes the question. The empty, unfocused composer rests in the board margin as one 44 px line. The margin words table has 3 columns, with a dashed GUESS tag inside a guessed meaning's cell; the stacked layout keeps 4 columns.
- #94 live-bug fix: a card's JUST ADDED or UPDATED mark remounts for each change, so a card that changes in two replies in a row shows UPDATED.
- Unchanged: `GLOSSARY_ENABLED` is `false` and the instructions are still v13. It is a client-only change, and the function zips match the last deploy byte for byte in size.

## Pre-deploy

| Check | Result |
|---|---|
| `LIVE_INSTRUCTIONS_VERSION` and `COACH_INSTRUCTIONS_VERSION` at `1eab7a4` | 13 and 13 |
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

Env was read with a filtered `env:list --json` that prints booleans only. No env var was changed.

## After the deploy

| Check | Expected | Result |
|---|---|---|
| `GET /api/health` | 200 `{"ok":true,"status":"ok"}` | pass: 200 `{"ok":true,"status":"ok","detail":null}`, and the same again after the worktree was removed |
| `POST /api/health` | 405 | pass |
| `GET /data` | 200 app shell | pass: 200 `text/html`, byte-identical to `/`, with nosniff, Referrer-Policy and CSP. It renders the same 7 headings, ending with "Policies" |
| `POST /api/chat` without a cookie | 401 JSON with `reason`, `no-store` | pass: 401 `{"error": string, "reason": "access_expired"}`, `content-type: application/json`, `cache-control: no-store` |
| Strip strings in the JS: `question-strip`, "Whole question", "Question · " | present | pass (4 / 1 / 1) |
| GUESS tag: `guess-tag` in JS / CSS, "GUESS" in JS | present | pass (1 / 2, 2) |
| Laptop-height query in the CSS | `(width>=1024px) and (height<=759px)` | pass (1) |
| `card-ring` (the keyed mark span) in JS / CSS | present | pass (1 / 2) |
| #94 board strings: "new on the board", "Current question", "already there" | present | pass (1 / 1 / 1) |
| `board-demo-fixture`, `fixtureApi`, `COACH_FIXTURES`, `BOARD_DEMO` in the JS, CSS and HTML, anywhere in `dist/`, and in the function zips | 0 | pass (0 everywhere) |
| `/dev/fixtureApi.ts` served | 404 | pass |
| "Keep these words" in the bundle and on the rendered `/` | 0 | pass |
| "routes them to OpenAI" on the rendered `/`, and `/` links to `/data` | present | pass |
| Deployed function sizes match the local zips (`available_functions`) | equal | pass: `chat` 1,774,663, `health` 1,172,031, `session` 1,172,107, `unlock` 1,172,633 (unchanged from `681a1d1`) |

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
| Earlier features still bundled: "Copy for your RFC", "What's sent", "Names restored in this browser", "CC BY 4.0", "Where your text goes", "New conversation", `access_expired` | present | pass |
| Font URLs in the deployed CSS are same-origin | all `/assets/…` | pass (49 of 49; 26 woff2, all 200) |
| `fonts.googleapis` / `fonts.gstatic` in the deployed HTML, CSS and JS | 0 | pass |
| Fonts loaded in the browser | self-hosted families | pass: `Bricolage Grotesque Variable` and `IBM Plex Sans` on `/` and `/data`. `IBM Plex Mono` is declared in the CSS with its woff2 served 200, but nothing ungated uses it, so it didn't load |

## Notes

- **The local `.env` OpenRouter key is still dead** (401 "User not found."). The prod secret is a different, working key: `/api/health` is `ok` before and after the deploy. The local key needs replacing before any local paid run or eval.
- No hosted chat call ran: no unlock and no paid call. The chat path is covered by the cookieless `POST /api/chat` (401 with `reason`) and by `/api/health`.
- The strip, resting composer, GUESS tag and UPDATED mark all sit behind the gate, so this deploy only verified their strings and the height query in the bundle. The verifier owns the demo.
- Another session's worktree (`…/22a8e026…/scratchpad/wt111`, detached at `1eab7a4`) is still registered. It isn't this deploy's worktree, so it was left alone.
