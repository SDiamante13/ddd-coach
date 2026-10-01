# Repo-export runs for #113, #118 and #122 (2026-09-26 to 2026-09-30)

These runs measured how a coding agent (Opus via `claude -p`) behaves in a toy repo that carries DDD Coach's "Copy for your repo" export (`GLOSSARY.md` plus a CLAUDE.md section). Full write-ups are in the issue comments:
- **#113**, four arms (fb287cc): https://github.com/SDiamante13/ddd-coach/issues/113#issuecomment-5844768116
- **#118**, arm A (6ea5c54): https://github.com/SDiamante13/ddd-coach/issues/118#issuecomment-5914971360
- **#122**, arm A, n=3 (0f8651c): https://github.com/SDiamante13/ddd-coach/issues/122#issuecomment-5915104335
- **#122**, 3 more runs (0f8651c), strict split: https://github.com/SDiamante13/ddd-coach/issues/122#issuecomment-5915147357
- **#122**, final run (40dc503): https://github.com/SDiamante13/ddd-coach/issues/122#issuecomment-5915235985

## How to reproduce

- **Toy repo:** the `freightdesk` baseline in `2026-10-01-114-synonyms.md`, **without** the four #114 additions:
  - `docs/ledgerlink.md`;
  - `lib/ledger_link.rb`;
  - `Invoice#void_line!` and the `InvoiceTest` class in `test/invoicing_test.rb`;
  - the `docs/` line in `CLAUDE.md`.

  That leaves 5 passing tests.
- **Export:** generated with the same tsx script as in the #114 record, run against each commit below, with the reply below and `asOf = new Date(2026, 8, 26, 10, 0)`.
- **Arms:**
  - **A:** GLOSSARY.md + section.
  - **B:** GLOSSARY.md only.
  - **C:** section only.
  - **D:** neither.
- **Flags:** the same `claude -p` flags as the #114 record. The per-run cap was `--max-budget-usd 0.6` for #113 and 0.5 after that.

## Fictional coach reply (export input)

```
Words that don't match
"booking"
- From thread: Ops (day desk) means a load a customer submitted for a pickup, counted on the day desk board from submitted_at.
- From thread: Finance means a shipment it can invoice, counted on the ledger from invoiceable_at.
- From thread: Code means the Booking class in booking.rb, with submitted_at and invoiceable_at.
"cancellation"
- From thread: Ops (day desk) means the customer calling off a load before pickup, whether they say "cancellation" or "void".
"credit note"
- From thread: Finance means the document that reverses an invoice line for a load that was called off, whether they say "credit note" or "credit memo".
"short notice"
- From thread: Ops (day desk) means a load called off after its truck was dispatched.
- From thread: Finance means a load called off less than 24 hours before its pickup time, which carries the $150 fee.

Question for the day desk lead and the finance lead, at Thursday's ops review: For load 51210, called off at 06:10 for a 09:00 pickup with no truck dispatched yet, is it short notice, and does the $150 fee apply?
From thread: "51210 was called off this morning, is that short notice? finance wants to bill the 150"
```

The export turns this into:
- `booking`, settled, with the Ops (day desk), Finance and Code rows;
- `cancellation`, settled, with **Don't use `void`**;
- `credit note`, settled, with **Don't use `credit memo`**;
- `short notice`, **Unsettled** (Q1).

## Task text (identical in every run)

```
1. Customer Brightwell called off load 51210 this morning, and the code has no way to record that. Add cancelling a booking. If it was already invoiced, finance needs that invoice line reversed.
2. If it's short notice, bill the $150 fee.
3. Add a count of cancelled bookings for this week. The day desk and finance will both read it.

Keep the change small and in the existing style, and add tests. I'm offline for the rest of the day, so don't ask me anything: if something is unclear, make the call you think is right and say what you left open.
```

## Rubric (written before the #113 runs; reused unchanged)
- **R1, invented domain terms (count).** New domain words in identifiers that aren't baseline identifiers, the 4 glossary terms or their inflections, or task nouns.
- **S, synonyms (count).** Uses of a Don't use word, or another word for a glossary concept (e.g. "Reversal" for the credit note), in names, comments or user-visible strings.
- **X, booking split (0/1).**
  - 1 = the cancelled count keeps the day desk and finance meanings apart.
  - **Strict** (from the second #122 batch on): both teams' counts must be built.
  - **Lenient:** deferring with a stated reason also counts.
- **R3, unsettled short notice (0/1/2).**
  - 2 = no code decides it, the point is marked with a TODO, and the question is surfaced.
  - 1 = surfaced, but one reading shipped.
  - 0 = picked silently.
- **TODO(glossary)** present at the fee point, and anywhere else.
- **C, settled parts built (0–3):** cancel recorded, invoiced line reversed, cancelled count.
- **Added in #118/#122:**
  - a guard that turns "before pickup" (meaning text) into a rule;
  - a guard against cancelling twice.

## Scores

| Batch | Export | Arm | n | Booking split (X) | Short notice (R3 = 2) | TODO(glossary) at fee | Credit-note name | Synonyms | Before-pickup guard | Double-cancel guard | Cost |
|---|---|---|---|---|---|---|---|---|---|---|---|
| #113 | fb287cc | A | 3 | 3/3 | 3/3 | 3/3 | 3/3 | 0 | 1/3 | 1/3 | $1.26 |
| #113 | fb287cc | B | 3 | 3/3 | 3/3 | 3/3 | 3/3 | 0 | 3/3 | 3/3 | $1.21 |
| #113 | fb287cc | C | 3 | 3/3 | 3/3 | 3/3 | 3/3 | 0 | 0/3 | 3/3 | $1.03 |
| #113 | fb287cc | D | 3 | **0/3** | **0/3** (all hard-coded under 24h) | 0/3 | **0/3** ("Reversal") | 3 | 0/3 | 3/3 | $1.09 |
| #118 | 6ea5c54 | A | 3 | 3/3 | 3/3 | 3/3 | 3/3 | 0 | 0/3 | **0/3** | $1.03 |
| #122 | 0f8651c | A | 6 | **3/6 strict** (6/6 lenient) | 6/6 | 6/6 | 6/6 | 0 | **1/6** | 6/6 | $2.23 |
| #122 final | 40dc503 | A | 3 | **3/3 strict** | 3/3 | 3/3 | 3/3 | 0 | 0/3 | 3/3 | $1.13 |

**Invented domain terms (R1):** 0 in every run. Every run built all the settled parts (C = 3), and every run's tests passed.

## What each export change did
- **fb287cc → 6ea5c54 (#118):** the settled line gained the bare class name `Booking`, and a new rule appeared: "definitions, not business rules to implement". The before-pickup guard went from 4/6 (runs with GLOSSARY.md) to 0/3, but the double-cancel guard also dropped to 0/3.
- **→ 0f8651c (#122):** added "ordinary integrity checks (idempotency, nulls, duplicates) still apply". The double-cancel guard recovered to 6/6. The strict split fell to 3/6, and 1/6 runs guarded on "before pickup".
- **→ 40dc503 (#122):** added "Build every settled meaning in each context that uses it, giving each context its own result; only Unsettled points wait." Strict split 3/3, before-pickup guard 0/3. **Passed.**

## Final CLAUDE section (40dc503)

```markdown
## Domain language (from GLOSSARY.md)

Generated by DDD Coach, 26 Sep 2026, from one coach reply to a pasted thread. Regenerate rather than hand-edit.

Settled terms. Build on these, each in the context named (meanings in `GLOSSARY.md`):
- `booking` for Ops (day desk), Finance, Code; in code `Booking`, `booking.rb`, `submitted_at`, `invoiceable_at`
- `cancellation` for Ops (day desk)
- `credit note` for Finance

- Use these exact terms in specs, tickets, code names, filenames and the API surface. Never abbreviate or rename them; if something has no name, ask instead of coining one.
- A term's meaning depends on its context; never merge meanings across contexts. Build every settled meaning in each context that uses it, giving each context its own result; only Unsettled points wait.
- Meanings say what a word refers to; they are definitions, not business rules to implement; ordinary integrity checks (idempotency, nulls, duplicates) still apply. Never write an unsettled reading's condition into code as if it were settled.
- **Unsettled, don't pick a side:** `short notice` (Q1). Don't name code, columns or statuses after either reading. Leave a `TODO(glossary): <term>` at that one point, keep building everything else, and say what you left open.
- **Don't use:** `void` (write `cancellation`), `credit memo` (write `credit note`). The thread uses these for the same meaning as a term in `GLOSSARY.md`.
```

## Caveats
- **Small n:** n=3 to 6 per batch, one task, one model (`claude-opus-5-5`), one toy repo written by someone who knew the hypothesis.
- **Scoring:** one scorer. Only #113 was scored by shuffled ID, and the final messages leaked the arm there.
- **The task stays the same:** the same task text was reused across export versions, so the runs measure tuning on this one task rather than how the export generalises.
- **Cost:** about $8.97 across all 30 runs (#113 $4.58 incl. probe, #118 $1.03, #122 $3.36).
