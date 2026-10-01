# Deploy: the open question on the board (#97) (2026-09-30)

- Live commit: `06eefb8`. Built from a pinned detached worktree outside the repo (removed afterwards). The main tree's uncommitted v14 prompt work was not in the build.
- Site: `ddd-coach` (`40f5c583-82ea-47fa-b007-65f2cf19cac2`), https://ddd-coach.netlify.app
- Deploy: **`6abdcd7f29e3ae893e49e032`** (`ready`, `production`). It replaced `f2afe11` (deploy `6abd4c9c0522f0a35f0fc252`).
- Log: https://app.netlify.com/projects/ddd-coach/deploys/6abdcd7f29e3ae893e49e032
- Command: `npx netlify deploy --prod --site <id>` (Netlify CLI 27.9.0 from the worktree's `node_modules`), exit 0
- Live `/` serves `index-a13OQgii.js` and `index-D9SS5VDs.css` (before: `index-Cc9hE-05.js` and `index-Bw6gvyBA.css`). The hash matches the `06eefb8` worktree build, and both files are byte-identical to it. The live HTML differs from `dist/index.html` only by Netlify's injected "hosted on Netlify" comment.

Contents (#97, 4 commits since `f2afe11` plus 2 docs commits):
- Finds the events an open question joins by matching its source quotes to the paste lines event cards came from (at most two, never a guess).
- Shows the open question on the board as a pink `QUESTION` / `OPEN` hotspot card after the events, with dotted lines to each related event. Screen readers get "Open question: …, relates to …".
- Adds "· 1 open question" to the board header.
- Adds an "On the board ↖ linked to N events" chip on the pinned question. It pans to the hotspot and focuses it only when the visitor asks.
- Client-only. `server/`, `netlify/`, `netlify.toml`, `package.json`, `package-lock.json` and `vite.config.ts` are unchanged since `f2afe11` (empty `git diff`). All four function zips are byte-for-byte the same size as the last deploy.
- Unchanged: instructions are still v13, and `GLOSSARY_ENABLED` and `CORRECTIONS_ENABLED` are still `false`.

## Bundle size

| File | Last deploy (gz) | This deploy (gz) | Delta (gz) |
|---|---|---|---|
| index JS | 150,059 (`Cc9hE-05`, raw 472,702) | 150,811 (`a13OQgii`, raw 475,441) | +752 |
| index CSS | 9,421 (`Bw6gvyBA`, raw 53,514) | 9,481 (`D9SS5VDs`, raw 53,785) | +60 |

Both deploys were measured the same way: `gzip -9` on the served files.

## Pre-deploy

| Check | Result |
|---|---|
| `LIVE_INSTRUCTIONS_VERSION` and `COACH_INSTRUCTIONS_VERSION` at `06eefb8` | 13 and 13 |
| `GLOSSARY_ENABLED` and `CORRECTIONS_ENABLED` in `src/shared/features.ts` | `false` and `false` |
| Fixture plugin gated on `COACH_FIXTURES === "1"` in `vite.config.ts` | yes |
| `npm ci` + `bin/check.sh` in the worktree | pass on the first run |
| Shell had no `OPENROUTER_*` vars, so the paid smoke test was skipped | pass |
| `OPENROUTER_MODEL` starts with `openai/` | true |
| `OPENROUTER_MODEL` == `openai/gpt-5.6-terra` (production) | true |
| `OPENROUTER_REASONING_EFFORT` == `none` | true |
| `OPENROUTER_API_KEY`, `COACH_SIGNING_KEY`, `ACCESS_PASSWORD` | set |
| `COACH_TIMEOUT_MS`, `DDD_COACH_PROBE`, `GLOSSARY_ENABLED`, `CORRECTIONS_ENABLED`, `COACH_FIXTURES` env | absent |
| Free key check with the local `.env` key (`node --env-file=.env`, status only) | 401 "User not found." (see Notes) |
| Live `/api/health` before the deploy (checks the prod key) | 200 `ok` |
| Published deploy before this one | `6abd4c9c0522f0a35f0fc252`, serving the `f2afe11` assets |

Env was read with a filtered `env:list --json --context production` that prints booleans only. No env var was changed.

## After the deploy

| Check | Expected | Result |
|---|---|---|
| `GET /api/health` | 200 `{"ok":true,"status":"ok"}` | pass: 200 `{"ok":true,"status":"ok","detail":null}`, and the same again after the worktree was removed |
| `POST /api/health` | 405 | pass |
| `GET /data` | 200 | pass |
| `POST /api/chat` without a cookie | 401 JSON with `reason`, `no-store` | pass: 401 `{"error": string, "reason": "access_expired"}`, `content-type: application/json`, `cache-control: no-store` |
| #97 hotspot labels `` `QUESTION` `` and `` `OPEN` `` in the JS | present | pass (1 / 1). They are two spans (`card-kind`, `card-source`), the same markup as event cards, so the literal string "QUESTION · OPEN" is not in the bundle (0) |
| #97 header " · 1 open question" in the JS | present | pass (1) |
| #97 chip "On the board ↖" and "linked to ${…} event" in the JS | present | pass (1 / 1) |
| #97 screen-reader name "Open question: " / ", relates to " in the JS | present | pass (2 / 1) |
| #97 `hotspot-card` (JS and CSS), `on-the-board`, `relates-in`, `--color-card-question` `#ee9bb0` | present | pass |
| #124 copy "Picked up where you left off" and "isn't saving your session" | present | pass (1 / 1) |
| #5 copy and key: "This browser keeps your conversation", `ddd-coach.session.v1` | present | pass (2 / 1) |
| "The coach's next turn uses your wording." in the JS | 0 (flag off) | pass (0) |
| `CORRECTIONS_ENABLED = false` and `GLOSSARY_ENABLED = false` in the `chat` zip | present | pass (1 / 1) |
| Earlier features: "YOU SAID", "You connected", "Link undone.", "Already linked.", "Correction undone.", `react-flow__attribution` | present | pass |
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
| `.env` or `.map` in the function zips; `.map` in `dist/`; the served `index-a13OQgii.js.map` | none; 404 | pass |
| Earlier features still bundled: "Copy for your RFC", "What's sent", "CC BY 4.0", "Where your text goes", "New conversation", `access_expired`, `guess-tag` | present | pass |
| CSS `url()`s are same-origin | all `/assets/…` | pass (49 of 49; 26 woff2, all 200) |
| `fonts.googleapis` / `fonts.gstatic` in the deployed HTML, CSS and JS | 0 | pass |

## Notes

- **The local `.env` key is still dead.** The free `GET /api/v1/key` check returned 401 "User not found." again. The prod secret is a different, working key: `/api/health` is `ok` before and after the deploy. Local paid runs need a new key in `.env`.
- The function zips contain the string `OPENROUTER` 29 times (20 / 5 / 2 / 2). These are env var names, not values: `sk-or` is 0.
- `npm ci` printed npm's `install-scripts` notice (dependency install scripts not run until approved). `bin/check.sh` and the build passed regardless, and the served assets match the build.
- No hosted chat call ran: no unlock and no paid call. The hotspot, header count and chip are covered by the acceptance tests in `bin/check.sh`. The verifier owns the demo.
- Other sessions' worktrees (`…/b8b9f924…/scratchpad/wt97` at `06eefb8`, `.claude/worktrees/board-20`) are still registered. They aren't this deploy's worktrees, so they were left alone. No second deploy followed this one.
