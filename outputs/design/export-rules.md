# Export rules for #6 (glossary copy)

Distilled from synthetic interviews 03a–05c and prototypes 03 → 03c. Build with these, then validate with a real practitioner rather than another synthetic table round.

## What the copy contains, in order

1. **As of** line: "As of <the date you copied it>". This is the only date the tool generates itself.
2. The settle-by line, if you set one.
3. The table: Term, Team, Meaning, Source.
4. Open questions, each with its joint roles and forum.
5. Events, in order.

Rich text as `text/html`. A complete Markdown mirror of all five parts goes in `text/plain`, with the same headers ("Source", never "Status").

## Invariants

- **Never invent a date.** A cell shows a date only if the source text had one, or it records a moment inside the tool (you checked, you pasted notes). A thread saying "Tue" stays "Tue" and gets no calendar date.
- **One fact, one place.** A status change (for example, "I checked load 48213") updates every cell, open question and question for Dana that depends on it, in the same step. Derive them all from a single state; never patch one cell.
- **Corrections replace.** When a note is corrected, its old wording never appears again: not in rows, not in questions, not in lines for Dana. Keep the latest dated confirmation (e.g. "Confirmed by Dana, 8 Oct"), not the first one.
- **Disagreement is credited, with evidence.** A split inside a team is two rows, each credited and backed by a case: e.g. "Ops, current practice (load 48213)" and "Dana's 2019 sheet". Never one row using a word someone has corrected.
- **Guesses say so.** Anything not in the pasted material is labelled "Guess", in both the meaning and the source.
- **Ask only what's open.** Lines for Dana never re-ask what she has answered, and never restate a corrected note. They can ask for evidence, e.g. "Which contract clause covers the TONU fee?"
- **Self-checks can say no.** "I checked" offers yes, no and "couldn't tell". Each outcome updates the dependent cells.

## Out of the copy

- Coach explanations, move lines and technique names (#58).
- The data-flow notice. That's app chrome, and it must name the model actually in use, from config.
