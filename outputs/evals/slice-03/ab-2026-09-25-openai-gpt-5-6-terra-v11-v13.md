# A/B: candidate v13 against live v11, openai/gpt-5.6-terra, effort none, n=6 per arm

**Ship: yes.** Target (ddd-bounded-context:cites the reference, not-covered:admits not covered) live 0/12 → candidate 10/12 (+10, needs +2); no gating check dropped by more than one run.

| Fixture | Check | Live | Candidate | Δ | Flag |
|---|---|---|---|---|---|
| booking-split | attribution | 6/6 | 5/6 | -1 |  |
| booking-split | split | 5/6 | 4/6 | -1 |  |
| rebook-notes | split labels | 4/6 | 6/6 | +2 |  |
| rebook-notes | no names | 6/6 | 5/6 | -1 |  |
| carrier-status | attribution | 6/6 | 5/6 | -1 |  |
| carrier-status | holders | 5/6 | 6/6 | +1 |  |
| example-thread | questionSpansThread | 6/6 | 5/6 | -1 |  |
| ddd-question | citations verbatim | 6/6 | 5/6 | -1 |  |
| ddd-bounded-context | cites the reference | 0/6 | 4/6 | +4 |  |
| not-covered | admits not covered | 0/6 | 6/6 | +6 |  |

All other gating checks 6/6 in both arms. Total drop across fixtures: 6 runs.

Reported only, never gates:

| Fixture | Check | Live | Candidate | Δ | Flag |
|---|---|---|---|---|---|
| booking-split | same meaning not split | 0/6 | 0/6 | 0 | (reported only) |
| booking-split | sameMeaningNamed | 0/6 | 2/6 | +2 | (reported only) |
| booking-split | under400Words | 3/6 | 6/6 | +3 | (reported only) |

Budget: live $0.1855, candidate $0.3913, total $0.5768 over 108 calls; median 3767.5 ms, max 7994 ms.
Latency and cache: live median 4370.5 ms, max 7705 ms, 100% of input cached; candidate median 3146 ms, max 7994 ms, 97% of input cached.
