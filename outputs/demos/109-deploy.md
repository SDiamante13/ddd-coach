# Deploy: Words lane v0 (#109) (2026-09-30)

- Live commit: `a659a0e`. Built from a pinned detached worktree outside the repo, removed afterwards. The main tree's uncommitted v14 prompt work was not in the build.
- GitHub CI (`ci.yml`) for `a659a0e`: run `36812352122`, `success`, confirmed before the deploy.
- Site: `ddd-coach` (`40f5c583-82ea-47fa-b007-65f2cf19cac2`), https://ddd-coach.netlify.app
- Deploy: **`6abdd8f545a0d5a5bf245b48`** (`ready`, `production`). It replaced `1e54711` (deploy `6abdd45ef5b29066637ad33c`).
- Log: https://app.netlify.com/projects/ddd-coach/deploys/6abdd8f545a0d5a5bf245b48
- Command: `npx netlify deploy --prod --site <id>` (Netlify CLI 27.9.0 from the worktree's `node_modules`), exit 0
- Live `/` serves `index-BSh3930S.js` and `index-X36P_Ap3.css` (before: `index-CEukOFiZ.js` and `index-BlQ_mUeK.css`). The hash matches the `a659a0e` worktree build, and both files are byte-identical to it. The live HTML differs from `dist/index.html` only by Netlify's injected "hosted on Netlify" comment.

Contents (7 commits since `1e54711`: 3 feat, 3 test, 1 CI build; plus 2 docs commits):
- #109 v0, the Words lane:
  - Each reply's "Words that don't match" table becomes term cards: one card per word, with a row per team keyed like the glossary. Each row has a FROM THREAD or GUESS tag and its source line from the paste.
  - The cards sit in a Words lane under the events. Matching happens in swapped space, and the cards show real names. The header counts them ("Words · N terms · N rows"), and the new-events chip leaves them out.
  - Term cards can be dragged and nudged with Shift + arrow. Their positions are kept like events.
  - This is separate from `GLOSSARY_ENABLED`, which stays `false`.
- Test hardening: the #124 viewport restore tests wait for the restored pan and zoom, the #20 link tests wait for the YOU SAID card, and #126 pins the pinned question card's reading order.
- #40: CI runs `bin/check.sh` on every push and pull request to `main`. It doesn't touch the deployed site.
- Client-only. `server/`, `netlify/`, `netlify.toml`, `package.json`, `package-lock.json` and `vite.config.ts` are unchanged since `1e54711` (empty `git diff`). All four deployed function sizes equal the last deploy's.
- Unchanged: instructions are still v13, and `GLOSSARY_ENABLED` and `CORRECTIONS_ENABLED` are still `false`.

## Bundle size

| File | Last deploy (gz) | This deploy (gz) | Delta (gz) |
|---|---|---|---|
| index JS | 153,166 (`CEukOFiZ`, raw 482,698) | 154,200 (`BSh3930S`, raw 486,099) | +1,034 |
| index CSS | 9,817 (`BlQ_mUeK`, raw 55,836) | 10,001 (`X36P_Ap3`, raw 57,015) | +184 |

Both were measured with `gzip -9` on the served files.

## Pre-deploy

| Check | Result |
|---|---|
| GitHub CI `ci.yml` run for `a659a0e` | `success` (`36812352122`). It was in progress at first, and the deploy waited for it |
| `LIVE_INSTRUCTIONS_VERSION` and `COACH_INSTRUCTIONS_VERSION` at `a659a0e` | 13 and 13 |
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
| Published deploy before this one | `6abdd45ef5b29066637ad33c`, serving the `1e54711` assets |

Env was read with a filtered `env:list --json --context production` that prints booleans only. No env var was changed.

## After the deploy

| Check | Expected | Result |
|---|---|---|
| `GET /api/health` | 200 `{"ok":true,"status":"ok"}` | pass: 200 `{"ok":true,"status":"ok","detail":null}`, and the same again after the worktree was removed |
| `POST /api/health` | 405 | pass |
| `GET /data` | 200 | pass |
| `POST /api/chat` without a cookie | 401 JSON with `reason`, `no-store` | pass: 401 `{"error": string, "reason": "access_expired"}`, `content-type: application/json`, `cache-control: no-store` |
| #109 "Words · " header summary and `board-words` in the JS | present | pass (1 / 1) |
| #109 `term-card` in the JS and the CSS | present | pass (1 / 1) |
| #109 tags "FROM THREAD" and "GUESS" in the JS | present | pass (2 / 3) |
| #109 "No line in your paste matches closely." and "The coach's guess: no line in your paste says this." | present | pass (2 / 2) |
| #109 "Meanings" and "JUST ADDED" | present | pass (2 / 3) |
| #20 "Follow coach" and "Board overview" | present | pass (1 / 1) |
| #126 " not on the board" and "On the board ↖" | present | pass (1 / 1) |
| #124 / #5 "Picked up where you left off" and `ddd-coach.session.v1` | present | pass (1 / 1) |
| React Flow attribution `react-flow__attribution` | present | pass (1) |
| "The coach's next turn uses your wording." in the JS | 0 (flag off) | pass (0) |
| "Keep these words" in the bundle | 0 | pass (0) |
| `CORRECTIONS_ENABLED = false` and `GLOSSARY_ENABLED = false` in the `chat` zip | present | pass (1 / 1) |
| Earlier features: "YOU SAID", "You connected", "Link undone." | present | pass |
| `board-demo-fixture`, `fixtureApi`, `COACH_FIXTURES`, `BOARD_DEMO` in the live HTML, JS and CSS, anywhere in `dist/`, and in the function zips | 0 | pass (0 everywhere) |
| `/dev/fixtureApi.ts`, `/src/ui/TermNode.tsx`, `/src/domain/words.ts` served | 404 | pass |
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
| `.env` or `.map` in the function zips; `.map` in `dist/`; the served `index-BSh3930S.js.map` | none; 404 | pass |
| Earlier features still bundled: "Copy for your RFC", "What's sent", "CC BY 4.0", "Where your text goes", "New conversation", `access_expired`, `guess-tag` | present | pass |
| CSS `url()`s are same-origin | all `/assets/…` | pass (49 of 49; 26 woff2, all 200) |
| `fonts.googleapis` / `fonts.gstatic` in the deployed HTML, CSS and JS | 0 | pass |

## Notes

- **The local `.env` key is still dead.** The free `GET /api/v1/key` check returned 401 "User not found." again. The prod secret is a different, working key: `/api/health` is `ok` before and after the deploy. Local paid runs need a new key in `.env`.
- The function zips contain the string `OPENROUTER` 29 times (20 / 5 / 2 / 2). These are env var names, not values: `sk-or` is 0.
- `gh run list --workflow ci.yml --commit a659a0e` printed nothing while the run was in progress. The run was found with `gh run list --workflow ci.yml` (matching `headSha`), and the deploy waited until it completed with `success`.
- `npm ci` printed npm's `install-scripts` notice (dependency install scripts not run until approved). `bin/check.sh` and the build passed regardless, and the served assets match the build.
- No hosted chat call ran: no unlock and no paid call. The Words lane is covered by the acceptance tests in `bin/check.sh`. The verifier owns the demo.
- Other worktrees are still registered: another session's `…/b8b9f924…/scratchpad/wt109` at `a659a0e` (detached) and `.claude/worktrees/nav-127`. Neither is this deploy's worktree, so both were left alone. While this report was written, the published deploy was still `6abdd8f5`.
