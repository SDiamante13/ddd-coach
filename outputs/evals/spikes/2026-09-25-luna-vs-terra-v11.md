## #93 spike: can `openai/gpt-6-luna` run prompt v11? No: 8 gating drops.

**Verdict: luna doesn't ship.** Under the #78 rule (luna as the candidate, terra as the live arm), 8 gating (fixture, check) rows drop by 2 or more runs. The rule allows none. Latency is fine: a 20k first turn has a median of 5.3 s against the 15 s limit. Cost per call is about 20× lower.

### Setup
- Both arms use prompt v11 (`coach-instructions.v11.txt`, sha256 `c858c50a…`), effort `none`, n=6 per fixture per arm, all 7 fixtures, and no nonce. Each fixture is sent as a visitor would paste it.
- **Live, `openai/gpt-5.6-terra`:** the recorded v11 arm of #85's A/B (`ab-2026-09-25-openai-gpt-5-6-terra-v10-v11.json`, same day, same sha, same effort), re-scored at $0 with the current checks. The answer keys are unchanged since that run.
- **Candidate, `openai/gpt-6-luna`:** a fresh run of 42 calls. All ended `stop`, with no retries and no aborts.
- **Deviation from #78:** the arms weren't interleaved in one session. A fresh terra arm costs about $0.18, more than this spike's $0.10 cap, so the recorded arm stood in. Team-lead was told before any spend. The gap is large enough (8 drops of 2–4 runs) that the pairing can't change the verdict.
- The run used a scratchpad script that reuses `measure`, `scoreReply`, `gatingRows` and `isRegression`. No repo code changed.

### Gating checks where either arm missed (x/6)

| Fixture | Check | terra (live) | luna (candidate) | Δ | |
|---|---|---|---|---|---|
| booking-split | holders | 6/6 | 3/6 | −3 | **drop 2+** |
| booking-split | split labels | 6/6 | 3/6 | −3 | **drop 2+** |
| booking-split | attribution | 6/6 | 5/6 | −1 | |
| booking-split | split | 5/6 | 6/6 | +1 | |
| rebook-notes | no names | 5/6 | 1/6 | −4 | **drop 2+** |
| rebook-notes | split | 6/6 | 5/6 | −1 | |
| rebook-notes | holders | 6/6 | 5/6 | −1 | |
| rebook-notes | split labels | 5/6 | 6/6 | +1 | |
| carrier-status | question sources | 6/6 | 3/6 | −3 | **drop 2+** |
| carrier-status | one question | 6/6 | 5/6 | −1 | |
| carrier-status | split labels | 6/6 | 5/6 | −1 | |
| carrier-status | attribution | 5/6 | 5/6 | 0 | |
| example-thread | holders | 6/6 | 2/6 | −4 | **drop 2+** |
| example-thread | one question | 6/6 | 4/6 | −2 | **drop 2+** |
| example-thread | question sources | 6/6 | 4/6 | −2 | **drop 2+** |
| example-thread | at most 600 words | 6/6 | 4/6 | −2 | **drop 2+** |
| example-thread | stable views | 6/6 | 5/6 | −1 | |
| example-thread | split labels | 6/6 | 5/6 | −1 | |

All other gating checks are 6/6 in both arms. The three non-thread fixtures (greeting, ddd-question, one-line-note) are 18/18 clean on luna.

Reported only:

| Fixture | Check | terra | luna |
|---|---|---|---|
| booking-split | same meaning not split | 0/6 | 0/6 |
| booking-split | sameMeaningNamed | 2/6 | 6/6 |
| booking-split | under 400 words | 5/6 | 0/6 |
| booking-split | no merged split | 6/6 | 4/6 |
| carrier-status | under 400 words | 6/6 | 5/6 |
| example-thread | under 400 words | 6/6 | 4/6 |

### Hand-read of luna replies
- **Names in notes (the v4 failure) persists.** In 5 of 6 F2 runs, luna names people in events: "Dana corrected the rule…", "Maya still RBs date-only changes at night…". v11's rules didn't fix it.
- **Meaning lines not held by a team.** Some meaning lines lead with a screen or a customer, not a team:
  - F1 r3: "Customer portal shows the original booking ref…";
  - example r2 and r6: "Guess: Customer D may understand “late” as…".

  Other lines drop the "X means" shape and use a possessive: "Code’s dashboard query counts…" (F1 r2 and r6, F2 r2) and "Guess: Billing’s weekly report treats…" (example r5). Together these put example-thread holders at 2/6.
- **Merged views.** F1 r3 and r6 put a plain "Ops means…" next to "Ops (night shift) means…" under "booking count".
- **Printed the reply twice.** In example-thread r3 and r4 the whole reply appears twice, joined by a stray tab and "lbl". That's the same slip as the v3 F3 run, and it causes the one question and 600-word failures.
- **Quotes that aren't verbatim.** F3 r4 quotes "the portal shows Confirmed as soon as the carrier accepts", stitched together from thread line 43 ("the portal shows the enum name, so customers see Confirmed as soon as the carrier accepts").
- **What luna does well:** "Night dispatch" is gone as a holder, since it now writes "Ops (night shift)"/"Ops (day desk)". It named F1's "hold" as one meaning in 6/6 runs (terra 2/6). Its questions name the case and the forum, and the non-thread replies are natural, e.g. "Hi. Paste a thread, meeting notes or code from your work, and I'll help untangle the terms and sequence."

### Latency, 20k first turn
Setup: F1 at 20,000 characters as a first turn, with its own "(Pasted at …)" nonce line. The nonce is used for latency only, so the paste is never cached. v11 system prompt, 1,000-token cap, not streamed. All runs ended `stop`, and no reply mentioned the nonce.

| Model | n | p50 | p90 | max | Cost per 20k first turn |
|---|---|---|---|---|---|
| luna | 10 | 5,309 ms | 5,571 ms | 6,262 ms | $0.00104 |
| terra | 2 | 5,322 ms | 6,070 ms* | 6,070 ms | $0.02089 |

\*Terra's n=2 was kept low for budget, so its p90 is its max. For reference, the no-nonce A/B timings over all 7 fixtures, n=42 each: terra p50 3,316 ms, p90 5,074 ms, max 17,611 ms; luna p50 3,259 ms, p90 5,808 ms, max 7,031 ms. Luna passes the issue's ≤15 s rule easily.

### Cost
- Per A/B call: luna $0.000218, terra $0.004282, **19.6×**.
- Per 20k first turn: luna $0.00104, terra $0.02089, **20.1×**.
- **Projected cost ratio: about 20× cheaper on luna**, matching the issue's estimate.

### Spend
Luna arm $0.0092, luna latency $0.0104, terra latency $0.0418, terra arm $0 (re-scored). **Total $0.0614** of the $0.10 cap.

### Recommendation
**Keep terra.** Luna fails the #78 rule on 8 gating rows, 4 of them in the thread-analysis core: names in notes, holders, split labels and verbatim sources. It's fast enough and 20× cheaper, but at v11 it isn't reliable enough.

If cost becomes pressing (public use, #58's knowledge-base prefix), a luna-specific prompt would be a separate experiment, not a model swap. It would need to target the name-to-team rewrite in notes, screens as holders, and the doubled output. **The owner decides the switch.**

Data: `outputs/evals/spikes/2026-09-25-luna-vs-terra-v11.json`, which holds every call with its reply, scores, costs and the 20k latency runs.
