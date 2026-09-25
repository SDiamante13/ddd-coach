# #42 demo: design-token restyle on production

Covers #42 (design tokens, base styles, self-hosted fonts) and #46 (small caps replace uppercase on the Message and You/Coach labels). Deployed from a worktree at `18d8337`, before any #37 code.

- Deploy id: `6ab5fef3f916d00538a38822` (production, `https://ddd-coach.netlify.app`)
- Deploy log: https://app.netlify.com/projects/ddd-coach/deploys/6ab5fef3f916d00538a38822
- Gate: `npm ci` + `bin/check.sh` green in the worktree (no `.env` there, so the smoke test was skipped)

## Before / after

| State | Before (slice 2a, unstyled) | After (#42, production) | DESIGNER preview |
|---|---|---|---|
| Replied, desktop 1280×800 | [slice-02a.png](slice-02a.png): browser defaults, Times, inline input | [slice-42-light.png](slice-42-light.png): tokens, IBM Plex Sans body, Bricolage Grotesque heading, You/Coach cards, docked composer | [before-slice-02.png](../design/tokens-preview/before-slice-02.png) |
| Failed with Retry, desktop | [slice-01-3-failure.png](slice-01-3-failure.png): plain text, default button | [slice-42-failed.png](slice-42-failed.png): error-tinted notice, outlined Retry | [after-light-failed.png](../design/tokens-preview/after-light-failed.png), [after-dark-failed.png](../design/tokens-preview/after-dark-failed.png) |
| Phone 390 px | not captured | [slice-42-phone.png](slice-42-phone.png): full-width cards, no horizontal scroll | [after-phone-pending.png](../design/tokens-preview/after-phone-pending.png) |

Video: [slice-42.mp4](slice-42.mp4), 27.5 s, 1280×578, h264 yuv420p. Send → pending → reply → offline send → "Could not reach the coach." + Retry → online Retry → reply. The recorder ignores `set media`, so the video shows the dark theme; the PNGs show light.

## Hosted checks

| Check | Result |
|---|---|
| Fonts same-origin | 4 faces loaded (Bricolage Grotesque 700, IBM Plex Sans 400/600, IBM Plex Mono 500), all `/assets/*.woff2` on `ddd-coach.netlify.app` |
| No Google font requests | 0 requests to `fonts.googleapis.com` / `fonts.gstatic.com`; 0 matches in `dist/` and in the deployed JS/CSS |
| Resources loaded | `index-*.js`, `index-*.css`, 4 woff2, `/.netlify/scripts/hud`, `/favicon.ico`, `/api/chat` |
| Console / page errors | none |
| Real chat reply | non-empty replies to "what is a bounded context?", "what is an aggregate?" (after Retry), and the video's two questions |
| Headers on `/` | `x-content-type-options: nosniff`, `referrer-policy: strict-origin-when-cross-origin`, CSP `frame-ancestors 'none'; object-src 'none'; base-uri 'self'`, HSTS `max-age=31536000; includeSubDomains; preload` |
| `GET /api/chat` | 405 `application/json` `{"error":"Use POST."}`, with nosniff |
| Secrets in bundle | `sk-or`/`OPENROUTER`: 0 in `dist/`, 0 in each deployed JS/CSS; `chat.zip` has no `.env` and 0 `sk-or`; no `.map` files |
| Source not served | `/.env`, `/src/main.tsx`, `/server/config.ts` → 404 |
| Phone 390 px | `scrollWidth` 390 = `clientWidth`: no horizontal scroll |
| #46 small caps | `innerText` reads "Message", "You", "Coach", not uppercase |

## Findings

1. **Netlify badge covers part of Send on phone** ([slice-42-phone.png](slice-42-phone.png)). The fixed "Powered by Netlify" badge overlaps the bottom of the Send button at 390 px. Same badge as slice 2a fresh-eyes 4; turning it off in site settings fixes both. **Resolved by #52:** `built_with_badge_enabled: false` set via `netlify api updateSite` (no redeploy).
2. **The sticky composer can cover Retry.** In a 1280×577 viewport, scrolling Retry into view left it under the docked composer, and an automated click landed on the composer. Scrolling to the bottom first fixed it. A user who scrolls up far enough to put Retry at the viewport bottom hits the same overlap.
