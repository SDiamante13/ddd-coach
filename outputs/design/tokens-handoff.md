# Design tokens handoff (#42, settles #29c)

Files:

| File | What it is | Move to |
|---|---|---|
| `outputs/design/tokens.css` | Color, type, spacing, radius, focus, motion. Light by default; dark via `prefers-color-scheme` or `<html data-theme="dark">` | `src/styles/tokens.css` |
| `outputs/design/base.css` | Restyles today's screen using only element and role selectors (`main > h1`, `main > p`, `ol[role="log"]`, `p[role="alert"]`, `form`, `button`) | `src/styles/base.css` |
| `outputs/design/tokens-preview/*.html` | Static copies of the rendered app markup, used to check the CSS | Reference only |

## Wiring

1. In `src/main.tsx`, import `./styles/tokens.css` and then `./styles/base.css`, before `App`.
2. In `index.html` `<head>`, add the fonts (the fallbacks in `tokens.css` cover offline use):
   `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700&family=IBM+Plex+Mono:wght@500&family=IBM+Plex+Sans:ital,wght@0,400;0,600;1,400&display=swap">`
3. One markup change: `ExchangeEntry` renders `<li data-status={exchange.status}>`. Only the pending "thinking" pulse uses it. Everything else keys off the existing structure.

No `className`s and no behaviour change. Existing tests query roles and text, so they should stay green.

## Checked

- Rendered from the preview pages at 1280×800 (light, and dark with a focused input) and at 390×844. The phone view has no horizontal scroll (`scrollWidth` 390 = viewport).
- Focus ring: a 2 px surface gap plus a 2 px coach-blue ring on `:focus-visible`.
- Pending pulse and all motion stop under `prefers-reduced-motion`.
- Targets are at least 44 px (input, Send, Retry).

## Notes and open items

- Coupling: `base.css` relies on the log structure (the first `<p>` is the prompt, and the second is the reply or pending text) to add the "YOU" / "COACH" labels. If the entry markup changes, move to classes then.
- #2 asks the notice to name the configured model. Today's text says "OpenRouter, an AI model provider". The styling doesn't depend on the wording.
- Dark-mode accent: `--color-coach` lightens to `#93abec` so text on dark surfaces stays readable. `--color-on-coach` flips to dark ink for the Send button.
