# Deploy: board keys hint follow-up (#127) (2026-10-01)

- Live commit: `8d0f94e`. Built from a pinned detached worktree outside the repo, removed afterwards. The main tree's uncommitted v14 prompt work was not in the build.
- GitHub CI (`ci.yml`) for `8d0f94e`: run `36814841818`, `success`, confirmed before the deploy.
- Site: `ddd-coach` (`40f5c583-82ea-47fa-b007-65f2cf19cac2`), https://ddd-coach.netlify.app
- Deploy: **`6abde091c509b3b6d395326e`** (`ready`, `production`). It replaced `b7ce5b6` (deploy `6abdde63a5c298c957f07052`).
- Log: https://app.netlify.com/projects/ddd-coach/deploys/6abde091c509b3b6d395326e
- Command: `npx netlify deploy --prod --site <id>` (Netlify CLI 27.9.0 from the worktree's `node_modules`).
- Live `/` serves `index-BbCaeP_4.js` and `index-DYwa6RLm.css` (before: `index-BXlphHWL.js` and `index-DYwa6RLm.css`). The hash matches the `8d0f94e` worktree build, and both files are byte-identical to it. The live HTML differs from `dist/index.html` only by Netlify's injected "hosted on Netlify" comment.

Contents (2 commits since `b7ce5b6`; plus 1 docs commit):
- #127 feat: the board keys hint reads "← → along a row · ↑ ↓ between rows · Shift + arrows nudge · Enter corrects · Esc to the controls", shown and read through `aria-describedby`. It replaces "← → move between cards · … · Esc leaves".
- #127 test: the acceptance tests wait for React Flow transforms, z-order, restored rows and log lines to settle, so they can't flake under CI load. Test-only.
- Client-only. `server/`, `netlify/`, `netlify.toml`, `package.json`, `package-lock.json` and `vite.config.ts` are unchanged since `b7ce5b6` (empty `git diff`). All four deployed function sizes equal the last deploy's.
- Unchanged: instructions are still v13, and `GLOSSARY_ENABLED` and `CORRECTIONS_ENABLED` are still `false`.

## Bundle size

| File | Last deploy (gz) | This deploy (gz) | Delta (gz) |
|---|---|---|---|
| index JS | 155,380 (`BXlphHWL`, raw 489,577) | 155,394 (`BbCaeP_4`, raw 489,629) | +14 |
| index CSS | 10,152 (`DYwa6RLm`, raw 57,888) | 10,152 (`DYwa6RLm`, same file) | 0 |

Both were measured with `gzip -9` on the served files.

## Pre-deploy

| Check | Result |
|---|---|
| GitHub CI `ci.yml` run for `8d0f94e` | `success` (`36814841818`). It was in progress at first, and the deploy waited for it |
| `LIVE_INSTRUCTIONS_VERSION` and `COACH_INSTRUCTIONS_VERSION` at `8d0f94e` | 13 and 13 |
| `GLOSSARY_ENABLED` and `CORRECTIONS_ENABLED` in `src/shared/features.ts` | `false` and `false` |
| Fixture plugin gated on `COACH_FIXTURES === "1"` in `vite.config.ts` | yes |
| `git diff b7ce5b6 8d0f94e` on `server/`, `netlify/`, `netlify.toml`, `package*.json`, `vite.config.ts` | empty |
| `npm ci` + `bin/check.sh` in the worktree | pass on the first run |
| Shell had no `OPENROUTER_*` vars, so the paid smoke test was skipped | pass |
| `OPENROUTER_MODEL` starts with `openai/` | true |
| `OPENROUTER_MODEL` == `openai/gpt-5.6-terra` (production) | true |
| `OPENROUTER_REASONING_EFFORT` == `none` | true |
| `OPENROUTER_API_KEY`, `COACH_SIGNING_KEY`, `ACCESS_PASSWORD` | set |
| `COACH_TIMEOUT_MS`, `DDD_COACH_PROBE`, `GLOSSARY_ENABLED`, `CORRECTIONS_ENABLED`, `COACH_FIXTURES` env | absent |
| Free key check with the local `.env` key (`node --env-file=.env`, status only) | 401 "User not found." (see Notes) |
| Live `/api/health` before the deploy (checks the prod key) | 200 `ok` |
| Published deploy before this one | `6abdde63a5c298c957f07052`, serving the `b7ce5b6` assets |

Env was read with a filtered `env:list --json --context production` that prints booleans only. No env var was changed.

## After the deploy

| Check | Expected | Result |
|---|---|---|
| `GET /api/health` | 200 `{"ok":true,"status":"ok"}` | pass: 200 `{"ok":true,"status":"ok","detail":null}`, and the same again after the worktree was removed |
| `POST /api/health` | 405 | pass |
| `GET /data` | 200 | pass |
| `POST /api/chat` without a cookie | 401 JSON with `reason`, `no-store` | pass: 401 `{"error": string, "reason": "access_expired"}`, `content-type: application/json`, `cache-control: no-store` |
| #127 "between rows", "along a row", "Esc to the controls" in the JS | present | pass (2 / 2 / 2) |
| #127 old hint "Esc leaves" in the JS | 0 | pass (0) |
| #127 `board-keys` (the `aria-describedby` id) | present | pass (1) |
| #127 "Follow coach", #20 "Board overview" | present | pass (1 / 1) |
| #109 " term row", `board-words`, `term-card`, "JUST ADDED" | present | pass (1 / 1 / 1 / 3) |
| #126 " not on the board", #124 "Picked up where you left off" | present | pass (1 / 1) |
| React Flow attribution `react-flow__attribution` | present | pass (1) |
| "The coach's next turn uses your wording." in the JS | 0 (flag off) | pass (0) |
| "Keep these words" in the bundle | 0 | pass (0) |
| `CORRECTIONS_ENABLED = false` and `GLOSSARY_ENABLED = false` in the `chat` zip | present | pass (1 / 1) |
| Earlier features: "YOU SAID", "You connected", "Link undone." | present | pass |
| `board-demo-fixture`, `fixtureApi`, `COACH_FIXTURES`, `BOARD_DEMO` in the live HTML, JS and CSS, and anywhere in `dist/` | 0 | pass (0 everywhere) |
| `/dev/fixtureApi.ts`, `/src/ui/BoardHint.tsx`, `/src/ui/boardFocus.ts` served | 404 | pass |
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
| `.env` or `.map` in the function zips; `.map` in `dist/`; the served `index-BbCaeP_4.js.map` | none; 404 | pass |
| Earlier features still bundled: "Copy for your RFC", "What's sent", "CC BY 4.0", "Where your text goes", "New conversation", `access_expired`, `guess-tag` | present | pass |
| CSS `url()`s are same-origin | all `/assets/…` | pass (49 of 49; 26 woff2, all 200) |
| `fonts.googleapis` / `fonts.gstatic` in the deployed HTML, CSS and JS | 0 | pass |

## Notes

- **The local `.env` key is still dead.** The free `GET /api/v1/key` check returned 401 "User not found." again. The prod secret is a different, working key: `/api/health` is `ok` before and after the deploy. Local paid runs need a new key in `.env`.
- The function zips contain the string `OPENROUTER` 29 times (20 / 5 / 2 / 2). These are env var names, not values: `sk-or` is 0.
- The new hint strings appear twice each in the JS: the `BOARD_KEYS_HINT` constant (the `aria-describedby` text) and the visible `aria-hidden` hint's children. The old "Esc leaves" is gone.
- `npm ci` printed npm's `install-scripts` notice (dependency install scripts not run until approved). `bin/check.sh` and the build passed regardless, and the served assets match the build.
- The first header and font checks miscounted (a regex that expected `:` after the value, and zsh not word-splitting an unquoted variable). Rerun per header and per woff2: 3 of 3 headers, 26 of 26 fonts 200.
- `main` moved to `1467c2a` during the deploy, a docs-only commit (#127/#109 demo report). It is not in this build.
- No hosted chat call ran: no unlock and no paid call. The hint change is covered by the acceptance tests in `bin/check.sh`. The verifier owns the demo.
- Other worktrees are still registered: another session's `…/89a0dacb…/scratchpad/gate-127b` at `5c18230` (detached) and `.claude/worktrees/nav-127`. Neither is this deploy's worktree, so both were left alone. While this report was written, the published deploy was still `6abde091`.
