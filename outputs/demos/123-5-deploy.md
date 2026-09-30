# Deploy: the YOU SAID card clamp and the correction line ring (#123), and the session kept across a reload (#5) (2026-09-30)

- Live commit: `0020aa7`. Built from a pinned detached worktree outside the repo (removed afterwards). The main tree's uncommitted v14 prompt work was not in the build.
- Site: `ddd-coach` (`40f5c583-82ea-47fa-b007-65f2cf19cac2`), https://ddd-coach.netlify.app
- Deploy: **`6abd442304e04f822700bd10`** (`ready`, `production`). It replaced `595ec6b` (deploy `6abd3cb5c02ec80e9c4365a3`).
- Log: https://app.netlify.com/projects/ddd-coach/deploys/6abd442304e04f822700bd10
- Command: `npx netlify deploy --prod --site <id>` (Netlify CLI 27.9.0 from the worktree's `node_modules`), exit 0
- Live `/` serves `index-XoPHuvhh.js` and `index-Cm1Eve9I.css` (before: `index-xU9koimZ.js` and `index-Cc84OeEe.css`). The hash matches the `0020aa7` worktree build, and both files are byte-identical to it. The live HTML differs from `dist/index.html` only by Netlify's injected "hosted on Netlify" comment.

Contents:
- #123: the visitor's words on a YOU SAID card clamp at the card's 4 lines; the coach's old words sit on one struck "was:" line that collapses to "was: …" but stays readable to screen readers. The correction log line rings in coach blue (dashed `--color-coach` border) for 3 s, then rests as a muted line.
- #5: the conversation and the board's corrections and links survive a reload in one versioned localStorage entry, `ddd-coach.session.v1`, that New conversation clears. A corrupt, other-version or invalid entry loads an empty session; storage that throws is ignored. A message still waiting at a reload comes back as a retryable failure ("The page reloaded before the coach answered."). The notice and `/data` now say this browser keeps the conversation and board until New conversation, and that word swaps stay until deleted, replacing "isn't saved".
- Client-only. `server/`, `netlify/`, `netlify.toml`, `package.json` and `package-lock.json` are unchanged since `595ec6b` (empty `git diff`); all four function zips are byte-for-byte the same size as the last deploy.
- Unchanged: instructions are still v13; `GLOSSARY_ENABLED` and `CORRECTIONS_ENABLED` are still `false`.

## Bundle size

| File | Last deploy (gz) | This deploy (gz) | Delta (gz) |
|---|---|---|---|
| index JS | 148,104 (`xU9koimZ`, raw 466,962) | 148,741 (`XoPHuvhh`, raw 469,179) | +637 |
| index CSS | 9,200 (`Cc84OeEe`, raw 52,074) | 9,260 (`Cm1Eve9I`, raw 52,495) | +60 |

Measured with `gzip -9` on the served files.

## Pre-deploy

| Check | Result |
|---|---|
| `LIVE_INSTRUCTIONS_VERSION` and `COACH_INSTRUCTIONS_VERSION` at `0020aa7` | 13 and 13 |
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

Env was read with a filtered `env:list --json --context production` that prints booleans only. No env var was changed.

## After the deploy

| Check | Expected | Result |
|---|---|---|
| `GET /api/health` | 200 `{"ok":true,"status":"ok"}` | pass: 200 `{"ok":true,"status":"ok","detail":null}`, and the same again after the worktree was removed |
| `POST /api/health` | 405 | pass |
| `GET /data` | 200 | pass |
| `POST /api/chat` without a cookie | 401 JSON with `reason`, `no-store` | pass: 401 `{"error": string, "reason": "access_expired"}`, `content-type: application/json`, `cache-control: no-store` |
| #5 copy in the JS: "This browser keeps your conversation" | present | pass (2: notice and `/data`) |
| "isn't saved" in the JS (straight, curly and `’` apostrophes) | 0 | pass (0 / 0 / 0) |
| #5 storage key `ddd-coach.session.v1` in the JS | present | pass (1) |
| #5 reload copy "The page reloaded before the coach answered." | present | pass (1) |
| #123 in the JS: "YOU SAID", "was:" | present | pass (1 / 4) |
| #123 in the CSS: `correction-line`, `line-rest` keyframes, `text-overflow:ellipsis`, `line-clamp`, `mask-image` | present | pass (2 / 3 / 2 / 4 / 2) |
| "The coach's next turn uses your wording." in the JS | 0 (flag off) | pass (0) |
| `CORRECTIONS_ENABLED = false` in the `chat` zip | present | pass |
| Earlier features: "You connected", "Link undone.", "Already linked.", "Board changes", "Correction undone.", `react-flow__attribution` | present | pass (1 each) |
| `board-demo-fixture`, `fixtureApi`, `COACH_FIXTURES`, `BOARD_DEMO` in the live HTML, JS and CSS, anywhere in `dist/`, and in the function zips | 0 | pass (0 everywhere) |
| `/dev/fixtureApi.ts` served | 404 | pass |
| "Keep these words" in the bundle | 0 | pass |
| Deployed function sizes match the last deploy (`available_functions`) | equal | pass: `chat` 1,775,134, `health` 1,172,031, `session` 1,172,107, `unlock` 1,172,633 |

## Hosted checks

| Check | Expected | Result |
|---|---|---|
| `/` headers | nosniff, Referrer-Policy, CSP | pass |
| `GET /api/chat` | 405 | pass |
| `GET /api/session` without a cookie | 401 `no-store` | pass |
| `GET /api/unlock` | 405 `Allow: POST`, `no-store` | pass |
| `/.env`, `/src/main.tsx`, `/server/config.ts`, `/server/healthHandler.ts`, `/server/chatCorrections.ts`, `/netlify.toml` | 404 | pass |
| `sk-or` / `OPENROUTER` in the deployed HTML, JS and CSS | 0 | pass |
| `sk-or` in the `chat`, `health`, `session` and `unlock` zips | 0 | pass |
| `.env` or `.map` in the function zips; `.map` in `dist/`; the served `index-XoPHuvhh.js.map` | none; 404 | pass |
| Earlier features still bundled: "Copy for your RFC", "What's sent", "CC BY 4.0", "Where your text goes", "New conversation", `access_expired`, `guess-tag` | present | pass |
| CSS `url()`s are same-origin | all `/assets/…` | pass (49 of 49; 26 woff2, all 200) |
| `fonts.googleapis` / `fonts.gstatic` in the deployed HTML, CSS and JS | 0 | pass |

## Notes

- **Local `.env` key is still dead.** The free `GET /api/v1/key` check returned 401 "User not found." for the local key, as in the #96 deploy. The prod secret is a different, working key: `/api/health` is `ok` before and after the deploy. Local paid runs need a new key in `.env`.
- `npm ci` printed npm's `install-scripts` notice (dependency install scripts not run until approved). `bin/check.sh` and the build passed regardless, and the served assets match the build.
- No hosted chat call ran: no unlock and no paid call. Persistence across a reload is covered by the acceptance tests in `bin/check.sh`; the verifier owns the demo.
- Other sessions' worktrees (`…/b8b9f924…/scratchpad/wt5`, `.claude/worktrees/words-123`) are still registered. They aren't this deploy's worktrees, so they were left alone.
