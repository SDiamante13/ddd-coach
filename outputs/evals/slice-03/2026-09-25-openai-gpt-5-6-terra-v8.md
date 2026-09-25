# Slice 3 eval, 2026-09-25: openai/gpt-5.6-terra, effort none, instructions v8

**Ships: no.** Hard checks 18/21 (same meaning not split is reported only, #76), attribution 20/21.

| Fixture | Split (3/3) | Code line (3/3) | Question spans the thread (3/3) | Same meaning named (reported only, #76) |
|---|---|---|---|---|
| booking-split | 3/3 | 3/3 | 2/3 | 1/3 |
| rebook-notes | 3/3 | 3/3 | 3/3 | 3/3 |
| carrier-status | 3/3 | 3/3 | 3/3 | 3/3 |
| example-thread | 3/3 | 3/3 | 2/3 | 3/3 |
| greeting | 3/3 | 3/3 | 3/3 | 3/3 |
| ddd-question | 3/3 | 3/3 | 3/3 | 3/3 |
| one-line-note | 3/3 | 3/3 | 3/3 | 3/3 |

| Run | Hard failures | Soft misses | ms | Prompt tokens | Cached | Completion | finishReason | Cost $ |
|---|---|---|---|---|---|---|---|---|
| booking-split 1 | same meaning not split | under400Words, sameMeaningNamed | 8377 | 7640 | 2043 | 555 | stop | 0.02106 |
| booking-split 2 | split labels, same meaning not split | under400Words, questionSpansThread | 7261 | 7640 | 7637 | 556 | stop | 0.00821 |
| booking-split 3 | same meaning not split | sameMeaningNamed | 7507 | 7640 | 7637 | 504 | stop | 0.00758 |
| rebook-notes 1 | none | none | 6547 | 2630 | 2043 | 425 | stop | 0.00697 |
| rebook-notes 2 | code guess | none | 6084 | 2630 | 2627 | 434 | stop | 0.00574 |
| rebook-notes 3 | none | none | 9586 | 2630 | 2627 | 425 | stop | 0.00563 |
| carrier-status 1 | holders | attribution | 4568 | 2627 | 2043 | 288 | stop | 0.00532 |
| carrier-status 2 | none | none | 4861 | 2627 | 2624 | 275 | stop | 0.00383 |
| carrier-status 3 | none | none | 4508 | 2627 | 2624 | 263 | stop | 0.00369 |
| example-thread 1 | none | questionSpansThread | 5561 | 3068 | 2043 | 384 | stop | 0.00758 |
| example-thread 2 | none | none | 5434 | 3068 | 3065 | 384 | stop | 0.00523 |
| example-thread 3 | none | none | 6466 | 3068 | 3065 | 385 | stop | 0.00524 |
| greeting 1 | none | jointRoles | 2190 | 2051 | 2048 | 36 | stop | 0.00085 |
| greeting 2 | none | jointRoles | 2724 | 2051 | 2048 | 41 | stop | 0.00091 |
| greeting 3 | none | jointRoles | 1683 | 2051 | 2048 | 35 | stop | 0.00084 |
| ddd-question 1 | none | jointRoles | 2922 | 2055 | 2052 | 76 | stop | 0.00133 |
| ddd-question 2 | none | jointRoles | 3208 | 2055 | 2052 | 63 | stop | 0.00117 |
| ddd-question 3 | none | jointRoles | 2778 | 2055 | 2052 | 65 | stop | 0.00120 |
| one-line-note 1 | none | jointRoles | 2073 | 2059 | 2056 | 23 | stop | 0.00069 |
| one-line-note 2 | none | jointRoles | 1656 | 2059 | 2056 | 25 | stop | 0.00072 |
| one-line-note 3 | none | jointRoles | 2308 | 2059 | 2056 | 42 | stop | 0.00092 |
