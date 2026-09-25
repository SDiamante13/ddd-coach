# A/B: candidate v8 against live v6, openai/gpt-5.6-terra, effort none, n=6 per arm

**Ship: yes.** Target (greeting, ddd-question, one-line-note) live 3/18 → candidate 18/18 (+15, needs +2); no gating check dropped by more than one run.

| Fixture | Check | Live | Candidate | Δ | Flag |
|---|---|---|---|---|---|
| booking-split | attribution | 4/6 | 5/6 | +1 |  |
| rebook-notes | split labels | 5/6 | 4/6 | -1 |  |
| carrier-status | holders | 5/6 | 4/6 | -1 |  |
| carrier-status | attribution | 4/6 | 6/6 | +2 |  |
| example-thread | holders | 3/6 | 5/6 | +2 |  |
| greeting | no boilerplate | 1/6 | 6/6 | +5 |  |
| ddd-question | invites a thread | 0/6 | 6/6 | +6 |  |
| one-line-note | no boilerplate | 2/6 | 6/6 | +4 |  |
| one-line-note | invites a thread | 2/6 | 6/6 | +4 |  |

All other gating checks 6/6 in both arms. Total drop across fixtures: 2 runs.

Reported only, never gates:

| Fixture | Check | Live | Candidate | Δ | Flag |
|---|---|---|---|---|---|
| booking-split | same meaning not split | 0/6 | 0/6 | 0 | (reported only) |
| booking-split | sameMeaningNamed | 0/6 | 2/6 | +2 | (reported only) |
| booking-split | under400Words | 4/6 | 0/6 | -4 | (reported only) |
| greeting | jointRoles | 0/6 | 0/6 | 0 | (reported only) |
| ddd-question | jointRoles | 0/6 | 0/6 | 0 | (reported only) |
| one-line-note | jointRoles | 0/6 | 0/6 | 0 | (reported only) |

Budget: live $0.1739, candidate $0.1671, total $0.3411 over 84 calls; median 4112 ms, max 8752 ms.
