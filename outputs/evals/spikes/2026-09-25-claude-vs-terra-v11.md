## #98 spike: can a Claude model run prompt v11? Neither Haiku 4.5 nor Sonnet 5 passes the #78 rule

**Verdict: keep terra.**
- **Haiku 4.5 fails** on 9 gating rows with drops of 2 or more, across all 4 thread fixtures. It's fast enough (20k first turn in 10.6 s at most) and costs about the same as terra per call.
- **Sonnet 5 fails** on a partial run, stopped at a definitive drop to stay in budget. Its sharper finding: on the 20k thread it overruns the 1,000-token cap in 3 of 5 runs, even with reasoning off. It costs about 3× terra per thread call.

The owner decides any switch.

### Setup
- All arms use prompt v11 (`coach-instructions.v11.txt`, sha256 `c858c50a…`), reasoning effort `none` and no nonce. Each fixture is pasted as a visitor pastes it, under the same 1,000-token cap, not streamed.
- **Slugs checked on OpenRouter's model list:**

  | Model | Input $/M | Output $/M |
  |---|---|---|
  | `anthropic/claude-haiku-4.5` | 1 | 5 |
  | `anthropic/claude-sonnet-5` | 2 | 10 |
  | terra, for reference | 2 | 12 |
- **Reasoning off works.** The adapter sends `reasoning: { effort: "none" }`, and `readConfig` defaults to `none`. A greeting probe on each model returned 0 reasoning tokens, and so did every one of the 54 Claude calls in this spike. Spike 91's Sonnet 5 judge overran because it sent no effort.
- **Live arm, `openai/gpt-5.6-terra`:** the recorded v11 arm of #85's A/B (`ab-2026-09-25-openai-gpt-5-6-terra-v10-v11.json`), re-scored at $0 with the current checks. The answer keys are unchanged since that run, and every sha matches.
- **Haiku arm:** a fresh run of 42 calls (7 fixtures × 6). All ended `stop`, with no retries.
- **Sonnet arm:** a fresh run, stopped early. A full arm is about $0.56 (its tokenizer counts about 1.38× terra's tokens), which doesn't fit next to Haiku in $0.50. Team-lead was told before the Sonnet spend.
  - Rule used: run the likely-failing fixtures first, and stop once a gating row has at least 2 more misses than terra. More runs can't undo that drop.
  - Result: 2 example-thread runs, then 2 booking-split runs. The other 5 fixtures weren't run.
- **Deviations from #78:** the arms weren't interleaved in one session (the recorded terra arm stood in, as in #93), and Sonnet has a partial arm.
- The scratchpad scripts reuse `measure`, `scoreReply`, `gatingRows`, `recordable`, `nonceLine` and `mentionsNonce`. No repo code changed.

### Haiku 4.5: gating checks where either arm missed (x/6)

| Fixture | Check | terra (live) | Haiku | Δ | |
|---|---|---|---|---|---|
| booking-split | holders | 6/6 | 1/6 | −5 | **drop 2+** |
| booking-split | question spans thread | 6/6 | 2/6 | −4 | **drop 2+** |
| booking-split | question sources | 6/6 | 3/6 | −3 | **drop 2+** |
| booking-split | no names | 6/6 | 4/6 | −2 | **drop 2+** |
| booking-split | question asks | 6/6 | 4/6 | −2 | **drop 2+** |
| booking-split | split | 5/6 | 4/6 | −1 | |
| booking-split | events | 6/6 | 5/6 | −1 | |
| rebook-notes | question asks | 6/6 | 2/6 | −4 | **drop 2+** |
| rebook-notes | question sources | 6/6 | 5/6 | −1 | |
| rebook-notes | no names | 5/6 | 5/6 | 0 | |
| rebook-notes | split labels | 5/6 | 6/6 | +1 | |
| carrier-status | question sources | 6/6 | 3/6 | −3 | **drop 2+** |
| carrier-status | holders | 6/6 | 5/6 | −1 | |
| carrier-status | attribution | 5/6 | 5/6 | 0 | |
| example-thread | question sources | 6/6 | 4/6 | −2 | **drop 2+** |
| example-thread | question spans thread | 6/6 | 4/6 | −2 | **drop 2+** |
| example-thread | holders | 6/6 | 5/6 | −1 | |

All other gating checks are 6/6 in both arms. The non-thread fixtures (greeting, ddd-question, one-line-note) are 18/18 clean on Haiku.

Reported only:

| Fixture | Check | terra | Haiku |
|---|---|---|---|
| booking-split | same meaning not split | 0/6 | 2/6 |
| booking-split | sameMeaningNamed | 2/6 | 2/6 |
| booking-split | under 400 words | 5/6 | 1/6 |
| rebook-notes | forum | 6/6 | 5/6 |
| example-thread | forum | 6/6 | 2/6 |
| example-thread | quoted words in thread | 6/6 | 5/6 |

### Sonnet 5: partial arm (x/n, stopped at a definitive drop)

| Fixture | Check | terra (live) | Sonnet | |
|---|---|---|---|---|
| booking-split | attribution | 6/6 | 0/2 | **drop 2+, definitive** |
| booking-split | holders | 6/6 | 1/2 | |
| booking-split | complete ending | 6/6 | 1/2 | |
| booking-split | question sources | 6/6 | 1/2 | |
| booking-split | split | 5/6 | 2/2 | |
| example-thread | holders | 6/6 | 0/2 | key gap, see below |

Reported only: under 400 words is 0/2 on booking-split (terra 5/6). Quoted words in thread is 1/2 on booking-split and 1/2 on example-thread (terra 6/6 on both).

- **Key gap, not counted against Sonnet.** Both example-thread holder misses are "Dev means…". "Dev" is a speaker label in the example thread, like "Billing" or "Carrier desk". v11 allows "a team the thread names", but the key's `teams` list has no "Dev", so the row fails.
  - A key change that turns a fail into a pass needs its own commit and reason, so this spike leaves the key alone and flags it.
  - The Sonnet verdict doesn't rest on it: booking-split attribution is an independent definitive drop.
- **Supporting evidence, not rule evidence.** The 3 Sonnet 20k latency replies are booking-split plus a nonce line. Scored against the booking-split key:
  - cut short 2/3;
  - holders missed 2/3;
  - a person's name in 1/3;
  - question sources missed 2/3.

  Across all 5 booking-split-style runs: complete ending 2/5 and holders 2/5, against terra's 6/6 and 6/6.

### Hand-read

**Haiku 4.5**
- **Sub-teams as holders.** Meaning lines start with "Night dispatch…", "Night shift…" or "Day desk…" instead of "Ops (night shift)". That's the exact v11 rule it breaks, and it puts booking-split holders at 1/6. carrier-status r3 uses "Portal shows…" as a holder.
- **Names in source quotes.** Source quotes keep the speaker's name, e.g. "Maya Okafor 11:40 PM: two date changes…" (F1 r1 and r4) and "Tom: RB = new invoice…" (F2 r2).
- **Questions that don't ask.** They start with "When…", "does…" or "did…", or they hand over an answer. F2 r6 reads "why did the carrier bill TONU…, and which action by ops would have prevented the double bill". rebook-notes question asks is 2/6.
- **Sources not verbatim.** Quotes are edited: carrier-status r1–r3 drop the inner quote marks from `that's the moment I tell them "you're confirmed"`, and booking-split quotes are re-cased or trimmed. Question sources is 3/6 on carrier-status and booking-split.
- **Long.** Booking-split replies run over 400 words in 5 of 6 runs.
- **Good:** 18/18 on non-thread input with natural replies. It keeps F1's "hold" whole more often than terra (2/6 vs 0/6).

**Sonnet 5**
- **Overruns the cap.** On the 20k booking-split thread it writes 970–1,000 tokens with 0 reasoning tokens, and 3 of 5 runs end `length` with "(Cut short at the length limit…)". Its tokenizer spends about 25% more tokens per word, so the 1,000-token cap holds fewer words than it does on terra.
- **Code facts in team lines.** "Ops means the number shown on the dashboard, which counts every row…, including both old and new rows from a rebook." This is what fails attribution: "new row" is Code's phrase.
- **Possessive holder.** "Guess: Code's dashboard query counts…" is the same pattern luna had.
- **Person's name in the question.** One 20k run asks about "a load Maya described tonight".
- **Good:** the reads are rich and accurate. It keeps "Ops (day desk)" and "Ops (night desk)" straight in example-thread, puts each case and meeting in the question, and asks multi-option questions that match v11's shape.

### Latency, 20k first turn
Setup: booking-split at 20,000 characters as a first turn, with its own "(Pasted at …)" nonce line, the v11 system prompt and the 1,000-token cap, not streamed. No reply mentioned the nonce.
- Budget cut the nonce'd runs to n=3 per model. OpenRouter didn't cache any of the 54 Claude calls (0 cached tokens; the adapter sends no `cache_control`). So the no-nonce booking-split A/B calls are also uncached 20k first turns, and they're listed separately.

| Model | Nonce'd n | p50 | max | A/B booking-split (uncached) | Cost per 20k first turn |
|---|---|---|---|---|---|
| Haiku 4.5 | 3 | 9,652 ms | 10,612 ms | n=6, 7.9–11.4 s | $0.0114 |
| Sonnet 5 | 3 | 11,653 ms | 12,326 ms | n=2, 11.6–11.7 s | $0.0330 |
| terra (#93) | 2 | 5,322 ms | 6,070 ms | | $0.0209 |

Both Claude models meet the ≤15 s limit, at about 2× terra's time. Sonnet's time is held down by the cap. Without the cap it would write more and take longer.

### Cost per call vs terra
Terra's costs benefit from OpenAI's automatic caching of the system prompt; Anthropic via OpenRouter only caches with explicit `cache_control` breakpoints, which the adapter doesn't send.

| Call | terra | Haiku 4.5 | Sonnet 5 |
|---|---|---|---|
| A/B average, 7 fixtures | $0.00428 | $0.00524 (1.2×) | n/a (partial) |
| booking-split | $0.01087 | $0.01180 (1.1×) | $0.03286 (3.0×) |
| example-thread | $0.00606 | $0.00584 (1.0×) | $0.01685 (2.8×) |
| greeting | $0.00093 | $0.00273 (2.9×) | $0.00708 (7.6×, probe) |
| 20k first turn, nonce'd | $0.0209 | $0.0114 (0.55×) | $0.0330 (1.6×) |

Haiku is roughly at parity with terra. Sonnet costs about 3× terra per thread call. Adding `cache_control` would cut the Claude input cost, but that's an adapter change and a separate experiment.

### Spend
Probes $0.0098, Haiku arm $0.2201, Haiku latency $0.0343, Sonnet arm $0.0994 (partial), Sonnet latency $0.0991, terra arm $0 (re-scored). **Total $0.4627** of the $0.50 cap.

### Recommendation
**Keep terra.**
- **Haiku 4.5** breaks v11's core thread rules too often to ship: sub-teams as holders, names in quotes, questions that don't ask, and quotes that aren't verbatim. It isn't cheaper enough to justify a prompt of its own.
- **Sonnet 5** is the closer model. It needs its own experiment, and its first obstacle is the 1,000-token cap, not the prompt:
  1. a Sonnet-specific cap, or a "stay under N words" rule;
  2. prompt caching in the adapter;
  3. a key fix adding "Dev" to example-thread's teams, as its own commit;
  4. then a full n=6 A/B at about $0.6.

  Even then it would cost about 3× terra per thread call. That's worth it only if the Claude Enterprise path (#34) matters more than the cost.

**The owner decides the switch.**

Data: `outputs/evals/spikes/2026-09-25-claude-vs-terra-v11.json` holds every call with its reply, scores and cost, plus the terra re-score, the 20k latency runs, the probes and the spend.
