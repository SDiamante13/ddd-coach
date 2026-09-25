# Slice 06 (#6): "Copy for your RFC", with the term table, questions and events as rich text plus Markdown

The spec is issue #6's body and comments (interviews 02–06), with the build rules in `outputs/design/export-rules.md` (DESIGNER, from 05c). The inputs are #64's `ReplyBlocks`, #85's question sources and #86's `restoreNames` seam.

In one line: under each laid-out reply, a **Copy for your RFC** button puts the reply's term table, open question and events on the clipboard. It writes `text/html` (a real table when pasted into Confluence) and a complete Markdown mirror in `text/plain` (a clean GitHub table), with real names restored. It then says how many rows are still guesses.

## Goal fit
- **ICP:** the rich-text term table is Priya's "one thing" before her RFC on 30 Oct (03a).
  - She once pasted Markdown into Confluence, got pipes, and rebuilt the table by hand (02).
  - Her fix-up time should drop from about 25 minutes to well under 8 (05c).
  - Export is also how her work moves from her home laptop to her work laptop (#5).
- **Ours, not a commodity (06):** the question and the term table. Events come along as they are, with no extra investment.
- **DDD proportionality:** a pure export model and two pure renderers over the existing `ReplyBlocks`. No server, contract or prompt change.

## Format decision
- **Clipboard, not a download.** She pastes into Confluence (rich) or a repo decision record (Markdown). One click writes both:
  - `text/html`;
  - `text/plain` with the full Markdown mirror.

  It uses `navigator.clipboard.write([new ClipboardItem(...)])`, and falls back to `writeText(markdown)` where `ClipboardItem` is missing. A `.md` download is out (U1).
- **Per reply.** The button sits under each reply that has a words or question block, and copies that reply. A conversation can hold several analyses, and the one she cares about is the one she's looking at (U2).
- **Contents, in order** (from `export-rules.md`, trimmed to what the app knows today):
  1. **"As of <date copied>"**, e.g. "As of 25 Sep 2026". This is the only date the tool makes itself: never invent a date.
  2. **"Words that don't match"**: a table with Term | Team | Meaning | Source, one row per meaning.
     - A split team keeps its credited rows ("Ops (night shift)", "Ops (day desk)").
     - Guess rows say "Guess" in the Source and start the Meaning with "Guess: ", because borders and italics vanish on paste (02).
     - The header is "Source", never "Status".
  3. **"Open questions"**: "Question for <roles>[, at <forum>]: <question>". Under it go the two `From thread: "…"` source lines (#85). The roles and forum come from the reply, so every question names its roles.
  4. **"Events, in order"**: a numbered list, each item prefixed "From thread:" or "Guess:".
  5. **If the reply was cut:** a last line, "The coach's reply was cut short here; ask it to continue for the rest."
- **Restored names (#86):** the export is built from `restoreNames(reply)`, so she gets real names. The copy only goes to her own clipboard.
- **Left out:**
  - off-layout text blocks (coach chat, per the "Out of the copy" rule);
  - the data-flow notice;
  - the "names restored" marker line.
- **After copy:** the button's status says "Copied for your RFC", and adds "N rows are still guesses" when N > 0 (05c).

## Deferred to a later slice (needs state the app doesn't have yet)
Export-rules invariants 2, 3, 6 and 7 are the interactive table (Exploration 03c): "I checked" with yes, no and "couldn't tell", one fact in one place, corrections replacing old wording, and per-row evidence. They need a per-row status model that doesn't exist yet. The same goes for the **settle-by line** ("if you set one"): there's no input for it yet. These are listed for the PO as a follow-up issue. This slice ships the frozen sections and order with no status column.

## Acceptance criteria
1. **Button.** A reply with a words or question block shows "Copy for your RFC". Prose replies (greeting, follow-ups) don't show it.
2. **Markdown mirror.** After a click, `text/plain` equals:
   - `As of <d MMM yyyy>`;
   - a blank line, then `## Words that don't match`;
   - a GitHub table `| Term | Team | Meaning | Source |` with `|---|---|---|---|` and one row per meaning, the term only on its first row;
   - `## Open questions`, with `- Question for …: …?` and the source lines as nested `  - From thread: "…"`;
   - `## Events, in order`, with `1. From thread: …`.

   Pipes in cells are escaped (`\|`), and newlines become spaces.
3. **Rich text.** `text/html` holds the same sections:
   - an `<h2>` per section;
   - a `<table>` with `<th>` headers (Term, Team, Meaning, Source);
   - a `<ul>` of questions with nested source items;
   - an `<ol>` of events.

   **Every cell is HTML-escaped**, so `<img onerror>` from a reply arrives as text.
4. **Guesses.** A Guess meaning's row reads Source "Guess" and a Meaning that starts "Guess: ". The status line says "2 rows are still guesses" for two such rows, and says nothing about guesses for none.
5. **Restored names.** With the swap Acme Foods → Customer A, the copied table, question and sources say "Acme Foods", and no "Customer A" appears.
6. **Nothing invented.** The only generated date is the "As of" line, from the copy time (an injected clock in tests). No other date appears unless the reply had it.
7. **Cut reply.** A reply ending in the cut note copies its complete parts plus the cut line, with no "Open questions" section if the question was cut.
8. **Fallback.** Where `ClipboardItem` is unavailable, `writeText` gets the Markdown and the status still says "Copied for your RFC". On a clipboard error, the status says "Couldn't copy. Select the reply and copy it instead."
9. `bin/check.sh` is green, and no existing suite changes.

## Test order (outside-in; one failure per turn)
0. No refactor is needed: `parseReply`, `restoreNames` and the clipboard stub (user-event) exist.
1. **Acceptance** (`src/acceptance/rfcCopy.test.tsx`): the button appears on a laid-out reply (red), then a click puts Markdown with the header row in `text/plain` (red).
2. **`src/domain/rfcExport.ts`**, pure:
   - `rfcDocument(blocks)` returns `{words, questions, events, cut}`, dropping text blocks;
   - `toMarkdown(doc, asOf)`, one section at a time: table, then escaping, then questions with sources, then events, then the cut line;
   - `toHtml(doc, asOf)`: the same order, with escaping mutation-checked.
3. **Clipboard:** `copyRich(html, markdown)`, with the `ClipboardItem` path and the `writeText` fallback, and the error status.
4. **The guess count and status line**; restored names through the seam (AC 5); no prompt, so nothing to re-score.
5. **Styles:** the button sits under the question card, matching the Copy the conversation button.

## Prompt and eval impact (#78)
None. The export reads v11's existing layout through `parseReply`. No prompt, snapshot, key or version changes, so no A/B and **$0** for the build.

## Demo script (verifier; `outputs/demos/slice-06.{mp4,png,md}`, about $0.01)
1. Production, 1280×800. Add the swap Acme Foods → Customer A.
2. Try an example thread, with one line edited to name Acme Foods, and send it.
3. Under the reply, click **Copy for your RFC**. The status reads "Copied for your RFC" (plus any guess count).
4. Paste into a scratch page with a `contenteditable` box (the rich paste shows a real 4-column table and lists) and a `<textarea>` (the Markdown mirror). Confluence isn't available, so this stands in for it.
5. Paste the Markdown into a GitHub gist preview, or any Markdown renderer, to show the clean table (Marcus's fidelity check).
6. Show "Acme Foods" in the copy and "Customer A" in "Show what's sent" and in the fetch spy.
7. Record the paste screenshots and the copied Markdown verbatim in `slice-06.md`.

## Out of scope
- The interactive status table (Exploration 03c: "I checked", corrections, one fact in one place, evidence per row).
- The settle-by input.
- Copying the whole conversation as an RFC (U2).
- A `.md` download (U1).
- Miro, Mermaid and images.
- #7 carry-over.
- A real-practitioner check (#70), which comes after the build.

## Decisions (recommended defaults marked)
- **U1: clipboard or download.** **Recommended: clipboard only** (HTML plus the Markdown mirror), since she pastes into Confluence or a repo. The alternative adds a `.md` download.
- **U2: scope of one copy.** **Recommended: the reply the button sits under.** The alternative merges every analysed reply in the conversation into one document.
- **U3: the date format.** **Recommended: "As of 25 Sep 2026"** (day, short month, year; unambiguous across US and UK).
- **U4: Guess in the Meaning cell.** **Recommended: prefix "Guess: "** as well as the Source column, so the label survives a copy of the Meaning cell alone (02, and export rule "in both the meaning and the source").
- **U5: the cut reply.** **Recommended: export the complete parts plus one cut line.** The alternative hides the button on cut replies.
- **U6: the question's sources in the export.** **Recommended: included**, as nested "From thread:" lines under the question. #85 exists so she can see why the question matters.
- **U7: the deferred 03c invariants.** **Recommended: a follow-up issue**, "Interactive term table: I checked, corrections, one fact in one place, settle-by".
