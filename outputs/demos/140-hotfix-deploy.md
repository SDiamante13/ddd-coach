# Hotfix deploy: a "Team unclear" term row no longer takes anyone's line, stemmed source matching and margin counts (#140, #138) (2026-10-01)

- Live commit: `28a77ed`. Built from a pinned detached worktree outside the repo (`<scratchpad>/ddd-deploy-140`), removed afterwards. The main tree's uncommitted v14 prompt work was not in the build.
- GitHub CI (`ci.yml`) for `28a77ed`: run `36872135460`, `success`, confirmed by `headSha` before the deploy (it was in progress at first, and the deploy waited for it).
- Site: `ddd-coach` (`40f5c583-82ea-47fa-b007-65f2cf19cac2`), https://ddd-coach.netlify.app
- Deploy: **`6abe66b725a25d10c972873c`** (`ready`, `production`, published 2026-10-01T13:57:20Z). It replaced `cd9e209` (deploy `6abe60c397298a81b4e849d8`).
- Log: https://app.netlify.com/projects/ddd-coach/deploys/6abe66b725a25d10c972873c
- Command: `npx netlify deploy --prod --site <id> --dir dist` (Netlify CLI 27.9.0 from the worktree's `node_modules`).
- Live `/` serves `index-BHEnz-Rm.js` and `index-DUSNBYzg.css` (before: `index-KOKj1pI5.js` and `index-DUSNBYzg.css`). Both files are byte-identical to the `28a77ed` worktree build. The live HTML differs from `dist/index.html` only by Netlify's injected "hosted on Netlify" comment.

Contents (5 commits since `cd9e209`; 3 of them docs):
- #140 (live wrong-source bug): `speaksFor` in `src/domain/words.ts` now needs a non-empty holder before matching by label. An empty holder ("Team unclear") used to pass `[].every(...)` and so matched every speaker, letting the row take anyone's line. Such a row now gets no line unless the team matches.
- #138: term-row source matching tries exact words first, then falls back to stemmed words (`closestLine(..., { stems: true })`, which strips `ances?|ings?|ed|es|s` from words longer than 5 letters). Term rows only.
- #138: the margin chip counts terms and rows the way the board merges them (by `entityId`), and the "N with a source line" count moves onto the words line after a ` · ` separator (the separate `board-sourced` span is gone).
- Docs: the #137 demo, the last deploy report, the zip-bundling note in `agent-team.md`.
- `netlify/`, `netlify.toml`, `vite.config.ts`, `src/shared/`, `server/`, `package.json` and `package-lock.json` are unchanged since `cd9e209`. Client changes are in `src/domain/sourceLine.ts`, `src/domain/words.ts`, `src/ui/EventBoard.tsx`, `src/ui/TermNode.tsx` and `src/ui/WordsOnBoard.tsx` (plus tests).
- Unchanged: instructions are still v13, and `GLOSSARY_ENABLED` and `CORRECTIONS_ENABLED` are still `false`.

## Bundle size

| File | Last deploy (gz) | This deploy (gz) | Delta (gz) |
|---|---|---|---|
| index JS | 162,633 (`KOKj1pI5`, raw 511,965) | 162,746 (`BHEnz-Rm`, raw 512,168) | +113 |
| index CSS | 10,920 (`DUSNBYzg`, raw 63,016) | 10,920 (`DUSNBYzg`, same file) | 0 |

Both sides were measured here with `gzip -9` on stdin from the served files (the old JS from the previous deploy's permalink). The `137-15-deploy.md` figures were taken with the file name in the gzip header, so they read about 10–20 B higher for the same bytes.

## Function zips

Unchanged, as expected for a client-only change. `chat` 1,775,215, `health` 1,172,031, `session` 1,172,107 and `unlock` 1,172,633 equal the previous deploy's `available_functions` sizes, and the deploy's `required_functions` was empty (nothing uploaded).

- I bundled both commits with `zip-it-and-ship-it --archive-format none netlify/functions`, each from its own worktree with its own `npm ci`, and ran `diff -r`. The four function directories are identical; only `manifest.json` differs (worktree paths and timestamp). No server module imports the changed `src/domain` files.
- Each `<fn>.mjs` in the CLI's deployed zips (`.netlify/functions/*.zip`, unpacked) is byte-identical to the fresh `28a77ed` re-bundle.
- `sk-or` is 0 in all four zips. `OPENROUTER` appears 29 times (20 / 5 / 2 / 2), the same as last time: env var names only. `CORRECTIONS_ENABLED = false` and `GLOSSARY_ENABLED = false` are each present once in `chat`.

## Pre-deploy

| Check | Result |
|---|---|
| GitHub CI `ci.yml` run for `28a77ed` (matched by `headSha`) | `success` (`36872135460`) |
| `origin/main` at deploy time | `28a77ed` |
| `LIVE_INSTRUCTIONS_VERSION` and `COACH_INSTRUCTIONS_VERSION` at `28a77ed` | 13 and 13 |
| `GLOSSARY_ENABLED` and `CORRECTIONS_ENABLED` in `src/shared/features.ts` | `false` and `false` |
| Fixture plugin gated on `COACH_FIXTURES === "1"` in `vite.config.ts` | yes |
| `git diff cd9e209 28a77ed` on `netlify/`, `netlify.toml`, `vite.config.ts`, `src/shared/`, `server/`, `package*.json` | empty |
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
| Published deploy before this one | `6abe60c397298a81b4e849d8` |

Env was read with a filtered `env:list --json --context production` that prints booleans only. No env var was changed.

## After the deploy

| Check | Expected | Result |
|---|---|---|
| `GET /api/health` | 200 `{"ok":true,"status":"ok"}` | pass: `{"ok":true,"status":"ok","detail":null}`, and the same again after the worktrees were removed |
| `POST /api/health` | 405 | pass |
| `GET /data` | 200 | pass |
| `GET /api/session` without a cookie | 401 `no-store` | pass |
| `GET /api/unlock` | 405 `Allow: POST`, `no-store` | pass |
| `POST /api/chat` without a cookie | 401 JSON with `reason`, `no-store` | pass: 401 `{"error": string, "reason": "access_expired"}`, `content-type: application/json`, `cache-control: no-store` |
| #140 guard in the JS: `a.length>0&&a.every(e=>i.has(e))\|\|n!==null&&r.get(e.toLowerCase())===n` | present | pass (`length>0&&<x>.every(` old 1 → new 2) |
| #138 stem regex `(ances?\|ings?\|ed\|es\|s)$` and `stems` | present | pass (old 0 / 0 → new 1 / 2) |
| #138 `board-sourced` span removed; "with a source line" kept on the words line | 0 / 1 | pass (old 1 → new 0; 1) |
| Flags off in the bundle: "The coach's next turn uses your wording." (`CORRECTIONS_ENABLED`) and "Keep these words" (`GLOSSARY_ENABLED`) | 0 | pass (0 / 0) |
| Earlier features: "Who's who", "Settle by", "I checked", "Follow coach", "Show as table", "Picked up where you left off", "YOU SAID", "Copy for your RFC", "What's sent", "CC BY 4.0", "Where your text goes", "New conversation", `access_expired`, `guess-tag`, "Try an example thread" | present | pass |
| `board-demo-fixture`, `fixtureApi`, `COACH_FIXTURES`, `BOARD_DEMO`, `playwright`, `safari-check`, `hosted-check` in the live HTML, JS and CSS | 0 | pass |
| `/.env`, `/src/main.tsx`, `/server/config.ts`, `/src/domain/sourceLine.ts`, `/src/domain/words.ts`, `/netlify.toml`, `/bin/hosted-check.sh`, `/assets/index-BHEnz-Rm.js.map` | 404 | pass |
| Deployed function sizes (`available_functions`) | all equal | pass (see "Function zips") |

## Hosted checks

`bin/hosted-check.sh https://ddd-coach.netlify.app` (#135), exit 0, 0 FAIL. The 26 font lines are summarised:

```
PASS  X-Content-Type-Options: nosniff
PASS  Referrer-Policy: strict-origin-when-cross-origin
PASS  CSP frame-ancestors 'none'
PASS  /api/health is 200 with status ok
PASS  /api/chat GET is 405
PASS  /api/chat POST without a session is 401
PASS  bundle found (2 assets)
PASS  no sk-or or OPENROUTER in the HTML, JS and CSS
PASS  no source maps
PASS  no googleapis or gstatic references
PASS  every font is same-origin (26 woff2)
PASS  font /assets/<name>.woff2 is 200   (26 of 26)
```

## Notes

- **The local `.env` key is still dead.** The free `GET /api/v1/key` check returned 401 "User not found." again. The prod secret is a different, working key: `/api/health` is `ok` before and after the deploy. Local paid runs need a new key in `.env`.
- The #140 fix needs a board with a "Team unclear" row to see live, which takes an unlocked paid conversation, so it wasn't exercised live. The domain and acceptance tests in `bin/check.sh` cover it, and the guard is in the served JS.
- No hosted chat call ran: no unlock and no paid call. The verifier owns the demo.
- This deploy's two worktrees (`ddd-deploy-140` at `28a77ed`, `ddd-old-cd9` at `cd9e209`) are removed. Still registered besides the main tree: `.claude/worktrees/chores` and another session's `gate-chores`.
