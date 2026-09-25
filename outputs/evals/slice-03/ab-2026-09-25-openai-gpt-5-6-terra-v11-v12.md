# A/B: candidate v12 against live v11, openai/gpt-5.6-terra, effort none, n=6 per arm

**Ship: no.** Target (ddd-bounded-context:cites the reference, not-covered:admits not covered) live 0/12 → candidate 6/12 (+6, needs +2); dropped by two or more runs: carrier-status holders 6/6 → 4/6, ddd-question citations verbatim 6/6 → 2/6.

| Fixture | Check | Live | Candidate | Δ | Flag |
|---|---|---|---|---|---|
| booking-split | split | 5/6 | 5/6 | 0 |  |
| rebook-notes | split labels | 4/6 | 5/6 | +1 |  |
| carrier-status | holders | 6/6 | 4/6 | -2 | dropped 2+ |
| carrier-status | attribution | 6/6 | 5/6 | -1 |  |
| ddd-question | citations verbatim | 6/6 | 2/6 | -4 | dropped 2+ |
| ddd-bounded-context | cites the reference | 0/6 | 6/6 | +6 |  |
| not-covered | admits not covered | 0/6 | 0/6 | 0 |  |

All other gating checks 6/6 in both arms. Total drop across fixtures: 7 runs.

Reported only, never gates:

| Fixture | Check | Live | Candidate | Δ | Flag |
|---|---|---|---|---|---|
| booking-split | same meaning not split | 0/6 | 0/6 | 0 | (reported only) |
| booking-split | sameMeaningNamed | 1/6 | 2/6 | +1 | (reported only) |
| booking-split | under400Words | 3/6 | 6/6 | +3 | (reported only) |

Budget: live $0.1852, candidate $0.3996, total $0.5849 over 108 calls; median 3302 ms, max 6365 ms.
Latency and cache: live median 3035.5 ms, max 6173 ms, 100% of input cached; candidate median 3917.5 ms, max 6365 ms, 97% of input cached.
