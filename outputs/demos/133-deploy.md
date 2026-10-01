# Deploy: who's who, menu keyboard and one-line settle-by (#133, #132, #116) (2026-10-01)

- Live commit: `91691c5`. Built from a pinned detached worktree outside the repo (`../ddd-deploy-133`), removed afterwards. The main tree's uncommitted v14 prompt work was not in the build. `0ee45be` (after it) changes only `outputs/research/practitioner-session-kit.md`.
- GitHub CI (`ci.yml`) for `91691c5`: run `36862647975`, `success`, confirmed by `headSha` before the deploy (it was in progress at first, and the deploy waited for it).
- Site: `ddd-coach` (`40f5c583-82ea-47fa-b007-65f2cf19cac2`), https://ddd-coach.netlify.app
- Deploy: **`6abe542725929f1bd890d0b3`** (`ready`, `production`, published). It replaced `65bdb7c` (deploy `6abe4c1b061fa21514e00c69`).
- Log: https://app.netlify.com/projects/ddd-coach/deploys/6abe542725929f1bd890d0b3
- Command: `npx netlify deploy --prod --site <id> --dir dist` (Netlify CLI 27.9.0 from the worktree's `node_modules`).
- Live `/` serves `index-BxdTFxa3.js` and `index-DbbE4wDI.css` (before: `index--jOXo_e2.js` and `index-CjFcZdyE.css`). Both files are byte-identical to the `91691c5` worktree build. The live HTML differs from `dist/index.html` only by Netlify's injected "hosted on Netlify" comment.

Contents (12 commits since `65bdb7c`; 2 of them docs):
- #133 Who's who: the paste is read for who said each line (Slack export, chat, meeting notes). A strip under a reply where most rows have no source line lets the visitor put each speaker on a team. It is kept in this browser under `ddd-coach.whos-who.v1`, in swapped space, and never sent. A team is suggested when a person names their own desk, and later pastes ask only about new speakers. "Saved who's who" shows and clears it. The question card links to term rows using the who's who too. The notice and `/data` say what stays in the browser.
- #132 DESIGNER fixes: the "I checked" menu opens onto its first answer and closes with Esc or Tab without the board taking the key (fixes the live Esc bug). Settle by stays on one truncated line with ✎ to change it, and screen readers get the full text from a visually hidden copy. The expert's lines collapse to one line with a quiet "from your table".
- #116: `bin/demo-record.mjs` and the `playwright-core` devDependency. Not in the bundle.
- Tests: the ✎ reopen check (#132), plus the domain tests for paste speakers, who's who, source gaps, words and question links.
- Docs: the #70/#136 practitioner session kit, the #131/#132 demo report and the last deploy report.
- `server/`, `netlify/`, `netlify.toml`, `vite.config.ts` and `src/shared/` are unchanged since `65bdb7c`. `package*.json` adds `playwright-core` as a devDependency only. `src/domain/` changed: new `pasteSpeakers.ts`, `whosWho.ts`, `sourceGap.ts`, plus edits to `words.ts`, `questionLinks.ts` and `dates.ts`.
- Unchanged: instructions are still v13, and `GLOSSARY_ENABLED` and `CORRECTIONS_ENABLED` are still `false`.

## Bundle size

| File | Last deploy (gz) | This deploy (gz) | Delta (gz) |
|---|---|---|---|
| index JS | 159,676 (`-jOXo_e2`, raw 502,703) | 162,558 (`BxdTFxa3`, raw 511,823) | +2,882 |
| index CSS | 10,727 (`CjFcZdyE`, raw 61,633) | 10,924 (`DbbE4wDI`, raw 62,980) | +197 |

This deploy was measured with `gzip -9` on the served files. The old files are no longer served, so the last deploy's figures come from `131-132-deploy.md`.

## Function zips

No change. The deployed sizes equal the last deploy's: `chat` 1,775,155, `health` 1,172,031, `session` 1,172,107, `unlock` 1,172,633.

- The server bundles part of `src/domain/`. The `chat` bundle holds `dates.ts`, `entityId.ts`, `exchange.ts`, `glossary.ts` and `swaps.ts`. Of these, only `dates.ts` changed. It gained one export, `dayAndMonth`, which the server doesn't use, so esbuild drops it (0 hits in the bundle).
- `words.ts`, `whosWho.ts`, `pasteSpeakers.ts`, `sourceGap.ts` and `questionLinks.ts` aren't reachable from `server/` or `netlify/`, so they're not in any zip. `pasteSpeakers`/`whosWho` has 0 hits in all four zips.
- The CLI said "Deploying functions from cache" and uploaded 0 functions. To rule out a stale cache, I bundled the four functions again from the `91691c5` source (`zip-it-and-ship-it --archive-format none netlify/functions`). Each `<fn>.mjs` is byte-identical to the one in the deployed zip.

## Pre-deploy

| Check | Result |
|---|---|
| GitHub CI `ci.yml` run for `91691c5` (matched by `headSha`) | `success` (`36862647975`) |
| `origin/main` at deploy time | `91691c5`. Later `0ee45be`, which is docs only. |
| `LIVE_INSTRUCTIONS_VERSION` and `COACH_INSTRUCTIONS_VERSION` at `91691c5` | 13 and 13 |
| `GLOSSARY_ENABLED` and `CORRECTIONS_ENABLED` in `src/shared/features.ts` | `false` and `false` |
| Fixture plugin gated on `COACH_FIXTURES === "1"` in `vite.config.ts` | yes |
| `git diff 65bdb7c 91691c5` on `server/`, `netlify/`, `netlify.toml`, `vite.config.ts`, `src/shared/` | empty |
| `package.json` diff | `+ "playwright-core": "^1.63.0"` in `devDependencies` only |
| `npm ci` + `bin/check.sh` in the worktree | pass on the first run |
| Shell had no `OPENROUTER_*` vars, so the paid smoke test was skipped | pass |
| `OPENROUTER_MODEL` starts with `openai/` | true |
| `OPENROUTER_MODEL` == `openai/gpt-5.6-terra` (production) | true |
| `OPENROUTER_REASONING_EFFORT` == `none` | true |
| `OPENROUTER_API_KEY`, `COACH_SIGNING_KEY`, `ACCESS_PASSWORD` | set |
| `COACH_TIMEOUT_MS`, `DDD_COACH_PROBE`, `GLOSSARY_ENABLED`, `CORRECTIONS_ENABLED`, `COACH_FIXTURES` env | absent |
| Free key check with the local `.env` key (`node --env-file=.env`, status only) | 401 "User not found." (see Notes) |
| Live `/api/health` before the deploy (checks the prod key) | 200 `ok` |
| `dist/` has no `.map` and no fixture or `playwright` strings | 0 / 0 |
| Published deploy before this one | `6abe4c1b061fa21514e00c69` |

Env was read with a filtered `env:list --json --context production` that prints booleans only. No env var was changed.

## After the deploy

| Check | Expected | Result |
|---|---|---|
| `GET /api/health` | 200 `{"ok":true,"status":"ok"}` | pass: `{"ok":true,"status":"ok","detail":null}`, and the same again after the worktree was removed |
| `POST /api/health` | 405 | pass |
| `GET /data` | 200 | pass |
| `POST /api/chat` without a cookie | 401 JSON with `reason`, `no-store` | pass: 401 `{"error": string, "reason": "access_expired"}`, `content-type: application/json`, `cache-control: no-store` |
| #133 "Who's who" in the JS | present | pass (6) |
| #133 "N more source line(s) found · N still none" (a template, so checked by fragments) | present | pass: "more source " 1, " found · " 1, " still none" 1, `whos-who-found` 1 |
| #133 "stay until you delete them" (notice and `/data`) | present | pass (2) |
| #133 "Saved who", "rows have no source line", "Say who's on which team", "Apply · find source lines", "with a source line" | present | pass (1 / 1 / 1 / 1 / 1) |
| #133 storage key `ddd-coach.whos-who.v1` in the JS (browser-only) | present | pass (1). `whos-who` also appears as CSS class names: 13 in the JS, 10 in the CSS |
| **`whos-who` in the `chat`, `health`, `session` and `unlock` zips** | 0 | **pass (0 / 0 / 0 / 0)** |
| #116 `playwright` / `chromium` in the HTML, JS and CSS | 0 | pass (0 / 0) |
| #132 "Settle by", "I checked", `visually-hidden`, `expert-lines-toggle`, `board-counts`, "from your table" | present | pass (3 / 2 / 7 / 1 / 1 / 1) |
| #131/#132 "more below ▾ (", "Updated: the row and the lines for", "Updated in 3 places" | present | pass (1 / 1 / 1) |
| Flags off in the bundle: "The coach's next turn uses your wording." (`CORRECTIONS_ENABLED`) and "Keep these words" (`GLOSSARY_ENABLED`) | 0 | pass (0 / 0) |
| `CORRECTIONS_ENABLED = false` and `GLOSSARY_ENABLED = false` in the `chat` zip | present | pass (1 / 1) |
| Earlier features: "Follow coach", "Show as table", "Picked up where you left off", "YOU SAID" | present | pass |
| `board-demo-fixture`, `fixtureApi`, `COACH_FIXTURES`, `BOARD_DEMO` in the live HTML, JS and CSS | 0 | pass |
| `/src/ui/whosWhoStore.ts`, `/src/domain/pasteSpeakers.ts`, `/bin/demo-record.mjs` served | 404 | pass |
| Deployed function sizes (`available_functions`) | equal to the last deploy | pass (see "Function zips") |

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
| `.env` or `.map` in the function zips; `.map` in `dist/`; the served `index-BxdTFxa3.js.map` | none; 404 | pass |
| Earlier features still bundled: "Copy for your RFC", "What's sent", "CC BY 4.0", "Where your text goes", "New conversation", `access_expired`, `guess-tag` | present | pass |
| CSS `url()`s are same-origin | all `/assets/…` | pass (49 of 49; 26 woff2, all 200) |
| `fonts.googleapis` / `fonts.gstatic` in the deployed HTML, CSS and JS | 0 | pass |

## Notes

- **The local `.env` key is still dead.** The free `GET /api/v1/key` check returned 401 "User not found." again. The prod secret is a different, working key: `/api/health` is `ok` before and after the deploy. Local paid runs need a new key in `.env`.
- It was expected that the `chat` zip might pick up `whosWho.ts` and `pasteSpeakers.ts` through `words.ts`. It doesn't: no server entry point imports `words.ts`, and the bundle's `src/domain` list has neither file.
- "Hide the lines" (checked last time) is now 0. #132 replaced it with the one-line collapse, so this run checks `expert-lines-toggle` and "from your table".
- The function zips contain the string `OPENROUTER` 29 times (20 / 5 / 2 / 2), the same as last time. These are env var names, not values: `sk-or` is 0.
- No hosted chat call ran: no unlock and no paid call. The changes are covered by the acceptance tests in `bin/check.sh`. The verifier owns the demo.
- Other worktrees are still registered: `.claude/worktrees/chores`, `.claude/worktrees/fit-131`, another session's `…/b8b9f924…/scratchpad/wt133` at `91691c5`, and `…/5933a429…/scratchpad/gate-67d`. None is this deploy's, so all were left alone. While this report was written, the published deploy was still `6abe5427`.
