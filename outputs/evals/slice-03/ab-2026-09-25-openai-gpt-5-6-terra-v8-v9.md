# A/B: candidate v9 against live v8, openai/gpt-5.6-terra, effort none, n=6 per arm

**Ship: no.** Target (booking-split:question asks, example-thread:question asks, rebook-notes:split labels) live 14/18 → candidate 17/18 (+3, needs +2); dropped by two or more runs: booking-split split labels 6/6 → 4/6, carrier-status attribution 6/6 → 4/6.

| Fixture | Check | Live | Candidate | Δ | Flag |
|---|---|---|---|---|---|
| booking-split | split labels | 6/6 | 4/6 | -2 | dropped 2+ |
| booking-split | attribution | 2/6 | 6/6 | +4 |  |
| booking-split | question asks | 4/6 | 6/6 | +2 |  |
| rebook-notes | split labels | 6/6 | 5/6 | -1 |  |
| carrier-status | holders | 5/6 | 4/6 | -1 |  |
| carrier-status | attribution | 6/6 | 4/6 | -2 | dropped 2+ |
| example-thread | question asks | 4/6 | 6/6 | +2 |  |
| example-thread | holders | 5/6 | 6/6 | +1 |  |

All other gating checks 6/6 in both arms. Total drop across fixtures: 6 runs.

Reported only, never gates:

| Fixture | Check | Live | Candidate | Δ | Flag |
|---|---|---|---|---|---|
| booking-split | same meaning not split | 0/6 | 0/6 | 0 | (reported only) |
| booking-split | under400Words | 4/6 | 6/6 | +2 | (reported only) |
| booking-split | sameMeaningNamed | 0/6 | 5/6 | +5 | (reported only) |

Budget: live $0.1517, candidate $0.1732, total $0.3249 over 84 calls; median 4941.5 ms, max 9664 ms.
