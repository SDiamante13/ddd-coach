# Deploy: board polish and restore behaviour (#124) (2026-09-30)

- Live commit: `f2afe11`. Built from a pinned detached worktree outside the repo (removed afterwards). The main tree's uncommitted v14 prompt work was not in the build.
- Site: `ddd-coach` (`40f5c583-82ea-47fa-b007-65f2cf19cac2`), https://ddd-coach.netlify.app
- Deploy: **`6abd4c9c0522f0a35f0fc252`** (`ready`, `production`). It replaced `0020aa7` (deploy `6abd442304e04f822700bd10`).
- Log: https://app.netlify.com/projects/ddd-coach/deploys/6abd4c9c0522f0a35f0fc252
- Command: `npx netlify deploy --prod --site <id>` (Netlify CLI 27.9.0 from the worktree's `node_modules`), exit 0
- Live `/` serves `index-Cc9hE-05.js` and `index-Bw6gvyBA.css` (before: `index-XoPHuvhh.js` and `index-Cm1Eve9I.css`). The hash matches the `f2afe11` worktree build, and both files are byte-identical to it. The live HTML differs from `dist/index.html` only by Netlify's injected "hosted on Netlify" comment.

Contents (#124, 20 commits since `0020aa7`):
- Live-region clearing, link-handle placement, note flip, log-title clamp, and link stacking on the board.
- The "N new ▸" chip ("N new ▸", "N updated ▸", "N new · M updated ▸", labelled "Show the … events"), with no auto-pan after visitor actions.
- Restore at rest with "Picked up where you left off · <date>, <time>", plus viewport restore.
- A storage-blocked line: "This browser isn't saving your session, so a reload will lose the conversation and board."
- A visitor's links are drawn in ink at rest. Coach blue appears only while a link is Just drawn.
- Client-only. `server/`, `netlify/`, `netlify.toml`, `package.json` and `package-lock.json` are unchanged since `0020aa7` (empty `git diff`). All four function zips are byte-for-byte the same size as the last deploy.
- Unchanged: instructions are still v13, and `GLOSSARY_ENABLED` and `CORRECTIONS_ENABLED` are still `false`.

## Bundle size

| File | Last deploy (gz) | This deploy (gz) | Delta (gz) |
|---|---|---|---|
| index JS | 148,730 (`XoPHuvhh`, raw 469,179) | 150,059 (`Cc9hE-05`, raw 472,702) | +1,329 |
| index CSS | 9,249 (`Cm1Eve9I`, raw 52,495) | 9,421 (`Bw6gvyBA`, raw 53,514) | +172 |

Both deploys were measured the same way this time: `gzip -9` on the served files. The last deploy's figures differ by about 11 bytes from the #123/#5 report because of the gzip build on this machine.

## Pre-deploy

| Check | Result |
|---|---|
| `LIVE_INSTRUCTIONS_VERSION` and `COACH_INSTRUCTIONS_VERSION` at `f2afe11` | 13 and 13 |
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
| Published deploy before this one | `6abd442304e04f822700bd10`, serving the `0020aa7` assets |

Env was read with a filtered `env:list --json --context production` that prints booleans only. No env var was changed.

## After the deploy

| Check | Expected | Result |
|---|---|---|
| `GET /api/health` | 200 `{"ok":true,"status":"ok"}` | pass: 200 `{"ok":true,"status":"ok","detail":null}`, and the same again after the worktree was removed |
| `POST /api/health` | 405 | pass |
| `GET /data` | 200 | pass |
| `POST /api/chat` without a cookie | 401 JSON with `reason`, `no-store` | pass: 401 `{"error": string, "reason": "access_expired"}`, `content-type: application/json`, `cache-control: no-store` |
| #124 restore copy "Picked up where you left off" in the JS | present | pass (1) |
| #124 storage-blocked copy "isn't saving your session" / "a reload will lose the conversation and board" | present | pass (1 / 1) |
| #124 chip: `` `${…join(` · `)} ▸` `` and "Show the " in the JS | present | pass (1 / 1) |
| #124 classes in the CSS: `new-events-chip`, `not-saving`, `picked-up`, `just-drawn`, `link-edge`, `card-note` | present | pass (2 / 1 / 4 / 3 / 2 / 7) |
| #5 copy and key: "This browser keeps your conversation", `ddd-coach.session.v1`, "The page reloaded before the coach answered." | present | pass (2 / 1 / 1) |
| "The coach's next turn uses your wording." in the JS | 0 (flag off) | pass (0) |
| `CORRECTIONS_ENABLED = false` and `GLOSSARY_ENABLED = false` in the `chat` zip | present | pass (1 / 1) |
| Earlier features: "YOU SAID", "You connected", "Link undone.", "Already linked.", "Correction undone.", `react-flow__attribution` | present | pass (1 each) |
| `board-demo-fixture`, `fixtureApi`, `COACH_FIXTURES`, `BOARD_DEMO` in the live HTML, JS and CSS, anywhere in `dist/`, and in the function zips | 0 | pass (0 everywhere) |
| `/dev/fixtureApi.ts` served | 404 | pass |
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
| `.env` or `.map` in the function zips; `.map` in `dist/`; the served `index-Cc9hE-05.js.map` | none; 404 | pass |
| Earlier features still bundled: "Copy for your RFC", "What's sent", "CC BY 4.0", "Where your text goes", "New conversation", `access_expired`, `guess-tag` | present | pass |
| CSS `url()`s are same-origin | all `/assets/…` | pass (49 of 49; 26 woff2, all 200) |
| `fonts.googleapis` / `fonts.gstatic` in the deployed HTML, CSS and JS | 0 | pass |

## Notes

- **The local `.env` key is still dead.** The free `GET /api/v1/key` check returned 401 "User not found." again. The prod secret is a different, working key: `/api/health` is `ok` before and after the deploy. Local paid runs need a new key in `.env`.
- The function zips contain the string `OPENROUTER` 29 times. These are env var names the server reads (`process.env.OPENROUTER_*`), not values: `sk-or` is 0. The zips are the same size as in the last deploy.
- `npm ci` printed npm's `install-scripts` notice (dependency install scripts not run until approved). `bin/check.sh` and the build passed regardless, and the served assets match the build.
- No hosted chat call ran: no unlock and no paid call. The restore, chip and storage-blocked behaviour is covered by the acceptance tests in `bin/check.sh`. The verifier owns the demo.
- Other sessions' worktrees (`…/b8b9f924…/scratchpad/wt124`, `.claude/worktrees/question-97`) are still registered. They aren't this deploy's worktrees, so they were left alone.
