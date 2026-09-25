# Slice 73 (#71 + #73): sound eval checks, then a question that asks and views that hold

One slice, two issues, in this order:

1. **#71**: fix the eval and reply-ending bugs. (a) goes first because the no-names check backs the 9/9 claim. (b)–(d) ride along.
2. **#73**: prompt v5, plus eval checks that cover **every** word in the reply, and a ship bar where **every** run passes.

Production is `openai/gpt-5.6-terra`, effort `none`. Dev `.env` is `openai/gpt-6-luna`, so every paid eval sets terra on the command line (see Spend).

## Goal fit

- **Real DDD problem (ICP):** in interview 06, Priya copied a view A/B flip into her RFC pre-read. "A slip that looks wrong gets caught; one that looks consistent gets copied." Run 2 of the same file gave "advice dressed as a question". "A question I have to run twice to trust is half a question." Her job for the coach is now the question ("one tab, one job").
- **Trust:** without (a), a regression that names José would pass the eval.
- **DDD proportionality:** no new domain types, aggregates or services. Pure check functions in `server/eval/`, key data in JSON, and a prompt text change.

## Verified facts (main at `4f038cf`, 2026-09-25)

- **(a) reproduces.** `new RegExp("\\bJosé\\b").test("José in Finance")` is `false`. `\bAna\b` matches inside "Anaïs" (a false hit). `\bC.J.\b` misses "C.J. means". Source: `containsWord`, `server/eval/replyChecks.ts`.
- **(b):** `endsComplete` uses `/[.?!)]$/`, which rejects `says "same booking."`. `replyEnding`'s `SENTENCE_END` accepts `["')\]]` after the stop. Neither accepts curly `”` or `’`, and terra writes curly `’` ("Customer B’s").
- **(c) reproduces.** `endOnCompleteLine("…one thing.\n- From thread: Finance means a change, e.g. a da")` keeps "…a change, e.g." as the last line.
- **(d) reproduces.** `median([1,2,3,4])` is `3`. It should be `2.5`. The latency spike uses 5 runs, so the gate isn't affected today.
- `RegExp.escape` exists at runtime (Node 24.21), but `tsconfig` lib is ES2022, so the types don't have it. Use a local escape helper.
- The key JSONs already carry `teams` (`["Ops","Finance","Carriers","Code"]` etc.), but `FixtureKey` doesn't declare it and nothing reads it.
- `shipBar` uses `TWO_THIRDS_SCORES` (split, codeLine, questionSpansThread). `shipBar.test.ts` has "still ships when the split shows in 2 of 3 runs".
- Recorded terra v4 replies (`outputs/evals/slice-03/2026-09-25-openai-gpt-5-6-terra-v4.json`) under the new checks, read by hand:
  - **Question asks:** F1 r1 and r3, F2 r2 and r3, and F3 r3 are closed yes/no questions ("should it remain one booking…?"). F1 r2, F2 r1, and F3 r1 and r2 offer options with "or".
  - **Split labels:** F2 r1 has "Ops means" and "Ops (view B) means" under "AMENDED". F2 r2 has two plain "Ops means" lines under "RB" and under "booking". F2 r3 has the same under "booking".
  - **Same meaning split:** F1 r3's "hold" has "Ops (view A) means waiting on the customer" and "Ops (view B) does not use hold". That's the demo's finding 1.
  - **Holders:** F3 r1–r3 have "Customers see…". That fails unless F3's key allows Customers (see decision U1).
  - So v4 fails the new bar. That's expected, and it shows the checks bite.
- Interview 06 Part C (lines 55–84) is a realistic reply with both planted slips: "Night dispatch means…" and a "hold" split whose view A is the night meaning. It makes a good unit-test fixture.
- The working tree has uncommitted changes (`server/chatHandler.ts` and its test, and outputs files) from another session. Don't stage them.

## Decisions

### 1. #71 fixes (TDD each)

- **(a)** `containsWord` escapes the name and uses Unicode letter boundaries: `(?<![\p{L}\p{N}_])` + escaped name + `(?![\p{L}\p{N}_])` with the `u` flag. It NFC-normalizes both the reply and the name, so a decomposed "José" still matches. Matching stays case-sensitive (no scope creep). The new unit-test fixtures live in `replyChecks.test.ts`, not in the paid eval.
- **(b)** A single shared predicate: export `endsSentence(line)` (or the pattern) from `server/replyEnding.ts`, and have `endsComplete` use it. Closing marks allowed after `.?!`: `" ' ” ’ ) ]`. A bare `)` with no stop no longer passes, which matches `replyEnding`.
- **(c)** `SENTENCE_END` ignores a stop that ends `e.g.`, `i.e.` or `vs.` (case-insensitive). `etc.` still ends a sentence, because it often really does.
- **(d)** For an even count, `median` averages the two middle values. An empty list stays `0`.
- **Re-running #4's eval for #71:** only the checker changed, so re-score the **recorded** terra v4 replies offline at $0 (decision 5). The paid run comes with v5.

### 2. New hard checks (#73), deterministic, over every word

They run on `parseCoachReply`/`parseLayout` output. Each word block is its quoted word plus its `- ` meaning lines.

| Check | Rule | Key data |
|---|---|---|
| `holders` | Every meaning line, after its source label, starts with an allowed holder: one of `key.teams`, or "Code" or "Team unclear". Team matching ignores case, and the longest team wins ("Carrier desk" before "Carrier"). An optional ` (view A)` or ` (view B)` follows, then a space and a lowercase word that isn't part of a key group name ("night", "day", "desk", "shift", "dispatch"). "Night dispatch means", "Night Ops means", "Ops night shift means", "Ops (night) means" and "The dashboard counts" all fail. | `teams` (added to the `FixtureKey` type) |
| `split labels` | Under one word, a team never has both a plain line and a view line. It never has two plain lines, and never the same view label twice. A single view line on its own is allowed. | none |
| `stable views` | Each `<team> (view X)` line is classified by the key's group markers. A line counts only if it hits one group's markers and not the other's. Lines with no hits or both are ignored. Fail if a view label maps to two groups across the reply, or both labels map to one group. | `expect.views` |
| `same meaning not split` | If a quoted word matches one of a `sameMeaning` entry's words, that block has no view lines for the entry's team. Blocks for these words are also left out of `stable views`. | `expect.sameMeaning` |
| `question asks` | Fails if the question text has a proposal marker: `shouldn't`, `isn't it`, `wouldn't it`, `doesn't it`, `why not`, `recommend`, `suggest`, `propose`, `instead of`, `better to`, `best to`, `the right (choice\|call\|answer)`. Also fails if it's closed: no open word (what, which, who, whose, whom, where, how, whether; **not** "when", which usually opens a condition) and no ` or ` in the last comma-separated clause. | none |

Test cases for `question asks`, all from real replies:
- **Must fail:**
  - "should Ops keep one booking and send AMENDED so Finance issues one invoice?" (interview 06 run 2)
  - "should the portal still show Confirmed?" (v4 F3 r3)
  - "should it remain one booking and one invoice after the carrier bills TONU on the original load?" (v4 F2 r2)
  - "is that still an appointment?"
  - "Shouldn't Ops amend instead of rebook?"
- **Must pass:**
  - "was the second invoice matched to the original booking ref or to the new tender ID?" (interview 06 run 1)
  - "should the portal show Confirmed or a different status?" (v4 F3 r1)
  - "For a date-only change…, should Ops create a new booking or record an AMENDED change…?" (v4 F2 r1)
  - `GOOD_REPLY`'s "which one does a same-carrier date change keep?"

This is a heuristic, so false passes are possible (an "or" inside a condition, a leading question built on "which"). The verifier hand-reads every question in the report as a backstop. An LLM judge is out of scope.

### 3. New ship-bar score and the tighter bar

- A new soft score, `sameMeaningNamed`. If the reply quotes one of a `sameMeaning` entry's words, some meaning line in that block names both words. If neither word is quoted, it holds by default.
- **Ship bar:** hard 9/9 and attribution 9/9, as before. Per fixture, `split`, `codeLine`, `questionSpansThread` and `sameMeaningNamed` must now hold in **3/3** runs (was 2/3). Rename `TWO_THIRDS_SCORES` to reflect every run, and update the `evalSummary` headers to "(3/3)". `jointRoles` and `forum` stay reported only.
- N stays 3 (`REPEATS`).

### 4. Key data

Marker lists are starting data. The builder tunes them **only** against recorded replies: the 9 v4 replies plus the interview 06 Part C reply. Every tweak made after a paid run must cite a misread line, recorded in the summary, so the markers aren't gamed.

- **F1 `booking-split`:**
  - `teams`: add "Carrier desk" (the thread's "carrier desk here").
  - `expect.views`: `{ team: "Ops", groups: [{ name: "day desk", markers: ["same booking","same ref","2019","sheet","trained","sync is the bug","button is broken","shift plan"] }, { name: "night shift", markers: ["every change","everything","every one","any date","all changes","at night","overnight","2am","1am","subtract","minus","in their heads","reliably","safe"] }] }`
  - `expect.sameMeaning`: `[{ team: "Ops", words: [["hold"], ["waiting on customer","waiting on the customer"]] }]`
- **F2 `rebook-notes`:**
  - `teams`: add "Carrier desk".
  - `expect.splitTeam`: "Ops", with `splitTerms` `[]`.
  - `expect.views`: day desk markers `["same bkg","same booking","same ref","2019","sheet"]`; night shift markers `["night","everything","safe","2am","until amend"]`.
- **F3 `carrier-status`:** `teams` += "Customers" and "Carriers" (decision U1).

### 5. Offline re-score tool

`node server/eval/rescore.ts <eval.json>` re-scores recorded runs with the current checks. It's a thin I/O shell like `checkReply.ts`, reusing `scoreReply`, `shipBar` and `evalSummary`, and it prints the bar and each run's failures. It costs $0 and serves #71's re-run and the v4 baseline under the new checks. Record the output in `summary.md`.

### 6. Prompt v5 (the domain-steward/builder may polish the wording; keep the intent)

`COACH_INSTRUCTIONS_VERSION = 5` and a new snapshot `coach-instructions.v5.txt`. v4's snapshot stays. Examples come from the clinic business, **never** from the eval fixtures, to avoid overfitting.

- **Part 2, views** (append to the view bullet): *"Decide once, before Part 2: view A is the group that appears first in the material and view B the other. Keep that for every word in the reply. Where the two groups agree on a word, write one plain line for the team. Under one word, never give a team both a plain line and a view line, or two plain lines."*
- **Part 2, two words, one meaning** (new bullet): *"When two groups use different words for the same meaning, such as "hold" and "waiting on customer", that isn't a split. Write one line for the team that names both words, such as: From thread: Ops means a booking waiting on the customer, whether they say "hold" or "waiting on customer"."*
- **Part 2, holders** (new bullet): *"Start every meaning line with a team the thread names, "Code" or "Team unclear", then the view label if there is one. Never start it with a shift, desk or group inside a team, such as "Night dispatch", "Night Ops" or "Day desk". That group's view goes under its team's view label."*
- **Part 3, ask, don't propose** (append): *"Ask; don't propose. The question holds no answer and no recommendation. Make it an open question (what, which, who, how many) or a choice between the options the thread gives, joined by "or". Never ask a yes/no question that hands them an answer to agree to, such as "should the front desk keep the slot?"."*
- **Example:**
  - Preface: *"…the day receptionist (view A, first in the notes) and the evening receptionist (view B) disagree…"*
  - Add a second word showing two words for one meaning, e.g. `"pending"`: *"From thread: Front desk means a request nobody has confirmed yet, whether they say "pending" or "unconfirmed"."* plus a Billing line.
  - Change the example question to a choice: *"…which does billing see: an appointment, a request, or nothing yet?"*
- **Checklist**, adding four lines:
  - *"View A is the same group under every word, and so is view B; no team has a plain line and a view line under one word."*
  - *"Every meaning line starts with a team, "Code" or "Team unclear", never a shift or desk."*
  - *"Two words for one meaning are one line naming both, not two views."*
  - *"The question asks: it is open or offers the thread's options joined by "or", and holds no answer or advice."*

## Acceptance criteria

1. **(#71a)** The no-names check catches "José", including in NFD form, and a regex-metacharacter name ("C.J."). It no longer false-matches "Ana" inside "Anaïs".
2. **(#71b)** `endsComplete` and `replyEnding` share one sentence-end rule. A line ending `."`, `.”` or `?’` is complete in both. A bare `)` is not.
3. **(#71c)** A reply cut after "e.g. a da" keeps only the previous complete line. The same goes for "i.e." and "vs.".
4. **(#71d)** `median([1,2,3,4])` is 2.5, and odd counts are unchanged.
5. **(#71)** Re-scoring the recorded terra v4 replies with the fixed checks still gives 9/9 hard under the **old** check set, or the gap is reported in `summary.md`.
6. **(#73 eval)** The five new hard checks and `sameMeaningNamed` exist and cover every word. The interview 06 Part C reply fails `holders` and `same meaning not split`. A view flip between two non-same-meaning words fails `stable views`.
7. **(#73 bar)** `split`, `codeLine`, `questionSpansThread` and `sameMeaningNamed` must hold in 3/3 runs per fixture. A 2/3 fixture no longer ships.
8. **(#73 baseline)** v4 recorded replies re-scored under the new bar don't ship, and the failing checks are listed in `summary.md`.
9. **(#73 prompt)** v5 is snapshot-tested and the version is bumped. The snapshot contains the four new rules and the new example.
10. **(#73 ship)** A terra eval (effort none, v5 or a later version up to v7) ships under the new bar: 0 hard failures in 9/9 runs, and every per-fixture score 3/3. The result file's `model` is `openai/gpt-5.6-terra`. `summary.md` gains the row and the new bar text.
11. **(Hosted)** After deploy, the hosted F1 and F2 first turns pass `checkReply` with 0 hard failures. The verifier's hand-read confirms the view mapping and that the question asks.

## Test order (each red → green, one failure per turn)

**#71** (`server/eval/replyChecks.test.ts`, `server/replyEnding.test.ts`, `server/eval/latency.test.ts`)
1. "no names" fails for "From thread: José in Finance means…" (red: ASCII `\b`). Fix it with Unicode boundaries.
2. Triangulate: an NFD "José" is caught, "Ana" isn't matched inside "Anaïs", "C.J." is caught, and a name with `(` doesn't throw.
3. "complete ending" passes a last line ending `booking."` (red). Then share the predicate with `replyEnding`. Add curly `”`/`’` cases to both suites. A bare `)` fails.
4. `endOnCompleteLine` doesn't stop at "e.g." (red). Then "i.e.", "vs.", and case "E.g.".
5. `median([1,2,3,4])` is 2.5 (red). Add a `latencyVerdict` case with 4 runs.
6. `rescore.ts` on the v4 JSON, with the **old** hard set plus the fixes, gives 9/9. Record it. (This is an I/O shell, so run it, no unit test.)

**#73 eval** (the bar is set before the prompt changes)

7. `FixtureKey` gains `teams`, `expect.views` and `expect.sameMeaning`. This is a type-only change, covered by the tests below.
8. `holders`: fail each of "Night dispatch means", "Night Ops means", "Ops night shift means", "Ops (night) means", "The dashboard counts", and "Customers see" when Customers isn't in `teams`. Pass "Ops (view A) means", "Code creates" and "Team unclear means".
9. `split labels`: two plain "Ops" lines under one word, a plain line plus a view line, and the same view twice all fail. A lone view line passes.
10. `stable views`: rebook view A with day markers and booking-count view A with night markers fails. Consistent labels pass. A line with both groups' markers is ignored.
11. `same meaning not split`: the interview 06 Part C reply (adapted to the test fixture) fails. A single plain Ops line under "hold" passes.
12. `sameMeaningNamed`: "hold" quoted with one line naming both words is true. Naming only one word is false. With neither word quoted, it's true.
13. `question asks`: the table in decision 2. Keep `GOOD_REPLY` passing every check.
14. `shipBar`: flip "still ships 2 of 3" to "does not ship". Add a `sameMeaningNamed` 2/3 case. Update the `evalSummary` headers.
15. Key JSONs for F1–F3 (decision 4). `rescore.ts` on v4 then gives the baseline for AC 8. Record it.

**#73 prompt**

16. The `coachInstructions` snapshot test goes red on version 5. Write the v5 text and add a `toContain` test for each of the four new rules.
17. **Paid:** run the terra eval (Spend). If it doesn't ship, change the prompt (v6, then v7) and re-run. Stop after v7 and escalate.
18. Update `summary.md`: the new bar, the v5 row (and v6/v7 if used), the v4 re-score rows and the spend. `bin/check.sh` is green.

## Spend and model

- **Command:** `OPENROUTER_MODEL=openai/gpt-5.6-terra OPENROUTER_REASONING_EFFORT=none npm run eval`. The shell env beats `--env-file`. Check that the result JSON's `model` and `reasoningEffort` say terra and none before trusting it.
- **Per eval (9 calls):** the recorded terra v4 run cost $0.063 (first call about $0.023 uncached, repeats about $0.005–0.007 with prompt caching). Budget about $0.2 per eval in case caching doesn't hit.
- **Cap:** 3 prompt versions (v5–v7), so at most 3 paid evals, about $0.2–0.6. Hosted verification is 2–3 first turns at about $0.02 each. **Slice ceiling: about $0.7.** Re-scores and unit tests are free.
- **No latency re-gate.** v5 adds about 300 prompt tokens against about 5k for the thread. The hosted step records first-turn times. If the median goes over 15 s, flag #8.
- **Escalate after v7** with the failing checks and replies, and options: (i) accept 2/3 on one score, (ii) a legend line or group-named labels (decision U2), (iii) a stronger model or effort `low` (cost and latency).

## Layout (files touched)

- `server/eval/replyChecks.ts` (+test): names, complete ending, 5 hard checks, `sameMeaningNamed`, `FixtureKey`. If it passes about 200 lines, split the view/holder checks into `server/eval/viewChecks.ts`.
- `server/replyEnding.ts` (+test): shared sentence end, abbreviations.
- `server/eval/latency.ts` (+test): median.
- `server/eval/shipBar.ts` (+test), `server/eval/evalSummary.ts`: the every-run bar.
- `server/eval/rescore.ts`: new I/O shell.
- `server/eval/fixtures/*.key.json`: key data.
- `server/coachInstructions.ts` (+test), `server/__snapshots__/coach-instructions.v5.txt`.
- `outputs/evals/slice-03/`: new result files, `summary.md`. The eval stays #4's eval, so the directory doesn't move.

## Suggested commits (committer owns them)

1. `feat` (a) names, 2. `feat` (b) shared sentence end, 3. `feat` (c) abbreviations, 4. `feat` (d) median, 5. `feat` the rescore tool with the v4 re-score recorded, 6. `feat` the #73 checks, keys and bar with the v4 baseline recorded, 7. `feat` prompt v5 with the eval result and summary. The sweeper then runs its ACN refactors.

## Out of scope

- **#8** streaming, **#56** word swap and preview, **#58** knowledge base.
- #6 export and its Team column; #64 structured rendering (including Exploration 06's parser splitting "Ops (view A) means").
- **The question's forum:**
  - lowercase "tue 27 oct" (the thread writes it that way);
  - "right question, wrong room" (the roles don't fit the named meeting).
- "Code" as a holder when someone describes code rather than pasting it (Priya's "Ravi reading the EDI job").
- Shift or desk names in **event** lines ("Night shift uses Rebook"). The #73 hard check covers holders only. Noted as a risk.
- An LLM judge for "asks, not proposes"; new fixtures from real threads (#70); dev parity for gpt-6-luna.

## Risks

- **Marker classification is fuzzy.** Conservative rules (exclusive hits only) mean few false fails and some false passes. The `same meaning not split` check is the deterministic net for the demo's actual flip ("hold"). The hand-read in hosted verification is the backstop.
- **The every-run bar may be hard to hit** at temperature defaults. That's why iterations are capped at 3, followed by escalation.
- **Question heuristic.** It forbids yes/no questions outright. That's a product stance: a yes/no question hands the expert an answer. Priya's own "which should produce a second invoice" was "a ruling", which still passes (it uses "which"). Accepted.
- **Overfitting.** The prompt examples stay in the clinic domain, and marker tweaks after paid runs must be justified line by line.
- **Holder allow-list too tight.** "Customers" and "Carriers" in F3, and "Carrier desk" in F1 and F2, are parties the thread gives a view to. A new party in a real thread is out of the eval's reach anyway.
- **Hot reload.** `netlify dev` reloads on `server/` saves. Edit `coachInstructions.ts` and its snapshot in one step.

## Hosted verification (after deploy, verifier)

1. Open the hosted site with a named agent-browser session. Unlock with the access password from the deployer's redacted env flow, and **never write it into any file or log**.
2. Paste F1 (`booking-split.txt`) as the first turn, then New conversation and paste F2 (`rebook-notes.txt`). Save each reply to the scratchpad and note first-turn ms.
3. Run `node server/eval/checkReply.ts booking-split <reply.txt>`, and the same for `rebook-notes`. Expect 0 hard failures, including the five new checks.
4. Hand-read each reply:
   - view A is the same group under every word;
   - "hold" is one line naming both words (if quoted);
   - no shift or desk as a holder;
   - the question asks and holds no answer. Is it one she wouldn't have thought of?
5. Record the results in `outputs/demos/slice-73.md`: 2 first turns, the ms, the `checkReply` output and the hand-read. Spend is about $0.05. If the slice needs a video demo, the verifier records steps 2–4 with captions on view labels across words and on the question.

## Decisions put to the user

- **U1: allowed holders per fixture.** Recommended: allow the parties each thread gives a view to. That's "Customers" and "Carriers" in F3, and "Carrier desk" in F1 and F2. Otherwise terra's F3 "Customers see…" fails `holders` in every run. The alternative is to forbid Customers and let the prompt fold the customer view into Ops or Code.
- **U2: fallback if v5–v7 can't hold views.** Recommended: keep "Ops (view A)/(view B)", per the #4 and #73 spec. Escalate with the data. The alternative, which contradicts #73's "no desk name as holder", is a legend line or group-named labels ("Ops (night shift)"). Priya offered it herself ("give me the names from the thread… I'll rename them"). It would make stability visible and trivially checkable, but it changes the layout, #6's Team column and #64.
- **FYI (not blocking):** #71's "re-run the #4 eval" is met by an offline re-score of the recorded terra v4 replies ($0), because only the checker changed. The paid run comes with v5.

## Approved (2026-09-25, team-lead)

- **U1:** allow the parties each thread gives a view to. F3 `teams` gains "Customers" and "Carriers". F1 and F2 `teams` gain "Carrier desk".
- **U2:** keep "Ops (view A)/(view B)", with no spec change. If v7 still can't keep the views stable, escalate to team-lead with the failing checks and replies.
- **The uncommitted `server/chatHandler.ts` changes** are sweeper-6's #41 sweep in progress. The builder doesn't touch or stage them.
