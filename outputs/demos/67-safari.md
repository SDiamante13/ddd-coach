# Safari check: WebKit smoke test of the paste box and board (#67) (2026-10-01)

**Engine, not the Safari app.** Run in Playwright's WebKit 26.6 (`playwright-core` `install webkit`, downloaded to `~/Library/Caches/ms-playwright`, no sudo and no system change), headless, 1280×800, beside system Chrome 154 with the same script. The local fixture server (`COACH_FIXTURES=1` Vite on main at `2460a30`) answered with canned replies, so there were no paid calls.

Driving the real Safari app needs **Safari ▸ Settings ▸ Advanced ▸ Show features for web developers**, then **Develop ▸ Allow Remote Automation**, and `safaridriver --enable` (asks for an admin password). That's an owner-only setting change, so it wasn't done.

## Same in both engines

| Check | WebKit 26.6 | Chrome 154 |
|---|---|---|
| Shift+Enter keeps a new line; Enter sends it with the `\n` | yes | yes |
| Enter during IME composition (`isComposing`, keyCode 229) doesn't send | yes | yes |
| Example reply: 5 event cards, 3 term cards, no node left hidden | yes | yes |
| Wheel pans the board; Fit gives 50%; a click selects a card | yes | yes |
| Arrow key moves along the events lane | yes | yes |
| Copy for your RFC: `ClipboardItem` with text/html + text/plain, "Copied for your RFC." (real clipboard and spied) | yes | yes |
| Over the limit: "1,412 characters over the 24,000 limit…", Send disabled | yes | yes |
| Composer in view after scrolling to the end | yes | yes |

## Differences

1. **Fixed: "Try an example thread" couldn't be clicked.** Safari doesn't focus a button on click. Mousedown moved focus to `<body>`, so the empty form lost `:focus-within`, the resting composer (#111) folded the button to 0 px, and the click never landed (box left empty). The button now prevents its mousedown default, so focus stays in the box. After the fix: WebKit mousedown keeps focus on the textarea, the button stays 32 px, and the example fills (3,492 characters), as in Chrome.
2. **Open: no autofocus on load.** WebKit leaves focus on `<body>` at load (Chrome honours `autoFocus`), so on a first visit the composer starts at rest and hides "Try an example thread" until the visitor clicks the box. Not confirmed in the Safari app (needs the setting above). Possible fix: don't rest the composer before the first send (`restsAtStart` is already false then; the CSS `:not(:focus-within)` branch still applies).
3. **Minor: one console error.** WebKit reports "ResizeObserver loop completed with undelivered notifications" once while the board lays out. It's benign (no visible effect), and Chrome doesn't report it.

Main at `2460a30` doesn't yet have #132's menu keyboard fix, so Esc on the "I checked" button went to Zoom out in both engines. That's the known bug fixed on `fit-131`, not a Safari difference.
