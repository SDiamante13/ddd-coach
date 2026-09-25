# Paste box, too-long state, first visit (#57), notice: design handoff

Prototype: `pastebox.html`, built on `src/styles/tokens.css` and `base.css`. Its `<style>` block holds the proposed `base.css` additions. Stills are `p1`–`p5`; the demo is `explore-04-2.5x.mp4`.

## #50 Multiline box

- A `<textarea>` in place of `<input type="text">`. The `<label>` becomes `for=`/`id` so the accessible name "Message" stays.
- It grows with `field-sizing: content`, up to `max-height: 38vh` (30vh at ≤480 px), then scrolls. Browsers without `field-sizing` get a small JS autosize.
- Desktop: Enter sends and Shift+Enter adds a line, with a hint under the box. Touch (`pointer: coarse`): Enter adds a line and the Send button sends. Pasted line breaks survive, so "who said what" stays intact (03b).
- The placeholder is an example, not an instruction: `e.g. Ops: a booking exists the moment the customer submits…`.

## #51 / #35 Too long, draft kept

- The client checks against `MAX_MESSAGE_CHARS` (8,000) before sending:
  - At ≥80%: a count appears, `6,412 / 8,000 characters`, in amber.
  - Over the limit:
    - the textarea gets `aria-invalid="true"` and an alert tint;
    - Send is disabled;
    - a `role="alert"` box reads "1,412 characters over the 8,000 limit. Your text stays here. Trim it, or send it in two parts.";
    - the count turns alert-colored.
- Server 413 (per-message, or whole conversation):
  - restore the draft into the box;
  - show the same box, with the limit the server named;
  - never clear the draft on failure.
- "Send in two parts" is optional and could come later. It splits at the last line break before 8,000 characters and sends "Part 1 of 2" then "Part 2 of 2", labelled in the log. Ship "keep draft + count + limit" first.
- Long user entries in the log clamp to 4 lines, with a "Show more" / "Show less" button inside the prompt bubble.

## #54 Retry reachable

- The log gets bottom padding, and each `li` gets `scroll-margin-bottom` at least as tall as the composer. Recheck this at max textarea height.

## #57 First visit (ships in the paste-box slice)

- One purpose line under the h1: "Paste a messy thread, meeting notes or a status list. The coach finds the words people use differently, puts the events in order, and asks what to check next."
- Optionally, "Try an example thread" fills the box with the sanitized Eazy Freight thread. There's no tour.
- The purpose line and example button hide after the first send.

## #55 Notice weight

- An `<aside aria-label="Where your text goes">` with a lock icon and a `<details open>` whose summary is "Where your text goes". Body text is 14 px in ink (not muted), on the surface color, with a full border.
- Lines:
  - "Your browser sends it to **OpenRouter**, which routes it to **[MODEL COMPANY]** ([model id]) to write the reply."
  - "This app, run by **[OPERATOR]**, stores nothing on its server."
  - "Don't paste customer names, rates, lanes or contract terms."
  - A small line with retention and training links.
- After the first send it collapses to one line, "Where your text goes · show", so it stays reachable without crowding the log.
- [MODEL COMPANY] is derived from the configured model id prefix. The hosted model is `openai/gpt-5.6-terra`, so it reads "OpenAI (openai/gpt-5.6-terra)". [OPERATOR] stays a placeholder until Steven confirms. Nothing is hard-coded.

## Out of scope

The phone is "not broken" only (03b: not her context). There's no horizontal scroll at 390 px, and the page scrolls so the composer never hides the notice.
