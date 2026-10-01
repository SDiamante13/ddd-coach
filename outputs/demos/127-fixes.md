# Demo · #127 fix batch (re-check of the five 127-109fix findings, the margin words chip, Follow reveals)

- Video: `127-fixes.mp4`: one take, 91.2 s, h264 yuv420p, 1280×800. Captions are at the bottom-left; a green-on-black readout shows measured values; one reload happens in the take.
- Stills, both **separate fresh contexts with no overlays**:
  - `127-fixes.png` (1280×800): after reply 1 at 100%, scrolled a little. It shows the controls in the board's header row, the term rows uncovered, the dotted lines over the "weekly late report" card, and the margin's "← 3 terms on the board · 11 rows" chip with "Show as table" and both copy buttons.
  - `127-fixes-860.png` (860×800): the Overview toggle starts off below 900 px.
- **Magenta outlines and circles, captions and the readout are demo overlays, not app styling.**
- Build: pinned detached worktree of `main` at 698f9e0 outside the repo, `npm ci`, `npm run demo:board` (COACH_FIXTURES=1, port 5190), removed afterwards.
- Browser: system Google Chrome 154 (153+) via playwright-core, headless, fresh temporary profile, viewport-only capture. Chats delayed 1 s by a route.
- **Local fixture plus one in-page stub (the words-only reply with the word `7" pallet\`); no paid calls, no password. 0 page errors (the take and the 860 px context).**

## Re-check of the 127-109fix findings

| # | Finding then | Now | Result |
|---|---|---|---|
| 1 | Two board Tab stops; Tab out to the attribution | Tab from the heading: "OpenAI's data policy" → "How your data is handled" → **Zoom out → Zoom in → Fit the board → Overview → Follow coach** (header controls) → **one card stop** (Event 1) → **React Flow attribution** → "Show the 1 later event" edge chip. No `react-flow__nodes` stop | **Partial**: exactly one board stop ✔. The header controls come *before* the card (they're in the header row), so Tab from a card goes to the attribution, then the edge chip, not to the controls |
| 2 | Hint not stored on Esc | First keyboard arrival shows the new hint "← → along a row · ↑ ↓ between rows · Shift + arrows nudge · Enter corrects · Esc to the controls"; `ddd-coach.board-hint-seen = "1"` right away. A second keyboard arrival shows **no hint**; Esc → **Zoom out**. Reload while on the controls, arrive by keyboard: **no hint** | **Pass** |
| 3 | "Events 0 events" on a words-only reply | Header **"Words · 1 term · 2 rows"** | **Pass** |
| 4 | Line under the neighbouring term card | The "late › Account team" line crosses **over** the "weekly late report" card at (315, 686); the relates-edge SVG has z-index 20. With event 3 dragged under Event 4's line, a **double-click on the line** at (690, 352) opens **"Correct this event"** with "Load 7731 delivers 40 minutes…" | **Pass** |
| 5 | Controls, switch and MiniMap over the lower rows | Controls at 32–473 × 130–162, **above the canvas** (canvas starts at 162), in the header row. After scrolling at 100%, **11 term rows in view, 0 covered** by another element. Overview `aria-pressed=true` at 1280 px. **At 860 px, Overview starts `false` with no MiniMap**; toggling it shows the MiniMap | **Pass** |

## Also shown

| t (s) | Step | Observed |
|---|---|---|
| 57 | Words chip | Reply 1's margin shows **"← 3 terms on the board · 11 rows"**, "Show as table", **"Copy for your RFC"** and **"Copy for your repo"**. Click the chip: focus goes to **Term “late”** (words lane); **Follow coach true → false** |
| 65 | Show as table | `<details>` opens with the Word / Team / Meaning table (12 rows including the header) |
| 71 | Keyboard reveal | Switch Follow coach back ON, then Tab into the board. Roving focus returns to Term “late” and **Follow coach → false** |
| 80 | `7" pallet\` | New conversation, then a stubbed words-only reply whose word is `7" pallet\`. Term "Term “7" pallet\”, 2 meanings: Ops, Billing". Chip "← 1 term on the board · 2 rows" → click → **focus on Term “7" pallet\”** (no selector error) |
| 86 | End | Page errors: 0 |

## Gaps and observations

1. **Tab order (finding 1):** the board is one stop, but the controls precede it, so the expected "Tab from a card goes to the header controls" doesn't happen. After the card: the React Flow attribution, then the edge chip.
2. **Follow coach on keyboard focus:**
   - Tab-in onto the remembered term card turned Follow off, though the viewport reading was the same before and after (`translate(8px, −404px)`; the board was already scrolled from the chip click).
   - In a rehearsal, Tab and → onto in-view **event** cards left it on.
   - So the trigger seems to be "focus moved to a card the board reveals", but on camera there was no visible pan. Worth confirming which focus moves are meant to turn Follow off.
3. The line-over-event-card check needed a demo arrangement: I dragged event 3 under Event 4's line, because at the default layout no dotted line crosses an event card.
4. In the 1280 still, scrolling at 100% leaves the event row's lower edges as thin strips under the controls row.
5. Not checked: 577 and 390 px, touch, the margin chip's keyboard activation (only clicked), copy-button output, and reduced motion.
