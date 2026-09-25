# A/B: candidate v11 against live v10, openai/gpt-5.6-terra, effort none, n=6 per arm

**Ship: yes.** Target (booking-split:question sources, rebook-notes:question sources, carrier-status:question sources, example-thread:question sources) live 0/24 → candidate 24/24 (+24, needs +2); no gating check dropped by more than one run.

| Fixture | Check | Live | Candidate | Δ | Flag |
|---|---|---|---|---|---|
| booking-split | question sources | 0/6 | 6/6 | +6 |  |
| booking-split | split | 5/6 | 5/6 | 0 |  |
| booking-split | questionSpansThread | 5/6 | 6/6 | +1 |  |
| booking-split | attribution | 5/6 | 6/6 | +1 |  |
| booking-split | split labels | 5/6 | 6/6 | +1 |  |
| rebook-notes | code guess | 5/6 | 6/6 | +1 |  |
| rebook-notes | question sources | 0/6 | 6/6 | +6 |  |
| rebook-notes | no names | 6/6 | 5/6 | -1 |  |
| rebook-notes | split labels | 6/6 | 5/6 | -1 |  |
| carrier-status | question sources | 0/6 | 6/6 | +6 |  |
| carrier-status | attribution | 3/6 | 5/6 | +2 |  |
| example-thread | question sources | 0/6 | 6/6 | +6 |  |

All other gating checks 6/6 in both arms. Total drop across fixtures: 2 runs.

Reported only, never gates:

| Fixture | Check | Live | Candidate | Δ | Flag |
|---|---|---|---|---|---|
| booking-split | same meaning not split | 0/6 | 0/6 | 0 | (reported only) |
| booking-split | under400Words | 3/6 | 5/6 | +2 | (reported only) |
| booking-split | sameMeaningNamed | 1/6 | 2/6 | +1 | (reported only) |

Budget: live $0.1701, candidate $0.1798, total $0.3500 over 84 calls; median 3325 ms, max 17611 ms.
