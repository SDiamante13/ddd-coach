# Deploy: prompt v13 grounded in the DDD Reference with the citation guard (#58), the reveal guard (3d871b8) and #100 refactors (2026-09-25)

- Commit: `4da6864`, built from a pinned detached worktree outside the repo (removed afterwards). The main tree's uncommitted #100 glossary work was not in the build.
- Site: `ddd-coach` (`40f5c583-82ea-47fa-b007-65f2cf19cac2`), https://ddd-coach.netlify.app
- Deploy id: `6ab70d870c34127c79881de8` (state `ready`, context `production`)
- Log: https://app.netlify.com/projects/ddd-coach/deploys/6ab70d870c34127c79881de8
- Command: `npx netlify deploy --prod --site <id>` (Netlify CLI 27.9.0 from the worktree's `node_modules`), exit 0
- Live `/` serves `index-CnFqFwBp.js` and `index-jkSHQ-P_.css`. The hash matches the worktree build and the deploy permalink, and both files are byte-identical to the build. The live HTML differs from `dist/index.html` only by Netlify's injected "hosted on Netlify" comment.

Contents: prompt v13, which puts the CC BY Evans DDD Reference (about 17k tokens) in the server-side prefix with cite-or-admit rules (#58). The server-side citation guard replaces any Source line that doesn't cite a verbatim Reference title with "General practice: not from the Reference." and logs only the count. The UI shows a quiet Source line and a CC BY footer. Also included: the reveal guard fix (3d871b8, #66) and #100 refactors with no behaviour change.

## Pre-deploy

| Check | Result |
|---|---|
| `LIVE_INSTRUCTIONS_VERSION` and `COACH_INSTRUCTIONS_VERSION` at `4da6864` | 13 and 13 |
| `npm ci` + `bin/check.sh` in worktree | pass on the first run (load average 19). This includes check.sh's own guard that the Reference sentinel is absent from `dist` |
| Shell had no `OPENROUTER_*` vars, so the paid smoke test was skipped | pass |
| `OPENROUTER_MODEL` == `openai/gpt-5.6-terra` (production) | true |
| `OPENROUTER_REASONING_EFFORT` == `none` | true |
| `OPENROUTER_API_KEY`, `COACH_SIGNING_KEY`, `ACCESS_PASSWORD` | set |
| `COACH_TIMEOUT_MS`, `DDD_COACH_PROBE` | absent |

Env was read with a filtered `env:list --json` that prints booleans only. No env var was changed.

## v13 and the Reference in the deployed chat function

| Check | Result |
|---|---|
| v13 phrases in the unzipped `chat.zip`: "The sources I have don't cover this.", "check the reference's contents for a section on that topic", "with nothing added before or after it" | pass (3 of 3 present) |
| v11-only wording absent: "general DDD idea, say it" | pass (0) |
| Reference text in `chat.zip`: "Domain-Driven Design Reference: Definitions and Pattern Summaries" and the sentinel "It has now been over ten year since the publication" | pass (present in both) |
| Guard label "General practice: not from the Reference." in `chat.zip` | present |
| Deployed `chat` size matches the local `chat.zip` (`available_functions`) | pass: 1,772,297 bytes both, up 31,177 from 1,741,120 at the v11 deploy. `session` is 1,172,031 bytes and `unlock` is 1,172,561 |

## Reference stays server-side

| Check | Expected | Result |
|---|---|---|
| Sentinel "It has now been over ten year since the publication" in deployed HTML, JS, CSS | 0 | pass (0 / 0 / 0) |
| Sentinel anywhere in the worktree's `dist/` | 0 | pass |
| `/server/knowledge/dddReference.ts`, `/work/ddd-reference-2015.txt` | 404 | pass |

## Hosted checks

| Check | Expected | Result |
|---|---|---|
| `/` headers | nosniff, Referrer-Policy, CSP | pass |
| `GET /api/chat` | 405 | pass |
| `POST /api/chat` without cookie | 401 + Cache-Control | pass: 401 JSON, `cache-control: no-cache` |
| `GET /api/session` without cookie | 401 `no-store` | pass |
| `GET /api/unlock` | 405 `Allow: POST`, `no-store` | pass |
| `POST /api/unlock` with a bogus password | 401 "That password isn't right. Try again, or ask the organizer for it." | pass |
| `/.env`, `/src/main.tsx`, `/server/config.ts` | 404 | pass |
| `sk-or` / `OPENROUTER` in deployed HTML, JS, CSS | 0 | pass (0 / 0 in each) |
| `sk-or` in `chat`, `unlock`, `session` zips | 0 | pass |
| `OPENROUTER` in the function zips | env var names only | pass: `process.env` names such as `OPENROUTER_API_KEY` and the SDK's `OPENROUTER_BASE_URL`; no values |
| `.env` or `.map` in the function zips | none | pass |
| `.map` in `dist/`, or served `*.map` | none, 404 | pass |
| Footer CC BY links in the bundle: `https://creativecommons.org/licenses/by/4.0/`, `https://www.domainlanguage.com/ddd/reference/`, "CC BY 4.0", "The coach draws on Eric Evans," | present | pass; CSS has `.attribution` |
| Source line UI in the bundle: `citation-label` and "Evans, Domain-Driven Design Reference (2015)" | present | pass; CSS has `.citation` |
| Earlier features still bundled: "Copy for your RFC", "What's sent", "Names restored in this browser" | present | pass |
| Font URLs in deployed CSS are same-origin | all `/assets/…` | pass (49 of 49; 26 woff2, all 200) |
| `fonts.googleapis` / `fonts.gstatic` in deployed HTML, CSS, JS | 0 | pass (0 / 0 / 0) |
| Bricolage woff2 served | 200 `font/woff2` | pass; CSS declares `Bricolage Grotesque Variable` |

## Notes

- Nothing was unlocked and no paid chat call ran. One bogus-password POST to unlock was sent, well under the 30/min limit.
- The verifier owns the demo: a reply with a Source line, a not-covered question that opens with "The sources I have don't cover this.", the footer credit, and the first-turn latency with the bigger prefix.
- The chat 401 still carries Netlify's default `no-cache` rather than an explicit `no-store`. It's harmless and unchanged since the slice 63 deploy.
