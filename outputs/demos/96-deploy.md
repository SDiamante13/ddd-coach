# Deploy: the board on React Flow with visitor-drawn links (#96), the Board changes announcer (#121) and the repo export rules (#118/#122) (2026-09-30)

- Live commit: `595ec6b`. Built from a pinned detached worktree outside the repo (removed afterwards). The main tree's uncommitted v14 prompt work was not in the build.
- Site: `ddd-coach` (`40f5c583-82ea-47fa-b007-65f2cf19cac2`), https://ddd-coach.netlify.app
- Deploy: **`6abd3cb5c02ec80e9c4365a3`** (`ready`, `production`). It replaced `6ea5c54` (deploy `6abd324c35adc25f98d36459`).
- Log: https://app.netlify.com/projects/ddd-coach/deploys/6abd3cb5c02ec80e9c4365a3
- Command: `npx netlify deploy --prod --site <id>` (Netlify CLI 27.9.0 from the worktree's `node_modules`), exit 0
- Live `/` serves `index-xU9koimZ.js` and `index-Cc84OeEe.css` (before: `index-BiiD97x0.js` and `index-MtbCMmT_.css`). The hash matches the `595ec6b` worktree build, and both files are byte-identical to it. The live HTML differs from `dist/index.html` only by Netlify's injected "hosted on Netlify" comment.

Contents:
- #96: the event lane runs on React Flow (new `@xyflow/react` dependency). Cards stay listitem nodes in timeline order; each has a fixed 156×120 slot; a selected card lifts over the board. The visitor links two cards by dragging a link handle or with "Connect to…" from the keyboard. A link is drawn as a labelled arc, marked "Just drawn" until the next turn, logged with Undo and announced ("You connected “A” → “B”", "Link undone."); a duplicate says "Already linked.". The React Flow attribution is shown.
- #121: one always-mounted, visually hidden "Board changes" live region announces corrections and "Correction undone.".
- #118/#122: the repo export's CLAUDE.md section adds that ordinary integrity checks (idempotency, nulls, duplicates) still apply, and that every settled meaning is built in each context that uses it, with only Unsettled points waiting.
- Client-only. `server/` and `netlify/` are unchanged since `6ea5c54`; all four function zips are byte-for-byte the same size as the last deploy.
- Unchanged: instructions are still v13; `GLOSSARY_ENABLED` and `CORRECTIONS_ENABLED` are still `false`.

## Bundle size

| File | Last deploy (gz) | This deploy (gz) | Delta (gz) |
|---|---|---|---|
| index JS | 89,589 (`BiiD97x0`, raw 282,919) | 148,104 (`xU9koimZ`, raw 466,962) | **+58,515 (+58.5 kB)**, as expected for React Flow |
| index CSS | 6,751 (`MtbCMmT_`, raw 35,442) | 9,200 (`Cc84OeEe`, raw 52,074) | +2,449 |

Measured with `gzip -9` on the served files.

## Pre-deploy

| Check | Result |
|---|---|
| `LIVE_INSTRUCTIONS_VERSION` and `COACH_INSTRUCTIONS_VERSION` at `595ec6b` | 13 and 13 |
| `GLOSSARY_ENABLED` and `CORRECTIONS_ENABLED` in `src/shared/features.ts` | `false` and `false` |
| Fixture plugin gated on `COACH_FIXTURES === "1"` in `vite.config.ts` | yes |
| `npm ci` (new dependency) + `bin/check.sh` in the worktree | pass on the first run |
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
| React Flow attribution: `react-flow__attribution` in the JS / CSS, `reactflow.dev` in the JS | present | pass (1 / 2, 3) |
| `hideAttribution` / `proOptions` in `src/` | 0 | pass (0). The one bundled `hideAttribution` is React Flow's own `proOptions?.hideAttribution` check; the app passes no `proOptions` |
| #96 copy in the JS: "You connected", "Link undone.", "Already linked.", "Connect to", "Just drawn" | present | pass (1 each) |
| #121 copy in the JS: "Board changes", "Correction undone." | present | pass (1 / 1) |
| #122 copy in the JS: "idempotency"; #118 "definitions, not business rules" | present | pass (1 / 1) |
| "The coach's next turn uses your wording." in the JS | 0 (flag off) | pass (0) |
| `CORRECTIONS_ENABLED = false` in the `chat` zip | present | pass |
| Earlier features: "You corrected a sticky", "your wording kept", "Corrected your sticky", "YOU SAID", `question-strip`, "Copy for your repo"; `line-clamp` and `mask-image` in the CSS | present | pass (1 / 1 / 1 / 1 / 4 / 1; 4 / 2) |
| #94 hotfix: note-close effect has a block body (``scrollIntoView({block:`center`})},…``) | present | pass |
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
| `.env` or `.map` in the function zips; `.map` in `dist/`; the served `index-xU9koimZ.js.map` | none; 404 | pass |
| Earlier features still bundled: "Copy for your RFC", "What's sent", "CC BY 4.0", "Where your text goes", "New conversation", `access_expired`, `guess-tag` | present | pass |
| CSS `url()`s are same-origin, and none are new since the last deploy | all `/assets/…` | pass (49 of 49, all `/assets/…`; React Flow's CSS adds none; 26 woff2, all 200) |
| `fonts.googleapis` / `fonts.gstatic` in the deployed HTML, CSS and JS | 0 | pass |

## Notes

- **Local `.env` key is dead.** The free `GET /api/v1/key` check returned 401 "User not found." for the local key (as the #95/#115 check found). The prod secret is a different, working key: `/api/health` is `ok` before and after the deploy. Local paid runs need a new key in `.env`.
- **JS +58.5 kB gz** is React Flow. The CSS grew 2.4 kB gz with React Flow's base styles and no new `url()`s.
- No hosted chat call ran: no unlock and no paid call. The chat path is covered by the cookieless `POST /api/chat` (401 with `reason`) and by `/api/health`. The verifier owns the demo.
- Other sessions' worktrees (`…/b8b9f924…/scratchpad/wt96`, `.claude/worktrees/words-123`) are still registered. They aren't this deploy's worktrees, so they were left alone.
