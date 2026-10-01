# Deploy: board accessibility (#127) and the Words lane hotfix (#109) (2026-10-01)

- Live commit: `b7ce5b6`. Built from a pinned detached worktree outside the repo, removed afterwards. The main tree's uncommitted v14 prompt work was not in the build.
- GitHub CI (`ci.yml`) for `b7ce5b6`: run `36814083146`, `success`, confirmed before the deploy.
- Site: `ddd-coach` (`40f5c583-82ea-47fa-b007-65f2cf19cac2`), https://ddd-coach.netlify.app
- Deploy: **`6abdde63a5c298c957f07052`** (`ready`, `production`). It replaced `a659a0e` (deploy `6abdd8f545a0d5a5bf245b48`).
- Log: https://app.netlify.com/projects/ddd-coach/deploys/6abdde63a5c298c957f07052
- Command: `npx netlify deploy --prod --site <id>` (Netlify CLI 27.9.0 from the worktree's `node_modules`). It printed "Deploy is live!"
- Live `/` serves `index-BXlphHWL.js` and `index-DYwa6RLm.css` (before: `index-BSh3930S.js` and `index-X36P_Ap3.css`). The hash matches the `b7ce5b6` worktree build, and both files are byte-identical to it. The live HTML differs from `dist/index.html` only by Netlify's injected "hosted on Netlify" comment.

Contents (11 commits since `a659a0e`, all feat; plus 3 docs commits):
- #127, board accessibility and navigation:
  - The board is one Tab stop. A roving focus moves across events, the open question and term cards. Arrows move along a lane and up or down between lanes, and Escape goes to the board's controls. The open question's quote button stays out of the Tab order until the question holds focus.
  - Follow coach is a switch: coach blue with the knob on the right when on, neutral when off.
  - The keys hint shows only when the visitor first reaches the board from the keyboard. This browser remembers that it has been seen.
  - A selected or paged-to card stays 120 px clear of the board's edges, so an edge chip never covers it.
  - A reply with words but no events shows the board with its Words lane, and term-card moves are kept there too.
- #109 hotfix:
  - The board scrolls down to the Words lane at 100% zoom, and a card the visitor moves to comes into view above the controls.
  - A term row's source line comes only from its own team's lines. It shows no line when the team has none.
  - The open question's quotes link to the term rows they come from with a dotted line, so a quote that is on the board as a term row is never called "not on the board" (#97).
  - A term card's JUST ADDED tag sits above the card with its ring, as on event cards.
  - The dotted line ends on the side of a term row that faces the question.
- Client-only. `server/`, `netlify/`, `netlify.toml`, `package.json`, `package-lock.json` and `vite.config.ts` are unchanged since `a659a0e` (empty `git diff`). All four deployed function sizes equal the last deploy's.
- Unchanged: instructions are still v13, and `GLOSSARY_ENABLED` and `CORRECTIONS_ENABLED` are still `false`.

## Bundle size

| File | Last deploy (gz) | This deploy (gz) | Delta (gz) |
|---|---|---|---|
| index JS | 154,200 (`BSh3930S`, raw 486,099) | 155,380 (`BXlphHWL`, raw 489,577) | +1,180 |
| index CSS | 10,001 (`X36P_Ap3`, raw 57,015) | 10,152 (`DYwa6RLm`, raw 57,888) | +151 |

Both were measured with `gzip -9` on the served files.

## Pre-deploy

| Check | Result |
|---|---|
| GitHub CI `ci.yml` run for `b7ce5b6` | `success` (`36814083146`). It was in progress at first, and the deploy waited for it |
| `LIVE_INSTRUCTIONS_VERSION` and `COACH_INSTRUCTIONS_VERSION` at `b7ce5b6` | 13 and 13 |
| `GLOSSARY_ENABLED` and `CORRECTIONS_ENABLED` in `src/shared/features.ts` | `false` and `false` |
| Fixture plugin gated on `COACH_FIXTURES === "1"` in `vite.config.ts` | yes |
| `git diff a659a0e b7ce5b6` on `server/`, `netlify/`, `netlify.toml`, `package*.json`, `vite.config.ts` | empty |
| `npm ci` + `bin/check.sh` in the worktree | pass on the first run |
| Shell had no `OPENROUTER_*` vars, so the paid smoke test was skipped | pass |
| `OPENROUTER_MODEL` starts with `openai/` | true |
| `OPENROUTER_MODEL` == `openai/gpt-5.6-terra` (production) | true |
| `OPENROUTER_REASONING_EFFORT` == `none` | true |
| `OPENROUTER_API_KEY`, `COACH_SIGNING_KEY`, `ACCESS_PASSWORD` | set |
| `COACH_TIMEOUT_MS`, `DDD_COACH_PROBE`, `GLOSSARY_ENABLED`, `CORRECTIONS_ENABLED`, `COACH_FIXTURES` env | absent |
| Free key check with the local `.env` key (`node --env-file=.env`, status only) | 401 "User not found." (see Notes) |
| Live `/api/health` before the deploy (checks the prod key) | 200 `ok` |
| Published deploy before this one | `6abdd8f545a0d5a5bf245b48`, serving the `a659a0e` assets |

Env was read with a filtered `env:list --json --context production` that prints booleans only. No env var was changed.

## After the deploy

| Check | Expected | Result |
|---|---|---|
| `GET /api/health` | 200 `{"ok":true,"status":"ok"}` | pass: 200 `{"ok":true,"status":"ok","detail":null}`, and the same again after the worktree was removed |
| `POST /api/health` | 405 | pass |
| `GET /data` | 200 | pass |
| `POST /api/chat` without a cookie | 401 JSON with `reason`, `no-store` | pass: 401 `{"error": string, "reason": "access_expired"}`, `content-type: application/json`, `cache-control: no-store` |
| #109 " term row" header summary in the JS | present | pass (1) |
| #127 "Follow coach" in the JS, and its `switch-knob` in the JS and the CSS | present | pass (1; 1 / 3) |
| #20 "Board overview" | present | pass (1) |
| #109 `board-words`, "Words · " and `term-card` (JS / CSS) | present | pass (1 / 1 / 3) |
| #109 tags "FROM THREAD", "GUESS" and "JUST ADDED" in the JS | present | pass (2 / 3 / 3) |
| #109 "No line in your paste matches closely." and "The coach's guess: no line in your paste says this." | present | pass (2 / 2) |
| #126 " not on the board" and "On the board ↖" | present | pass (1 / 1) |
| #124 / #5 "Picked up where you left off" and `ddd-coach.session.v1` | present | pass (1 / 1) |
| React Flow attribution `react-flow__attribution` | present | pass (1) |
| "The coach's next turn uses your wording." in the JS | 0 (flag off) | pass (0) |
| "Keep these words" in the bundle | 0 | pass (0) |
| `CORRECTIONS_ENABLED = false` and `GLOSSARY_ENABLED = false` in the `chat` zip | present | pass (1 / 1) |
| Earlier features: "YOU SAID", "You connected", "Link undone." | present | pass |
| `board-demo-fixture`, `fixtureApi`, `COACH_FIXTURES`, `BOARD_DEMO` in the live HTML, JS and CSS, and anywhere in `dist/` | 0 | pass (0 everywhere) |
| `/dev/fixtureApi.ts`, `/src/ui/TermNode.tsx`, `/src/domain/words.ts`, `/src/ui/boardFocus.ts` served | 404 | pass |
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
| `.env` or `.map` in the function zips; `.map` in `dist/`; the served `index-BXlphHWL.js.map` | none; 404 | pass |
| Earlier features still bundled: "Copy for your RFC", "What's sent", "CC BY 4.0", "Where your text goes", "New conversation", `access_expired`, `guess-tag` | present | pass |
| CSS `url()`s are same-origin | all `/assets/…` | pass (49 of 49; 26 woff2, all 200) |
| `fonts.googleapis` / `fonts.gstatic` in the deployed HTML, CSS and JS | 0 | pass |

## Notes

- **The local `.env` key is still dead.** The free `GET /api/v1/key` check returned 401 "User not found." again. The prod secret is a different, working key: `/api/health` is `ok` before and after the deploy. Local paid runs need a new key in `.env`.
- The function zips contain the string `OPENROUTER` 29 times (20 / 5 / 2 / 2). These are env var names, not values: `sk-or` is 0.
- Follow coach is a toggle button with `aria-pressed` and a `switch-knob` span, not `role="switch"`. The bundle check matched the knob class.
- `npm ci` printed npm's `install-scripts` notice (dependency install scripts not run until approved). `bin/check.sh` and the build passed regardless, and the served assets match the build.
- No hosted chat call ran: no unlock and no paid call. The #127 and #109 changes are covered by the acceptance tests in `bin/check.sh`. The verifier owns the demo.
- Other worktrees are still registered: another session's `…/b8b9f924…/scratchpad/wt127` at `b7ce5b6` (detached) and `.claude/worktrees/nav-127`. Neither is this deploy's worktree, so both were left alone. While this report was written, the published deploy was still `6abdde63`.
