# Deploy: row statuses and the #127 tail (#90, #127) (2026-10-01)

- Live commit: `309534e`. Built from a pinned detached worktree outside the repo, removed afterwards. The main tree's uncommitted v14 prompt work was not in the build.
- GitHub CI (`ci.yml`) for `309534e`: run `36850262261`, `success`, confirmed by `headSha` before the deploy.
- Site: `ddd-coach` (`40f5c583-82ea-47fa-b007-65f2cf19cac2`), https://ddd-coach.netlify.app
- Deploy: **`6abe38d6dbacd33b84a564e3`** (`ready`, `production`, published). It replaced `698f9e0` (deploy `6abde617f085dff7270d3e2b`).
- Log: https://app.netlify.com/projects/ddd-coach/deploys/6abe38d6dbacd33b84a564e3
- Command: `npx netlify deploy --prod --site <id> --dir dist` (Netlify CLI 27.9.0 from the worktree's `node_modules`).
- Live `/` serves `index-MMHo_oOD.js` and `index-zzhNhOXG.css` (before: `index-fBzPnfrX.js` and `index-D5FyOCdM.css`). Both files are byte-identical to the `309534e` worktree build. The live HTML differs from `dist/index.html` only by Netlify's injected "hosted on Netlify" comment.

Contents (17 commits since `698f9e0`; plus 4 docs commits):
- #90 row statuses: a term row's "I checked ▾" menu (holds / wrong / couldn't tell / Clear check, plus "Where?"), "N OF M ANSWERED", the expert's lines "from your table", "No, it's wrong" opening a correction shown as YOU SAID, an optional settle-by forum and date, and the checks, corrected wording and settle-by carried into the RFC and repo copies.
- #127 tail: the keys hint is remembered as seen on the first arrow key; a reply adding more than 5 things shows one "N new on the board" count; Follow coach turns off only when the visitor acts on the board, saying "Follow paused while you work"; the board's header is an opaque band.
- #90, #95: the client sends at most the 20 most recent corrections, each cut to 300 characters. The limits moved from `server/chatCorrections.ts` to `src/shared/chatContract.ts` with the same values (20 and 300). Dormant while `CORRECTIONS_ENABLED` is `false`.
- Server: the only change under `server/`, `netlify/`, `netlify.toml`, `package*.json` and `vite.config.ts` is `server/chatCorrections.ts`, which now imports the two limits instead of declaring them.
- Unchanged: instructions are still v13, and `GLOSSARY_ENABLED` and `CORRECTIONS_ENABLED` are still `false`.

## Bundle size

| File | Last deploy (gz) | This deploy (gz) | Delta (gz) |
|---|---|---|---|
| index JS | 155,625 (`fBzPnfrX`, raw 490,702) | 159,001 (`MMHo_oOD`, raw 500,476) | +3,376 |
| index CSS | 10,180 (`D5FyOCdM`, raw 57,999) | 10,615 (`zzhNhOXG`, raw 60,905) | +435 |

Measured with `gzip -9` on the served files, which are byte-identical to the build. The last deploy's figures are from `127-fixes-deploy.md`.

## Chat function zip diff

The deployed `chat` zip is 1,775,155 bytes, 21 more than last deploy's 1,775,134. `health`, `session` and `unlock` are the same size as before (1,172,031 / 1,172,107 / 1,172,633).

To explain it, both commits' functions were zipped locally with `zip-it-and-ship-it` (`698f9e0` in a second throwaway worktree, also removed). The `health`, `session` and `unlock` zips have identical contents. In `chat`, only `netlify/functions/chat.mjs` differs, and the deployed `chat.mjs` is identical to the local `309534e` one. The diff has two parts:

1. **The shared limits:** `var MAX_CORRECTIONS = 20; var MAX_CORRECTION_CHARS = 300;` move from the `chatCorrections` section to the `chatContract` section. The values are the same.
2. **`shortDay` (`309534e`, refactor):** the bundled `src/domain/dates.ts` gains `shortDay(isoDate)`, and the "kept on … from …" line calls it instead of parsing inline. The output is the same.

So the diff is not only the shared limits. The second part is the behaviour-preserving `shortDay` refactor, which the server also bundles.

## Pre-deploy

| Check | Result |
|---|---|
| GitHub CI `ci.yml` run for `309534e` (matched by `headSha`) | `success` (`36850262261`) |
| `origin/main` == `309534e` | yes |
| `LIVE_INSTRUCTIONS_VERSION` and `COACH_INSTRUCTIONS_VERSION` at `309534e` | 13 and 13 |
| `GLOSSARY_ENABLED` and `CORRECTIONS_ENABLED` in `src/shared/features.ts` | `false` and `false` |
| Fixture plugin gated on `COACH_FIXTURES === "1"` in `vite.config.ts` | yes |
| `git diff 698f9e0 309534e` on `server/`, `netlify/`, `netlify.toml`, `package*.json`, `vite.config.ts` | only `server/chatCorrections.ts` (+1 −3, imports the limits) |
| `npm ci` + `bin/check.sh` in the worktree | pass on the first run |
| Shell had no `OPENROUTER_*` vars, so the paid smoke test was skipped | pass |
| `OPENROUTER_MODEL` starts with `openai/` | true |
| `OPENROUTER_MODEL` == `openai/gpt-5.6-terra` (production) | true |
| `OPENROUTER_REASONING_EFFORT` == `none` | true |
| `OPENROUTER_API_KEY`, `COACH_SIGNING_KEY`, `ACCESS_PASSWORD` | set |
| `COACH_TIMEOUT_MS`, `DDD_COACH_PROBE`, `GLOSSARY_ENABLED`, `CORRECTIONS_ENABLED`, `COACH_FIXTURES` env | absent |
| Free key check with the local `.env` key (`node --env-file=.env`, status only) | 401 "User not found." (see Notes) |
| Live `/api/health` before the deploy (checks the prod key) | 200 `ok` |
| `dist/` has no `.map` and no fixture strings | 0 / 0 |
| Published deploy before this one | `6abde617f085dff7270d3e2b` |

Env was read with a filtered `env:list --json --context production` that prints booleans only. No env var was changed.

## After the deploy

| Check | Expected | Result |
|---|---|---|
| `GET /api/health` | 200 `{"ok":true,"status":"ok"}` | pass: `{"ok":true,"status":"ok","detail":null}`, and the same again after the worktrees were removed |
| `POST /api/health` | 405 | pass |
| `GET /data` | 200 | pass |
| `POST /api/chat` without a cookie | 401 JSON with `reason`, `no-store` | pass: 401 `{"error": string, "reason": "access_expired"}`, `content-type: application/json`, `cache-control: no-store` |
| #90 "I checked", "ANSWERED", "from your table", "Settle by" in the JS | present | pass (2 / 1 / 1 / 2) |
| #90 "holds", "couldn't tell", "Where?", "Clear check", "YOU SAID" | present | pass (6 / 1 / 2 / 1 / 2) |
| #127 "Follow paused", "new on the board" | present | pass (1 / 1) |
| Earlier #127: "Follow coach", "Show as table", "Overview", `react-flow__attribution`, "Picked up where you left off" | present | pass (1 / 1 / 7 / 1 / 1) |
| Flags off in the bundle: Vite folds the constants away, so the gated copy is the check. `NEXT_TURN` "The coach's next turn uses your wording." (`CORRECTIONS_ENABLED`) and "Keep these words" (`GLOSSARY_ENABLED`) | 0 | pass (0 / 0) |
| `CORRECTIONS_ENABLED = false` and `GLOSSARY_ENABLED = false` in the deployed `chat` zip | present | pass (1 / 1 in `chat.mjs`) |
| Earlier features: "You connected", "Link undone." | present | pass |
| `board-demo-fixture`, `fixtureApi`, `COACH_FIXTURES`, `BOARD_DEMO` in the live HTML, JS and CSS | 0 | pass |
| `/dev/fixtureApi.ts`, `/src/shared/chatContract.ts`, `/server/chatCorrections.ts` served | 404 | pass |
| Deployed function sizes (`available_functions`) | `chat` slightly different, others equal | pass: `chat` 1,775,155 (+21, explained above), `health` 1,172,031, `session` 1,172,107, `unlock` 1,172,633 |

## Hosted checks

| Check | Expected | Result |
|---|---|---|
| `/` headers | nosniff, Referrer-Policy, CSP | pass (3 of 3) |
| `GET /api/chat` | 405 | pass |
| `GET /api/session` without a cookie | 401 `no-store` | pass |
| `GET /api/unlock` | 405 `Allow: POST`, `no-store` | pass |
| `/.env`, `/src/main.tsx`, `/server/config.ts`, `/server/healthHandler.ts`, `/netlify.toml` | 404 | pass |
| `sk-or` / `OPENROUTER` in the deployed HTML, JS and CSS | 0 | pass |
| `sk-or` in the `chat`, `health`, `session` and `unlock` zips | 0 | pass |
| `.env` or `.map` in the function zips; `.map` in `dist/`; the served `index-MMHo_oOD.js.map` | none; 404 | pass |
| Earlier features still bundled: "Copy for your RFC", "What's sent", "CC BY 4.0", "Where your text goes", "New conversation", `access_expired`, `guess-tag` | present | pass |
| CSS `url()`s are same-origin | all `/assets/…` | pass (49 of 49; 26 woff2, all 200) |
| `fonts.googleapis` / `fonts.gstatic` in the deployed HTML, CSS and JS | 0 | pass |

## Notes

- **The local `.env` key is still dead.** The free `GET /api/v1/key` check returned 401 "User not found." again. The prod secret is a different, working key: `/api/health` is `ok` before and after the deploy. Local paid runs need a new key in `.env`.
- **The chat zip diff also includes the `shortDay` refactor** (`309534e`), not only the moved limits. Both parts keep the same behaviour; see "Chat function zip diff".
- Function zips contain the string `OPENROUTER` 29 times (20 / 5 / 2 / 2), the same as last time. These are env var names, not values: `sk-or` is 0.
- No hosted chat call ran: no unlock and no paid call. The changes are covered by the acceptance tests in `bin/check.sh`. The verifier owns the demo.
- Other worktrees are still registered: `.claude/worktrees/fit-131` and another session's `…/b8b9f924…/scratchpad/wt90`, both at `309534e`. Neither is this deploy's, so both were left alone.
