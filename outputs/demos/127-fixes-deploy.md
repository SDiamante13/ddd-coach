# Deploy: words chip and #127 demo fixes (#127) (2026-10-01)

- Live commit: `698f9e0`. Built from a pinned detached worktree outside the repo, removed afterwards. The main tree's uncommitted v14 prompt work was not in the build.
- GitHub CI (`ci.yml`) for `698f9e0`: run `36816675513`, `success`, confirmed before the deploy. It was in progress at first, and the deploy waited for it.
- Site: `ddd-coach` (`40f5c583-82ea-47fa-b007-65f2cf19cac2`), https://ddd-coach.netlify.app
- Deploy: **`6abde617f085dff7270d3e2b`** (`ready`, `production`, published). It replaced `8d0f94e` (deploy `6abde091c509b3b6d395326e`).
- Log: https://app.netlify.com/projects/ddd-coach/deploys/6abde617f085dff7270d3e2b
- Command: `npx netlify deploy --prod --site <id> --dir dist` (Netlify CLI 27.9.0 from the worktree's `node_modules`).
- Live `/` serves `index-fBzPnfrX.js` and `index-D5FyOCdM.css` (before: `index-BbCaeP_4.js` and `index-DYwa6RLm.css`). The hash matches the `698f9e0` worktree build, and both files are byte-identical to it. The live HTML differs from `dist/index.html` only by Netlify's injected "hosted on Netlify" comment.

Contents (11 commits since `8d0f94e`; plus 2 docs commits):
- #127 item 7: a reply's word table in the margin collapses to a "← N terms on the board · M rows" chip that takes the visitor to the term cards; the table sits under "Show as table", with the copy buttons kept.
- #127 demo fixes: the board's list is out of the Tab order (`tabindex -1`), so the roving card is the only Tab stop; the keys hint is remembered as seen when it shows; a words-only reply's header has no "0 events"; the open question's dotted lines are drawn above the cards and let clicks through; the controls sit in the board's header row, with an "Overview" toggle for the MiniMap (on at ≥900 px, hidden below).
- #127: the words chip finds its term card without building a selector from the visitor's word, and moving to a card turns Follow coach off.
- #127, #124, #96 test: acceptance tests wait for React Flow transforms and edges and find the link menu's buttons after the clicks that open it. Test-only.
- Client-only. `server/`, `netlify/`, `netlify.toml`, `package.json`, `package-lock.json` and `vite.config.ts` are unchanged since `8d0f94e` (empty `git diff`). All four deployed function sizes equal the last deploy's.
- Unchanged: instructions are still v13, and `GLOSSARY_ENABLED` and `CORRECTIONS_ENABLED` are still `false`.

## Bundle size

| File | Last deploy (gz) | This deploy (gz) | Delta (gz) |
|---|---|---|---|
| index JS | 155,394 (`BbCaeP_4`, raw 489,629) | 155,625 (`fBzPnfrX`, raw 490,702) | +231 |
| index CSS | 10,152 (`DYwa6RLm`, raw 57,888) | 10,180 (`D5FyOCdM`, raw 57,999) | +28 |

This deploy was measured with `gzip -9` on the build files, which are byte-identical to the served ones. The last deploy's figures are from `127-hint-deploy.md`.

## Pre-deploy

| Check | Result |
|---|---|
| GitHub CI `ci.yml` run for `698f9e0` | `success` (`36816675513`), after waiting for it to finish |
| `LIVE_INSTRUCTIONS_VERSION` and `COACH_INSTRUCTIONS_VERSION` at `698f9e0` | 13 and 13 |
| `GLOSSARY_ENABLED` and `CORRECTIONS_ENABLED` in `src/shared/features.ts` | `false` and `false` |
| Fixture plugin gated on `COACH_FIXTURES === "1"` in `vite.config.ts` | yes |
| `git diff 8d0f94e 698f9e0` on `server/`, `netlify/`, `netlify.toml`, `package*.json`, `vite.config.ts` | empty |
| `npm ci` + `bin/check.sh` in the worktree | pass on the first run |
| Shell had no `OPENROUTER_*` vars, so the paid smoke test was skipped | pass |
| `OPENROUTER_MODEL` starts with `openai/` | true |
| `OPENROUTER_MODEL` == `openai/gpt-5.6-terra` (production) | true |
| `OPENROUTER_REASONING_EFFORT` == `none` | true |
| `OPENROUTER_API_KEY`, `COACH_SIGNING_KEY`, `ACCESS_PASSWORD` | set |
| `COACH_TIMEOUT_MS`, `DDD_COACH_PROBE`, `GLOSSARY_ENABLED`, `CORRECTIONS_ENABLED`, `COACH_FIXTURES` env | absent |
| Free key check with the local `.env` key (`node --env-file=.env`, status only) | 401 "User not found." (see Notes) |
| Live `/api/health` before the deploy (checks the prod key) | 200 `ok` |
| Published deploy before this one | `6abde091c509b3b6d395326e`, serving the `8d0f94e` assets |

Env was read with a filtered `env:list --json --context production` that prints booleans only. No env var was changed.

## After the deploy

| Check | Expected | Result |
|---|---|---|
| `GET /api/health` | 200 `{"ok":true,"status":"ok"}` | pass: 200 `{"ok":true,"status":"ok","detail":null}`, and the same again after the worktree was removed |
| `POST /api/health` | 405 | pass |
| `GET /data` | 200 | pass |
| `POST /api/chat` without a cookie | 401 JSON with `reason`, `no-store` | pass: 401 `{"error": string, "reason": "access_expired"}`, `content-type: application/json`, `cache-control: no-store` |
| #127 words chip "terms on the board" in the JS | present | pass: the pluralised template `` `terms`)} on the board · `` (1) |
| #127 "Show as table", "Overview" | present | pass (1 / 3) |
| #127 "0 events" | 0 | pass (0) |
| #127 hint "between rows", "along a row", "Esc to the controls", `board-keys` | present | pass (2 / 2 / 2 / 1) |
| #127 "Follow coach", #20 "Board overview" | present | pass (1 / 1) |
| #109 " term row", `board-words`, `term-card`, "JUST ADDED" | present | pass (1 / 2 / 1 / 3) |
| #126 " not on the board", #124 "Picked up where you left off" | present | pass (1 / 1) |
| React Flow attribution `react-flow__attribution` | present | pass (1) |
| "The coach's next turn uses your wording." in the JS | 0 (flag off) | pass (0) |
| "Keep these words" in the bundle | 0 | pass (0) |
| `CORRECTIONS_ENABLED = false` and `GLOSSARY_ENABLED = false` in the `chat` zip | present | pass (both in `chat.mjs`) |
| Earlier features: "YOU SAID", "You connected", "Link undone." | present | pass |
| `board-demo-fixture`, `fixtureApi`, `COACH_FIXTURES`, `BOARD_DEMO` in the live HTML, JS and CSS, and anywhere in `dist/` | 0 | pass (0 everywhere) |
| `/dev/fixtureApi.ts`, `/src/ui/WordsOnBoard.tsx`, `/src/ui/BoardFlow.tsx` served | 404 | pass |
| Deployed function sizes match the last deploy (`available_functions`) | equal | pass: `chat` 1,775,134, `health` 1,172,031, `session` 1,172,107, `unlock` 1,172,633 |

## Hosted checks

| Check | Expected | Result |
|---|---|---|
| `/` headers | nosniff, Referrer-Policy, CSP | pass (3 of 3) |
| `GET /api/chat` | 405 | pass |
| `GET /api/session` without a cookie | 401 `no-store` | pass |
| `GET /api/unlock` | 405 `Allow: POST`, `no-store` | pass |
| `/.env`, `/src/main.tsx`, `/server/config.ts`, `/server/healthHandler.ts`, `/server/chatCorrections.ts`, `/netlify.toml` | 404 | pass |
| `sk-or` / `OPENROUTER` in the deployed HTML, JS and CSS | 0 | pass |
| `sk-or` in the `chat`, `health`, `session` and `unlock` zips | 0 | pass |
| `.env` or `.map` in the function zips; `.map` in `dist/`; the served `index-fBzPnfrX.js.map` | none; 404 | pass |
| Earlier features still bundled: "Copy for your RFC", "What's sent", "CC BY 4.0", "Where your text goes", "New conversation", `access_expired`, `guess-tag` | present | pass |
| CSS `url()`s are same-origin | all `/assets/…` | pass (49 of 49; 26 woff2, all 200) |
| `fonts.googleapis` / `fonts.gstatic` in the deployed HTML, CSS and JS | 0 | pass |

## Notes

- **The local `.env` key is still dead.** The free `GET /api/v1/key` check returned 401 "User not found." again. The prod secret is a different, working key: `/api/health` is `ok` before and after the deploy. Local paid runs need a new key in `.env`.
- The chip label is a template built with `plural()`, so the literal "terms on the board" never appears in the bundle; the check matched the template fragment instead.
- The CLI deployed the functions from its cache. The server is unchanged and all four sizes equal the last deploy's, so this is expected.
- The function zips contain the string `OPENROUTER` 29 times (20 / 5 / 2 / 2). These are env var names, not values: `sk-or` is 0.
- No hosted chat call ran: no unlock and no paid call. The changes are covered by the acceptance tests in `bin/check.sh`. The verifier owns the demo.
- Other worktrees are still registered: another session's `…/b8b9f924…/scratchpad/wt127f` at `698f9e0` (detached) and `.claude/worktrees/status-90`. Neither is this deploy's worktree, so both were left alone. While this report was written, the published deploy was still `6abde617`.
