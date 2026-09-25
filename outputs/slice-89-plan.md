# Slice 89 (#89, P1): the swaps panel no longer hides the conversation

The spec is issue #89's body (from the #56 demo): with "Your swaps" open, the sticky composer takes about 80% of a 1280×577 viewport, and after a send the You bubble and the reply hide behind it. It folds in #65's measured `--composer-reserve`.

## Decisions
- **D1. Close on send (chosen over moving the panel).** The swaps belong with the draft they change, and #56's demo shows people open the panel while writing. After a send the draft is empty, so there's nothing left to swap and the panel has done its job.
  - The `<details>` becomes controlled: `useComposer` owns `swapsOpen`, `submit` closes it, and `onToggle` keeps it in sync with the visitor's clicks.
  - Moving the panel above the log was the alternative. It would put the swaps far from the draft and push the log down on every visit.
- **D2. A visible "What's sent" heading.** The preview region gets an `<h2>` "What's sent" and is labelled by it (`aria-labelledby`), replacing the `aria-label`.
- **D3. A measured reserve (#65).** A `useComposerReserve(form)` hook watches the composer with a `ResizeObserver` and sets `--composer-reserve` on `<html>` to `<height>px + var(--space-4)`.
  - `scroll-padding-bottom` and the #66 follow logic then track the real composer at any panel or draft size.
  - Where `ResizeObserver` doesn't exist (jsdom, old browsers), the CSS fallback `calc(38vh + 11rem)` stays.
  - It's cleaned up on unmount.

## Acceptance
1. With "Your swaps" open and a swap added, sending a message closes the panel. It opens again on click, and its list is kept.
2. After that send, the You bubble and the reply are visible without scrolling at 1280×577. This is a $0 browser check on a mock-API Vite, with a screenshot.
3. The "What's sent" preview shows a visible heading and is a region named by it.
4. `--composer-reserve` equals the composer's observed height plus the gap, and follows it when the height changes (a unit test with a stubbed `ResizeObserver`).
5. `bin/check.sh` is green. The existing swaps and follow-log suites pass.

## Test order
1. Acceptance: the panel closes on send (red: it stays open), then it reopens with the list kept (guard).
2. Acceptance: the "What's sent" heading (red: no heading).
3. The reserve hook, with a stubbed `ResizeObserver` (red: the variable isn't set), then it follows a height change.
4. The $0 browser check at 1280×577 (panel open, a swap, send, mock reply), with a screenshot.

No prompt, server or eval change.
