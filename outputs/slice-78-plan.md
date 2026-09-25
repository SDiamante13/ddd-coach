# Slice 78 (#78, P1): a paired A/B ship bar for prompt versions

The spec is issue #78's body plus the PO's comment, which folds eval false negatives (a), (b) and (d) from #63 into this slice. This plan adds the decisions, test order, spend and verification.

In one line: `npm run eval -- --ab <candidate>` runs the candidate prompt and the live prompt side by side under production conditions, with n ≥ 6 runs per fixture per arm. It prints a paired table with pass rates as x/n, and a ship/no-ship verdict under the #78 rule.

## Goal fit

- **Real DDD problem (ICP):** Priya copies what the coach says into her RFC, so "a slip that looks consistent gets copied" (interview 06). A prompt change that fixes one fixture must not quietly break another. At n=3 we can't see the difference: v6 didn't reproduce its own 9/9 in the same session.
- **Learning:** paired comparison under noise, pass rates with n, and an answer-key guard so a key edit can't favour one arm.
- **DDD proportionality:** no domain types, aggregates or services. The work is pure functions in `server/eval/` and a thin I/O shell in `runEval.ts`.

## Verified facts (main at `6d9c354`, 2026-09-25)

**Prompt and conditions**
- **Live is v8.** `outputs/demos/slice-63-deploy.md` is titled "Deploy: slice #63 + #75 + coaching prompt v8". `COACH_INSTRUCTIONS_VERSION = 8`. (#76's comment "the live prompt is v6" is older than that deploy.)
- **Hosted prompt assembly:**
  - `netlify/functions/chat.mts` builds `createOpenRouterCoach(config, coachInstructions())` with no reference block;
  - the system message is the instructions string as-is;
  - the user message is the visitor's text.
- **Snapshots are exact prompt copies.** `server/__snapshots__/coach-instructions.v1…v8.txt` exist, and `coach-instructions.v8.txt === coachInstructions()` (checked: 9,070 chars each). So a version's snapshot is exactly its hosted system prompt. For the current version, `coachInstructions.test.ts` keeps the snapshot honest.
- **`measure()` hardcodes `coachInstructions()`** (`server/eval/measure.ts:18`), so nothing today can run a second prompt. The earlier v6/v8 A/B (`2026-09-25-ab-terra-v6-v8-threads.json`) was a one-off scratch script. Its format is an array of `{v, name, i, reply, …}` plus a trailing number. `rescore.ts` can't read it.
- **The quality eval already sends no nonce.** `fullEval` sends `verifiedConversationOf(fixture.thread.trim())` (92742ce). Only `latencySpike` prepends `nonceLine`.
- **Model and effort come from env** through `readConfig`. A shell env var beats `node --env-file` (see `agent-team.md`), and `.env` is gpt-6-luna for dev.

**Scoring and bar**
- `shipBar` is the strict single-arm bar:
  - every hard check and attribution must pass in every run;
  - split, codeLine and questionSpansThread must pass in every run of each fixture;
  - `"same meaning not split"` is reported only via the global `REPORTED_ONLY_HARD`;
  - `sameMeaningNamed` is tallied but doesn't gate.
- `evalSummary` headers still say "Split (3/3)".
- `REPEATS = 3`, and the fixtures are 7: F1 `booking-split`, F2 `rebook-notes`, F3 `carrier-status`, `example-thread`, and the non-thread `greeting`, `ddd-question` and `one-line-note`.
- Thread fixtures use `HARD_CHECKS` (16 checks) and non-thread fixtures use `NON_THREAD_CHECKS` (5).

**The three false negatives**, probed with node against HEAD:
- **(a) doesn't reproduce as written.** "Don't hesitate to paste your thread.", "Do not hesitate to send the thread." and "Never hesitate to share your notes." all **pass** today. The lookbehind only rejects a negation right before the verb, and "hesitate to" sits between them. (a) becomes real once (b) is fixed: "Don't hesitate to paste it here" must pass while "Don't paste it here" fails. So (a) is a regression guard on (b), and it must be mutation-verified (see Test order).
- **(b) reproduces.** "Paste it here.", "Hi! Paste it here when you're ready." and "Feel free to paste a Slack export." all fail `invites a thread`, because no thread noun comes within six words.
- **(d) reproduces.** With the nonce at `2026-09-25T09:14:02.000Z`:
  - `mentionsNonce` misses "Sep 25, 09:14", "2026-09-25 09:14" and "09:14:02 UTC";
  - it catches only the exact ISO string or "Pasted at".
- **Thread times collide with nonce times.** F1's thread has times like "8:30", "8:34" and "8:41", so a bare clock-time match would false-flag replies that quote the thread.
- **Latency JSONs can't be re-scored for (d).** They store `promptSha256`, not the prompt or the nonce time, so a $0 re-score of (d) against past spikes isn't possible.

**Cost and time on terra, effort none** (recorded runs)

| Fixture | Call cost, first (uncached) / repeat | Mean ms per call |
|---|---|---|
| F1 booking-split | $0.020 / $0.008 | 7,700 |
| F2 rebook-notes | $0.0067 / $0.0055 | 7,400 |
| F3 carrier-status | $0.0051 / $0.0040 | 4,600 |
| example-thread | $0.0077 / $0.0054 | 5,800 |
| non-thread (each) | about $0.001 | 2,000–3,000 |

The recorded runs are the v8 full eval (21 calls, $0.095) and the v6/v8 A/B (24 calls, $0.153).

## Decisions

### D1. Prompt source: a version number, read from its snapshot (make the change easy first)

- **Refactor first, as its own `r` commit.** `measure()` and `fullEval()` take an `instructions: string` parameter, with the default `coachInstructions()`, so behavior is unchanged. This is Kent Beck's "make the change easy". Existing tests stay green.
- **`server/eval/promptVersions.ts`:**
  - `instructionsOf(version, read)` returns the snapshot text for `vN`. It throws on an unknown version.
  - When `version === COACH_INSTRUCTIONS_VERSION` and the snapshot ≠ `coachInstructions()`, it throws "snapshot is stale; run npm test". That catches editing the prompt without regenerating the snapshot.
  - `LIVE_INSTRUCTIONS_VERSION = 8` (U3).
- **Arms:**
  - candidate = `--ab <N>`;
  - live = `--live <N>`, defaulting to `LIVE_INSTRUCTIONS_VERSION`;
  - both are snapshot texts, sent as the system message exactly as `chat.mts` would.

### D2. Production conditions

- **The user message is `fixture.thread.trim()`, with no nonce line.** Nonces stay in `latencySpike` only. A test asserts this through a fake `ChatClient` (see the fakes section below).
- **Model and effort are per-command overrides, not hardcoded.** The command sets `OPENROUTER_MODEL=openai/gpt-5.6-terra OPENROUTER_REASONING_EFFORT=none`. The result JSON and the md heading record the model and effort that were actually used. The verifier checks them before trusting a verdict.
- **Order: paired and interleaved.** For each fixture and each i in 1…n, both arms run back to back: live then candidate on odd i, candidate then live on even i. Drift over time and provider load then hit both arms alike. Calls are sequential, with no concurrency.
- **n:** `--runs`, default 6. Values below 6 are rejected, because the rule requires n ≥ 6.
- **Fixtures: all 7, every time (U6).** A regression anywhere counts.
- **Failures:** a call that throws gets one retry. If the retry also fails, the run aborts, writes the partial JSON and gives **no verdict**. Missing runs are never scored as passes or as fails.

### D3. The verdict (`server/eval/abVerdict.ts`, pure)

Inputs: the scored runs of both arms and the target.
- **Gating checks per fixture:** each applicable hard check (thread or non-thread set) except the reported-only `"same meaning not split"`, plus `attribution`, plus `split`, `codeLine` and `questionSpansThread`.
- **Reported only:** `sameMeaningNamed`, `"same meaning not split"`, `jointRoles`, `forum` and the rest of the soft scores. They're shown, but they never gate.
- **Tally:** for each fixture and check, count the passes per arm as `{passed, total}`. Both arms must have equal n per fixture, or the function throws.
- **(a) Target improves (U1, U2).**
  - `--target` is a comma list of `fixture` or `fixture:check`.
  - `fixture` alone means runs with no gating hard failure.
  - The target tally is summed over its entries.
  - It improves when **candidate − live ≥ 2 runs**, which is more than the one-run noise the regression rule tolerates.
- **(b) No regression:** for every fixture and gating check, `live.passed − candidate.passed ≤ 1`.
- **Ships** = (a) and (b).
- **The verdict lists the reasons:** the target's tallies and delta, and every (fixture, check) that dropped by 2 or more.
- **No target means no verdict:** the table prints with "No verdict: name the targeted failure with `--target`".

### D4. Report and records

- **`outputs/evals/slice-03/ab-<date>-<model-slug>-v<live>-v<candidate>.json`** holds:
  - `kind: "ab"`, `model`, `reasoningEffort` and `runs` (n);
  - `target` and the `verdict`;
  - `arms: {live: {version, instructionsSha256}, candidate: {…}}`;
  - `keys: {fixture: keySha256}`;
  - every call as `recordable(...)` plus `arm`, `version`, `fixture` and `i`, with the reply, finishReason, cost, ms, tokens, `hardFailures` and `soft`.
- **A `.md` with the same name** (`server/eval/abSummary.ts`, pure) holds:
  1. A heading with the model, effort, both versions and n, then the **verdict line**.
  2. The target row: live x/n → candidate x/n (delta).
  3. **A paired table:** fixture | check | live x/n | candidate x/n | Δ | flag. To keep it readable, it shows only rows where either arm missed at least once, and adds "all other gating checks n/n in both arms".
  4. The reported-only rows, labelled "(reported only)".
  5. **A budget line:** cost per arm, total cost, calls, median and max ms.
- **Counts are always shown as x/n**, never "3/3 = pass".
- **Single-arm `npm run eval` stays a diagnostic.** Its line "Ships: yes/no" becomes "Every run clean: yes/no", and its headers drop "(3/3)", so the A/B is the only ship verdict. `shipBar` keeps its logic.

### D5. Answer-key guard

- **`rescore.ts` learns A/B records.** When the JSON has `kind: "ab"`, it re-scores **both arms** with the current checks and keys and recomputes the verdict. That costs $0 and is symmetric by construction.
- **It names changed keys.** It compares each fixture's current key sha with the recorded one and prints "Keys changed since this run: example-thread". A key edit is then never silent.
- **The process rule goes into the docs (D6):** a key change that turns a fail into a pass gets its own commit with its reason, and the `rescore --ab` output of the latest A/B goes into `summary.md`.

### D6. Where the rule lives

- **`outputs/evals/slice-03/summary.md`** gets a new section, "Ship rule (#78)", with the rule, the command, the budget line and the key guard. It's the canonical text.
- **`outputs/agent-team.md`** gets one bullet under "Paid model runs": "Prompt changes ship only through `npm run eval -- --ab <N> --target …` (rule in `outputs/evals/slice-03/summary.md`)."

### D7. Check fixes folded in from #63

- **(b) invite without a thread noun (U7).** A non-negated `paste` counts on its own: in this app only material gets pasted. `share|drop|send|bring` still need a thread noun within six words, or `here|below|in the box` right after an optional object pronoun ("send it here").
- **(a) negation guard.** It stays verb-adjacent: `don't|do not|never` directly before the verb, after optional "just". So it doesn't reach back over "hesitate to", "forget to" or "wait,". "Don't paste customer names from a thread you can't share" and "Never send me messages with passwords" still fail.
- **(d) nonce as reformatted.**
  - `mentionsNonce(reply, pastedAt, thread)` also flags:
    - the nonce's UTC clock time `H:MM`/`HH:MM` (word-bounded, optional `:SS`);
    - its date as `2026-09-25`, `Sep 25`/`September 25` or `25 Sep`/`25 September`.
  - A time or date form is skipped when **it appears in the thread itself**, so F1's "8:30" can't false-flag.
  - `latencySpike` passes the thread in and records `pastedAt` (ISO) on each call, so future spikes can be re-scored at $0.
- **The #76 eval notes are out of scope** (see Out of scope).

## File layout

- `server/eval/measure.ts`, `server/eval/fullEval.ts`: the `instructions` parameter (the `r` commit).
- `server/eval/promptVersions.ts` (+test): `instructionsOf` and `LIVE_INSTRUCTIONS_VERSION`.
- `server/eval/abEval.ts` (+test): the paired, interleaved runner. It's generic over `ChatClient`.
- `server/eval/abVerdict.ts` (+test): the pure rule.
- `server/eval/abSummary.ts` (+test): the pure markdown.
- `server/eval/evalArgs.ts` (+test): pure argv parsing for `--ab`, `--live`, `--runs` and `--target`, with rejections.
- `server/eval/runEval.ts`: the `--ab` branch as an I/O shell (no unit test).
- `server/eval/rescore.ts`: the A/B mode, with key-change detection as a pure helper tested in `abVerdict.test.ts` or a small `keyChanges.test.ts`.
- `server/eval/replyChecks.ts` (+test): (a) and (b), and export the gating check names per fixture kind.
- `server/eval/latency.ts`, `latencySpike.ts` (+test): (d).
- `server/eval/evalSummary.ts`: the D4 label changes.
- `outputs/evals/slice-03/summary.md` and `outputs/agent-team.md`: D6. The new A/B result files also go in `outputs/evals/slice-03/`.

Each module stays small, with functions of 25 lines or fewer. `abEval` is split into `pairedOrder`, `runArm` and `scoredCall`.

## Acceptance criteria

1. **Command.**
   - `OPENROUTER_MODEL=openai/gpt-5.6-terra OPENROUTER_REASONING_EFFORT=none npm run eval -- --ab 8 --live 6 --target greeting,ddd-question,one-line-note` writes `ab-…-v6-v8.json` and `.md`.
   - The output has the paired table, the target row, a budget line and **Ship: yes/no** with reasons.
   - `--ab <N>` alone uses live = `LIVE_INSTRUCTIONS_VERSION`.
2. **Production conditions.**
   - Every call's system message equals the arm's `coach-instructions.vN.txt`, byte for byte.
   - Every user message equals `fixture.thread.trim()`, with no "Pasted at" line.
   - The model and effort recorded are the ones the env gave.
3. **n.** Each fixture has ≥ 6 runs per arm, the same n in both arms. `--runs 5` is rejected before any call.
4. **Rule.**
   - The verdict ships only when the target gains ≥ 2 runs (U1) and no gating (fixture, check) drops by more than one run.
   - Reported-only checks never block.
   - Missing `--target` gives no verdict.
   - An aborted run gives no verdict.
5. **Reporting.** Every count prints as x/n. The single-arm eval no longer prints "Ships", and its headers carry no "(3/3)".
6. **Answer-key guard.** `node server/eval/rescore.ts <ab.json>` re-scores both arms at $0, prints the verdict and names every fixture whose key changed since the run.
7. **Rule written down.** It's in `summary.md` (section "Ship rule (#78)"), with a pointer in `agent-team.md`.
8. **v8 decision under the rule.**
   - `summary.md` records the paid n=6 A/B of v6 vs v8: pass rates as x/n, the verdict and the spend.
   - v8's ship is recorded as the first decision under the rule, confirmed at n=6 or escalated (U5).
9. **(a)** "Don't hesitate to paste your thread." and "Don't hesitate to paste it here." pass `invites a thread`. "Don't paste it here." and the existing warn-only cases still fail.
10. **(b)** "Paste it here.", "Hi! Paste it here when you're ready." and "Feel free to paste a Slack export." pass `invites a thread`. "Share it with me." does not, since it has no destination and no thread noun.
11. **(d)** With the nonce at 09:14:02Z on 2026-09-25, `mentionsNonce` flags "Sep 25, 09:14", "2026-09-25 09:14" and "9:14 UTC". It doesn't flag "8:30" when the thread has "8:30" and the nonce is 08:30. Latency JSON calls carry `pastedAt`.
12. **Re-scores.** After (a), (b) and (d), a $0 re-score of `2026-09-25-openai-gpt-5-6-terra-v8.json` is recorded: non-thread stays 9/9 and the thread results are unchanged. The paid A/B is scored with the fixed checks, and `rescore` of its JSON reproduces the same verdict.
13. `bin/check.sh` is green.

## Test order (outside-in; each red → green, one failure per turn, predict the failure first)

**0. Make the change easy (refactor, `r` commit, no new behavior)**
- Thread `instructions` through `measure` and `fullEval` with the default `coachInstructions()`. All existing tests are green before and after.

**Check fixes first**, because the paid run must be scored by the fixed checks.
1. **(b)** `replyChecks.test.ts` → "pass invites a thread for a paste invite without a thread noun": "Paste it here." Red: `["invites a thread"]`. Minimal fix: a non-negated `paste` counts.
2. Triangulate (b):
   - pass "Feel free to paste a Slack export." and "Send it here.";
   - fail "Share it with me." (no noun, no destination).
3. **(a)** Pass "Don't hesitate to paste your thread." and "Don't hesitate to paste it here."; fail "Don't paste it here.". These are expected green at once. Use `retroactive-test-check`: widen the guard to the sentence scope and see them go red, then restore. Record that evidence in the commit message.
4. **(d)** `latency.test.ts`: `mentionsNonce` flags "Sep 25, 09:14" (red). Then triangulate:
   - flag "2026-09-25 09:14", "9:14 UTC" and "09:14:02";
   - don't flag a time or date that the thread contains.
5. **(d)** `latencySpike` passes the thread and records `pastedAt`. Test it with a fake chat: every call has `pastedAt` and `nonceMentions` uses the thread.
6. $0: `node server/eval/rescore.ts outputs/evals/slice-03/2026-09-25-openai-gpt-5-6-terra-v8.json` and record the result (AC 12).

**A/B tool, outside in**

7. **`abEval.test.ts`, outermost, with a fake `ChatClient`:**
   - live and candidate instructions, n=6, fixtures `[greeting, booking-split]`;
   - 24 calls;
   - each system message equals its arm's text;
   - each user message equals `thread.trim()` (no "Pasted at");
   - order is live-first on odd i and candidate-first on even i;
   - runs are tagged `{arm, fixture, i}` and scored.

   Red: the module is missing.
8. `abEval`: a call that throws is retried once. Two throws abort with partial runs and no verdict.
9. **`abVerdict.test.ts`**, each case alone:
   - ships when the target goes 0/18 → 18/18 and nothing drops;
   - ships on a drop of exactly 1 in one (fixture, check);
   - no ship on a drop of 2 in one (fixture, check);
   - no ship when the target gains only 1;
   - a reported-only drop (`same meaning not split`, `sameMeaningNamed`) never blocks;
   - `fixture:check` targets tally only that check;
   - unequal n throws;
   - no target means no verdict.
10. **`abSummary.test.ts`:**
    - the verdict line and reasons;
    - x/n cells and Δ;
    - only rows with a miss, plus the "all other gating checks n/n" line;
    - "(reported only)" rows;
    - the budget line (cost per arm, total, median and max ms).
11. **`evalArgs.test.ts`:**
    - `--ab 9` gives the candidate 9, live = `LIVE_INSTRUCTIONS_VERSION`, runs 6 and no target;
    - `--live 6`, `--runs 8` and `--target a,b:split labels` parse;
    - `--runs 5`, a non-number or a missing value is rejected.
12. **`promptVersions.test.ts`:**
    - `instructionsOf(8)` equals `coachInstructions()`;
    - `instructionsOf(6)` is the v6 snapshot;
    - an unknown version throws;
    - a stale current snapshot throws (using an injected reader).
13. **Key guard:** `keyChanges(recorded, current)` lists only the fixtures whose sha differs.
14. `evalSummary`: "Every run clean" and the x/n headers. Update the existing expectations.
15. **I/O shells, no unit tests:**
    - `runEval.ts` `--ab`;
    - `rescore.ts` A/B mode.

    Smoke them at $0 (see below).
16. Docs, D6.
17. **Paid validation run** (below), then `summary.md` (AC 8).

## Verifying without paid runs (builder and verifier)

- **The fake `ChatClient`** is a `send` that returns a canned `ChatResult`, with `usage: {promptTokens, completionTokens, cost}` and `finishReason: "stop"`. It records each request's messages. Replies are keyed by the system prompt, so each arm gets its own reply:
  - a clean `GOOD_REPLY` or invite for the candidate;
  - a boilerplate greeting or a split-labels slip for live.

  `openRouterCoach.test.ts` already builds fakes like this, so reuse its shape.
- **Everything except the network is covered by fakes:** `abEval`, `abVerdict`, `abSummary`, `evalArgs`, `promptVersions`, `keyChanges`, and the (a), (b) and (d) checks.
- **$0 CLI smoke of `rescore --ab`:** the builder writes a synthetic A/B JSON in the scratchpad (not committed). Both arms are built from the recorded v8 full-eval replies, so the replies are real. Expect the verdict "no ship: target not improved (+0)", zero regressions, and "Keys changed" empty.
- **$0 wiring smoke of `runEval --ab`:** run `OPENROUTER_API_KEY=invalid OPENROUTER_MODEL=openai/gpt-5.6-terra OPENROUTER_REASONING_EFFORT=none npm run eval -- --ab 8 --live 6 --target greeting`. It should print the run description with both versions and fail on the first call with `Eval failed: … 401`. That proves the argument parsing, snapshot loading and config reach the network. OpenRouter doesn't bill a 401.
- `bin/check.sh` is green.

## The one paid validation run (builder runs it; verifier checks the record)

```
OPENROUTER_MODEL=openai/gpt-5.6-terra OPENROUTER_REASONING_EFFORT=none \
  npm run eval -- --ab 8 --live 6 --target greeting,ddd-question,one-line-note
```

- **What it runs:** v6 (the previous live prompt) against v8 (live now since the slice-63 deploy). It re-judges the n=3 decision in `summary.md` at n=6.
  - 7 fixtures × 6 runs × 2 arms = **84 calls**.
  - No nonce. The model and effort are set on the command only, and `.env` is untouched.
- **Cost estimate:** ≈ **$0.34** with prompt caching.
  - Per arm: F1 $0.060, F2 $0.034, F3 $0.025, example $0.035, non-thread $0.018, total $0.17.
  - With no cache hits at all: ≈ $0.51.
  - The issue's budget line ($0.02 a run → $1.2 at 5 fixtures) is the **cap**: stop if the running total passes $1.2.
- **Time estimate:** ≈ **6.5 min** sequential (32.7 s per round per arm × 6 × 2). Allow 10 min for tail latency.
- **Before trusting it,** check that the JSON says `"model": "openai/gpt-5.6-terra"`, `"reasoningEffort": "none"`, n=6, and system sha256 values that match `sha256(coach-instructions.v6.txt)` and `v8.txt`.
- **Expected result:** the target 0/18 → 18/18. Threads at n=6 show whether v8 holds within one run per fixture and check.
- **By-product for #77, reported but not decided here:**
  - F2 `split labels` pass rates without a nonce, per arm, as x/6;
  - the navigator passes them to the PO on #77.
- **One retry of the whole run** is allowed only if it aborts on provider errors, within the cap. Otherwise escalate.
- **Record:**
  - the `summary.md` row and the v8 decision update (AC 8);
  - the `rescore` output of the new JSON (same verdict);
  - total spend.

**Demo (verifier).** This slice has no UI. Record a short terminal demo of the $0 `node server/eval/rescore.ts <ab.json>` showing the paired table and the verdict. Save it as `outputs/demos/slice-78.{mp4,md}` with a 1280×800 PNG of the rendered `.md` table. No paid call happens during the demo.

## Out of scope

- **#76 eval notes, recorded on #76 as "for when this is worked":**
  - scoping the `same meaning not split` exemption per fixture;
  - counting the quoted-word heading in `sameMeaningNamed`.

  Both are reported-only today, so they can't tip an A/B verdict. They're applied identically to both arms, and only F1 has `sameMeaning` data. They move with #76.
- **#77's fix** (group-named labels, a prompt change). This slice only supplies its n=6 data.
- **#76's effort-`low` experiment,** a latency re-gate, and streaming (#8).
- **Statistical tests** (Fisher, bootstrap). The issue's rule is count-based, and n=6 is too small for p-values to mean much.
- **Hosted A/B** through `/api/chat`. The eval calls OpenRouter directly with the same prompt assembly.
- **Migrating the old scratch A/B JSON** to the new format. The paid run supersedes it.
- **Parallel calls.**

## Risks

- **The noise allowance adds up across fixtures.** "At most one run per fixture" lets a check drop by 1 in each of 4 thread fixtures (4 of 24) and still ship. It follows the issue's text. It's flagged in the md with a line "total drop across fixtures: k", but it doesn't gate. The PO can tighten it later.
- **n=6 is still small.** 5/6 against 6/6 is within noise, which is why the rule tolerates one run and asks the target to gain ≥ 2 (U1).
- **(b) widening could let a warning through,** e.g. "paste only what you can share". Mitigation: the negation guard stays, and the verifier hand-reads every non-thread reply in the paid run.
- **(d) false negative:** a reply that quotes a thread time equal to the nonce minute isn't flagged. That's accepted, since the collision is rare and the ISO and "Pasted at" checks remain.
- **Stale snapshot for a candidate under development:** the builder has to run `npm test` (which writes the snapshot) before `--ab`. `instructionsOf` throws otherwise.
- **The existing n=3 v8 decision may reverse at n=6.** Handled by U5, not by an automatic rollback.

## Suggested commits (committer owns them)

1. `r`: thread `instructions` through `measure` and `fullEval`.
2. `feat`: (b) plus the (a) guard tests.
3. `feat`: (d) nonce as reformatted, with `pastedAt` recorded.
4. `feat`: the v8 re-score recorded (can fold into 2).
5. `feat`: the A/B runner, verdict, summary, args and prompt versions.
6. `feat`: `rescore --ab` with the key guard, and the single-arm label change.
7. `docs`: the ship rule in `summary.md` and `agent-team.md`.
8. `feat`: the paid A/B result files, with the summary and the v8 decision update.

The sweeper then does its ACN pass.

## Decisions for the user / PO (recommended defaults marked)

- **U1: how much the target must improve.** **Recommended: ≥ 2 runs** over the target tally, which is more than the one-run noise the regression rule allows. The alternative is "strictly better" (+1), which ships noise on subtle targets such as F2 split labels going from 4/6 to 5/6.
- **U2: naming the target.** **Recommended:** `--target fixture[:check],…`, required for a verdict; without it, the table prints with "no verdict". The alternative is to infer the target from the fixtures the live arm fails most, which is automatic but can pick the wrong target.
- **U3: where "live" comes from.** **Recommended:** `LIVE_INSTRUCTIONS_VERSION = 8` in `server/eval/promptVersions.ts`, bumped in the commit that records a ship, with `--live` as an override. The alternative is always requiring `--live`, which contradicts the issue's `--ab <candidate>` form.
- **U4: where the rule is written.** **Recommended:** `summary.md` "Ship rule (#78)" as the canonical text, plus a one-line pointer in `agent-team.md`.
- **U5: if v8 fails the rule at n=6** (a gating check drops by 2 or more). **Recommended:** keep v8 live, report the dropped checks with their replies to the PO, and open or extend an issue. Don't roll back automatically, because v6 fails every non-thread message (0/9) with the conference close. The alternative is to roll back to v6 until a v9 passes.
- **U6: fixtures in every A/B.** **Recommended:** all 7, every time. Non-thread calls cost about $0.001, and a regression anywhere counts. The alternative is only the fixtures the change touches, which is cheaper but blind to side effects.
- **U7: the (b) rule.** **Recommended:** a non-negated "paste" alone counts as an invitation, while share, send, drop and bring still need a thread noun or "here/below". The alternative is to require a destination after "paste" too ("paste it here"), which is stricter and would still fail "Feel free to paste a Slack export".
- **FYI (a):** "Don't hesitate to paste your thread" passes at HEAD. If the committer saw a different real reply fail, please share its text so it becomes the test case. Otherwise (a) stands as a mutation-verified guard on (b).
- **FYI #77:** its comment says "re-judge F2 with n≥6 **nonce'd** runs". That contradicts #78 and 92742ce (no nonce for quality). This plan runs **without** a nonce. Please fix the comment or the #77 body.
