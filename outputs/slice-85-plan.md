# Slice 85 (#85, P1): the question shows the two thread lines it joins

The spec is issue #85's body plus the PO's comment: slotted between #64 and #6. It's a prompt change (v11), a verbatim source-lines hard check and a #78 A/B. This plan covers the prompt and eval half. **The UI half** (the question card shows `sources`) comes after #64's rendering lands, and **v11 must not be deployed before that UI**: the lines would show as loose text under the card.

## Goal fit

- **ICP:**
  - Interview 07: the example thread's value is seeing **why** the question is good, and only the demo caption showed the two lines.
  - Priya triages runs by the question.
  - A question she can check against her own paste in two lines is one she can take into the room.
- **Honesty:** the lines are verbatim from her paste (never book citations, #58), and the eval proves it.
- **DDD proportionality:** a prompt rule and one pure check. No domain types.

## Decisions

### D1. Reply shape
The question line is followed by exactly two lines, and nothing after them:
```
Question for the ops lead and the finance controller, at the 27 Oct review: For load 48213, which count includes the new row?
From thread: "a booking exists the moment the customer hits submit"
From thread: "for finance it's only a booking once it's invoiceable"
```
- Each quote is a **short, contiguous excerpt** of one line of the paste, copied exactly. There's no speaker name, and no ellipsis inside the quote.
- The two excerpts come from the two far-apart parts the question joins.
- The "From thread:" label reuses the reply's own source vocabulary. The #64 parser will read these lines as the question's `sources`.

### D2. Hard check `question sources` (thread fixtures only, gating)
It fails unless all of these hold:
- exactly two `From thread: "…"` lines follow the question, and nothing else does;
- each quote, after normalizing whitespace and curly/straight quotes and apostrophes, is a **substring of the pasted thread**, case-sensitive;
- the two quotes differ;
- each quote is 3–30 words.

`no names` already scans every line, so a quote with a person's name in it fails there.

### D3. Check fix: `complete ending` judges the question
It now checks the last line that isn't a source line, i.e. the question. A verbatim Slack excerpt rarely ends with a full stop, and the source lines aren't the model's own sentences. For replies without source lines (all recorded ones), nothing changes.

### D4. Prompt v11 = v10 plus the rule
- **Part 3** gains: "Under the question, write the two lines it draws on, each on its own line as `From thread: "<exact words>"`: a short stretch copied exactly from one line of the visitor's paste, without the speaker's name. Nothing follows them."
- "Stop after the question" and the checklist's "nothing follows the question" become "nothing follows the question's two source lines".
- The example gets its two source lines.

## Test order (TDD, one failure per turn)

1. **`complete ending` ignores source lines** after the question (red: a reply ending in `From thread: "…invoiceable"` fails complete ending).
2. **`question sources`:**
   - fails with no source lines;
   - passes with two verbatim lines;
   - fails when a quote isn't in the thread;
   - fails with one line, or three;
   - fails on duplicate quotes;
   - passes across curly and straight quotes and extra spaces;
   - fails on a 31-word quote.
3. **$0 re-score** of the v8-v10 A/B (the v10 baseline). Expected:
   - `question sources` fails 24/24 in both arms, so there's no drop and the verdict is unchanged;
   - `complete ending` is unchanged.
4. **Prompt v11:** update the content assertions (red), then the prompt. `npm test` writes `coach-instructions.v11.txt`.
5. **Paid A/B** under the #78 rule:
   ```
   OPENROUTER_MODEL=openai/gpt-5.6-terra OPENROUTER_REASONING_EFFORT=none npm run eval -- --ab 11 --live 10 \
     --target "booking-split:question sources,rebook-notes:question sources,carrier-status:question sources,example-thread:question sources"
   ```
   - n=6, 84 calls, about $0.33. **Cap $1.00**: at most one retry (a v12) if v11 misses on a fixable drop.
   - Ship: commit the prompt and `LIVE_INSTRUCTIONS_VERSION = 11`, but **don't deploy until #64's card renders `sources`** (team-lead gates the deploy).
   - No ship: revert the prompt to v10, keep the v11 snapshot and result as a record, and escalate.
   - The expected target is 0/24 → about 20/24+.
   - Watch items: `no names` (a quote that includes a speaker), the 600-word ceiling, and F1 length.

## Acceptance (this half)

1. `question sources` and the `complete ending` fix are covered by tests. The $0 re-score of the v10 baseline is recorded in `summary.md`.
2. v11's A/B is recorded (JSON, md and a `summary.md` section) with its verdict, per-check x/n and spend.
3. If it ships, every v11 thread reply's two quotes are verified verbatim by the check, and a hand-read confirms they're the lines the question joins.

## Out of scope
- The question card's `sources` rendering (#64 follow-on, `src/ui`).
- #6 export carrying the sources.
- Book citations (#58).
