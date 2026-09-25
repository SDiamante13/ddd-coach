# A/B: candidate v10 against live v8, openai/gpt-5.6-terra, effort none, n=6 per arm

**Ship: yes.** Target (booking-split:question asks, example-thread:question asks, rebook-notes:split labels) live 13/18 → candidate 18/18 (+5, needs +2); no gating check dropped by more than one run.

| Fixture | Check | Live | Candidate | Δ | Flag |
|---|---|---|---|---|---|
| booking-split | question asks | 3/6 | 6/6 | +3 |  |
| booking-split | questionSpansThread | 5/6 | 6/6 | +1 |  |
| rebook-notes | split labels | 5/6 | 6/6 | +1 |  |
| rebook-notes | split | 5/6 | 6/6 | +1 |  |
| rebook-notes | no names | 5/6 | 6/6 | +1 |  |
| carrier-status | holders | 4/6 | 6/6 | +2 |  |
| carrier-status | attribution | 5/6 | 5/6 | 0 |  |
| example-thread | question asks | 5/6 | 6/6 | +1 |  |
| example-thread | holders | 5/6 | 6/6 | +1 |  |

All other gating checks 6/6 in both arms. Total drop across fixtures: 0 runs.

Reported only, never gates:

| Fixture | Check | Live | Candidate | Δ | Flag |
|---|---|---|---|---|---|
| booking-split | same meaning not split | 0/6 | 0/6 | 0 | (reported only) |
| booking-split | sameMeaningNamed | 0/6 | 3/6 | +3 | (reported only) |
| booking-split | under400Words | 5/6 | 4/6 | -1 | (reported only) |

Budget: live $0.1496, candidate $0.1767, total $0.3263 over 84 calls; median 4790 ms, max 9235 ms.
