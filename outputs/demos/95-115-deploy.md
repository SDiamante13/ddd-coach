# Deploy: board corrections behind a flag (#95), the question strip scroll fix (#115) and the note-close crash hotfix (#94) (2026-09-30)

- Live commit: `26c2360` (`e39d064` + a docs commit + the #94 crash fix). Both deploys were built from pinned detached worktrees outside the repo (removed afterwards). The main tree's uncommitted v14 prompt work was not in either build.
- Site: `ddd-coach` (`40f5c583-82ea-47fa-b007-65f2cf19cac2`), https://ddd-coach.netlify.app
- Deploys, in order:
  1. `e39d064`: deploy `6abd2e35a8ae487bd77a824c` (`ready`, `production`). It replaced `fb287cc` (deploy `6ab7860a10b8d6f3ebd93cf0`). It served `index-D_PKZ3t8.js`, and every check below passed on it.
  2. `26c2360`: deploy **`6abd2f4b0a5ae792b77e97ca`** (`ready`, `production`). This one is live.
- Log: https://app.netlify.com/projects/ddd-coach/deploys/6abd2f4b0a5ae792b77e97ca
- Command: `npx netlify deploy --prod --site <id>` (Netlify CLI 27.9.0 from the worktree's `node_modules`), exit 0 both times
- Live `/` serves `index-BIz_DUUH.js` and `index-BBTfKt4D.css` (before #95/#115: `index-BX-iNy7W.js` and `index-Dx6PNLxE.css`). The hash matches the `26c2360` worktree build, and both files are byte-identical to it. The live HTML differs from `dist/index.html` only by Netlify's injected "hosted on Netlify" comment.

Contents:
- #95: the visitor can correct a board card in place (YOU SAID, the coach's words struck through, a "Corrected your sticky · Undo" pill, "Corrected on your board." in the margin). The reply chip reads "← N new on the board · N updated · N already there". New conversation clears corrections.
- #95, gated: sending corrections to the coach sits behind `CORRECTIONS_ENABLED`, which is `false` in both the client bundle and the `chat` function. With the flag off, the client sends no corrections, the server drops any it receives, and the note reads only "Corrected on your board."
- #115: the question strip's ▾ and its focus no longer move the conversation, the card opens to at least the full question and the first quote, and the composer rests after Send.
- #94 hotfix: the paste highlight's effect now has a block body, so newer Chrome's promise-returning `scrollIntoView` isn't taken as React's cleanup. That stops the "destroy is not a function" crash when a card's closest-line note closes. The live bundle shows ``useEffect(()=>{r.current?.scrollIntoView({block:`center`})},…)``. It is client-only, and the CSS and all four function zips are unchanged from `e39d064`.
- Unchanged: instructions are still v13, and `GLOSSARY_ENABLED` is still `false`. The server gained `chatCorrections.ts` and `correctionsContext.ts`, so the `chat` zip grew by 471 bytes. The other three zips are unchanged.

## Pre-deploy

| Check | Result |
|---|---|
| `LIVE_INSTRUCTIONS_VERSION` and `COACH_INSTRUCTIONS_VERSION` at `e39d064` and `26c2360` | 13 and 13 at both |
| `GLOSSARY_ENABLED` and `CORRECTIONS_ENABLED` in `src/shared/features.ts` | `false` and `false` |
| Fixture plugin gated on `COACH_FIXTURES === "1"` in `vite.config.ts` | yes |
| `npm ci` + `bin/check.sh` in each worktree | pass on the first run, both times |
| Shell had no `OPENROUTER_*` vars, so the paid smoke test was skipped | pass |
| `OPENROUTER_MODEL` starts with `openai/` | true |
| `OPENROUTER_MODEL` == `openai/gpt-5.6-terra` (production) | true |
| `OPENROUTER_REASONING_EFFORT` == `none` | true |
| `OPENROUTER_API_KEY`, `COACH_SIGNING_KEY`, `ACCESS_PASSWORD` | set |
| `COACH_TIMEOUT_MS`, `DDD_COACH_PROBE`, `GLOSSARY_ENABLED`, `CORRECTIONS_ENABLED`, `COACH_FIXTURES` env | absent |
| Free key check (`GET /api/v1/key` with the local `.env` key) | **401 "User not found."**: the local key is still dead (see Notes) |
| Live `/api/health` before the deploy (checks the prod key) | 200 `ok` |

Env was read before each deploy with a filtered `env:list --json --context production` that prints booleans only. No env var was changed.

## After the deploy (checked on both deploys; the results are for `26c2360`)

| Check | Expected | Result |
|---|---|---|
| `GET /api/health` | 200 `{"ok":true,"status":"ok"}` | pass: 200 `{"ok":true,"status":"ok","detail":null}`, and the same again after the worktree was removed |
| `POST /api/health` | 405 | pass |
| `GET /data` | 200 | pass |
| `POST /api/chat` without a cookie | 401 JSON with `reason`, `no-store` | pass: 401 `{"error": string, "reason": "access_expired"}`, `content-type: application/json`, `cache-control: no-store` |
| "The coach's next turn uses your wording." in the JS | 0 (flag off) | pass (0) |
| `CORRECTIONS_ENABLED = false` in the `chat` zip | present | pass |
| #95 copy in the JS: "Corrected on your board.", "Corrected your sticky", "YOU SAID" | present | pass (1 / 1 / 1) |
| #115 and earlier: `question-strip`, "Copy for your repo" | present | pass (4 / 1) |
| `board-demo-fixture`, `fixtureApi`, `COACH_FIXTURES`, `BOARD_DEMO` in the live HTML, JS and CSS, anywhere in `dist/`, and in the function zips | 0 | pass (0 everywhere) |
| `/dev/fixtureApi.ts` served | 404 | pass |
| "Keep these words" in the bundle | 0 | pass |
| Deployed function sizes match the local zips (`available_functions`) | equal | pass: `chat` 1,775,134, `health` 1,172,031, `session` 1,172,107, `unlock` 1,172,633 |

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
| `OPENROUTER` in the function zips | env var names only | pass: `process.env` names and the SDK's own names; no values |
| `.env` or `.map` in the function zips; `.map` in `dist/`; the served `index-BIz_DUUH.js.map` | none; 404 | pass |
| Earlier features still bundled: "Copy for your RFC", "What's sent", "CC BY 4.0", "Where your text goes", "New conversation", `access_expired`, `guess-tag` | present | pass |
| Font URLs in the deployed CSS are same-origin | all `/assets/…` | pass (49 of 49; 26 woff2, all 200) |
| `fonts.googleapis` / `fonts.gstatic` in the deployed HTML, CSS and JS | 0 | pass |

## Notes

- **The local `.env` OpenRouter key is still dead** (401 "User not found."). The prod secret is a different, working key: `/api/health` is `ok` before and after the deploy.
- **Only sending corrections is gated.** Editing a card in place, YOU SAID, the Undo pill and "Corrected on your board." ship live. With the flag off, the coach never sees the correction, so the next reply can restate the coach's original wording. If the whole edit should stay hidden until the flag flips, that UI needs the flag too.
- No hosted chat call ran: no unlock and no paid call. The chat path is covered by the cookieless `POST /api/chat` (401 with `reason`) and by `/api/health`. The verifier owns the demo.
- Other sessions' worktrees (`…/b8b9f924…/scratchpad/wt95`, `.claude/worktrees/card-117`, `.claude/worktrees/export-118`) are still registered. They aren't this deploy's worktrees, so they were left alone.
