# Deploy: /api/health, the /data page, OpenAI routing pin, citation footer polish and "New conversation" (2026-09-25)

- Commit: `6ccdf26`, built from a pinned detached worktree outside the repo (removed afterwards). The main tree's uncommitted v14 prompt work was not in the build.
- Site: `ddd-coach` (`40f5c583-82ea-47fa-b007-65f2cf19cac2`), https://ddd-coach.netlify.app
- Deploy id: `6ab75a320c34123a85881de8` (state `ready`, context `production`). It replaces `4da6864` (deploy `6ab70d870c34127c79881de8`).
- Log: https://app.netlify.com/projects/ddd-coach/deploys/6ab75a320c34123a85881de8
- Command: `npx netlify deploy --prod --site <id>` (Netlify CLI 27.9.0 from the worktree's `node_modules`), exit 0
- Live `/` serves `index-C6i_80DE.js` and `index-D64_U4C4.css`. The hash matches the worktree build, and both files are byte-identical to it. The live HTML differs from `dist/index.html` only by Netlify's injected "hosted on Netlify" comment.

Contents:
- #102: citation footer polish.
- #107: `GET /api/health`, which reports `ok`, `key_invalid`, `key_expiring`, `provider_unreachable` or `config_invalid`.
- #84/#88: "New conversation" wording.
- #55: the notice discloses OpenAI's 30-day retention. There is a new `/data` page, served through a `netlify.toml` rewrite.
- #110: provider routing is pinned to OpenAI (`order: [openai]`, `allowFallbacks: false`, `dataCollection: "deny"`), and `readConfig` refuses a model outside `openai/`.
- #100: the glossary UI and its server field ship, but `GLOSSARY_ENABLED` is `false`.

## Pre-deploy

| Check | Result |
|---|---|
| `LIVE_INSTRUCTIONS_VERSION` and `COACH_INSTRUCTIONS_VERSION` at `6ccdf26` | 13 and 13 |
| `GLOSSARY_ENABLED` in `src/shared/features.ts` | `false` |
| `npm ci` + `bin/check.sh` in the worktree | pass on the first run |
| Shell had no `OPENROUTER_*` vars, so the paid smoke test was skipped | pass |
| `OPENROUTER_MODEL` starts with `openai/` (required by the #110 config check) | true |
| `OPENROUTER_MODEL` == `openai/gpt-5.6-terra` (production) | true |
| `OPENROUTER_REASONING_EFFORT` == `none` | true |
| `OPENROUTER_API_KEY`, `COACH_SIGNING_KEY`, `ACCESS_PASSWORD` | set |
| `COACH_TIMEOUT_MS`, `DDD_COACH_PROBE`, `GLOSSARY_ENABLED` env | absent |

Env was read with a filtered `env:list --json` that prints booleans only. No env var was changed. The CLI returns secret values masked, so a length check on them (for example the signing key's 32-character minimum) says nothing. Hosted `/api/health` and the session and chat 401s cover them instead.

## After the deploy

| Check | Expected | Result |
|---|---|---|
| `GET /api/health` | 200 `{"ok":true,"status":"ok"}` | pass: 200 `{"ok":true,"status":"ok","detail":null}`, and the same again after the worktree was removed |
| `POST /api/health` | 405 | pass |
| `GET /data` | 200 app shell through the rewrite | pass: 200 `text/html`, byte-identical to `/` |
| `/data` headers | nosniff, Referrer-Policy, CSP | pass: `nosniff`, `strict-origin-when-cross-origin`, `frame-ancestors 'none'; object-src 'none'; base-uri 'self'` |
| `/data` renders in a browser | data page | pass: headings "Where your text goes", "Who handles it", "How long it's kept", "Training", "What our server keeps", "What stays in your browser" |
| "routes them to OpenAI" | present | pass. It is on the rendered `/` notice along with "30 days", and `/` links to `/data`. In the bundle it is a template (`routes them to ${…name}`) with the constant `{slug:"openai",name:"OpenAI",…}`, so the literal phrase only appears once rendered |
| "Where your text goes", "New conversation" in the bundle | present | pass (2 / 2) |
| "Keep these words" in the bundle and on the rendered pages | 0 | pass |
| Routing pin in the deployed `chat` bundle | `order: [coachProvider.slug], allowFallbacks: false, dataCollection: "deny"` | present |
| Deployed function sizes match the local zips (`available_functions`) | equal | pass: `chat` 1,773,950, `health` 1,172,031, `session` 1,172,094, `unlock` 1,172,622 |
| Reference sentinel in `chat.zip` / anywhere in `dist/` | present / 0 | pass |

## Hosted checks

| Check | Expected | Result |
|---|---|---|
| `/` headers | nosniff, Referrer-Policy, CSP | pass |
| `GET /api/chat` | 405 | pass |
| `POST /api/chat` without cookie | 401 | pass: 401 JSON "Your access has expired. …", `cache-control: no-cache` |
| `GET /api/session` without cookie | 401 `no-store` | pass |
| `GET /api/unlock` | 405 `Allow: POST`, `no-store` | pass |
| `/.env`, `/src/main.tsx`, `/server/config.ts`, `/server/healthHandler.ts`, `/netlify.toml` | 404 | pass |
| `sk-or` / `OPENROUTER` in the deployed HTML, JS, CSS and `/data` | 0 | pass (0 / 0 in each) |
| `sk-or` in the `chat`, `health`, `session`, `unlock` zips | 0 | pass |
| `OPENROUTER` in the function zips | env var names only | pass: `process.env` names and the SDK's own names (`OPENROUTER_BASE_URL`, `OPENROUTER_TRACES` and so on); no values |
| `.env` or `.map` in the function zips; `.map` in `dist/`; served `*.map` | none, 404 | pass |
| Earlier features still bundled: "Copy for your RFC", "What's sent", "Names restored in this browser", "CC BY 4.0" | present | pass |
| Font URLs in the deployed CSS are same-origin | all `/assets/…` | pass (49 of 49; 26 woff2, all 200) |
| `fonts.googleapis` / `fonts.gstatic` in the deployed HTML, CSS, JS | 0 | pass |
| Fonts loaded in the browser | self-hosted families | pass: `Bricolage Grotesque Variable`, `IBM Plex Sans`; Bricolage woff2 is 200 `font/woff2` |

## Notes

- No hosted chat call ran. Unlocking needs the password, and the password file is missing, so there was no paid call. The chat path is covered by `POST /api/chat` without a cookie (401) and by `/api/health`, which is `ok` only when the key is valid and `readConfig` accepts the model and effort.
- Nothing was unlocked. No bogus-password unlock was sent either.
- The verifier owns the demo: a real reply through the OpenAI-pinned route, the "New conversation" control behind the gate, and the citation footer.
- The chat 401 still carries Netlify's default `no-cache` rather than an explicit `no-store`. It's harmless and unchanged since the slice 63 deploy.
