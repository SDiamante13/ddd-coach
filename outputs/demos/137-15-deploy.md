# Deploy: example thread always shown, Safari focus, busy guard and deadline abort (#137, #67, #38, #15) (2026-10-01)

- Live commit: `cd9e209`. Built from a pinned detached worktree outside the repo (`<scratchpad>/ddd-deploy-137`), removed afterwards. The main tree's uncommitted v14 prompt work was not in the build. `86bd503` (after it) adds only the #137 demo (`outputs/demos/137.*`, `outputs/demos/scripts/137.mjs`).
- GitHub CI (`ci.yml`) for `cd9e209`: run `36868699012`, `success`, confirmed by `headSha` before the deploy (it was in progress at first, and the deploy waited for it).
- Site: `ddd-coach` (`40f5c583-82ea-47fa-b007-65f2cf19cac2`), https://ddd-coach.netlify.app
- Deploy: **`6abe60c397298a81b4e849d8`** (`ready`, `production`, published 2026-10-01T13:32:31Z). It replaced `91691c5` (deploy `6abe542725929f1bd890d0b3`).
- Log: https://app.netlify.com/projects/ddd-coach/deploys/6abe60c397298a81b4e849d8
- Command: `npx netlify deploy --prod --site <id> --dir dist` (Netlify CLI 27.9.0 from the worktree's `node_modules`).
- Live `/` serves `index-KOKj1pI5.js` and `index-DUSNBYzg.css` (before: `index-BxdTFxa3.js` and `index-DbbE4wDI.css`). Both files are byte-identical to the `cd9e209` worktree build. The live HTML differs from `dist/index.html` only by Netlify's injected "hosted on Netlify" comment.

Contents (12 commits since `91691c5`; 4 of them docs):
- #137: "Try an example thread" stays visible while the conversation is empty, whatever has focus. The resting-composer selectors in `board.css` now skip the fold when the form holds `.example`.
- #67: the example button's `mousedown` is prevented, so Safari keeps focus in the message box and the button isn't folded away before the click lands. `bin/safari-check.mjs` checks it in WebKit (dev only, not bundled).
- #38: `send` refuses a second message while one is pending (`canSend` domain guard). The guard reads the exchanges as just changed through a ref, so two sends in the same tick start one request. Retry uses the same ref.
- #15: the OpenRouter call is aborted when the reply deadline fires, instead of running on after the 504. **Server change**, see "Function zips".
- #134/#135: `bin/land.sh` and `bin/hosted-check.sh` (dev only, not bundled).
- Docs: the #133/#132 demo, the #67 Safari record, the last deploy report and the cache re-bundle note in `agent-team.md`, the practitioner session kit.
- `netlify/`, `netlify.toml`, `vite.config.ts`, `src/shared/`, `package.json` and `package-lock.json` are unchanged since `91691c5`. `server/` changed in `chatHandler.ts`, `coach.ts`, `deadline.ts` and `openRouterCoach.ts` (plus their tests). `src/domain/exchange.ts` gained `canSend`.
- Unchanged: instructions are still v13, and `GLOSSARY_ENABLED` and `CORRECTIONS_ENABLED` are still `false`.

## Bundle size

| File | Last deploy (gz) | This deploy (gz) | Delta (gz) |
|---|---|---|---|
| index JS | 162,558 (`BxdTFxa3`, raw 511,823) | 162,651 (`KOKj1pI5`, raw 511,965) | +93 |
| index CSS | 10,924 (`DbbE4wDI`, raw 62,980) | 10,939 (`DUSNBYzg`, raw 63,016) | +15 |

This deploy was measured with `gzip -9` on the served files. The old figures come from `133-deploy.md`.

## Function zips

`chat` changed (1,775,155 → 1,775,215, +60 B). `health` 1,172,031, `session` 1,172,107 and `unlock` 1,172,633 are unchanged.

- I bundled both commits with `zip-it-and-ship-it --archive-format none netlify/functions`, each from its own worktree with its own `npm ci`, and ran `diff -r` on the unpacked output. `health`, `session` and `unlock` are identical. In `chat`, only `netlify/functions/chat.mjs` differs; the bundled `node_modules` (including `@openrouter/sdk`) are identical.
- The whole `chat.mjs` diff is the abort-signal plumbing:
  - `withDeadline` takes `work: (signal) => Promise`, creates `new AbortController()`, calls `abort.abort()` in the deadline timer before resolving `TIMED_OUT`, and races `work(abort.signal)`.
  - `replyFrom` calls `withDeadline((signal) => coach.reply(conversation, signal), deadlineMs)`.
  - The OpenRouter coach's `reply(conversation, signal)` passes `{ ...WITHOUT_RETRIES, ...signal && { signal } }` as the SDK's request options.
- The request body is unchanged: `chatRequest` and `messagesOf` (model, messages, `stream: false`, `maxCompletionTokens`, pinned `provider`, `reasoning`) don't appear in the diff. The signal is a request option, not a body field. The SDK spreads request options into its fetch options (`lib/sdks.js`), so the signal reaches `fetch`; retries stay `none`.
- The CLI said "Deploying functions from cache" but requested and uploaded 1 function (`chat`). Each `<fn>.mjs` in the CLI's deployed zips (`.netlify/functions/*.zip`, unpacked) is byte-identical to the fresh `cd9e209` re-bundle, and the four zip sizes equal the deploy's `available_functions` sizes.
- `sk-or` is 0 in all four zips. `OPENROUTER` appears 29 times (20 / 5 / 2 / 2), the same as last time: env var names only. `new AbortController` is 1 in `chat` and 0 elsewhere.

## Pre-deploy

| Check | Result |
|---|---|
| GitHub CI `ci.yml` run for `cd9e209` (matched by `headSha`) | `success` (`36868699012`) |
| `origin/main` at deploy time | `cd9e209`. Later `86bd503`, which is docs only (the #137 demo). |
| `LIVE_INSTRUCTIONS_VERSION` and `COACH_INSTRUCTIONS_VERSION` at `cd9e209` | 13 and 13 |
| `GLOSSARY_ENABLED` and `CORRECTIONS_ENABLED` in `src/shared/features.ts` | `false` and `false` |
| Fixture plugin gated on `COACH_FIXTURES === "1"` in `vite.config.ts` | yes |
| `git diff 91691c5 cd9e209` on `netlify/`, `netlify.toml`, `vite.config.ts`, `src/shared/`, `package*.json` | empty |
| `git diff 91691c5 cd9e209 -- server/` (non-test) | the #15 abort plumbing only, 4 files |
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
| Published deploy before this one | `6abe542725929f1bd890d0b3` |

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
| #137 `.confirm,.example)` in the resting-composer selectors (CSS) | 4 | pass (4) |
| #67 example button: `` className:`example`,onMouseDown:de `` with `de=e=>e.preventDefault()`, "Try an example thread" | present | pass (1 / 1) |
| Flags off in the bundle: "The coach's next turn uses your wording." (`CORRECTIONS_ENABLED`) and "Keep these words" (`GLOSSARY_ENABLED`) | 0 | pass (0 / 0) |
| `CORRECTIONS_ENABLED = false` and `GLOSSARY_ENABLED = false` in the `chat` zip | present | pass (1 / 1) |
| Earlier features: "Who's who", "Settle by", "I checked", "Follow coach", "Show as table", "Picked up where you left off", "YOU SAID", "Copy for your RFC", "What's sent", "CC BY 4.0", "Where your text goes", "New conversation", `access_expired`, `guess-tag` | present | pass |
| `board-demo-fixture`, `fixtureApi`, `COACH_FIXTURES`, `BOARD_DEMO`, `playwright`, `safari-check`, `hosted-check` in the live HTML, JS and CSS | 0 | pass |
| `/.env`, `/src/main.tsx`, `/server/config.ts`, `/server/deadline.ts`, `/netlify.toml`, `/bin/hosted-check.sh`, `/bin/safari-check.mjs`, `/assets/index-KOKj1pI5.js.map` | 404 | pass |
| Deployed function sizes (`available_functions`) | `chat` +60 B, others equal | pass (see "Function zips") |

## Hosted checks

`bin/hosted-check.sh https://ddd-coach.netlify.app` (#135), exit 0. The 26 font lines are summarised:

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
- The #15 abort can't be seen from outside without a slow paid call, so it wasn't exercised live. The server tests in `bin/check.sh` cover it, and the deployed `chat.mjs` holds exactly the tested code.
- My first old-commit bundle symlinked the new worktree's `node_modules`, and `zip-it-and-ship-it` then copied all of `node_modules` into it. I discarded it and re-bundled after a real `npm ci`. The diff above comes from the clean pair.
- No hosted chat call ran: no unlock and no paid call. The verifier owns the demo.
- At removal time, only `.claude/worktrees/chores` was still registered besides the main tree. This deploy's two worktrees (`ddd-deploy-137` at `cd9e209`, `ddd-old-916` at `91691c5`) are removed.
