# Deploy: board navigation (#20) and question-on-board polish (#126) (2026-09-30)

- Live commit: `1e54711`. Built from a pinned detached worktree outside the repo (removed afterwards). The main tree's uncommitted v14 prompt work was not in the build.
- Site: `ddd-coach` (`40f5c583-82ea-47fa-b007-65f2cf19cac2`), https://ddd-coach.netlify.app
- Deploy: **`6abdd45ef5b29066637ad33c`** (`ready`, `production`). It replaced `06eefb8` (deploy `6abdcd7f29e3ae893e49e032`).
- Log: https://app.netlify.com/projects/ddd-coach/deploys/6abdd45ef5b29066637ad33c
- Command: `npx netlify deploy --prod --site <id>` (Netlify CLI 27.9.0 from the worktree's `node_modules`), exit 0
- Live `/` serves `index-CEukOFiZ.js` and `index-BlQ_mUeK.css` (before: `index-a13OQgii.js` and `index-D9SS5VDs.css`). The hash matches the `1e54711` worktree build, and both files are byte-identical to it. The live HTML differs from `dist/index.html` only by Netlify's injected "hosted on Netlify" comment.

Contents (10 commits since `06eefb8`, plus 3 docs commits):
- #20 board navigation:
  - The board no longer pans when the coach adds. A "Follow coach" toggle is on until the visitor first touches the board, then off and kept in the session. Sessions saved before the toggle existed come back not following if the visitor had already edited or moved the board.
  - Edge chips ("Show the N earlier / later …") page to cards past each edge. Edges fade, and the board gets zoom − / level / + , Fit and a board overview (MiniMap). Panning is locked to the row.
  - Cards and the open question can be dragged. Their positions are kept across coach updates and reloads as moves in the visitor log, compacted to the last move per card. Undo skips moves.
  - Keyboard: arrows walk the cards, Shift + arrow nudges, Enter corrects, Esc leaves. Every card's screen-reader description includes the key hint, and Escape goes to the message box by its id.
- #126:
  - Selecting a card pans just enough to show it and its note in full.
  - The hotspot and the pinned chip say "N quote(s) not on the board" and show the quote on request.
  - The "On the board ↖" chip sits inside the pinned question card.
- Client-only. `server/`, `netlify/`, `netlify.toml`, `package.json`, `package-lock.json` and `vite.config.ts` are unchanged since `06eefb8` (empty `git diff`). All four deployed function sizes equal the last deploy's.
- Unchanged: instructions are still v13, and `GLOSSARY_ENABLED` and `CORRECTIONS_ENABLED` are still `false`.

## Bundle size

| File | Last deploy (gz) | This deploy (gz) | Delta (gz) |
|---|---|---|---|
| index JS | 150,821 (`a13OQgii`, raw 475,441) | 153,166 (`CEukOFiZ`, raw 482,698) | +2,345 |
| index CSS | 9,491 (`D9SS5VDs`, raw 53,785) | 9,817 (`BlQ_mUeK`, raw 55,836) | +326 |

Both were measured the same way today: `gzip -9` on the served files. The last deploy's figures differ by about 10 bytes from `97-deploy.md`, which used a different gzip run.

## Pre-deploy

| Check | Result |
|---|---|
| `LIVE_INSTRUCTIONS_VERSION` and `COACH_INSTRUCTIONS_VERSION` at `1e54711` | 13 and 13 |
| `GLOSSARY_ENABLED` and `CORRECTIONS_ENABLED` in `src/shared/features.ts` | `false` and `false` |
| Fixture plugin gated on `COACH_FIXTURES === "1"` in `vite.config.ts` | yes |
| `npm ci` + `bin/check.sh` in the worktree | pass on the first run (the known flaky `boardLinks.test.tsx` did not fail) |
| Shell had no `OPENROUTER_*` vars, so the paid smoke test was skipped | pass |
| `OPENROUTER_MODEL` starts with `openai/` | true |
| `OPENROUTER_MODEL` == `openai/gpt-5.6-terra` (production) | true |
| `OPENROUTER_REASONING_EFFORT` == `none` | true |
| `OPENROUTER_API_KEY`, `COACH_SIGNING_KEY`, `ACCESS_PASSWORD` | set |
| `COACH_TIMEOUT_MS`, `DDD_COACH_PROBE`, `GLOSSARY_ENABLED`, `CORRECTIONS_ENABLED`, `COACH_FIXTURES` env | absent |
| Free key check with the local `.env` key (`node --env-file=.env`, status only) | 401 "User not found." (see Notes) |
| Live `/api/health` before the deploy (checks the prod key) | 200 `ok` |
| Published deploy before this one | `6abdcd7f29e3ae893e49e032`, serving the `06eefb8` assets |

Env was read with a filtered `env:list --json --context production` that prints booleans only. No env var was changed.

## After the deploy

| Check | Expected | Result |
|---|---|---|
| `GET /api/health` | 200 `{"ok":true,"status":"ok"}` | pass: 200 `{"ok":true,"status":"ok","detail":null}`, and the same again after the worktree was removed |
| `POST /api/health` | 405 | pass |
| `GET /data` | 200 | pass |
| `POST /api/chat` without a cookie | 401 JSON with `reason`, `no-store` | pass: 401 `{"error": string, "reason": "access_expired"}`, `content-type: application/json`, `cache-control: no-store` |
| #20 "Follow coach" in the JS | present | pass (1) |
| #20 "Board overview" and `react-flow__minimap` in the JS | present | pass (1 / 5) |
| #20 edge chips `edge-chip earlier` / `edge-chip later` and "Show the " in the JS | present | pass (1 / 1 / 3) |
| #20 key hint "← → move between cards · Shift + arrows nudge · Enter corrects · Esc leaves" in the JS | present | pass (1) |
| #126 " not on the board" in the JS | present | pass (1) |
| #97 "On the board ↖", "Open question: ", " · 1 open question" | present | pass (1 / 1 / 1) |
| React Flow attribution `react-flow__attribution` | present | pass (1) |
| #124 / #5 "Picked up where you left off", `ddd-coach.session.v1` | present | pass (1 / 1) |
| "The coach's next turn uses your wording." in the JS | 0 (flag off) | pass (0) |
| `CORRECTIONS_ENABLED = false` and `GLOSSARY_ENABLED = false` in the `chat` zip | present | pass (1 / 1) |
| Earlier features: "YOU SAID", "You connected", "Link undone." | present | pass |
| `board-demo-fixture`, `fixtureApi`, `COACH_FIXTURES`, `BOARD_DEMO` in the live HTML, JS and CSS, anywhere in `dist/`, and in the function zips | 0 | pass (0 everywhere) |
| `/dev/fixtureApi.ts`, `/src/ui/QuestionNode.tsx` served | 404 | pass |
| "Keep these words" in the bundle | 0 | pass |
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
| `.env` or `.map` in the function zips; `.map` in `dist/`; the served `index-CEukOFiZ.js.map` | none; 404 | pass |
| Earlier features still bundled: "Copy for your RFC", "What's sent", "CC BY 4.0", "Where your text goes", "New conversation", `access_expired`, `guess-tag` | present | pass |
| CSS `url()`s are same-origin | all `/assets/…` | pass (49 of 49; 26 woff2, all 200) |
| `fonts.googleapis` / `fonts.gstatic` in the deployed HTML, CSS and JS | 0 | pass |

## Notes

- **The local `.env` key is still dead.** The free `GET /api/v1/key` check returned 401 "User not found." again. The prod secret is a different, working key: `/api/health` is `ok` before and after the deploy. Local paid runs need a new key in `.env`.
- The function zips contain the string `OPENROUTER` 29 times (20 / 5 / 2 / 2). These are env var names, not values: `sk-or` is 0.
- `npm ci` printed npm's `install-scripts` notice (dependency install scripts not run until approved). `bin/check.sh` and the build passed regardless, and the served assets match the build.
- No hosted chat call ran: no unlock and no paid call. The new board behaviour is covered by the acceptance tests in `bin/check.sh`. The verifier owns the demo.
- Other sessions' worktrees (`…/b8b9f924…/scratchpad/wt20` at `1e54711`, `.claude/worktrees/agent-a65c842fa3fe5a080`) are still registered. They aren't this deploy's worktrees, so they were left alone. No second deploy followed this one.
